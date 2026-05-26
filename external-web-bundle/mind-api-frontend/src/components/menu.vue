<template>
    <!-- Two-layer navigation: Icon Rail + Secondary Panel -->
    <div class="nav-container" :class="{ 'nav-container--collapsed': uiStore.sidebarCollapsed }">
        
        <!-- Icon Rail (~112px / 7rem) -->
        <aside class="icon-rail" :class="{ 'icon-rail--collapsed': uiStore.sidebarCollapsed }">
            <!-- macOS traffic light spacer -->
            <div v-if="isWailsDesktop" class="traffic-light-spacer"></div>
            
            <!-- Avatar button -->
            <button
                type="button"
                class="rail-avatar"
                :class="{ 'rail-avatar--active': activeRailTab === 'me' }"
                @click="activeRailTab = 'me'"
                :title="authStore.user?.username || 'Me'"
            >
                {{ avatarInitial }}
            </button>

            <!-- Main nav tabs -->
            <nav class="rail-nav">
                <button
                    v-for="tab in railTabs"
                    :key="tab.id"
                    type="button"
                    class="rail-tab"
                    :class="{ 'rail-tab--active': activeRailTab === tab.id }"
                    @click="handleRailTabClick(tab.id)"
                    :title="tab.label"
                >
                    <span class="rail-icon-circle" :class="{ 'rail-icon-circle--active': activeRailTab === tab.id }">
                        <img class="rail-icon" :src="getImgSrc(activeRailTab === tab.id ? tab.iconActive : tab.icon)" alt="">
                    </span>
                    <span class="rail-label">{{ tab.label }}</span>
                </button>
            </nav>

            <!-- Bottom items: Settings and About -->
            <div class="rail-bottom">
                <button
                    type="button"
                    class="rail-tab"
                    :class="{ 'rail-tab--active': activeRailTab === 'settings' }"
                    @click="handleRailTabClick('settings')"
                    :title="t('menu.settings')"
                >
                    <span class="rail-icon-circle" :class="{ 'rail-icon-circle--active': activeRailTab === 'settings' }">
                        <img class="rail-icon" :src="getImgSrc(settingIcon)" alt="">
                    </span>
                    <span class="rail-label">{{ t('menu.settings') }}</span>
                </button>
                <button
                    type="button"
                    class="rail-tab"
                    :class="{ 'rail-tab--active': activeRailTab === 'about' }"
                    @click="handleRailTabClick('about')"
                    title="About Mindar"
                >
                    <span class="rail-icon-circle rail-icon-circle--logo" :class="{ 'rail-icon-circle--active': activeRailTab === 'about' }">
                        <img class="rail-mindar-logo" src="/mindar-logo.png" alt="Mindar" />
                    </span>
                    <span class="rail-label rail-label--multiline">About<br>Mindar</span>
                </button>
            </div>

            <!-- Collapse/expand toggle (only when expanded) -->
            <div v-if="!uiStore.sidebarCollapsed" class="rail-collapse-toggle" @click="uiStore.toggleSidebar" :title="t('menu.collapseSidebar')">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="17" height="17" rx="3" stroke="currentColor" stroke-width="1.2" />
                    <line x1="7.5" y1="1.5" x2="7.5" y2="18.5" stroke="currentColor" stroke-width="1.2" />
                    <line x1="4" y1="7.5" x2="4" y2="12.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
            </div>
        </aside>

        <!-- Drag handle for collapsed state -->
        <div v-if="uiStore.sidebarCollapsed"
             class="sidebar-drag-handle"
             @mousedown="onDragHandleMouseDown" />

        <!-- Secondary Panel (~248px / 15.5rem) -->
        <aside v-if="!uiStore.sidebarCollapsed" class="secondary-panel">
            <!-- Panel header with workspace switcher -->
            <div class="panel-header">
                <TenantSelector v-if="canAccessAllTenants" />
                <WorkspaceSwitcher v-else />
            </div>

            <!-- Search (⌘K) -->
            <div class="panel-search" @click="commandPaletteStore.openPalette('')">
                <div class="panel-search-inner">
                    <img class="panel-search-icon" :src="getImgSrc('search.svg')" alt="">
                    <span class="panel-search-text">{{ t('menu.search') }}</span>
                    <span class="panel-search-hint">
                        <kbd>{{ cmdModKeyLabel }}</kbd><kbd>K</kbd>
                    </span>
                </div>
            </div>

            <!-- Panel content based on active rail tab -->
            <div class="panel-content">
                <!-- Chat sessions list (shown for agent tab) -->
                <div v-if="activeRailTab === 'agent'" class="panel-section">
                    <div class="panel-section-header">
                        <span class="panel-section-title">{{ t('menu.conversations') }}</span>
                        <t-icon v-if="!batchMode" name="add" class="panel-section-action" @click="gotopage('creatChat')" />
                        <span v-else class="batch-cancel-hint" @click="exitBatchMode">{{ t('batchManage.cancel') }}</span>
                    </div>

                    <!-- Session list with scroll -->
                    <div ref="submenuscrollContainer" @scroll="handleScroll" class="session-list">
                        <!-- Skeleton loading -->
                        <template v-if="loading && groupedSessions.length === 0">
                            <div v-for="n in 5" :key="'skel-'+n" class="session-item-wrapper">
                                <t-skeleton animation="gradient" style="margin-left:12px;width:85%" :row-col="[{ width: '100%', height: '16px' }]" />
                            </div>
                        </template>

                        <!-- Grouped sessions -->
                        <template v-for="(group, groupIndex) in groupedSessions" :key="groupIndex">
                            <div class="session-group-header">{{ group.label }}</div>
                            <div
                                v-for="(session, sessionIndex) in group.items"
                                :key="session.id"
                                class="session-item-wrapper"
                            >
                                <div
                                    class="session-item"
                                    :class="{
                                        'session-item--active': !batchMode && currentSecondpath === session.path,
                                        'session-item--selected': batchMode && batchSelectedIds.includes(session.id),
                                        'session-item--batch': batchMode
                                    }"
                                    @mouseenter="mouseenteBotDownr(session.id)"
                                    @mouseleave="mouseleaveBotDown"
                                    @click="batchMode ? toggleBatchSelect(session.id) : gotopage(session.path)"
                                >
                                    <t-checkbox
                                        v-if="batchMode"
                                        class="batch-checkbox"
                                        :checked="batchSelectedIds.includes(session.id)"
                                        @click.stop
                                        @change="toggleBatchSelect(session.id)"
                                    />
                                    <span class="session-title" :style="batchMode ? 'margin-left:4px;' : ''">
                                        <t-icon v-if="session.is_pinned" name="pin" class="session-pin-icon" :title="t('menu.pinned')" />
                                        <img
                                            v-if="session.im_platform && platformLogo(session.im_platform)"
                                            :src="platformLogo(session.im_platform)"
                                            :alt="session.im_platform"
                                            :title="session.im_platform"
                                            class="session-source-icon"
                                        />
                                        {{ session.title }}
                                    </span>
                                    <t-dropdown
                                        v-if="!batchMode"
                                        :options="buildSessionMenuOptions(session)"
                                        @click="handleSessionMenuClick($event, session.originalIndex, session)"
                                        placement="bottom-right"
                                        trigger="click"
                                    >
                                        <div @click.stop class="session-more-wrap">
                                            <t-icon name="ellipsis" class="session-more" />
                                        </div>
                                    </t-dropdown>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Batch footer -->
                    <div v-if="batchMode" class="batch-inline-footer">
                        <div class="batch-footer-left">
                            <t-checkbox
                                :checked="isAllBatchSelected"
                                :indeterminate="isBatchIndeterminate"
                                @change="toggleBatchSelectAll"
                            >
                                {{ t('batchManage.selectAll') }}
                            </t-checkbox>
                        </div>
                        <t-button
                            size="small"
                            theme="danger"
                            variant="base"
                            :disabled="batchSelectedIds.length === 0"
                            :loading="batchDeleting"
                            @click="handleInlineBatchDelete"
                        >
                            {{ t('batchManage.delete') }}{{ batchSelectedIds.length > 0 ? `(${batchDisplayCount})` : '' }}
                        </t-button>
                    </div>
                </div>

                <!-- Other rail tabs: show simple nav list -->
                <div v-else class="panel-section">
                    <div
                        v-for="item in getSecondaryNavItems(activeRailTab)"
                        :key="item.path"
                        class="panel-nav-item"
                        :class="{ 'panel-nav-item--active': isMenuItemActive(item.path) }"
                        @click="handleMenuClick(item.path)"
                    >
                        <div class="panel-nav-icon">
                            <img class="icon" :src="getImgSrc(getItemIcon(item))" alt="">
                        </div>
                        <span class="panel-nav-title">{{ item.title }}</span>
                        <span v-if="item.path === 'organizations' && orgStore.totalPendingJoinRequestCount > 0" class="panel-nav-badge">
                            {{ orgStore.totalPendingJoinRequestCount }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- User menu at bottom -->
            <div class="panel-footer">
                <UserMenu />
            </div>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, watch, computed, ref, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSessionsList, delSession, batchDelSessions, deleteAllSessions, clearSessionMessages, pinSession, unpinSession } from "@/api/chat/index";
