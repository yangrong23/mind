# Mind V2 页面与功能治理手册

> **用途**：与团队对齐「有哪些界面、各自要达成什么、谁负责什么、做到哪一步」，便于分工、排期与站会同步进度。  
> **范围**：当前仓库内 **单页演示应用**（`app/page.tsx` → `MindAppV2`），数据均为 **前端 mock**，无独立后端实现。  
> **关联文档**：后端与数据域总览见 [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md)；设计色与 token 见 `lib/medrix-design-tokens.ts`。

---

## 1. 产品与技术上下文

| 项目 | 说明 |
|------|------|
| 入口 | `app/page.tsx` 渲染 `components/mind-v2/mind-app-v2.tsx` |
| 呈现形态 | 居中「手机框」容器（约 390×844），含刘海、状态栏、Home Indicator |
| 路由 | 无 Next.js 多路由；**视图由 `currentView` 状态机**在单容器内切换 |
| 账户 | `lib/mind-accounts.ts`：`work` / `personal` 双空间，影响 Notes / Me 等处的标签与强调色 |
| 数据 | 列表、转写、知识库、Agent 等均为组件内常量或 `useState` 本地状态 |
| 分享 | `lib/share-social.ts` + `social-share-row.tsx`：Web Intent / 剪贴板，占位 URL `https://mind.app/share` |

---

## 2. 全局导航与视图状态机

### 2.1 底栏 Tab（仅 `currentView.type === "tabs"` 时显示）

| Tab ID | 界面文案 | 组件 | 产品定位（简述） |
|--------|----------|------|------------------|
| `notes` | Notes | `NotesTab` | 采集列表（硬件/手机录音）+ 富文本笔记 + 录音入口 |
| `knowledge` | Knowledge | `KnowledgeTab` | 我的 / 团队 / 订阅知识库列表与发现 |
| `agent` | Minder | `AgentTab` | 库联动、Agent 抽屉、Studio 入口、主输入区 |
| `me` | Me | `MeTab` | 个人资料、统计、热力图、设置与商业化展示 |

实现：`bottom-nav.tsx`。

### 2.2 `currentView` 类型与跳转关系

| 视图类型 | 触发方式 | 主要组件 | 底栏 |
|----------|----------|----------|------|
| `tabs` | 默认；从子页 `onBack` 回到 Tab | 四 Tab 之一 | 显示 |
| `note-detail` | Notes 中点击 **非 text** 笔记 | `NoteDetail` | 隐藏 |
| `recording` | Notes FAB / 空态「开始录音」等 | `RecordingPage` | 隐藏 |
| `kb-detail` | Knowledge 点击库；或笔记移库成功；或 Agent Studio 跳转 | `KnowledgeDetail` | 隐藏 |
| `agent-chat` | Agent Tab 选 Agent 对话 | `AgentChat` | 隐藏 |
| `kb-agent-chat` | 知识库内「Mind Agent」类入口 | `AgentChat`（合成 agent 信息） | 隐藏 |

**已知实现缺口（建议 backlog）**  
`mind-app-v2.tsx` 在 `note-detail` 视图中 **未把所选 `note` 传入 `NoteDetail`**（`setCurrentView({ type: "note-detail", note })` 有 `note`，但 `<NoteDetail />` 未接 prop）。详情页标题、音频、转写等目前为 **静态演示**，与列表项无关联。联调前需补：`NoteDetail` 接收 `note`（或 `noteId`）并驱动 UI / 请求。

---

## 3. 分页面功能清单

以下按 **用户可见页面** 拆解：**功能点**、**当前实现**、**依赖后端/能力**（编号指向 `DEVELOPMENT_PLAN.md` 第一节）、**建议负责角色**。

---

### 3.1 Notes — `notes-tab.tsx`

#### 3.1.1 顶部栏

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 账户 / 设备入口 | 展示 Mind + Work/Personal 徽标、连接点；点击进入 **Devices** 底部 Sheet | UI + 本地 `isDeviceConnected` | 设备配对、状态上报（DEVELOPMENT_PLAN 9） |
| 搜索 | 按钮占位 | 无逻辑 | 笔记搜索（5） |

#### 3.1.2 列表与筛选

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 类型筛选 | All / Hardware / Phone / **Text** | 本地 `filterType` + `filteredNotes` | 笔记 `type` 字段协议（5） |
| 笔记卡片 | 标题、摘要、日期、时长（若有）、来源图标（Mic / Smartphone / **FileText**） | mock 列表 + 本地 `notes` state | 列表 API（5） |
| 分析中骨架 | `status === "pending"` 时 `NoteCardSkeleton` | UI | 任务状态（10） |
| 左滑删除 / 右滑归档 | 手势 + 删除更新本地 state；**归档 `onArchive` 空函数** | 部分 | 软删除、归档（8） |
| 点击进入详情 | `hardware` / `phone` → `onNoteClick`；**`text` → 打开 `TextNoteEditor` 覆盖层** | 已接 | 详情、文本 body（5） |

