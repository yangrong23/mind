# 04 — Knowledge Tab + Library Plaza

**文件**：`components/mind-v2/knowledge-tab.tsx`、`components/mind-v2/library-plaza-view.tsx`

## 4.1 Knowledge Tab

### 功能边界

**负责**

- 分类切换（Mine / Team / Following）与列表渲染（`MOCK_KNOWLEDGE_BASES`）。
- 「Plaza」→ 全屏 `LibraryPlazaView`。
- 点击卡片 → `onKBClick(kb)`（**无鉴权**，可浏览知识库详情）。

**不负责**

- 知识库详情内部（`KnowledgeDetail`）。

### 输入 / 输出

| Prop | 方向 | 说明 |
|------|------|------|
| `onKBClick` | 输出 | `(kb: KnowledgeBase) => void` → 父级 `kb-detail`。 |

---

## 4.2 Library Plaza

### 功能边界

**负责**

- 搜索过滤、Featured 列表、Refresh（toast）。
- `onPickLibrary` 存在时：点击行 → 回调并可选由父级关闭 Plaza。

**不负责**

- 订阅/关注后端。

### 输入 / 输出

| Prop | 方向 | 说明 |
|------|------|------|
| `onBack` | 输出 | 关闭 Plaza 子视图。 |
| `onPickLibrary` | 输出 | `(kb) => void`；**KnowledgeTab** 中绑定为 `onKBClick` + `setShowDiscover(false)`。 |
| `subtitle` | 输入 | 可选副标题。 |

### 其他引用

- **AgentTab** 内嵌 Plaza：`onPickLibrary={handlePlazaPick}`，用于把库加入 Agent 资料范围（toast + state），不打开 `kb-detail`。

---

## 后端接口开发项

### 4.1 Knowledge Tab

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/libraries` | 按分类列出知识库 |
| 1.2 | `GET` | `/api/v1/libraries/{libraryId}` | 单库摘要（进入详情前预取） |

**`GET /api/v1/libraries` Query**

| 参数 | 说明 |
|------|------|
| `category` | `mine\|team\|subscribed`（对应 Mine / Team / Following） |
| `accountId` | 工作空间 |
| `q` | 搜索名称/描述 |
| `sort` | `updated_desc\|name_asc\|subscriber_desc` |
| `cursor`, `limit` | 分页 |

**列表项（对齐 `KnowledgeBase`）**

| 字段 | 类型 |
|------|------|
| `id` | string |
| `name`, `description` | string |
| `category` | enum |
| `count` | number（条目数） |
| `lastUpdate` | string / ISO8601 |
| `color` | string（渐变 token 或 hex） |
| `coverImage` | url |
| `subscribers` | number?（公开/订阅库） |
| `viewCount` | number? |
| `publicTagline`, `publisherName` | string? |
| `role` | `owner\|editor\|viewer`（当前用户权限） |

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.3 | `POST` | `/api/v1/libraries` | 新建个人库（若 Tab 有入口） |
| 1.4 | `GET` | `/api/v1/libraries/categories/counts` | 各 Tab 角标数量 |

**鉴权**：浏览详情 `onKBClick` **可不登录**（公开订阅库只读）；写操作需登录（见 05）。

---

### 4.2 Library Plaza

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/library-plaza/featured` | 精选推荐列表 |
| 2.2 | `GET` | `/api/v1/library-plaza/search` | Plaza 内搜索 `q` |
| 2.3 | `POST` | `/api/v1/libraries/{libraryId}/subscribe` | 订阅公开库（Following） |
| 2.4 | `DELETE` | `/api/v1/libraries/{libraryId}/subscribe` | 取消订阅 |
| 2.5 | `GET` | `/api/v1/library-plaza/categories` | 分类筛选（专利、研究等） |
| 2.6 | `POST` | `/api/v1/library-plaza/refresh` | 服务端刷新推荐（非必须；前端 Refresh 可触发重新拉 2.1） |

**`POST subscribe` 响应**：`{ "libraryId", "subscribedAt", "category": "subscribed" }`

**AgentTab 内嵌 Plaza**（不打开 kb-detail）：仅调用 `2.1/2.2` + 将库 ID 加入 Agent 上下文：

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.7 | `PUT` | `/api/v1/agents/{agentId}/library-scope` | 保存资料范围 `libraryIds[]`（Minder @ 选择） |

### 错误码

| code | 说明 |
|------|------|
| `LIBRARY_NOT_FOUND` | 404 |
| `ALREADY_SUBSCRIBED` | 409 |
| `SUBSCRIPTION_LIMIT` | 403 订阅数上限 |