import { getKnowledgeBaseById } from '@/api/knowledge-base';
import { logout as logoutApi } from '@/api/auth';
import { useMenuStore } from '@/stores/menu';
import { useAuthStore } from '@/stores/auth';
import { useOrganizationStore } from '@/stores/organization';
import { useUIStore } from '@/stores/ui';
import { useCommandPaletteStore } from '@/stores/commandPalette';
import { MessagePlugin, DialogPlugin, Icon as TIcon } from "tdesign-vue-next";
import UserMenu from '@/components/UserMenu.vue';
import TenantSelector from '@/components/TenantSelector.vue';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher.vue';
import { useI18n } from 'vue-i18n';
import { getSystemInfo } from '@/api/system';
import wecomLogo from '@/assets/img/im/wecom.svg';
import feishuLogo from '@/assets/img/im/feishu.svg';
import slackLogo from '@/assets/img/im/slack.svg';
import telegramLogo from '@/assets/img/im/telegram.svg';
import dingtalkLogo from '@/assets/img/im/dingtalk.svg';
import mattermostLogo from '@/assets/img/im/mattermost.svg';
import wechatLogo from '@/assets/img/im/wechat.svg';

const PLATFORM_LOGO: Record<string, string> = {
    wecom: wecomLogo,
    feishu: feishuLogo,
    slack: slackLogo,
    telegram: telegramLogo,
    dingtalk: dingtalkLogo,
    mattermost: mattermostLogo,
    wechat: wechatLogo,
};
const platformLogo = (p: string): string => (p ? PLATFORM_LOGO[p] || '' : '');

