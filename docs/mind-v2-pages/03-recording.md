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

---

## 后端接口开发项

> 全屏录音：`RecordingPage` 负责采集 UI；持久化、上传、建笔记由服务端与壳层 `handleRecordingStopped` 完成。

### 1. 录音会话生命周期

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `POST` | `/api/v1/recording-sessions` | 开始录音（进入页面前/时调用，需登录） |
| 1.2 | `PATCH` | `/api/v1/recording-sessions/{sessionId}` | 暂停/继续、更新元数据 |
| 1.3 | `POST` | `/api/v1/recording-sessions/{sessionId}/bookmarks` | 添加标记点 `{ "offsetMs": 12345 }` |
| 1.4 | `DELETE` | `/api/v1/recording-sessions/{sessionId}` | 放弃录音 `onClose`：取消会话 |
| 1.5 | `POST` | `/api/v1/recording-sessions/{sessionId}/complete` | 结束 `onStop`：_finalize 并创建 note |

**`POST recording-sessions` 请求**

| 字段 | 类型 | 说明 |
|------|------|------|
| `accountId` | string | 工作空间 |
| `source` | `hardware\|phone\|app` | 录音来源 |
| `deviceId` | string? | 硬件 ID |
| `expectedFormat` | string | 如 `audio/wav` |

**响应**：`{ "sessionId", "uploadId", "chunkSizeBytes", "maxDurationMs" }`

### 2. 音频上传（分片）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `POST` | `/api/v1/uploads/{uploadId}/parts` | 申请分片预签名 URL 列表 |
| 2.2 | `PUT` | `{presignedUrl}` | 客户端直传对象存储 |
| 2.3 | `POST` | `/api/v1/uploads/{uploadId}/complete` | 合并分片，校验 MD5 |
| 2.4 | `GET` | `/api/v1/uploads/{uploadId}/status` | 上传/合并状态 |

### 3. 完成录音 → 创建笔记（`complete`）

**`POST .../complete` 请求**

| 字段 | 说明 |
|------|------|
| `durationMs` | 实际时长 |
| `title` | 可选自动标题 |
| `bookmarks` | 标记数组 |

**响应（供壳层跳转 note-detail）**

```json
{
  "noteId": "note_abc",
  "title": "Recording May 18 09:48",
  "status": "pending",
  "transcriptionJobId": "job_xyz"
}
```

### 4. 设备条（MindDevicesSheet）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/devices/primary` | 连接态、电量（见 01） |
| 4.2 | `POST` | `/api/v1/devices/{deviceId}/heartbeat` | 录音中周期性上报（可选） |

### 5. 实时波形（可选增强）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | WebSocket | `/ws/v1/recording-sessions/{id}` | 推送电平/波形采样（当前 UI 为 mock） |

### 6. 限流与配额

| 检查点 | 说明 |
|--------|------|
| 创建 session | 检查当月录音分钟数、并发 session 数 |
| complete | 检查存储配额；超限返回 `QUOTA_EXCEEDED` |

### 7. 错误码

| code | 场景 |
|------|------|
| `SESSION_EXPIRED` | 会话超时未完成 |
| `UPLOAD_INCOMPLETE` | 分片未齐 |
| `DEVICE_DISCONNECTED` | 硬件断连中断 |
| `RECORDING_TOO_SHORT` | 低于最小时长拒绝 complete |
