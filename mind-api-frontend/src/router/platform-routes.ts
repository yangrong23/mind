import type { RouteRecordRaw } from 'vue-router'

/** Platform + legacy KB routes (excludes /login and /landing — handled by React shell) */
export const platformRouteRecords: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/platform/knowledge-bases',
  },
  {
    path: '/join',
    name: 'joinOrganization',
    redirect: (to) => {
      const code = to.query.code as string
      return {
        path: '/platform/organizations',
        query: code ? { invite_code: code } : {},
      }
    },
    meta: { requiresInit: true, requiresAuth: true },
  },
  {
    path: '/knowledgeBase',
    name: 'home',
    component: () => import('../views/knowledge/KnowledgeBase.vue'),
    meta: { requiresInit: true, requiresAuth: true },
  },
  {
    path: '/platform',
    name: 'Platform',
    redirect: '/platform/knowledge-bases',
    component: () => import('../views/platform/index.vue'),
    meta: { requiresInit: true, requiresAuth: true },
    children: [
      {
        path: 'tenant',
        redirect: '/platform/settings',
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/settings/Settings.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'knowledge-bases',
        name: 'knowledgeBaseList',
        component: () => import('../views/knowledge/KnowledgeBaseList.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'knowledge-bases/:kbId',
        name: 'knowledgeBaseDetail',
        component: () => import('../views/knowledge/KnowledgeBase.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'knowledge-search',
        redirect: (to) => {
          const q = to.query.q
          return {
            path: '/platform/knowledge-bases',
            query: typeof q === 'string' ? { cmdk: q } : { cmdk: '' },
          }
        },
      },
      {
        path: 'agents',
        name: 'agentList',
        component: () => import('../views/agent/AgentList.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'creatChat',
        name: 'globalCreatChat',
        component: () => import('../views/creatChat/creatChat.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'knowledge-bases/:kbId/creatChat',
        name: 'kbCreatChat',
        component: () => import('../views/creatChat/creatChat.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'chat/:chatid',
        name: 'chat',
        component: () => import('../views/chat/index.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'organizations',
        name: 'organizationList',
        component: () => import('../views/organization/OrganizationList.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'insights',
        name: 'insights',
        component: () => import('../views/insights/InsightsView.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'notes',
        name: 'notesList',
        component: () => import('../views/notes/NotesView.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'recordings',
        name: 'recordings',
        component: () => import('../views/recordings/RecordingsView.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
      {
        path: 'workspace/settings',
        name: 'workspaceSettings',
        component: () => import('../views/workspace/TeamSettings.vue'),
        meta: { requiresInit: true, requiresAuth: true },
      },
    ],
  },
  ...(import.meta.env.DEV
    ? [
        {
          path: '/platform/dev/markdown',
          name: 'markdownTest',
          component: () => import('../views/dev/MarkdownTestPage.vue'),
          meta: { requiresAuth: false, requiresInit: false },
        } as RouteRecordRaw,
      ]
    : []),
]
