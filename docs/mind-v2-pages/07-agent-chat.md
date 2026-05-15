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
