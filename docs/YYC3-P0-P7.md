# P0 核心功能逐个完善方案

---

## P0-C1: AI Agent 工作流可视化编排

### 1. 现有基础分析

已有资产：

- [WorkflowEngine.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/ai/WorkflowEngine.ts) — v2.0 工作流引擎，支持步骤依赖、暂停/取消、事件系统
- [AgentOrchestrator.ts](file:///Volumes/Max/YYC3-Family-AI/src/agent/orchestrator/AgentOrchestrator.ts) — 多 Agent 编排引擎，支持任务队列、并行执行
- [WorkflowPipeline.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/WorkflowPipeline.tsx) — 已有 UI 组件
- [AIFamilySkills.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/ai/AIFamilySkills.ts) — 24 个技能定义

**缺口**: 缺少拖拽式 DAG 画布、条件分支、可视化进度追踪。

### 2. 功能规格

| 维度 | 内容 |
|------|------|
| **目标** | 将 `WorkflowEngine` 从代码级编排升级为可视化 DAG 编辑器 |
| **入口** | 顶部菜单栏 "工作流" 按钮，或从 TaskBoard 右键创建 |
| **核心交互** | 拖拽节点 → 连线 → 配置 → 执行 → 观察 |

### 3. 用户场景

```
场景1: 创建新工作流
  用户点击"新建工作流" → 从左侧 Agent 面板拖入「天枢·规划」「宗师·执行」「守护·审查」
  → 连线：天枢→宗师→守护 → 配置每个节点的 Prompt 模板
  → 点击"运行" → 实时看到每个节点状态变化

场景2: 条件分支
  用户在天枢和宗师之间插入「条件节点」
  → 配置: if 输出包含"React" → 走 React Agent; else → 走通用 Agent
  → 运行时自动路由到对应分支

场景3: 模板复用
  用户保存工作流为"React 组件开发流程"模板
  → 下次创建时直接选择模板 → 修改部分参数即可运行
```

### 4. 功能流程图

```
┌──────────────────────────────────────────────────────────┐
│              Workflow Orchestration Flow                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [新建工作流]                                              │
│       ↓                                                   │
│  [从 Agent 面板拖入节点] ─── 节点类型:                     │
│       ↓                    • Agent 节点(天枢/宗师/守护...) │
│  [连线建立依赖]              • 条件节点(if/else/switch)     │
│       ↓                    • 循环节点(for/while)          │
│  [配置节点参数]              • 并行节点(fan-out/in)        │
│       ↓                    • 用户审批节点                   │
│  [保存草稿/模板]                                           │
│       ↓                                                   │
│  [执行工作流]                                              │
│       ↓                                                   │
│  [实时状态追踪] ── pending → running → completed/failed    │
│       ↓                                                   │
│  [查看输出/调试/重试]                                       │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 5. 界面设计规范

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar: [← 返回] 工作流名称 [运行▶] [停止■] [保存] [导出]   │
├──────────┬──────────────────────────────────┬───────────────┤
│ Agent    │                                  │  属性配置面板   │
│ 面板     │      ReactFlow DAG Canvas        │  ┌───────────┐ │
│          │                                  │  │ 节点名称   │ │
│ 🧠 天枢   │  [天枢]──→[宗师]──→[守护]        │  │ Agent选择  │ │
│ 📚 宗师   │              ↓                  │  │ Prompt模板 │ │
│ 🛡️ 守护   │           [审批]──→[先知]        │  │ 超时设置   │ │
│ 🤔 语枢   │                                  │  │ 重试次数   │ │
│ 🔮 先知   │                                  │  │ 依赖步骤   │ │
│ ...      │                                  │  └───────────┘ │
├──────────┴──────────────────────────────────┴───────────────┤
│  StatusBar: 总步骤:5 | 完成:2 | 运行中:1 | 失败:0           │
└─────────────────────────────────────────────────────────────┘
```

**色彩体系**: 节点颜色与 8 位 AI 家人色系一一对应，执行中脉冲动画 (`animate-pulse`)，完成绿色 `bg-emerald-500`，失败红色 `bg-red-500`。

### 6. 技术实现路径

**新增依赖**: `reactflow@11.11.x`

**新增文件**:

| 文件 | 路径 | 职责 |
|------|------|------|
| `WorkflowCanvas.tsx` | `src/app/components/ide/` | ReactFlow DAG 画布组件 |
| `WorkflowNode.tsx` | `src/app/components/ide/` | 自定义 Agent 节点渲染 |
| `WorkflowConditionNode.tsx` | `src/app/components/ide/` | 条件分支节点 |
| `WorkflowPropertiesPanel.tsx` | `src/app/components/ide/` | 右侧属性编辑面板 |
| `WorkflowAgentPanel.tsx` | `src/app/components/ide/` | 左侧 Agent 拖拽源面板 |
| `workflowStore.ts` | `src/app/components/ide/stores/` | 画布状态管理 (nodes/edges/selection) |
| `WorkflowNodeTypes.ts` | `src/app/components/ide/types/` | 节点类型定义 |

**修改文件**:

| 文件 | 变更 |
|------|------|
| [WorkflowEngine.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/ai/WorkflowEngine.ts) | 增加条件分支执行、并行执行、循环支持 |
| [PanelManager.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/PanelManager.tsx) | 注册 `workflow-canvas` 为新面板类型 |
| `IDEPage.tsx` | 添加工作流入口路由 |

**核心类型扩展** (`WorkflowNodeTypes.ts`):

```typescript
// 扩展现有 WorkflowDefinition 支持可视化
export type WorkflowNodeType = 'agent' | 'condition' | 'loop' | 'parallel' | 'approval';

export interface WorkflowNodeData {
  nodeType: WorkflowNodeType;
  agentId?: string;       // Agent 节点专属
  agentName?: string;
  skillId?: string;       // 技能 ID
  promptTemplate: string;
  condition?: {           // 条件节点专属
    field: string;
    operator: 'contains' | 'equals' | 'regex';
    value: string;
    trueBranch: string;
    falseBranch: string;
  };
  timeout: number;
  retryCount: number;
}

export interface WorkflowCanvasState {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  viewport: { x: number; y: number; zoom: number };
}
```

**关键实现点**:

1. **ReactFlow 集成**: `WorkflowCanvas` 使用 `reactflow` 的 `ReactFlow` 组件，自定义 `nodeTypes` 映射
2. **双向同步**: 画布变更 ↔ `WorkflowEngine` 步骤定义双向转换
3. **条件分支**: 扩展 `WorkflowEngine.executeSteps()` 增加 `condition` 处理逻辑
4. **并行执行**: 分析 DAG 拓扑，找出无依赖关系的节点并行执行
5. **持久化**: 工作流 JSON 存储到 IndexedDB（复用 `IndexedDBAdapter`）

**实现步骤（约 5 天）**:

1. Day 1: 安装 reactflow，创建 `WorkflowCanvas` + `WorkflowNode` 基础渲染
2. Day 2: 实现拖拽添加节点、连线、删除
3. Day 3: 属性配置面板、与 WorkflowEngine 双向同步
4. Day 4: 条件分支 + 并行执行逻辑、执行状态可视化
5. Day 5: 模板保存/加载、集成测试

---

## P0-C2: 代码智能补全 (Inline Completion)

### 1. 现有基础分析

已有资产：

- [AICompletionService.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/services/AICompletionService.ts) — 已实现基础补全服务，含缓存、防抖、AbortController
- [MonacoWrapper.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/MonacoWrapper.tsx) — 第 22 行已导入 `registerAIInlineCompletionProvider`
- [LLMService.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/LLMService.ts) — 流式 LLM 调用已完善

**缺口**: `AICompletionService` 缺少 Monaco `InlineCompletionItemProvider` 注册、FIM (Fill-in-the-Middle) Prompt 模板、上下文收集增强。

### 2. 功能规格

| 维度 | 内容 |
|------|------|
| **目标** | 在 Monaco 编辑器中实现类似 Copilot 的灰色幽灵文本补全 |
| **触发** | 光标停止 300ms 后自动触发 |
| **接受** | Tab 键接受全部，Ctrl+→ 逐词接受 |
| **拒绝** | Esc 或继续输入 |
| **多行** | 支持多行补全（最大 4 行） |

### 3. 用户场景

```
场景1: 单行补全
  用户输入: "const handleClick = use"
  停顿 300ms → AI 补全: "Callback(() => {" (灰色)
  用户按 Tab → 接受补全

场景2: 多行函数补全
  用户输入: "function fetchUser("
  AI 补全:
    "id: string): Promise<User> {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    }"
  用户按 Tab → 全部接受

场景3: 注释驱动补全
  用户输入: "// 创建一个防抖函数"
  AI 理解注释意图，补全完整的防抖函数实现
```

### 4. 功能流程图

```
[光标停止] → [300ms 防抖] → [取消上一次请求]
    ↓
[收集上下文]
    ├── 光标前代码 (prefix, 最多 40 行)
    ├── 光标后代码 (suffix, 最多 10 行)
    ├── 当前文件语言
    ├── 同项目关联文件顶部 (imports/top-level)
    └── 最近编辑的文件 (LRU 5 个)
    ↓
[检查缓存] → [命中?] → 是 → [返回缓存结果]
    ↓ 否
[构建 FIM Prompt]
    ├── System: "You are a code completion AI. Complete ONLY..."
    ├── User: <|fim_prefix|>...<|fim_suffix|>...<|fim_middle|>
    └── 注入语言和项目上下文
    ↓
[LLM 流式请求] → [30ms 无新 token → 截断]
    ↓
[后处理]
    ├── 去重 (与 suffix 重叠部分移除)
    ├── 截断到合理长度
    └── 多行格式化
    ↓
[渲染 Ghost Text] → [用户交互] → Tab 接受 / Esc 拒绝
```

### 5. 技术实现路径

**修改文件**:

| 文件 | 变更 |
|------|------|
| [AICompletionService.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/services/AICompletionService.ts) | **重大增强**: 实现 Monaco `InlineCompletionItemProvider` 接口、FIM Prompt、上下文收集、流式渲染 |
| [MonacoWrapper.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/MonacoWrapper.tsx) | 补全开关控制、配置面板集成 |

**核心实现 — `AICompletionService.ts` 重构**:

```typescript
// 在现有 AICompletionServiceImpl 类中增加:

import type { languages, editor, Position, CancellationToken } from "monaco-editor";

// 实现 Monaco 原生 InlineCompletionItemProvider 接口
class AICompletionServiceImpl implements languages.InlineCompletionItemProvider {

  // 上下文收集增强
  private async collectCompletionContext(
    model: editor.ITextModel,
    position: Position,
  ): Promise<{
    prefix: string;
    suffix: string;
    language: string;
    relatedFiles: { path: string; content: string }[];
  }> {
    const prefix = model.getValueInRange({
      startLineNumber: Math.max(1, position.lineNumber - MAX_PREFIX_LINES),
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    const suffix = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: Math.min(model.getLineCount(), position.lineNumber + MAX_SUFFIX_LINES),
      endColumn: model.getLineMaxColumn(Math.min(model.getLineCount(), position.lineNumber + MAX_SUFFIX_LINES)),
    });

    // 从 FileStore 获取关联文件 (imports + recently viewed)
    const relatedFiles = this.getRelatedFiles(model.uri.path);

    return { prefix, suffix, language: model.getLanguageId(), relatedFiles };
  }

  // FIM Prompt 构建
  private buildFIMPrompt(
    ctx: { prefix: string; suffix: string; language: string; relatedFiles: { path: string; content: string }[] },
    providerConfig: ProviderConfig,
  ): ChatMessage[] {
    // 根据 provider 类型选择 FIM 格式
    if (providerConfig.id === 'ollama') {
      return [{
        role: 'user',
        content: `<|fim_prefix|>${ctx.prefix}<|fim_suffix|>${ctx.suffix}<|fim_middle|>`,
      }];
    }
    // OpenAI-compatible providers
    return [{
      role: 'user',
      content: `Complete the code between `;

    // ... FIM Prompt 继续
  }

  // Monaco InlineCompletionItemProvider 接口实现
  async provideInlineCompletions(
    model: editor.ITextModel,
    position: Position,
    _context: languages.InlineCompletionContext,
    token: CancellationToken,
  ): Promise<languages.InlineCompletions<languages.InlineCompletion>> {
    // 1. 缓存检查
    // 2. 上下文收集
    // 3. LLM 请求 (流式, 取首个 token 后立即返回)
    // 4. 返回 InlineCompletion 对象
  }

  // 流式补全: 首个 token 返回后立即渲染, 后续 token 追加
  private async *streamCompletion(
    messages: ChatMessage[],
    signal: AbortSignal,
  ): AsyncGenerator<{ items: languages.InlineCompletion[] }> {
    // yield partial results as they arrive
  }
}
```

**MonacoWrapper 集成点** (修改 `MonacoWrapper.tsx`):

```typescript
// 在 onMount 回调中注册 provider
const handleEditorMount: OnMount = (editor, monaco) => {
  // ... 现有主题注册代码 ...

  // 注册 AI 内联补全
  const completionService = getAICompletionService();
  const disposable = monaco.languages.registerInlineCompletionsProvider(
    { pattern: '**' }, // 所有语言
    completionService,
  );

  // 补全开关快捷键
  editor.addAction({
    id: 'toggle-ai-completion',
    label: 'Toggle AI Completion',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
    run: () => completionService.toggle(),
  });
};
```

**实现步骤（约 4 天）**:

1. Day 1: 实现 `InlineCompletionItemProvider` 接口，裸 FIM Prompt 请求
2. Day 2: 上下文收集增强（关联文件、项目结构），FIM Prompt 模板优化
3. Day 3: 流式补全渲染（增量显示 ghost text），缓存和去重优化
4. Day 4: 配置面板（开关/延迟/Token 数），MonacoWrapper 集成，测试

---

## P0-C3: 项目级代码理解引擎

### 1. 现有基础分析

已有资产：

- [ContextCollector.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/ai/ContextCollector.ts) — 已有上下文收集
- [KnowledgeBaseService.ts](file:///Volumes/Max/YYC3-Family-AI/src/services/KnowledgeBaseService.ts) — 已有知识库服务
- [GraphRAGService.ts](file:///Volumes/Max/YYC3-Family-AI/src/services/GraphRAGService.ts) — 已有 GraphRAG 服务
- [RAGChat.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/RAGChat.tsx) — 已有 RAG 聊天界面
- [SearchPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/SearchPanel.tsx) — 已有搜索面板

**缺口**: 缺少 Tree-sitter AST 解析、代码符号索引、跨文件引用图谱、增量索引。

### 2. 功能规格

| 维度 | 内容 |
|------|------|
| **目标** | 建立项目代码的语义索引，支持跨文件智能问答和引用分析 |
| **核心能力** | AST 解析 → 符号提取 → 向量嵌入 → 关系图谱 → 语义搜索 |
| **索引范围** | 当前项目所有代码文件 + 依赖声明 |
| **更新策略** | 文件保存时增量索引，项目打开时全量索引 |

### 3. 用户场景

```
场景1: 引用查找
  用户: "findAllReferences of UserModel"
  → 引擎返回: api/users.ts:42, components/Profile.tsx:18, services/auth.ts:105
  → 在面板中可点击跳转

场景2: 影响分析
  用户: "如果我修改 database.ts 的 connect 函数，哪些文件会受影响？"
  → 引擎分析 AST 调用链，返回 17 个直接依赖文件和 42 个间接依赖

场景3: 代码问答
  用户: "这个项目的认证流程是什么？"
  → 引擎检索 auth 相关代码 → 结合 LLM 生成流程图和解释

场景4: 架构理解
  用户: "画出项目的数据流图"
  → 引擎分析导入/导出关系 → 生成 Mermaid 图
```

### 4. 架构设计

```
┌──────────────────────────────────────────────────────────────┐
│                 Code Understanding Engine                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐    ┌─────────────────┐                  │
│  │  Indexing        │    │  Query Engine    │                  │
│  │  Pipeline        │    │                  │                  │
│  │                  │    │  • Semantic      │                  │
│  │  1. File Scanner │    │    Search        │                  │
│  │  2. Tree-sitter  │    │  • Reference     │                  │
│  │     AST Parse    │    │    Resolution    │                  │
│  │  3. Symbol       │    │  • Impact        │                  │
│  │     Extraction   │    │    Analysis      │                  │
│  │  4. Reference    │    │  • Code Q&A      │                  │
│  │     Binding      │    │                  │                  │
│  │  5. Vector       │    │                  │                  │
│  │     Embedding    │    │                  │                  │
│  └────────┬─────────┘    └────────┬─────────┘                │
│           │                       │                           │
│  ┌────────▼───────────────────────▼─────────┐                │
│  │          Storage Layer                    │                │
│  │  • IndexedDB: file→chunk mapping          │                │
│  │  • LanceDB (WASM): vector embeddings      │                │
│  │  • In-Memory: symbol index + ref graph    │                │
│  └───────────────────────────────────────────┘                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 5. 技术实现路径

**新增依赖**: `web-tree-sitter@0.22.x`, `tree-sitter-wasms` (预编译语言包)

**新增文件**:

| 文件 | 路径 | 职责 |
|------|------|------|
| `CodeIndexer.ts` | `src/app/components/ide/services/` | 索引管道编排器 |
| `TreeSitterParser.ts` | `src/app/components/ide/services/` | Tree-sitter WASM 解析封装 |
| `SymbolExtractor.ts` | `src/app/components/ide/services/` | AST → 符号表提取 |
| `ReferenceGraph.ts` | `src/app/components/ide/services/` | 引用关系图构建与查询 |
| `CodeQueryEngine.ts` | `src/app/components/ide/services/` | 统一查询接口 |
| `CodeUnderstandingPanel.tsx` | `src/app/components/ide/` | 代码理解 UI 面板 |
| `useCodeIndex.ts` | `src/app/components/ide/hooks/` | 索引状态 Hook |

**修改文件**:

| 文件 | 变更 |
|------|------|
| [RAGChat.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/RAGChat.tsx) | 集成 `CodeQueryEngine` 替换纯文本搜索 |
| [SearchPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/SearchPanel.tsx) | 增加"语义搜索"标签 |
| [RightPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/RightPanel.tsx) | 增加"引用"和"符号"侧边标签 |

**核心实现**: `CodeIndexer.ts`

```typescript
export class CodeIndexer {
  private parser: TreeSitterParser;
  private graph: ReferenceGraph;
  private symbolIndex: Map<string, SymbolInfo[]> = new Map();
  private dirtyFiles: Set<string> = new Set();

  // 增量索引：仅重新解析变更文件
  async indexFile(filePath: string, content: string): Promise<void> {
    const tree = await this.parser.parse(content);
    const symbols = SymbolExtractor.extract(tree, filePath);

    // 更新符号索引
    this.symbolIndex.set(filePath, symbols);

    // 更新引用图
    for (const sym of symbols) {
      this.graph.addSymbol(sym);
      for (const ref of sym.references) {
        this.graph.addReference(sym.id, ref);
      }
    }
  }

  // 全量索引项目
  async indexProject(files: Map<string, string>): Promise<void> {
    // Web Worker 并行解析
    const chunks = this.chunkFiles(files, 4);
    await Promise.all(chunks.map(chunk =>
      this.indexFileBatch(chunk)
    ));
  }

  // 查询接口
  async findReferences(symbolName: string, filePath?: string): Promise<ReferenceResult[]>;
  async findDefinition(symbolName: string, filePath: string): Promise<SymbolInfo | null>;
  async getImpactAnalysis(filePath: string): Promise<ImpactResult>;
  async getDependencyGraph(): Promise<DependencyNode[]>;
  async semanticSearch(query: string, topK: number): Promise<SearchResult[]>;
}
```

**Worker 并行解析**:

```typescript
// Tree-sitter 解析在 Web Worker 中执行，避免阻塞主线程
// tree-sitter-parser.worker.ts
self.onmessage = async (e) => {
  const { filePath, content, language } = e.data;
  await Parser.init();
  const parser = new Parser();
  parser.setLanguage(await Parser.Language.load(languageWasmMap[language]));
  const tree = parser.parse(content);
  self.postMessage({ filePath, tree: tree.rootNode.toJSON() });
};
```

**实现步骤（约 5 天）**:

1. Day 1: 安装 `web-tree-sitter`，封装 TypeScript/JavaScript 解析器，Worker 线程
2. Day 2: `SymbolExtractor` — 从 AST 提取函数、类、变量、导入/导出
3. Day 3: `ReferenceGraph` — 构建引用关系图（定义→引用、导入→使用）
4. Day 4: `CodeQueryEngine` — 实现 findReferences/getImpactAnalysis/semanticSearch
5. Day 5: `CodeUnderstandingPanel` UI、与 RAGChat 集成、增量索引测试

---

## P0-U1: Command Palette 2.0

### 1. 现有基础分析

已有资产：

- [CommandPalette.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/CommandPalette.tsx) — 已有完整命令面板，支持分类搜索、快捷键提示、历史记录
- `@radix-ui/react-dialog` — 已安装

**缺口**: 缺少自然语言意图识别、AI 命令推荐、文件搜索集成。

### 2. 功能规格

| 维度 | 内容 |
|------|------|
| **目标** | 将 Command Palette 升级为 AI 驱动的全局入口 |
| **入口** | `Cmd+K` (macOS) / `Ctrl+K` (Windows) |
| **模式** | 自然语言模式 / 命令模式 / 文件搜索模式 |

### 3. 用户场景

```
场景1: 自然语言命令
  用户输入: "切换到暗色主题"
  → AI 意图识别 → 匹配到 "切换主题" 命令 → 执行

场景2: 文件快速跳转
  用户输入: "UserProfile" 或 "用户配置文件"
  → AI 语义搜索 → 返回 Profile.tsx, UserSettings.tsx, user-profile.css
  → 回车跳转

场景3: AI 问答内联
  用户输入: "? 如何优化这个组件的渲染性能"
  → 以 "?" 开头触发 AI 模式 → 直接返回 AI 分析结果

场景4: 快捷键速查
  用户输入: "格式化"
  → 返回: "格式化文档 (Shift+Alt+F)"
```

### 4. 界面设计规范

```
┌──────────────────────────────────────────────────────────────┐
│  > 🔍 切换到暗色主题                              [Esc 关闭] │
├──────────────────────────────────────────────────────────────┤
│  ⚡ 命令                                         Tab 切换分类 │
│  ─────────────────────────────────────────────────────────── │
│  🎨 切换主题 → 暗色主题 (Navy)                    ⌘+Shift+T  │
│  🎨 切换主题 → 赛博朋克                             ⌘+Shift+T  │
│  ── AI 推荐 ─────────────────────────────────────────────── │
│  🤖 解释为 "切换主题" → 匹配主题切换命令                       │
│  ── 最近使用 ─────────────────────────────────────────────── │
│  📄 UserProfile.tsx                            src/components/ │
│  🔍 搜索 "性能优化"                                  3分钟前  │
├──────────────────────────────────────────────────────────────┤
│  [⌘+K] 打开  [↑↓] 导航  [↩] 选择  [Tab] 切换分类  [Esc] 关闭 │
└──────────────────────────────────────────────────────────────┘
```

### 5. 技术实现路径

**修改文件**:

| 文件 | 变更 |
|------|------|
| [CommandPalette.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/CommandPalette.tsx) | 增加自然语言输入框、AI 推荐区、文件搜索集成 |

**关键改造点**:

```typescript
// CommandPalette.tsx 核心改造

// 1. 新增输入模式检测
type InputMode = 'command' | 'file' | 'ai' | 'natural';

function detectInputMode(input: string): InputMode {
  if (input.startsWith('?')) return 'ai';
  if (input.startsWith('>')) return 'file';
  if (input.startsWith('/')) return 'command';
  return 'natural'; // 默认自然语言
}

// 2. 自然语言 → 命令匹配
// 复用 AgentIntentRouter 做意图识别, 匹配已有命令
async function matchNaturalLanguage(input: string): Promise<CommandMatch[]> {
  const intent = await agentIntentRouter.detectIntent(input);
  // 将意图映射到 CommandPalette 已有命令
  return commandRegistry.search(intent);
}

// 3. AI 推荐增强
// 在搜索结果中注入 AI 推荐项
// 使用 useAgentOrchestrator hook 获取 Agent 建议

// 4. 文件搜索集成
// 搜索范围: 项目文件 + 代码符号
// 复用 CodeIndexer (P0-C3) 的语义搜索
```

**实现步骤（约 2 天）**:

1. Day 1: 自然语言输入模式、AI 意图识别集成、命令匹配
2. Day 2: 文件搜索集成、AI 推荐区、视觉刷新、快捷键提示更新

---

## P0-I1: 插件市场

### 1. 现有基础分析

已有资产：

- [PluginSystem.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/PluginSystem.ts) — 完整插件系统，含 PluginManager、MarketItem、生命周期
- [PluginMarketPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/PluginMarketPanel.tsx) — 已有市场 UI（发现/已安装/更新标签）
- 插件注册表 URL 默认指向 `https://plugins.yyc3.app`

**缺口**: 实际注册表服务未部署、缺少评分评论系统、缺少社区贡献流程、插件沙箱安全审计。

### 2. 功能规格

| 维度 | 内容 |
|------|------|
| **目标** | 建立完整的插件发现 → 安装 → 管理 → 社区反馈闭环 |
| **注册表** | GitHub Releases 驱动（零成本托管），JSON 元数据索引 |
| **安全** | iframe 沙箱 + 权限白名单 + CSP 策略 |

### 3. 用户场景

```
场景1: 浏览安装
  用户打开插件市场 → 搜索 "Tailwind" → 看到 Tailwind Helper 插件
  → 查看详情(描述/截图/评分/评论) → 点击安装 → 3s 完成 → 提示重启生效

场景2: 发布插件
  开发者用 CLI 创建插件模板 → 开发 → 本地测试
  → 发布到 GitHub Releases → 提 PR 到官方注册表 → 审核通过 → 上架

场景3: 评分评论
  用户使用插件一周后 → 收到评分邀请 → 5 星评分 + "很好用，希望能支持 Vue"
  → 评论显示在插件详情页 → 作者回复
```

### 4. 架构设计

```
┌──────────────────────────────────────────────────────────┐
│                    Plugin Marketplace                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [Registry]          [Market UI]        [Sandbox]         │
│  GitHub Releases  ←→ PluginMarketPanel → iframe 隔离      │
│  ↓                    ↓                    ↓               │
│  registry.json      [Install]          [Plugin API]       │
│  (GitHub Repo)      → fetch bundle     → postMessage     │
│                      → validate sig     → limited API     │
│                      → store IDB        → isolate execution│
│                                                           │
│  [Comments/Ratings]                                     │
│  GitHub Issues (label: plugin-review)                    │
│  → 自动化脚本汇总 → 更新 registry stats                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 5. 技术实现路径

**新增文件**:

| 文件 | 路径 | 职责 |
|------|------|------|
| `plugin-registry.json` | 项目根目录 (提交到独立 `plugins` 分支) | 官方插件索引 |
| `scripts/update-registry.ts` | `scripts/` | 自动汇总 GitHub Issues 评论→评分更新脚本 |
| `PluginSandbox.tsx` | `src/app/components/ide/` | iframe 沙箱容器组件 |
| `PluginReviewPanel.tsx` | `src/app/components/ide/` | 评分评论 UI 组件 |

**修改文件**:

| 文件 | 变更 |
|------|------|
| [PluginSystem.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/PluginSystem.ts) | 增加签名验证、沙箱加载、评分系统 API |
| [PluginMarketPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/PluginMarketPanel.tsx) | 增强详情页、评分评论、安装进度 |

**注册表设计** (`plugin-registry.json`):

```json
{
  "version": "1",
  "updated": "2026-06-04T00:00:00Z",
  "plugins": [
    {
      "id": "yyc3.tailwind-helper",
      "name": "Tailwind CSS Helper",
      "version": "1.2.0",
      "description": "Tailwind class autocomplete and visual preview",
      "author": { "name": "dev", "github": "dev" },
      "repository": "https://github.com/dev/yyc3-tailwind-helper",
      "download": "https://github.com/dev/yyc3-tailwind-helper/releases/download/v1.2.0/plugin.zip",
      "checksum": "sha256:abc123...",
      "minYYC3Version": "1.0.0",
      "category": "editor",
      "tags": ["tailwind", "css", "autocomplete"],
      "permissions": ["editor.read", "editor.write"],
      "rating": 4.7,
      "downloads": 1523,
      "reviews": 45,
      "icon": "🎨",
      "screenshots": ["screenshot1.png"]
    }
  ]
}
```

**安全沙箱机制**:

```typescript
// PluginSandbox.tsx
// 插件在独立 iframe 中运行，通过 postMessage 与主应用通信
// 权限白名单: 仅允许已声明的 API 调用

const SANDBOX_PERMISSIONS = {
  'editor.read': ['getValue', 'getSelection'],
  'editor.write': ['insertText', 'replaceText'],
  'ui.panel': ['registerPanel', 'showNotification'],
  'ai.query': ['completion', 'chat'],
  'storage.read': ['getFile', 'listFiles'],
  'storage.write': ['saveFile', 'deleteFile'],
};

// iframe sandbox 属性: sandbox="allow-scripts"
// CSP: default-src 'none'; script-src 'self'; connect-src 'self'
```

**发布流程**:

1. 开发者运行 `npx yyc3-cli create-plugin my-plugin`
2. 本地开发测试 (`pnpm dev` 加载本地插件)
3. `npx yyc3-cli publish-plugin` → 自动创建 GitHub Release
4. 向 `YYC3-Family-AI` 仓库提 PR，添加插件到 `plugin-registry.json`
5. CI 自动验证 (签名检查 + 安全扫描)
6. 审核通过 → 合并 → 自动出现在市场中

**实现步骤（约 5 天）**:

1. Day 1-2: GitHub Releases 注册表机制、`plugin-registry.json` 规范定义
2. Day 3: 安装流程增强（进度条、签名验证、依赖检查）
3. Day 4: 评分/评论系统（GitHub Issues 集成）
4. Day 5: 安全管理（沙箱增强、权限审计） + 集成测试

---

## P0-A1: AI 代码审查 Agent

### 1. 现有基础分析

已有资产：

- [SecurityScanner.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/ai/SecurityScanner.ts) — 已有安全扫描
- [CodeValidator.ts](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/CodeValidator.ts) — 已有代码验证
- [CodeQualityDashboard.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/CodeQualityDashboard.tsx) — 已有质量仪表盘
- [SecurityPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/SecurityPanel.tsx) — 已有安全面板
- `BaseAgent.ts` — Agent 基类

**缺口**: 缺少一个统一的 AI 代码审查 Agent（整合安全+性能+风格三维度）、Diff 上下文审查、一键修复。

### 2. 功能规格

| 维度 | 内容 |
|------|------|
| **目标** | 自动审查代码变更，输出安全/性能/风格三维度审查报告 |
| **触发** | 手动触发 / Git pre-commit hook / 文件保存自动审查 |
| **输出** | 分级报告 (Critical / Warning / Suggestion) + 一键修复 |

### 3. 用户场景

```
场景1: 手动审查
  用户在文件编辑器中右键 → "AI 代码审查"
  → Agent 分析当前文件 → 返回报告:
    🔴 Critical: 第42行 - 未转义的用户输入 (XSS风险)
    🟡 Warning: 第78行 - useEffect 缺少依赖项
    🟢 Suggestion: 建议将 useState 合并为 useReducer

场景2: Diff 审查
  用户完成代码修改 → 点击 "审查变更"
  → Agent 仅审查 Git diff 中的变更部分
  → 逐行展示问题，支持一键修复

场景3: Pre-commit 审查
  用户 `git commit` → YYC³ 检测到 → 自动审查 staged 文件
  → 发现 Critical 问题 → 阻止提交 → 展示修复建议
  → 用户修复后重新提交
```

### 4. 审查维度矩阵

```
┌────────────────────────────────────────────────────────────┐
│                    Code Review Dimensions                   │
├──────────┬─────────────────┬──────────────────────────────┤
│ Security │ XSS/注入         │ 未转义HTML、eval使用、SQL拼接  │
│ (安全)   │ 硬编码密钥       │ API Key、密码、Token          │
│          │ 不安全依赖       │ 已知漏洞版本的依赖包           │
│          │ 路径遍历         │ 用户输入的文件路径              │
├──────────┼─────────────────┼──────────────────────────────┤
│Performance│ 不必要的重渲染   │ 缺少useMemo/useCallback       │
│ (性能)   │ 内存泄漏         │ 未清理的订阅/定时器            │
│          │ 大循环中的操作   │ O(n²)算法、DOM操作             │
│          │ 同步阻塞         │ 大计算在主线程                  │
├──────────┼─────────────────┼──────────────────────────────┤
│  Style   │ 代码复杂度       │ 圈复杂度 > 15、嵌套 > 4层      │
│ (风格)   │ 命名规范         │ 不符合项目命名规则             │
│          │ 类型安全         │ any 使用、缺少类型注解          │
│          │ 最佳实践         │ React/Vue 模式违反              │
└──────────┴─────────────────┴──────────────────────────────┘
```

### 5. 技术实现路径

**新增文件**:

| 文件 | 路径 | 职责 |
|------|------|------|
| `ReviewerAgent.ts` | `src/agent/agents/` (与现有 Agent 同级) | 代码审查 Agent 核心 |
| `CodeReviewResultPanel.tsx` | `src/app/components/ide/` | 审查结果展示 UI |
| `ReviewSeverityBadge.tsx` | `src/app/components/ide/` | 严重等级标签组件 |
| `useCodeReview.ts` | `src/app/components/ide/hooks/` | 审查状态 Hook |

**修改文件**:

| 文件 | 变更 |
|------|------|
| [agents/index.ts](file:///Volumes/Max/YYC3-Family-AI/src/agent/agents/index.ts) | 注册 ReviewerAgent |
| [SecurityPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/SecurityPanel.tsx) | 整合为审查结果总面板 |
| [CodeQualityDashboard.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/CodeQualityDashboard.tsx) | 增加代码审查趋势数据 |
| [RightPanel.tsx](file:///Volumes/Max/YYC3-Family-AI/src/app/components/ide/RightPanel.tsx) | 编辑器右键菜单增加"AI审查" |

**核心实现**: `ReviewerAgent.ts`

```typescript
// src/agent/agents/ReviewerAgent.ts
// 继承 BaseAgent，实现代码审查能力

export class ReviewerAgent extends BaseAgent {
  static readonly role: AgentRole = 'reviewer';

  // 审查入口
  async review(params: ReviewParams): Promise<ReviewResult> {
    const { code, language, diffOnly, filePath } = params;

    // 1. 静态分析（不需要 LLM，快速）
    const staticIssues = [
      ...SecurityScanner.scan(code, language),
      ...PatternMatcher.detectAntiPatterns(code, language),
    ];

    // 2. AI 深度分析（LLM 驱动）
    const aiIssues = await this.aiDeepReview(code, language, filePath);

    // 3. 合并、去重、排序
    return this.mergeAndRank([...staticIssues, ...aiIssues]);
  }

  private async aiDeepReview(
    code: string,
    language: string,
    filePath: string,
  ): Promise<ReviewIssue[]> {
    const prompt = this.buildReviewPrompt(code, language, filePath);
    const response = await this.llmService.chatCompletion([
      { role: 'system', content: REVIEWER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ]);
    return this.parseAIResponse(response);
  }

  // 一键修复
  async autoFix(issue: ReviewIssue): Promise<CodeFix> {
    const prompt = `Fix this issue: ${issue.description}\nCode:\n${issue.snippet}`;
    const response = await this.llmService.chatCompletion([
      { role: 'system', content: 'You are a code fixer. Return only the fixed code.' },
      { role: 'user', content: prompt },
    ]);
    return { original: issue.snippet, fixed: response, issueId: issue.id };
  }
}

// 类型定义
interface ReviewIssue {
  id: string;
  severity: 'critical' | 'warning' | 'suggestion';
  category: 'security' | 'performance' | 'style';
  line: number;
  column?: number;
  description: string;
  snippet: string;
  suggestion: string;
  rule: string; // 对应的审查规则 ID
}

interface ReviewResult {
  filePath: string;
  issues: ReviewIssue[];
  summary: {
    critical: number;
    warning: number;
    suggestion: number;
    score: number; // 0-100
  };
  timestamp: number;
}
```

**审查 System Prompt**:

```typescript
const REVIEWER_SYSTEM_PROMPT = `You are a senior code reviewer. Analyze the code for:

1. SECURITY: XSS, injection, hardcoded secrets, unsafe dependencies
2. PERFORMANCE: unnecessary re-renders, memory leaks, blocking operations, missing memoization
3. STYLE: code complexity (>15 cyclomatic), naming conventions, type safety, React best practices

Rules:
- Be concise and specific
- Include exact line numbers when possible
- Provide fix suggestions in code blocks
- Use severity: "critical" (must fix), "warning" (should fix), "suggestion" (nice to have)
- Check ONLY the provided code, do not hallucinate issues

Output JSON format:
{
  "issues": [
    {
      "severity": "critical|warning|suggestion",
      "category": "security|performance|style",
      "line": number,
      "description": "string",
      "suggestion": "string",
      "rule": "rule-id"
    }
  ]
}`;
```

**实现步骤（约 4 天）**:

1. Day 1: `ReviewerAgent` 核心类、审查 Prompt 模板、静态分析整合
2. Day 2: AI 深度分析流程、JSON 解析、结果合并排序
3. Day 3: `CodeReviewResultPanel` UI（分类展示、一键修复按钮）
4. Day 4: 右键菜单集成、Diff 审查、pre-commit hook 机制

---

## P0-E1: 开发者文档门户

### 1. 现有基础分析

已有资产：

- `docs/` 目录 125+ Markdown 文档，组织良好
- [API-Reference.md](file:///Volumes/Max/YYC3-Family-AI/docs/API-Reference.md) — API 文档
- [PROJECT-STANDARDS.md](file:///Volumes/Max/YYC3-Family-AI/PROJECT-STANDARDS.md) — 项目标准
- Vite 构建工具链

**缺口**: 无自动化 API 文档生成、无交互式示例、无文档搜索、无版本化。

### 2. 功能规格

| 维度 | 内容 |
|------|------|
| **目标** | 构建专业级开发者文档站点，自动生成 API 文档 |
| **技术** | VitePress + TypeDoc + Sandpack 内嵌 |
| **部署** | GitHub Pages + 自有域名 docs.yyc3.top |

### 3. 文档站点架构

```
docs.yyc3.top
├── /                       首页 + 快速开始
├── /guide/                 开发者指南
│   ├── /getting-started    快速开始
│   ├── /architecture       架构设计
│   ├── /ide-usage          IDE 使用指南
│   ├── /agents             8 位 AI 家人指南
│   ├── /plugins            插件开发指南
│   └── /themes             主题定制指南
├── /api/                   自动生成的 API 文档 (TypeDoc)
│   ├── /services           Service 层 API
│   ├── /stores             Zustand Store API
│   ├── /hooks              Hooks API
│   └── /components         组件 API
├── /examples/              交互式示例
│   ├── /hello-world        Sandpack 内嵌示例
│   └── /custom-agent       自定义 Agent 示例
├── /mcp/                   MCP 集成文档
├── /changelog/             更新日志
└── /contributing/          贡献指南
```

### 4. 技术实现路径

**新增依赖**: `vitepress@1.4.x`, `typedoc@0.26.x`, `typedoc-plugin-markdown`

**新增文件/目录**:

| 文件 | 路径 | 职责 |
|------|------|------|
| `vitepress/config.ts` | `docs/.vitepress/` | VitePress 站点配置 |
| `vitepress/theme/` | `docs/.vitepress/` | 自定义主题（与品牌 Nav/Cyber 对齐） |
| `typedoc.json` | 项目根目录 | TypeDoc 配置 |
| `typedoc-sidebar.json` | `docs/.vitepress/` | TypeDoc → VitePress 侧边栏映射 |

**修改文件**:

| 文件 | 变更 |
|------|------|
| [package.json](file:///Volumes/Max/YYC3-Family-AI/package.json) | 增加 `"docs:dev"`, `"docs:build"`, `"docs:api"` 脚本 |
| [pages-deploy.yml](file:///Volumes/Max/YYC3-Family-AI/.github/workflows/pages-deploy.yml) | 修改为部署 VitePress 站点 |

### 5. 配置文件

**`typedoc.json`**:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": [
    "src/services/index.ts",
    "src/app/components/ide/stores/index.ts",
    "src/app/components/ide/hooks",
    "src/agent/index.ts"
  ],
  "entryPointStrategy": "expand",
  "out": "docs/api/generated",
  "plugin": ["typedoc-plugin-markdown"],
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "readme": "none",
  "sort": ["source-order"],
  "categorizeByGroup": true,
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  }
}
```

**`package.json` 新增脚本**:

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "pnpm docs:api && vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "docs:api": "typedoc --options typedoc.json"
  }
}
```

**VitePress 配置** (`docs/.vitepress/config.ts`):

```typescript
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'YYC³ Family AI',
  description: '开源本地优先的 AI 智能编程助手 — 开发者文档',
  lang: 'zh-CN',
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    logo: '/Family-AI-001.png',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '更新日志', link: '/changelog/' },
      { text: 'GitHub', link: 'https://github.com/YanYuCloudCube/YYC3-Family-AI' },
    ],

    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '架构设计', link: '/guide/architecture' },
        { text: 'IDE 使用指南', link: '/guide/ide-usage' },
        {
          text: 'AI 家人系统',
          collapsed: false,
          items: [
            { text: '系统总览', link: '/guide/agents/overview' },
            { text: '天枢·总指挥', link: '/guide/agents/tianshu' },
            { text: '宗师·质量官', link: '/guide/agents/zongshi' },
            { text: '守护·安全官', link: '/guide/agents/shouhu' },
            // ...
          ],
        },
        { text: '插件开发', link: '/guide/plugins' },
        { text: '主题定制', link: '/guide/themes' },
      ],

      '/api/': [
        { text: '总览', link: '/api/' },
        { text: 'Service 层', link: '/api/services' },
        { text: 'Store 层', link: '/api/stores' },
        { text: 'Hooks', link: '/api/hooks' },
        { text: '组件', link: '/api/components' },
      ],
    },

    search: {
      provider: 'local', // 本地搜索，零依赖
    },

    // 品牌色
    // 使用 YYC³ Navy 主题色: primary #6366f1
  },

  // 支持 Mermaid 图表
  markdown: {
    // mermaid: true,  // 需要 vitepress-plugin-mermaid
  },
});
```

**交互式 Sandpack 示例** (内嵌到 VitePress):

```vue
<!-- docs/examples/hello-world.md -->
# Hello World 示例

