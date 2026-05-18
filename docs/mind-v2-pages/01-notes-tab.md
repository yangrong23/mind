# 01 — Notes Tab（`NotesTab`）

**文件**：`components/mind-v2/notes-tab.tsx`

## 功能边界

**负责**

- 按账号展示头部（Mind + 空间标签）、设备入口、智能搜索（toast）。
- 笔记列表 / 缩略图视图、文件夹筛选、回收站、排序与筛选 Sheet。
- 左滑「保存到库」等交互（本地更新 `notes` + toast）。
- 打开设备 Sheet（`MindDevicesSheet`）、录音选项 → 调用 `onStartRecording`。

**不负责**

- 笔记详情内容（`NoteDetail`）。
- 真实同步、搜索服务端。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `activeAccountId` | `MindAccountId` | 当前空间，影响头部展示。 |
| `notes` | `Note[]` | 列表数据源。 |
| `folders` | `NoteFolder[]` | 文件夹与筛选。 |
| `onNotesChange` | `(notes: Note[]) => void` | 本地增删改笔记后回写父级。 |
| `onNoteClick` | `(note: Note) => void` | **父级已包鉴权**；进入详情。 |
| `onStartRecording` | `() => void` | **父级已包鉴权**；进入录音页。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onNotesChange` | 归档、保存到库、列表内状态变更等。 |
| `onNoteClick` / `onStartRecording` | 触发父级 `setCurrentView`。 |
| `toast` | 搜索、筛选、视图切换、导入说明等 demo 反馈。 |

## 功能边界（明确不做）

- 不调用后端；不持久化到磁盘（除父级若扩展）。
- 「Chat-style notes / Imports」等入口为说明性 toast，不跳转。

## 关联类型

- `Note`：`components/mind-v2/notes-tab.tsx` 导出。
- `NoteFolder`：`@/lib/note-folders`。

---

## 后端接口开发项

> 对应 `NotesTab`：笔记列表、文件夹筛选、设备状态、智能搜索入口、左滑归档/移库、进入录音与详情。

### 1. 笔记列表与筛选

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/notes` | 分页列表；支持筛选/排序 |
| 1.2 | `GET` | `/api/v1/notes/counts` | 各状态/文件夹数量角标（回收站、待处理等） |

**`GET /api/v1/notes` Query**

| 参数 | 类型 | 说明 |
|------|------|------|
| `accountId` | string | 工作空间 |
| `folderId` | string? | `null` 表示未分类；`trash` 回收站 |
| `type` | `hardware\|phone\|text`? | 来源类型 |
| `status` | `pending\|analyzed\|transferred`? | 处理状态 |
| `archived` | boolean? | 是否已从主列表隐藏 |
| `q` | string? | 关键词（标题、预览、转写全文） |
| `sort` | `updated_desc\|created_desc\|title_asc` | 排序 |
| `cursor` | string? | 游标 |
| `limit` | number? | 默认 20 |

**列表项 `Note` 响应字段（与前端 `Note` 对齐）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | UUID |
| `title` | string | 标题 |
| `type` | enum | hardware / phone / text |
| `date` | string | 本地化展示串或 ISO8601 |
| `duration` | string? | 如 `16 min` |
| `preview` | string | 摘要一行 |
| `status` | enum | pending / analyzed / transferred |
| `source` | string? | 如 Mind Recorder |
| `highlightCount` | number? | 高亮条数 |
| `folderId` | string? | 文件夹 ID |
| `archived` | boolean | 是否归档 |
| `listSubtitle` | string? | 副标题 |
| `processingFailed` | boolean | 处理失败标记 |
| `updatedAt` | ISO8601 | 排序用 |

