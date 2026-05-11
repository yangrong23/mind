# Medrix / Mind V2 — 开发项描述汇总

本文档以 **后端与数据能力** 为主汇总开发项；客户端（`components/mind-v2`）仅保留与接口对齐的对接说明。  
**产品演示入口**：`app/page.tsx` → `components/mind-v2/mind-app-v2.tsx`（当前无服务端，均为 mock）。

**主题色与 UI**：所有界面有色相应 **围绕 Medrix 青绿** 衍生（`teal` / `cyan` 邻近色 + `stone`/`zinc`/`slate` 中性色），原则见 `lib/medrix-design-tokens.ts` 文件头注释。

---

## 一、后端开发项描述汇总

### 1. 身份、账户与安全

1. **用户体系**：注册登录（手机号/邮箱/OAuth）、会话（JWT 或 session）、刷新令牌、登出与设备列表。
2. **用户资料与偏好**：昵称、头像、语言、转写偏好、个性化字段；与 `me-tab` 表单字段对齐的读写 API。
3. **权限模型**：用户级、团队级、知识库级角色（Owner / Editor / Viewer）；接口鉴权中间件与资源校验。
4. **设置与合规**：隐私同意记录、导出个人数据、账号注销流程（法务要求的后端留痕）。

### 2. 笔记域（Notes）

5. **笔记元数据服务**：创建/更新/删除/列表/搜索；类型（硬件录音、手机录音、文本等）；与客户端列表筛选、排序、分页协议一致。
6. **音频与媒体**：上传凭证（预签名 URL 或分片上传）、对象存储路径、转码与元数据（时长、格式、波形采样可选）。
7. **播放与权限**：受控下载/播放链接、过期策略；与笔记访问权限一致。
8. **软删除与回收站**：移入回收站、恢复、永久删除；与客户端「Move to trash」及库内删除策略一致。
9. **版本与来源**：可选的版本号、导入来源设备 ID，便于设备 Sheet 与审计。

### 3. 语音与语言智能（ASR / NLP）

10. **转写任务管道**：提交音频 → 队列 → ASR 服务商回调或轮询 → 存转写文本与时间戳分段。
11. **说话人与重新转写**：说话人分离/标注任务、重新转写任务 ID 与状态查询。
12. **自定义词表**：用户/库级热词同步至 ASR 配置。
13. **下游生成任务**：摘要、脑图、洞察等 **模版驱动** 的任务（与 `note-detail` 模版 ID 绑定）；队列、重试、失败原因返回前端。

### 4. 知识库（Library / KB）

14. **知识库 CRUD**：创建、重命名、描述、封面/渐变色配置；我的库 / 订阅库列表与搜索。
15. **成员与订阅**：邀请、接受、退出；订阅公开库的订阅关系。
16. **内容条目**：库内条目模型（来自归档笔记、上传文件、链接等）；列表、详情、与源笔记双向关联。
17. **移库事务**：笔记迁入指定库、幂等、冲突处理；与客户端 `onMovedToLibrary` 成功后跳转一致的后端状态。
18. **检索**：全文检索、可选向量检索；为库内 Agent RAG 提供 `retrieve(libraryId, query)` 能力。
19. **图谱**：实体/边存储与查询 API（若产品保留图谱视图）；与 `knowledge-detail` 图谱页数据形状对齐。

### 5. Agent 与对话

20. **Agent 配置存储**：官方/用户 Agent 的 name、description、system prompt、可见性；与 `agent-tab` 创建表单一致。
21. **会话与消息**：session 创建、历史分页、流式响应（SSE/WebSocket）；用户消息与助手消息持久化。
22. **模型与路由**：多模型路由、限流、计费扣减钩子；可选工具调用编排。
23. **库内对话（RAG）**：请求中携带 `libraryId`、可选 `contentId`；服务端注入检索片段与引用 ID，与 `kb-agent-chat` 上下文协议一致。

**OpenClaw 部署与 SKILL 模版编排**（运行时、沙箱、版本与 BFF 组装）：见 [`MIND_V2_PAGE_FEATURE_GOVERNANCE.md`](./MIND_V2_PAGE_FEATURE_GOVERNANCE.md) **§4.2、§4.3**。

