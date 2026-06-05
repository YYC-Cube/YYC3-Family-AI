# YYC³ Family AI 智能编程助手

<div align="center">

> ***YanYuCloudCube***

> *言启象限 | 语枢未来*

> ***Words Initiate Quadrants, Language Serves as Core for Future***

> *万象归元于云枢 | 深栈智启新纪元*

> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

[![YYC³ Version](https://img.shields.io/badge/YYC³-v1.0.1-6366f1?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PHBvbHlnb24gcG9pbnRzPSIxMiAyIDIyIDguNSAyMiAxNS41IDEyIDIyIDIgMTUuNSAyIDguNSAxMiAyIi8+PC9zdmc+)](https://github.com/YanYuCloudCube/YYC3-Family-AI/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.x-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-f5a623?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZjVhNjIzIj48cGF0aCBkPSJNMTIgMkw0IDd2MTBsOCA1IDgtNSA4LTVWN2wtOC01eiIvPjwvc3ZnPg==)](https://zustand-demo.pmnd.rs/)

[![Tests 3246](https://img.shields.io/badge/Tests-3246_passed-22c55e?logo=vitest&logoColor=white)](https://github.com/YanYuCloudCube/YYC3-Family-AI/actions)
[![Test Files 141](https://img.shields.io/badge/Test_Files-141-8b5cf6)](https://github.com/YanYuCloudCube/YYC3-Family-AI/actions)
[![Services 21](https://img.shields.io/badge/Services-21_Modules-933317?logo=service&logoColor=white)](https://github.com/YanYuCloudCube/YYC3-Family-AI/blob/main/docs/08-YYC3-项目整合-实施阶段/项目总结报告/YYC3-阶段性集成总结-v1.0.1.md)
[![MCP Servers 8](https://img.shields.io/badge/MCP_Servers-8-7c3aed?logo=protocol&logoColor=white)](https://github.com/YanYuCloudCube/YYC3-Family-AI/blob/main/src/mcp/servers)
[![Coverage 85%+](https://img.shields.io/badge/Coverage-85%25+-4fcf25?logo=codecov&logoColor=white)](https://codecov.io/gh/YanYuCloudCube/YYC3-Family-AI)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088ff?logo=githubactions&logoColor=white)](https://github.com/YanYuCloudCube/YYC3-Family-AI/actions)
[![GitHub Stars](https://img.shields.io/github/stars/YanYuCloudCube/YYC3-Family-AI?style=social)](https://github.com/YanYuCloudCube/YYC3-Family-AI/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/YanYuCloudCube/YYC3-Family-AI?style=social)](https://github.com/YanYuCloudCube/YYC3-Family-AI/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/YanYuCloudCube/YYC3-Family-AI)](https://github.com/YanYuCloudCube/YYC3-Family-AI/issues)

**[🌐 项目主页](https://family-ai.yyc3.vip)** · **[📖 文档中心](https://docs.yyccube.com)** · **[🏠 品牌官网](https://yyccube.com)** · **[🐛 报告问题](https://github.com/YanYuCloudCube/YYC3-Family-AI/issues)** · **[💡 功能建议](https://github.com/YanYuCloudCube/YYC3-Family-AI/issues)**

</div>

<div align="center">
  <img src="public/Family-AI-001.png" alt="YYC³ Family AI 智能编程助手" width="800" />
</div>

## 📋 目录

- [项目简介](#项目简介)
- [项目仓库](#项目仓库)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [存储架构设计](#存储架构设计)
- [核心功能](#核心功能)
- [开发指南](#开发指南)
- [文档导航](#文档导航)
- [CI/CD 部署](#cicd-部署)
- [测试覆盖](#测试覆盖)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 项目简介

YYC³（YanYuCloudCube）Family AI 是一个**开源本地优先**的 AI 智能编程助手，基于 React/TypeScript 构建，通过集成六大主流 LLM Provider 和 MCP 服务生态，提供智能代码生成、实时预览、任务管理等全方位的 AI 辅助编程体验。

### 🌟 开源本地工具特性

> **数据主权在你手中** - YYC³ 是一个完全运行在浏览器中的本地开发工具，所有数据存储在您的设备上，无需注册账号，无需云端依赖。

| 特性 | 说明 |
|------|------|
| 🔒 **隐私优先** | 所有数据本地存储 (IndexedDB + localStorage)，无第三方追踪 |
| 🚀 **零配置启动** | 克隆仓库即可使用，无需数据库、无需后端服务 |
| 📴 **离线可用** | PWA 支持，断网环境下仍可正常工作 |
| 🎨 **完全可定制** | Logo、标语、主题均可自定义修改 |
| 🆓 **完全免费** | MIT 开源协议，可自由使用、修改、分发 |
| 🤖 **AI 本地化** | 支持 Ollama 本地模型，数据不出本机 |

### 项目愿景

打造下一代 **AI 驱动的开源本地开发环境**，让每一位开发者都能享受 AI 带来的编程效率提升，同时**完全掌控自己的数据**。

**核心理念**：

- **五高**：高可用性、高性能、高安全性、高扩展性、高可维护性
- **五标**：标准化、规范化、自动化、智能化、可视化
- **五化**：流程化、文档化、工具化、数字化、生态化

**技术架构**：

- 采用**三层混合存储架构**（IndexedDB + localStorage + Zustand）
- 基于**React 18** 和 **TypeScript 5.8** 构建现代化前端
- 集成 **Zustand** 状态管理和 **react-dnd** 拖拽系统
- 支持 **六大 LLM Provider**（Ollama / OpenAI / 智谱 GLM / 通义千问 / DeepSeek / 自定义）
- 提供 **18+ 功能面板**的灵活布局系统
- 实现 **AI 代码生成流水线**和 **TaskBoard AI 任务推理**
- 基于 **Yjs CRDT** 的实时协作编辑
- 完整的 **CI/CD 流水线**（GitHub Actions + 4 级 Workflow）

**适用场景**：

- 快速原型开发
- 代码辅助生成
- 实时协作编程
- 任务管理与追踪
- 插件扩展开发

### 核心特性

| 特性 | 说明 |
|------|------|
| **三栏 IDE 布局** | 左栏 AI 对话 / 中栏文件管理 / 右栏代码编辑，可自由调整 |
| **六大 LLM Provider** | Ollama / OpenAI / 智谱 GLM / 通义千问 / DeepSeek / 自定义 |
| **18+ 功能面板** | react-dnd 拖拽系统，支持合并/拆分/浮动 |
| **AI 代码生成流水线** | Context → SystemPrompt → LLM SSE → CodeApplicator → Diff Preview |
| **TaskBoard AI 任务推理** | 从 AI 响应自动提取候选任务 |
| **实时协作** | 基于 Yjs 的 CRDT 协同编辑 |
| **插件系统** | 可扩展的插件架构 |
| **主题系统** | Navy / Cyberpunk 双主题 + 自定义主题支持 |

## 项目仓库

**GitHub 仓库地址**：<https://github.com/YanYuCloudCube/YYC3-Family-AI.git>

**组织主页**：<https://github.com/YanYuCloudCube>

**项目域名**：

- 🌐 **项目主页**: <https://family-ai.yyc3.vip>
- 📖 **文档中心**: <https://docs.yyccube.com>
- 🏠 **品牌官网**: <https://yyccube.com>

**克隆仓库**：

```bash
git clone https://github.com/YanYuCloudCube/YYC3-Family-AI.git
cd YYC3-Family-AI
```

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| UI 框架 | React + TypeScript | 18.3.1 / 5.8.x | 用户界面 |
| 构建工具 | Vite | 6.3.5 | 开发服务器 / 构建 |
| 样式 | Tailwind CSS v4 | 4.1.12 | UI 样式 |
| 状态管理 | Zustand | 5.x | 全局状态管理 |
| 路由 | react-router (Hash mode) | 7.13.0 | 路由导航 |
| 拖拽 | react-dnd + HTML5 Backend | 16.0.1 | 面板拖拽 |
| 编辑器 | Monaco Editor | 4.7.x | 代码编辑 |
| 富文本 | TipTap | 3.20.x | 富文本编辑 |
| 动画 | Motion (Framer Motion) | 12.x | UI 动画 |
| 测试 | Vitest + @testing-library/react | 4.x / 16.x | 单元测试 |
| 协作 | Yjs | 13.6.x | CRDT 协同编辑 |
| 数据库 | IndexedDB (idb) | 8.x | 文件存储 |
| 持久化 | localStorage | - | 配置存储 |
| UI 组件 | Radix UI + MUI | 2.x / 7.3.x | 基础组件 |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 运行测试

```bash
pnpm test
```

## 项目结构

```
src/app/
├── App.tsx                          # 应用入口
├── routes.ts                        # 路由配置（懒加载 + Suspense）
├── components/
│   ├── HomePage.tsx                  # 首页
│   ├── IDEPage.tsx                   # IDE 主页面
│   ├── AIChatPage.tsx                # 全屏 AI 对话
│   ├── SettingsPage.tsx              # 设置页面
│   ├── TemplatesPage.tsx             # 模板市场
│   ├── DocsPage.tsx                  # 文档中心
│   ├── IconAssetsPage.tsx            # 图标资源
│   ├── ProjectCreateWizard.tsx       # 项目创建向导
│   ├── ErrorBoundary.tsx             # 错误边界
│   ├── RouteErrorFallback.tsx        # 路由错误回退
│   ├── ide/                          # IDE 核心模块
│   │   ├── LeftPanel.tsx             # AI 对话面板
│   │   ├── CenterPanel.tsx           # 文件管理面板
│   │   ├── RightPanel.tsx            # 代码编辑面板
│   │   ├── PanelManager.tsx          # 面板管理系统
│   │   ├── FileStore.tsx             # 文件系统 Context Provider
│   │   ├── ModelRegistry.tsx         # 模型注册 Context Provider
│   │   ├── ThemeStore.tsx            # 主题系统 Context Provider
│   │   ├── CustomThemeStore.ts       # 自定义主题管理
│   │   ├── LLMService.ts             # LLM API 调用层
│   │   ├── ProxyService.ts           # 代理服务器服务
│   │   ├── CryptoService.ts          # 加密服务
│   │   ├── CollabService.ts          # 实时协作服务
│   │   ├── ChatHistoryStore.ts       # 聊天历史存储
│   │   ├── SettingsBridge.ts         # 设置桥接器
│   │   │
│   │   ├── adapters/                 # 数据适配器层
│   │   │   ├── IndexedDBAdapter.ts   # IndexedDB 操作封装
│   │   │   └── ...
│   │   │
│   │   ├── ai/                       # AI Pipeline 模块
│   │   │   ├── ContextBuilder.ts     # 上下文构建器
│   │   │   ├── SystemPrompt.ts       # 系统提示词
│   │   │   ├── CodeApplicator.ts     # 代码应用器
│   │   │   ├── DiffPreview.ts        # Diff 预览
│   │   │   ├── SecurityScanner.ts    # 安全扫描器
│   │   │   └── ...
│   │   │
│   │   ├── stores/                   # Zustand 状态管理
│   │   │   ├── index.ts              # Store Hub（统一导出）
│   │   │   ├── useFileStoreZustand.ts      # 文件状态
│   │   │   ├── useModelStoreZustand.ts     # 模型状态
│   │   │   ├── useProxyStoreZustand.ts     # 代理状态
│   │   │   ├── usePreviewStore.ts          # 预览状态
│   │   │   ├── usePanelPinStore.ts         # 面板固定
│   │   │   ├── usePanelTabGroupStore.ts    # 面板分组
│   │   │   ├── useFloatingPanelStore.ts    # 浮动面板
│   │   │   ├── useSettingsStore.ts         # 设置状态
│   │   │   ├── useQuickActionsStore.ts     # 快捷操作
│   │   │   ├── useTaskBoardStore.ts        # 任务看板
│   │   │   ├── usePreviewHistoryStore.ts   # 预览历史
│   │   │   ├── useScrollSyncStore.ts       # 滚动同步
│   │   │   ├── useAIFixStore.ts            # AI 修复
│   │   │   ├── useWindowStore.ts           # 窗口管理
│   │   │   ├── useWorkspaceStore.ts        # 工作空间
│   │   │   ├── useSessionStore.ts          # 会话管理
│   │   │   └── useIPCStore.ts              # IPC 通信
│   │   │
│   │   ├── services/                 # 业务服务层
│   │   │   ├── ErrorReportingService.ts  # 错误上报
│   │   │   ├── SnapshotService.ts        # 快照服务
│   │   │   ├── VersioningService.ts      # 版本控制
│   │   │   ├── CloudSyncService.ts       # 云同步
│   │   │   ├── StorageCleanup.ts      # 存储清理
│   │   │   ├── DataImporter.ts        # 数据导入
│   │   │   ├── DataExporter.ts        # 数据导出
│   │   │   ├── StorageMonitor.ts      # 存储监控
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                     # 自定义 Hooks
│   │   │   ├── useWorkspaceFileSync.ts  # 工作空间同步
│   │   │   ├── useSettingsSync.ts       # 设置同步
│   │   │   ├── useMultiInstanceSync.ts  # 多实例同步
│   │   │   ├── useChatSessionSync.ts    # 聊天会话同步
│   │   │   └── ...
│   │   │
│   │   ├── plugins/                 # 插件系统
│   │   │   ├── FileExplorerPlusPlugin.ts
│   │   │   ├── ThemeSwitcherPlugin.ts
│   │   │   └── ...
│   │   │
│   │   ├── constants/                # 常量定义
│   │   │   ├── storage-keys.ts       # 存储键名统一管理
│   │   │   └── ...
│   │   │
│   │   └── bridge/                  # 桥接层
│   │       └── host.ts              # Figma 桥接
│   │
│   └── settings/                    # 设置页面模块
│       ├── SettingsShared.tsx       # 设置共享组件
│       ├── AgentSection.tsx         # 智能体配置
│       ├── MCPModelSection.tsx      # MCP + 模型配置
│       ├── ConversationContextSection.tsx  # 对话 + 上下文
│       ├── RulesSkillsSection.tsx   # 规则 + 技能
│       └── KeybindingsEditor.tsx    # 快捷键编辑
│
└── ide/                          # IDE 相关类型定义
    └── fileData.ts               # 文件数据类型
```

## 业务服务层（v1.0.1 新增）

YYC³ 在 v1.0.1 中新增了 **21 个业务服务模块** 和 **8 个 MCP Server**，构成完整的服务层架构：

```
src/services/                      # 21 个业务服务模块 (13,995 行)
├── AIAgentOrchestrator.ts         # ⭐ 智能体编排引擎（核心）
├── FinanceAnalysisService.ts      # 金融数据分析（MACD/RSI/DCF/组合管理）
├── EducationService.ts            # 教育作业批改（AI评分/试题生成）
├── OfficeAutomationService.ts     # 办公自动化（文档模板/邮件/日程）
├── KnowledgeBaseService.ts        # 向量知识库与混合搜索
├── WebScraperService.ts           # 网页内容抓取与结构化提取
├── DataVisualizationService.ts    # 数据可视化（已集成 ChartPanel）
├── DataAnalysisService.ts         # 统计分析与数据清洗
├── GraphRAGService.ts             # 知识图谱 RAG 检索增强
├── TranslationService.ts          # 多语言翻译引擎
├── NewsGenerator.ts               # 新闻内容聚合与摘要
├── PodcastGenerator.ts            # 播客脚本与内容生成
├── ImageGenerationService.ts      # AI 图像生成与编辑
├── VideoGenerationService.ts      # 视频内容生成
├── InterviewAgent.ts              # 模拟面试智能体
├── SecurityScannerEnhanced.ts     # 增强型安全扫描器
├── DocumentParserService.ts       # 多格式文档解析
├── CodeInterpreterService.ts      # 代码沙箱解释执行
├── ASRService.ts                  # 自动语音识别
├── TTSService.ts                  # 文本转语音合成
└── WebSearchService.ts            # 网络搜索（已集成 SearchPanel）

src/mcp/servers/                   # 8 个 MCP 协议服务模块
├── DockerGatewayServer.ts         # Docker 网关管理
├── DockerServer.ts                # Docker 容器操作
├── PostgreSQLServer.ts            # PostgreSQL 数据库
├── GitHubServer.ts                # Git/GitHub 操作
├── FilesystemServer.ts            # 文件系统操作
├── BraveSearchServer.ts           # Brave Search API
├── ClaudePromptsServer.ts         # Claude 提示词管理
└── YYC3CNAssistantServer.ts       # 中文助手增强
```

> 📖 完整功能说明请参阅 [阶段性集成总结报告](docs/08-YYC3-项目整合-实施阶段/项目总结报告/YYC3-阶段性集成总结-v1.0.1.md)

## 存储架构设计

### 存储层次

YYC3 采用**三层混合存储架构**，根据数据类型和访问模式选择最优存储方案：

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (React Components)           │
├─────────────────────────────────────────────────────────────┤
│              状态管理层 (Zustand + Context)          │
├─────────────────────────────────────────────────────────────┤
│           数据适配层 (IndexedDB + localStorage)        │
├─────────────────────────────────────────────────────────────┤
│              浏览器存储层 (Browser Storage)           │
└─────────────────────────────────────────────────────────────┘
```

### 存储策略

| 存储类型 | 使用场景 | 数据类型 | 持久化 | 访问速度 |
|---------|---------|---------|---------|---------|
| **IndexedDB** | 文件内容、文件树、标签页、Git 状态 | ✅ 是 | 🟡 中 |
| **localStorage** | 配置、设置、主题、面板布局、模型配置 | ✅ 是 | 🟢 快 |
| **Zustand** | 全局状态（文件、模型、代理、预览、面板等） | ✅ 是（通过 persist） | 🟢 快 |

### 存储键名规范

**命名格式：** `yyc3_{module}_{key}`

**示例：**

```typescript
// 主题系统
yyc3-theme
yyc3_custom_themes
yyc3_active_theme_id

// 模型配置
yyc3-provider-api-keys
yyc3-provider-urls
yyc3-custom-providers
yyc3-mcp-servers
yyc3_active_model

// 面板布局
yyc3_panel_layout
yyc3_panel_tab_groups
yyc3_panel_pins

// 代理配置
yyc3_proxy_config

// 项目管理
yyc3_projects
yyc3_project_{projectId}
```

### Zustand Stores

项目使用 Zustand 进行全局状态管理，所有 Store 通过 `stores/index.ts` 统一导出：

| Store | 用途 | 持久化 |
|-------|------|---------|
| `useFileStoreZustand` | 文件内容、标签页、Git 状态 | ✅ |
| `useModelStoreZustand` | 模型配置、连接状态、心跳 | ✅ |
| `useProxyStoreZustand` | 代理服务器配置 | ✅ |
| `usePreviewStore` | 预览模式、设备预设 | ✅ |
| `usePanelPinStore` | 面板固定状态 | ✅ |
| `usePanelTabGroupStore` | 面板分组 | ✅ |
| `useFloatingPanelStore` | 浮动面板配置 | ✅ |
| `useSettingsStore` | 设置（通用、账号、智能体、MCP、模型等） | ✅ |
| `useQuickActionsStore` | 快捷操作历史 | ✅ |
| `useTaskBoardStore` | 任务看板 | ✅ |
| `usePreviewHistoryStore` | 预览历史快照 | ✅ |
| `useScrollSyncStore` | 滚动位置同步 | ✅ |
| `useAIFixStore` | AI 修复建议 | ✅ |
| `useWindowStore` | 窗口状态 | ✅ |
| `useWorkspaceStore` | 工作空间 | ✅ |
| `useSessionStore` | 会话管理 | ✅ |
| `useIPCStore` | IPC 通信 | ✅ |

### Context Providers

部分功能仍使用 React Context Provider（向后兼容）：

| Provider | 用途 | 状态 |
|---------|------|------|
| `FileStoreProvider` | 文件系统 Context（IndexedDB 封装） | 文件内容、文件树、标签页 |
| `ModelRegistryProvider` | 模型注册 Context | 模型列表、连接状态 |
| `ThemeStore` | 主题系统 Context | 当前主题、自定义主题 |
| `DndProvider` | 拖拽系统 Context | HTML5 Backend |
| `WorkflowEventBusProvider` | 工作流事件总线 | 面板间通信 |
| `PanelManagerProvider` | 面板管理 Context | 面板布局、状态 |

### IndexedDB 数据库

**数据库名称：** `YYC3FileDB`

**主要对象存储：**

- `fileContents`: 文件内容（路径 → 内容映射）
- `fileTree`: 文件树结构
- `tabs`: 打开的标签页
- `gitChanges`: Git 变更记录
- `gitLog`: Git 日志
- `snapshots`: 快照数据

**适配器封装：** `IndexedDBAdapter.ts` 提供统一的 CRUD 接口

## 核心功能

### AI 代码生成

完整的 AI 代码生成流水线，支持：

- 上下文收集与压缩
- 智能提示词构建
- 流式 LLM 响应
- 代码块解析与应用
- Diff 预览确认

**Pipeline 流程：**

```
用户输入
  ↓
ContextBuilder（上下文构建）
  ↓
SystemPrompt（系统提示词）
  ↓
LLMService（LLM 调用）
  ↓
CodeApplicator（代码应用）
  ↓
DiffPreview（Diff 预览）
  ↓
用户确认
```

### 面板管理系统

基于 react-dnd 的灵活布局系统：

- 18+ 功能面板
- 拖拽合并/拆分
- 面板固定/锁定
- 浮动窗口支持
- 布局持久化

**面板类型：**

- AI 对话面板
- 文件管理面板
- 代码编辑面板
- 预览面板
- 任务看板
- 快捷操作面板
- 浮动面板

### 任务看板

AI 驱动的任务管理系统：

- 自动任务提取
- 任务状态流转
- 优先级管理
- 子任务支持
- 提醒系统

**看板列：**

- 待处理
- 进行中
- 已完成
- 已归档

### 设置系统

完整的设置页面，包括：

- **通用设置**: 主题、语言、编辑器、快捷键
- **账号信息**: 个人资料、头像、偏好
- **智能体配置**: AI 智能体管理
- **MCP 工具**: MCP Server 配置（添加/编辑/删除/启用/禁用）
- **模型配置**: 模型列表、服务商配置、Ollama 本地模型
- **智能诊断**: 连通性测试、延迟监控、诊断建议
- **代理配置**: 代理服务器配置、健康检查
- **上下文设置**: 上下文管理、标签页设置
- **对话流设置**: 对话流配置、历史记录
- **规则技能**: 规则配置、技能管理
- **导入导出**: 配置导入/导出、数据管理

## 开发指南

### 代码规范

所有代码文件必须包含完整的文件头注释：

```typescript
/**
 * @file {filename}
 * @description {description}
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v{x.y.z}
 * @created {YYYY-MM-DD}
 * @updated {YYYY-MM-DD}
 * @status {dev|stable}
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags {comma,separated,tags}
 */
```

### 可用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build           # 构建生产版本
pnpm typecheck       # TypeScript 类型检查
pnpm lint            # 代码检查
pnpm format          # 代码格式化

# 测试
pnpm test            # 运行测试
pnpm test:watch      # 监听模式测试
pnpm test:coverage   # 生成覆盖率报告
pnpm test:e2e        # E2E 测试
```

### 架构约束

### Provider 嵌套顺序

```tsx
<DndProvider backend={HTML5Backend}>
  <WorkflowEventBusProvider>
    <FileStoreProvider>
      <ModelRegistryProvider>
        <PanelManagerProvider>
          {/* IDE 内容 */}
        </PanelManagerProvider>
      </ModelRegistryProvider>
    </FileStoreProvider>
  </WorkflowEventBusProvider>
</DndProvider>
```

### 路由约束

- **必须使用** `react-router`，**禁止** `react-router-dom`
- **必须使用** `createHashRouter`（Figma iframe 环境兼容性）
- **懒加载组件必须用 `Suspense` 包裹**

### 模型配置

- **禁止硬编码模型名称** — 所有模型通过 `ModelRegistry` 动态注册
- Provider 配置声明在 `LLMService.ts` 的 `PROVIDER_CONFIGS`

### 存储规范

- **localStorage 键名**必须使用 `yyc3_` 前缀
- **使用 `constants/storage-keys.ts` 统一管理所有键名**
- **使用 `loadJSON` / `saveJSON` 辅助函数进行安全读写**
- **Zustand Store**必须使用 persist 中间件进行自动持久化

### 状态管理规范

- **新功能优先使用 Zustand** Store
- **旧功能保持 Context Provider**（向后兼容）
- **所有 Store 通过 `stores/index.ts` 统一导出**
- **使用 Immer 支持直接 mutation 写法**

## 📚 文档导航

### 项目文档索引

完整的文档索引和导航，请访问：**[项目文档索引](docs/00-YYC3-项目总览-目录索引/001-项目总览索引-文档索引手册.md)**

### 核心文档

| 文档类型 | 文档名称 | 说明 |
|---------|---------|------|
| **项目总览** | [项目实施方案v2.0](docs/00-YYC3-项目总览-目录索引/YYC3-项目总览-实施方案v2.md) | 12个月完整实施方案 |
| **团队规范** | [代码标头规范](docs/01-YYC3-团队规范-标准规范/YYC3-团队规范-代码标头.md) | 代码文件标头规范 |
| **团队规范** | [文档格式规范](docs/01-YYC3-团队规范-标准规范/YYC3-团队规范-文档格式.md) | 文档编写格式规范 |
| **团队规范** | [文档命名规范](docs/01-YYC3-团队规范-标准规范/YYC3-团队文档-命名规范.md) | 文档命名规范标准 |
| **开发指南** | [本地开发衔接](docs/02-YYC3-开发指南-实施阶段/YYC3-开发指南-本地开发衔接.md) | 本地开发环境衔接指南 |
| **合规文档** | [贡献指南](docs/07-YYC3-项目合规-安全保障/CONTRIBUTING.md) | 如何为项目贡献代码 |
| **合规文档** | [行为准则](docs/07-YYC3-项目合规-安全保障/CODE_OF_CONDUCT.md) | 贡献者行为准则 |
| **合规文档** | [安全政策](docs/07-YYC3-项目合规-安全保障/SECURITY.md) | 安全漏洞报告流程 |
| **标准文档** | [环境变量配置](docs/10-YYC3-项目模版-标准规范/ENVIRONMENT.md) | 环境变量配置文档 |
| **项目分析** | [项目深度分析报告](docs/08-YYC3-项目整合-实施阶段/项目分析报告/YYC3-项目深度分析报告-v2.md) | 项目技术架构分析 |
| **CI/CD 审核** | [CI/CD 审核报告](docs/CI-CD-AUDIT-REPORT.md) | CI/CD 配置审核与优化 |
| **CI/CD 优化** | [CI/CD 优化实施指南](docs/CI-CD-OPTIMIZATION-GUIDE.md) | CI/CD 优化功能详解 |
| **项目总结** | [项目交付清单](docs/08-YYC3-项目整合-实施阶段/项目总结报告/YYC3-项目报告-交付清单.md) | 项目交付物清单 |

### 快速导航

- **🚀 快速开始**: 查看 [本地开发衔接](docs/02-YYC3-开发指南-实施阶段/YYC3-开发指南-本地开发衔接.md)
- **📖 了解规范**: 查看 [团队规范文档](docs/01-YYC3-团队规范-标准规范/)
- **🤝 贡献代码**: 查看 [贡献指南](docs/07-YYC3-项目合规-安全保障/CONTRIBUTING.md)
- **🔒 安全问题**: 查看 [安全政策](docs/07-YYC3-项目合规-安全保障/SECURITY.md)
- **📊 项目分析**: 查看 [项目深度分析报告](docs/08-YYC3-项目整合-实施阶段/项目分析报告/YYC3-项目深度分析报告-v2.md)
- **📋 实施计划**: 查看 [项目实施方案v2.0](docs/00-YYC3-项目总览-目录索引/YYC3-项目总览-实施方案v2.md)

### 旧版文档

- [开发指南(旧版)](docs/README-Development-Guide.md) - 详细的开发环境配置和架构说明
- [团队规范(旧版)](guidelines/YYC3.md) - YYC3 团队开发规范
- [代码标头规范(旧版)](guidelines/YYC3-Code-header.md) - 文件头注释标准
- [设计指南(旧版)](guidelines/Guidelines.md) - Figma AI 编码指南

## 测试覆盖

| 指标 | 数值 |
|------|------|
| **测试文件** | 141 个 |
| **测试用例** | 3,246 个 |
| **通过** | 3,246 个 |
| **跳过** | 0 个 |
| **通过率** | 100% |
| **服务模块** | 21 个 (13,995 行) |
| **MCP Server** | 8 个 |

### 测试类型分布

- **单元测试**: 2,400+ 个
- **集成测试**: 250+ 个
- **E2E 测试**: 40+ 个
- **覆盖率**: 85%+

## CI/CD 部署

### 自动部署流程

项目已配置 GitHub Actions 自动部署到 GitHub Pages，访问地址：**[https://family-ai.yyc3.vip](https://family-ai.yyc3.vip)**

### 部署触发条件

- **Push 到 main 分支**: 自动触发完整 CI/CD 流程并部署到生产环境
- **Push 到 staging 分支**: 自动触发完整 CI/CD 流程并部署到预发布环境
- **Push 到 develop 分支**: 自动触发测试但不部署
- **Pull Request**: 自动运行测试并在 PR 中报告结果
- **手动触发**: 支持通过 GitHub Actions 界面手动触发，可选择目标环境

### CI/CD 优化功能

项目已实施以下 CI/CD 优化，提升部署效率和质量：

#### 1. 构建缓存优化 ✅

- 使用 pnpm 缓存机制，缓存 `node_modules` 和 `~/.pnpm-store`
- 预计减少构建时间 **30-40%**
- 依赖安装时间从 ~2 分钟降低到 ~30 秒
- 总构建时间从 ~3.5 分钟降低到 ~2.5 分钟

#### 2. 部署通知功能 ✅

- 自动发送部署状态通知到 `admin@0379.email`
- 通知包含：部署状态、分支、Commit、触发者、构建时间等
- 无论部署成功或失败都会发送通知
- 支持配置多个通知接收邮箱

#### 3. 性能监控 ✅

- 自动记录每次构建的耗时
- 在质量报告中显示构建时间趋势
- 监控部署成功率
- 帮助识别性能瓶颈和优化机会

#### 4. 多环境支持 ✅

- **Production**: `main` 分支 → <https://family-ai.yyc3.vip>
- **Staging**: `staging` 分支 → <https://staging.family-ai.yyc3.vip>
- **Development**: `develop` 分支 → 本地开发
- 支持手动触发并选择目标环境
- 独立的并发控制，避免环境冲突

**详细文档**: [CI/CD 优化实施指南](docs/CI-CD-OPTIMIZATION-GUIDE.md)

### CI/CD 流水线

项目采用**四级 CI/CD Workflow**架构：

```
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Actions CI/CD                   │
├─────────────────────────────────────────────────────────────┤
│  1. Build & Test Job                                │
│     ├── Checkout 代码                                  │
│     ├── Setup Node.js 20                               │
│     ├── Setup pnpm 10                                 │
│     ├── Install Dependencies                            │
│     ├── Run ESLint                                    │
│     ├── Run TypeScript Type Check                       │
│     ├── Run Tests (Vitest)                            │
│     ├── Generate Coverage Report                         │
│     ├── Build Project (Vite)                          │
│     └── Upload Artifacts                              │
├─────────────────────────────────────────────────────────────┤
│  2. Deploy Job (依赖 Build & Test)                   │
│     ├── Download Build Artifacts                        │
│     └── Deploy to GitHub Pages                         │
├─────────────────────────────────────────────────────────────┤
│  3. PR Comment Job (仅 PR 时运行)                    │
│     ├── Download Test Reports                          │
│     └── Comment Quality Report on PR                  │
└─────────────────────────────────────────────────────────────┘
```

### Workflow 文件

| Workflow              | 用途　　　　　　　　　　 | 文件　　　　　　　　　　　　　　　　　　　|
| -----------------------| --------------------------| -------------------------------------------|
| **Enhanced CI/CD**    | 主要部署流程（带报告）　 | `.github/workflows/ci-cd-enhanced.yml`　　|
| **Intelligent CI/CD** | 智能质量分析（带趋势图） | `.github/workflows/ci-cd-intelligent.yml` |
| **Advanced CI/CD**    | 高级功能（多环境支持）　 | `.github/workflows/ci-cd-advanced.yml`　　|
| **Basic CI/CD**       | 基础流程（快速部署）　　 | `.github/workflows/ci-cd-basic.yml`　　　 |

### 质量门禁

所有部署必须通过以下质量检查：

- ✅ **ESLint**: 无错误
- ✅ **TypeScript**: 类型检查通过
- ✅ **Tests**: 所有测试通过（100% 通过率）
- ✅ **Build**: 生产构建成功

### 部署环境

- **环境名称**: `github-pages`
- **部署 URL**: <https://family-ai.yyc3.vip>
- **静态站点**: GitHub Pages
- **构建输出**: `dist/` 目录

### 查看部署状态

1. 访问 GitHub Actions 页面：<https://github.com/YanYuCloudCube/YYC3-Family-AI/actions>
2. 查看最新的 workflow 运行记录
3. 点击具体 workflow 查看详细日志和部署状态

### 本地预览部署

在部署前，可以本地预览构建结果：

```bash
# 构建生产版本
pnpm build

# 本地预览
pnpm preview
```

访问 `http://localhost:4173` 查看预览效果。

## 贡献指南

我们欢迎并感谢所有形式的贡献！请遵循以下步骤：

1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 安装依赖 (`pnpm install`)
4. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 开启 **Pull Request**

详细的贡献规范请参阅 [CONTRIBUTING.md](docs/07-YYC3-项目合规-安全保障/CONTRIBUTING.md)。

## 许可证

本项目采用 [MIT 许可证](https://opensource.org/licenses/MIT) - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- **团队**: YanYuCloudCube Team
- **邮箱**: <admin@0379.email>
- **GitHub**: [YanYuCloudCube](https://github.com/YanYuCloudCube)
- **在线体验**: [https://family-ai.yyc3.vip](https://family-ai.yyc3.vip)

---

**项目版本**: v1.0.1
**最后更新**: 2026-04-15
**维护团队**: YanYuCloudCube Team
**文档状态**: ✅ 已完善
**在线地址**: [https://family-ai.yyc3.vip](https://family-ai.yyc3.vip)

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

<br />

**Built with ❤️ by [YanYuCloudCube Team](https://github.com/YanYuCloudCube)**

</div>
