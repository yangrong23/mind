<template>
  <div class="recordings-view">
    <header class="recordings-header">
      <div class="recordings-header-title">
        <h1>{{ $t('recordings.title') }}</h1>
        <p class="recordings-header-subtitle">{{ $t('recordings.subtitle') }}</p>
      </div>
      <div class="recordings-header-actions">
        <input
          ref="fileInput"
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm"
          style="display: none"
          @change="onFilePicked"
        />
        <t-button theme="primary" @click="triggerPick">
          <template #icon><t-icon name="upload" /></template>
          {{ $t('recordings.create') }}
        </t-button>
      </div>
    </header>

    <p class="recordings-hint">{{ $t('recordings.uploadHint') }}</p>

    <div class="recordings-body">
      <div v-if="loading && recordings.length === 0" class="recordings-loading">
        <t-skeleton animation="gradient" :row-col="[{ width: '100%', height: '72px' }, { width: '100%', height: '72px' }, { width: '100%', height: '72px' }]" />
      </div>
      <div v-else-if="recordings.length === 0" class="recordings-empty">
        <div class="recordings-empty-orb"></div>
        <p class="recordings-empty-title">{{ $t('recordings.listEmpty') }}</p>
        <p class="recordings-empty-hint">{{ $t('recordings.listEmptyHint') }}</p>
      </div>
      <div v-else class="recordings-grid">
        <div v-for="rec in recordings" :key="rec.id" class="recording-card">
          <div class="recording-card-icon">
            <t-icon name="play-circle" size="28" />
          </div>
          <div class="recording-card-main">
            <div class="recording-card-title" :title="rec.name">{{ rec.name }}</div>
            <div class="recording-card-meta">
              <span>{{ formatBytes(rec.size_bytes) }}</span>
              <span>·</span>
              <span>{{ formatDate(rec.created_at) }}</span>
            </div>
            <audio
              v-if="playingId === rec.id && playingUrl"
              :src="playingUrl"
              controls
              autoplay
              class="recording-card-player"
              @ended="playingId = null"
            />
          </div>
          <div class="recording-card-actions">
            <t-button variant="text" theme="default" size="small" @click="togglePlay(rec)">
              <template #icon><t-icon :name="playingId === rec.id ? 'pause' : 'play'" /></template>
            </t-button>
            <t-button variant="text" theme="danger" size="small" @click="confirmDelete(rec)">
              <template #icon><t-icon name="delete" /></template>
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import {
  listRecordings,
  uploadRecording,
  deleteRecording,
  getRecordingDownloadURL,
  type RecordingFile,
} from '@/api/recordings'

const { t } = useI18n()

const recordings = ref<RecordingFile[]>([])
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const playingId = ref<string | null>(null)
const playingUrl = ref<string | null>(null)

function formatBytes(bytes: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

async function refreshList() {
  loading.value = true
  try {
    const resp = await listRecordings({ limit: 200 })
    recordings.value = (resp.data?.items ?? [])
      .filter(it => !it.deleted_at && it.category === 'audio')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch (err: any) {
    MessagePlugin.error(err?.message || t('recordings.uploadFailed'))
  } finally {
    loading.value = false
  }
}

function triggerPick() {
  fileInput.value?.click()
}

async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  try {
    const fresh = await uploadRecording(file)
    recordings.value.unshift(fresh)
    MessagePlugin.success(t('recordings.uploadSuccess'))
  } catch {
    MessagePlugin.error(t('recordings.uploadFailed'))
  }
}

async function togglePlay(rec: RecordingFile) {
  if (playingId.value === rec.id) {
    playingId.value = null
    playingUrl.value = null
    return
  }
  try {
    const url = rec.download_url || (await getRecordingDownloadURL(rec.id)).data.download_url
    playingId.value = rec.id
    playingUrl.value = url
  } catch {
    MessagePlugin.error(t('recordings.uploadFailed'))
  }
}

function confirmDelete(rec: RecordingFile) {
  const dialog = DialogPlugin.confirm({
    header: t('recordings.deleteConfirm', { name: rec.name }),
    body: '',
    confirmBtn: { content: t('common.delete'), theme: 'danger' as const },
    cancelBtn: t('common.cancel'),
    onConfirm: async () => {
      try {
        await deleteRecording(rec.id)
        recordings.value = recordings.value.filter(r => r.id !== rec.id)
        if (playingId.value === rec.id) {
          playingId.value = null
          playingUrl.value = null
        }
      } catch {
        MessagePlugin.error(t('recordings.deleteFailed'))
      }
      dialog.destroy()
    },
  })
}

onMounted(refreshList)
</script>

<style lang="less" scoped>
.recordings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 24px 28px;
}

.recordings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.recordings-header-title h1 {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--td-text-color-primary);
  margin: 0 0 4px;
}

.recordings-header-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.recordings-hint {
  margin: 4px 0 16px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.recordings-body {
  flex: 1;
  min-height: 0;
}

.recordings-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recordings-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  text-align: center;
  color: var(--td-text-color-secondary);
}

.recordings-empty-orb {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(14, 165, 233, 0.4), rgba(14, 165, 233, 0.05) 70%);
  margin-bottom: 16px;
  animation: orb-pulse 4s ease-in-out infinite;
}

@keyframes orb-pulse {
  0%, 100% { transform: scale(0.92); opacity: 0.65; }
  50% { transform: scale(1.08); opacity: 1; }
}

.recordings-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 4px;
}

.recordings-empty-hint {
  font-size: 13px;
  color: var(--td-text-color-placeholder);
  margin: 0;
}

.recordings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.recording-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.06);
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--td-brand-color);
    box-shadow: 0 8px 20px -8px rgba(14, 165, 233, 0.15);
    transform: translateY(-2px);
  }
}

.recording-card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(56, 189, 248, 0.08));
  color: var(--td-brand-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recording-card-main {
  flex: 1;
  min-width: 0;
}

.recording-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.recording-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.recording-card-player {
  width: 100%;
  margin-top: 10px;
  height: 32px;
}

.recording-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
</style>
