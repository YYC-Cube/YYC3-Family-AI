# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-10 🎉 **正式开源发布**

这是 YYC³ Family AI 的首个正式**开源版本**，完成全部核心功能开发和质量验证。

### ✨ Added

#### 核心功能 (100% 完成)

- **三栏 IDE 布局系统**
  - 可调整大小的三栏布局（左栏 AI 对话 / 中栏文件管理 / 右栏代码编辑）
  - `react-resizable-panels` 实现
  - 响应式适配 + 移动端支持

- **七大 LLM Provider 集成**
  - Ollama（本地部署）✅
  - OpenAI（GPT 系列）✅
  - Anthropic (Claude) ✅ **[新增]**
  - 智谱 GLM（GLM 系列）✅
  - 通义千问（Qwen 系列 / DashScope）✅
  - DeepSeek（DeepSeek 系列）✅
  - 自定义 Provider ✅

- **18+ 功能面板系统**
  - AI 对话面板、文件管理面板、代码编辑器面板
  - 实时预览面板、设置面板、TaskBoard 面板
  - 终端面板（xterm.js v6 集成）✅ **[新增]**
  - 控制台面板、插件市场面板等

- **AI 代码生成流水线**
  - Context 收集 → SystemPrompt 构建 → LLM SSE 流式响应
  - CodeApplicator 代码应用 → Diff Preview 差异预览
  - 支持 Agent 编排模式 ✅ **[新增]**

- **TaskBoard AI 任务推理**
  - 从 AI 响应自动提取候选任务
  - 任务状态管理、优先级排序、子任务支持

- **终端集成系统** ✅ **[新增]**
  - 基于 xterm.js v6 的完整终端模拟
  - WebSocket 实时通信
  - 多会话管理、自动重连机制
  - FitAddon / WebLinksAddon / SearchAddon 插件支持

- **MCP (Model Context Protocol) 原生集成** ✅ **[新增]**
  - MCP Client 支持
  - 数据库连接器（PostgreSQL / MySQL / SQLite）
  - 文件系统操作、Git 命令封装
  - 可扩展的 Server 架构

- **插件系统架构**
  - 插件加载器、签名验证、沙箱隔离
  - 依赖管理、生命周期钩子
  - 完整的 Plugin SDK

- **主题定制系统**
  - 浅色主题（light）/ 深色主题（dark）
  - 赛博朋克主题（cyberpunk）/ 自定义主题支持
  - CSS 变量注入 + 实时预览

- **实时协作框架**
  - 基于 Yjs 的 CRDT 协同编辑
  - 实时同步、冲突解决
  - 多实例管理

- **安全与隐私** ✅ **[增强]**
  - AES-256-GCM 加密存储
  - API Key Vault（密钥安全管理）
  - 本地优先架构（Local-first）
  - 零云端依赖

### 🔧 Changed

#### 技术栈升级
- React 18.3.1 (稳定版)
- TypeScript 5.8.x (最新)
- Vite 6.3.x (性能优化)
- Tailwind CSS v4.1.x
- Zustand 5.x (状态管理)
- xterm.js v6 + @xterm/addon-* (终端)

#### 测试体系完善
- **2672 个测试用例** 通过 ✅
- **104 个测试文件** 覆盖
- **99.85% 通过率** (2672/2676)
- Vitest + @testing-library/react + Playwright E2E
- Codecov 覆盖率集成

#### CI/CD 流水线
- GitHub Actions 自动化
- PR 自动测试 + Codecov 上传
- 自动部署到 GitHub Pages
- 多环境支持（docs / main site）

### 🌐 项目域名

- **项目主页**: https://family-ai.yyc3.vip
- **文档中心**: https://docs.yyccube.com
- **品牌官网**: https://yyccube.com
- **GitHub 组织**: https://github.com/YanYuCloudCube

### 📊 质量指标

| 指标 | 数值 |
|------|------|
| 测试用例 | 2,672 |
| 测试文件 | 104 |
| 通过率 | 99.85% |
| 代码覆盖率 | 85%+ |
| LLM Provider | 7 个 |
| 功能面板 | 18+ |
| 支持语言 | 中文 / English |

---

## [1.0.1] - 2026-04-15 🚀 **阶段性集成发布**

### ✨ Added — 业务服务层（21 个模块，13,995 行代码）

#### 智能体编排引擎
- **AIAgentOrchestrator** (`src/services/AIAgentOrchestrator.ts`) — 多 Agent 协作编排引擎
  - 四种执行模式：单 Agent / 多 Agent 协作 / 流水线 / 并行
  - 动态 Agent 注册、任务队列调度、负载均衡
  - 自动重试（指数退避）、事件驱动架构、LRU 缓存系统
  - 内置 5 个默认 Agent（通用/代码/研究/创作/分析助手）

#### 金融数据分析
- **FinanceAnalysisService** (`src/services/FinanceAnalysisService.ts`) — 全栈金融数据分析引擎
  - 股票行情与历史 K 线数据、技术指标计算（MACD/RSI/布林带/均线）
  - DCF 估值模型、P/E P/B PEG 估值体系
  - 投资组合分析与再平衡建议、VaR 风险度量
  - 压力测试与情景分析、自动化金融报告生成

#### 教育作业批改
- **EducationService** (`src/services/EducationService.ts`) — AI 驱动教育服务平台
  - AI 作业批改与详细评分反馈、抄袭检测
  - 五种题型自动生成（选择/填空/简答/计算/论述）
  - 试卷智能组卷（难度分布+知识点覆盖）
  - 个性化学习计划制定与进度追踪

