# 08 — Me Tab（`MeTab`）

**文件**：`components/mind-v2/me-tab.tsx`

## 功能边界

**负责**

- 个人头部、账户切换 Sheet、统计与热力图、Daily review / AI insights、设置 Hub 与大量子 Sheet（设备、云同步、偏好、隐私、帮助等）。
- **Sign out**（账户 Sheet 内）：若传入 `onSessionSignOut` 则走 demo 登出；否则 toast「Signed out」demo。

**不负责**

- 真实账户系统、支付、推送权限。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `activeAccountId` | `MindAccountId` | 当前账号。 |
| `onActiveAccountChange` | `(id: MindAccountId) => void` | 切换账号。 |
| `onSessionSignOut` | `() => void?` | **MindAppV2** 传入：清 demo 会话并回 Notes。 |
| `onSettingsClick` | `() => void?` | 可选；当前原型未强制使用。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onActiveAccountChange` | 更新父级账号。 |
| `onSessionSignOut` | 清 `sessionStorage`、重置视图。 |
| 大量 `toast` | 设置项、分享、导出队列等 demo 反馈。 |

## 功能边界（原型说明）

- 多数设置项为 **即时 toast / 本地 toggle**，不写后端。
- Knowledge map 等标注 coming soon。

## 关联

- `mind-devices-sheet.tsx`、`social-share-row.tsx`
