<template>
  <div class="team-settings">
    <div class="page-header">
      <h2>{{ $t('workspace.teamSettings') }}</h2>
      <p class="subtitle">{{ currentWorkspaceName }}</p>
    </div>

    <!-- Invite code section -->
    <div class="section">
      <div class="section-title">{{ $t('workspace.inviteCode') }}</div>
      <div class="invite-row">
        <t-input v-model="inviteCode" readonly :placeholder="$t('workspace.noInviteCode')" class="invite-input" />
        <t-button @click="copyInviteCode" :disabled="!inviteCode" variant="outline">{{ $t('common.copy') }}</t-button>
        <t-button @click="generateCode" :loading="generating" theme="primary">{{ $t('workspace.generateCode') }}</t-button>
      </div>
    </div>

    <!-- Members section -->
    <div class="section">
      <div class="section-title">{{ $t('workspace.members') }}</div>
      <t-loading v-if="loadingMembers" />
      <div v-else class="member-list">
        <div v-for="m in members" :key="m.id" class="member-row">
          <div class="member-info">
            <div class="member-avatar">{{ (m.username || m.user_id).charAt(0).toUpperCase() }}</div>
            <div>
              <div class="member-name">{{ m.username || m.user_id }}</div>
              <div class="member-role">{{ m.role }}</div>
            </div>
          </div>
          <div class="member-actions" v-if="isAdminOrOwner && m.role !== 'owner'">
            <t-dropdown :options="roleOptions" @click="(opt: any) => changeRole(m, opt.value)" trigger="click">
              <t-button size="small" variant="outline">{{ $t('workspace.changeRole') }}</t-button>
            </t-dropdown>
            <t-button size="small" theme="danger" variant="outline" @click="removeMember(m)">{{ $t('workspace.remove') }}</t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave workspace -->
    <div class="section danger-zone" v-if="!isOwner">
      <div class="section-title">{{ $t('workspace.dangerZone') }}</div>
      <t-button theme="danger" variant="outline" @click="leaveWorkspace">{{ $t('workspace.leave') }}</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { listTenantMembers, generateTenantInviteCode, leaveTenant, type TenantMember } from '@/api/tenant'
import { get } from '@/utils/request'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const tenantId = computed(() => authStore.effectiveTenantId as number)
const currentWorkspaceName = computed(() => authStore.selectedTenantName || authStore.tenant?.name || '')

interface MemberWithUser extends TenantMember { username?: string }

const members = ref<MemberWithUser[]>([])
const loadingMembers = ref(false)
const inviteCode = ref('')
const generating = ref(false)

const myMember = computed(() => members.value.find(m => m.user_id === authStore.user?.id))
const isOwner = computed(() => myMember.value?.role === 'owner')
const isAdminOrOwner = computed(() => myMember.value?.role === 'owner' || myMember.value?.role === 'admin')

const roleOptions = [
  { content: 'admin', value: 'admin' },
  { content: 'member', value: 'member' },
]

const loadMembers = async () => {
  loadingMembers.value = true
  const res = await listTenantMembers(tenantId.value)
  if (res.success && res.data) {
    members.value = res.data
  }
  loadingMembers.value = false
}

const generateCode = async () => {
  generating.value = true
  const res = await generateTenantInviteCode(tenantId.value)
  if (res.success && res.data) {
    inviteCode.value = res.data.invite_code
    MessagePlugin.success(t('workspace.codeGenerated'))
  } else {
    MessagePlugin.error(res.message || t('workspace.generateFailed'))
  }
  generating.value = false
}

const copyInviteCode = () => {
  navigator.clipboard.writeText(inviteCode.value)
  MessagePlugin.success(t('common.copied'))
}

const changeRole = async (m: MemberWithUser, role: string) => {
  const res = await get(`/api/v1/tenants/${tenantId.value}/members/${m.user_id}/role`, { method: 'PUT', body: JSON.stringify({ role }) })
  if ((res as any).success) {
    m.role = role
    MessagePlugin.success(t('workspace.roleUpdated'))
  }
}

const removeMember = (m: MemberWithUser) => {
  DialogPlugin.confirm({
    header: t('workspace.confirmRemove'),
    body: m.username || m.user_id,
    onConfirm: async () => {
      const res = await get(`/api/v1/tenants/${tenantId.value}/members/${m.user_id}`, { method: 'DELETE' })
      if ((res as any).success) {
        members.value = members.value.filter(x => x.id !== m.id)
        MessagePlugin.success(t('workspace.memberRemoved'))
      }
    }
  })
}

const leaveWorkspace = () => {
  DialogPlugin.confirm({
    header: t('workspace.confirmLeave'),
    body: currentWorkspaceName.value,
    onConfirm: async () => {
      const res = await leaveTenant(tenantId.value)
      if (res.success) {
        authStore.setSelectedTenant(null, null)
        MessagePlugin.success(t('workspace.leftSuccess'))
        router.push('/platform/knowledge-bases')
        setTimeout(() => window.location.reload(), 300)
      } else {
        MessagePlugin.error(res.message || t('workspace.leaveFailed'))
      }
    }
  })
}

onMounted(loadMembers)
</script>

<style scoped lang="less">
.team-settings {
  padding: 32px;
  max-width: 720px;
}

.page-header {
  margin-bottom: 32px;
  h2 { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
  .subtitle { color: var(--td-text-color-secondary); font-size: 14px; }
}

.section {
  margin-bottom: 32px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 6px -2px rgba(15, 23, 42, 0.04);
}

.section-title {
  font-size: 14px; font-weight: 600; margin-bottom: 16px;
  color: var(--td-text-color-primary);
}

.invite-row {
  display: flex; gap: 8px; align-items: center;
  .invite-input { flex: 1; }
}

.member-list { display: flex; flex-direction: column; gap: 12px; }

.member-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--td-component-stroke);
  &:last-child { border-bottom: none; }
}

.member-info { display: flex; align-items: center; gap: 12px; }

.member-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px;
}

.member-name { font-size: 14px; font-weight: 500; }
.member-role { font-size: 12px; color: var(--td-text-color-secondary); }

.member-actions { display: flex; gap: 8px; }

.danger-zone { border-color: var(--td-error-color-light); }
</style>
