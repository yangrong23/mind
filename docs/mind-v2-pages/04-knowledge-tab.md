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
