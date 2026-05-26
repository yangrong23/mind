<template>
  <div class="kb-list-container">
    <div class="kb-list-content">
      <!-- Page header -->
      <div class="lib-page-header" style="--wails-draggable: drag">
        <div class="lib-page-header-text" style="--wails-draggable: drag">
          <h2 style="--wails-draggable: drag">{{ $t('menu.library') || '知识库' }}</h2>
          <p style="--wails-draggable: drag">{{ $t('knowledgeList.subtitle') }}</p>
        </div>
        <button class="lib-create-btn" style="--wails-draggable: no-drag" @click="handleCreateKnowledgeBase">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          {{ $t('knowledgeList.create') }}
        </button>
      </div>

      <!-- Search + category tabs -->
      <div class="lib-toolbar">
        <div class="lib-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#9ca3af" stroke-width="1.5"/><path d="M11 11l3 3" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
          <input v-model="searchQuery" type="search" :placeholder="$t('menu.search') || 'Search…'" class="lib-search-input" />
        </div>
        <div class="lib-cat-tabs">
          <button
            v-for="cat in categoryTabs"
            :key="cat.id"
            class="lib-cat-tab"
            :class="{ 'lib-cat-tab--active': spaceSelection === cat.id }"
            @click="spaceSelection = cat.id"
          >{{ cat.label }}</button>
        </div>
      </div>

      <div class="kb-list-main">
    <!-- 未初始化知识库提示 -->
    <div v-if="hasUninitializedKbs" class="warning-banner">
      <t-icon name="info-circle" size="16px" />
      <span>{{ $t('knowledgeList.uninitializedBanner') }}</span>
    </div>

    <!-- 上传进度提示 -->
    <div v-if="uploadSummaries.length" class="upload-progress-panel">
      <div 
        v-for="summary in uploadSummaries" 
        :key="summary.kbId" 
        class="upload-progress-item"
      >
        <div class="upload-progress-icon">
          <t-icon :name="summary.completed === summary.total ? 'check-circle-filled' : 'upload'" size="20px" />
        </div>
        <div class="upload-progress-content">
          <div class="progress-title">
            {{
              summary.completed === summary.total
                ? $t('knowledgeList.uploadProgress.completedTitle', { name: summary.kbName })
                : $t('knowledgeList.uploadProgress.uploadingTitle', { name: summary.kbName })
            }}
          </div>
          <div class="progress-subtitle">
            {{
              summary.completed === summary.total
                ? $t('knowledgeList.uploadProgress.completedDetail', { total: summary.total })
                : $t('knowledgeList.uploadProgress.detail', { completed: summary.completed, total: summary.total })
            }}
          </div>
          <div class="progress-subtitle secondary">
            {{
              summary.completed === summary.total
                ? $t('knowledgeList.uploadProgress.refreshing')
                : $t('knowledgeList.uploadProgress.keepPageOpen')
            }}
          </div>
          <div v-if="summary.hasError" class="progress-subtitle error">
            {{ $t('knowledgeList.uploadProgress.errorTip') }}
          </div>
          <div class="progress-bar">
            <div class="progress-bar-inner" :style="{ width: summary.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 骨架屏占位 -->
    <div v-if="loading && kbs.length === 0" class="lib-grid">
      <div v-for="n in 6" :key="'skel-'+n" class="lib-card lib-card--skeleton">
        <div class="lib-card-cover"></div>
        <div class="lib-card-body">
          <t-skeleton animation="gradient" :row-col="[{ width: '70%', height: '16px' }, { width: '100%', height: '12px' }, { width: '50%', height: '10px' }]" />
        </div>
      </div>
    </div>

    <!-- 上传进度提示 -->
    <div v-if="uploadSummaries.length" class="upload-progress-panel">
      <div
        v-for="summary in uploadSummaries"
        :key="summary.kbId"
        class="upload-progress-item"
      >
        <div class="upload-progress-icon">
          <t-icon :name="summary.completed === summary.total ? 'check-circle-filled' : 'upload'" size="20px" />
        </div>
        <div class="upload-progress-content">
          <div class="progress-title">
            {{
              summary.completed === summary.total
                ? $t('knowledgeList.uploadProgress.completedTitle', { name: summary.kbName })
                : $t('knowledgeList.uploadProgress.uploadingTitle', { name: summary.kbName })
            }}
          </div>
          <div class="progress-subtitle">
            {{
              summary.completed === summary.total
                ? $t('knowledgeList.uploadProgress.completedDetail', { total: summary.total })
                : $t('knowledgeList.uploadProgress.detail', { completed: summary.completed, total: summary.total })
            }}
          </div>
          <div class="progress-subtitle secondary">
            {{
              summary.completed === summary.total
                ? $t('knowledgeList.uploadProgress.refreshing')
                : $t('knowledgeList.uploadProgress.keepPageOpen')
            }}
          </div>
          <div v-if="summary.hasError" class="progress-subtitle error">
            {{ $t('knowledgeList.uploadProgress.errorTip') }}
          </div>
          <div class="progress-bar">
            <div class="progress-bar-inner" :style="{ width: summary.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inbox card (always pinned at top of personal tab) -->
    <div v-if="spaceSelection === 'mine' && inboxKb" class="lib-grid lib-grid--inbox">
      <div
        class="lib-card lib-card--inbox"
        :class="{ 'lib-card--highlight': highlightedKbId !== null && highlightedKbId === inboxKb.id }"
        @click="handleCardClick(inboxKb)"
      >
        <div class="lib-card-cover lib-card-cover--inbox">
          <span class="lib-cover-tag lib-cover-tag--inbox">📥</span>
        </div>
        <div class="lib-card-body">
          <div class="lib-card-header">
            <span class="lib-card-title">{{ $t('knowledgeList.inbox.title') || '📥 收件箱' }}</span>
          </div>
          <p class="lib-card-desc">{{ $t('knowledgeList.inbox.description') || '未分类的素材会先放在这里，整理时再移到具体知识库' }}</p>
          <div class="lib-card-meta">
            <span>{{ inboxKb.knowledge_count || 0 }} {{ $t('knowledgeList.itemsLabel') || 'items' }}</span>
            <span v-if="inboxKb.isProcessing" class="lib-meta-processing">
              <t-icon name="loading" size="10px" /> {{ $t('knowledgeList.processing') || '处理中' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Library card grid -->
    <div v-if="spaceSelection === 'mine' && filteredPersonalKbs.length > 0" class="lib-grid">
      <div
        v-for="kb in filteredPersonalKbs"
        :key="kb.id"
        class="lib-card"
        :class="{
          'lib-card--highlight': highlightedKbId !== null && highlightedKbId === kb.id
        }"
        :ref="el => { if (highlightedKbId !== null && highlightedKbId === kb.id && el) highlightedCardRef = el as HTMLElement }"
        @click="handleCardClick(kb)"
      >
        <!-- Color cover strip -->
        <div class="lib-card-cover" :style="{ background: kbCoverGradient(kb.id) }">
          <span v-if="kb.is_pinned" class="lib-cover-pin">
            <t-icon name="pin-filled" size="12px" />
          </span>
          <span class="lib-cover-tag" :style="{ background: kbTagColor(kb.id) }">
            {{ kbTag(kb) }}
          </span>
        </div>
        <!-- Card body -->
        <div class="lib-card-body">
          <div class="lib-card-header">
            <span class="lib-card-title" :title="kb.name">{{ kb.name }}</span>
            <t-popup
              overlayClassName="card-more-popup"
              trigger="click"
              destroy-on-close
              placement="bottom-right"
            >
              <div class="lib-more-btn" @click.stop>
                <t-icon name="ellipsis" size="16px" />
              </div>
              <template #content>
                <div class="popup-menu" @click.stop>
                  <div class="popup-menu-item workspace" @click.stop="handleOpenWorkspace(kb.id)">
                    <t-icon class="menu-icon" name="layers" />
                    <span>{{ $t('knowledgeList.openWorkspace') || 'Open Workspace' }}</span>
                  </div>
                  <div class="popup-menu-item" @click.stop="handleTogglePinById(kb.id)">
                    <t-icon class="menu-icon" :name="kb.is_pinned ? 'pin-filled' : 'pin'" />
                    <span>{{ kb.is_pinned ? $t('knowledgeList.pin.unpin') : $t('knowledgeList.pin.pin') }}</span>
                  </div>
                  <div class="popup-menu-item" @click.stop="handleSettingsById(kb.id)">
                    <t-icon class="menu-icon" name="setting" />
                    <span>{{ $t('knowledgeBase.settings') }}</span>
                  </div>
                  <div class="popup-menu-item delete" @click.stop="handleDeleteById(kb.id)">
                    <t-icon class="menu-icon" name="delete" />
                    <span>{{ $t('common.delete') }}</span>
                  </div>
                </div>
              </template>
            </t-popup>
          </div>
          <p class="lib-card-desc">{{ kb.description || $t('knowledgeBase.noDescription') }}</p>
          <div class="lib-card-meta">
            <span>{{ kb.type === 'faq' ? (kb.chunk_count || 0) : (kb.knowledge_count || 0) }} {{ $t('knowledgeList.itemsLabel') || 'items' }}</span>
            <span v-if="kb.isProcessing" class="lib-meta-processing">
              <t-icon name="loading" size="10px" /> {{ $t('knowledgeList.processing') || '处理中' }}
            </span>
            <span v-if="kb.updated_at" class="lib-meta-date">{{ kb.updated_at }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Shared card grid -->
    <div v-if="spaceSelection === 'shared' && filteredSharedKbs.length > 0" class="lib-grid">
      <div
        v-for="shared in filteredSharedKbs"
        :key="'shared-' + shared.share_id"
        class="lib-card"
        @click="handleSharedKbClickFromAll(shared.knowledge_base)"
      >
        <div class="lib-card-cover" :style="{ background: kbCoverGradient(shared.knowledge_base?.id) }">
          <span class="lib-cover-tag" :style="{ background: kbTagColor(shared.knowledge_base?.id) }">
            {{ $t('knowledgeList.sharedTag') || 'Shared' }}
          </span>
        </div>
        <div class="lib-card-body">
          <div class="lib-card-header">
            <span class="lib-card-title" :title="shared.knowledge_base.name">{{ shared.knowledge_base.name }}</span>
            <button type="button" class="lib-more-btn" @click.stop="openSharedDetail(shared)">
              <t-icon name="info-circle" size="16px" />
            </button>
          </div>
          <p class="lib-card-desc">{{ shared.knowledge_base.description || $t('knowledgeBase.noDescription') }}</p>
          <div class="lib-card-meta">
            <span>{{ shared.knowledge_base.knowledge_count || 0 }} {{ $t('knowledgeList.itemsLabel') || 'items' }}</span>
            <span class="lib-meta-org">{{ shared.org_name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create new library card (always shown at end of mine tab) -->
    <div v-if="spaceSelection === 'mine' && !loading" class="lib-grid lib-grid--add">
      <button class="lib-card-add" @click="handleCreateKnowledgeBase">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
        <span>{{ $t('knowledgeList.create') }}</span>
      </button>
    </div>

    <!-- Empty states -->
    <div v-if="spaceSelection === 'mine' && personalKbs.length === 0 && !loading" class="empty-state">
      <img class="empty-img" src="@/assets/img/upload.svg" alt="">
      <span class="empty-txt">{{ $t('knowledgeList.empty.title') }}</span>
      <span class="empty-desc">{{ $t('knowledgeList.empty.description') }}</span>
      <t-button class="kb-create-btn empty-state-btn" @click="handleCreateKnowledgeBase">
        <template #icon><t-icon name="folder-add" /></template>
        {{ $t('knowledgeList.create') }}
      </t-button>
    </div>

    <div v-if="spaceSelection === 'shared' && sharedKbs.length === 0 && !loading" class="empty-state">
      <t-icon name="share" size="48px" class="empty-icon" />
      <p>{{ $t('knowledgeList.emptyShared') }}</p>
    </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <t-dialog 
      v-model:visible="deleteVisible" 
      dialogClassName="del-knowledge-dialog" 
      :closeBtn="false" 
      :cancelBtn="null"
      :confirmBtn="null"
    >
      <div class="circle-wrap">
        <div class="dialog-header">
          <img class="circle-img" src="@/assets/img/circle.png" alt="">
          <span class="circle-title">{{ $t('knowledgeList.delete.confirmTitle') }}</span>
        </div>
        <span class="del-circle-txt">
          {{ $t('knowledgeList.delete.confirmMessage', { name: deletingKb?.name ?? '' }) }}
        </span>
        <div class="circle-btn">
          <span class="circle-btn-txt" @click="deleteVisible = false">{{ $t('common.cancel') }}</span>
          <span class="circle-btn-txt confirm" @click="confirmDelete">{{ $t('knowledgeList.delete.confirmButton') }}</span>
        </div>
      </div>
    </t-dialog>

    <!-- 知识库编辑器（创建/编辑统一组件） -->
    <KnowledgeBaseEditorModal 
      :visible="uiStore.showKBEditorModal"
      :mode="uiStore.kbEditorMode"
      :kb-id="uiStore.currentKBId || undefined"
      :initial-type="uiStore.kbEditorType"
      @update:visible="(val) => val ? null : uiStore.closeKBEditor()"
      @success="handleKBEditorSuccess"
    />

    <!-- 共享知识库对话框 -->
    <ShareKnowledgeBaseDialog
      v-model:visible="shareDialogVisible"
      :knowledge-base-id="sharingKbId"
      :knowledge-base-name="sharingKbName"
      @shared="handleShareSuccess"
    />

    <!-- 右侧：共享知识库详情面板 -->
    <Teleport to="body">
      <Transition name="shared-detail-drawer">
        <div v-if="sharedDetailPanelVisible && currentSharedKbForDetail" class="shared-detail-drawer-overlay" @click.self="closeSharedDetailPanel">
          <div class="shared-detail-drawer">
            <div class="shared-detail-drawer-header">
              <h3 class="shared-detail-drawer-title">{{ $t('knowledgeList.detail.title') }}</h3>
              <button type="button" class="shared-detail-drawer-close" @click="closeSharedDetailPanel" :aria-label="$t('general.close')">
                <t-icon name="close" size="20px" />
              </button>
            </div>
            <div class="shared-detail-drawer-body">
              <div class="shared-detail-row">
                <span class="shared-detail-label">{{ $t('knowledgeBase.name') }}</span>
                <span class="shared-detail-value">{{ currentSharedKbForDetail.knowledge_base.name }}</span>
              </div>
              <div class="shared-detail-row">
                <span class="shared-detail-label">{{ $t('knowledgeList.detail.sourceType') }}</span>
                <span class="shared-detail-value shared-detail-source-type">
                  {{ currentSharedKbForDetail.source_from_agent ? $t('knowledgeList.detail.sourceTypeAgent') : $t('knowledgeList.detail.sourceTypeKbShare') }}
                </span>
              </div>
              <div class="shared-detail-row">
                <span class="shared-detail-label">{{ currentSharedKbForDetail.source_from_agent ? $t('knowledgeList.detail.sourceFromAgent') : $t('knowledgeList.detail.sourceOrg') }}</span>
                <span class="shared-detail-value shared-detail-org">
                  <img src="@/assets/img/organization-green.svg" class="shared-detail-org-icon" alt="" aria-hidden="true" />
                  {{ currentSharedKbForDetail.source_from_agent ? currentSharedKbForDetail.source_from_agent.agent_name : currentSharedKbForDetail.org_name }}
                </span>
              </div>
              <div v-if="currentSharedKbForDetail.source_from_agent" class="shared-detail-row">
                <span class="shared-detail-label">{{ $t('knowledgeList.detail.agentKbStrategy') }}</span>
                <span class="shared-detail-value">
                  {{ agentKbStrategyText(currentSharedKbForDetail.source_from_agent?.kb_selection_mode ?? '') }}
                </span>
              </div>
              <div class="shared-detail-row">
                <span class="shared-detail-label">{{ $t('knowledgeList.detail.sharedAt') }}</span>
                <span class="shared-detail-value">{{ formatStringDate(new Date(currentSharedKbForDetail.shared_at)) }}</span>
              </div>
              <div class="shared-detail-row">
                <span class="shared-detail-label">{{ $t('knowledgeList.detail.myPermission') }}</span>
                <t-tag size="small" :theme="currentSharedKbForDetail.permission === 'admin' ? 'primary' : currentSharedKbForDetail.permission === 'editor' ? 'warning' : 'default'">
                  {{ $t(`organization.role.${currentSharedKbForDetail.permission}`) }}
                </t-tag>
              </div>
            </div>
            <div class="shared-detail-drawer-footer">
              <t-button theme="default" variant="outline" @click="closeSharedDetailPanel">{{ $t('common.close') }}</t-button>
              <t-button theme="primary" class="go-to-kb-btn" @click="goToSharedKbFromPanel">
                <t-icon name="browse" />
                {{ $t('knowledgeList.detail.goToKb') }}
              </t-button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin, Icon as TIcon } from 'tdesign-vue-next'
import { listKnowledgeBases, deleteKnowledgeBase, togglePinKnowledgeBase } from '@/api/knowledge-base'
import { formatStringDate } from '@/utils/index'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { listOrganizationSharedKnowledgeBases, type SharedKnowledgeBase, type OrganizationSharedKnowledgeBaseItem, type SourceFromAgentInfo } from '@/api/organization'
import KnowledgeBaseEditorModal from './KnowledgeBaseEditorModal.vue'
import ShareKnowledgeBaseDialog from '@/components/ShareKnowledgeBaseDialog.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const authStore = useAuthStore()
const orgStore = useOrganizationStore()
const { t } = useI18n()

// 左侧空间选择：我的 / 空间 ID（已去掉「全部」）
const spaceSelection = ref<'all' | 'mine' | 'shared' | string>('mine')

// Search query for filtering
const searchQuery = ref('')

// Category tabs
const categoryTabs = computed(() => [
  { id: 'mine', label: t('knowledgeList.mine') || '我的' },
  { id: 'shared', label: t('knowledgeList.shared') || '共享' },
])

// Cover gradients — deterministic by KB id
const COVER_GRADIENTS = [
  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #6366f1 100%)',
  'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
]
const TAG_COLORS = ['#0284c7', '#059669', '#7c3aed', '#b45309', '#0f766e', '#c2410c']
const KB_TAGS_ZH = ['技术', '研究', '产品', '设计', '业务', '学习']
const KB_TAGS_EN = ['Tech', 'Research', 'Product', 'Design', 'Business', 'Study']

const kbCoverGradient = (id: string | undefined): string => {
  if (!id) return COVER_GRADIENTS[0]
  const n = parseInt(id.replace(/\D/g, '').slice(-4) || '0', 10)
  return COVER_GRADIENTS[n % COVER_GRADIENTS.length]
}
const kbTagColor = (id: string | undefined): string => {
  if (!id) return TAG_COLORS[0]
  const n = parseInt(id.replace(/\D/g, '').slice(-4) || '0', 10)
  return TAG_COLORS[n % TAG_COLORS.length]
}
const kbTag = (kb: KB): string => {
  const n = parseInt((kb.id || '').replace(/\D/g, '').slice(-4) || '0', 10)
  return t('locale') === 'zh-CN' ? KB_TAGS_ZH[n % KB_TAGS_ZH.length] : KB_TAGS_EN[n % KB_TAGS_EN.length]
}

// Filtered personal KBs by search
const filteredPersonalKbs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return personalKbs.value.filter(kb =>
    !q || kb.name.toLowerCase().includes(q) || (kb.description || '').toLowerCase().includes(q)
  )
})
// Filtered shared KBs by search
const filteredSharedKbs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return sharedKbs.value.filter(s => {
    const kb = s.knowledge_base
    return !q || kb.name.toLowerCase().includes(q) || (kb.description || '').toLowerCase().includes(q)
  })
})

