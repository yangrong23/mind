# Mind V2 页面与功能治理手册

> **用途**：与团队对齐「有哪些界面、各自要达成什么、谁负责什么、做到哪一步」，便于分工、排期与站会同步进度。  
> **范围**：**前端**：仓库内单页演示（`app/page.tsx` → `MindAppV2`），业务数据多为 mock。**后端**：实现不在本仓库，本文 **§4** 给出与前端对齐的 **服务边界、任务形态与 OpenClaw / SKILL 编排** 说明，供与 [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md)、[`PRODUCT_FEATURES_AND_UX.md`](./PRODUCT_FEATURES_AND_UX.md) 一起治理。  
> **关联文档**：数据域条目见 `DEVELOPMENT_PLAN.md`；产品与 Clawbot / OpenClaw 叙述见 `PRODUCT_FEATURES_AND_UX.md`；设计 token 见 `lib/medrix-design-tokens.ts`。

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

## 4. 后端架构与实现要点

本节描述 **独立后端 / 运行时** 应承担的职责（与前端 `KnowledgeDetail` Studio、`AgentTab` / `AgentChat`、`MeTab` 离线策略对齐）。实现语言与仓库不限；以下按 **能力域** 拆分，便于接口契约与运维分工。

### 4.1 内容工厂（Content Factory / Studio）

**产品对应**：库详情 **Studio** Tab、`AgentTab` 中 **Studio** 下拉（音频简报、视频简报、闪卡、测验、幻灯等）。**DEVELOPMENT_PLAN** 对应条目 **24–25**（工厂任务类型、产物存储）。

| 子域 | 实现要点 | 与前端契约 |
|------|----------|------------|
| **任务模型** | 每条任务：`id`、`libraryId`、`type`（audio_brief / video_brief / flashcards / quiz / slides / …）、`status`（`queued` \| `running` \| `done` \| `failed`）、`progress`（0–100 或阶段枚举）、`errorCode` / `errorMessage`、`createdBy`、`createdAt`、`updatedAt` | Studio 列表与轮询/Webhook 刷新状态 |
| **入参** | 必选：目标库 ID、任务类型；可选：`contentIds[]`（限定素材子集）、`locale`、`templateId`（见 4.3）、输出风格参数 | 用户在库内勾选范围后创建任务 |
| **执行管道** | **异步队列**（SQS / Rabbit / Redis Stream 等）+ **Worker 池**；长任务（视频渲染）与短任务（文本测验）可分队列或优先级；**幂等键**（`clientRequestId`）防重复提交 | POST 创建返回 `202` + `taskId` |
| **Worker 逻辑** | 拉取库内 **检索上下文**（chunk + citation 元数据，对齐库内 RAG）；调用 **模板渲染 / 多模态模型**（TTS、视频合成、幻灯引擎）；失败重试策略（可重试 vs 终态失败） | 失败时前端展示 `errorMessage` |
| **产物存储** | 音频/视频/ PDF / JSON（闪卡、测验）→ **对象存储**（预签名上传或服务端直传）；结构化结果可写 **DB** 便于列表与权限 | 列表项含 `artifactUrl`、`mimeType`、`thumbnailUrl?` |
| **计费与配额** | 与 **Credits**（DEVELOPMENT_PLAN 26）扣减规则绑定：按任务类型、时长、输出分辨率计费；提交前校验余额 | 与 `me-tab` 展示一致 |
| **安全** | 任务仅能访问 **用户有权的库与条目**；产物 URL **短期签名**；敏感库可禁止导出类任务 | 鉴权与笔记域一致 |

**建议 Owner**：后端「异步任务平台」+ 算法/多媒体「生成管线」；前端对接创建任务、列表、下载与错误态。

---

### 4.2 智能体运行时：OpenClaw 部署

