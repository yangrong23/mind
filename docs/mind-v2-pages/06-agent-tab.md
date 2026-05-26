# 06 — Agent Tab（Mindar 首页）

**文件**：`components/mind-v2/agent-tab.tsx`（主 Tab 部分 + `CreateAgentSheet` / `ExploreAgentsPage` 等同文件子组件）

## 功能边界

**负责**

- 左侧抽屉：我的 Agent、历史、新建 / Discover 入口；点击 Agent → `onAgentChat`（父级鉴权）。
- 中央 **Mindar** 品牌与主输入框：发送 `submitAgentHomePrompt`（`requireAuthThen`）、Enter 发送。
- 资料范围：**Atom** → `showKBSelect` sheet；可选 **Library Plaza** 叠加（`libraryPlazaFromAgent`）。
- **FileStack**：附件（`requireAuthThen` + toast）。
- **Content factory** 两排快捷入口 → `openStudioWithKind` → `ContentFactoryModals`。
- `pickedKbIds` / `libraryLinkMode` 与 `linkSummary` 展示。

**不负责**

- 真实模型请求、附件上传。
- Agent Chat 内消息列表（见 `AgentChat`）。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `onAgentChat` | `(agent: Agent) => void` | 进入全屏 Chat；父级鉴权。 |
| `requireAuthThen` | `(run: () => void) => void` | 发送、附件等。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onAgentChat` | 导航到 `agent-chat`。 |
| `ContentFactoryModals.onGenerateSubmit` | 关闭 session + toast「Queued」。 |
| `toast` | 链接库、Plaza 等。 |

## 子组件（同文件，简要）

- **CreateAgentSheet**：新建 Agent 表单 demo；Save 未接持久化。
- **ExploreAgentsPage**：选择 Agent → `onAgentChat`。
- **LibraryPlazaView**（Agent 内）：仅 `onPickLibrary`，不打开全局 `kb-detail`。

## 关联

- `library-plaza-view.tsx`、`content-factory-modals.tsx`、`studio-handoff.ts`

---

## 后端接口开发项

> Mindar 首页：抽屉 Agent 列表、主输入框、资料范围（@ 库）、Content Factory、Discover/新建 Agent。

### 1. Agent 资源

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/agents` | 我的 Agent 列表（抽屉） |
| 1.2 | `GET` | `/api/v1/agents/official` | 官方/Discover 列表 |
| 1.3 | `GET` | `/api/v1/agents/{agentId}` | Agent 详情配置 |
| 1.4 | `POST` | `/api/v1/agents` | 新建 Agent（CreateAgentSheet） |
| 1.5 | `PATCH` | `/api/v1/agents/{agentId}` | 更新名称、人设、声音等 |
| 1.6 | `DELETE` | `/api/v1/agents/{agentId}` | 删除 |

**Agent 对象（对齐前端 `Agent`）**

| 字段 | 说明 |
|------|------|
| `id`, `name`, `description` | 基础 |
| `avatar` | url 或 emoji |
| `color` | 渐变 class |
| `systemPrompt` | 人设指令 |
| `visibility` | private / public |
| `chatCount`, `author`, `isOfficial` | Discover 展示 |

### 2. 最近对话（抽屉历史）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/chat/sessions/recent` | 按日期分组的历史（90 天） |
| 2.2 | `DELETE` | `/api/v1/chat/sessions/{sessionId}` | 删除单条历史 |

**响应分组**：`[{ "date": "2026-05-12", "items": [{ "sessionId", "title", "agentId", "preview" }] }]`

### 3. Mindar 主输入（`submitAgentHomePrompt`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `POST` | `/api/v1/mindar/quick-send` | 首页发送：创建 session + 首条消息 + 排队回复 |
| 3.2 | `POST` | `/api/v1/chat/sessions` | 或显式创建会话后跳转 `agent-chat` |

**`POST mindar/quick-send` 请求**

```json
{
  "content": "用户输入",
  "mode": "dialog|agent",
  "modelId": "ds-fast",
  "libraryScope": { "mode": "auto|pick", "libraryIds": ["lib_1"] },
  "attachments": [{ "uploadId": "..." }]
}
```

**响应**：`{ "sessionId", "agentId", "messageId", "streamUrl" }`

### 4. 资料范围（@ 知识库）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/libraries?scope=agent-pick` | KB 多选 Sheet 列表 |
| 4.2 | `PUT` | `/api/v1/users/me/mindar-library-scope` | 持久化 `libraryLinkMode` + `pickedKbIds` |
| 4.3 | `GET` | `/api/v1/users/me/mindar-library-scope` | 读取 linkSummary 展示 |

### 5. 附件上传（`+`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `POST` | `/api/v1/uploads` | 申请上传（文件/图片） |
| 5.2 | `POST` | `/api/v1/chat/attachments` | 绑定到待发消息 |

### 6. 模型与模式

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.1 | `GET` | `/api/v1/models` | 可选模型列表（DS 快速 / Mind Pro / Balanced） |
| 6.2 | `GET` | `/api/v1/chat/modes` | dialog / agent 模式说明与能力差异 |

### 7. Content Factory（首页快捷入口）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 7.1 | `POST` | `/api/v1/mindar/factory/handoff` | `openStudioWithKind`：带库范围创建工厂任务 |
| 7.2 | 见 `05` §6 | 工厂任务 CRUD |

**handoff 请求**：`{ "factoryKind", "libraryLinkMode", "pickedLibraryIds", "settings?" }`

### 8. Library Plaza（Agent 内嵌）

见 `04` §4.2；`handlePlazaPick` 调用 `4.2` 的 scope API。

### 9. 语音输入

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 9.1 | `POST` | `/api/v1/speech/transcribe` | 按住说话：音频 → 文本填入输入框 |
| 9.2 | WebSocket | `/ws/v1/speech/stream` | 流式听写（可选） |

### 10. 计费

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 10.1 | `POST` | `/api/v1/billing/estimate` | 发送前预估 token/积分消耗 |
| 10.2 | 内部 | 消息发送时扣减 credits | 见 `08-me-tab` |