interface KB {
  id: string;
  name: string;
  description?: string;
  updated_at?: string;
  embedding_model_id?: string;
  summary_model_id?: string;
  type?: 'document' | 'faq';
  showMore?: boolean;
  vlm_config?: { enabled?: boolean; model_id?: string };
  extract_config?: { enabled?: boolean };
  storage_provider_config?: { provider?: string };
  storage_config?: { provider?: string; bucket_name?: string }; // legacy
  question_generation_config?: { enabled?: boolean; question_count?: number };
  knowledge_count?: number;
  chunk_count?: number;
  isProcessing?: boolean;
  processing_count?: number;
  share_count?: number;
  is_pinned?: boolean;
  is_inbox?: boolean;
  source?: 'personal' | 'team';
  tenant_name?: string;
}

const kbs = ref<KB[]>([])
// KBs from other tenants the user is a member of (source === 'team')
const teamKbs = computed(() => kbs.value.filter(kb => kb.source === 'team'))
// Personal KBs (source === 'personal' or no source field) — excludes the
// inbox KB which is rendered separately as a pinned "📥 收件箱" card.
const personalKbs = computed(() => kbs.value.filter(kb => (!kb.source || kb.source === 'personal') && !kb.is_inbox))
// Inbox KB (per-user, lazy-provisioned by backend); shown at the top of the
// grid with a fixed 📥 label and reduced action set (no rename/delete/pin).
const inboxKb = computed<KB | null>(() => kbs.value.find(kb => kb.is_inbox) || null)
const loading = ref(false)
const deleteVisible = ref(false)
const deletingKb = ref<KB | null>(null)
const currentMoreIndex = ref<number>(-1)
const highlightedKbId = ref<string | null>(null)
const highlightedCardRef = ref<HTMLElement | null>(null)
const uploadTasks = ref<UploadTaskState[]>([])
const uploadCleanupTimers = new Map<string, ReturnType<typeof setTimeout>>()
let uploadRefreshTimer: ReturnType<typeof setTimeout> | null = null
const UPLOAD_CLEANUP_DELAY = 10000

