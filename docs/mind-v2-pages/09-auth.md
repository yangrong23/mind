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
