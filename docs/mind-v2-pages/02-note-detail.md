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
