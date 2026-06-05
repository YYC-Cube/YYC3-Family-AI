/**
 * @file: AIChatPage.tsx
 * @description: 全屏智能 AI 交互工作台，支持多模型对话、流式响应、
 *              会话管理、代码高亮、Markdown 渲染
 *              数据源统一来自 providers.ts（全局唯一真相源）
 * @author: YanYuCloudCube Team <admin@039.email>
 * @version: v2.0.0
 * @created: 2026-03-06
 * @updated: 2026-04-16
 * @status: production
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: ai,chat,fullscreen,streaming,models,unified
 */

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  Copy,
  Download,
  FileCode2,
  History,
  Key,
  Lightbulb,
  MessageSquare,
  PanelLeft,
  Plus,
  RefreshCw,
  Send,
  Server,
  Settings2,
  Square,
  Trash2,
  Upload,
  User,
  Wand2,
  Wifi,
  Zap
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import APIKeySettingsUI from "./ide/APIKeySettingsUI";
import {
  createSessionId,
  deleteSession,
  importFromScope,
  listSessions,
  loadMessages,
  saveMessages,
  type ChatSession,
  type PersistedMessage,
} from "./ide/ChatHistoryStore";
import { FileStoreProvider } from "./ide/FileStore";
import {
  chatCompletionStream,
  extractCodeBlock,
  testModelConnectivity,
  type ChatMessage as LLMMessage,
  type ProviderId,
} from "./ide/LLMService";
import { ModelRegistryProvider, useModelRegistry } from "./ide/ModelRegistry";
import { ModelSettings } from "./ide/ModelSettings";
import { useThemeTokens } from "./ide/hooks/useThemeTokens";
import { copyToClipboard } from "./ide/utils/clipboard";
import yyc3Logo from "/macOS/512.png";

// ===================================================================
//  Types & Constants
// ===================================================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  codeBlock?: { lang: string; code: string };
  isStreaming?: boolean;
  error?: string;
  modelName?: string;
}

const SYSTEM_PROMPT = `你是 YYC³ Family AI 智能助手，一个全能的 AI 对话伙伴。
你擅长：深度技术对话、代码分析与优化、学习指导、方案推荐、问题诊断。
请用中文回答，代码片段使用 markdown 代码块格式输出。
保持回答专业且有深度，提供可操作的建议和完整的解释。`;

const QUICK_STARTERS = [
  { icon: Code2, label: "解释 React Hooks 的工作原理", category: "学习" },
  { icon: Wand2, label: "帮我优化这段代码的性能", category: "优化" },
  { icon: Lightbulb, label: "推荐一个适合的技术栈", category: "推荐" },
  { icon: FileCode2, label: "分析 TypeScript 类型体操", category: "分析" },
  { icon: Zap, label: "如何实现微前端架构", category: "架构" },
  { icon: Bot, label: "对比 Next.js 和 Nuxt.js", category: "对比" },
];

const PROVIDER_ICONS: Record<
  ProviderId,
  { icon: typeof Server; color: string }
> = {
  ollama: { icon: Server, color: "text-emerald-400" },
  "zai-plan": { icon: Cloud, color: "text-indigo-400" },
};

// ===================================================================
//  Inner Chat Component (needs ModelRegistry context)
// ===================================================================

function AIChatInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useThemeTokens();

  const {
    models,
    activeModelId,
    activeModel,
    setActiveModelId,
    providers,
    getActiveProvider,
    hasProviderKey,
    ollamaStatus,
    showSettings,
    setShowSettings,
  } = useModelRegistry();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Connectivity
  const [connStatus, setConnStatus] = useState<
    "idle" | "testing" | "success" | "fail"
  >("idle");
  const [connLatency, setConnLatency] = useState<number | null>(null);

  // ── Session persistence (scope: "chat") ──
  const [sessionId, setSessionId] = useState(() => createSessionId());
  const [sessionList, setSessionList] = useState<ChatSession[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cross-scope import (IDE → Chat)
  const [showImportIDE, setShowImportIDE] = useState(false);
  const [ideSessionList, setIdeSessionList] = useState<ChatSession[]>([]);
  const [importToast, setImportToast] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    setSessionList(listSessions("chat"));
  }, []);

  // Auto-save messages (debounced)
  useEffect(() => {
    if (messages.length === 0 || messages.some((m) => m.isStreaming)) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const toSave: PersistedMessage[] = messages
        .filter((m) => !m.isStreaming && m.content)
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          modelName: m.modelName,
          error: m.error,
          codeBlock: m.codeBlock,
        }));
      if (toSave.length > 0) {
        saveMessages("chat", sessionId, toSave, activeModelId || undefined);
        setSessionList(listSessions("chat"));
      }
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [messages, sessionId, activeModelId]);

  // Load a saved session
  const handleLoadSession = useCallback((session: ChatSession) => {
    const loaded = loadMessages("chat", session.id);
    if (loaded.length > 0) {
      setMessages(
        loaded.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          modelName: m.modelName,
          error: m.error,
          codeBlock: m.codeBlock,
        })),
      );
      setSessionId(session.id);
    }
    setShowSidebar(false);
  }, []);

  // Create new session
  const handleNewSession = useCallback(() => {
    setSessionId(createSessionId());
    setMessages([]);
    setShowSidebar(false);
  }, []);

  // Delete session
  const handleDeleteSession = useCallback(
    (sid: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteSession("chat", sid);
      setSessionList(listSessions("chat"));
      if (sid === sessionId) handleNewSession();
    },
    [sessionId, handleNewSession],
  );

  // Export chat as JSON
  const handleExportChat = useCallback(() => {
    const data = {
      sessionId,
      model: activeModel?.name,
      exportedAt: new Date().toISOString(),
      messages: messages
        .filter((m) => !m.isStreaming && m.content)
        .map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          modelName: m.modelName,
        })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yyc3-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionId, activeModel, messages]);

  // Import session from IDE scope
  const handleImportFromIDE = useCallback((ideSession: ChatSession) => {
    const result = importFromScope("ide", "chat", ideSession.id);
    if (result) {
      // Load the imported session
      const loaded = loadMessages("chat", result.newSessionId);
      if (loaded.length > 0) {
        setMessages(
          loaded.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            modelName: m.modelName,
            error: m.error,
            codeBlock: m.codeBlock,
          })),
        );
        setSessionId(result.newSessionId);
        setSessionList(listSessions("chat"));
      }
      setShowImportIDE(false);
      setImportToast(`已导入 IDE 对话 (${result.messageCount} 条消息)`);
      setTimeout(() => setImportToast(null), 3000);
    }
  }, []);

  // Group models by provider
  const groupedModels = providers
    .map((p) => ({
      provider: p,
      models: models.filter((m) => m.providerId === p.id),
    }))
    .filter((g) => g.models.length > 0);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle initial prompt from HomePage
  useEffect(() => {
    const state = location.state as { prompt?: string } | null;
    if (state?.prompt) {
      setChatInput(state.prompt);
      // Auto-focus on input
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [location.state]);

  // Reset connectivity on model change
  useEffect(() => {
    setConnStatus("idle");
    setConnLatency(null);
  }, [activeModelId]);

  // Connectivity ping
  const handlePing = useCallback(async () => {
    if (connStatus === "testing" || !activeModel) return;
    const provider = getActiveProvider();
    if (!provider) return;
    setConnStatus("testing");
    try {
      const result = await testModelConnectivity(provider, activeModel.modelId);
      setConnStatus(result.success ? "success" : "fail");
      setConnLatency(result.latencyMs);
    } catch {
      setConnStatus("fail");
    }
  }, [connStatus, activeModel, getActiveProvider]);

  // Send message
  const handleSend = useCallback(() => {
    if (!chatInput.trim() || isStreaming) return;

    const provider = getActiveProvider();
    if (!provider) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          error: "请先选择一个可用的模型。点击右上角 ⚙️ 配置 API Key。",
        },
      ]);
      return;
    }

    if (provider.authType === "bearer" && !hasProviderKey(provider.id)) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: chatInput,
          timestamp: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          error: `请先配置 ${provider.name} 的 API Key。`,
        },
      ]);
      setChatInput("");
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isStreaming: true,
      modelName: activeModel?.name,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    const _inputText = chatInput;
    setChatInput("");
    setIsStreaming(true);

    const history: LLMMessage[] = [{ role: "system", content: SYSTEM_PROMPT }];
    const recentMsgs = [...messages.filter((m) => !m.error), userMsg].slice(
      -20,
    );
    for (const msg of recentMsgs) {
      if ((msg.role === "user" || msg.role === "assistant") && msg.content) {
        history.push({ role: msg.role, content: msg.content });
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;

    chatCompletionStream(
      provider,
      activeModel?.modelId || "",
      history,
      {
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: m.content + token }
                : m,
            ),
          );
        },
        onDone: (fullText) => {
          const codeBlock = extractCodeBlock(fullText);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                  ...m,
                  isStreaming: false,
                  codeBlock: codeBlock || undefined,
                }
                : m,
            ),
          );
          setIsStreaming(false);
          abortRef.current = null;
        },
        onError: (errorMsg) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                  ...m,
                  isStreaming: false,
                  error: errorMsg,
                  content: m.content || "",
                }
                : m,
            ),
          );
          setIsStreaming(false);
          abortRef.current = null;
        },
      },
      { signal: controller.signal },
    );
  }, [
    chatInput,
    isStreaming,
    messages,
    activeModel,
    getActiveProvider,
    hasProviderKey,
  ]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const handleCopy = useCallback((text: string, id: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    // Start fresh session
    setSessionId(createSessionId());
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  // ── Derived token shortcuts ──
  const pageBg = t.page.pageBg;
  const barBg = t.page.barBg;
  const barBorder = t.page.barBorder;
  const accentText = t.text.accent;
  const accentBg = t.interactive.activeBg;

  return (
    <div className={`size-full min-h-screen ${pageBg} flex flex-col`}>
      {/* ===== Top Bar ===== */}
      <header
        className={`flex-shrink-0 h-12 flex items-center px-4 border-b ${barBorder} ${barBg} backdrop-blur-md`}
      >
        {/* Left: Back + Session controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.78rem] transition-all ${t.interactive.ghostBtn} ${t.interactive.ghostBtnHover}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>

          <div className={`w-px h-4 mx-1 ${t.interactive.separator}`} />

          {/* Session history toggle */}
          <button
            onClick={() => {
              setShowSidebar(!showSidebar);
              setSessionList(listSessions("chat"));
            }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[0.72rem] transition-all ${showSidebar
                ? t.interactive.activeBtn
                : `${t.interactive.ghostBtn} ${t.interactive.hoverBg}`
              }`}
            title="对话历史"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">历史</span>
            {sessionList.length > 0 && (
              <span
                className={`text-[0.55rem] px-1 py-0.5 rounded-full ${t.interactive.badge}`}
              >
                {sessionList.length}
              </span>
            )}
          </button>

          {/* New session */}
          <button
            onClick={handleNewSession}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[0.72rem] transition-all ${t.interactive.ghostBtn} ${t.interactive.hoverBg}`}
            title="新建对话"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Export */}
          {hasMessages && (
            <button
              onClick={handleExportChat}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[0.72rem] transition-all ${t.interactive.ghostBtn} ${t.interactive.hoverBg}`}
              title="导出对话"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${accentBg}`}
          >
            <MessageSquare className={`w-3.5 h-3.5 ${accentText}`} />
          </div>
          <span className={`text-[0.85rem] ${t.text.label}`}>
            AI 智能对话工作台
          </span>
        </div>

        {/* Right: Model + Settings */}
        <div className="flex items-center gap-2">
          {/* Connectivity indicator */}
          {activeModel && (
            <button
              onClick={handlePing}
              disabled={connStatus === "testing"}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[0.65rem] transition-all border ${connStatus === "success"
                  ? "text-emerald-400 border-emerald-500/20"
                  : connStatus === "fail"
                    ? "text-red-400 border-red-500/20"
                    : connStatus === "testing"
                      ? "text-sky-400 border-sky-500/20"
                      : `${t.interactive.ghostBtn} border-transparent`
                }`}
              title="测试连通性"
            >
              {connStatus === "testing" ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : connStatus === "success" ? (
                <Wifi className="w-3 h-3" />
              ) : connStatus === "fail" ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Wifi className="w-3 h-3" />
              )}
              <span>
                {connStatus === "testing"
                  ? "Ping..."
                  : connStatus === "success"
                    ? `${connLatency}ms`
                    : connStatus === "fail"
                      ? "失败"
                      : "Ping"}
              </span>
            </button>
          )}

          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.75rem] transition-all border ${t.page.inputBorder} ${t.text.secondary} ${t.page.inputBg}`}
            >
              {activeModel ? (
                <>
                  {(() => {
                    const pi = PROVIDER_ICONS[activeModel.providerId];
                    const Icon = pi?.icon || Cloud;
                    return (
                      <Icon
                        className={`w-3.5 h-3.5 ${pi?.color || "text-slate-500"}`}
                      />
                    );
                  })()}
                  <span className="max-w-[120px] truncate">
                    {activeModel.name}
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeModel.status === "active"
                        ? "bg-emerald-500"
                        : "bg-slate-600"
                      }`}
                  />
                </>
              ) : (
                <span className={t.text.muted}>选择模型...</span>
              )}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showModelDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {showModelDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowModelDropdown(false)}
                />
                <div
                  className={`absolute top-full right-0 mt-1 w-[280px] rounded-lg shadow-2xl z-40 py-1 max-h-[350px] overflow-y-auto border ${t.page.cardBg} ${t.page.cardBorder}`}
                >
                  {groupedModels.map(({ provider, models: provModels }) => {
                    const pi = PROVIDER_ICONS[provider.id];
                    const hasKey =
                      provider.authType === "none" ||
                      hasProviderKey(provider.id);
                    return (
                      <div key={provider.id}>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 border-b ${barBorder}`}
                        >
                          {(() => {
                            const Icon = pi?.icon || Cloud;
                            return (
                              <Icon
                                className={`w-3 h-3 ${pi?.color || "text-slate-500"}`}
                              />
                            );
                          })()}
                          <span className="text-[0.6rem] text-slate-500 flex-1">
                            {provider.name}
                          </span>
                          {!hasKey && (
                            <span className="text-[0.5rem] text-amber-400/50">
                              需配置 Key
                            </span>
                          )}
                        </div>
                        {provModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setActiveModelId(model.id);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[0.72rem] transition-colors ${model.id === activeModelId
                                ? t.interactive.activeBtn
                                : model.status === "active"
                                  ? `${t.text.secondary} ${t.interactive.hoverBg}`
                                  : "text-white/25 hover:bg-white/[0.02]"
                              }`}
                          >
                            <span className="flex-1 text-left truncate">
                              {model.name}
                            </span>
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${model.status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-600"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      setShowModelDropdown(false);
                      setShowSettings(true);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[0.65rem] transition-colors ${t.interactive.ghostBtn} ${t.interactive.hoverBg}`}
                  >
                    <Settings2 className="w-3 h-3" />
                    配置 API Key...
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-lg transition-all ${t.interactive.ghostBtn} ${t.interactive.ghostBtnHover}`}
            title="模型管理"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ===== Session Sidebar ===== */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0, x: -260 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -260 }}
            transition={{ duration: 0.2 }}
            className={`fixed left-0 top-12 bottom-0 w-64 z-20 border-r flex flex-col ${t.page.sidebarBg} ${barBorder} backdrop-blur-lg`}
          >
            {/* Sidebar Header */}
            <div
              className={`flex items-center justify-between px-3 py-2.5 border-b ${barBorder}`}
            >
              <span className={`text-[0.78rem] ${t.text.secondary}`}>
                对话历史
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewSession}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[0.65rem] transition-all ${t.interactive.ghostBtn} ${t.interactive.ghostBtnHover}`}
                >
                  <Plus className="w-3 h-3" /> 新建
                </button>
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto py-1">
              {sessionList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className={`w-8 h-8 mb-2 ${t.text.ghost}`} />
                  <p className={`text-[0.72rem] ${t.text.caption}`}>
                    暂无对话历史
                  </p>
                  <p className={`text-[0.6rem] mt-1 ${t.text.dim}`}>
                    开始新对话后将自动保存
                  </p>
                </div>
              ) : (
                sessionList.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleLoadSession(s)}
                    className={`flex items-start gap-2 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-all group ${s.id === sessionId
                        ? t.interactive.sessionItemActive
                        : t.interactive.sessionItem
                      }`}
                  >
                    <MessageSquare
                      className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${s.id === sessionId ? t.text.accent : t.text.caption
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[0.72rem] truncate ${s.id === sessionId ? t.text.label : t.text.tertiary
                          }`}
                      >
                        {s.title}
                      </div>
                      <div
                        className={`flex items-center gap-1.5 mt-0.5 text-[0.58rem] ${t.text.dim}`}
                      >
                        <span>
                          {new Date(s.updatedAt).toLocaleDateString("zh-CN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {s.modelId && (
                          <span>
                            · {s.modelId.split("_").pop()?.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className={`w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${t.interactive.deleteSessionBtn}`}
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            <div className={`flex-shrink-0 px-3 py-2 border-t ${barBorder}`}>
              {/* Import from IDE button */}
              <button
                onClick={() => {
                  setIdeSessionList(listSessions("ide"));
                  setShowImportIDE(!showImportIDE);
                }}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[0.65rem] mb-1.5 transition-all border ${showImportIDE
                    ? t.interactive.importBtnActive
                    : t.interactive.importBtn
                  }`}
              >
                <Upload className="w-3 h-3" />
                <span>从 IDE 导入对话</span>
              </button>

              {/* IDE session list for import */}
              {showImportIDE && (
                <div
                  className={`mb-2 rounded-lg border overflow-hidden ${t.interactive.importPanelBorder} ${t.interactive.importPanelBg}`}
                >
                  <div
                    className={`px-2 py-1.5 text-[0.6rem] ${t.interactive.importPanelHeader} border-b ${t.interactive.importPanelBorder}`}
                  >
                    IDE 面板中的对话 ({ideSessionList.length})
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {ideSessionList.length === 0 ? (
                      <div
                        className={`px-2 py-3 text-center text-[0.6rem] ${t.text.dim}`}
                      >
                        IDE 中暂无对话历史
                      </div>
                    ) : (
                      ideSessionList.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleImportFromIDE(s)}
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left transition-all ${t.interactive.importItemHover}`}
                        >
                          <PanelLeft className="w-3 h-3 flex-shrink-0" />
                          <span className="text-[0.62rem] truncate flex-1">
                            {s.title}
                          </span>
                          <span
                            className={`text-[0.52rem] flex-shrink-0 ${t.text.dim}`}
                          >
                            {new Date(s.updatedAt).toLocaleDateString("zh-CN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div
                className={`flex items-center gap-1.5 text-[0.6rem] ${t.text.dim}`}
              >
                <History className="w-3 h-3" />
                <span>最多保存 20 个会话</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 top-12 z-10"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ===== Main Chat Area ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hasMessages ? (
          /* ===== Empty State — Welcome ===== */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-xl"
            >
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={yyc3Logo}
                    alt="YYC³"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              <h2 className={`text-[1.3rem] mb-2 ${t.text.primary}`}>
                YYC³ AI 智能对话
              </h2>
              <p className={`text-[0.82rem] mb-8 ${t.text.muted}`}>
                深度技术对话 · 代码分析优化 · 学习指导 · 方案推荐
              </p>

              {/* Quick starters — 一排 */}
              <div className="flex gap-2 overflow-x-auto pb-2 max-w-2xl mx-auto">
                {QUICK_STARTERS.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => {
                      setChatInput(item.label);
                      inputRef.current?.focus();
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border ${t.page.cardBorder} ${t.text.tertiary} ${t.interactive.hoverBgStrong} shrink-0`}
                  >
                    <item.icon
                      className={`w-3.5 h-3.5 flex-shrink-0 ${t.text.muted}`}
                    />
                    <div className="text-[0.72rem] whitespace-nowrap">
                      {item.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* ===== Messages ===== */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 py-4 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${t.chat.assistantAvatar}`}
                    >
                      <Bot className={`w-4 h-4 ${accentText}`} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] min-w-0 ${msg.role === "user" ? "order-first" : ""}`}
                  >
                    {/* Model name tag */}
                    {msg.role === "assistant" && msg.modelName && (
                      <div className={`text-[0.6rem] mb-1 ${t.text.caption}`}>
                        {msg.modelName} · {msg.timestamp}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                          ? t.chat.userBubble
                          : msg.error
                            ? "bg-red-500/[0.06] border border-red-500/15 text-red-400/80"
                            : t.chat.assistantBubble
                        }`}
                    >
                      {msg.error ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400/60 flex-shrink-0 mt-0.5" />
                          <span className="text-[0.78rem]">{msg.error}</span>
                        </div>
                      ) : (
                        <div className="text-[0.82rem] whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                          {msg.isStreaming && (
                            <span
                              className={`inline-block w-1.5 h-4 ml-0.5 animate-pulse ${t.chat.cursorBg}`}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Code block */}
                    {msg.codeBlock && (
                      <div
                        className={`mt-2 rounded-xl overflow-hidden border ${t.page.cardBorder}`}
                      >
                        <div
                          className={`flex items-center justify-between px-3 py-1.5 ${t.chat.codeHeaderBg}`}
                        >
                          <span className={`text-[0.6rem] ${t.text.muted}`}>
                            {msg.codeBlock.lang}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy((msg.codeBlock as any).code, `${msg.id}-code`)
                            }
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[0.6rem] transition-all ${copiedId === `${msg.id}-code`
                                ? "text-emerald-400"
                                : `${t.text.muted} ${t.interactive.ghostBtnHover}`
                              }`}
                          >
                            {copiedId === `${msg.id}-code` ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedId === `${msg.id}-code` ? "已复制" : "复制"}
                          </button>
                        </div>
                        <pre
                          className={`px-3 py-3 text-[0.75rem] overflow-x-auto ${t.chat.codeBg}`}
                        >
                          <code>{msg.codeBlock.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Actions for assistant messages */}
                    {msg.role === "assistant" &&
                      !msg.isStreaming &&
                      msg.content &&
                      !msg.error && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[0.6rem] transition-all ${copiedId === msg.id
                                ? "text-emerald-400"
                                : `${t.text.dim} ${t.interactive.ghostBtnHover}`
                              }`}
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedId === msg.id ? "已复制" : "复制"}
                          </button>
                        </div>
                      )}
                  </div>

                  {msg.role === "user" && (
                    <div
                      className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${t.chat.userAvatar}`}
                    >
                      <User className={`w-4 h-4 ${accentText}`} />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* ===== Input Area ===== */}
        <div className={`flex-shrink-0 border-t ${barBorder}`}>
          <div className="max-w-3xl mx-auto px-4 py-3">
            {/* Action bar above input */}
            {hasMessages && (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={handleClearChat}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[0.65rem] transition-all ${t.text.caption} hover:text-red-400 hover:bg-red-500/10`}
                >
                  <Trash2 className="w-3 h-3" />
                  清空对话
                </button>
                <div className="flex-1" />
                {activeModel && (
                  <span className={`text-[0.6rem] ${t.text.dim}`}>
                    {activeModel.name} · {activeModel.provider}
                  </span>
                )}
              </div>
            )}

            {/* Input box — 加大 */}
            <div
              className={`flex items-end gap-2 rounded-2xl border transition-all px-5 py-3 ${t.chat.inputWrapperBg}`}
            >
              <textarea
                ref={inputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题... (Shift+Enter 换行)"
                rows={2}
                className={`flex-1 bg-transparent outline-none resize-none text-[0.95rem] min-h-[32px] max-h-[180px] ${t.chat.inputText}`}
                style={{ lineHeight: "1.5" }}
              />

              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${t.chat.stopBtn}`}
                  title="停止生成"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!chatInput.trim()}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 ${t.chat.sendBtn} ${t.chat.sendBtnHover}`}
                  title="发送 (Enter)"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Footer note */}
            <div
              className={`flex items-center justify-center mt-2 text-[0.6rem] ${t.text.dim}`}
            >
              YYC³ Family AI · 言启象限 · 语枢未来
            </div>
          </div>
        </div>
      </div>

      {/* ===== API Key Settings Modal ===== */}
      <APIKeySettingsUI />
      <ModelSettings />

      {/* Import toast */}
      <AnimatePresence>
        {importToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md ${t.interactive.importBtnActive} border`}
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            <Upload className="w-4 h-4" />
            <span className="text-[0.78rem]">{importToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===================================================================
//  Page wrapper with providers
// ===================================================================

export default function AIChatPage() {
  return (
    <FileStoreProvider>
      <ModelRegistryProvider>
        <AIChatInner />
      </ModelRegistryProvider>
    </FileStoreProvider>
  );
}
