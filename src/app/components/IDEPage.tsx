/**
 * @file: IDEPage.tsx
 * @description: 智能编程 IDE 主页面，集成三栏布局、多联式面板拖拽系统、
 *              视图切换（默认/预览/代码）、终端、快捷键、18 面板渲染路由、
 *              全局命令面板、面板小地图、快捷键帮助、浮动面板窗口、面板分组
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v3.1.0
 * @created: 2026-03-06
 * @updated: 2026-03-14
 * @status: dev
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: ide,layout,panels,routing,dnd,preview,command-palette,minimap,floating,tab-groups,wave3
 */

import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation, useNavigate, useParams } from "react-router";
import AgentMarket from "./ide/AgentMarket";
import AgentOrchestrator from "./ide/AgentOrchestrator";
import CenterPanel from "./ide/CenterPanel";
import CodeQualityDashboard from "./ide/CodeQualityDashboard";
import CollabPanel from "./ide/CollabPanel";
import CommandPalette from "./ide/CommandPalette";
import { ConfirmDialogContainer } from "./ide/ConfirmDialogContainer";
import DocumentEditor from "./ide/DocumentEditor";
import ErrorDiagnosticsPanel from "./ide/ErrorDiagnosticsPanel";
import { FileStoreProvider, useFileStore } from "./ide/FileStore";
import FloatingPanelContainer from "./ide/FloatingPanelContainer";
import GitPanel from "./ide/GitPanel";
import { useMultiInstanceSync } from "./ide/hooks/useMultiInstanceSync";
import { useSettingsSync } from "./ide/hooks/useSettingsSync";
import KeyboardShortcutsHelp from "./ide/KeyboardShortcutsHelp";
import KnowledgeBase from "./ide/KnowledgeBase";
import LeftPanel from "./ide/LeftPanel";
import { ModelRegistryProvider } from "./ide/ModelRegistry";
import MultiInstancePanel from "./ide/MultiInstancePanel";
import OpsPanel from "./ide/OpsPanel";
import PanelLayoutManager from "./ide/PanelLayoutManager";
import {
  LAYOUT_PRESETS,
  LayoutResetButton,
  PanelLayoutArea,
  PanelManagerProvider,
  usePanelManager,
  type PanelId,
} from "./ide/PanelManager";
import PanelMinimap from "./ide/PanelMinimap";
import PanelQuickAccess from "./ide/PanelQuickAccess";
import PerformancePanel from "./ide/PerformancePanel";
import { PromptDialogContainer } from "./ide/PromptDialogContainer";
import QuickActionsBar from "./ide/QuickActionsBar";
import RAGChat from "./ide/RAGChat";
import RightPanel from "./ide/RightPanel";
import SecurityPanel from "./ide/SecurityPanel";
import { useQuickActionsStore } from "./ide/stores/useQuickActionsStore";
import TabGroupBar from "./ide/TabGroupBar";
import TaskBoardPanel from "./ide/TaskBoardPanel";
import TerminalPanel from "./ide/TerminalPanel";
import TestGeneratorPanel from "./ide/TestGeneratorPanel";
import { ToastContainer } from "./ide/ToastContainer";
import TopBar from "./ide/TopBar";
import ViewSwitcher, { type ViewMode } from "./ide/ViewSwitcher";
import { WorkflowEventBusProvider } from "./ide/WorkflowEventBus";
import WorkflowPipeline from "./ide/WorkflowPipeline";
import { ALL_TEMPLATES } from "./TemplatesPage";
const RealtimePreviewPanel = lazy(() => import("./ide/RealtimePreviewPanel"));
const APIKeySettingsUI = lazy(() => import("./ide/APIKeySettingsUI"));
const ModelSettings = lazy(() => import("./ide/ModelSettings").then((m) => ({ default: m.ModelSettings })));

// ── Multi-Instance Sync Bridge (must be inside FileStoreProvider) ──
function MultiInstanceSyncBridge() {
  useMultiInstanceSync();
  return null;
}

// ── Template Load Bridge (must be inside FileStoreProvider) ──
function TemplateLoadBridge({ templateId, templateName }: { templateId?: string; templateName?: string }) {
  const { loadTemplate } = useFileStore();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!templateId || loadedRef.current) return;
    loadedRef.current = true;

    const tpl = ALL_TEMPLATES.find((t: { id: string }) => t.id === templateId);
    if (tpl?.previewCode) {
      loadTemplate(templateId, templateName || tpl.name, tpl.previewCode);
    }
  }, [templateId, templateName, loadTemplate]);

  return null;
}