// Share dialog state
const shareDialogVisible = ref(false)
const sharingKbId = ref('')
const sharingKbName = ref('')

// Shared knowledge bases
const sharedKbs = computed<SharedKnowledgeBase[]>(() => orgStore.sharedKnowledgeBases || [])

// All knowledge bases (mine + shared to me)
const allKnowledgeBases = computed(() => kbs.value.length + sharedKbs.value.length)

// 当前选中的是空间 ID（非全部、非我的）
const spaceSelectionOrgId = computed(() => {
  const s = spaceSelection.value
  return s !== 'all' && s !== 'mine' && s !== 'shared' && !!s
})

// 当前空间下共享给我的知识库（旧：仅他人共享；保留用于兼容）
const sharedKbsByOrg = computed(() => {
  const orgId = spaceSelection.value
  if (orgId === 'all' || orgId === 'mine') return []
  return sharedKbs.value.filter(s => s.organization_id === orgId)
})

// 空间视角：该空间内全部知识库（含我共享的），选中空间时请求新接口
const spaceKbsList = ref<OrganizationSharedKnowledgeBaseItem[]>([])
const spaceKbsLoading = ref(false)
const spaceCountByOrg = ref<Record<string, number>>({})

// 各空间下的共享知识库数量（用于侧栏展示）：优先用接口返回的该空间总数，否则用「共享给我」数量
const sharedCountByOrg = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  sharedKbs.value.forEach(s => {
    const id = s.organization_id
    if (!id) return
    map[id] = (map[id] || 0) + 1
  })
  ;(orgStore.organizations || []).forEach(org => {
    if (map[org.id] === undefined) map[org.id] = 0
  })
  return map
})
const effectiveSharedCountByOrg = computed<Record<string, number>>(() => {
  const base = sharedCountByOrg.value
  const merged = { ...base }
  Object.keys(spaceCountByOrg.value).forEach(orgId => {
    merged[orgId] = spaceCountByOrg.value[orgId]
  })
  return merged
})

