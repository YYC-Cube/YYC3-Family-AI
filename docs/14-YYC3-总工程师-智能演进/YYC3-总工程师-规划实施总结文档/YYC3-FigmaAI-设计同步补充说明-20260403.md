---
file: YYC3-FigmaAI-设计同步补充说明-20260403.md
description: YYC³ Family AI Figma 设计与代码同步补充说明
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-04-03
updated: 2026-04-03
status: production
tags: [figma],[design-sync],[code-first],[reverse-engineering]
category: design
language: zh-CN
audience: designers,developers
complexity: intermediate
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ Family AI - Figma 设计与代码同步补充说明

## 一、项目现状概述

### 1.1 项目运行环境

| 维度 | 说明 |
|------|------|
| **运行环境** | Figma iframe 环境 |
| **部署 URL** | https://family-ai.yyc3.vip |
| **项目类型** | 多联式低码智能编程平台 |
| **技术栈** | React 18 + TypeScript 5.8 + Tailwind CSS v4 |
| **状态管理** | Zustand (15+ stores) |
| **测试覆盖** | 2434 个测试用例 |

### 1.2 现有代码实现状态

| 模块 | 文件路径 | 实现状态 | 功能说明 |
|------|---------|---------|---------|
| **模型管理** | `src/app/components/ide/ModelSettings.tsx` | ✅ 完整 | 多 Provider 管理、API Key 配置、连通性测试、延迟监控 |
| **Agent 编排** | `src/app/components/ide/AgentOrchestrator.tsx` | ✅ 完整 | 可视化工作流、节点连接、条件分支、并行执行 |
| **AI Pipeline** | `src/app/components/ide/ai/AIPipeline.ts` | ✅ 完整 | 代码生成流水线、上下文构建、系统提示词 |
| **代码应用器** | `src/app/components/ide/ai/CodeApplicator.ts` | ✅ 完整 | Diff 预览、代码应用、安全扫描 |
| **任务推理** | `src/app/components/ide/ai/TaskInferenceEngine.ts` | ✅ 完整 | 从 AI 响应提取任务 |
| **错误分析** | `src/app/components/ide/ai/ErrorAnalyzer.ts` | ✅ 完整 | 错误诊断、修复建议 |
| **测试生成** | `src/app/components/ide/ai/TestGenerator.ts` | ✅ 完整 | 自动生成测试用例 |
| **任务看板** | `src/app/components/ide/stores/useTaskBoardStore.ts` | ✅ 完整 | 任务管理、状态追踪 |
| **设置桥接** | `src/app/components/ide/SettingsBridge.ts` | ✅ 完整 | 设置同步、状态持久化 |

### 1.3 Figma 项目状态

| 维度 | 说明 |
|------|------|
| **Figma 文件** | `/docs/14-YYC3-总工程师-智能演进/F/` 目录 |
| **设计状态** | 文件夹状态，需要与代码同步 |
| **设计系统** | 需要基于代码提取和建立 |
| **组件库** | 需要将现有组件转换为 Figma 组件 |

---

## 二、设计与代码同步策略

### 2.1 代码优先原则

**核心理念**：以现有代码实现为准，Figma 设计跟随代码。

**原因**：
1. 代码已经完整实现核心功能
2. 测试覆盖率高，功能稳定
3. 已部署上线，用户正在使用
4. 设计滞后于代码实现

**实施步骤**：
```
现有代码 → 提取设计系统 → 生成 Figma 组件 → 建立组件库 → 新功能设计
```

### 2.2 双向同步机制

```
┌─────────────┐
│  代码实现    │ ←───────┐
└─────────────┘         │
        │               │
        ▼               │
┌─────────────┐         │
│  设计同步    │ ────────┘
└─────────────┘
        │
        ▼
┌─────────────┐
│ Figma 设计  │
└─────────────┘
        │
        ▼
┌─────────────┐
│  设计优化    │ ───→ 反馈到代码
└─────────────┘
```

### 2.3 同步优先级