const { t } = useI18n();
const usemenuStore = useMenuStore();
const authStore = useAuthStore();
const orgStore = useOrganizationStore();
const uiStore = useUIStore();
const commandPaletteStore = useCommandPaletteStore();

const isMacLike = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');
const cmdModKeyLabel = isMacLike ? '⌘' : 'Ctrl';
// @ts-ignore
const isWailsDesktop = typeof window !== 'undefined' && !!(window as any).runtime?.EventsOn;

const route = useRoute();
const router = useRouter();
const currentpath = ref('');
const currentPage = ref(1);
const page_size = ref(30);
const total = ref(0);
const currentSecondpath = ref('');
const submenuscrollContainer = ref(null);
const totalPages = computed(() => Math.ceil(total.value / page_size.value));
const hasMore = computed(() => currentPage.value < totalPages.value);
type MenuItem = { title: string; icon: string; path: string; childrenPath?: string; children?: any[] };
const { menuArr, visibleMenuArr } = storeToRefs(usemenuStore);
let activeSubmenu = ref<string>('');
const isLiteEdition = ref(false);

// Active rail tab — derived from current route
const activeRailTab = ref<string>('chat');

// Batch management
const batchMode = ref(false);
const batchSelectedIds = ref<string[]>([]);
const batchDeleting = ref(false);

const allSessionIds = computed(() => {
    const chatMenu = (menuArr.value as unknown as MenuItem[]).find((item: MenuItem) => item.path === 'creatChat');
    if (!chatMenu?.children) return [];
    return (chatMenu.children as any[]).map((s: any) => s.id);
});

const isAllBatchSelected = computed(() =>
    allSessionIds.value.length > 0 && batchSelectedIds.value.length === allSessionIds.value.length
);
const isBatchIndeterminate = computed(() =>
    batchSelectedIds.value.length > 0 && batchSelectedIds.value.length < allSessionIds.value.length
);
const batchDisplayCount = computed(() =>
    isAllBatchSelected.value ? total.value : batchSelectedIds.value.length
);

const canAccessAllTenants = computed(() => authStore.canAccessAllTenants);

const isInKnowledgeBase = computed<boolean>(() =>
    route.name === 'knowledgeBaseDetail' || route.name === 'kbCreatChat' || route.name === 'knowledgeBaseSettings'
);

// Avatar initial from user name
const avatarInitial = computed(() => {
    const name = authStore.user?.username || authStore.user?.email || 'U';
    return name.charAt(0).toUpperCase();
});

// Rail tabs definition — fixed structure matching web prototype
const railTabs = computed(() => [
    { id: 'library', label: t('menu.library') || '知识库', icon: 'zhishiku.svg', iconActive: 'zhishiku-green.svg' },
    { id: 'plaza', label: t('menu.plaza') || '探索广场', icon: 'prefixIcon.svg', iconActive: 'prefixIcon-green.svg' },
    { id: 'agent', label: t('menu.agent') || '智能体', icon: 'agent.svg', iconActive: 'agent-green.svg' },
    { id: 'credits', label: t('menu.credits') || '额度', icon: 'prefixIcon.svg', iconActive: 'prefixIcon-green.svg' },
]);

// Secondary nav items for non-chat tabs
const getSecondaryNavItems = (tabId: string): MenuItem[] => {
    if (tabId === 'chat') return [];
    return (visibleMenuArr.value as unknown as MenuItem[]).filter((item: MenuItem) => item.path === tabId);
};

// Determine active rail tab from route
const syncRailTabFromRoute = (routeName: string) => {
    if (routeName === 'knowledgeBaseList' || routeName === 'knowledgeBaseDetail' || routeName === 'knowledgeBaseSettings') {
        activeRailTab.value = 'library';
    } else if (routeName === 'agentList' || routeName === 'globalCreatChat' || routeName === 'kbCreatChat') {
        activeRailTab.value = 'agent';
    } else if (routeName === 'settings') {
        activeRailTab.value = 'settings';
    } else {
        activeRailTab.value = 'agent';
    }
};

