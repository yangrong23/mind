# 10 — 共用 Sheet / Modal（简要）

以下为跨页面复用组件，**非独立路由页**；详细边界以调用方页面文档为准。

| 组件 | 文件 | 用途 | 典型输入 | 典型输出 |
|------|------|------|----------|----------|
| `MindDevicesSheet` | `mind-devices-sheet.tsx` | 录音机 / 设备状态、同步 | `open`, `onClose`, 连接状态 | `onSetDeviceConnected`, toast |
| `CreateFolderSheet` | `create-folder-sheet.tsx` | 新建文件夹 | 名称/颜色 | `onConfirm(folder)` |
| `ContentFactoryModals` | `content-factory-modals.tsx` | Studio 各产出类型配置 | `open`, `libraryName?` | `onClose`, `onGenerateSubmit(kind, settings?)` |
| `ContentFactoryJobsInline` 等 | `content-factory-progress-panel.tsx` | 任务列表、归档到 Hub | jobs 状态 | 回调更新 `contents` / toast |
| `TextNoteEditor` | `text-note-editor.tsx` | 富文本笔记 | `variant`, `onBack` | 本地编辑 demo |
| `SocialShareRow` | `social-share-row.tsx` | 分享渠道行 | `title`, `body` | `onAfterAction` |
| `SmartSearchIcon` | `components/ui/smart-search-icon.tsx` | 仅图标 | className | 无 |

## 设计原则（原型）

- 凡 **无 `onNavigate` / `onBack` 以外输出** 且仅 `toast` 的按钮，在页面级文档中标注为 **demo 反馈**，不视为功能闭环缺口，除非产品要求接真导航。

## 索引回读

- 壳：`00-app-shell.md`
- 各 Tab / 全屏页：`01`–`09`

---

## 后端接口开发项（共用组件）

> 以下组件被多页引用；接口按 **能力域** 列出，避免与页面文档重复时以本表为准。

### 1. `MindDevicesSheet`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/devices` | 已配对设备 |
| 1.2 | `POST` | `/api/v1/devices/pair` | 开始配对 `{ "method": "qr|bluetooth" }` |
| 1.3 | `POST` | `/api/v1/devices/{id}/disconnect` | 断开 |
| 1.4 | `POST` | `/api/v1/devices/{id}/sync` | 同步离线录音 |
| 1.5 | `GET` | `/api/v1/devices/sync/{jobId}` | 同步进度 |

### 2. `MindHardwareDetail`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/devices/{id}` | 名称、序列号、固件、电量 |
| 2.2 | `POST` | `/api/v1/devices/{id}/firmware/check` | 检查更新 |
| 2.3 | `POST` | `/api/v1/devices/{id}/firmware/upgrade` | OTA 升级任务 |
| 2.4 | `PATCH` | `/api/v1/devices/{id}/settings` | 现场录音/通话录音开关 |
| 2.5 | `POST` | `/api/v1/devices/{id}/disconnect` | 断开连接 |

### 3. `CreateFolderSheet`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `POST` | `/api/v1/note-folders` | `{ "name", "color", "icon" }` |

### 4. `ContentFactoryModals` + `ContentFactoryJobsInline`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/factory/kinds` | 支持的 `FactoryModalKind` 及默认 settings |
| 4.2 | `POST` | `/api/v1/libraries/{libraryId}/factory/jobs` | 提交生成 |
| 4.3 | `GET` | `/api/v1/factory/jobs/{jobId}` | 轮询状态 |
| 4.4 | `POST` | `/api/v1/factory/jobs/{jobId}/archive` | 归档到 Hub |

**`FactoryModalKind` 枚举**：`report | audio | flashcards | quiz | infographic | slides`

**`FactoryGenerationSettings` 字段**：`audioTargetMinutes`, `slidesPageCount`, `quizQuestionCount`, `flashcardCount`, `infographicPanelCount`, `reportTargetPages`

### 5. `TextNoteEditor`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `GET` | `/api/v1/notes/{noteId}` | variant `full` |
| 5.2 | `PUT` | `/api/v1/notes/{noteId}/body` | 保存 HTML `{ "title", "html" }` |
| 5.3 | `POST` | `/api/v1/libraries/{libraryId}/notes` | variant `hubRich` 新建库内笔记 |
| 5.4 | `POST` | `/api/v1/uploads/images` | 编辑器内插图上传 |
| 5.5 | `POST` | `/api/v1/notes/{noteId}/chat/sessions` | 底部 `MindChatComposer` AI |

### 6. `SocialShareRow`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.1 | `POST` | `/api/v1/share/native` | 生成系统分享 payload `{ "title", "body", "url" }` |
| 6.2 | `POST` | `/api/v1/share/wechat` | 微信 SDK 签名参数（若原生壳） |
| 6.3 | `POST` | `/api/v1/share/track` | 分享渠道点击统计 |

### 7. `MindChatComposer`（共用输入条）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 7.1 | `GET` | `/api/v1/models` | 模型下拉 |
| 7.2 | `GET` | `/api/v1/chat/modes` | dialog / agent |
| 7.3 | `GET` | `/api/v1/libraries?scope=composer-at` | @ 知识库列表 |
| 7.4 | `POST` | `/api/v1/speech/transcribe` | 语音按钮 |
| 7.5 | `POST` | `/api/v1/uploads` | `+` 上传 |

实际发消息走各页 session API（见 `07`）。

### 8. `MindChatHeaderActions` + `MindChatQaHistoryPanel`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 8.1 | `POST` | `/api/v1/chat/sessions/{id}/new` | 新建对话 |
| 8.2 | `GET` | `/api/v1/chat/qa-history` | 问答历史（`locale` 决定日期格式） |

Query：`libraryId?`, `agentId?`, `days=90`

### 9. `MindChatQaHistory` / 洞察词表

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 9.1 | `GET` | `/api/v1/insights/perspectives` | AI insights 画廊 |

### 10. `me-settings-panels.tsx`

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 10.1–10.7 | 见 `08-me-tab` §9–10 | 存储、隐私、收集清单 |

### 11. 统一异步任务查询

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 11.1 | `GET` | `/api/v1/jobs/{jobId}` | 通用任务：转写、工厂、导出、洞察 |

**响应**：`{ "type", "status", "progress", "result", "error" }`