| 优先级 | 模块 | 同步方式 | 预计时间 |
|--------|------|---------|---------|
| **P0** | ModelSettings | 代码 → 设计 | 2 天 |
| **P0** | AgentOrchestrator | 代码 → 设计 | 2 天 |
| **P1** | AI Pipeline 相关组件 | 代码 → 设计 | 3 天 |
| **P1** | 任务看板 | 代码 → 设计 | 2 天 |
| **P2** | 新功能设计 | 设计 → 代码 | 按计划 |

---

## 三、Figma AI 反向工程提示词

### 3.1 基于现有代码生成设计

**Prompt: Code-to-Design Reverse Engineering**

```
Reverse Engineer Figma Design from Existing Code

Context:
- Project: YYC³ Family AI
- Deployment: https://family-ai.yyc3.vip
- Tech Stack: React 18 + TypeScript 5.8 + Tailwind CSS v4
- Runtime: Figma iframe environment
- Status: Code is complete, design needs to sync

Source Code Files:
1. ModelSettings.tsx (模型管理设置面板)
   - Path: src/app/components/ide/ModelSettings.tsx
   - Features: Multi-provider management, API key config, connectivity test
   - UI Structure: Provider cards, model list, test buttons, status indicators

2. AgentOrchestrator.tsx (Agent 编排面板)
   - Path: src/app/components/ide/AgentOrchestrator.tsx
   - Features: Visual workflow, node connection, conditional branching
   - UI Structure: Node palette, canvas, property panel

Requirements:

1. Analyze Code Structure:
   - Extract component hierarchy
   - Identify UI patterns
   - Map state to visual elements
   - Document interaction behaviors

2. Generate Figma Components:
   - Create component variants (default, hover, active, disabled)
   - Apply design system from code (colors, fonts, spacing)
   - Ensure responsive layouts (Desktop/Tablet/Mobile)
   - Include all states and interactions

3. Design System Extraction:
   - Colors: Extract from Tailwind classes
   - Typography: Extract font sizes, weights, line heights
   - Spacing: Extract padding, margin, gap values
   - Effects: Extract shadows, borders, border-radius

4. Component Library:
   - Create master components
   - Define variants and properties
   - Establish auto-layout constraints
   - Document usage guidelines

Output:
1. Figma file with all components
2. Design system documentation
3. Component usage guide
4. Code-to-design mapping document

Constraints:
- Strictly follow existing code structure
- No design changes without code changes
- Maintain 1:1 correspondence with code
- Preserve all functionality
```

### 3.2 ModelSettings 组件设计提示词

**Prompt: ModelSettings Component Design**

```
Design ModelSettings Component Based on Existing Code

Source Code Analysis:
- File: src/app/components/ide/ModelSettings.tsx
- Lines: ~2000+ lines
- Features:
  • Provider management (Ollama, OpenAI, GLM, Qwen, DeepSeek, Custom)
  • API key configuration with show/hide toggle
  • Model list with checkboxes and drag reorder
  • Connectivity test with latency indicator
  • Performance metrics chart (Recharts)
  • MCP server configuration
  • Proxy settings

UI Structure:
```
ModelSettings
├── Provider Cards (Expandable)
│   ├── Provider Header
│   │   ├── Provider Icon (48x48px)
│   │   ├── Provider Name (bold, 16px)
│   │   ├── Status Badge (connected/disconnected/testing/error)
│   │   └── Expand/Collapse Chevron
│   └── Provider Content (Expanded)
│       ├── API Key Input (password with show/hide)
│       ├── Base URL Input
│       ├── Model List
│       │   ├── Model Item
│       │   │   ├── Checkbox
│       │   │   ├── Model Name
│       │   │   ├── Type Badge (LLM/Code/Vision)
│       │   │   ├── Context Window Info
│       │   │   └── Drag Handle
│       │   └── Select All / Deselect All Buttons
│       ├── Test Connection Button
│       └── Latency Indicator
├── MCP Servers Section
│   ├── Server Cards
│   └── Add Server Button
└── Proxy Settings Section
    ├── Proxy URL Input
    ├── Health Check Button
    └── Status Indicator