const isMenuItemActive = (itemPath: string): boolean => {
    const currentRoute = route.name;
    switch (itemPath) {
        case 'knowledge-bases':
            return currentRoute === 'knowledgeBaseList' || currentRoute === 'knowledgeBaseDetail' || currentRoute === 'knowledgeBaseSettings';
        case 'agents':
            return currentRoute === 'agentList';
        case 'organizations':
            return currentRoute === 'organizationList';
        case 'insights':
            return currentRoute === 'insights';
        case 'notes':
            return currentRoute === 'notesList';
        case 'recordings':
            return currentRoute === 'recordings';
        case 'creatChat':
            return currentRoute === 'kbCreatChat' || currentRoute === 'globalCreatChat';
        case 'settings':
            return currentRoute === 'settings';
        default:
            return itemPath === currentpath.value;
    }
};

// Icon helpers
let knowledgeIcon = ref('zhishiku-green.svg');
let settingIcon = ref('setting.svg');
let agentIcon = ref('agent.svg');
let organizationIcon = ref('organization.svg');
let insightsIconActive = ref(false);

const getItemIcon = (item: MenuItem): string => {
    if (item.path === 'knowledge-bases') return isMenuItemActive('knowledge-bases') ? 'zhishiku-green.svg' : 'zhishiku.svg';
    if (item.path === 'agents') return isMenuItemActive('agents') ? 'agent-green.svg' : 'agent.svg';
    if (item.path === 'organizations') return isMenuItemActive('organizations') ? 'organization-green.svg' : 'organization.svg';
    if (item.path === 'settings') return isMenuItemActive('settings') ? 'setting-green.svg' : 'setting.svg';
    return item.icon || 'prefixIcon.svg';
};

const getIcon = (path: string) => {
    const kbActive = path === 'knowledge-bases' || route.name === 'knowledgeBaseList' || route.name === 'knowledgeBaseDetail' || route.name === 'knowledgeBaseSettings';
    const agentsActive = route.name === 'agentList';
    const organizationsActive = route.name === 'organizationList';
    const insightsActive = route.name === 'insights';
    insightsIconActive.value = insightsActive;
    knowledgeIcon.value = kbActive ? 'zhishiku-green.svg' : 'zhishiku.svg';
    agentIcon.value = agentsActive ? 'agent-green.svg' : 'agent.svg';
    organizationIcon.value = organizationsActive ? 'organization-green.svg' : 'organization.svg';
    settingIcon.value = route.name === 'settings' ? 'setting-green.svg' : 'setting.svg';
};

const handleRailTabClick = (tabId: string) => {
    activeRailTab.value = tabId;
    if (tabId === 'settings') {
        uiStore.openSettings();
        router.push('/platform/settings');
    } else if (tabId === 'agent' || tabId === 'chat') {
        router.push('/platform/creatChat');
    } else if (tabId === 'library') {
        router.push('/platform/knowledge-bases');
    } else if (tabId === 'about') {
        router.push('/landing');
    } else if (tabId === 'plaza' || tabId === 'credits') {
        // Not yet implemented
    } else {
        handleMenuClick(tabId);
    }
};

// Time grouping
const getTimeCategory = (dateStr: string): string => {
    if (!dateStr) return t('time.earlier');
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (sessionDate.getTime() >= today.getTime()) return t('time.today');
    else if (sessionDate.getTime() >= yesterday.getTime()) return t('time.yesterday');
    else if (date.getTime() >= sevenDaysAgo.getTime()) return t('time.last7Days');
    else if (date.getTime() >= thirtyDaysAgo.getTime()) return t('time.last30Days');
    else if (date.getTime() >= oneYearAgo.getTime()) return t('time.lastYear');
    else return t('time.earlier');
};

const groupedSessions = computed(() => {
    const chatMenu = (menuArr.value as unknown as MenuItem[]).find((item: MenuItem) => item.path === 'creatChat');
    if (!chatMenu || !chatMenu.children || chatMenu.children.length === 0) return [];
    const pinnedLabel = t('time.pinned');
    const groups: { [key: string]: any[] } = {
        [pinnedLabel]: [],
        [t('time.today')]: [],
        [t('time.yesterday')]: [],
        [t('time.last7Days')]: [],
        [t('time.last30Days')]: [],
        [t('time.lastYear')]: [],
        [t('time.earlier')]: []
    };
    (chatMenu.children as any[]).forEach((session: any, index: number) => {
        const withIndex = { ...session, originalIndex: index };
        if (session.is_pinned) { groups[pinnedLabel].push(withIndex); return; }
        const category = getTimeCategory(session.updated_at || session.created_at);
        groups[category].push(withIndex);
    });
    const orderedLabels = [pinnedLabel, t('time.today'), t('time.yesterday'), t('time.last7Days'), t('time.last30Days'), t('time.lastYear'), t('time.earlier')];
    return orderedLabels.filter(label => groups[label].length > 0).map(label => ({ label, items: groups[label] }));
});

const loading = ref(false);
const mouseenteBotDownr = (val: string) => { activeSubmenu.value = val; };
const mouseleaveBotDown = () => { activeSubmenu.value = ''; };

