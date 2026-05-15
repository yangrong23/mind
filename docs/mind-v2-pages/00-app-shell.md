# 00 — App Shell（`MindAppV2`）

**文件**：`components/mind-v2/mind-app-v2.tsx`

## 功能边界

**负责**

- 手机外框、状态栏、主题切换、Home Indicator。
- 全局视图状态 `currentView`（`View` 联合类型）与 Tab 状态 `activeTab`。
- 笔记 / 文件夹的 lifted state（`notes`, `folders`）与账号 `activeAccountId`。
- 全屏鉴权遮罩 `authOverlayOpen` + `pendingAfterAuth`（登录成功后执行被拦截的操作）。
- `sessionStorage` 读写：`mind-v2-demo-auth`。
- 登出：`handleSessionSignOut`（清会话、回 Tab、回 Notes）。

**不负责**

- 各 Tab 内部 UI 与业务细节（下放到子组件）。
- 真实 OAuth / API。

## 输入（外部）

| 来源 | 说明 |
|------|------|
| 无 React props | 根组件由 `app/page.tsx` 直接渲染。 |
| `sessionStorage` | 初始化时若 `mind-v2-demo-auth === "1"` 则 `isLoggedIn = true`。 |

## 输出（对子组件）

| 回调 / 数据 | 消费者 | 含义 |
|-------------|--------|------|
| `requireAuthThen(fn)` | Notes（点笔记/录音）、AgentTab、AgentChat、KnowledgeDetail 等 | 未登录则打开鉴权，`fn` 延后到登录成功执行。 |
| `onNoteClick` / `onStartRecording` | NotesTab | 已包装鉴权。 |
| `onKBClick` | KnowledgeTab | **不**鉴权：可浏览知识库。 |
| `onAgentChat` | AgentTab | 鉴权后进入 `agent-chat`。 |
| `onSessionSignOut` | MeTab | 结束 demo 会话。 |
| `onNavigateToKnowledge` | AgentChat（两处实现不同） | 主 Agent：切 Knowledge Tab；资料库 Chat：回到 `kb-detail` + `factory`。 |
| `handleRecordingStopped` | RecordingPage `onStop` | 插入新 `Note` 并进入 `note-detail`。 |

## `View` 类型（输出给路由逻辑自身）

- `tabs`：显示四 Tab 之一 + BottomNav。
- `note-detail`：`note` 可选；录音结束会带新 `note`。
- `recording`：全屏录音。
- `kb-detail`：`kb` 元数据 + 可选 `initialView`、`initialFactoryModal`。
- `agent-chat`：`agent` 对象。
- `kb-agent-chat`：`context` + 可选 `kb` + `initialView`（用于返回）。

## 副作用

- `toast`：登出提示等。
- `sessionStorage`：登录持久化。

## 不在范围内

- 多窗口、深链接 URL 路由（Next 层仅单页挂载原型）。