### 6. 内容工厂（Factory）

24. **工厂任务类型**：音频简报、视频简报、闪卡、测验等异步任务；状态机（queued / running / done / failed）。
25. **产物存储**：生成文件或结构化结果落对象存储或 DB；与 `knowledge-detail` 工厂列表展示字段对齐。

**实现与编排细化**（队列、Worker、API 形状、与 SKILL 管线关系）：见 [`MIND_V2_PAGE_FEATURE_GOVERNANCE.md`](./MIND_V2_PAGE_FEATURE_GOVERNANCE.md) **§4.1、§4.3**。

### 7. 商业化与积分

26. **积分（Credits）**：余额、充值包、扣减规则（按分钟/按 token/按任务类型）；与 `me-tab` 展示一致。
27. **订阅与支付**：套餐、订单、支付回调、发票或收据可选；Webhook 幂等。

### 8. 分享、导出与链接

28. **分享链接**：短链、过期、访问统计；权限校验（仅所有者/团队内）。
29. **导出任务**：导出录音/转写/标记为文件；异步生成与下载链接。

### 9. 设备与同步（可选）

30. **硬件配对**：配对码、设备令牌、与 App 蓝牙流程对接；电量/固件版本上报。
31. **私有云同步**：冲突策略、增量同步游标；与 `me-tab` 云同步开关含义一致。

### 10. 基础设施与工程化

32. **API 规范**：REST 或 RPC 版本前缀、统一错误码、OpenAPI/契约测试。
33. **可观测性**：结构化日志、traceId、核心指标（QPS、队列延迟、ASR 成功率）。
34. **安全**：限流、WAF、上传大小与类型校验、敏感字段脱敏。
35. **数据与迁移**：迁移脚本、备份与恢复策略。

---

## 二、客户端对接项（简表）

前端页面与组件文件见附录 B；每项需与 **第一节** 对应 API 联调，替换 mock 与 `setTimeout`。

| 领域 | 主要界面 | 依赖的后端能力（对应上文编号） |
|------|----------|-------------------------------|
| 壳层导航 | `mind-app-v2.tsx` | 深链、可选配置接口 |
| 笔记列表/录音 | `notes-tab.tsx`、`recording-page.tsx` | 5–8、10 |
| 笔记详情 | `note-detail.tsx` | 5–8、10–13、28–29 |
| 知识库 | `knowledge-tab.tsx`、`knowledge-detail.tsx` | 14–19、23 |
| Agent | `agent-tab.tsx`（含 `AgentChat`） | 20–23 |
| 个人中心 | `me-tab.tsx` | 1–2、26–27 |
| 设计 token | `medrix-design-tokens.ts` | 无后端；遵循主题色衍生规则 |

---

## 附录 A — 技术栈（简）

Next.js 16、React 19、Tailwind CSS 4；**当前仓库无服务端实现**，后端可按团队栈（Node / Go / Python 等）独立仓库交付，通过 API 与上述条目对齐。

## 附录 B — Mind V2 源文件一览

| 文件 | 职责摘要 |
|------|----------|
| `mind-app-v2.tsx` | 视图状态机、底栏、各子页挂载 |
| `bottom-nav.tsx` | 四主 Tab |
| `notes-tab.tsx` | 笔记列表、设备 Sheet、FAB |
| `note-detail.tsx` | 笔记详情、模版、移库、更多 |
| `recording-page.tsx` | 录音中 |
| `knowledge-tab.tsx` | 库列表与发现 |
| `knowledge-detail.tsx` | 单库详情 |
| `knowledge-base-icon.tsx` | 库图标 |
| `agent-tab.tsx` | Agent 列表、创建、`AgentChat` |
| `me-tab.tsx` | 个人中心 |
| `social-share-row.tsx` | 分享行 |
| `text-note-editor.tsx` | 富文本笔记编辑（Notes Tab 内已接入新建/编辑） |
| `lib/medrix-design-tokens.ts` | 设计 token 与主题色衍生规则 |
| `lib/share-social.ts` | 分享辅助 |

---

*后端条目随架构评审更新；前端仅保留对接关系，细节以 OpenAPI/契约为准。*
