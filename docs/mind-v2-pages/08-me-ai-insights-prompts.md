# Me AI 洞察 — 提示词规格（简版）

**关联**：[08-me-tab.md](./08-me-tab.md) §6 · 前端视角 `lib/mind-insight-perspectives.ts`

**原则（5 条）**

1. 只读用户 **Notes + Knowledge** + **学习动态**（元数据），不引入外部知识，不写回笔记/库。
2. 有什么分析什么；禁止正文出现「无法分析 / 语料不足 / 分析失败」。
3. Notes 与库 **不设生成阶段固定权重**；按视角主题语义选用、对照证据。
4. 每条核心判断尽量带 `evidence`（摘录或 `signal`）。
5. 输出是**一次性报告**，不是对话。

---

## 1. 接口

### 1.1 请求 `POST /api/v1/insights/runs`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `accountId` | string | ✓ | 工作空间 |
| `perspectiveId` | string | ✓ | 见 §5 视角表 |
| `locale` | string | | 默认 `zh-CN` |
| `filters.dateFrom` / `dateTo` | ISO8601 | | 未传则用该视角默认范围 |
| `filters.includeNotes` | boolean | | 默认 `true` |
| `filters.includeKnowledge` | boolean | | 默认 `true` |
| `filters.noteIds` | string[] | | 上下文入口预填 |
| `filters.libraryIds` | string[] | | 上下文入口预填 |
| `filters.tagIds` / `folderIds` | string[] | | 可选 |
| `filters.keyword` | string | | 可选 |
| `filters.contextNoteId` | string | | 从某条笔记发起时 |

### 1.2 响应

| 情况 | HTTP | 说明 |
|------|------|------|
| 成功 | 200 | 正文为 §4 统一 JSON |
| 完全无语料 | 4xx `INSIGHT_CORPUS_EMPTY` | 无 chunk 且无可用 signal 时仅此 |

辅助：`GET /api/v1/insights/corpus-stats` → 顶栏「N 笔记 · M 库条目 · 标签 · 天数」。

---

## 2. 送入模型的内容

服务端组装后写入 **user message**（模型可见三部分）。

### 2.1 语料块 `chunks[]`（每条）

| 字段 | 说明 |
|------|------|
| `chunkId` | 如 `note:1001#summary`、`library:42#body` |
| `sourceType` | `text_note` \| `transcript` \| `aiSummary` \| `library_item` \| `rolling_summary` \| `factory_report` \| `import` |
| `text` | 送入模型的正文（可截断） |
| `createdAt` | ISO8601 |
| `libraryId` / `noteId` | 可选，深链用 |

### 2.2 学习动态 `learningSignals`（元数据，非用户原话）

| 字段 | 说明 |
|------|------|
| `captureToCorpus.archiveRate30d` | 近 30 天归档率 |
| `captureToCorpus.topLibraryIds` | 最常沉淀的库 |
| `rollingSummaryDrift` | 库滚动摘要主题是否迁移（文案） |
| `heatmap.activeDaysLast30d` | 活跃天数 |

### 2.3 User message 模板

```markdown
## 分析范围
视角：{{perspectiveTitle}} · {{dateFrom}} ~ {{dateTo}}
统计：{{notesCount}} 笔记 · {{libraryItemsCount}} 库条目 · {{daySpan}} 天

## 学习动态
```json
{{learningSignalsJson}}
```

## 语料块
```json
{{chunksJson}}
```

请完成本视角报告；对全部语料做语义分析，不要拒答。
```

每条 **system prompt**（§6）末尾拼接 §3 **全局守卫**。

---

## 3. 全局守卫（每条 system 末尾）

```text
1. 只根据语料块与学习动态分析；禁止编造未出现的具体人名、项目、数字。
2. 禁止「无法分析」「语料不足」「分析失败」等拒答表述。
3. 块少时仍输出完整结构（headline、body、≥3 个 questions）；confidence 可标 low。
4. 核心判断须有 evidence（chunk 摘录或 evidenceType=signal）。
5. 不替用户做决定；`mbti`（知识处理风格）须免责声明；禁止写「已保存到笔记/库」。
6. 填写 materialBasis：客观列出本次用了哪些来源。
```

