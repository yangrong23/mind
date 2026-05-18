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

---

## 后端接口开发项

> 壳层不直接承载业务 UI，但负责 **会话恢复、工作空间切换、深链解析、全局配置** 与 **鉴权门闩** 所需的后端能力。以下接口由 BFF 或网关统一提供，供 `MindAppV2` 启动与 `requireAuthThen` 调用。

### 1. 启动与配置

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/bootstrap` | 应用启动包：功能开关、最低客户端版本、维护公告、默认 Tab、主题默认值 |
| 1.2 | `GET` | `/api/v1/config/client` | 客户端可调参数：上传大小上限、录音最长时长、支持的分享渠道列表 |
| 1.3 | `GET` | `/api/v1/health` | 存活探针；可选返回各依赖子系统状态（ASR、向量库、队列） |

**`GET /api/v1/bootstrap` 响应示例（节选）**

```json
{
  "features": { "knowledgeGraph": true, "factorySlides": true, "hardwareSync": false },
  "maintenance": null,
  "minAppVersion": "1.0.0",
  "defaultAccountId": "work"
}
```

### 2. 会话与鉴权（与 `09-auth` 联动）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/auth/session` | 校验当前 access token；返回用户摘要、是否需刷新 |
| 2.2 | `POST` | `/api/v1/auth/refresh` | 用 refresh token 换新 access token |
| 2.3 | `POST` | `/api/v1/auth/logout` | 登出当前设备；吊销 refresh token（对应 `handleSessionSignOut`） |
| 2.4 | `POST` | `/api/v1/auth/logout-all` | 全设备登出 |

**`GET /api/v1/auth/session` 响应**

| 字段 | 类型 | 说明 |
|------|------|------|
| `userId` | string | 用户 ID |
| `email` | string? | 邮箱 |
| `displayName` | string | 昵称 |
| `avatarUrl` | string? | 头像 |
| `accounts` | array | 工作空间列表，见下 |
| `expiresAt` | ISO8601 | access token 过期时间 |

**`accounts[]` 元素**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `"work" \| "personal"` | 与 `MindAccountId` 对齐 |
| `label` | string | 展示名 |
| `role` | string | 空间内角色 |

**错误码**：`401 TOKEN_EXPIRED`、`401 TOKEN_REVOKED` → 前端打开 `MindAuthScreens`。

### 3. 工作空间（Account）切换

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `GET` | `/api/v1/accounts` | 列出用户可访问的工作空间 |
| 3.2 | `POST` | `/api/v1/accounts/{accountId}/context` | 切换当前上下文（服务端记录 last_active_account，可选） |

后续所有业务 API 应在 JWT 或 Header `X-Account-Id: work|personal` 中携带当前空间；服务端 **拒绝跨空间访问资源**。

### 4. 深链与视图恢复（扩展）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/deeplink/resolve?url=` | 将分享短链/Universal Link 解析为 `{ view, params }`，映射到 `View` 类型 |
| 4.2 | `GET` | `/api/v1/navigation/resume` | 可选：上次未读完的 noteId / kbId / chatSessionId |

**`resolve` 返回 `view` 枚举（与壳 `View` 对齐）**

- `tabs` + `tab: notes|knowledge|agent|me`
- `note-detail` + `noteId`
- `recording`（一般不允许深链直达）
- `kb-detail` + `libraryId` + `initialView?`
- `agent-chat` + `agentId` + `sessionId?`
- `kb-agent-chat` + `libraryId` + `contentId?` + `sessionId?`

### 5. 鉴权门闩辅助（`requireAuthThen`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `POST` | `/api/v1/auth/preflight` | 批量检查操作是否允许（未登录返回 `allowed: false, reason: LOGIN_REQUIRED`） |

**请求体示例**：`{ "actions": ["note.create", "recording.start", "agent.chat.send"] }`

### 6. 客户端遥测（非阻塞）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.1 | `POST` | `/api/v1/telemetry/events` | 批量上报页面浏览、错误、性能指标（不阻塞 UI） |
| 6.2 | `POST` | `/api/v1/telemetry/crash` | 崩溃报告 |

### 7. 录音结束闭环（父级 `handleRecordingStopped`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 7.1 | `POST` | `/api/v1/notes/from-recording` | 录音页 `onStop` 后创建笔记草稿并返回 `noteId`；触发转写任务 |
| 7.2 | `GET` | `/api/v1/notes/{noteId}/processing` | 轮询转写/分析状态，供列表 `status: pending|analyzed` |

**`POST /api/v1/notes/from-recording` 请求**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `recordingSessionId` | string | 是 | 录音页开始时创建的会话 ID |
| `durationMs` | number | 是 | 时长 |
| `deviceId` | string? | 否 | 硬件设备 ID |
| `bookmarks` | number[]? | 否 | 标记点时间戳（秒） |
| `accountId` | string | 是 | 工作空间 |

**响应**：`{ "noteId": "...", "uploadUrls": [...], "transcriptionJobId": "..." }`

### 8. 工程要求

- 所有写接口记录 `traceId` 并写入审计日志（用户 ID、accountId、资源 ID）。
- Bootstrap 与 session 接口 **强缓存**（CDN 短 TTL + ETag）。
- 登出后客户端清除本地 token；服务端吊销 refresh，access 黑名单可选。