// Filtered knowledge bases: 全部 = 我的 + 全部共享；我的 = 仅我的
const filteredKnowledgeBases = computed(() => {
  if (spaceSelection.value === 'mine') {
    return personalKbs.value.map(kb => ({ ...kb, isMine: true as const }))
  }
  if (spaceSelection.value !== 'all') {
    return []
  }
  const result: Array<(KB & { isMine: true }) | (SharedKnowledgeBase['knowledge_base'] & { isMine: false; permission: string; shared_at: string; share_id: string } & any)> = []
  kbs.value.forEach(kb => {
    result.push({ ...kb, isMine: true as const })
  })
  sharedKbs.value.forEach(shared => {
    const kb = shared.knowledge_base
    if (!kb) return
    result.push({
      ...kb,
      isMine: false as const,
      permission: shared.permission,
      shared_at: shared.shared_at,
      share_id: shared.share_id,
      org_name: shared.org_name,
      knowledge_count: kb.knowledge_count,
      chunk_count: kb.chunk_count,
    } as any)
  })
  return result
})

interface UploadTaskState {
  uploadId: string
  kbId: string
  fileName?: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

interface UploadSummary {
  kbId: string
  kbName: string
  total: number
  completed: number
  progress: number
  hasError: boolean
}

const fetchList = () => {
  loading.value = true
  return Promise.all([
    listKnowledgeBases().then((res: any) => {
      const data = res.data || []
      // 格式化时间，并初始化 showMore 状态
      // is_processing 字段由后端返回
      kbs.value = data.map((kb: any) => ({
        ...kb,
        updated_at: kb.updated_at ? formatStringDate(new Date(kb.updated_at)) : '',
        showMore: false,
        isProcessing: kb.is_processing || false,
        processing_count: kb.processing_count || 0
      }))
    }),
    orgStore.fetchSharedKnowledgeBases(),
    orgStore.fetchOrganizations()
  ]).finally(() => { loading.value = false }).then(() => {
    // 各空间知识库数量已由 GET /organizations 的 resource_counts 带回，存于 orgStore.resourceCounts
    const counts = orgStore.resourceCounts?.knowledge_bases?.by_organization
    if (counts) spaceCountByOrg.value = { ...counts }
  })
}

// 选中空间时请求该空间内全部知识库（含我共享的）
watch(spaceSelection, (val) => {
  if (val === 'all' || val === 'mine' || val === 'shared' || !val) {
    spaceKbsList.value = []
    return
  }
  spaceKbsLoading.value = true
  listOrganizationSharedKnowledgeBases(val).then((res) => {
    if (res.success && res.data) {
      spaceKbsList.value = res.data
      spaceCountByOrg.value = { ...spaceCountByOrg.value, [val]: res.data.length }
    } else {
      spaceKbsList.value = []
    }
  }).finally(() => {
    spaceKbsLoading.value = false
  })
}, { immediate: true })

onMounted(() => {
  fetchList().then(() => {
    // 检查路由参数中是否有需要高亮的知识库ID
    const highlightKbId = route.query.highlightKbId as string
    if (highlightKbId) {
      triggerHighlightFlash(highlightKbId)
      // 清除 URL 中的查询参数
      router.replace({ query: {} })
    }
  })

  window.addEventListener('knowledgeFileUploadStart', handleUploadStartEvent as EventListener)
  window.addEventListener('knowledgeFileUploadProgress', handleUploadProgressEvent as EventListener)
  window.addEventListener('knowledgeFileUploadComplete', handleUploadCompleteEvent as EventListener)
  window.addEventListener('knowledgeFileUploaded', handleUploadFinishedEvent as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('knowledgeFileUploadStart', handleUploadStartEvent as EventListener)
  window.removeEventListener('knowledgeFileUploadProgress', handleUploadProgressEvent as EventListener)
  window.removeEventListener('knowledgeFileUploadComplete', handleUploadCompleteEvent as EventListener)
  window.removeEventListener('knowledgeFileUploaded', handleUploadFinishedEvent as EventListener)

  uploadCleanupTimers.forEach(timer => clearTimeout(timer))
  uploadCleanupTimers.clear()
  if (uploadRefreshTimer) {
    clearTimeout(uploadRefreshTimer)
    uploadRefreshTimer = null
  }
})

// 监听路由变化，处理从其他页面跳转过来的高亮需求
watch(() => route.query.highlightKbId, (newKbId) => {
  if (newKbId && typeof newKbId === 'string' && kbs.value.length > 0) {
    triggerHighlightFlash(newKbId)
    router.replace({ query: {} })
  }
})

const openMore = (index: number) => {
  // 只记录当前打开的索引，用于显示激活样式
  // 弹窗的开关由 v-model 自动管理
  currentMoreIndex.value = index
}

const onVisibleChange = (visible: boolean) => {
  // 弹窗关闭时重置索引
  if (!visible) {
    currentMoreIndex.value = -1
  }
}

const handleSettings = (kb: KB) => {
  // 手动关闭弹窗
  kb.showMore = false
  goSettings(kb.id)
}

// 通过 ID 处理设置（用于全部 Tab 下的知识库）
const handleSettingsById = (id: string) => {
  goSettings(id)
}

// 通过 ID 处理删除（用于全部 Tab 下的知识库）
const handleDeleteById = (id: string) => {
  const kb = kbs.value.find(k => k.id === id)
  if (kb) {
    deletingKb.value = kb
    deleteVisible.value = true
  }
}

const handleTogglePin = async (kb: KB) => {
  kb.showMore = false
  try {
    const res: any = await togglePinKnowledgeBase(kb.id)
    if (res.success) {
      MessagePlugin.success(
        res.data.is_pinned ? t('knowledgeList.pin.pinSuccess') : t('knowledgeList.pin.unpinSuccess')
      )
      fetchList()
    }
  } catch {
    MessagePlugin.error(t('knowledgeList.pin.failed'))
  }
}

const handleTogglePinById = async (id: string) => {
  try {
    const res: any = await togglePinKnowledgeBase(id)
    if (res.success) {
      MessagePlugin.success(
        res.data.is_pinned ? t('knowledgeList.pin.pinSuccess') : t('knowledgeList.pin.unpinSuccess')
      )
      fetchList()
    }
  } catch {
    MessagePlugin.error(t('knowledgeList.pin.failed'))
  }
}

const handleShare = (kb: KB) => {
  // 手动关闭弹窗
  kb.showMore = false
  sharingKbId.value = kb.id
  sharingKbName.value = kb.name
  shareDialogVisible.value = true
}

const handleShareSuccess = () => {
  // 共享成功后可刷新列表
  fetchList()
}

const handleSharedKbClick = (sharedKb: SharedKnowledgeBase) => {
  // 跳转到共享知识库详情页
  router.push(`/platform/knowledge-bases/${sharedKb.knowledge_base.id}`)
}

// 处理"全部"Tab 中的共享知识库卡片点击（直接进入知识库）
const handleSharedKbClickFromAll = (kb: any) => {
  router.push(`/platform/knowledge-bases/${kb.id}`)
}

// 右侧详情面板：共享知识库详情（含直接共享与来自智能体的）
type SharedKbDetailItem = SharedKnowledgeBase & { is_mine?: boolean; source_from_agent?: SourceFromAgentInfo }
const sharedDetailPanelVisible = ref(false)
const currentSharedKbForDetail = ref<SharedKbDetailItem | null>(null)

const closeSharedDetailPanel = () => {
  sharedDetailPanelVisible.value = false
  currentSharedKbForDetail.value = null
}

// 打开右侧详情面板（全部 Tab 共享卡片）
const openSharedDetailFromAll = (kb: any) => {
  const sharedKb = sharedKbs.value.find(s => s.knowledge_base.id === kb.id)
  if (sharedKb) {
    currentSharedKbForDetail.value = sharedKb
    sharedDetailPanelVisible.value = true
  }
}

// 打开右侧详情面板（空间 Tab：直接共享或来自智能体）
const openSharedDetail = (sharedKb: SharedKbDetailItem) => {
  currentSharedKbForDetail.value = sharedKb
  sharedDetailPanelVisible.value = true
}

// 智能体对知识库的策略文案（用于抽屉「来源方式」为智能体时）
const agentKbStrategyText = (mode: string) => {
  if (mode === 'all') return t('knowledgeList.detail.agentKbStrategyAll')
  if (mode === 'selected') return t('knowledgeList.detail.agentKbStrategySelected')
  return t('knowledgeList.detail.agentKbStrategyNone')
}

// 从右侧面板进入知识库
const goToSharedKbFromPanel = () => {
  if (currentSharedKbForDetail.value) {
    router.push(`/platform/knowledge-bases/${currentSharedKbForDetail.value.knowledge_base.id}`)
    closeSharedDetailPanel()
  }
}

const handleDelete = (kb: KB) => {
  // 手动关闭弹窗
  kb.showMore = false
  deletingKb.value = kb
  deleteVisible.value = true
}

const confirmDelete = () => {
  if (!deletingKb.value) return
  
  deleteKnowledgeBase(deletingKb.value.id).then((res: any) => {
    if (res.success) {
      MessagePlugin.success(t('knowledgeList.messages.deleted'))
      deleteVisible.value = false
      deletingKb.value = null
      fetchList()
    } else {
      MessagePlugin.error(res.message || t('knowledgeList.messages.deleteFailed'))
    }
  }).catch((e: any) => {
    MessagePlugin.error(e?.message || t('knowledgeList.messages.deleteFailed'))
  })
}

const isInitialized = (kb: KB) => {
  // LLM (summary) model is always required
  if (!kb.summary_model_id || kb.summary_model_id === '') return false
  // Embedding model only required when RAG indexing is enabled (vector or keyword)
  const strategy = (kb as any).indexing_strategy
  const needsEmbedding = !strategy || strategy.vector_enabled || strategy.keyword_enabled
  if (needsEmbedding && (!kb.embedding_model_id || kb.embedding_model_id === '')) return false
  return true
}

// 计算是否有未初始化的知识库
const hasUninitializedKbs = computed(() => {
  return kbs.value.some(kb => !isInitialized(kb))
})

const getKbDisplayName = (kbId: string) => {
  const target = kbs.value.find(kb => kb.id === kbId)
  if (target?.name) return target.name
  return t('knowledgeList.uploadProgress.unknownKb', { id: kbId }) as string
}

const uploadSummaries = computed<UploadSummary[]>(() => {
  if (!uploadTasks.value.length) return []
  const grouped: Record<string, UploadTaskState[]> = {}
  uploadTasks.value.forEach(task => {
    const kbKey = String(task.kbId)
    if (!grouped[kbKey]) grouped[kbKey] = []
    grouped[kbKey].push(task)
  })
  return Object.entries(grouped).map(([kbId, tasks]) => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status !== 'uploading').length
    const progressSum = tasks.reduce((sum, task) => sum + (task.progress ?? 0), 0)
    const avgProgress = total === 0 ? 0 : Math.min(100, Math.max(0, Math.round(progressSum / total)))
    const hasError = tasks.some(task => task.status === 'error')
    return {
      kbId,
      kbName: getKbDisplayName(kbId),
      total,
      completed,
      progress: avgProgress,
      hasError
    }
  }).sort((a, b) => a.kbName.localeCompare(b.kbName))
})

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)))