**产品对应**：`PRODUCT_FEATURES_AND_UX.md` 中 **Clawbot**、**OpenClaw** 云端能力；`me-tab` 中 **全离线** 与「Cloud Claw skills 不可用」的表述一致——即 **默认能力依赖云端执行面**。

| 子域 | 实现要点 |
|------|----------|
| **部署形态** | 推荐 **容器化**（如 Kubernetes）：无状态 **API Gateway** + 有状态 **会话 Runner**（按会话或队列伸缩）；与主业务 API 同 VPC 或对等连接，便于访问向量库、对象存储、密钥服务。 |
| **网络与安全** | 出站策略（模型 API、工具 HTTP）；**Secrets**（模型 Key、用户授权 OAuth token）走 KMS / 托管密钥；可选 **固定出口 IP** 供企业客户加白名单。 |
| **伸缩与隔离** | 按租户 / 会话限流；**沙箱**执行（容器 seccomp、网络策略）用于用户自定义工具链；与 **全离线模式** 互斥时在网关层短路并返回明确错误码。 |
| **可观测性** | `traceId` 贯通 App → BFF → OpenClaw；日志中脱敏；核心指标：排队时长、工具调用成功率、token 延迟、每会话成本。 |
| **版本与发布** | OpenClaw 镜像 **语义化版本**；金丝雀发布；**功能开关** 控制新工具上线。 |

**建议 Owner**：平台 / SRE（部署与容量）+ 安全（密钥与沙箱策略）。

---

### 4.3 SKILL 模版配置与编排

此处 **SKILL** 指：**可版本化的智能体能力单元**（系统提示片段、工具白名单、输入输出 schema、可选多步编排），用于把「官方 Agent / 用户自建 Agent」映射到 **OpenClaw 可执行配置**，并与 **知识库范围**、**内容工厂模版** 解耦又可组合。

| 子域 | 实现要点 |
|------|----------|
| **模版存储** | **Git 或 DB + 版本号**：`skillId`、`version`、`name`、`description`、`systemPromptTemplate`（支持变量：`{{libraryName}}`、`{{retrievedChunks}}`）、`allowedTools[]`、`modelPolicy`（默认模型、温度上限）、`inputSchema` / `outputSchema`（JSON Schema） |
| **编排层** | **BFF 或 Orchestrator** 根据 `agentId` + 用户选中的 `libraryIds` 解析出 **SKILL 链**：例如 `retrieve` → `reason` → `tool:notion_write`；支持 **DAG 或有限状态机**；每步超时与补偿（ Saga / 幂等重放） |
| **与 RAG 衔接** | 库内对话（`kb-agent-chat`）：编排首步固定注入 `retrieve(libraryId, query)` 结果；引用角标与 `citation` 与笔记详情、工厂 Worker 使用 **同一检索服务** |
| **与用户 Agent 创建对齐** | 前端 `CreateAgentSheet`（名称、指令、Voice、公开性）→ 持久化后生成 **`agentId` + 默认绑定 `skillPack`**（可多条 SKILL 组合）；「Polish / Autofill」对接 **提示词优化微服务**（可选） |
| **与内容工厂对齐** | 工厂任务类型可对应 **预设 SKILL 管线**（如 `slides`：摘要 SKILL + 大纲 SKILL + 渲染 SKILL），便于复用与审计 |
| **治理** | 模版变更 **审批流**（官方 SKILL 需发布审核）；**灰度**：按租户或百分比启用新版本；**回滚**：会话级 pinned 到 `skillVersion` |

**建议 Owner**：AI 平台（模版 schema 与编排引擎）+ 后端 BFF（鉴权、组装上下文）；前端只传 `agentId`、`libraryIds`、用户消息，不暴露原始 SKILL 文件。

---

### 4.4 端到端数据流（简图）