// ===== Toolbar action → Panel mapping =====
const TOOL_TO_PANEL: Record<string, PanelId> = {
  git: "git",
  projects: "files",
  tools: "agents",
  plugins: "market",
  settings: "ops",
};

// Bridge component: connects TopBar toolbar to PanelManager
function ConnectedTopBar({
  projectName,
  onBack,
}: {
  projectName: string;
  onBack: () => void;
}) {
  const ctx = usePanelManager();

  const handleToolAction = useCallback(
    (action: string) => {
      const panelId = TOOL_TO_PANEL[action];
      if (panelId && ctx) {
        ctx.openPanel(panelId);
      }
      // "share", "notifications" are UI-only actions (no panel)
    },
    [ctx],
  );

  return (
    <TopBar
      projectName={projectName}
      onBack={onBack}
      onToolAction={handleToolAction}
    />
  );
}

export default function IDEPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  // 启动全局设置同步（模型、MCP、CSS 变量、快捷键）
  useSettingsSync();

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Keyboard shortcuts (no Esc = go home, use Home icon instead)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl+Shift+P
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }
      // Quick Actions Bar: Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        useQuickActionsStore.getState().toggleQuickBar();
        return;
      }
      // Keyboard Shortcuts Help: Ctrl+/
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setShortcutsHelpOpen((prev) => !prev);
        return;
      }
      if (e.ctrlKey && e.key === "1") {
        e.preventDefault();
        setViewMode("preview");
      }
      if (e.ctrlKey && e.key === "2") {
        e.preventDefault();
        setViewMode((prev) => (prev === "default" ? "code" : "default"));
      }
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const projectName =
    projectId === "new"
      ? "未命名项目"
      : projectId === "ai-workspace"
        ? "AI 交互工作台"
        : projectId === "proj_001"
          ? "电商仪表板"
          : projectId === "proj_002"
            ? "CRM 管理系统"
            : projectId === "proj_003"
              ? "数据可视化平台"
              : "我的项目";

  const templateState = useMemo(() => {
    const state = location.state as { template?: string; templateName?: string; mode?: string } | null;
    return {
      templateId: state?.template,
      templateName: state?.templateName,
      mode: state?.mode,
    };
  }, []);

  const effectiveProjectName = useMemo(() => {
    if (templateState.templateName) return templateState.templateName;
    return projectName;
  }, [projectName, templateState.templateName]);

  // Determine initial layout based on navigation mode from HomePage
  const initialLayout = useMemo(() => {
    const mode = templateState.mode || "designer";
    return LAYOUT_PRESETS[mode] || LAYOUT_PRESETS.default;
  }, []); // Only compute once on mount, ignore location changes

  // Render panel by ID
  const renderPanel = useCallback(
    (panelId: PanelId, nodeId: string) => {
      switch (panelId) {
        case "ai":
          return <LeftPanel nodeId={nodeId} />;
        case "files":
          return <CenterPanel searchOpen={searchOpen} nodeId={nodeId} />;
        case "code":
          return <RightPanel nodeId={nodeId} />;
        case "git":
          return <GitPanel nodeId={nodeId} />;
        case "agents":
          return <AgentOrchestrator nodeId={nodeId} />;
        case "market":
          return <AgentMarket nodeId={nodeId} />;
        case "knowledge":
          return <KnowledgeBase nodeId={nodeId} />;
        case "rag":
          return <RAGChat nodeId={nodeId} />;
        case "collab":
          return <CollabPanel nodeId={nodeId} />;
        case "ops":
          return <OpsPanel nodeId={nodeId} />;
        case "workflow":
          return <WorkflowPipeline nodeId={nodeId} />;
        case "preview":
          return <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" ></div></div>}><RealtimePreviewPanel nodeId={nodeId} /></React.Suspense>;
        case "diagnostics":
          return <ErrorDiagnosticsPanel nodeId={nodeId} />;
        case "performance":
          return <PerformancePanel nodeId={nodeId} />;
        case "security":
          return <SecurityPanel nodeId={nodeId} />;
        case "test-gen":
          return <TestGeneratorPanel nodeId={nodeId} />;
        case "quality":
          return <CodeQualityDashboard nodeId={nodeId} />;
        case "document-editor":
          return <DocumentEditor nodeId={nodeId} filePath="untitled.md" />;
        case "taskboard":
          return <TaskBoardPanel nodeId={nodeId} />;
        case "multi-instance":
          return <MultiInstancePanel />;
        case "terminal":
          return <TerminalPanel nodeId={nodeId} />;
        default:
          return (
            <div className="size-full flex items-center justify-center bg-[var(--ide-bg)] text-[var(--ide-text-dim)] text-[0.72rem]">
              未知面板
            </div>
          );
      }
    },
    [searchOpen],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <WorkflowEventBusProvider>
        <FileStoreProvider skipIdbLoad={!!templateState.templateId}>
          <ModelRegistryProvider>
            <PanelManagerProvider
              renderPanel={renderPanel}
              initialLayout={initialLayout}
            >
              <div className="ide-root size-full flex flex-col bg-[var(--ide-bg-deep)] overflow-hidden">
                <MultiInstanceSyncBridge />
                <TemplateLoadBridge templateId={templateState.templateId} templateName={templateState.templateName} />
                <ConnectedTopBar
                  projectName={effectiveProjectName}
                  onBack={handleBack}
                />
                <ViewSwitcher
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onBack={handleBack}
                  searchOpen={searchOpen}
                  onSearchToggle={() => setSearchOpen(!searchOpen)}
                  onCommandPalette={() => setCommandPaletteOpen(true)}
                  onShortcutsHelp={() => setShortcutsHelpOpen(true)}
                >
                  {/* Extra controls in view switcher */}
                  <div className="h-3.5 w-px bg-[var(--ide-border-dim)] mx-1" />
                  <PanelQuickAccess />
                  <div className="h-3.5 w-px bg-[var(--ide-border-dim)] mx-1" />
                  <PanelMinimap />
                  <div className="h-3.5 w-px bg-[var(--ide-border-dim)] mx-1" />
                  <TabGroupBar />
                  <div className="h-3.5 w-px bg-[var(--ide-border-dim)] mx-1" />
                  <PanelLayoutManager />
                  <LayoutResetButton />
                </ViewSwitcher>
                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  {viewMode === "preview" ? (
                    <PreviewLayout renderPanel={renderPanel} />
                  ) : (
                    <div className="flex-1 overflow-hidden">
                      <PanelLayoutArea />
                    </div>
                  )}
                </div>
              </div>
              <React.Suspense fallback={<div className="flex items-center justify-center p-4"><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}><APIKeySettingsUI /></React.Suspense>
              <React.Suspense fallback={<div className="flex items-center justify-center p-4"><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}><ModelSettings /></React.Suspense>
              <CommandPalette
                open={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                onNavigateHome={handleBack}
                onViewModeChange={setViewMode}
                onSearchToggle={() => setSearchOpen((prev) => !prev)}
              />
              <KeyboardShortcutsHelp
                open={shortcutsHelpOpen}
                onClose={() => setShortcutsHelpOpen(false)}
              />
              {/* Floating panels rendered on top */}
              <FloatingPanelContainer renderPanel={renderPanel} />
              <QuickActionsBar />
              <ToastContainer />
              <ConfirmDialogContainer />
              <PromptDialogContainer />
            </PanelManagerProvider>
          </ModelRegistryProvider>
        </FileStoreProvider>
      </WorkflowEventBusProvider>
    </DndProvider>
  );
}

/* ===== Preview Layout ===== */
interface PreviewLayoutProps {
  renderPanel: (panelId: PanelId, nodeId: string) => React.ReactNode;
}

function PreviewLayout({ renderPanel }: PreviewLayoutProps) {
  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Left AI Panel */}
      <div className="w-[25%] min-w-[200px] border-r border-dashed border-[var(--ide-border-dim)]">
        {renderPanel("ai", "preview-left")}
      </div>
      {/* Preview area */}
      <div className="flex-1">
        <PreviewContent />
      </div>
    </div>
  );
}

/* ===== Preview Content ===== */
function PreviewContent() {
  return <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}><RealtimePreviewPanel nodeId="preview-main" /></React.Suspense>;
}
