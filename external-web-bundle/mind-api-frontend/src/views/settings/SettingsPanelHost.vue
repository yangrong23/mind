<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import enUSConfig from 'tdesign-vue-next/esm/locale/en_US'
import zhCNConfig from 'tdesign-vue-next/esm/locale/zh_CN'
import koKRConfig from 'tdesign-vue-next/esm/locale/ko_KR'
import ruRUConfig from 'tdesign-vue-next/esm/locale/ru_RU'
import type { PlatformSettingsSection } from '@/lib/platform-settings-sections'
import GeneralSettings from './GeneralSettings.vue'
import OllamaSettings from './OllamaSettings.vue'
import WeKnoraCloudSettings from './WeKnoraCloudSettings.vue'
import ModelSettings from './ModelSettings.vue'
import WebSearchSettings from './WebSearchSettings.vue'
import ChatHistorySettings from './ChatHistorySettings.vue'
import VectorStoreSettings from './VectorStoreSettings.vue'
import ParserEngineSettings from './ParserEngineSettings.vue'
import StorageEngineSettings from './StorageEngineSettings.vue'
import McpSettings from './McpSettings.vue'
import SystemInfo from './SystemInfo.vue'
import TenantInfo from './TenantInfo.vue'
import ApiInfo from './ApiInfo.vue'

const props = defineProps<{
  section: PlatformSettingsSection
}>()

const { locale } = useI18n()

const tdLocaleMap: Record<string, object> = {
  'en-US': enUSConfig,
  'zh-CN': zhCNConfig,
  'ko-KR': koKRConfig,
  'ru-RU': ruRUConfig,
}

const tdGlobalConfig = computed(() => tdLocaleMap[locale.value] || enUSConfig)

const panels: Record<PlatformSettingsSection, object> = {
  general: GeneralSettings,
  ollama: OllamaSettings,
  weknoracloud: WeKnoraCloudSettings,
  models: ModelSettings,
  websearch: WebSearchSettings,
  chathistory: ChatHistorySettings,
  vectorstore: VectorStoreSettings,
  parser: ParserEngineSettings,
  storage: StorageEngineSettings,
  mcp: McpSettings,
  system: SystemInfo,
  tenant: TenantInfo,
  api: ApiInfo,
}

const activePanel = computed(() => panels[props.section] ?? GeneralSettings)
</script>

<template>
  <t-config-provider :global-config="tdGlobalConfig">
    <component :is="activePanel" :key="section" class="platform-settings-panel-root" />
  </t-config-provider>
</template>

<style>
.platform-settings-panel-root {
  width: 100%;
}
</style>
