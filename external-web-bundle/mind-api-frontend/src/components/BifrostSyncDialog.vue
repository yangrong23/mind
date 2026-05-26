<template>
  <t-dialog
    v-model:visible="dialogVisible"
    :header="$t('modelSettings.bifrostSync.title')"
    width="960px"
    :footer="false"
    @close="handleClose"
  >
    <div class="sync-debug">
      <!-- Header bar -->
      <div class="sync-header">
        <span class="sync-time" v-if="lastRefresh">
          {{ $t('modelSettings.bifrostSync.lastRefresh') }}: {{ lastRefresh }}
        </span>
        <t-button size="small" variant="outline" :loading="loading" @click="loadAll">
          <template #icon><t-icon name="refresh" /></template>
          {{ $t('common.refresh') }}
        </t-button>
      </div>

      <div v-if="loading && !lastRefresh" class="center-state">
        <t-loading size="large" :text="$t('modelSettings.bifrostSync.loading')" />
      </div>

      <div v-else class="panels">
        <!-- Left: Builtin Models (DB) -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">{{ $t('modelSettings.bifrostSync.builtinTitle') }}</span>
            <t-tag size="small" theme="success">{{ builtinModels.length }}</t-tag>
          </div>
          <div class="panel-body">
            <div v-if="builtinModels.length === 0" class="empty-hint">
              {{ $t('modelSettings.bifrostSync.noBuiltin') }}
            </div>
            <div v-for="m in builtinModels" :key="m.id" class="model-item">
              <div class="model-item-name">{{ m.name }}</div>
              <div class="model-item-meta">
                <t-tag size="small" :theme="typeTheme(m.type)">{{ typeLabel(m.type) }}</t-tag>
                <t-tag v-if="m.is_builtin" size="small" theme="primary" variant="light">builtin</t-tag>
                <t-tag v-if="m.parameters?.base_url?.includes('bifrost')" size="small" variant="light">via bifrost</t-tag>
                <t-tag v-else size="small" variant="light" theme="warning">direct</t-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Bifrost Providers -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">{{ $t('modelSettings.bifrostSync.bifrostTitle') }}</span>
            <t-tag v-if="staleProviders.length > 0" size="small" theme="warning">
              {{ $t('modelSettings.bifrostSync.staleCount', { count: staleProviders.length }) }}
            </t-tag>
          </div>
          <div class="panel-body">
            <div v-if="bifrostProviders.length === 0" class="empty-hint">
              {{ $t('modelSettings.bifrostSync.noBifrost') }}
            </div>
            <div v-for="p in bifrostProviders" :key="p.name" class="provider-item">
              <div class="provider-header-row">
                <div class="provider-name-row">
                  <t-icon v-if="isStale(p.name)" name="error-circle" class="stale-icon" />
                  <t-icon v-else name="check-circle" class="ok-icon" />
                  <span class="provider-name">{{ p.name }}</span>
                  <span class="provider-count">{{ p.models.length }} {{ $t('modelSettings.bifrostSync.models') }}</span>
                </div>
                <t-button
                  v-if="isStale(p.name)"
                  size="small"
                  theme="danger"
                  variant="text"
                  :loading="deletingProvider === p.name"
                  @click="handleDeleteProvider(p.name)"
                >
                  {{ $t('modelSettings.bifrostSync.deleteProvider') }}
                </t-button>
              </div>
              <div class="provider-models">
                <t-tag
                  v-for="m in p.models"
                  :key="m"
                  size="small"
                  variant="light"
                  :theme="isStale(p.name) ? 'warning' : 'default'"
                >
                  {{ m }}
                </t-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning bar -->
      <div v-if="staleProviders.length > 0" class="warning-bar">
        <t-icon name="error-circle" />
        {{ $t('modelSettings.bifrostSync.staleWarning', { providers: staleProviders.join(', ') }) }}
        <t-button
          size="small"
          theme="danger"
          variant="outline"
          :loading="cleaningAll"
          @click="handleCleanAll"
        >
          {{ $t('modelSettings.bifrostSync.cleanAll') }}
        </t-button>
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useI18n } from 'vue-i18n'
import { listModels, listBifrostProviders, deleteBifrostProvider, type ModelConfig, type BifrostProviderInfo } from '@/api/model'