const addUploadTask = (task: UploadTaskState) => {
  uploadTasks.value = [
    ...uploadTasks.value.filter(item => item.uploadId !== task.uploadId),
    task,
  ]
}

const patchUploadTask = (uploadId: string, patch: Partial<UploadTaskState>) => {
  const index = uploadTasks.value.findIndex(task => task.uploadId === uploadId)
  if (index === -1) return
  const nextTasks = [...uploadTasks.value]
  nextTasks[index] = { ...nextTasks[index], ...patch }
  uploadTasks.value = nextTasks
}

const removeUploadTask = (uploadId: string) => {
  uploadTasks.value = uploadTasks.value.filter(task => task.uploadId !== uploadId)
  const timer = uploadCleanupTimers.get(uploadId)
  if (timer) {
    clearTimeout(timer)
    uploadCleanupTimers.delete(uploadId)
  }
}

const scheduleUploadTaskCleanup = (uploadId: string) => {
  const existing = uploadCleanupTimers.get(uploadId)
  if (existing) {
    clearTimeout(existing)
  }
  const timer = setTimeout(() => {
    removeUploadTask(uploadId)
  }, UPLOAD_CLEANUP_DELAY)
  uploadCleanupTimers.set(uploadId, timer)
}

type UploadEventDetail = {
  uploadId: string
  kbId?: string | number
  fileName?: string
  progress?: number
  status?: UploadTaskState['status']
  error?: string
}

const ensureUploadTaskEntry = (detail?: UploadEventDetail) => {
  if (!detail?.uploadId) return null
  const existing = uploadTasks.value.find(task => task.uploadId === detail.uploadId)
  if (existing) return existing
  if (!detail.kbId) return null
  const initialProgress = typeof detail.progress === 'number' ? clampProgress(detail.progress) : 0
  const newTask: UploadTaskState = {
    uploadId: detail.uploadId,
    kbId: String(detail.kbId),
    fileName: detail.fileName,
    progress: initialProgress,
    status: detail.status || 'uploading',
    error: detail.error
  }
  addUploadTask(newTask)
  return newTask
}

