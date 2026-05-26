<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ManualKnowledgeEditor from '@/components/manual-knowledge-editor.vue'
import enUSConfig from 'tdesign-vue-next/esm/locale/en_US'
import zhCNConfig from 'tdesign-vue-next/esm/locale/zh_CN'
import koKRConfig from 'tdesign-vue-next/esm/locale/ko_KR'
import ruRUConfig from 'tdesign-vue-next/esm/locale/ru_RU'

const { locale } = useI18n()

const tdLocaleMap: Record<string, object> = {
  'en-US': enUSConfig,
  'zh-CN': zhCNConfig,
  'ko-KR': koKRConfig,
  'ru-RU': ruRUConfig,
}

const tdGlobalConfig = computed(() => tdLocaleMap[locale.value] || enUSConfig)
</script>

<template>
  <t-config-provider :globalConfig="tdGlobalConfig">
    <div class="platform-vue-root">
      <RouterView />
      <ManualKnowledgeEditor />
    </div>
  </t-config-provider>
</template>

<style>
.platform-vue-root {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  font-size: 14px;
  font-family: var(--app-font-family);
  background: var(--td-bg-color-page);
  color: var(--td-text-color-primary);
}
</style>

<style src="./assets/theme/modern-layout.css"></style>
