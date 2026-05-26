<template>
  <div v-if="myTenants.length > 1" class="workspace-switcher" ref="switcherRef">
    <div class="workspace-trigger" @click="toggleDropdown">
      <div class="workspace-info">
        <div class="workspace-label">{{ $t('workspace.current') }}</div>
        <div class="workspace-name-row">
          <span class="workspace-name">{{ currentWorkspaceName }}</span>
          <t-icon name="swap" class="workspace-switch-icon" />
        </div>
      </div>
    </div>

    <Transition name="dropdown">
      <div v-if="showDropdown" class="workspace-dropdown" @click.stop>
        <div class="dropdown-header">
          <span class="dropdown-title">{{ $t('workspace.switch') }}</span>
        </div>
        <div class="workspace-list">
          <div
            v-for="m in myTenants"
            :key="m.tenant_id"
            :class="['workspace-item', { selected: isSelected(m.tenant_id) }]"
            @click="selectWorkspace(m)"
          >
            <div class="workspace-item-avatar" :class="{ active: isSelected(m.tenant_id) }">
              {{ workspaceName(m).charAt(0).toUpperCase() }}
            </div>
            <div class="workspace-item-info">
              <span class="workspace-item-name">{{ workspaceName(m) }}</span>
              <span class="workspace-item-role">{{ m.role }}</span>
            </div>
            <t-icon v-if="isSelected(m.tenant_id)" name="check" size="16px" class="check-icon" />
          </div>
        </div>
        <div class="dropdown-footer">
          <div class="join-btn" @click="showJoinDialog = true; showDropdown = false">
            <t-icon name="add" size="14px" />
            <span>{{ $t('workspace.join') }}</span>
          </div>
          <div class="join-btn" @click="goToSettings">
            <t-icon name="setting" size="14px" />
            <span>{{ $t('workspace.teamSettings') }}</span>
          </div>
        </div>
      </div>
    </Transition>
    <div v-if="showDropdown" class="workspace-overlay" @click="showDropdown = false" />

    <!-- Join by invite code dialog -->
    <t-dialog
      v-model:visible="showJoinDialog"
      :header="$t('workspace.joinByCode')"
      :confirm-btn="$t('common.confirm')"
      :cancel-btn="$t('common.cancel')"
      @confirm="handleJoin"
    >
      <t-input v-model="inviteCode" :placeholder="$t('workspace.inviteCodePlaceholder')" />
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { listMyTenants, joinTenantByInviteCode, type TenantMember } from '@/api/tenant'
import { useI18n } from 'vue-i18n'
import { MessagePlugin } from 'tdesign-vue-next'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const showDropdown = ref(false)
const showJoinDialog = ref(false)
const inviteCode = ref('')
const myTenants = ref<TenantMember[]>([])
const tenantNames = ref<Record<number, string>>({})

const toggleDropdown = () => { showDropdown.value = !showDropdown.value }

const defaultTenantId = computed(() => authStore.tenant?.id ? Number(authStore.tenant.id) : null)
const selectedTenantId = computed(() => authStore.selectedTenantId)
const currentTenantId = computed(() => selectedTenantId.value || defaultTenantId.value)

const workspaceName = (m: TenantMember) =>
  tenantNames.value[m.tenant_id] ||
  (m.tenant_id === defaultTenantId.value ? (authStore.tenant?.name || String(m.tenant_id)) : String(m.tenant_id))

const currentWorkspaceName = computed(() => {
  if (selectedTenantId.value && authStore.selectedTenantName) return authStore.selectedTenantName
  return authStore.tenant?.name || t('workspace.personal')
})

const isSelected = (tenantId: number) => currentTenantId.value === tenantId

const selectWorkspace = (m: TenantMember) => {
  showDropdown.value = false
  const name = workspaceName(m)
  if (m.tenant_id === defaultTenantId.value) {
    authStore.setSelectedTenant(null, null)
  } else {
    authStore.setSelectedTenant(m.tenant_id, name)
  }
  MessagePlugin.success(t('workspace.switchSuccess'))
  setTimeout(() => window.location.reload(), 300)
}

const handleJoin = async () => {
  if (!inviteCode.value.trim()) return
  const res = await joinTenantByInviteCode(inviteCode.value.trim())
  if (res.success) {
    MessagePlugin.success(t('workspace.joinSuccess'))
    showJoinDialog.value = false
    inviteCode.value = ''
    await loadMyTenants()
  } else {
    MessagePlugin.error(res.message || t('workspace.joinFailed'))
  }
}

const loadMyTenants = async () => {
  const res = await listMyTenants()
  if (res.success && res.data) {
    myTenants.value = res.data
  }
}

const goToSettings = () => {
  showDropdown.value = false
  router.push('/platform/workspace/settings')
}

onMounted(loadMyTenants)
</script>

<style scoped lang="less">
.workspace-switcher {
  position: relative;
  margin: 0 0 12px;
}

.workspace-trigger {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.2s;
  &:hover { background: var(--td-bg-color-container-hover); }
}

.workspace-info { flex: 1; min-width: 0; }
.workspace-label { font-size: 11px; color: var(--td-text-color-placeholder); margin-bottom: 2px; font-weight: 500; }
.workspace-name-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.workspace-name { font-size: 14px; font-weight: 600; color: var(--td-text-color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.workspace-switch-icon { font-size: 14px; color: var(--td-brand-color); flex-shrink: 0; }

.workspace-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999; }

.workspace-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: var(--td-bg-color-container);
  border: .5px solid var(--td-component-stroke);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header { padding: 10px 12px 6px; }
.dropdown-title { font-size: 12px; font-weight: 600; color: var(--td-text-color-secondary); }

.workspace-list { padding: 6px; max-height: 240px; overflow-y: auto; }

.workspace-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s;
  &:hover { background: var(--td-bg-color-secondarycontainer); }
  &.selected { background: rgba(14,165,233,0.08); .workspace-item-name { color: var(--td-brand-color); font-weight: 500; } }
}

.workspace-item-avatar {
  width: 32px; height: 32px; border-radius: 6px;
  background: var(--td-bg-color-secondarycontainer);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: var(--td-text-color-secondary); flex-shrink: 0;
  &.active { background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-active) 100%); color: var(--td-text-color-anti); }
}

.workspace-item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.workspace-item-name { font-size: 13px; color: var(--td-text-color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.workspace-item-role { font-size: 11px; color: var(--td-text-color-placeholder); }
.check-icon { color: var(--td-brand-color); flex-shrink: 0; }

.dropdown-footer { padding: 6px 12px 10px; border-top: .5px solid var(--td-component-stroke); }
.join-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 8px; border-radius: 6px; cursor: pointer;
  font-size: 13px; color: var(--td-text-color-secondary);
  transition: all 0.15s;
  &:hover { background: var(--td-bg-color-secondarycontainer); color: var(--td-brand-color); }
}

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
