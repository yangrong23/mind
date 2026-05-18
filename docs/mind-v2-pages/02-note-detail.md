# 02 — Note Detail（`NoteDetail`）

**文件**：`components/mind-v2/note-detail.tsx`

## 功能边界

**负责**

- Source / Note 分段、转录与摘要展示、播放进度（mock）。
- 移入知识库（选择 KB → 动画 → `onMovedToLibrary`）。
- 新建文件夹并分配（`CreateFolderSheet` → `onAssignNoteToNewFolder`）。
- 分享、工具菜单、模板页、富文本、垃圾桶等大量 **demo 交互**（多数 toast 或本地 UI）。

**不负责**

- 真实转写、上传、分享链接校验。
- `note` 缺失时部分操作降级（如移入废纸篓分支已有 toast）。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `note` | `Note \| null \| undefined` | 当前笔记；录音结束后父级会传入新笔记。 |
| `onBack` | `() => void` | 返回 Tab。 |
| `onMovedToLibrary` | `(kb: MovedLibraryMeta) => void` | 成功移库后父级切到 `kb-detail` 并切 Knowledge Tab。 |
| `onAssignNoteToNewFolder` | `(noteId, folder) => void` | 新建文件夹并绑定笔记。 |
| `onTrashNote` | `(noteId: number) => void` | 删除并通常伴随 `onBack`。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onBack` | 关闭详情。 |
| `onMovedToLibrary` | **闭环**：Notes → Library 详情。 |
| `onAssignNoteToNewFolder` | 更新父级 `folders` + `notes`。 |
| `onTrashNote` | 更新父级 `notes` + 常配合返回列表。 |
| 内部 toast | 提问 AI、分享、删除等反馈。 |

## 功能边界（子模块）

- **Move to library**：使用组件内 mock KB 列表，非 `KnowledgeTab` 的同一数据源（原型可接受）。
- **Ask about note**：仅 toast，不接 Chat 页。

## 关联

- `Note`：`notes-tab.tsx`。
- `MovedLibraryMeta`：`note-detail.tsx` 导出。

---

## 后端接口开发项

> 笔记详情：Source（转写/播放）、Note（富文本/摘要）、移库、模板生成、分享、工具菜单、底部 Ask。

### 1. 笔记详情聚合

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/notes/{noteId}` | 元数据 + 处理状态 |
| 1.2 | `GET` | `/api/v1/notes/{noteId}/source` | Source 分段：音频 URL、波形、转写段落 |
| 1.3 | `GET` | `/api/v1/notes/{noteId}/note-body` | Note 分段：富文本 HTML、AI 摘要块 |
| 1.4 | `PATCH` | `/api/v1/notes/{noteId}` | 更新 title、folderId 等 |

**`GET .../source` 响应（节选）**

| 字段 | 说明 |
|------|------|
| `audioUrl` | 签名播放 URL（短期有效） |
| `durationMs` | 总时长 |
| `waveformSamples` | number[]? 波形 |
| `segments[]` | `{ id, startMs, endMs, text, speakerId?, speakerLabel? }` |
| `playbackPositionMs` | 服务端记录的上次播放位置（可选） |

**`GET .../note-body` 响应**

| 字段 | 说明 |
|------|------|
| `html` | 富文本正文 |
| `summary` | AI 摘要 Markdown/HTML |
| `summaryTemplateId` | 当前摘要模版 |
| `marks[]` | 用户标记/高亮 |

### 2. 播放与进度

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `POST` | `/api/v1/notes/{noteId}/playback-position` | 上报播放进度（节流 5s） |
| 2.2 | `GET` | `/api/v1/notes/{noteId}/audio/stream` | 可选 HLS/DASH 地址 |

### 3. 转写与说话人

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `POST` | `/api/v1/notes/{noteId}/transcription/retry` | 重新转写（工具菜单 Re-transcribe） |
| 3.2 | `GET` | `/api/v1/notes/{noteId}/transcription/jobs/{jobId}` | 任务状态 |
| 3.3 | `PATCH` | `/api/v1/notes/{noteId}/segments/{segmentId}/speaker` | 命名说话人（Name speakers，若启用） |
| 3.4 | `POST` | `/api/v1/notes/{noteId}/speaker-diarization` | 触发说话人分离任务 |

### 4. 摘要与模版（Source 段落下拉 Summary type）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/note-templates` | 可用模版列表（系统+用户自定义） |
| 4.2 | `POST` | `/api/v1/notes/{noteId}/summaries` | 按模版生成摘要（异步） |
| 4.3 | `GET` | `/api/v1/notes/{noteId}/summaries/{jobId}` | 生成结果 |
| 4.4 | `POST` | `/api/v1/note-templates` | 用户自定义模版（模板页 Save） |

**`POST summaries` 请求**：`{ "templateId": "meeting_minutes", "language": "zh-CN" }`

### 5. 移入知识库（Move to library）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `GET` | `/api/v1/libraries?scope=transfer-target` | 可选目标库（mine/team/recent） |
| 5.2 | `POST` | `/api/v1/notes/{noteId}/transfer-to-library` | 同 01；成功后前端 `onMovedToLibrary` |
| 5.3 | `GET` | `/api/v1/notes/{noteId}/transfer-status` | 移库异步任务状态 |

**响应 `MovedLibraryMeta` 对齐**：`{ libraryId, name, color, description?, coverImage? }`

### 6. 文件夹（CreateFolderSheet）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.1 | `POST` | `/api/v1/note-folders` | 创建并返回 folder |
| 6.2 | `PATCH` | `/api/v1/notes/{noteId}` | `folderId` 绑定（`onAssignNoteToNewFolder`） |

### 7. 底部 Ask about note（`MindChatComposer`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 7.1 | `POST` | `/api/v1/notes/{noteId}/chat/sessions` | 创建笔记内对话会话 |
| 7.2 | `POST` | `/api/v1/chat/sessions/{sessionId}/messages` | 发送消息；**流式**返回 |
| 7.3 | `GET` | `/api/v1/chat/sessions/{sessionId}/messages` | 历史分页 |

**发送请求**：`{ "content": "...", "mode": "dialog|agent", "modelId": "ds-fast" }`

**响应（流式 chunk）**：`{ "delta": "...", "citations": [{ "segmentId", "quote" }] }`

### 8. 分享

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 8.1 | `POST` | `/api/v1/notes/{noteId}/share-links` | 生成分享链接（权限、过期） |
| 8.1a | `GET` | `/api/v1/share-links/{token}` | 公开访问页数据（未登录只读） |
| 8.2 | `POST` | `/api/v1/notes/{noteId}/export` | 导出任务：pdf/docx/audio |
| 8.3 | `GET` | `/api/v1/exports/{exportId}` | 下载 URL |

**分享选项（Share link modal）**：`includeTranscript`, `includeSummary`, `password`, `expiresInDays`

### 9. 工具菜单

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 9.1 | `POST` | `/api/v1/notes/{noteId}/duplicate` | 复制笔记 |
| 9.2 | `POST` | `/api/v1/notes/{noteId}/report` | 举报 |
| 9.3 | `DELETE` | `/api/v1/notes/{noteId}` | Move to trash → `onTrashNote` |

### 10. 反馈（摘要点赞/踩）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 10.1 | `POST` | `/api/v1/notes/{noteId}/feedback` | `{ "target": "summary", "rating": "up|down", "comment"? }` |

### 11. 异步任务与 Webhook

| 任务类型 | Webhook |
|----------|---------|
| `transcription` | `note.transcription.completed` / `failed` |
| `summary` | `note.summary.completed` |
| `transfer` | `note.transferred` |
| `export` | `export.ready` |
