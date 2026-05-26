<template>
  <div class="insights-view">
    <div class="insights-header" style="--wails-draggable: drag">
      <h2 style="--wails-draggable: drag">{{ $t('insights.pageTitle') }}</h2>
    </div>
    <t-tabs v-model="activeTab" class="insights-tabs">
      <t-tab-panel value="daily-review" :label="$t('insights.tabDailyReview')">
        <DailyReviewTab v-if="activeTab === 'daily-review'" />
      </t-tab-panel>
      <t-tab-panel value="ai-insight" :label="$t('insights.tabAIInsight')">
        <AIInsightTab v-if="activeTab === 'ai-insight'" />
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DailyReviewTab from './DailyReviewTab.vue'
import AIInsightTab from './AIInsightTab.vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref((route.query.tab as string) || 'daily-review')

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } })
})

watch(() => route.query.tab, (tab) => {
  if (tab && tab !== activeTab.value) activeTab.value = tab as string
})
</script>

<style lang="less" scoped>
.insights-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.insights-header {
  padding: 24px 28px 0;
  flex-shrink: 0;

  h2 {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--td-text-color-primary);
    margin: 0 0 4px;
  }
}

.insights-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.t-tabs__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :deep(.t-tab-panel) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :deep(.t-tabs__nav) {
    padding: 0 24px;
  }
}
</style>
