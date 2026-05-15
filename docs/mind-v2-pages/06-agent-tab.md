# 06 — Agent Tab（Minder 首页）

**文件**：`components/mind-v2/agent-tab.tsx`（主 Tab 部分 + `CreateAgentSheet` / `ExploreAgentsPage` 等同文件子组件）

## 功能边界

**负责**

- 左侧抽屉：我的 Agent、历史、新建 / Discover 入口；点击 Agent → `onAgentChat`（父级鉴权）。
- 中央 **Minder** 品牌与主输入框：发送 `submitAgentHomePrompt`（`requireAuthThen`）、Enter 发送。
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