### 2. 文件夹

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/note-folders` | 文件夹列表 |
| 2.2 | `POST` | `/api/v1/note-folders` | 新建（详情页也可创建，见 02） |
| 2.3 | `PATCH` | `/api/v1/note-folders/{folderId}` | 重命名、改颜色/图标 |
| 2.4 | `DELETE` | `/api/v1/note-folders/{folderId}` | 删除；笔记 `folderId` 置空或迁移策略 |

### 3. 笔记写操作（列表内）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `PATCH` | `/api/v1/notes/{noteId}` | 更新标题、folderId、archived 等 |
| 3.2 | `POST` | `/api/v1/notes/{noteId}/archive` | 归档（左滑或菜单） |
| 3.3 | `POST` | `/api/v1/notes/{noteId}/unarchive` | 取消归档 |
| 3.4 | `DELETE` | `/api/v1/notes/{noteId}` | 移入回收站（软删） |
| 3.5 | `POST` | `/api/v1/notes/{noteId}/restore` | 从回收站恢复 |
| 3.6 | `DELETE` | `/api/v1/notes/{noteId}/permanent` | 永久删除 |

### 4. 保存到知识库（左滑「保存到库」）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/libraries/quick-pick` | 最近使用/推荐库列表（弹层选择） |
| 4.2 | `POST` | `/api/v1/notes/{noteId}/transfer-to-library` | 将笔记迁入指定库；幂等 |

**`POST transfer-to-library` 请求**

```json
{
  "libraryId": "lib_xxx",
  "mode": "copy|move",
  "includeTranscript": true,
  "includeSummary": true
}
```

**响应**：`{ "libraryId", "libraryItemId", "status": "transferred" }`；失败 `409 ALREADY_IN_LIBRARY`。

### 5. 智能搜索（头部搜索图标）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `GET` | `/api/v1/search` | 跨笔记+库内条目统一搜索 |
| 5.2 | `GET` | `/api/v1/search/suggest` | 输入联想（debounce 300ms） |

**`GET /api/v1/search` Query**：`q`, `accountId`, `scopes=notes,libraries`, `limit`

**命中项**：`{ type: "note"|"library_item", id, title, snippet, highlightRanges }`

### 6. 设备与硬件（头部 Recorder 图标）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.1 | `GET` | `/api/v1/devices` | 已配对设备列表 |
| 6.2 | `GET` | `/api/v1/devices/primary` | 当前主设备：连接状态、电量、固件版本 |
| 6.3 | `POST` | `/api/v1/devices/pair` | 配对（二维码/蓝牙 token） |
| 6.4 | `POST` | `/api/v1/devices/{deviceId}/sync` | 触发离线录音同步 |
| 6.5 | `GET` | `/api/v1/devices/{deviceId}/sync/status` | 同步进度 |

**`GET devices/primary` 响应（供 UI 电量/连接态）**

| 字段 | 说明 |
|------|------|
| `connected` | boolean |
| `batteryPercent` | number? |
| `firmwareVersion` | string? |
| `pendingUploadCount` | number |

### 7. 录音入口

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 7.1 | `POST` | `/api/v1/recording-sessions` | 点击 FAB 开始录音前创建会话（鉴权后） |
| 7.2 | `GET` | `/api/v1/recording-sessions/{id}/upload-policy` | 分片上传策略 |

见 `03-recording.md` 与壳层 `7.1`。

### 8. 视图模式与筛选 Sheet（纯前端状态）

筛选/排序参数持久化可选：

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 8.1 | `GET` | `/api/v1/users/me/preferences/notes-list` | 默认排序、默认视图 list/grid |
| 8.2 | `PUT` | `/api/v1/users/me/preferences/notes-list` | 保存用户偏好 |

### 9. Webhook / 推送（列表刷新）

| 事件 | 说明 |
|------|------|
| `note.transcription.completed` | 转写完成 → 列表 `status` 更新 |
| `note.processing.failed` | 设置 `processingFailed: true` |
| `device.sync.completed` | 新笔记出现在列表 |

客户端：`GET /api/v1/notes` 增量 `?updatedSince=` 或 WebSocket `notes.updated`。

### 10. 错误码（本页常用）

| code | HTTP | 场景 |
|------|------|------|
| `NOTE_NOT_FOUND` | 404 | 操作不存在的笔记 |
| `FOLDER_NOT_FOUND` | 404 | 文件夹无效 |
| `LIBRARY_ACCESS_DENIED` | 403 | 无权写入目标库 |
| `QUOTA_EXCEEDED` | 402/403 | 存储或条数超限 |
| `DEVICE_NOT_CONNECTED` | 409 | 需连接硬件才能录音 |
