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

---

## 后端接口开发项

> Me Tab：个人资料、账户切换、积分、活动热力图、Daily review、AI insights、设置 Hub、隐私、设备、存储等。

### 1. 个人主页聚合

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1.1 | `GET` | `/api/v1/users/me/profile` | 头像、昵称、邮箱、会员等级 |
| 1.2 | `GET` | `/api/v1/users/me/stats` | 笔记数、库数、连续天数、credits 余额 |
| 1.3 | `PATCH` | `/api/v1/users/me/profile` | 更新资料（Profile Sheet） |

**`GET stats` 响应（对齐 UI）**

| 字段 | 说明 |
|------|------|
| `notesCount`, `librariesCount` | 统计 |
| `streakDays` | 连续活跃 |
| `creditsRemaining`, `creditsMonthlyAllowance` | 积分 |
| `membershipTier` | free / pro / team |

### 2. 账户切换（work / personal）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 2.1 | `GET` | `/api/v1/accounts` | 见壳层 00 |
| 2.2 | `POST` | `/api/v1/accounts/switch` | `onActiveAccountChange` |
| 2.3 | `POST` | `/api/v1/auth/logout` | `onSessionSignOut` |

### 3. 积分与套餐（Credits plans）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 3.1 | `GET` | `/api/v1/billing/credits/balance` | 当前余额 |
| 3.2 | `GET` | `/api/v1/billing/plans` | 套餐列表（月/年、赠送 credits） |
| 3.3 | `POST` | `/api/v1/billing/checkout` | 创建支付会话（Stripe 等） |
| 3.4 | `POST` | `/api/v1/billing/webhooks/payment` | 支付成功回调 → 加 credits |
| 3.5 | `GET` | `/api/v1/billing/credits/ledger` | 消费明细（按任务类型） |

**扣减触发点**：转写分钟、Chat token、Factory 任务、AI insights 生成。

### 4. 活动热力图 + 日详情

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 4.1 | `GET` | `/api/v1/users/me/activity/heatmap` | 过去 N 天每日活跃度 `[{ date, score }]` |
| 4.2 | `GET` | `/api/v1/users/me/activity/days/{date}` | 某日时间线（录音、笔记、对话） |
| 4.3 | `GET` | `/api/v1/users/me/activity/days/{date}/share-card` | 分享卡片文案（viral slogan） |

### 5. Daily review

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 5.1 | `GET` | `/api/v1/users/me/daily-review/today` | 今日回顾内容 |
| 5.2 | `POST` | `/api/v1/users/me/daily-review/generate` | 触发生成 |
| 5.3 | `POST` | `/api/v1/users/me/daily-review/dismiss` | 关闭/跳过 |

### 6. AI Insights（`MeAiInsights` + perspectives）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 6.0 | `GET` | `/api/v1/insights/corpus-stats` | 洞察顶栏统计：笔记数、知识库条目数、标签数、时间跨度（见下） |
| 6.1 | `GET` | `/api/v1/insights/perspectives` | 精选 + 分类画廊（对齐 `lib/mind-insight-perspectives.ts`） |
| 6.2 | `POST` | `/api/v1/insights/runs` | 选择 lens 生成洞察（见请求体） |
| 6.3 | `GET` | `/api/v1/insights/runs/{runId}` | 异步结果正文 |
| 6.4 | `GET` | `/api/v1/insights/runs` | 历史洞察列表 |
| 6.5 | `GET` | `/api/v1/insights/filter-presets` | 「筛选范围」：可选库、标签、日期、笔记 ID |

**产品目标**：洞察不仅读「写了什么」（Notes），还要读「沉淀与正在学什么」（Knowledge），才能判断**关注主题**与**学习动态**（新增库、归档、滚动摘要、Factory 产出、库内 Ask 等）。

#### 6.A 分析语料（Corpus）— 默认双域合并

| 域 | 包含内容 | 用于回答的问题 |
|----|----------|----------------|
| **Notes（Memos）** | 文本笔记正文、录音转写、AI 摘要、高亮/标记、标签、文件夹、来源设备、时间 | 当下在捕获什么、情绪与决策模式、会议/灵感线索 |
| **Knowledge（Notebooks）** | 各 `libraryId` 下条目正文、滚动摘要、脑图/报告等 Factory 产出、从笔记归档的条目、链接抓取/OCR 文本、库内标签与文件夹 | **长期关注什么**、主题是否在加深、哪些库在活跃、学习/研究是否在推进 |
| **行为信号（可选加权）** | 热力图活跃日、最近归档/导入、库内 Ask 主题、订阅库更新 | **学习动态**：本周是否从新领域转向、是否只记不收、某库是否突然变热 |