```

Design Requirements:
1. Dark theme (Slate 900 background)
2. Card-based layout (padding: 16px, border-radius: 8px)
3. Status indicators with glow effects
4. Smooth animations (200-300ms)
5. Responsive: Desktop (1440px), Tablet (768px), Mobile (375px)

Output:
1. ModelSettings component (all states)
2. Provider card component (expanded/collapsed)
3. Model list item component
4. MCP server card component
5. Proxy settings panel
```

### 3.3 AgentOrchestrator 组件设计提示词

**Prompt: AgentOrchestrator Component Design**

```
Design AgentOrchestrator Component Based on Existing Code

Source Code Analysis:
- File: src/app/components/ide/AgentOrchestrator.tsx
- Lines: ~500+ lines
- Features:
  • Visual workflow canvas
  • Node types: input, llm, tool, rag, condition, code, output
  • Node connection with edges
  • Node palette for adding nodes
  • Property panel for node configuration
  • Workflow controls (play, pause, stop)

UI Structure:
```
AgentOrchestrator
├── Panel Header
│   ├── Title: "Agent 编排"
│   └── Controls: Play, Pause, Settings
├── Node Palette (Left Sidebar)
│   ├── Input Node (Globe icon, emerald)
│   ├── LLM Node (Bot icon, sky blue)
│   ├── Tool Node (Settings icon, amber)
│   ├── RAG Node (FileSearch icon, purple)
│   ├── Condition Node (ArrowRight icon, orange)
│   ├── Code Node (Sparkles icon, pink)
│   └── Output Node (Database icon, cyan)
├── Canvas (Main Area)
│   ├── Grid Background
│   ├── Nodes (Draggable)
│   │   ├── Node Icon (20x20px)
│   │   ├── Node Label (12px)
│   │   ├── Status Indicator (idle/running/success/error)
│   │   └── Connection Points (input/output)
│   └── Edges (Bezier curves with arrows)
└── Property Panel (Right Sidebar)
    ├── Node Name Input
    ├── Model Selection (for LLM nodes)
    ├── Configuration Form
    └── Delete Button
```

Node Types:
- Input (输入节点): Globe icon, emerald color (#10B981)
- LLM (LLM 推理): Bot icon, sky blue (#0EA5E9)
- Tool (工具调用): Settings icon, amber (#F59E0B)
- RAG (RAG 检索): FileSearch icon, purple (#8B5CF6)
- Condition (条件分支): ArrowRight icon, orange (#F97316)
- Code (代码执行): Sparkles icon, pink (#EC4899)
- Output (输出节点): Database icon, cyan (#06B6D4)

Design Requirements:
1. Dark theme with grid background
2. Nodes with glow effects when selected
3. Animated edges (flowing particles)
4. Drag-and-drop interaction
5. Zoom and pan controls

Output:
1. AgentOrchestrator component (full view)
2. Node components (all types and states)
3. Edge component (with animation)
4. Node palette component
5. Property panel component
```

---

## 四、设计系统提取指南

### 4.1 从代码提取颜色系统

**方法**：分析 Tailwind CSS 类名

```typescript
// 从代码中提取的颜色示例
const colors = {
  // Background Colors
  bgPrimary: 'bg-slate-900',      // #0F172A
  bgSecondary: 'bg-slate-800',    // #1E293B
  bgTertiary: 'bg-slate-700',     // #334155
  bgCard: 'bg-white/[0.05]',      // rgba(255,255,255,0.05)
  
  // Text Colors
  textPrimary: 'text-white',      // #FFFFFF
  textSecondary: 'text-slate-300', // #CBD5E1
  textMuted: 'text-slate-400',    // #94A3B8
  
  // Accent Colors
  accentBlue: 'text-sky-400',     // #38BDF8
  accentGreen: 'text-emerald-400', // #34D399
  accentPurple: 'text-violet-400', // #A78BFA
  accentAmber: 'text-amber-400',  // #FBBF24
  
  // Status Colors
  statusSuccess: 'text-emerald-500', // #10B981
  statusError: 'text-red-500',    // #EF4444
  statusWarning: 'text-amber-500', // #F59E0B
  statusInfo: 'text-sky-500',     // #0EA5E9
}
```