const { t } = useI18n()

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [boolean]; 'success': [] }>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const loading = ref(false)
const lastRefresh = ref('')
const builtinModels = ref<ModelConfig[]>([])
const bifrostProviders = ref<BifrostProviderInfo[]>([])
const deletingProvider = ref('')
const cleaningAll = ref(false)

// Known active providers (from providers.json — currently only aliyun)
const KNOWN_PROVIDERS = ['aliyun']

const isStale = (name: string) => !KNOWN_PROVIDERS.includes(name)

const staleProviders = computed(() => bifrostProviders.value.filter(p => isStale(p.name)).map(p => p.name))

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    KnowledgeQA: t('modelSettings.typeShort.chat'),
    Embedding: t('modelSettings.typeShort.embedding'),
    Rerank: t('modelSettings.typeShort.rerank'),
    VLLM: t('modelSettings.typeShort.vllm'),
    ASR: t('modelSettings.typeShort.asr')
  }
  return map[type] || type
}

const typeTheme = (type: string): string => {
  const map: Record<string, string> = {
    KnowledgeQA: 'primary',
    Embedding: 'success',
    Rerank: 'warning',
    VLLM: 'danger',
    ASR: 'default'
  }
  return map[type] || 'default'
}

const loadAll = async () => {
  loading.value = true
  try {
    const [models, providers] = await Promise.all([
      listModels(),
      listBifrostProviders()
    ])
    builtinModels.value = models.filter(m => m.is_builtin && m.status !== 'inactive')
    bifrostProviders.value = providers
    lastRefresh.value = new Date().toLocaleTimeString()
  } catch (err: any) {
    MessagePlugin.error(err.message || t('modelSettings.bifrostSync.loadError'))
  } finally {
    loading.value = false
  }
}

const handleDeleteProvider = async (name: string) => {
  deletingProvider.value = name
  try {
    await deleteBifrostProvider(name)
    MessagePlugin.success(t('modelSettings.bifrostSync.deleteSuccess', { name }))
    await loadAll()
  } catch (err: any) {
    MessagePlugin.error(err.message || t('modelSettings.bifrostSync.deleteFailed'))
  } finally {
    deletingProvider.value = ''
  }
}

const handleCleanAll = async () => {
  cleaningAll.value = true
  try {
    await Promise.all(staleProviders.value.map(name => deleteBifrostProvider(name)))
    MessagePlugin.success(t('modelSettings.bifrostSync.cleanSuccess'))
    await loadAll()
    emit('success')
  } catch (err: any) {
    MessagePlugin.error(err.message || t('modelSettings.bifrostSync.deleteFailed'))
  } finally {
    cleaningAll.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

watch(() => props.visible, (v) => { if (v) loadAll() })
</script>

<style scoped lang="less">
.sync-debug {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 420px;
}

.sync-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;

  .sync-time {
    font-size: 12px;
    color: var(--td-text-color-secondary);
  }
}

.center-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}

.panel {
  border: 1px solid var(--td-component-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-component-border);

  .panel-title {
    font-weight: 600;
    font-size: 13px;
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  max-height: 380px;
  padding: 8px 0;
}

.empty-hint {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--td-text-color-secondary);
}

.model-item {
  padding: 8px 14px;
  border-bottom: 1px solid var(--td-component-border);

  &:last-child { border-bottom: none; }

  .model-item-name {
    font-size: 13px;
    font-family: monospace;
    margin-bottom: 4px;
  }

  .model-item-meta {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
}

.provider-item {
  padding: 10px 14px;
  border-bottom: 1px solid var(--td-component-border);

  &:last-child { border-bottom: none; }
}

.provider-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.provider-name-row {
  display: flex;
  align-items: center;
  gap: 6px;

  .provider-name {
    font-size: 13px;
    font-weight: 600;
  }

  .provider-count {
    font-size: 12px;
    color: var(--td-text-color-secondary);
  }
}

.stale-icon {
  color: var(--td-warning-color);
  font-size: 14px;
}

.ok-icon {
  color: var(--td-success-color);
  font-size: 14px;
}

.provider-models {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.warning-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--td-warning-color-1);
  border: 1px solid var(--td-warning-color-3);
  border-radius: 6px;
  font-size: 13px;
  color: var(--td-warning-color-7);

  .t-icon {
    flex-shrink: 0;
  }

  .t-button {
    margin-left: auto;
  }
}
</style>