默认：**当前 `accountId` 下、筛选时间范围内的 Notes + 用户有权访问的全部 Knowledge 条目**一并进入 RAG/聚合；除非用户在「筛选范围」里关闭某一域或限定库列表。

#### 6.B 顶栏统计（对齐 UI）

`GET corpus-stats` 响应示例字段：

| 字段 | UI 展示 | 说明 |
|------|---------|------|
| `notesCount` | N notes | 纳入范围的笔记条数 |
| `libraryItemsCount` | M library items | 纳入范围的知识库条目总数（跨库合计） |
| `librariesCount` | （可选）K libraries | 有内容的库数量 |
| `tagCount` | T tags | Notes + Knowledge 去重后的标签数 |
| `daySpan` | D days | 最早～最晚一条语料的自然日跨度 |
| `perspectiveDefaultRange` | 各视角 `rangeLabel` | 与 `mind-insight-perspectives` 一致，服务端按视角再裁剪时间窗 |

原型顶栏可简写为：`{notesCount} notes · {libraryItemsCount} items · {tagCount} tags · {daySpan} days`。

#### 6.C `POST /insights/runs` 请求体

```json
{
  "accountId": "work",
  "perspectiveId": "value-clarity",
  "filters": {
    "dateFrom": "2026-02-18",
    "dateTo": "2026-05-18",
    "includeNotes": true,
    "includeKnowledge": true,
    "libraryIds": [],
    "noteIds": [],
    "tagIds": [],
    "includeTranscripts": true,
    "includeNoteSummaries": true,
    "includeRollingSummaries": true,
    "includeFactoryOutputs": true
  }
}
```

**生成管道建议**：先按 `filters` 拉取 Notes + Library items → 检测 `corpusProfile` 并生成 **`adaptationPlan`（有什么用什么）** → 分块 + `utilizationHint` → 按 **视角主题** 选读法（非固定双域门槛）→ 套用 `perspectiveId` prompt → 输出 JSON（含 `materialBasis`、`evidence`，少素材时缩 scope 但不失败）。详见 [08-me-ai-insights-prompts.md](./08-me-ai-insights-prompts.md) §0。

**合规**：语料含个人与第三方内容；生成前需账户级「允许 AI 分析我的笔记与知识库」勾选；团队库仅分析用户有读权限的条目；对外分享走脱敏摘要接口。

---

## 产品设计：Me AI 洞察（参考 flomo + Mind 差异）