const handleCardClick = (kb: KB) => {
  if (isInitialized(kb)) {
    goDetail(kb.id)
  } else {
    goSettings(kb.id)
  }
}

const goDetail = (id: string) => {
  router.push(`/platform/knowledge-bases/${id}`)
}

const goSettings = (id: string) => {
  // 使用模态框打开设置
  uiStore.openKBSettings(id)
}

const handleOpenWorkspace = (id: string) => {
  router.push(`/platform/knowledge-bases/${id}?view=workspace`)
}

// 创建知识库
const handleCreateKnowledgeBase = () => {
  uiStore.openCreateKB()
}

// 知识库编辑器成功回调（创建或编辑成功）
const handleKBEditorSuccess = (kbId: string) => {
  console.log('[KnowledgeBaseList] knowledge operation success:', kbId)
  fetchList().then(() => {
    // 如果是从路由参数中获取的高亮ID，触发闪烁效果
    if (route.query.highlightKbId === kbId) {
      triggerHighlightFlash(kbId)
      // 清除 URL 中的查询参数
      router.replace({ query: {} })
    }
  })
}

// 触发高亮闪烁效果
const triggerHighlightFlash = (kbId: string) => {
  highlightedKbId.value = kbId
  nextTick(() => {
    if (highlightedCardRef.value) {
      // 滚动到高亮的卡片
      highlightedCardRef.value.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
    // 3秒后清除高亮
    setTimeout(() => {
      highlightedKbId.value = null
    }, 3000)
  })
}

const handleUploadStartEvent = (event: Event) => {
  const detail = (event as CustomEvent<UploadEventDetail>).detail
  if (!detail?.uploadId || !detail?.kbId) return
  addUploadTask({
    uploadId: detail.uploadId,
    kbId: String(detail.kbId),
    fileName: detail.fileName,
    progress: typeof detail.progress === 'number' ? clampProgress(detail.progress) : 0,
    status: 'uploading'
  })
}

const handleUploadProgressEvent = (event: Event) => {
  const detail = (event as CustomEvent<UploadEventDetail>).detail
  if (!detail?.uploadId || typeof detail.progress !== 'number') return
  if (!ensureUploadTaskEntry(detail)) return
  patchUploadTask(detail.uploadId, {
    progress: clampProgress(detail.progress)
  })
}

const handleUploadCompleteEvent = (event: Event) => {
  const detail = (event as CustomEvent<UploadEventDetail>).detail
  if (!detail?.uploadId) return
  const progress = typeof detail.progress === 'number'
    ? clampProgress(detail.progress)
    : 100
  if (!ensureUploadTaskEntry({ ...detail, progress })) return
  patchUploadTask(detail.uploadId, {
    status: detail.status || 'success',
    progress,
    error: detail.error
  })
  scheduleUploadTaskCleanup(detail.uploadId)
}

const handleUploadFinishedEvent = (event: Event) => {
  const detail = (event as CustomEvent<{ kbId?: string | number }>).detail
  if (!detail?.kbId) return
  if (uploadRefreshTimer) {
    clearTimeout(uploadRefreshTimer)
  }
  uploadRefreshTimer = setTimeout(() => {
    fetchList()
    uploadRefreshTimer = null
  }, 800)
}
</script>

<style scoped lang="less">
// ── Web-style Library Layout ──────────────────────────────────────────────

.kb-list-container {
  margin: 0 16px 0 0;
  height: 100%;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0;
}

.kb-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px 32px 0 32px;
  min-height: 0;
}

.lib-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;

  h2 {
    margin: 0 0 4px 0;
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.3px;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }
}

.lib-create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: all 0.18s ease;
  white-space: nowrap;
  flex-shrink: 0;

  svg { flex-shrink: 0; }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  }
}

.lib-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.lib-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 180px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);

  svg { flex-shrink: 0; }
}

.lib-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #374151;
  min-width: 0;

  &::placeholder { color: #9ca3af; }
}

.lib-cat-tabs {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
}

.lib-cat-tab {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.15s ease;

  &:hover { background: #f3f4f6; color: #374151; }

  &--active {
    background: #111827;
    color: #fff;
  }
}

.kb-list-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 24px;
}

.lib-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  &--add {
    margin-bottom: 0;
  }
}

.lib-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 40px -14px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: all 0.22s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.18);
  }

  &--skeleton {
    pointer-events: none;
    .lib-card-cover { background: #e5e7eb; }
  }

  &--highlight {
    animation: libHighlight 1.5s ease;
  }
}

@keyframes libHighlight {
  0%, 100% { box-shadow: 0 12px 40px -14px rgba(15, 23, 42, 0.1); }
  40% { box-shadow: 0 0 0 3px #6366f1, 0 12px 40px -14px rgba(99, 102, 241, 0.3); }
}

.lib-card-cover {
  height: 120px;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  padding: 10px 12px;
  transition: transform 0.3s ease;

  .lib-card:hover & {
    transform: scale(1.02);
    transform-origin: center;
  }
}

.lib-cover-pin {
  position: absolute;
  top: 10px;
  left: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.lib-cover-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}

.lib-card-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.lib-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lib-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.lib-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover { background: #f3f4f6; color: #374151; }
}

.lib-card-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
}

.lib-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  margin-top: 2px;
  flex-wrap: wrap;
}

.lib-meta-processing {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #f59e0b;
}

.lib-meta-date { color: #d1d5db; }
.lib-meta-org { color: #9ca3af; }

.lib-card-add {
  height: 160px;
  border: 2px dashed #d1d5db;
  border-radius: 20px;
  background: rgba(249, 250, 251, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  transition: all 0.15s;

  svg { color: #d1d5db; transition: color 0.15s; }

  &:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99, 102, 241, 0.04);
    svg { color: #6366f1; }
  }
}

.kb-create-btn {
  background: linear-gradient(135deg, var(--td-brand-color) 0%, #00a67e 100%);
  border: none;
  color: var(--td-text-color-anti);

  &:hover {
    background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-active) 100%);
  }
}

.kb-list-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
}

.kb-list-main-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 12px;
  background: var(--td-bg-color-container);
}

.shared-by-me-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: var(--td-brand-color);
  margin-left: 6px;
}

.header-subtitle {
  margin: 0;
  color: var(--td-text-color-placeholder);
  font-family: var(--app-font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.header-action-btn {
  padding: 0 !important;
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: var(--td-bg-color-secondarycontainer) !important;
  border: 1px solid var(--td-component-stroke) !important;
  border-radius: 6px !important;
  color: var(--td-text-color-secondary);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:hover {
    background: var(--td-bg-color-secondarycontainer) !important;
    border-color: var(--td-component-stroke) !important;
    color: var(--td-text-color-primary);
  }

  :deep(.t-icon),
  :deep(.btn-icon-wrapper) {
    color: var(--td-brand-color);
  }
}

// Tab 切换样式（已由左侧菜单替代，保留以备兼容）
.kb-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid var(--td-component-stroke);
  margin-bottom: 20px;

  .tab-item {
    padding: 12px 0;
    cursor: pointer;
    color: var(--td-text-color-secondary);
    font-family: var(--app-font-family);
    font-size: 14px;
    font-weight: 400;
    user-select: none;
    position: relative;
    transition: color 0.2s ease;

    &:hover {
      color: var(--td-text-color-primary);
    }

    &.active {
      color: var(--td-brand-color);
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--td-brand-color);
        border-radius: 1px;
      }
    }
  }
}


