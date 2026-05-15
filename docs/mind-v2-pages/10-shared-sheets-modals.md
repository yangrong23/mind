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