#### 3.1.3 新建与编辑富文本

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| New rich note | 虚线卡片 → 全屏 `TextNoteEditor`，`onSave` 追加 `type: "text"` 笔记 | 已接本地 | 创建/更新文本笔记、HTML 存储（5） |
| 富文本能力 | `text-note-editor.tsx`：`contentEditable`、粗体/斜体/下划线/列表、Save、分享 Sheet、AI 模型选择 UI、底部 composer 占位 | 编辑器本地持久化；AI 未接 | ASR 无关；若笔记内 AI 需 13 |
| 数据模型 | `Note`：`preview`（列表纯文本摘要）、`bodyHtml`（富文本 HTML）、`bodyHtml` 可选 | 本地 | 字段对齐 CRUD（5） |

#### 3.1.4 录音 FAB

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 大圆麦克风 | `onStartRecording` → 全屏录音页 | 已接导航 | 上传与转写（6、10） |

#### 3.1.5 Devices Sheet

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 设备卡片 | Mind Recorder、SN、电量/存储/固件静态展示 | Mock | 设备 telemetry（9） |
| 连接 / 断开 | 切换 `isDeviceConnected` | 本地 | 真实蓝牙由客户端 SDK |
| Sync now | 按钮无请求 | 占位 | 同步游标（9） |

**建议分工**：前端 Notes 列表 + 文本编辑器 + 设备 Sheet 交互；后端笔记 CRUD + 媒体上传 + 设备接口；产品设计筛选与空态文案。

---

### 3.2 录音中 — `recording-page.tsx`

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 关闭 | `onClose` → 回 Tab | 已接 | — |
| 计时 | 每秒递增，暂停时停止 | 本地 | 录音时长元数据（6） |
| 波形 | 随机高度动画 | 视觉 mock | 真实波形可选（6） |
| 设备条 | Mind Recorder + Connected 静态 | Mock | 设备通道（9） |
| 实时转写区 | 按 `duration` 切换预设句子 + 关键词标签 | Mock | 流式 ASR（10） |
| Mark | 书签记录当前秒 | 本地 state | 时间戳与笔记绑定（10） |
| Pause / Resume | 暂停计时与波形 | 本地 | 采集控制 |
| Stop | `onStop` → **进入 `NoteDetail`（未带新笔记上下文）** | 导航已接 | 停止后创建笔记、上传（5、6） |

**建议分工**：客户端录音与上传 pipeline；前端与真实波形/转写流对接；产品定义 Stop 后去向（生成中 vs 直接详情）。

---

### 3.3 笔记详情 — `note-detail.tsx`

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 返回 | `onBack` | 已接 | — |
| Move to library | 打开库选择 Sheet；`setTimeout` 模拟迁移成功后 `onMovedToLibrary` | 模拟 | 移库事务（17） |
| 分享 | Share Sheet：链接、复制、导出项、`SocialShareRow` | 部分可用（分享 URL 为占位） | 分享链接（28）、导出（29） |
| More 菜单 | 多项工具入口（重命名、标签、删除等 UI） | 多为占位 | 对应写接口（5、8） |
| 音频播放器 | 播放/暂停、进度条、波形条随 `playheadPct` 变化 | 本地模拟进度 | 播放鉴权（7） |
| Summary / Transcript Tab | 摘要文案 + 分段转写列表；播放时高亮块 | 静态 `TRANSCRIPT_BLOCKS` | 转写与摘要任务（10–13） |
| 模版 | 官方模版列表、自定义模版创建（名称/prompt）、语言/模型选择、确认流、`showTemplatePage` 探索页 | UI 较重，**保存/执行未接 API** | 模版与生成任务（13） |
| 推荐库 / 搜索库 | 移库 Sheet 内推荐与列表 | Mock 常量 | 推荐与搜索（14、18） |

**建议分工**：详情与模版归「笔记体验」组；与列表 `note` 贯通为 **当前 sprint 高优**；生成任务对接平台组。

---