const enterBatchMode = () => { batchMode.value = true; batchSelectedIds.value = []; };
const exitBatchMode = () => { batchMode.value = false; batchSelectedIds.value = []; };
const toggleBatchSelect = (id: string) => {
    const idx = batchSelectedIds.value.indexOf(id);
    if (idx > -1) batchSelectedIds.value.splice(idx, 1);
    else batchSelectedIds.value.push(id);
};
const toggleBatchSelectAll = (checked: boolean) => {
    batchSelectedIds.value = checked ? [...allSessionIds.value] : [];
};

const handleInlineBatchDelete = () => {
    if (batchSelectedIds.value.length === 0) return;
    const isDeleteAll = isAllBatchSelected.value;
    const displayCount = batchDisplayCount.value;
    const confirmDialog = DialogPlugin.confirm({
        header: t('batchManage.deleteConfirmTitle'),
        body: isDeleteAll
            ? t('batchManage.deleteAllConfirmBody') || t('batchManage.deleteConfirmBody', { count: displayCount })
            : t('batchManage.deleteConfirmBody', { count: displayCount }),
        confirmBtn: { content: t('batchManage.delete'), theme: 'danger' as const },
        cancelBtn: t('batchManage.cancel'),
        theme: 'warning',
        onConfirm: async () => {
            batchDeleting.value = true;
            try {
                let res: any;
                if (isDeleteAll) res = await deleteAllSessions();
                else res = await batchDelSessions([...batchSelectedIds.value]);
                if (res && res.success === true) {
                    const chatMenuItem = (menuArr.value as any[]).find((m: any) => m.path === 'creatChat');
                    if (isDeleteAll) {
                        if (chatMenuItem) chatMenuItem.children = [];
                        total.value = 0;
                    } else {
                        const ids = [...batchSelectedIds.value];
                        if (chatMenuItem && chatMenuItem.children) {
                            for (const id of ids) {
                                const idx = chatMenuItem.children.findIndex((s: any) => s.id === id);
                                if (idx !== -1) chatMenuItem.children.splice(idx, 1);
                            }
                        }
                        total.value = Math.max(0, total.value - ids.length);
                    }
                    const currentChatId = route.params.chatid as string;
                    if (currentChatId && (isDeleteAll || batchSelectedIds.value.includes(currentChatId))) {
                        router.push('/platform/creatChat');
                    }
                    batchSelectedIds.value = [];
                    MessagePlugin.success(t('batchManage.deleteSuccess'));
                    exitBatchMode();
                } else {
                    MessagePlugin.error(t('batchManage.deleteFailed'));
                }
            } catch {
                MessagePlugin.error(t('batchManage.deleteFailed'));
            }
            batchDeleting.value = false;
            confirmDialog.destroy();
        },
    });
};

const handleSessionMenuClick = (data: { value: string }, index: number, item: any) => {
    if (data?.value === 'delete') delCard(index, item);
    else if (data?.value === 'clearMessages') clearMessages(item);
    else if (data?.value === 'batchManage') enterBatchMode();
    else if (data?.value === 'pin' || data?.value === 'unpin') togglePin(item, data.value === 'pin');
};

const buildSessionMenuOptions = (item: any) => {
    const options: any[] = [];
    if (item.is_pinned) {
        options.push({ content: t('menu.unpin'), value: 'unpin', prefixIcon: () => h(TIcon, { name: 'pin', size: '16px' }) });
    } else {
        options.push({ content: t('menu.pin'), value: 'pin', prefixIcon: () => h(TIcon, { name: 'pin', size: '16px' }) });
    }
    options.push(
        { content: t('menu.clearMessages'), value: 'clearMessages', prefixIcon: () => h(TIcon, { name: 'clear', size: '16px' }) },
        { content: t('menu.batchManage'), value: 'batchManage', prefixIcon: () => h(TIcon, { name: 'queue', size: '16px' }) },
        { content: t('upload.deleteRecord'), value: 'delete', theme: 'error', prefixIcon: () => h(TIcon, { name: 'delete', size: '16px' }) },
    );
    return options;
};

const togglePin = (item: any, pin: boolean) => {
    if (pinningIds.value.has(item.id)) return;
    pinningIds.value.add(item.id);
    const call = pin ? pinSession(item.id) : unpinSession(item.id);
    call.then((res: any) => {
        if (res && res.success) {
            const chatMenu = (menuArr.value as any[]).find((m: any) => m.path === 'creatChat');
            const idx = chatMenu?.children?.findIndex((s: any) => s.id === item.id) ?? -1;
            if (idx >= 0) {
                const target = chatMenu.children[idx];
                target.is_pinned = pin;
                target.pinned_at = pin ? new Date().toISOString() : null;
                if (pin && idx > 0) {
                    chatMenu.children.splice(idx, 1);
                    chatMenu.children.unshift(target);
                }
            }
        } else {
            MessagePlugin.error(pin ? t('menu.pinFailed') : t('menu.unpinFailed'));
        }
    }).catch(() => {
        MessagePlugin.error(pin ? t('menu.pinFailed') : t('menu.unpinFailed'));
    }).finally(() => {
        pinningIds.value.delete(item.id);
    });
};

