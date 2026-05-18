# 07 — Agent Chat（`AgentChat`）

**文件**：`components/mind-v2/agent-tab.tsx`（导出函数 `AgentChat`）

## 功能边界

**负责**

- 头部返回、Agent 信息、可选 `entryHint`（资料库 Chat）。
- 空状态与有消息两种布局；输入框、附件、**Studio**、发送。
- 发送：本地追加 user 消息 + 延时 mock AI 回复。
- **附件**：`requireAuthThen` + toast。
- **Studio**：若提供 `onNavigateToKnowledge` 则调用（父级定义跳转）；否则仅 toast。

**不负责**

- 流式 SSE、工具调用、多轮上下文持久化。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `agent` | `Agent` | `id`, `name`, `description`, `avatar`, `color` 等。 |
| `onBack` | `() => void` | 返回：Tab 或 `kb-detail`（由父级决定）。 |
| `entryHint` | `string?` | 资料库 Chat 顶部说明。 |
| `requireAuthThen` | `(run: () => void) => void?` | 发送与附件。 |
| `onNavigateToKnowledge` | `() => void?` | **主 Agent Chat**：切 Knowledge Tab + toast；**kb-agent-chat**：父级传入回到当前库 `factory` 的闭包。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onBack` | 退出聊天。 |
| `onNavigateToKnowledge` | Studio 快捷跳转（由父级实现闭环）。 |
| 内部 `setMessages` | 仅内存，离开即丢。 |

## 父级挂载差异（`mind-app-v2.tsx`）

| 场景 | `onBack` | `onNavigateToKnowledge` |
|------|----------|-------------------------|
| `agent-chat` | `setCurrentView({ type: "tabs" })` | `navigateToKnowledgeForStudio` |
| `kb-agent-chat` | 回到 `kb-detail`（保留 `kb`、`initialView`） | 回到同一 `kb-detail` 且 `initialView: "factory"` + toast |

## 不在范围内

- 语音输入按钮（若有）未接 ASR。

---

## 后端接口开发项

> `AgentChat`：通用 Agent 对话 + 资料库 grounded Chat（`kb-agent-chat`）。

### 1. 会话

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `POST` | `/api/v1/chat/sessions` | 创建会话 |
| 1.2 | `GET` | `/api/v1/chat/sessions/{sessionId}` | 会话元数据 |
| 1.3 | `PATCH` | `/api/v1/chat/sessions/{sessionId}` | 重命名、归档 |
| 1.4 | `DELETE` | `/api/v1/chat/sessions/{sessionId}` | 删除 |
| 1.5 | `POST` | `/api/v1/chat/sessions/{sessionId}/new` | **新建对话**（清空上下文，保留 session 或新建） |

**创建会话请求**

```json
{
  "agentId": "agent_123",
  "libraryId": "lib_xxx",
  "contentItemId": "item_yyy",
  "entryHint": "optional",
  "grounding": { "pickedLibraryName": "..." }
}
```

### 2. 消息

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/chat/sessions/{sessionId}/messages` | 历史消息分页 |
| 2.2 | `POST` | `/api/v1/chat/sessions/{sessionId}/messages` | 发送用户消息 |
| 2.3 | `GET` | `/api/v1/chat/sessions/{sessionId}/stream` | **SSE** 流式助手回复 |
| 2.4 | `POST` | `/api/v1/chat/sessions/{sessionId}/messages/{msgId}/stop` | 停止生成 |

**发送请求**

```json
{
  "content": "用户文本",
  "mode": "dialog|agent",
  "modelId": "ds-fast",
  "attachments": []
}
```

**SSE 事件类型**

| event | payload |
|-------|---------|
| `message.start` | `{ "assistantMessageId" }` |
| `message.delta` | `{ "text": "..." }` |
| `message.citation` | `{ "libraryItemId", "snippet", "index" }` |
| `message.done` | `{ "usage": { "promptTokens", "completionTokens" } }` |
| `message.error` | `{ "code", "message" }` |

### 3. 资料库 Chat 专用（RAG）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `POST` | `/api/v1/chat/sessions/{sessionId}/retrieve` | 发送前检索片段（调试用） |
| 3.2 | 服务端内置 | 每条消息自动 `retrieve(libraryId, query)` 注入 context | |
| 3.3 | `POST` | `/api/v1/chat/messages/{msgId}/save-to-library` | **存入知识库**（外跳图标） |
| 3.4 | `POST` | `/api/v1/chat/messages/{msgId}/mindmap` | **生成脑图** |
| 3.5 | `POST` | `/api/v1/chat/messages/{msgId}/share` | 分享 |

**`save-to-library` 请求**：`{ "targetLibraryId"?, "title"?, "includeCitations": true }`

### 4. 头部操作（新建 / 历史）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `POST` | `/api/v1/chat/sessions/{sessionId}/new` | 新建对话 |
| 4.2 | `GET` | `/api/v1/chat/sessions/{sessionId}/qa-history` | 或 `GET .../libraries/{id}/qa-history` |
| 4.3 | `GET` | `/api/v1/chat/qa-history` | 全局问答历史（按库/Agent 过滤） |

### 5. Composer 工具栏

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `GET` | `/api/v1/libraries?scope=chat-picker` | @ 选择知识库（`MOCK_KNOWLEDGE_BASES`） |
| 5.2 | `PUT` | `/api/v1/chat/sessions/{sessionId}/grounding` | 更新 `pickedKbName` |
| 5.3 | `POST` | `/api/v1/uploads` | 上传附件 |
| 5.4 | `POST` | `/api/v1/speech/transcribe` | 语音输入 |

### 6. Studio 跳转（`onNavigateToKnowledge`）

无独立 API；前端导航。可选：

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.1 | `POST` | `/api/v1/chat/sessions/{sessionId}/handoff/factory` | 携带最近对话摘要创建工厂任务 |

### 7. Agent 模式差异（dialog vs agent）

| mode | 后端行为 |
|------|----------|
| `dialog` | 标准多轮对话，低自主度 |
| `agent` | 启用工具链：检索、多步计划、结构化交付物；更高 token 上限 |

### 8. 限流与安全

| 项 | 说明 |
|----|------|
| 速率限制 | 每用户每分钟消息数 |
| 内容审核 | 入站/出站敏感词 |
| 引用校验 | citation 的 itemId 必须属于 session.libraryId |

### 9. Webhook

| 事件 | 说明 |
|------|------|
| `chat.message.completed` | 异步任务型回复完成推送 |
| `chat.mindmap.completed` | 脑图生成完成 |
