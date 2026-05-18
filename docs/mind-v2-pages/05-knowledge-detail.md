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

---

## 后端接口开发项

> 单库详情：Hub / Graph / Studio、Rolling summary Ask、条目详情、公开库互动、Content Factory、富文本笔记。

### 1. 知识库元数据与权限

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/libraries/{libraryId}` | 库详情：名称、描述、封面、统计、权限 |
| 1.2 | `PATCH` | `/api/v1/libraries/{libraryId}` | 更新库信息（个人/团队 Owner） |
| 1.3 | `DELETE` | `/api/v1/libraries/{libraryId}` | 删除库 |
| 1.4 | `GET` | `/api/v1/libraries/{libraryId}/members` | 成员列表（团队库） |
| 1.5 | `POST` | `/api/v1/libraries/{libraryId}/members` | 邀请成员 |
| 1.6 | `GET` | `/api/v1/libraries/{libraryId}/info-overlay` | 个人/团队/订阅库信息页数据 |

**公开库扩展字段**：`initialLikeCount`, `initialCommentCount`, `isPublicKb`, `publisherName`, `publicTagline`

### 2. Hub — 内容条目（`contents`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/libraries/{libraryId}/items` | 条目列表（分页、标签筛选） |
| 2.2 | `GET` | `/api/v1/libraries/{libraryId}/items/{itemId}` | 条目详情（正文、来源 noteId） |
| 2.3 | `POST` | `/api/v1/libraries/{libraryId}/items` | 新建条目（上传/链接/笔记归档） |
| 2.4 | `PATCH` | `/api/v1/libraries/{libraryId}/items/{itemId}` | 更新 |
| 2.5 | `DELETE` | `/api/v1/libraries/{libraryId}/items/{itemId}` | 删除（左滑删除） |
| 2.6 | `GET` | `/api/v1/libraries/{libraryId}/items/{itemId}/related` | 相关条目推荐 |

**条目模型 `LibraryDoc`**

| 字段 | 说明 |
|------|------|
| `id`, `title`, `author`, `date` | 基础 |
| `type` | note / pdf / link / factory_output / ... |
| `image`, `preview` | 展示 |
| `sourceNoteId` | 关联笔记 |
| `tags[]` | 公开库 # 标签 Q&A |

### 3. Add 菜单（`+` 导入）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `POST` | `/api/v1/libraries/{libraryId}/imports/camera` | 拍照 → OCR/索引 |
| 3.2 | `POST` | `/api/v1/libraries/{libraryId}/imports/image` | 图片 |
| 3.3 | `POST` | `/api/v1/libraries/{libraryId}/imports/audio` | 音频 |
| 3.4 | `POST` | `/api/v1/libraries/{libraryId}/imports/file` | 本地文件（预签名上传） |
| 3.5 | `POST` | `/api/v1/libraries/{libraryId}/imports/link` | URL 抓取 |
| 3.6 | `POST` | `/api/v1/libraries/{libraryId}/imports/youtube` | YouTube |
| 3.7 | `POST` | `/api/v1/libraries/{libraryId}/folders` | 新建文件夹 |
| 3.8 | `POST` | `/api/v1/libraries/{libraryId}/notes` | 富文本笔记（`TextNoteEditor`） |

各 import 返回 `{ "jobId" }` 异步索引；`GET /api/v1/import-jobs/{jobId}` 查状态。

### 4. Rolling summary + Notebook Ask（`showNotebookAsk`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/libraries/{libraryId}/rolling-summary` | 滚动摘要正文 + `sourceCount` |
| 4.2 | `POST` | `/api/v1/libraries/{libraryId}/rolling-summary/regenerate` | 重新生成摘要 |
| 4.3 | `POST` | `/api/v1/libraries/{libraryId}/ask` | Notebook 底栏提问（非全屏 Chat） |
| 4.4 | `POST` | `/api/v1/libraries/{libraryId}/audio-overview` | 音频概览生成队列 |

**`POST ask` 请求**：`{ "question", "mode", "modelId", "scope": "all_sources|selected" }`  
**响应**：流式答案 + `citations[]`（条目 ID + 片段）

**摘要反馈**：`POST .../rolling-summary/feedback` `{ "rating": "up|down" }`

### 5. Graph 视图

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `GET` | `/api/v1/libraries/{libraryId}/graph` | 节点+边 `{ nodes[], edges[] }` |
| 5.2 | `GET` | `/api/v1/libraries/{libraryId}/graph/node/{nodeId}` | 节点详情 |
| 5.3 | `POST` | `/api/v1/libraries/{libraryId}/graph/rebuild` | 触发图谱重建（管理员） |

### 6. Studio — Content Factory

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.1 | `GET` | `/api/v1/libraries/{libraryId}/factory/jobs` | 任务列表 |
| 6.2 | `POST` | `/api/v1/libraries/{libraryId}/factory/jobs` | 创建生成任务 |
| 6.3 | `GET` | `/api/v1/factory/jobs/{jobId}` | 任务状态/进度 |
| 6.4 | `POST` | `/api/v1/factory/jobs/{jobId}/cancel` | 取消 |
| 6.5 | `POST` | `/api/v1/factory/jobs/{jobId}/archive-to-hub` | 归档到 Hub → 新增 `items` |

**`POST factory/jobs` 请求**

```json
{
  "kind": "report|audio|flashcards|quiz|infographic|slides",
  "settings": {
    "reportTargetPages": 8,
    "audioTargetMinutes": 12,
    "slidesPageCount": 10,
    "quizQuestionCount": 15,
    "flashcardCount": 20,
    "infographicPanelCount": 6
  },
  "sourceScope": { "libraryId": "...", "itemIds": [] }
}
```

**任务状态**：`queued | generating | completed | failed`；Webhook `factory.job.completed`。

### 7. 条目详情内 Chat（`onAgentChat`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 7.1 | `POST` | `/api/v1/chat/sessions` | `{ "libraryId", "contentItemId?", "entry": "item|library" }` |
| 7.2 | 见 `07-agent-chat.md` | 消息发送/历史 |

### 8. 公开库底部栏 + 社交

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 8.1 | `POST` | `/api/v1/libraries/{libraryId}/likes` | 点赞/取消（toggle） |
| 8.2 | `GET` | `/api/v1/libraries/{libraryId}/comments` | 评论列表 |
| 8.3 | `POST` | `/api/v1/libraries/{libraryId}/comments` | 发表评论 |
| 8.4 | `POST` | `/api/v1/libraries/{libraryId}/quick-ask` | 底部快捷提问（`#tag` 范围） |

### 9. 分享

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 9.1 | `POST` | `/api/v1/libraries/{libraryId}/share-links` | 分享整个库 |
| 9.2 | `POST` | `/api/v1/libraries/{libraryId}/items/{itemId}/share-links` | 分享单条 |

### 10. Smart search（库内）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 10.1 | `GET` | `/api/v1/libraries/{libraryId}/search` | 全文/向量检索 `q` |
| 10.2 | `GET` | `/api/v1/libraries/{libraryId}/search/tags` | 标签自动补全（`#`） |

### 11. Q&A 历史（与 Chat 共用或分表）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 11.1 | `GET` | `/api/v1/libraries/{libraryId}/qa-history` | 问答历史（90 天） |