> 调研来源：[flomo AI 洞察帮助页](https://help.flomoapp.com/ai/insight.html)、[相关笔记](https://help.flomoapp.com/ai/xgbj.html)、2025 年度信、少楠访谈（量子位 / AI闹）、5.0「多视角洞察」公开介绍。

### A. flomo 做了什么（可借鉴）

| 维度 | flomo 做法 |
|------|------------|
| **定位** | 「思维伙伴」：挖掘笔记背后隐藏模式，**不**提效、**不**代写、**不**改笔记 |
| **核心公式** | `解释 = 加工方式（视角 prompt）× (事实, 视角)` — 同一批笔记换 lens 得不同报告 |
| **入口（上下文）** | ① **相关笔记**列表底部 ② **找一找**搜索结果底部；5.0 起增加全屏「选视角」入口 |
| **语料** | 用户**选定范围**内的 MEMO（非全库硬塞）；依赖 **向量化 + 相关笔记** 先召回再压缩（上下文有限） |
| **筛选** | 顶栏 `N 条笔记 / N 标签 / N 天` + **筛选范围**（日期、标签、关键词）；可在相关笔记内二次洞察 |
| **视角库** | 默认洞察 → 多视角画廊（逆向思考、二阶思考、价值澄清、知识处理风格…）+ **自定义视角** + 社区共享 lens |
| **每个视角** | 独立 system prompt（常由领域作者调校）；默认时间窗不同；输出**洞察报告**（几百字） |
| **输出原则** | **不提供「一键存入笔记」**（避免污染真实语料）；鼓励分享卡片；**暂不做**洞察内追问（与 Chat 边界不清） |
| **配套** | 每日回顾（轻、随机回顾）+ AI 洞察（重、深度分析）；相关笔记（发现关联）是洞察前置能力 |
| **商业化** | PRO 2 次/天、MAX 50 次/天；按 credits 控成本 |
| **迭代重点** | 默认 prompt 迭代 100+ 版；选**有代表性的笔记**、报告**有依据**；后续：个人背景、更好模型、追问（规划中） |

### B. Mind 与 flomo 的关键差异（必须不同）

| flomo | Mind（本产品） |
|-------|----------------|
| 单一 MEMO 流 | **Notes（捕获）+ Knowledge（沉淀）** 双域语料 |
| 卡片短、语义检索即可 | 录音转写长文本、库内长文、Factory 产出、滚动摘要 |
| 无「知识库」层 | 需回答 **关注什么 / 学习动态**（归档、库活跃、主题加深） |
| 入口偏「单条笔记上下文」 | Me 是**账户级自省**入口，但仍需支持 **从笔记/库/标签钻入** 的上下文洞察 |
| 无 Agent 对话 | **Clawbot / 库内 Ask** 独立；洞察 **不**做成第二个 Chat |

### C. Me AI 洞察 — 推荐产品结构

#### C.1 与 Daily review 分工

| 功能 | 频率 | 语料 | 输出 | 情绪 |
|------|------|------|------|------|
| **Daily review** | 每日 | 昨日/近日 Notes（可含 1 条库摘要句） | 短摘要 + 1 条建议 | 轻、穿越感 |
| **AI insights** | 按次消耗 credits | Notes + **Knowledge** 双域（可筛） | 视角报告 + 可分享卡片 | 深、可能「扎心」 |

两者可互相导流：Daily review 文末链到「用 XX 视角深入看本周」。

#### C.2 入口（三层，对齐 flomo「上下文优先」）

1. **Me → AI insights**（已有）：账户级默认语料 + 视角选择器（主入口）。
2. **Notes**：笔记详情 / 标签页 / 搜索结果 → 「相关捕获」底部 → **在此范围洞察**（预填 `noteIds` / `tagIds`）。
3. **Knowledge**：单库 Hub / 条目列表 / 库内搜索 → 「在此库洞察」（预填 `libraryIds`）；强调**学习线**而非散备忘。

#### C.3 语料管道（实现思路）

```text
用户确认范围（顶栏 stats + 筛选范围）
    → 双域拉取：Notes ∪ Library items（含 transcript、summary、rolling summary、factory 产出）
    → 向量化召回 + 主题聚类（无法全量进 context 时，与 flomo 一样先选「代表性片段」）
    → 按 perspectiveId 加载 prompt 模板 + 该视角默认 timeRange
    → LLM 生成报告（必须带「依据摘录」区块，防幻觉）
    → 仅 session 展示 + 可选分享；默认不写回 Notes/Knowledge
```

**顶栏统计（已实现原型方向）**：`notes · library items · tags · days`，筛选后刷新 `GET corpus-stats`。

**学习动态信号（Mind 独有，写入 prompt 上下文，不占用户笔记）**：

- 近 7/30 天新归档到库的数量、最活跃 `libraryId`
- 库内滚动摘要 diff（主题是否迁移）
- 热力图活跃 vs 库条目增长（「只记不收」检测）

#### C.4 视角库（模板分层）

对齐 `lib/mind-insight-perspectives.ts`，分三层运营：

| 层级 | 示例 | 说明 |
|------|------|------|
| **Featured（Me 首屏）** | 默认洞察、价值澄清、逆向思考、二阶思考、知识处理风格（MBTI 启发） | 与 flomo 5.0 首屏一致，降低认知成本 |
| **Gallery 分类** | Review / Self-awareness / Thinking / Master lenses | 画廊发现更多 |
| **Custom（P2）** | 用户自定义 prompt + 默认范围 | 可投稿/共享（flomo 社区 lens） |

每个视角配置（服务端，不只前端 mock）：

```ts
{
  id, title, author, description, icon,
  defaultRange: "last_3_months" | "all" | ...,
  systemPrompt,           // 专业框架（各视角固定输出结构）
  outputSchema,           // 固定段落：主题 / 盲区 / 问题 / 依据
  corpusHints: {          // Mind 扩展
    weightNotes: 0.5,
    weightKnowledge: 0.5,
    includeLearningSignals: true
  }
}
```

#### C.5 结果页 UX（学 flomo，克制）

- 标题 = 视角名 + 生成时间 + 范围摘要（`12 notes · 34 items · last 90d`）。
- 正文：洞察段落 + **「依据」**（可展开原文摘录，链回 note/item）。
- 操作：**分享**、**换视角再生成**、**调整范围**；**不要**默认「存入知识库」。
- **不做**首版「洞察追问」；与 Agent Tab / 库内 Ask 分流（flomo 亦暂缓）。
- 历史：顶栏时钟 → `GET /insights/runs`（报告只读，不进语料）。

#### C.6 配额与成本

- 计入 Me credits（与转写、Factory 并列）；免费档每日 1 次、Pro N 次（可对齐 flomo 量级做 A/B）。
- 长语料先召回再生成，避免单次塞满 全库转写。

#### C.7 分期落地

| 阶段 | 交付 |
|------|------|
| **P0** | Me 视角选择器 + 真实 `corpus-stats` + `POST runs` 双域语料 + 6 个 featured 视角 + 分享 |
| **P1** | 筛选范围 Sheet；Notes/Knowledge 上下文入口；报告依据摘录与深链 |
| **P2** | 自定义视角；学习动态信号；2 个 Mind 独占 lens；历史列表 |
| **P3** | 社区共享 lens；可选「个人背景」档案（flomo AI 记忆档案类比） |

### D. 与现有组件映射

| UI | 文件 |
|----|------|
| Me 入口 | `me-tab.tsx` → `MeAiInsights` |
| 视角数据 | `lib/mind-insight-perspectives.ts` → 迁服务端 `GET perspectives` |
| 筛选 / 历史 | `me-ai-insights.tsx` 待接 `filter-presets`、`runs` |
| 后端契约 | 本章 §6 + §6.A–C |
| **提示词与数据参数** | [08-me-ai-insights-prompts.md](./08-me-ai-insights-prompts.md)（简版：接口输入、统一输出、各视角 system prompt） |

### 7. 分享卡片（Me 页 Share）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 7.1 | `POST` | `/api/v1/users/me/share-cards` | 生成可分享图片/链接 |
| 7.2 | `GET` | `/api/v1/share-cards/{token}` | 公开读取 |

### 8. Settings Hub

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 8.1 | `GET` | `/api/v1/users/me/settings` | 所有设置项快照 |
| 8.2 | `PATCH` | `/api/v1/users/me/settings` | 批量更新 |

**设置项分组**

| 键 | UI 入口 | 说明 |
|----|---------|------|
| `display.theme` | Display | light / dark / system |
| `display.fontZoomPercent` | Display | 字号缩放 |
| `notifications.*` | Notifications | 推送开关 |
| `cloudSync.enabled` | Cloud sync | 私有云同步 |
| `personalization.*` | Personalization | 转写语言、摘要风格 |
| `privacy.*` | Privacy | 见 §9 |

### 9. 存储空间（`MeStorageSpacePanel`）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 9.1 | `GET` | `/api/v1/users/me/storage` | 总用量、Notes/KB 分项 |
| 9.2 | `POST` | `/api/v1/users/me/storage/cleanup` | 清理缓存/临时文件 |
| 9.3 | `GET` | `/api/v1/users/me/storage/breakdown` | 大文件列表 |

### 10. 隐私合规

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 10.1 | `GET` | `/api/v1/legal/privacy/guide` | 隐私指引摘要 |
| 10.2 | `GET` | `/api/v1/legal/privacy/collected-info` | 收集个人信息清单 |
| 10.3 | `GET` | `/api/v1/legal/privacy/third-party` | 第三方共享清单 |
| 10.4 | `GET` | `/api/v1/users/me/privacy-settings` | 用户隐私开关 |
| 10.5 | `PATCH` | `/api/v1/users/me/privacy-settings` | 更新（个性化推荐、crash 上报等） |
| 10.6 | `POST` | `/api/v1/users/me/data-export` | 申请导出个人数据 |
| 10.7 | `POST` | `/api/v1/users/me/account-deletion` | 注销账号 |

### 11. 设备与词表（Device Sheet）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 11.1 | 见 `01` devices API | 设备列表/同步 |
| 11.2 | `GET` | `/api/v1/users/me/lexicon` | 自定义词表 tags |
| 11.3 | `PUT` | `/api/v1/users/me/lexicon` | 更新词表（同步 ASR） |
| 11.4 | `GET` | `/api/v1/users/me/offline-capture` | 离线采集设置 |

### 12. 帮助与关于

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 12.1 | `GET` | `/api/v1/support/faq` | 帮助中心 |
| 12.2 | `POST` | `/api/v1/support/feedback` | 用户反馈 |
| 12.3 | `GET` | `/api/v1/app/version` | 关于页版本信息 |

### 13. 邀请有礼（若启用）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 13.1 | `GET` | `/api/v1/referrals/me` | 邀请码、奖励状态 |
| 13.2 | `POST` | `/api/v1/referrals/redeem` | 兑换邀请码 |