### 3.4 Knowledge 列表 — `knowledge-tab.tsx`

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| Discover | 全屏 `DiscoverPage`：搜索框、Featured 卡片、分类 chips | UI；分类/搜索无请求 | 库发现（14–15） |
| 分段 | Mine / Team / Following | 本地过滤 `mockKBs` | 库可见性（15） |
| 库卡片 | 图标、描述、条目数、更新时间、订阅粉丝数 | Mock | 列表 API（14） |
| 进入详情 | `onKBClick` | 已接 | — |

**建议分工**：前端列表 + 发现页；后端库列表、订阅关系、推荐流。

---

### 3.5 知识库详情 — `knowledge-detail.tsx`

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 返回 | `onBack` | 已接 | — |
| 三视图切换 | **Content / Graph / Studio**（`initialView` 可深链自 Agent） | UI 切换 | 内容列表、图谱、工厂任务（16–19、24） |
| Content | 自动摘要区、条目列表、`mockContents`；条目进入详情 Sheet | Mock | 条目与摘要（16、18） |
| 条目详情 | 多段正文、`notebook` 式提问按钮 → `onAgentChat` | Mock 文案 | RAG 对话（23） |
| Graph | 简视图 +「Open full graph」 | 占位 | 图谱 API（19） |
| Studio | 工厂任务列表、状态标签、说明文案 | 占位 UI | 异步任务（24） |
| 添加来源菜单 | Camera / Image / Audio / File / Link / Note / YouTube / New folder | 菜单仅 UI | 多模态入库（16） |
| 分享 | 库级或条目级 Sheet + `SocialShareRow` | 同分享模块 | 28 |
| 引用 / citation Sheet | 拖拽关闭等交互 | UI | 引用与溯源（18、23） |

**建议分工**：内容视图与 Agent 上下文串联；图谱独立里程碑；Studio 与任务队列对齐。

---

### 3.6 Minder（Agent Tab）— `agent-tab.tsx`（含子模块）

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 左侧抽屉 | 打开/遮罩；**New agent**、**Discover**、我的 Agent 列表、最近聊天（只读展示） | UI | Agent CRUD、会话列表（20–21） |
| 主区说明文案 | Libraries / agents / Studio 说明 | 静态 | — |
| 主输入框 | 文本框 + **Libraries** 多选 Sheet（mock 库）+ **Studio** 下拉（Audio/Video/Flashcards 等）→ `onOpenContentFactory` | Studio 项均跳转同一 mock 库 Factory 视图 | 库选择持久化、工厂任务（24） |
| 语音 / 发送 | 按钮无逻辑 | 占位 | 流式对话（21） |
| CreateAgentSheet | 名称、指令、Voice、公开性、Autofill/Polish 按钮；**Save 无提交** | 表单 UI | 20 |
| ExploreAgentsPage | 分类 Tab、官方标、多选 + 底部 Create | UI | Agent 市场（20） |

---

### 3.7 Agent 对话 — `AgentChat`（`agent-tab.tsx` 内导出）

| 功能 | 行为 | 实现状态 | 后端依赖 |
|------|------|----------|----------|
| 空态 | 大头像、引导文案、内嵌 composer | UI | — |
| 发送 | 追加 user 消息；**1s 后 mock 固定回复** | 无模型 | 会话与流式（21） |
| 语音键 | 无逻辑 | 占位 | 语音输入 |
| 库内 Mind Agent | `kb-agent-chat` 视图用合成 `agent` 对象 + `onBack` 回到 `kb-detail` | 已接导航 | 23 |

**建议分工**：对话客户端（SSE/WebSocket、消息列表、错误重试）归平台或 AI 组；与 `kb-agent-chat` 上下文协议见 DEVELOPMENT_PLAN。

---

### 3.8 Me — `me-tab.tsx`

模块极多，按 **区块** 治理：

| 区块 | 功能概要 | 实现状态 | 后端依赖 |
|------|----------|----------|----------|
| 头部 | 头像、昵称、邮箱、统计摘要（笔记数、连续天、小时等） | Mock `stats` | 用户与使用统计（1–2） |
| 账户切换 | Work / Personal，`onActiveAccountChange` | 已接父 state | 多账户（1） |
| 热力图 | 90 天格子、点击展开某日详情、分享 Sheet | 本地随机数据 + 文案生成 | 活动日志（2） |
| 个性化推送卡片 | Daily review / AI insights 全屏阅读 | Mock 长文案 | 生成内容（13） |
| 积分与套餐 | Credits 展示、`creditPlans`、购买 Sheet | UI | 26–27 |
| 设置 Hub | 个性化、云同步、通知、设备、隐私、帮助等入口 | 多 Sheet 子页 | 各域设置 API |
| 云同步 | 开关、仅 Wi‑Fi、说明 | 本地 state | 9 |
| 个性化 / 偏好 | 转写语言、说话人、自定义词表标签、Lexicon 草稿等 | 表单本地 | 2、12 |
| 隐私 / App lock 等 | Toggle 本地 | 合规与设备（1、4） |
| 分享 | 多处 `SocialShareRow` | 可用（占位 URL） | 28 |