---

## 4. 统一输出 JSON

```json
{
  "perspectiveId": "value-clarity",
  "title": "价值澄清",
  "rangeSummary": "近 3 个月 · 2 笔记 · 15 库条目",
  "sections": {
    "headline": "一句核心洞察（≤30 字）",
    "bodyMarkdown": "分段 Markdown 正文",
    "materialBasis": "本次纳入：N 笔记、M 库条目、…（客观枚举）",
    "scopeNote": null,
    "blindSpots": ["盲区 1"],
    "questions": ["反思问题 1", "问题 2", "问题 3"],
    "suggestedNextStep": "一个最小可执行的反思动作"
  },
  "evidence": [
    {
      "chunkId": "note:1001#summary",
      "quote": "≤40 字摘录或信号描述",
      "whyItMatters": "支持哪条判断",
      "evidenceType": "chunk"
    }
  ],
  "corpusMeta": {
    "chunksUsed": 12,
    "notesUsed": 2,
    "libraryItemsUsed": 10,
    "confidence": "high"
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `sections.headline` | ✓ | 分享卡片主标题 |
| `sections.bodyMarkdown` | ✓ | 主正文 |
| `sections.questions` | ✓ | ≥3 条 |
| `sections.blindSpots` | | 无则 `[]` |
| `sections.suggestedNextStep` | | 建议有 |
| `evidence[]` | ✓ | 至少 1 条；可含 `evidenceType: "signal"` |
| `corpusMeta.confidence` | ✓ | `high` \| `medium` \| `low` |

---

## 5. 视角一览（输入 · 输出）

| perspectiveId | 默认时间范围 | 所需输入（召回） | 输出侧重 |
|---------------|--------------|------------------|----------|
| **首屏 Featured** |
| `default` | 全部（≤365 天） | Notes + 库；`learningSignals` | 3–5 主题；捕获 vs 沉淀；3–5 个问题 |
| `value-clarity` | 近 90 天 | 同上；偏价值/取舍词句 | 宣称 / 揭示 / 冲突 三段 + 盲区 |
| `reverse-thinking` | 近 1 年 | 同上；偏计划/风险/担心 | 1–3 个赌注：失败路径 + 护栏 |
| `second-order` | 近 6 月 | 同上；偏短期决策/赶工 | 一阶决策 → 二/三阶后果 |
| `mbti` | 全部 | 同上；口语+书面混读 | 知识获取/处理倾向（MBTI 启发四维）+ 依据 + 反证 |
| **画廊 Gallery** |
| `daily-affirmation` | 近 1 天 | Notes 为主 | 温暖 headline；小 win；questions 可少 |
| `action-guide` | 近 1 年 | Notes + 库 | `suggestedNextStep` 列 3 条可执行项 |
| `meaning-radar` | 近 6 月 | Notes + 库 | 意义高峰/低谷场景 |
| `key-figures` | 近 90 天 | Notes；人名/关系 |  recurring 人物 + 影响 |
| `compound-flywheel` | 近 1 年 | Notes + 库 | 飞轮四节点 + 缺齿 |
| `main-contradiction` | 近 90 天 | Notes + 库 | 一个主矛盾 + 调和实验 |
| `munger` | 全部 | Notes + 库 | 逆向/激励/能力圈 检查清单 4–6 条 |
| `aristotle` | 全部 | Notes + 库 | 质料/形式/动力/目的 四因 |

**召回备注（实现用，非生成权重）**：按各视角 `topicQuery` 在 Notes∪库 检索 top-K（通常 20–48 块）；某域无命中则把另一域全部命中块 + signals 交给模型即可。

---

## 6. 各视角 System Prompt

### 6.1 默认洞察 `default`

```text
你是 Mind「默认洞察」分析器：阅读用户 Notes 与 Knowledge，找出重复主题、隐含假设与未闭合循环。

【步骤】
1. 语料聚类为 3–5 个主题。
2. 识别重复情绪、决策模式、拖延、人际模式。
3. 对比捕获层 vs 沉淀层：只记在笔记 vs 已入库的主题。
4. 结合 learningSignals 点出「只记不收」或「学以致用」（若有）。
5. 给出 3–5 个深刻问题。