// 共享知识库卡片样式
// 共享标识（文档类型默认绿色，位置贴右上角）
.shared-badge {
  position: absolute;
  top: 10px;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: var(--td-brand-color);
  font-weight: 500;

  .t-icon {
    color: var(--td-brand-color);
  }
}

// 来源组织（空间图标 + 空间名）
.org-source {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(14, 165, 233, 0.06);
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--td-text-color-secondary);
  max-width: 140px;
  transition: background-color 0.15s ease;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .org-source-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    vertical-align: middle;
  }

  .t-icon {
    color: var(--td-brand-color);
    flex-shrink: 0;
  }
}

// 「我的」知识库标签（与 .org-source 同套样式：灰字 + 绿标 + 浅绿底）
.personal-source {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(14, 165, 233, 0.06);
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--td-text-color-secondary);
  font-weight: 500;
  transition: background-color 0.15s ease;

  span {
    font-weight: 500;
  }

  .t-icon {
    color: var(--td-brand-color);
    flex-shrink: 0;
  }
}

.shared-kb-card {
  position: relative;

  // 共享知识库根据类型显示不同样式
  &.kb-type-document {
    background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(14, 165, 233, 0.04) 100%) !important;

    &:hover {
      border-color: var(--td-brand-color) !important;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.12) !important;
      background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(14, 165, 233, 0.08) 100%) !important;
    }

    &::after {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, transparent 100%) !important;
    }
  }

  &.kb-type-faq {
    background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(0, 82, 217, 0.04) 100%) !important;

    &:hover {
      border-color: var(--td-brand-color) !important;
      box-shadow: 0 4px 12px rgba(0, 82, 217, 0.12) !important;
      background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(0, 82, 217, 0.08) 100%) !important;
    }

    &::after {
      background: linear-gradient(135deg, rgba(0, 82, 217, 0.08) 0%, transparent 100%) !important;
    }

    // FAQ 类型共享标识使用蓝色
    .shared-badge {
      background: rgba(0, 82, 217, 0.1);
      color: var(--td-brand-color);

      .t-icon {
        color: var(--td-brand-color);
      }
    }
  }

  .org-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    border-color: rgba(0, 82, 217, 0.15);
    color: var(--td-brand-color);
    background: rgba(0, 82, 217, 0.04);
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    max-width: fit-content;
  }
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: var(--td-warning-color-light);
  border: 1px solid var(--td-warning-color-focus);
  border-radius: 6px;
  color: var(--td-warning-color);
  font-family: var(--app-font-family);
  font-size: 14px;
  
  .t-icon {
    color: var(--td-warning-color);
    flex-shrink: 0;
  }
}

.upload-progress-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.upload-progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--td-component-stroke);
  border-radius: 8px;
  background: var(--td-bg-color-container);
}

.upload-progress-icon {
  color: var(--td-brand-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-progress-content {
  flex: 1;
}

.progress-title {
  color: var(--td-text-color-primary);
  font-family: var(--app-font-family);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  margin-bottom: 2px;
}

.progress-subtitle {
  color: var(--td-text-color-secondary);
  font-family: var(--app-font-family);
  font-size: 12px;
  line-height: 18px;
}

.progress-subtitle.secondary {
  color: var(--td-text-color-placeholder);
  margin-top: 2px;
}

.progress-subtitle.error {
  color: var(--td-error-color);
  margin-top: 4px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--td-bg-color-secondarycontainer);
  margin-top: 10px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, var(--td-brand-color-active) 0%, var(--td-brand-color) 100%);
  transition: width 0.2s ease;
}

@keyframes contentFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.kb-card-wrap {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
  animation: contentFadeIn 0.32s ease-out;
}

.kb-section-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0 4px;
  color: var(--td-text-color-secondary);
  font-family: var(--app-font-family);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;

  .t-icon {
    color: var(--td-brand-color);
  }

  &.kb-section-header-pinned {
    color: var(--td-brand-color);
  }
}

.kb-card {
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.08);
  background: var(--td-bg-color-container);
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  height: 160px;
  min-height: 160px;

  &.kb-card-skeleton {
    cursor: default;
    .card-header { margin-bottom: 16px; }
    .card-content { flex: 1; }
    .card-bottom { margin-top: auto; }
  }

  &:hover {
    border-color: var(--td-brand-color);
    box-shadow: 0 8px 24px -8px rgba(14, 165, 233, 0.15);
    transform: translateY(-2px);
  }

  &.uninitialized {
    opacity: 0.9;
  }

  // 文档类型样式
  &.kb-type-document {
    background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(14, 165, 233, 0.04) 100%);

    &:hover {
      border-color: var(--td-brand-color);
      background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(14, 165, 233, 0.08) 100%);
    }

    // 右上角装饰
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, transparent 100%);
      border-radius: 0 12px 0 100%;
      pointer-events: none;
      z-index: 0;
    }
  }

  // 问答类型样式
  &.kb-type-faq {
    background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(0, 82, 217, 0.04) 100%);

    &:hover {
      border-color: var(--td-brand-color);
      box-shadow: 0 4px 12px rgba(0, 82, 217, 0.12);
      background: linear-gradient(135deg, var(--td-bg-color-container) 0%, rgba(0, 82, 217, 0.08) 100%);
    }

    // 右上角装饰
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, rgba(0, 82, 217, 0.08) 0%, transparent 100%);
      border-radius: 0 12px 0 100%;
      pointer-events: none;
      z-index: 0;
    }
  }

  .pin-indicator {
    position: absolute;
    top: 8px;
    left: 8px;
    color: var(--td-brand-color);
    z-index: 2;
    opacity: 0.7;
  }

  // 确保内容在装饰之上
  .card-header,
  .card-content,
  .card-bottom {
    position: relative;
    z-index: 1;
  }

  .card-header {
    margin-bottom: 10px;
  }

  .card-title {
    font-size: 16px;
    line-height: 24px;
  }

  .card-content {
    margin-bottom: 10px;
  }

  .card-description {
    font-size: 12px;
    line-height: 18px;
  }

  .card-bottom {
    padding-top: 8px;
  }

  .more-wrap {
    width: 28px;
    height: 28px;

    .more-icon {
      width: 16px;
      height: 16px;
    }
  }

  .card-more-btn {
    width: 28px;
    height: 28px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .card-title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .card-more-btn {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--td-text-color-placeholder);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--td-bg-color-container-hover);
      color: var(--td-text-color-secondary);
    }
  }

  .permission-tag {
    flex-shrink: 0;
  }
}

.card-title {
  color: var(--td-text-color-primary);
  font-family: var(--app-font-family);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.more-wrap {
  display: flex;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  opacity: 0;

  .kb-card:hover & {
    opacity: 0.6;
  }

  &:hover {
    background: var(--td-bg-color-container-hover);
    opacity: 1 !important;
  }

  &.active-more {
    background: var(--td-bg-color-container-hover);
    opacity: 1 !important;
  }

  .more-icon {
    width: 14px;
    height: 14px;
  }
}

.card-content {
  flex: 1;
  min-height: 0;
  margin-bottom: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 三个列表卡片统一：描述字体 */
.card-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  color: var(--td-text-color-secondary);
  font-family: var(--app-font-family);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: .5px solid var(--td-component-stroke);
}

.bottom-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.bottom-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .card-time {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }
}

.feature-badges {
  display: flex;
  align-items: center;
  gap: 4px;
}