#### 办公自动化
- **OfficeAutomationService** (`src/services/OfficeAutomationService.ts`) — 企业级办公工具集
  - 文档模板系统（会议纪要/报告/周报/邮件）
  - AI 邮件起草（多语气支持）、Markdown↔HTML 格式转换
  - 日程管理与冲突检测、任务跟踪（优先级/标签/截止日期）
  - 结构化会议纪要与行动项自动提取

#### 数据分析与可视化
- **DataVisualizationService** (`src/services/DataVisualizationService.ts`) — 数据可视化引擎（已集成 ChartPanel）
- **DataAnalysisService** (`src/services/DataAnalysisService.ts`) — 统计分析与数据清洗

#### 内容生成服务
- **NewsGenerator** (`src/services/NewsGenerator.ts`) — 新闻内容聚合与摘要生成
- **PodcastGenerator** (`src/services/PodcastGenerator.ts`) — 播客脚本与内容生成
- **ImageGenerationService** (`src/services/ImageGenerationService.ts`) — AI 图像生成与编辑
- **VideoGenerationService** (`src/services/VideoGenerationService.ts`) — 视频内容生成
- **TranslationService** (`src/services/TranslationService.ts`) — 多语言翻译引擎

#### 信息检索服务
- **WebScraperService** (`src/services/WebScraperService.ts`) — 网页内容抓取与结构化提取
- **WebSearchService** (`src/services/WebSearchService.ts`) — 网络搜索与思维导图（已集成 SearchPanel）
- **KnowledgeBaseService** (`src/services/KnowledgeBaseService.ts`) — 向量知识库与混合搜索
- **GraphRAGService** (`src/services/GraphRAGService.ts`) — 知识图谱 RAG 检索增强

#### 专业领域服务
- **InterviewAgent** (`src/services/InterviewAgent.ts`) — 模拟面试智能体
- **SecurityScannerEnhanced** (`src/services/SecurityScannerEnhanced.ts`) — 增强型安全扫描器
- **DocumentParserService** (`src/services/DocumentParserService.ts`) — 多格式文档解析
- **CodeInterpreterService** (`src/services/CodeInterpreterService.ts`) — 代码沙箱解释执行

#### 多媒体服务
- **ASRService** (`src/services/ASRService.ts`) — 自动语音识别 (ASR)
- **TTSService** (`src/services/TTSService.ts`) — 文本转语音合成 (TTS)

### ✨ Added — MCP Server 层（8 个模块）

- **DockerGatewayServer** — Docker 网关管理（路由/健康检查/限流/负载均衡）
- **DockerServer** — Docker 容器生命周期管理
- **PostgreSQLServer** — PostgreSQL 数据库连接与查询
- **GitHubServer** — Git/GitHub 操作集成
- **FilesystemServer** — 文件系统操作
- **BraveSearchServer** — Brave Search API 集成
- **ClaudePromptsServer** — Claude 提示词模板管理
- **YYC3CNAssistantServer** — 中文本地化助手增强

### 📊 Changed

- 全局测试从 2,672 → **3,246** 用例 (+574, +21.5%)
- 测试文件从 104 → **141** 个 (+37)
- TypeScript 编译 0 errors（全部 29 个新文件通过严格模式）
- 新增 `docs/08-YYC3-项目整合-实施阶段/` 阶段性总结文档

### ⚠️ Known Issues

- 服务层缺少独立单元测试文件（计划 v1.0.2 补充）
- 19/21 服务尚未接入 UI 面板（可通过 import 直接使用）
- 无 services barrel export 入口文件（待创建）

---

## [Unreleased]

### Planned for v1.1.0 (2026.07)

- [ ] Multi-Agent Orchestrator（多Agent编排引擎）
- [ ] MCP Server 发布 (@yyc3/mcp-servers npm 包)
- [ ] Smart Workflow Engine（可视化工作流编辑器）
- [ ] Plugin System SDK 正式版
- [ ] 移动端 Companion App (React Native)

### Planned for v1.2.0 (2026.10)

- [ ] 实时协同编辑增强 (CRDT优化)
- [ ] 内置聊天与评论系统
- [ ] 端到端加密协作
- [ ] 分享会话与工作流

### Planned for v2.0.0 (2027.Q1)

- [ ] 内置推理引擎 (vLLM / Ollama 集成)
- [ ] 分布式 Agent Mesh (P2P)
- [ ] 自然语言编程接口
- [ ] Micro-Frontend 架构重构

---

## [0.0.1] - 2026-03-19

### Added
- 初始版本发布（内部测试版）
- 三栏 IDE 布局系统
- 六大 LLM Provider 集成
- 18+ 功能面板系统
- AI 代码生成流水线
- TaskBoard AI 任务推理引擎
- Monaco Editor + TipTap 编辑器
- Zustand 状态管理 (15 stores)
- 插件系统架构
- 主题定制系统
- 测试套件 (585 测试用例)

---

**版本规范**:
- **Major**: 不兼容的 API 变更或重大功能
- **Minor**: 向后兼容的功能新增
- **Patch**: 向后兼容的问题修复

**发布节奏**:
- **Major**: 年度大版本 (v2.0, v3.0...)
- **Minor**: 月度迭代 (v1.1, v1.2...)
- **Patch**: 周度补丁 (v1.0.1, v1.0.2...)

---

**维护团队**: YanYuCloudCube Team  
**问题反馈**: [GitHub Issues](https://github.com/YanYuCloudCube/YYC3-Family-AI/issues)  
**项目主页**: https://family-ai.yyc3.vip  
**品牌官网**: https://yyccube.com
