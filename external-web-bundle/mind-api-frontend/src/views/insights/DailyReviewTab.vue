<template>
  <div class="daily-review-tab">
    <!-- Toolbar -->
    <div class="tab-toolbar">
      <span class="tab-meta" v-if="reflection">
        {{ formatDateRange(reflection.since_at, reflection.until_at) }}
      </span>
      <span v-else class="tab-meta" />
      <t-button
        variant="text"
        size="small"
        :loading="refreshing"
        @click="handleRefresh"
      >
        <template #icon><t-icon name="refresh" /></template>
        {{ $t('insights.refresh') }}
      </t-button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="skeleton-wrap">
      <t-skeleton :row-col="skeletonRows" animation="gradient" />
    </div>

    <!-- Generating in-progress -->
    <div v-else-if="isGenerating" class="status-center">
      <t-loading size="medium" />
      <p class="status-text">{{ $t('insights.generating') }}</p>
    </div>

    <!-- No sources -->
    <div v-else-if="noSources" class="status-center">
      <t-icon name="calendar" size="40px" class="status-icon" />
      <p class="status-text">{{ $t('insights.noSources') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="status-center">
      <t-icon name="close-circle" size="40px" class="status-icon status-icon--error" />
      <p class="status-text">{{ error }}</p>
      <t-button size="small" @click="loadData">{{ $t('insights.errorRetry') }}</t-button>
    </div>

    <!-- Content -->
    <div v-else-if="reflection && reflection.status === 'succeeded'" class="reflection-body">
      <div
        class="ai-markdown-template markdown-content reflection-markdown"
        v-html="renderedMarkdown"
        @click="handleMarkdownClick"
      />

      <!-- Citations -->
      <div v-if="reflection.knowledge_references.length" class="citations-section">
        <div class="citations-divider" />
        <p class="citations-title">{{ $t('insights.citationSources') }}</p>
        <div
          v-for="(ref, idx) in reflection.knowledge_references"
          :key="ref.id"
          class="citation-row"
        >
          <span class="citation-badge">{{ idx + 1 }}</span>
          <div class="citation-info">
            <span class="citation-title">{{ ref.knowledge_title || ref.knowledge_filename }}</span>
            <span class="citation-snippet">{{ ref.content?.slice(0, 120) }}</span>
          </div>
        </div>
      </div>

      <!-- Footer meta -->
      <p class="reflection-meta">
        {{ $t('insights.wordCount', { count: reflection.word_count, refs: reflection.knowledge_references.length }) }}
      </p>
    </div>

    <!-- Citation popup -->
    <t-popup
      v-model="citationPopupVisible"
      :attach="citationPopupAnchor"
      placement="top"
      trigger="click"
      destroy-on-close
    >
      <div class="citation-popup-content" v-if="citationPopupRef">
        <p class="citation-popup-title">{{ citationPopupRef.knowledge_title || citationPopupRef.knowledge_filename }}</p>
        <p class="citation-popup-snippet">{{ citationPopupRef.content?.slice(0, 300) }}</p>
      </div>
    </t-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { sanitizeHTML } from '@/utils/security'
import { getDailyReview, refreshDailyReview, getReflectionById } from '@/api/personalized'
import type { PersonalizedReflection, KnowledgeReference } from '@/api/personalized'

const { t } = useI18n()

const loading = ref(true)
const refreshing = ref(false)
const error = ref('')
const reflection = ref<PersonalizedReflection | null>(null)

const skeletonRows = [
  [{ width: '60%', height: '20px' }],
  [{ width: '100%', height: '14px' }],
  [{ width: '100%', height: '14px' }],
  [{ width: '85%', height: '14px' }],
  [{ width: '100%', height: '14px' }],
  [{ width: '90%', height: '14px' }],
]

const isGenerating = computed(() =>
  reflection.value?.status === 'pending' || reflection.value?.status === 'running'
)

const noSources = computed(() =>
  reflection.value?.status === 'succeeded' &&
  !reflection.value.markdown &&
  !!reflection.value.error_message
)

const renderedMarkdown = computed(() => {
  const md = reflection.value?.markdown
  if (!md) return ''
  const html = marked.parse(md) as string
  return sanitizeHTML(html).replace(
    /\[(\d+)\]/g,
    '<sup class="citation-chip" data-marker="$1">$1</sup>'
  )
})

const citationPopupVisible = ref(false)
const citationPopupAnchor = ref<string | HTMLElement>('body')
const citationPopupRef = ref<KnowledgeReference | null>(null)

function handleMarkdownClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.classList.contains('citation-chip')) return
  const marker = parseInt(target.dataset.marker || '0', 10)
  const refs = reflection.value?.knowledge_references ?? []
  const found = refs[marker - 1] ?? null
  if (!found) return
  citationPopupAnchor.value = target
  citationPopupRef.value = found
  citationPopupVisible.value = true
}

