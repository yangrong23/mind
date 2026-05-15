# Mind v2 原型 — 页面级开发文档

本目录按**可导航页面 / 全屏视图**拆分说明：**功能边界**、**输入（Props / 外部状态）**、**输出（回调 / 副作用 / 导航）**。

实现入口：`components/mind-v2/mind-app-v2.tsx`（路由壳）、`app/page.tsx`（挂载 `MindAppV2`）。

## 文档索引

| 文档 | 页面 / 视图 |
|------|----------------|
| [00-app-shell.md](./00-app-shell.md) | 设备壳、全局 `View` 路由、鉴权遮罩、底部导航 |
| [01-notes-tab.md](./01-notes-tab.md) | 笔记 Tab（列表、筛选、录音入口） |
| [02-note-detail.md](./02-note-detail.md) | 笔记详情（Source / Note、移库、分享等） |
| [03-recording.md](./03-recording.md) | 全屏录音 |
| [04-knowledge-tab.md](./04-knowledge-tab.md) | 知识库 Tab、Library Plaza |
| [05-knowledge-detail.md](./05-knowledge-detail.md) | 知识库详情（Hub / Graph / Studio、Ask、条目详情） |
| [06-agent-tab.md](./06-agent-tab.md) | Minder / Agent Tab（首页、抽屉、资料范围、内容工厂） |
| [07-agent-chat.md](./07-agent-chat.md) | Agent 对话页（含资料库内 Chat） |
| [08-me-tab.md](./08-me-tab.md) | Me Tab（个人、设置、账户） |
| [09-auth.md](./09-auth.md) | 全屏登录 / 注册（遮罩） |
| [10-shared-sheets-modals.md](./10-shared-sheets-modals.md) | 跨页面弹层与共用组件（简要） |

## 导航关系（简图）

```mermaid
flowchart TB
  subgraph tabs [Tabs + BottomNav]
    N[NotesTab]
    K[KnowledgeTab]
    A[AgentTab]
    M[MeTab]
  end
  ND[NoteDetail]
  REC[RecordingPage]
  KD[KnowledgeDetail]
  AC[AgentChat]
  AUTH[MindAuthScreens overlay]
  tabs --> ND
  tabs --> REC
  tabs --> KD
  tabs --> AC
  N --> ND
  N --> REC
  K --> KD
  A --> AC
  AUTH -.->|requireAuthThen| ND
  AUTH -.->|requireAuthThen| REC
  AUTH -.->|requireAuthThen| AC
  KD --> AC
```

## 全局约定

- **Demo 数据**：笔记、文件夹、知识库列表等多为本地 mock；无真实后端。
- **鉴权**：`requireAuthThen(run)`；会话键 `sessionStorage`：`mind-v2-demo-auth`。
- **底部栏**：仅在 `currentView.type === "tabs"` 时显示。