```text
App（Studio 创建任务）
    → API：工厂服务写入任务表 + 入队
    → Worker：检索 library → 执行模版/模型链 → 写产物 OSS + 更新状态

App（AgentChat / kb-agent-chat）
    → API：BFF 鉴权 + 解析 Agent 绑定 SKILL
    → OpenClaw：按编排调用检索 / 模型 / 工具 → 流式返回 SSE
    → 持久化：messages、tool_calls、citations（对齐 DEVELOPMENT_PLAN 20–23）
```

---

### 4.5 与 DEVELOPMENT_PLAN 条目的对应

| 本文 § | DEVELOPMENT_PLAN 章节 / 条目 |
|--------|-------------------------------|
| 4.1 内容工厂 | **6. 内容工厂**（24–25）；与 **4. 知识库检索**（18）共享检索 |
| 4.2 OpenClaw | **5. Agent 与对话**（20–22）；**10. 基础设施与工程化**（条目 33 可观测性、34 安全） |
| 4.3 SKILL 编排 | **5**（Agent 配置、会话）；与 **13**（模版驱动生成）可共享模版元数据 |

---

## 5. 与后端能力的映射速查

前端各界面与 `DEVELOPMENT_PLAN.md` **第一节**条目的对应关系已在该文档 **第二节表** 中列出；本手册 **第 3 节**各表「后端依赖」列为执行层补充；**第 4 节**补充工厂与 OpenClaw 侧实现视角。落地时以 **OpenAPI / 契约** 为准。

---

## 6. 建议的治理节奏与分工维度

### 6.1 垂直切片（可映射到小组或 Owner）

1. **采集链路**：Notes 列表 → 录音页 → 上传 → 详情（转写/摘要）→ 移库。  
2. **知识与 RAG**：Knowledge 列表/发现 → 库详情 Content/Graph/Studio → 库内 Agent 对话。  
3. **通用 Agent**：Minder Tab、创建/发现、通用 `AgentChat`。  
4. **内容工厂**：任务 API、队列与 Worker、产物存储与计费（**§4.1**）。  
5. **OpenClaw 与 SKILL**：运行时部署、密钥与沙箱、模版版本与编排（**§4.2–4.3**）。  
6. **账户与商业化**：Me、双空间、积分套餐、设置类 API。  
7. **设备与同步**：Devices Sheet、录音页设备条、云同步开关。  
8. **横切**：分享、设计 token、无障碍与国际化（当前未系统化）。

### 6.2 进度同步建议

| 节奏 | 内容 |
|------|------|
| 站会 | 按「垂直切片」各报：阻塞（API 未就绪、契约变更）、演示环境是否可点 |
| 双周 | 对照第 **3** 节（前端）与第 **4** 节（工厂 / OpenClaw / SKILL） checklist，勾选 **已联调 / 仍 Mock / 已部署**；更新「已知缺口」（如 `NoteDetail` 未接 `note`） |
| 发版前 | 安全：分享 URL、导出、登录态；性能：长列表、聊天列表 |

### 6.3 状态标签（建议在任务系统中使用）

- **Mock**：仅前端演示，无真实请求。  
- **Partial**：有导航或本地 state，缺 API 或缺关键闭环。  
- **Integrated**：已与测试环境 API 联调（本仓库当前无此状态，预留）。  
- **Blocked**：依赖契约未定或后端未部署。

---

## 7. 源文件索引（便于 Code Owner）

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

## 8. 文档维护

- **产品变更**（增删 Tab、改录音流程）：先改 PRD，再同步本文件第 3 节对应小节。  
- **后端 / OpenClaw / 工厂**：契约或部署架构变更时，同步 **§4** 与 `DEVELOPMENT_PLAN.md`，避免前端联调假设漂移。  
- **后端契约就绪**：在 DEVELOPMENT_PLAN 与任务单中标注 API 版本，前端删除对应 Mock。  
- **版本信息**：可在文档顶部增加 `Last reviewed: YYYY-MM-DD` 字段，由 Owner 在每次大迭代后更新。

---

*本文档随代码演进维护；若与实现不一致，以仓库源码为准并回写本手册。*