const clearMessages = (item: any) => {
    clearSessionMessages(item.id).then((res: any) => {
        if (res && res.success) {
            MessagePlugin.success(t('menu.clearMessagesSuccess'));
            if (item.id === route.params.chatid) {
                window.dispatchEvent(new CustomEvent('session-messages-cleared', { detail: { sessionId: item.id } }));
            }
        } else {
            MessagePlugin.error(t('menu.clearMessagesFailed'));
        }
    }).catch(() => {
        MessagePlugin.error(t('menu.clearMessagesFailed'));
    });
};

const delCard = (index: number, item: any) => {
    delSession(item.id).then((res: any) => {
        if (res && (res as any).success) {
            const chatMenuItem = (menuArr.value as any[]).find((m: any) => m.path === 'creatChat');
            if (chatMenuItem && chatMenuItem.children) {
                const actualIndex = chatMenuItem.children.findIndex((s: any) => s.id === item.id);
                if (actualIndex !== -1) chatMenuItem.children.splice(actualIndex, 1);
            }
            if (item.id == route.params.chatid) router.push('/platform/creatChat');
            if (total.value > 0) total.value--;
        } else {
            MessagePlugin.error(t('chat.deleteSessionFailed'));
        }
    });
};

const pinningIds = ref<Set<string>>(new Set());
const currentKbName = ref<string>('');
const currentKbInfo = ref<any>(null);

const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const checkScrollBottom = () => {
    const container = submenuscrollContainer.value;
    if (!container || !(container as any)[0]) return;
    const { scrollTop, scrollHeight, clientHeight } = (container as any)[0];
    if (scrollHeight - (scrollTop + clientHeight) < 100 && hasMore.value && !loading.value) {
        currentPage.value++;
        getMessageList(true);
    }
};
const handleScroll = debounce(checkScrollBottom, 200);

const getMessageList = async (isLoadMore = false) => {
    if (loading.value) return Promise.resolve();
    loading.value = true;
    if (!isLoadMore) {
        currentPage.value = 1;
        usemenuStore.clearMenuArr();
    }
    return getSessionsList(currentPage.value, page_size.value).then((res: any) => {
        if (res.data && res.data.length) {
            res.data.forEach((item: any) => {
                usemenuStore.updatemenuArr({
                    title: item.title ? item.title : t('menu.newSession'),
                    path: `chat/${item.id}`,
                    id: item.id,
                    isMore: false,
                    isNoTitle: item.title ? false : true,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    is_pinned: !!item.is_pinned,
                    pinned_at: item.pinned_at || null,
                    im_platform: item.im_platform || '',
                });
            });
        }
        if ((res as any).total) total.value = (res as any).total;
        loading.value = false;
    }).catch(() => { loading.value = false; });
};

onMounted(async () => {
    const routeName = typeof route.name === 'string' ? route.name : (route.name ? String(route.name) : '');
    currentpath.value = routeName;
    if (route.params.chatid) currentSecondpath.value = `chat/${route.params.chatid}`;
    syncRailTabFromRoute(routeName);
    isLiteEdition.value = authStore.isLiteMode;
    getSystemInfo().then(res => {
        if (res.data?.edition === 'lite') {
            isLiteEdition.value = true;
            authStore.setLiteMode(true);
        }
    }).catch(() => {});
    const kbId = (route.params as any)?.kbId as string;
    if (kbId && isInKnowledgeBase.value) {
        try {
            const kbRes: any = await getKnowledgeBaseById(kbId);
            if (kbRes?.data) { currentKbName.value = kbRes.data.name || ''; currentKbInfo.value = kbRes.data; }
        } catch {}
    }
    getMessageList();
    if (orgStore.organizations.length === 0) orgStore.fetchOrganizations();
});

watch([() => route.name, () => route.params], (newvalue, oldvalue) => {
    const nameStr = typeof newvalue[0] === 'string' ? (newvalue[0] as string) : (newvalue[0] ? String(newvalue[0]) : '');
    currentpath.value = nameStr;
    if (newvalue[1].chatid) currentSecondpath.value = `chat/${newvalue[1].chatid}`;
    else currentSecondpath.value = '';
    syncRailTabFromRoute(nameStr);
    const oldRouteNameStr = typeof oldvalue?.[0] === 'string' ? (oldvalue[0] as string) : (oldvalue?.[0] ? String(oldvalue[0]) : '');
    const isCreatingNewSession = (oldRouteNameStr === 'globalCreatChat' || oldRouteNameStr === 'kbCreatChat') &&
                                 nameStr !== 'globalCreatChat' && nameStr !== 'kbCreatChat';
    if (isCreatingNewSession) getMessageList();
    getIcon(nameStr);
    if (newvalue[1].kbId !== oldvalue?.[1]?.kbId) {
        const kbId = (newvalue[1] as any)?.kbId as string;
        if (kbId && isInKnowledgeBase.value) {
            getKnowledgeBaseById(kbId).then((kbRes: any) => {
                if (kbRes?.data) { currentKbName.value = kbRes.data.name || ''; currentKbInfo.value = kbRes.data; }
            }).catch(() => { currentKbInfo.value = null; });
        } else {
            currentKbName.value = '';
            currentKbInfo.value = null;
        }
    }
});

