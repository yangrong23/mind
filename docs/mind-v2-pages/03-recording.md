# 03 — Recording（`RecordingPage`）

**文件**：`components/mind-v2/recording-page.tsx`

## 功能边界

**负责**

- 全屏录音 UI：计时、波形（mock）、暂停/继续、标记、设备条、设备 Sheet。
- `onClose`：放弃并离开。
- `onStop`：结束录音（**语义上「保存」**；由父级实现）。

**不负责**

- 写入文件系统、上传云端。
- 父级如何生成 `Note`（见 `MindAppV2.handleRecordingStopped`）。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `onStop` | `() => void` | 父级：`handleRecordingStopped` — 新建 `Note` + `note-detail`。 |
| `onClose` | `() => void` | 父级：回 `tabs`，不创建笔记。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onStop` | 触发父级闭环：列表出现新笔记并进入详情。 |
| `onClose` | 无新笔记，回首页 Tab。 |
| 内部 | `MindDevicesSheet` 仅本地连接状态。 |

## 鉴权

- 进入录音页由父级 `requireAuthThen` 包裹，本组件不感知登录态。

## 不在范围内

- 后台录音、锁屏续录。