### 4.2 从代码提取字体系统

**方法**：分析 Tailwind CSS 类名

```typescript
// 从代码中提取的字体示例
const typography = {
  // Font Family
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: 'text-xs',    // 12px
    sm: 'text-sm',    // 14px
    base: 'text-base', // 16px
    lg: 'text-lg',    // 18px
    xl: 'text-xl',    // 20px
    '2xl': 'text-2xl', // 24px
    '3xl': 'text-3xl', // 30px
  },
  
  // Font Weights
  fontWeight: {
    normal: 'font-normal',   // 400
    medium: 'font-medium',   // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',       // 700
  },
}
```

### 4.3 从代码提取间距系统

**方法**：分析 Tailwind CSS 类名

```typescript
// 从代码中提取的间距示例
const spacing = {
  // Padding
  p1: 'p-1',   // 4px
  p2: 'p-2',   // 8px
  p3: 'p-3',   // 12px
  p4: 'p-4',   // 16px
  p6: 'p-6',   // 24px
  p8: 'p-8',   // 32px
  
  // Margin
  m1: 'm-1',   // 4px
  m2: 'm-2',   // 8px
  m4: 'm-4',   // 16px
  
  // Gap
  gap1: 'gap-1', // 4px
  gap2: 'gap-2', // 8px
  gap3: 'gap-3', // 12px
  gap4: 'gap-4', // 16px
}
```

---

## 五、实施计划

### 5.1 第一阶段：代码到设计同步（Week 1-2）

**目标**：将现有代码转换为 Figma 设计组件

**任务清单**：
- [ ] 截取现有界面截图
- [ ] 使用 Figma AI 生成初步设计
- [ ] 提取设计系统（颜色、字体、间距）
- [ ] 创建 ModelSettings 组件
- [ ] 创建 AgentOrchestrator 组件
- [ ] 建立 Figma 组件库

**交付物**：
1. Figma 文件（包含所有组件）
2. 设计系统文档
3. 组件库（可复用）

### 5.2 第二阶段：设计系统完善（Week 3）

**目标**：建立完整的设计系统

**任务清单**：
- [ ] 创建颜色变量库
- [ ] 创建字体样式库
- [ ] 创建间距规范
- [ ] 创建组件变体
- [ ] 编写组件文档

**交付物**：
1. 设计系统库
2. 组件使用指南
3. 设计规范文档

### 5.3 第三阶段：新功能设计（Week 4-5）

**目标**：按照设计文档实施新功能

**任务清单**：
- [ ] Multi-Agent 状态面板设计
- [ ] 任务流程可视化设计
- [ ] 智能体协作图设计
- [ ] 代码应用预览优化
- [ ] 持久记忆面板设计

**交付物**：
1. 新功能设计稿
2. 交互原型
3. 动效规范

---

## 六、质量保障

### 6.1 设计与代码一致性检查

- [ ] 所有组件与代码 1:1 对应
- [ ] 颜色、字体、间距与代码一致
- [ ] 交互行为与代码一致
- [ ] 状态变体与代码一致

### 6.2 响应式设计检查

- [ ] Desktop (1440px) 布局正确
- [ ] Tablet (768px) 布局正确
- [ ] Mobile (375px) 布局正确

### 6.3 无障碍设计检查

- [ ] 颜色对比度符合 WCAG 标准
- [ ] 键盘导航支持
- [ ] 屏幕阅读器兼容

---

## 七、工具与资源

### 7.1 Figma AI 工具

| 工具 | 用途 | 推荐模型 |
|------|------|---------|
| **Figma AI** | 设计生成 | Claude Opus 4.6 |
| **Figma to Code** | 设计转代码 | Claude Sonnet 4.6 |
| **Screenshot to Design** | 截图转设计 | Gemini 3.1 Pro |

### 7.2 辅助工具

| 工具 | 用途 |
|------|------|
| **Tailwind CSS IntelliSense** | 提取设计系统 |
| **Chrome DevTools** | 分析样式 |
| **Figma Inspector** | 检查设计属性 |

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-04-03 | 初始版本，补充设计与代码同步说明 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