getIcon(typeof route.name === 'string' ? route.name as string : (route.name ? String(route.name) : ''));

const handleMenuClick = async (path: string) => {
    if (path === 'knowledge-bases') {
        const kbId = await getCurrentKbId();
        if (kbId) router.push(`/platform/knowledge-bases/${kbId}`);
        else router.push('/platform/knowledge-bases');
    } else if (path === 'agents') {
        router.push('/platform/agents');
    } else if (path === 'organizations') {
        router.push('/platform/organizations');
    } else if (path === 'insights') {
        router.push('/platform/insights');
    } else if (path === 'notes') {
        router.push('/platform/notes');
    } else if (path === 'recordings') {
        router.push('/platform/recordings');
    } else if (path === 'settings') {
        uiStore.openSettings();
        router.push('/platform/settings');
    } else {
        gotopage(path);
    }
};

const getCurrentKbId = async (): Promise<string | null> => {
    const kbId = (route.params as any)?.kbId as string;
    if (isInKnowledgeBase.value && kbId) return kbId;
    return null;
};

const gotopage = async (path: string) => {
    if (path === 'logout') {
        try { await logoutApi(); } catch (error) { console.error('注销API调用失败:', error); }
        authStore.logout();
        MessagePlugin.success(t('menu.logoutSuccess'));
        router.push('/login');
        return;
    }
    if (path === 'creatChat') {
        router.push('/platform/creatChat');
    } else {
        router.push(`/platform/${path}`);
    }
    getIcon(path);
};

const getImgSrc = (url: string) => new URL(`/src/assets/img/${url}`, import.meta.url).href;

const onDragHandleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const expandThreshold = 40;
    const onMouseMove = (ev: MouseEvent) => {
        if (ev.clientX - startX > expandThreshold) {
            uiStore.expandSidebar();
            cleanup();
        }
    };
    const onMouseUp = () => cleanup();
    const cleanup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};
</script>
<style lang="less" scoped>
/* Two-layer navigation: Icon Rail + Secondary Panel */
.nav-container {
    display: flex;
    height: 100%;
    position: relative;
    z-index: 10;
}

/* Icon Rail (~112px / 7rem) */
.icon-rail {
    width: 112px;
    min-width: 112px;
    flex-shrink: 0;
    background: #f7f7f8;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 10px;
    border-right: 1px solid rgba(0, 0, 0, 0.04);
    transition: width 0.25s ease, min-width 0.25s ease;
    position: relative;

    html.wails-desktop & {
        padding-top: 46px;
    }

    &--collapsed {
        width: 60px;
        min-width: 60px;
        padding: 16px 4px;
    }
}

.traffic-light-spacer {
    height: 30px;
    flex-shrink: 0;
}

.rail-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--rail-avatar-gradient);
    box-shadow: var(--rail-avatar-shadow);
    color: white;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    margin-bottom: 16px;
    flex-shrink: 0;
    transition: box-shadow 0.2s ease, transform 0.15s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: var(--rail-avatar-shadow), 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    &--active {
        box-shadow: var(--rail-avatar-shadow), 0 0 0 2px var(--rail-avatar-ring);
    }
}

.rail-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
}

.rail-bottom {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    flex-shrink: 0;
}

.rail-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 0;
    border-radius: 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease-out, color 0.2s ease-out, transform 0.15s ease;
    color: var(--rail-idle-label-color);
    width: 100%;

    &:hover {
        background: var(--rail-hover-bg);
        color: #3f3f46;
    }

    &:active {
        transform: scale(0.97);
    }

    &--active {
        background: var(--rail-active-gradient);
        color: var(--rail-active-label-color);
    }
}

.rail-icon-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    transition: background 0.2s ease;

    &--active {
        background: var(--rail-active-gradient);
    }
}

.rail-icon {
    width: 20px;
    height: 20px;
    color: #0d9488;
}

.rail-mindar-logo {
  height: 1.25rem;
  width: auto;
  max-width: 5.5rem;
  object-fit: contain;
}

.rail-icon-circle--logo.rail-icon-circle--active {
    background: linear-gradient(135deg, #ccfbf1 0%, #ede9fe 100%);
}

.rail-label {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    color: inherit;
}

.rail-collapse-toggle {
    position: absolute;
    bottom: 16px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #a1a1aa;
    border-radius: 6px;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.6);
        color: #52525b;
    }
}

.sidebar-drag-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: ew-resize;
    z-index: 10;

    &:hover {
        background: var(--td-brand-color-light);
    }
}