.feature-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  cursor: default;
  transition: background 0.2s ease;

  &.type-document {
    background: rgba(14, 165, 233, 0.08);
    color: var(--td-brand-color-active);
    width: auto;
    padding: 0 6px;
    gap: 3px;

    &:hover {
      background: rgba(14, 165, 233, 0.12);
    }

    .badge-count {
      font-size: 11px;
      font-weight: 500;
    }

    .processing-icon {
      animation: spin 1s linear infinite;
    }
  }

  &.type-faq {
    background: rgba(0, 82, 217, 0.08);
    color: var(--td-brand-color);
    width: auto;
    padding: 0 6px;
    gap: 3px;

    &:hover {
      background: rgba(0, 82, 217, 0.12);
    }

    .badge-count {
      font-size: 11px;
      font-weight: 500;
    }

    .processing-icon {
      animation: spin 1s linear infinite;
    }
  }

  &.kg {
    background: rgba(124, 77, 255, 0.08);
    color: var(--td-brand-color);

    &:hover {
      background: rgba(124, 77, 255, 0.12);
    }
  }

  &.multimodal {
    background: rgba(255, 152, 0, 0.08);
    color: var(--td-warning-color);

    &:hover {
      background: rgba(255, 152, 0, 0.12);
    }
  }

  &.question {
    background: rgba(0, 150, 136, 0.08);
    color: var(--td-success-color);

    &:hover {
      background: rgba(0, 150, 136, 0.12);
    }
  }

  &.shared {
    background: rgba(0, 82, 217, 0.08);
    color: var(--td-brand-color);

    &:hover {
      background: rgba(0, 82, 217, 0.12);
    }
  }

  &.role-admin {
    background: rgba(14, 165, 233, 0.1);
    color: var(--td-brand-color-active);

    &:hover {
      background: rgba(14, 165, 233, 0.15);
    }
  }

  &.role-editor {
    background: rgba(255, 152, 0, 0.1);
    color: var(--td-warning-color);

    &:hover {
      background: rgba(255, 152, 0, 0.15);
    }
  }

  &.role-viewer {
    background: var(--td-bg-color-container-hover);
    color: var(--td-text-color-secondary);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes highlightFlash {
  0% {
    border-color: var(--td-brand-color);
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4);
    transform: scale(1);
  }
  50% {
    border-color: var(--td-brand-color);
    box-shadow: 0 0 0 8px rgba(14, 165, 233, 0);
    transform: scale(1.02);
  }
  100% {
    border-color: var(--td-brand-color);
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
    transform: scale(1);
  }
}

.kb-card.highlight-flash {
  animation: highlightFlash 0.6s ease-in-out 3;
  border-color: var(--td-brand-color) !important;
  box-shadow: 0 0 12px rgba(14, 165, 233, 0.3) !important;
}

.card-time {
  color: var(--td-text-color-placeholder);
  font-family: var(--app-font-family);
  font-size: 12px;
  font-weight: 400;
}


.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;

  .empty-img {
    width: 162px;
    height: 162px;
    margin-bottom: 20px;
  }

  .empty-txt {
    color: var(--td-text-color-placeholder);
    font-family: var(--app-font-family);
    font-size: 16px;
    font-weight: 600;
    line-height: 26px;
    margin-bottom: 8px;
  }

  .empty-desc {
    color: var(--td-text-color-disabled);
    font-family: var(--app-font-family);
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    margin-bottom: 0;
  }

  .empty-state-btn {
    margin-top: 20px;
  }
}

// 响应式布局
@media (min-width: 900px) {
  .kb-card-wrap {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1250px) {
  .kb-card-wrap {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1600px) {
  .kb-card-wrap {
    grid-template-columns: repeat(4, 1fr);
  }
}

// 删除确认对话框样式
:deep(.del-knowledge-dialog) {
  padding: 0px !important;
  border-radius: 6px !important;

  .t-dialog__header {
    display: none;
  }

  .t-dialog__body {
    padding: 16px;
  }

  .t-dialog__footer {
    padding: 0;
  }
}

:deep(.t-dialog__position.t-dialog--top) {
  padding-top: 40vh !important;
}

.circle-wrap {
  .dialog-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .circle-img {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  .circle-title {
    color: var(--td-text-color-primary);
    font-family: var(--app-font-family);
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .del-circle-txt {
    color: var(--td-text-color-placeholder);
    font-family: var(--app-font-family);
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    display: inline-block;
    margin-left: 29px;
    margin-bottom: 21px;
  }

  .circle-btn {
    height: 22px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .circle-btn-txt {
    color: var(--td-text-color-primary);
    font-family: var(--app-font-family);
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .confirm {
    color: var(--td-error-color);
    margin-left: 40px;

    &:hover {
      opacity: 0.8;
    }
  }
}

// Inbox card — pinned at the top of the personal tab; readable at a glance
// even on a dense library page.
.lib-grid--inbox {
  grid-template-columns: 1fr;
  margin-bottom: 12px;
}
.lib-card--inbox {
  border-color: rgba(96, 165, 250, 0.45);
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 65%);
  .lib-card-cover--inbox {
    background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  }
  .lib-cover-tag--inbox {
    background: rgba(255, 255, 255, 0.85);
    color: #1e3a8a;
    font-size: 18px;
    line-height: 1;
    padding: 4px 8px;
  }
}
</style>

<style lang="less">
/* 下拉菜单样式已统一至 @/assets/dropdown-menu.less */

// 共享知识库卡片：详情触发（替代三点，用「查看详情」链接样式）
.shared-detail-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--td-brand-color);
  font-size: 13px;
  font-family: var(--app-font-family);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  .t-icon {
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(14, 165, 233, 0.08);
    color: var(--td-brand-color);
  }
}

// 右侧滑出：共享知识库详情面板
.shared-detail-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.shared-detail-drawer {
  width: 360px;
  max-width: 90vw;
  height: 100%;
  background: var(--td-bg-color-container);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  font-family: var(--app-font-family);
}

.shared-detail-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--td-component-stroke);
  flex-shrink: 0;
}

.shared-detail-drawer-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.shared-detail-drawer-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--td-bg-color-secondarycontainer);
  color: var(--td-text-color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--td-bg-color-secondarycontainer);
    color: var(--td-text-color-primary);
  }
}

.shared-detail-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shared-detail-drawer-body .shared-detail-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shared-detail-drawer-body .shared-detail-label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  line-height: 1.4;
}

.shared-detail-drawer-body .shared-detail-value {
  font-size: 14px;
  color: var(--td-text-color-primary);
  line-height: 1.5;
  word-break: break-word;

  &.shared-detail-source-type {
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  &.shared-detail-org {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.shared-detail-drawer-body .shared-detail-org-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.shared-detail-drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--td-component-stroke);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  background: var(--td-bg-color-container);

  .go-to-kb-btn .t-button__text {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

// 右侧滑入动画
.shared-detail-drawer-enter-active,
.shared-detail-drawer-leave-active {
  transition: opacity 0.25s ease;

  .shared-detail-drawer {
    transition: transform 0.25s ease;
  }
}

.shared-detail-drawer-enter-from,
.shared-detail-drawer-leave-to {
  opacity: 0;

  .shared-detail-drawer {
    transform: translateX(100%);
  }
}

// 创建对话框样式优化
.create-kb-dialog {
  .t-form-item__label {
    font-family: var(--app-font-family);
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  .t-input,
  .t-textarea {
    font-family: var(--app-font-family);
  }

}
</style>
