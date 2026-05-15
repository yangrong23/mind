# 05 — Knowledge Detail（`KnowledgeDetail`）

**文件**：`components/mind-v2/knowledge-detail.tsx`

## 功能边界（多子视图单文件）

| 子视图 / 模式 | 触发 | 说明 |
|---------------|------|------|
| 主壳 Hub / Graph / Studio | Tab 切换 | `activeView`：`content` \| `graph` \| `factory`。 |
| Rolling summary「Ask」 | 头部 Ask 按钮 | `showNotebookAsk` 全屏子布局；发送问题 `submitNotebookAsk`。 |
| 单条条目详情 | Hub 点击条目 | `showContentDetail`；可点 Chat、分享。 |
| Hub 富文本笔记 | Add 菜单 Note | `hubRichNoteOpen` → `TextNoteEditor`。 |
| 分享 Sheet | 分享按钮 | `shareTarget`。 |
| Content Factory 任务 | Studio 卡片 / 模态 | `ContentFactoryModals` + `ContentFactoryJobsInline` 等。 |

**负责**

- 浏览知识库元数据与 mock 内容列表、Graph、Studio 工厂入口。
- **需登录的操作**通过 `requireAuthThen`：`+` 添加菜单各入口、`submitNotebookAsk`。
- `onAgentChat`：父级包鉴权后进入 `kb-agent-chat`。

**不负责**

- 真实文件上传、索引、生成任务队列服务端。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `onBack` | `() => void` | 返回上一屏（通常为 Tab）。 |
| `onAgentChat` | `(context: { kbName; contentTitle? }) => void` | 打开资料库内 Chat（父级鉴权）。 |
| `knowledgeBase` | 可选对象 | `name`, `color`, `description?`, `coverImage?`。 |
| `initialView` | `"content" \| "graph" \| "factory"` | 初始 Tab。 |
| `initialFactoryModal` | `FactoryModalKind \| null` | 挂载后一次打开某工厂模态。 |
| `requireAuthThen` | `(run: () => void) => void` | 未登录先鉴权再执行 `run`。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onBack` | 退出知识库。 |
| `onAgentChat` | 进入 `kb-agent-chat`，并携带 `kb` 以便返回同一 `kb-detail`。 |
| 内部 toast | 搜索、复制、反馈、导入 demo 等。 |
| 内部状态 | `contents` 可因归档 Studio 结果追加（mock）。 |

## 功能边界（明确 demo）

- Smart search 按钮：toast，无搜索 UI。
- Add 菜单非 Note 项：toast「Would open import」；Note 项进富文本编辑器。

## 关联文件

- `content-factory-modals.tsx`、`content-factory-progress-panel.tsx`
- `text-note-editor.tsx`
- `social-share-row.tsx`