function formatDateRange(sinceAt: string, untilAt: string): string {
  const since = new Date(sinceAt)
  const until = new Date(untilAt)
  const sameDay = since.toDateString() === until.toDateString()
  if (sameDay) {
    return `${since.getFullYear()}年${since.getMonth() + 1}月${since.getDate()}日`
  }
  return `${since.getMonth() + 1}月${since.getDate()}日 — ${until.getMonth() + 1}月${until.getDate()}日`
}

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 90

let pollTimer: ReturnType<typeof setTimeout> | null = null
let pollAttempts = 0

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  pollAttempts = 0
}

function isNonTerminal(r: PersonalizedReflection | null): boolean {
  return !!r && (r.status === 'pending' || r.status === 'running')
}

function startPolling(id: string) {
  stopPolling()
  const tick = async () => {
    pollAttempts++
    if (pollAttempts > POLL_MAX_ATTEMPTS) {
      error.value = t('insights.loadFailed')
      stopPolling()
      return
    }
    try {
      const res: any = await getReflectionById(id)
      const data = res.data as PersonalizedReflection
      reflection.value = data
      if (isNonTerminal(data)) {
        pollTimer = setTimeout(tick, POLL_INTERVAL_MS)
      } else {
        stopPolling()
      }
    } catch {
      pollTimer = setTimeout(tick, POLL_INTERVAL_MS)
    }
  }
  pollTimer = setTimeout(tick, POLL_INTERVAL_MS)
}

async function loadData() {
  loading.value = true
  error.value = ''
  stopPolling()
  try {
    const res: any = await getDailyReview()
    const data = res.data as PersonalizedReflection
    reflection.value = data
    if (isNonTerminal(data) && data.id) {
      startPolling(data.id)
    }
  } catch (e: any) {
    error.value = e?.message || t('insights.loadFailed')
  } finally {
    loading.value = false
  }
}

async function handleRefresh() {
  if (refreshing.value) return
  refreshing.value = true
  error.value = ''
  stopPolling()
  try {
    const res: any = await refreshDailyReview()
    const data = res.data as PersonalizedReflection
    reflection.value = data
    if (isNonTerminal(data) && data.id) {
      startPolling(data.id)
    }
  } catch (e: any) {
    error.value = e?.message || t('insights.loadFailed')
  } finally {
    refreshing.value = false
  }
}

onUnmounted(stopPolling)
onMounted(loadData)
</script>

<style lang="less" scoped>
.daily-review-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 8px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--td-component-stroke);
}

.tab-meta {
  font-size: 13px;
  color: var(--td-text-color-secondary);
}

.skeleton-wrap {
  padding: 24px;
}

.status-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  padding: 48px 24px;
}

.status-icon {
  color: var(--td-text-color-placeholder);
  &--error { color: var(--td-error-color); }
}

.status-text {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  text-align: center;
  max-width: 360px;
}

.reflection-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.reflection-markdown {
  font-size: 15px;
  line-height: 1.8;
}

:deep(.citation-chip) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  margin: 0 1px;
  font-size: 11px;
  font-weight: 600;
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
  border-radius: 6px;
  cursor: pointer;
  vertical-align: super;
  line-height: 18px;
  user-select: none;
  transition: background 0.15s;

  &:hover {
    background: var(--td-brand-color-focus);
  }
}

.citations-section {
  margin-top: 32px;
}

.citations-divider {
  border-top: 1px solid var(--td-component-stroke);
  margin-bottom: 12px;
}

.citations-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--td-text-color-secondary);
  margin-bottom: 8px;
}

.citation-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
}

.citation-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 600;
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
  border-radius: 6px;
  flex-shrink: 0;
}

.citation-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.citation-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.citation-snippet {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reflection-meta {
  margin-top: 24px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  text-align: center;
}

.citation-popup-content {
  padding: 12px;
  max-width: 320px;
}

.citation-popup-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 6px;
}

.citation-popup-snippet {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
}
</style>