【输出】headline + bodyMarkdown + blindSpots + questions；body 按主题分段，不罗列摘要。
```

### 6.2 价值澄清 `value-clarity`

```text
你是「价值澄清」视角：从记录推断用户真正看重什么。

【框架】bodyMarkdown 分三段：
- 宣称价值（用户写下的原则/目标）
- 揭示价值（行为与时间分配反推）
- 冲突价值（两组价值的张力）

【输出】blindSpots（价值盲区）+ questions（帮助排序，不给人生答案）。
```

### 6.3 逆向思考 `reverse-thinking`

```text
你是芒格式「逆向思考」分析器：问「若要确保失败，现在正在做什么」。

【步骤】
1. 提取 1–3 个当前赌注/计划。
2. 每赌注：3 条失败路径（须有 evidence）+ 对应护栏（一周内可试）。
3. archiveRate 低时，可将「只捕获不沉淀」列为结构风险。

【输出】bodyMarkdown 按「### 赌注 N」+ 失败路径/护栏 列表。
```

### 6.4 二阶思考 `second-order`

```text
你是「二阶思考」分析器：识别一阶决策（求快、求对齐、先记下再说），推演二阶、三阶后果。

【步骤】
1. 列出 2–4 个反复一阶决策。
2. 每项写：二阶效应、三阶效应（若能推断）、谁承担成本。
3. 库内滚动摘要/Factory 产出可对照「冲动捕获 vs 冷静沉淀」。

【输出】suggestedNextStep：针对最突出赌注做 15 分钟「后果扫描」。
```

### 6.5 知识处理风格 `mbti`

```text
你是「知识获取与处理风格」分析器（借用 MBTI 四维作隐喻，非正式人格测评）。从用户如何记、如何连、如何把笔记变成可用知识来推断：

对 E/I、S/N、T/F、J/P 每一维：
- 倾向（偏获取广度 vs 深度、偏具象材料 vs 抽象联结、偏逻辑整理 vs 价值取舍、偏开放探索 vs 收口交付）
- 置信度（低/中/高）
- 2 条语料 quote（须来自 Notes 或库）
- 1 条反证（无则写无）

【硬性】首段声明：基于文字的假设，描述的是学习与知识处理方式，不能替代正式 MBTI/心理测评；禁止命运论式贴标签。

【输出】bodyMarkdown 按四维分段；块极少时未填满的维可写「现有文字尚不足以区分」。questions 帮助用户优化记法或库结构，而非贴人格标签。
```

### 6.6 画廊视角（简版 prompt）

**`daily-affirmation`** — 从近 1 天记录中找 2–3 个小 win；温暖 headline；1 条鼓励型 suggestedNextStep；questions 1–2 条即可。

**`action-guide`** — 从犹豫/卡点聚类；`suggestedNextStep` 写 3 条「负责人+日期+最小一步」；body 列 open loops。

**`meaning-radar`** — 标出意义高峰/低谷场景；归纳核心动机一句；questions 帮用户对齐日常与动机。

**`key-figures`** — 列出 3–5 个反复出现的人；每人：角色、对你的影响、一条相处建议；须 evidence。

**`compound-flywheel`** — 画飞轮 4 节点（捕获→整理→复用→结果）；标缺失齿；一条闭合飞轮的习惯。

**`main-contradiction`** — 只选一个主矛盾（如快 vs 深）；两边证据；一个 7 天调和实验。

**`munger`** — 4–6 条芒格式检查（逆向、激励、能力圈、安全边际等），每条绑一条 evidence。

**`aristotle`** — 四因说：质料/形式/动力/目的，各 1 段，对应用户当前最重要的一件事。

---

## 7. 召回参数（默认值）

| 项 | 值 |
|----|-----|
| `maxChunks` | 36–50（见视角表，实现可配） |
| `minChunks` | 1（有则全部分析，不拒答） |
| `embeddingModel` | 按账户配置 |
| `rerank` | true |
| `diversityLambda` | 0.35 |

各视角 `topicQuery`（召回关键词）实现时与 `perspectiveId` 同表配置即可，本文档不展开。
