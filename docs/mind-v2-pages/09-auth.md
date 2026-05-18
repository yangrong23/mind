# 09 — Auth（`MindAuthScreens`）

**文件**：`components/mind-v2/mind-auth-screens.tsx`

## 功能边界

**负责**

- 落地页：Sign in / Create account；可选返回（`onDismiss` → 关闭遮罩）。
- 表单页：邮箱 + 密码；Sign in ↔ Create account 切换。
- **Demo 校验**：非空即 `onAuthenticated` + `toast.success`。

**不负责**

- 真实 OAuth、密码规则、错误码、邮箱验证。

## 输入（Props）

| Prop | 类型 | 说明 |
|------|------|------|
| `onAuthenticated` | `() => void` | 父级：`handleAuthenticated`（写 session、关遮罩、执行 `pendingAfterAuth`）。 |
| `onDismiss` | `() => void?` | 关闭遮罩并清空 pending（仅落地页显示返回）。 |

## 输出

| 通道 | 说明 |
|------|------|
| `onAuthenticated` | 登录成功闭环。 |
| `onDismiss` | 取消登录流。 |
| `toast` | 成功 / 缺字段错误。 |

## 与壳的关系

- 由 `MindAppV2` 以 **绝对定位全屏遮罩** 渲染，`z-index` 高于底部栏。
- 不单独占 `View` 类型；与 `authOverlayOpen` 绑定。

## 不在范围内

- 忘记密码、第三方登录、生物识别。

---

## 后端接口开发项

> 全屏鉴权遮罩：登录、注册、会话持久化（替代 `sessionStorage` demo）。

### 1. 注册

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `POST` | `/api/v1/auth/register` | 邮箱+密码注册 |
| 1.2 | `POST` | `/api/v1/auth/register/verify-email` | 邮箱验证码确认 |
| 1.3 | `POST` | `/api/v1/auth/register/resend` | 重发验证邮件 |

**`POST register` 请求**

| 字段 | 约束 |
|------|------|
| `email` | 格式校验、唯一性 |
| `password` | 最少 8 位、复杂度策略 |
| `displayName` | 可选 |
| `acceptPrivacyPolicy` | 必须为 true |
| `inviteCode` | 可选 |

**响应**：`{ "userId", "accessToken", "refreshToken", "expiresIn" }` 或 `{ "pendingVerification": true }`

### 2. 登录

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `POST` | `/api/v1/auth/login` | 邮箱+密码（Sign in 表单） |
| 2.2 | `POST` | `/api/v1/auth/login/otp` | 手机号 OTP（扩展） |
| 2.3 | `POST` | `/api/v1/auth/login/otp/verify` | 验证 OTP |

**`POST login` 响应**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "rt_...",
  "expiresIn": 3600,
  "user": { "id", "email", "displayName", "avatarUrl" },
  "accounts": [{ "id": "work", "label": "Work" }]
}
```

**错误码**

| code | HTTP | 前端处理 |
|------|------|----------|
| `INVALID_CREDENTIALS` | 401 | toast 错误 |
| `EMAIL_NOT_VERIFIED` | 403 | 引导验证页 |
| `ACCOUNT_LOCKED` | 423 | 锁定提示 |
| `RATE_LIMITED` | 429 | 稍后重试 |

### 3. OAuth（扩展）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `GET` | `/api/v1/auth/oauth/{provider}/authorize` | Apple / Google / WeChat |
| 3.2 | `GET` | `/api/v1/auth/oauth/{provider}/callback` | 回调换 token |
| 3.3 | `POST` | `/api/v1/auth/oauth/bind` | 已登录用户绑定第三方 |

### 4. 会话（与壳层联动）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/auth/session` | 启动恢复登录态 |
| 4.2 | `POST` | `/api/v1/auth/refresh` | 刷新 token |
| 4.3 | `POST` | `/api/v1/auth/logout` | 登出 |

**客户端存储建议**：`accessToken` 内存 + `refreshToken` httpOnly cookie（优于 demo `sessionStorage`）。

### 5. 忘记密码（扩展）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `POST` | `/api/v1/auth/password/forgot` | 发送重置邮件 |
| 5.2 | `POST` | `/api/v1/auth/password/reset` | token + 新密码 |

### 6. 安全

| 项 | 说明 |
|----|------|
| 密码哈希 | Argon2id / bcrypt |
| 防暴力 | IP + 账号维度限流 |
| 设备指纹 | 可选记录新设备登录通知 |
| 审计 | `auth.login.success` / `failed` 日志 |

### 7. `onAuthenticated` 后续

登录成功后客户端依次调用：

1. `GET /api/v1/auth/session`
2. `GET /api/v1/bootstrap`
3. 执行 `pendingAfterAuth` 队列中的首个操作（如 `POST recording-sessions`）