**建议分工**：Me 归「账户与增长」垂直切片；热力图/洞察与数据分析管道对齐。

---

### 3.9 横切组件与库

| 文件 | 职责 |
|------|------|
| `social-share-row.tsx` | 渲染 `SOCIAL_SHARE_ACTIONS`，调 `openSocialShare` / `copyShareText` |
| `knowledge-base-icon.tsx` | 按库名称/描述选 Lucide 图标 |
| `lib/medrix-design-tokens.ts` | Medrix 青绿主题、`mx.*` 类名助手 |
| `lib/share-social.ts` | 各平台分享 URL 与复制 |

---

## 4. 与后端能力的映射速查

前端各界面与 `DEVELOPMENT_PLAN.md` **第一节**条目的对应关系已在该文档 **第二节表** 中列出；本手册 **第 3 节**各表「后端依赖」列为执行层补充。落地时以 **OpenAPI / 契约** 为准。

---

## 5. 建议的治理节奏与分工维度

### 5.1 垂直切片（可映射到小组或 Owner）

1. **采集链路**：Notes 列表 → 录音页 → 上传 → 详情（转写/摘要）→ 移库。  
2. **知识与 RAG**：Knowledge 列表/发现 → 库详情 Content/Graph/Studio → 库内 Agent 对话。  
3. **通用 Agent**：Minder Tab、创建/发现、通用 `AgentChat`。  
4. **账户与商业化**：Me、双空间、积分套餐、设置类 API。  
5. **设备与同步**：Devices Sheet、录音页设备条、云同步开关。  
6. **横切**：分享、设计 token、无障碍与国际化（当前未系统化）。

### 5.2 进度同步建议

| 节奏 | 内容 |
|------|------|
| 站会 | 按「垂直切片」各报：阻塞（API 未就绪、契约变更）、演示环境是否可点 |
| 双周 | 对照本文件第 3 节表格，勾选 **已联调 / 仍 Mock**；更新「已知缺口」（如 `NoteDetail` 未接 `note`） |
| 发版前 | 安全：分享 URL、导出、登录态；性能：长列表、聊天列表 |

### 5.3 状态标签（建议在任务系统中使用）

- **Mock**：仅前端演示，无真实请求。  
- **Partial**：有导航或本地 state，缺 API 或缺关键闭环。  
- **Integrated**：已与测试环境 API 联调（本仓库当前无此状态，预留）。  
- **Blocked**：依赖契约未定或后端未部署。

---

## 6. 源文件索引（便于 Code Owner）

| 路径 | 说明 |
|------|------|
| `app/page.tsx` | 演示入口 |
| `components/mind-v2/mind-app-v2.tsx` | 视图状态机、壳层 |
| `components/mind-v2/bottom-nav.tsx` | 底栏 |
| `components/mind-v2/notes-tab.tsx` | Notes + 设备 Sheet + 富文本入口 |
| `components/mind-v2/text-note-editor.tsx` | 富文本编辑器 |
| `components/mind-v2/recording-page.tsx` | 录音中 |
| `components/mind-v2/note-detail.tsx` | 笔记详情 |
| `components/mind-v2/knowledge-tab.tsx` | 知识库列表 + Discover 内页 |
| `components/mind-v2/knowledge-detail.tsx` | 库详情三视图 |
| `components/mind-v2/agent-tab.tsx` | Minder Tab + `AgentChat` + Create/Explore |
| `components/mind-v2/me-tab.tsx` | 个人中心 |
| `components/mind-v2/social-share-row.tsx` | 分享行 |
| `lib/mind-accounts.ts` | 账户常量 |
| `lib/share-social.ts` | 分享 URL 与复制 |
| `lib/medrix-design-tokens.ts` | 设计 token |

---

## 7. 文档维护

- **产品变更**（增删 Tab、改录音流程）：先改 PRD，再同步本文件第 3 节对应小节。  
- **后端契约就绪**：在 DEVELOPMENT_PLAN 与任务单中标注 API 版本，前端删除对应 Mock。  
- **版本信息**：可在文档顶部增加 `Last reviewed: YYYY-MM-DD` 字段，由 Owner 在每次大迭代后更新。

---

*本文档随代码演进维护；若与实现不一致，以仓库源码为准并回写本手册。*