/* Secondary Panel (~248px / 15.5rem) */
.secondary-panel {
    width: 248px;
    min-width: 248px;
    flex-shrink: 0;
    background: var(--secondary-panel-bg);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--secondary-panel-border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    overflow: hidden;
}

.panel-header {
    padding: 12px 12px 8px 12px;
    flex-shrink: 0;
}

.panel-search {
    padding: 0 12px 12px 12px;
    flex-shrink: 0;
    cursor: pointer;
}

.panel-search-inner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 10px;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(0, 0, 0, 0.1);
    }
}

.panel-search-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

.panel-search-text {
    flex: 1;
    font-size: 14px;
    color: #71717a;
}

.panel-search-hint {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    opacity: 0.7;

    kbd {
        display: inline-block;
        padding: 0 5px;
        min-width: 16px;
        font-size: 10px;
        line-height: 16px;
        text-align: center;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 5px;
        color: #71717a;
        box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
    }
}

.panel-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.panel-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    flex-shrink: 0;
}

.panel-section-title {
    font-size: 12px;
    font-weight: 600;
    color: #a1a1aa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.panel-section-action {
    font-size: 16px;
    color: var(--td-brand-color);
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 1;
    }
}

.session-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    padding: 0 8px;
}

.session-group-header {
    font-size: 12px;
    font-weight: 600;
    color: #a1a1aa;
    padding: 12px 12px 6px 12px;
    margin-top: 8px;
    line-height: 20px;
    user-select: none;

    &:first-child {
        margin-top: 4px;
    }
}

.session-item-wrapper {
    padding: 2px 0;
}

.session-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
    color: #52525b;
    font-size: 14px;
    font-weight: 400;
    position: relative;

    &:hover {
        background: rgba(255, 255, 255, 0.55);
        color: #27272a;

        .session-more-wrap {
            opacity: 1;
        }
    }

    &--active {
        background: var(--rail-active-gradient);
        color: #27272a;
        font-weight: 500;

        .session-more-wrap {
            opacity: 1;
        }
    }

    &--batch {
        padding-left: 10px;
        cursor: pointer;
        user-select: none;
    }

    &--selected {
        background: rgba(14, 165, 233, 0.05);
        border-radius: 8px;
    }
}

.batch-checkbox {
    flex-shrink: 0;
}

.session-title {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 4px;
}

.session-pin-icon {
    font-size: 12px;
    flex-shrink: 0;
}

.session-source-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    object-fit: contain;
    filter: grayscale(1);
    opacity: 0.55;
    transition: filter 0.15s ease, opacity 0.15s ease;
}

.session-item:hover .session-source-icon,
.session-item--active .session-source-icon {
    filter: none;
    opacity: 1;
}

.session-more-wrap {
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.session-more {
    display: inline-block;
    font-weight: bold;
    color: var(--td-brand-color);
}

.batch-cancel-hint {
    font-size: 13px;
    color: #a1a1aa;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.2s ease;
    font-weight: 400;

    &:hover {
        color: #52525b;
    }
}

.batch-inline-footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
    background: rgba(255, 255, 255, 0.6);

    .batch-footer-left {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: #a1a1aa;
    }
}

.panel-nav-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin: 0 8px 4px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
    color: #52525b;
    font-size: 14px;
    font-weight: 400;

    &:hover {
        background: rgba(255, 255, 255, 0.55);
        color: #27272a;
    }

    &--active {
        background: var(--rail-active-gradient);
        color: #27272a;
        font-weight: 500;
    }
}

.panel-nav-icon {
    display: flex;
    margin-right: 10px;
    flex-shrink: 0;

    .icon {
        width: 20px;
        height: 20px;
    }
}

.panel-nav-title {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.panel-nav-badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    margin-left: 6px;
    border-radius: 9px;
    background: rgba(250, 173, 20, 0.2);
    color: var(--td-warning-color);
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
    flex-shrink: 0;
}

.panel-footer {
    flex-shrink: 0;
    padding: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
}

/* Dark mode adjustments */
:root[theme-mode="dark"] {
    .icon-rail {
        background: #1a1a1a;
        border-right-color: rgba(255, 255, 255, 0.08);
    }

    .secondary-panel {
        background: var(--secondary-panel-bg);
        border-right-color: var(--secondary-panel-border);
    }

    .rail-tab {
        color: var(--rail-idle-label-color);

        &:hover {
            background: var(--rail-hover-bg);
            color: #d4d4d8;
        }

        &--active {
            background: var(--rail-active-gradient);
            color: var(--rail-active-label-color);
        }
    }

    .rail-icon-circle--active {
        background: var(--rail-active-gradient);
    }

    .panel-search-inner {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.08);

        &:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.12);
        }
    }

    .session-item {
        color: #d4d4d8;

        &:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #e4e4e7;
        }

        &--active {
            background: var(--rail-active-gradient);
            color: #fafafa;
        }
    }

    .panel-nav-item {
        color: #d4d4d8;

        &:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #e4e4e7;
        }

        &--active {
            background: var(--rail-active-gradient);
            color: #fafafa;
        }
    }
}
</style>
