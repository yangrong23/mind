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