<SandpackExample
  template="react-ts"
  files={{
    '/App.tsx': `export default function App() {
  return <h1 className="text-2xl font-bold text-indigo-500">
    我的第一个 YYC³ 项目
  </h1>
}`,
  }}
/>
```

**实现步骤（约 3 天）**:

1. Day 1: 安装 VitePress + TypeDoc，创建基础站点结构，导航和侧边栏配置
2. Day 2: API 文档自动生成配置，品牌主题定制（Nav/Cyber 色系），文档搜索
3. Day 3: 迁移现有 `docs/` Markdown 到 VitePress 结构，GitHub Actions 自动化部署

---

## 总结：七天 P0 实施总览

| Day | C1 工作流编排 | C2 代码补全 | C3 代码理解 | U1 命令面板 | I1 插件市场 | A1 代码审查 | E1 文档门户 |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | reactflow 基础渲染 | InlineCompletionProvider | Tree-sitter Worker | 自然语言模式 | 注册表机制 | ReviewerAgent核心 | VitePress初始化 |
| 2 | 拖拽+连线 | 上下文收集增强 | 符号提取器 | 文件搜索集成 | 安装流程增强 | AI审查流程 | API自动生成 |
| 3 | 属性配置面板 | 流式渲染 | 引用关系图 | 视觉刷新 | 评分评论系统 | 审查结果UI | 文档迁移部署 |
| 4 | 条件/并行执行 | 配置面板测试 | CodeQueryEngine | — | 安全沙箱 | 右键+Diff集成 | — |
| 5 | 模板/集成测试 | — | UI面板集成测试 | — | 集成测试 | — | — |

**并行策略**: C1+C2 可并行人手，C3 依赖 C1 的 Worker 基础设施，I1+A1 共享 LLM Service，E1 独立。建议 2 人并行推进，**12-15 个工作日**完成全部 7 个 P0 功能。

toolName: todo_write

status: success

Todos updated: 7 items

以上是 7 个 P0 核心功能的逐个完善方案。每个功能都包含：现有基础分析 → 功能规格 → 用户场景 → 流程图 → 界面设计 → 技术实现路径（含具体文件/代码/步骤）。

**总投入估算**: 28 个工作日（2 人并行约 14 天可完成全部）

**推荐启动顺序**: `E1 文档门户`(最先，独立无依赖) → `C2 代码补全`/`C1 工作流`(并行) → `C3 代码理解`(依赖 C1 Worker 基建) → `U1 命令面板` → `A1 代码审查`/`I1 插件市场`(并行)

---

## docs.yyc3.top
