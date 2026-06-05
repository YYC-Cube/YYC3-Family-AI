import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Download,
  Eye,
  Layers,
  Loader2,
  Maximize2,
  Monitor,
  Package,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  X,
  Zap
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThemeTokens } from "./ide/hooks/useThemeTokens";
import { buildPreviewHtml } from "./ide/PreviewEngine";

const SandpackPreviewPanel = lazy(() => import("./ide/SandpackPreview"));

export interface PreviewCode {
  html?: string;
  css?: string;
  react?: string;
  dependencies?: Record<string, string>;
}

export interface TemplateWithPreview {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  stars: number;
  downloads: number;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
  panels: number;
  techStack: string[];
  previewCode?: PreviewCode;
  previewScreenshot?: string;
  features?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedTime?: string;
}

type PreviewTab = "preview" | "code" | "tech";

interface TemplatePreviewModalProps {
  template: TemplateWithPreview;
  onClose: () => void;
  onUse: (template: TemplateWithPreview) => void;
}

const DIFFICULTY_CONFIG = {
  beginner: { label: "入门", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  intermediate: { label: "中级", color: "text-amber-400", bg: "bg-amber-400/10" },
  advanced: { label: "高级", color: "text-rose-400", bg: "bg-rose-400/10" },
};

const TABS: { key: PreviewTab; icon: typeof Eye; label: string }[] = [
  { key: "preview", icon: Eye, label: "实时预览" },
  { key: "code", icon: Code2, label: "源码" },
  { key: "tech", icon: Cpu, label: "技术栈" },
];

export default function TemplatePreviewModal({
  template,
  onClose,
  onUse,
}: TemplatePreviewModalProps) {
  const t = useThemeTokens();
  const [activeTab, setActiveTab] = useState<PreviewTab>("preview");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasLivePreview = !!(template.previewCode?.react || template.previewCode?.html);

  const handleCopyCode = useCallback(async () => {
    const code = template.previewCode?.react || template.previewCode?.html || "";
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [template.previewCode]);

  const deviceWidth = useMemo(() => {
    switch (deviceMode) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  }, [deviceMode]);

  const diffConfig = DIFFICULTY_CONFIG[template.difficulty || "beginner"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-5xl max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl border ${t.page.cardBg} ${t.page.cardBorder} flex flex-col`}
        >
          {/* Header */}
          <div className={`flex-shrink-0 px-6 py-4 border-b ${t.templates.topBarBg}`}>
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
              >
                <template.icon className="w-6 h-6 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className={`text-lg font-semibold truncate ${t.text.primary}`}>
                    {template.name}
                  </h2>
                  <span className={`px-2 py-0.5 text-[0.65rem] rounded-full font-medium ${diffConfig.bg} ${diffConfig.color}`}>
                    {diffConfig.label}
                  </span>
                </div>
                <p className={`text-[0.8rem] line-clamp-1 ${t.text.secondary}`}>
                  {template.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`flex items-center gap-1 text-[0.7rem] ${t.text.muted}`}>
                    <Star className="w-3 h-3" /> {template.stars}
                  </span>
                  <span className={`flex items-center gap-1 text-[0.7rem] ${t.text.muted}`}>
                    <Download className="w-3 h-3" /> {template.downloads}
                  </span>
                  <span className={`flex items-center gap-1 text-[0.7rem] ${t.text.muted}`}>
                    <Layers className="w-3 h-3" /> {template.panels} 面板
                  </span>
                  {template.estimatedTime && (
                    <span className={`flex items-center gap-1 text-[0.7rem] ${t.text.muted}`}>
                      <Zap className="w-3 h-3" /> 约{template.estimatedTime}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="关闭预览"
                title="关闭预览"
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${t.text.muted} hover:${t.text.primary}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-4 -mb-px">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const isDisabled = tab.key === "preview" && !hasLivePreview && !template.previewScreenshot;
                return (
                  <button
                    type="button"
                    key={tab.key}
                    disabled={isDisabled}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[0.78rem] border-b-2 transition-colors ${isActive
                      ? `border-current ${t.text.accent} font-medium`
                      : `border-transparent ${t.text.muted} hover:${t.text.secondary}`
                      } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="flex-1" />
              {activeTab === "preview" && hasLivePreview && (
                <div className="flex items-center gap-1 mr-2">
                  {([
                    ["desktop", Monitor, "桌面视图"],
                    ["tablet", Tablet, "平板视图"],
                    ["mobile", Smartphone, "移动视图"],
                  ] as const).map(([mode, Icon, label]) => (
                    <button
                      type="button"
                      key={mode}
                      aria-label={label}
                      title={label}
                      onClick={() => setDeviceMode(mode)}
                      className={`p-1.5 rounded-md transition-colors ${deviceMode === mode ? t.templates.viewBtnActive : t.templates.viewBtnInactive
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label={isFullscreen ? "退出全屏" : "全屏预览"}
                    title={isFullscreen ? "退出全屏" : "全屏预览"}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`p-1.5 rounded-md transition-colors ${t.templates.viewBtnInactive}`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`h-full ${isFullscreen ? "fixed inset-0 z-[200] bg-black/90 p-6" : "p-6"}`}
                >
                  {hasLivePreview ? (
                    <Suspense
                      fallback={
                        <div className={`flex items-center justify-center h-full min-h-[300px] rounded-xl ${t.page.cardBgAlt}`}>
                          <Loader2 className="w-8 h-8 animate-spin text-accent" />
                          <span className={`ml-3 text-[0.85rem] ${t.text.secondary}`}>加载预览引擎...</span>
                        </div>
                      }
                    >
                      <div
                        className={`h-full rounded-xl overflow-hidden border border-[var(--border)]${deviceMode !== "desktop" ? " mx-auto" : ""}`}
                        {...(deviceMode !== "desktop" ? { style: { maxWidth: deviceWidth } } : {})}
                      >
                        <SandpackTemplatePreview template={template} isFullscreen={isFullscreen} />
                      </div>
                    </Suspense>
                  ) : template.previewScreenshot ? (
                    <div className={`h-full flex flex-col items-center justify-center rounded-xl ${t.page.cardBgAlt} border ${t.page.cardBorder}`}>
                      <img
                        src={template.previewScreenshot}
                        alt={template.name}
                        className="max-w-full max-h-[480px] object-contain rounded-lg shadow-inner"
                      />
                      <p className={`mt-4 text-[0.75rem] ${t.text.muted}`}>静态预览截图</p>
                    </div>
                  ) : (
                    <div className={`h-full flex flex-col items-center justify-center rounded-xl ${t.page.cardBgAlt} border ${t.page.cardBorder} border-dashed`}>
                      <Package className={`w-12 h-12 mb-3 ${t.text.tertiary}`} />
                      <p className={`text-[0.85rem] ${t.text.secondary}`}>暂无预览内容</p>
                      <p className={`text-[0.72rem] mt-1 ${t.text.muted}`}>此模板尚未配置实时预览</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full p-6 overflow-auto"
                >
                  {template.previewCode?.react || template.previewCode?.html ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[0.75rem] font-medium ${t.text.secondary}`}>
                          {template.previewCode?.react ? "App.tsx" : "index.html"}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] transition-colors ${t.btn.accent} ${t.btn.accentHover}`}
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? "已复制" : "复制代码"}
                        </button>
                      </div>
                      <pre className={`p-4 rounded-xl text-[0.78rem] leading-relaxed overflow-x-auto border ${t.page.cardBgAlt} ${t.page.cardBorder} bg-[var(--code-bg,#1a1a2e)]`}>
                        <code className="text-[var(--text-primary,#e0e0e0)]">
                          {template.previewCode?.react || template.previewCode?.html || "// 暂无代码"}
                        </code>
                      </pre>
                      {template.previewCode?.css && (
                        <>
                          <span className={`text-[0.75rem] font-medium ${t.text.secondary}`}>styles.css</span>
                          <pre className={`p-4 rounded-xl text-[0.78rem] leading-relaxed overflow-x-auto border ${t.page.cardBgAlt} ${t.page.cardBorder} bg-[var(--code-bg,#1a1a2e)]`}>
                            <code className="text-[var(--text-primary,#e0e0e0)]">{template.previewCode.css}</code>
                          </pre>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={`h-full flex flex-col items-center justify-center rounded-xl ${t.page.cardBgAlt} border ${t.page.cardBorder} border-dashed`}>
                      <Code2 className={`w-12 h-12 mb-3 ${t.text.tertiary}`} />
                      <p className={`text-[0.85rem] ${t.text.secondary}`}>暂无源码预览</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "tech" && (
                <motion.div
                  key="tech"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full p-6 overflow-auto"
                >
                  <div className="grid grid-cols-2 gap-6 max-w-2xl">
                    <div className={`p-4 rounded-xl border ${t.page.cardBgAlt} ${t.page.cardBorder}`}>
                      <h4 className={`text-[0.8rem] font-medium mb-3 flex items-center gap-2 ${t.text.primary}`}>
                        <Cpu className="w-4 h-4" /> 技术栈
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {template.techStack.map((tech) => (
                          <span
                            key={tech}
                            className={`px-2 py-1 text-[0.72rem] rounded-md ${t.templates.tagBg} ${t.text.secondary}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${t.page.cardBgAlt} ${t.page.cardBorder}`}>
                      <h4 className={`text-[0.8rem] font-medium mb-3 flex items-center gap-2 ${t.text.primary}`}>
                        <Sparkles className="w-4 h-4" /> 标签
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 text-[0.72rem] rounded-md bg-accent/10 text-accent`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {template.features && template.features.length > 0 && (
                      <div className={`col-span-2 p-4 rounded-xl border ${t.page.cardBgAlt} ${t.page.cardBorder}`}>
                        <h4 className={`text-[0.8rem] font-medium mb-3 flex items-center gap-2 ${t.text.primary}`}>
                          <Zap className="w-4 h-4" /> 功能特性
                        </h4>
                        <ul className="space-y-2">
                          {template.features.map((feature, i) => (
                            <li key={i} className={`flex items-start gap-2 text-[0.78rem] ${t.text.secondary}`}>
                              <ChevronRight className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${t.text.accent}`} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className={`col-span-2 grid grid-cols-3 gap-3`}>
                      {[
                        { icon: Star, label: "收藏", value: template.stars.toLocaleString() },
                        { icon: Download, label: "下载", value: template.downloads.toLocaleString() },
                        { icon: Layers, label: "面板数", value: String(template.panels) },
                      ].map(({ icon: StatIcon, label, value }) => (
                        <div key={label} className={`p-3 rounded-lg text-center ${t.page.cardBgAlt}`}>
                          <StatIcon className={`w-4 h-4 mx-auto mb-1 ${t.text.accent}`} />
                          <div className={`text-[0.9rem] font-semibold ${t.text.primary}`}>{value}</div>
                          <div className={`text-[0.65rem] ${t.text.muted}`}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className={`flex-shrink-0 px-6 py-4 border-t ${t.templates.topBarBg}`}>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-[0.82rem] transition-colors ${t.page.cardBgAlt} ${t.text.secondary} hover:${t.text.primary}`}
              >
                返回列表
              </button>
              <button
                type="button"
                onClick={() => onUse(template)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[0.82rem] font-medium bg-gradient-to-r ${template.gradient} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all`}
              >
                <Sparkles className="w-4 h-4" />
                使用此模板创建项目
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SandpackTemplatePreview({ template, isFullscreen }: { template: TemplateWithPreview; isFullscreen: boolean }) {
  const needsReact = !!template.previewCode?.react;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [SandpackComponents, setSandpackComponents] = useState<Record<string, React.ComponentType<any>> | null>(null);

  const iframePreviewHtml = useMemo(() => {
    if (needsReact) return null;

    if (template.previewCode?.html) {
      return buildPreviewHtml(template.previewCode.html, "html", { darkMode: true });
    }
    if (template.previewCode?.css) {
      const code = `<style>${template.previewCode.css}</style><div class="preview-container"><h1>CSS Preview</h1><p>Styles applied to this document.</p><div class="box" style="width:100px;height:100px;background:#38bdf8;border-radius:8px;margin:16px 0;"></div></div>`;
      return buildPreviewHtml(code, "html", { darkMode: true });
    }
    return null;
  }, [template.previewCode, needsReact]);

  useEffect(() => {
    if (iframeRef.current && iframePreviewHtml) {
      iframeRef.current.srcdoc = iframePreviewHtml.html;
    }
  }, [iframePreviewHtml]);

  useEffect(() => {
    import("@codesandbox/sandpack-react").then((mods) => {
      setSandpackComponents(mods as unknown as Record<string, React.ComponentType<any>>);
    });
  }, []);

  const files = useMemo(() => {
    const result: Record<string, string> = {};
    if (template.previewCode?.react) {
      result["/App.js"] = template.previewCode.react;
      result["/index.js"] = `import React from "react";\nimport App from "./App";\n\nexport default App;`;
    }
    if (template.previewCode?.html) {
      result["/index.html"] = template.previewCode.html;
    }
    if (template.previewCode?.css) {
      result["/styles.css"] = template.previewCode.css;
    }
    return result;
  }, [template.previewCode]);

  if (!needsReact) {
    if (!iframePreviewHtml) {
      return (
        <div className="h-[420px] flex items-center justify-center bg-[#0b1729]">
          <div className="text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p className="text-sm text-slate-400">暂无可预览内容</p>
          </div>
        </div>
      );
    }

    return (
      <iframe
        ref={iframeRef}
        className={`w-full border-0 ${isFullscreen ? "h-[calc(100vh-120px)]" : "h-[420px]"}`}
        sandbox="allow-scripts allow-same-origin"
        title="Template Preview"
      />
    );
  }

  if (!SandpackComponents) {
    return (
      <div className="h-[420px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">加载预览引擎...</p>
        </div>
      </div>
    );
  }

  const { SandpackProvider, SandpackPreview: SandpackPreviewPane } = SandpackComponents;

  return (
    <SandpackProvider
      template="react"
      files={files}
      theme="dark"
      customSetup={{
        dependencies: template.previewCode?.dependencies || {},
      }}
      options={{
        externalResources: [],
      }}
    >
      <SandpackPreviewPane
        style={{ height: isFullscreen ? "calc(100vh - 120px)" : "420px" }}
        showNavigator={false}
        showRefreshButton={true}
        showOpenInCodeSandbox={false}
      />
    </SandpackProvider>
  );
}
