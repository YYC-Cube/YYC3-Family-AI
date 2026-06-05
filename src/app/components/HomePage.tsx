/**
 * @file: HomePage.tsx
 * @description: 首页入口，包含品牌标识、智能编程 AI 聊天框、项目快速访问卡片、
 *              智能路由决策系统
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.5.0
 * @created: 2026-03-06
 * @updated: 2026-03-14
 * @status: dev
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: homepage,brand,chat,projects,routing
 */

import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  Clipboard,
  Code2,
  ExternalLink,
  FolderOpen,
  GitFork,
  Home,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutGrid,
  Lightbulb,
  Loader2,
  MessageSquare,
  PenTool,
  Pencil,
  Plus,
  Send,
  Settings,
  Sparkles,
  Terminal,
  Trash2,
  Upload,
  User,
  X,
  Zap
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router";
import { APP_TEMPLATES } from "./AppTemplates";
import ProjectCreateWizard from "./ProjectCreateWizard";
import TemplatePreviewModal, {
  type TemplateWithPreview,
} from "./TemplatePreviewModal";
import { getActiveTheme } from "./ide/CustomThemeStore";
import { analyzeIntentAI } from "./ide/LLMService";
import NotificationDrawer from "./ide/NotificationDrawer";
import ShareDialog from "./ide/ShareDialog";
import ThemeSwitcher from "./ide/ThemeSwitcher";
import { useThemeTokens } from "./ide/hooks/useThemeTokens";
import yyc3Logo from "/macOS/512.png";

// ===================================================================
//  Enhanced Smart Intent Analysis — 强化语义分析
//  支持非编程用户的自然语言，多维度评分
// ===================================================================

type RouteIntent = "designer" | "ai-workspace";

interface IntentResult {
  mode: RouteIntent;
  confidence: number;
  category: string; // 分类标签
  summary: string; // 语义摘要反馈
  suggestion: string; // 对用户的提示
}

// ── 编程/创建类关键词 (weighted) ──
const DESIGNER_PATTERNS: {
  pattern: RegExp;
  weight: number;
  category: string;
}[] = [
    // 直接创建/构建意图 (高权重)
    {
      pattern:
        /^(帮我|请|我想|我要|给我|帮忙|能不能|可以)(做|创建|构建|搭建|开发|生成|设计|写|弄|整)(一个|个|一套|一组)?/i,
      weight: 5,
      category: "创建请求",
    },
    {
      pattern: /^(make|build|create|design|develop|generate|write)\b/i,
      weight: 5,
      category: "创建请求",
    },
    {
      pattern:
        /(做|搭|建|开发|生成|设计)(一个|一套|一组)(.{2,20})(页面|系统|应用|网站|平台|工具|界面|组件)/i,
      weight: 4,
      category: "创建请求",
    },

    // 项目/产品描述 (中高权重)
    {
      pattern: /(网站|网页|app|应用|小程序|h5|官网|主页|首页|landing\s*page)/i,
      weight: 3,
      category: "产品类型",
    },
    {
      pattern: /(仪表板|dashboard|后|管理系统|admin|cms|crm|erp|oa|saas)/i,
      weight: 3,
      category: "产品类型",
    },
    {
      pattern: /(电商|商城|网店|购物|支付|订单|商品|库存|物流)/i,
      weight: 3,
      category: "商业场景",
    },
    {
      pattern: /(博客|论坛|社交|聊天|社区|评论|发帖|朋友圈|feed)/i,
      weight: 3,
      category: "社交场景",
    },
    {
      pattern: /(日程|日历|待办|todo|任务|项目管理|看板|甘特|kanban)/i,
      weight: 3,
      category: "效率工具",
    },
    {
      pattern: /(表单|问卷|调查|投票|报名|预约|登记|签到)/i,
      weight: 3,
      category: "表单场景",
    },
    {
      pattern: /(数据|图表|报表|统计|分析|可视化|监控|大屏)/i,
      weight: 3,
      category: "数据场景",
    },
    {
      pattern: /(简历|portfolio|作品集|个人主页|个人网站|名片)/i,
      weight: 3,
      category: "个人展示",
    },

    // 非技术自然语言 — 日常需求 (中权重)
    {
      pattern: /(想卖|要卖|开店|开网店|做生意|卖东西|买东西)/i,
      weight: 3,
      category: "商业需求",
    },
    {
      pattern: /(展示|宣传|推广|介绍|呈现)(我的|公司|团队|产品|服务|作品)/i,
      weight: 3,
      category: "展示需求",
    },
    {
      pattern: /(管理|记录|跟踪|追踪)(客户|员工|学生|会员|订单|库存|进度|项目)/i,
      weight: 3,
      category: "管理需求",
    },
    {
      pattern: /(收集|采集|录入)(信息|数据|反馈|意见|报名)/i,
      weight: 3,
      category: "采集需求",
    },
    {
      pattern: /(预约|排班|排课|排期|安排|计划|规划)/i,
      weight: 2,
      category: "日程需求",
    },
    {
      pattern: /(好看的|漂亮的|酷炫的|简约的|现代的|专业的|科技感)/i,
      weight: 2,
      category: "风格描述",
    },

    // 技术关键词 (中权重)
    {
      pattern: /(react|vue|angular|next|nuxt|html|css|tailwind|typescript)/i,
      weight: 2,
      category: "技术栈",
    },
    {
      pattern: /(组件|模块|布局|导航|菜单|侧边栏|header|footer|navbar)/i,
      weight: 2,
      category: "UI组件",
    },
    {
      pattern: /(按钮|输入框|下拉|弹窗|对话框|提示|卡片|列表|表格|分页)/i,
      weight: 2,
      category: "UI元素",
    },
    {
      pattern: /(api|接口|数据库|后端|前端|全栈|crud|增删改查|restful|graphql)/i,
      weight: 2,
      category: "技术实现",
    },
    {
      pattern: /(登录|注册|用户|权限|认证|身份|密码|oauth|token)/i,
      weight: 2,
      category: "用户系统",
    },
    {
      pattern: /(响应式|自适应|移动端|手机|ipad|桌面端|多设备)/i,
      weight: 2,
      category: "适配需求",
    },
    {
      pattern: /(深色模式|暗色|亮色|主题|换肤|dark\s*mode)/i,
      weight: 1,
      category: "主题需求",
    },
  ];

// ── AI工作台/问答类关键词 (weighted) ──
const AI_PATTERNS: { pattern: RegExp; weight: number; category: string }[] = [
  // 问题型开头 (高权重)
  {
    pattern:
      /^(为什么|怎么|如何|什么是|是什么|有什么|哪些|哪个|哪种|多少|几个|能不能|可不可以|应该|该怎么)/i,
    weight: 5,
    category: "提问",
  },
  {
    pattern:
      /^(what|why|how|when|where|which|who|can|could|should|would|is|are|do|does)\b/i,
    weight: 5,
    category: "提问",
  },
  { pattern: /[?？]$/, weight: 3, category: "提问" },

  // 学习/理解意图 (高权重)
  {
    pattern: /(帮我理解|帮我解释|教我|学习|了解|入门|科普|告诉我)/i,
    weight: 4,
    category: "学习",
  },
  {
    pattern: /(explain|teach|learn|understand|tutorial|guide)/i,
    weight: 4,
    category: "学习",
  },
  {
    pattern: /(原理|概念|理论|基础|知识|方法论|思想|哲学)/i,
    weight: 3,
    category: "理论知识",
  },
  {
    pattern: /(最佳实践|best\s*practice|设计模式|架构模式|惯例|规范)/i,
    weight: 3,
    category: "最佳实践",
  },

  // 代码分析/调试 (中高权重)
  {
    pattern:
      /(解释|分析|审查|review|诊断|检查)(一下|下)?(这段|这个|这份|以下)?(代码|程序|函数|方法|逻辑)/i,
    weight: 4,
    category: "代码分析",
  },
  {
    pattern:
      /(debug|调试|排查|排错|修复|修改|修正)(一下|下)?(这个|这段)?(bug|错误|问题|报错|异常)/i,
    weight: 4,
    category: "调试",
  },
  {
    pattern:
      /(优化|重构|改进|提升|改善)(一下|下)?(这段|这个|我的)?(代码|程序|函数|性能|效率)/i,
    weight: 4,
    category: "代码优化",
  },
  {
    pattern: /(比较|对比|区别|异同|差异|优劣|选择|选型)(.*)(和|与|vs|or)/i,
    weight: 3,
    category: "技术对比",
  },

  // 闲聊/咨询 (中权重)
  {
    pattern: /(聊聊|讨论|谈谈|说说|分享|想法|看法|意见|建议|方案|思路|规划)/i,
    weight: 3,
    category: "讨论咨询",
  },
  {
    pattern: /(推荐|有没有|有什么好的|给个建议|给点建议)/i,
    weight: 3,
    category: "推荐",
  },
  {
    pattern: /(文档|文章|资料|教程|视频|课程|书籍)/i,
    weight: 2,
    category: "资源查找",
  },

  // 纯概念性输入 (低权重)
  {
    pattern: /(你好|hi|hello|hey|嗨|哈喽|在吗|在不在)/i,
    weight: 2,
    category: "问候",
  },
  {
    pattern: /(谢谢|感谢|thank|thx|好的|ok|明白|懂了|收到)/i,
    weight: 1,
    category: "回应",
  },
];

// ── 语义模式匹配 ──
const SENTENCE_PATTERNS: {
  pattern: RegExp;
  bias: RouteIntent;
  weight: number;
  label: string;
}[] = [
    // "我想要一个 xxx" → 创建
    {
      pattern: /我想(要|有|拥有|得到)(一个|一套|一组)?(.{2,30})/i,
      bias: "designer",
      weight: 3,
      label: "创建意愿",
    },
    // "帮我做/弄/整 xxx" → 创建
    {
      pattern: /(帮我|替我|给我)(做|弄|整|搞|搭)(一个|个)?(.{2,30})/i,
      bias: "designer",
      weight: 4,
      label: "创建请求",
    },
    // "xxx 怎么做/实现/写" → AI对话
    {
      pattern: /(.{2,20})(怎么|如何)(做|实现|写|用|配置|部署|安装)/i,
      bias: "ai-workspace",
      weight: 3,
      label: "方法咨询",
    },
    // "xxx 是什么 / 什么是 xxx" → AI对话
    {
      pattern: /(什么是|(.{2,15})是什么)/i,
      bias: "ai-workspace",
      weight: 3,
      label: "概念查询",
    },
    // 包含代码块 → AI对话
    {
      pattern: /```[\s\S]*```/i,
      bias: "ai-workspace",
      weight: 4,
      label: "代码片段",
    },
    // "类似xxx的" / "像xxx一样" → 创建
    {
      pattern: /(类似|像|仿照|参考|模仿)(.{2,20})(一样|那|那种|的)/i,
      bias: "designer",
      weight: 3,
      label: "参考创建",
    },
    // 纯表情/非常短 → AI 工作台
    { pattern: /^.{0,3}$/i, bias: "ai-workspace", weight: 1, label: "短输入" },
  ];

function analyzeIntent(input: string): IntentResult {
  const text = input.trim();
  if (!text) {
    return {
      mode: "ai-workspace",
      confidence: 0.5,
      category: "空输入",
      summary: "请输入您的需求",
      suggestion: "描述您想做的事，我来帮您判断最佳工作方式",
    };
  }

  let designerScore = 0;
  let aiScore = 0;
  const matchedCategories: string[] = [];

  // 1) Pattern-based scoring
  for (const p of DESIGNER_PATTERNS) {
    if (p.pattern.test(text)) {
      designerScore += p.weight;
      if (!matchedCategories.includes(p.category))
        matchedCategories.push(p.category);
    }
  }
  for (const p of AI_PATTERNS) {
    if (p.pattern.test(text)) {
      aiScore += p.weight;
      if (!matchedCategories.includes(p.category))
        matchedCategories.push(p.category);
    }
  }

  // 2) Sentence structure analysis
  for (const sp of SENTENCE_PATTERNS) {
    if (sp.pattern.test(text)) {
      if (sp.bias === "designer") designerScore += sp.weight;
      else aiScore += sp.weight;
      if (!matchedCategories.includes(sp.label))
        matchedCategories.push(sp.label);
    }
  }

  // 3) Length heuristic — very short inputs lean AI
  if (text.length <= 5 && designerScore === 0 && aiScore === 0) {
    aiScore += 2;
    matchedCategories.push("简短输入");
  }

  // 4) Default: if no keywords matched, guess from overall sentence tone
  if (designerScore === 0 && aiScore === 0) {
    // Contains nouns that look like "things to build"
    if (/[页面系统应用网站平台工具网店商城]/.test(text)) {
      designerScore += 2;
      matchedCategories.push("隐含创建");
    } else {
      aiScore += 1;
      matchedCategories.push("通用对话");
    }
  }

  // Calculate
  const total = designerScore + aiScore || 1;
  const isDesigner = designerScore >= aiScore;
  const winnerScore = isDesigner ? designerScore : aiScore;
  const confidence = Math.min(
    0.98,
    0.55 + (winnerScore / total) * 0.4 + Math.min(winnerScore, 10) * 0.01,
  );

  const mode: RouteIntent = isDesigner ? "designer" : "ai-workspace";
  const category = matchedCategories.slice(0, 3).join(" · ") || "通用";

  // Generate human-readable summary and suggestion
  let summary: string;
  let suggestion: string;

  if (mode === "designer") {
    summary = `已识别为创建/构建意图`;
    suggestion = `正在进入智能编程模式，将为您生成代码和实时预览`;
    if (
      matchedCategories.includes("商业需求") ||
      matchedCategories.includes("商业场景")
    ) {
      summary = "已识别为商业应用需求";
      suggestion = "将为您搭建商业应用，包含核心业务功能";
    } else if (matchedCategories.includes("个人展示")) {
      summary = "已识别为个人展示需求";
      suggestion = "将为您设计个人展示页面";
    } else if (
      matchedCategories.includes("管理需求") ||
      matchedCategories.includes("效率工具")
    ) {
      summary = "已识别为管理/效率工具需求";
      suggestion = "将为您构建管理工具界面";
    } else if (matchedCategories.includes("数据场景")) {
      summary = "已识别为数据可视化需求";
      suggestion = "将为您构建数据展示面板";
    } else if (
      matchedCategories.includes("表单场景") ||
      matchedCategories.includes("采集需求")
    ) {
      summary = "已识别为信息采集需求";
      suggestion = "将为您构建表单/采集系统";
    }
  } else {
    summary = "已识别为咨询/对话意图";
    suggestion = "正在进入 AI 交互工作台，提供深度对话支持";
    if (
      matchedCategories.includes("代码分析") ||
      matchedCategories.includes("调试")
    ) {
      summary = "已识别为代码分析/调试需求";
      suggestion = "将为您提供代码审查和调试建议";
    } else if (matchedCategories.includes("学习")) {
      summary = "已识别为学习/理解需求";
      suggestion = "将为您提供详细解释和教程引导";
    } else if (matchedCategories.includes("推荐")) {
      summary = "已识别为方案推荐需求";
      suggestion = "将为您推荐最适合的技术方案";
    } else if (matchedCategories.includes("问候")) {
      summary = "检测到问候";
      suggestion = "进入 AI 交互工作台，开始自由对话";
    }
  }

  return { mode, confidence, category, summary, suggestion };
}

// ===================================================================
//  Data
// ===================================================================

const RECENT_PROJECTS = [
  {
    id: "proj_001",
    name: "电商仪表板",
    updatedAt: "2 小时前",
    status: "active" as const,
    panels: 6,
    thumbnail: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
  {
    id: "proj_002",
    name: "CRM 管理系统",
    updatedAt: "昨天",
    status: "active" as const,
    panels: 4,
    thumbnail: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    id: "proj_003",
    name: "数据可视化平台",
    updatedAt: "3 天前",
    status: "draft" as const,
    panels: 8,
    thumbnail: "bg-gradient-to-br from-emerald-500 to-teal-500",
  },
  {
    id: "proj_004",
    name: "用户管理后台",
    updatedAt: "1 周前",
    status: "active" as const,
    panels: 5,
    thumbnail: "bg-gradient-to-br from-orange-500 to-amber-500",
  },
  {
    id: "proj_005",
    name: "API 文档中心",
    updatedAt: "2 周前",
    status: "archived" as const,
    panels: 3,
    thumbnail: "bg-gradient-to-br from-rose-500 to-pink-500",
  },
];

const QUICK_ACTIONS = [
  { icon: Upload, label: "图片上传", shortcut: "PNG, JPG, SVG", action: "upload-image" },
  { icon: FolderOpen, label: "文件导入", shortcut: "多文件", action: "upload-file" },
  { icon: GitFork, label: "GitHub 链接", shortcut: "仓库 URL", action: "github-url" },
  { icon: PenTool, label: "Figma 文件", shortcut: ".fig", action: "figma-file" },
  { icon: Code2, label: "代码片段", shortcut: "多语言", action: "code-snippet" },
  { icon: Clipboard, label: "剪贴板", shortcut: "Ctrl+V", action: "clipboard" },
];

// ── 边栏图标定义（功能完善） ──
interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
  badge?: number;
  action: "navigate" | "section" | "drawer" | "scroll";
  target?: string; // route path for navigate
  sectionId?: string; // anchor id for scroll
  color?: string; // accent color
  description?: string; // tooltip detail
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: Home,
    label: "首页",
    id: "home",
    action: "scroll",
    sectionId: "top",
    description: "回到顶部",
  },
  {
    icon: Terminal,
    label: "智能编程",
    id: "coding",
    action: "navigate",
    target: "/ide/new",
    color: "text-sky-400",
    description: "进入 IDE 编程页面",
  },
  {
    icon: MessageSquare,
    label: "AI 工作台",
    id: "ai-workspace",
    action: "navigate",
    target: "/ai-chat",
    color: "text-amber-400",
    description: "进入 AI 对话工作台",
  },
  {
    icon: FolderOpen,
    label: "项目管理",
    id: "projects",
    action: "scroll",
    sectionId: "recent-projects",
    description: "查看/管理所有项目",
  },
  {
    icon: LayoutGrid,
    label: "模版中心",
    id: "templates",
    action: "navigate",
    target: "/templates",
    description: "浏览项目模板",
  },
  {
    icon: BookOpen,
    label: "文档中心",
    id: "docs",
    action: "navigate",
    target: "/docs",
    description: "查阅开发文档",
  },
  {
    icon: Bell,
    label: "通知中心",
    id: "notifications",
    action: "drawer",
    badge: 3,
    description: "系统通知与更新",
  },
  {
    icon: Settings,
    label: "设置",
    id: "settings",
    action: "navigate",
    target: "/settings",
    description: "全局偏好设置",
  },
  {
    icon: ImageIcon,
    label: "图标资产",
    id: "icons",
    action: "navigate",
    target: "/icons",
    color: "text-emerald-400",
    description: "YYC3 全平台图标资源",
  },
];

// ===================================================================
//  Intent Feedback Toast Component
// ===================================================================

function IntentToast({
  result,
  visible,
  onDismiss,
}: {
  result: IntentResult | null;
  visible: boolean;
  onDismiss: () => void;
}) {
  const t = useThemeTokens();
  if (!result || !visible) return null;

  const isDesigner = result.mode === "designer";
  const confidencePct = Math.round(result.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90vw] rounded-xl overflow-hidden shadow-2xl ${t.intentToast.containerBg}`}
    >
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDesigner ? t.intentToast.designerIconBg : t.intentToast.aiIconBg
              }`}
          >
            {isDesigner ? (
              <Terminal
                className={`w-3.5 h-3.5 ${t.intentToast.designerIconColor}`}
              />
            ) : (
              <Bot className={`w-3.5 h-3.5 ${t.intentToast.aiIconColor}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[0.78rem] ${t.intentToast.summaryText}`}>
              {result.summary}
            </div>
            <div className={`text-[0.65rem] ${t.intentToast.categoryText}`}>
              {result.category}
            </div>
          </div>
          <button onClick={onDismiss} className="p-1 rounded hover:bg-white/10">
            <X className={`w-3.5 h-3.5 ${t.intentToast.closeText}`} />
          </button>
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`flex-1 h-1.5 rounded-full overflow-hidden ${t.intentToast.progressBg}`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidencePct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${isDesigner
                ? t.intentToast.designerProgressGradient
                : t.intentToast.aiProgressGradient
                }`}
            />
          </div>
          <span
            className={`text-[0.65rem] tabular-nums ${t.intentToast.percentageText}`}
          >
            {confidencePct}%
          </span>
        </div>

        {/* Suggestion */}
        <div className="flex items-center gap-1.5">
          <Lightbulb
            className={`w-3 h-3 flex-shrink-0 ${t.intentToast.lightbulbColor}`}
          />
          <span className={`text-[0.7rem] ${t.intentToast.suggestionText}`}>
            {result.suggestion}
          </span>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        className={`flex items-center gap-2 px-4 py-2 border-t ${t.intentToast.bottomBorder}`}
      >
        <div className={`text-[0.65rem] ${t.intentToast.bottomText}`}>
          即将跳转至{isDesigner ? "智能编程模式" : "AI 交互工作台"}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Loader className={t.intentToast.loaderColor} />
        </div>
      </div>
    </motion.div>
  );
}

function Loader({ className }: { className?: string }) {
  return (
    <svg
      className={`w-3.5 h-3.5 animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ===================================================================
//  HomePage Component
// ===================================================================

export default function HomePage() {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithPreview | null>(null);

  const t = useThemeTokens();

  // Get active custom theme for branding elements
  const [activeTheme, setActiveTheme] = useState(getActiveTheme());

  useEffect(() => {
    setActiveTheme(getActiveTheme());
  }, []);

  // Drawer/Dialog states
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Project create wizard
  const [wizardOpen, setWizardOpen] = useState(false);

  // Project management state (rename/delete)
  const [projects, setProjects] = useState(RECENT_PROJECTS);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Intent feedback toast
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [intentVisible, setIntentVisible] = useState(false);
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // File upload refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle quick action clicks
  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case "upload-image":
        imageInputRef.current?.click();
        break;
      case "upload-file":
        fileInputRef.current?.click();
        break;
      case "github-url":
        window.open("https://github.com/new", "_blank");
        break;
      case "figma-file":
        window.open("https://www.figma.com/", "_blank");
        break;
      case "code-snippet":
        setChatInput(prev => `${prev}\n\`\`\`typescript\n// 在此粘贴代码\n\`\`\`\n`);
        setShowActions(false);
        break;
      case "clipboard":
        navigator.clipboard.readText().then(text => {
          if (text) {
            setChatInput(prev => prev + text);
          }
        }).catch(() => {
          // Clipboard access denied or failed
        });
        setShowActions(false);
        break;
    }
  }, []);

  // Live intent preview (as user types)
  const [liveIntent, setLiveIntent] = useState<IntentResult | null>(null);

  // AI-enhanced intent classification state
  const [isClassifying, setIsClassifying] = useState(false);

  // Update live intent as user types (regex — instant)
  useEffect(() => {
    if (chatInput.trim().length >= 2) {
      const result = analyzeIntent(chatInput);
      setLiveIntent(result);
    } else {
      setLiveIntent(null);
    }
  }, [chatInput]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, []);

  // ── Nav click handler ──
  const handleNavClick = useCallback(
    (item: NavItem) => {
      setActiveNav(item.id);

      switch (item.action) {
        case "navigate":
          if (item.target) {
            try {
              navigate(item.target);
            } catch {
              // Fallback: use hash-based location change for iframe environments
              window.location.hash = `#${item.target}`;
            }
          }
          break;
        case "scroll":
          try {
            if (item.sectionId === "top") {
              // In Figma iframe, scrollTo may target the wrong scrollable container
              const mainContent = document.getElementById("top");
              if (mainContent) {
                mainContent.scrollIntoView({ behavior: "smooth" });
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            } else if (item.sectionId) {
              const el = document.getElementById(item.sectionId);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }
          } catch {
            // Scroll operations may fail silently in sandboxed iframes
          }
          break;
        case "drawer":
          if (item.id === "notifications") setNotificationOpen(true);
          break;
        case "section":
          // For now just highlight; could open a modal or page section
          break;
      }
    },
    [navigate],
  );

  // ── Submit: try AI classification, fallback to regex → show toast → navigate ──
  const handleSubmit = useCallback(async () => {
    if (!chatInput.trim() || isClassifying) return;

    // Step 1: show instant regex result as initial feedback
    const regexResult = analyzeIntent(chatInput);
    setIntentResult(regexResult);
    setIntentVisible(true);
    setIsClassifying(true);

    // Step 2: concurrently attempt AI classification (with timeout)
    let finalResult = regexResult;
    try {
      const aiResult = await analyzeIntentAI(chatInput, { timeoutMs: 6000 });
      if (aiResult) {
        // AI result is available — use it (higher quality)
        finalResult = {
          mode: aiResult.mode,
          confidence: aiResult.confidence,
          category: `AI · ${aiResult.category}`,
          summary: `🧠 ${aiResult.summary}`,
          suggestion: aiResult.suggestion,
        };
        setIntentResult(finalResult);
      }
      // If aiResult is null, keep regex result
    } catch {
      // AI call failed silently — keep regex result
    }

    setIsClassifying(false);

    const target = finalResult.mode === "designer" ? "/ide/new" : "/ai-chat";

    // Brief feedback delay (600ms) so user sees the final classification
    navigateTimerRef.current = setTimeout(() => {
      navigate(target, {
        state: {
          prompt: chatInput,
          mode: finalResult.mode,
          confidence: finalResult.confidence,
          category: finalResult.category,
        },
      });
    }, 600);
  }, [chatInput, navigate, isClassifying]);

  const dismissToast = useCallback(() => {
    setIntentVisible(false);
    if (navigateTimerRef.current) {
      clearTimeout(navigateTimerRef.current);
      navigateTimerRef.current = null;
    }
  }, []);

  const handleProjectClick = (projectId: string) => {
    navigate(`/ide/${projectId}`);
  };

  const handleProjectRename = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setRenamingId(projectId);
      setRenameValue(project.name);
    }
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  const handleRenameConfirm = () => {
    if (renamingId && renameValue.trim()) {
      setProjects(
        projects.map((p) =>
          p.id === renamingId ? { ...p, name: renameValue.trim() } : p,
        ),
      );
      setRenamingId(null);
      setRenameValue("");
    }
  };

  return (
    <div
      className={`size-full min-h-screen bg-[var(--background)] flex ${t.home.cyberGlitchClass ? "cyber-grid" : ""}`}
      onClick={() => {
        setContextMenu(null);
        setShowActions(false);
      }}
    >
      {/* ===== Left Sidebar Icon Rail ===== */}
      <div className="fixed left-0 top-0 bottom-0 z-40">
        <div
          className={`w-[52px] h-screen flex flex-col items-center py-3 ${t.page.sidebarBg} ${t.page.sidebarBorder} backdrop-blur-md`}
        >
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-5 cursor-pointer overflow-hidden">
            <img src={yyc3Logo} alt="YYC³" className="w-8 h-8 object-contain" />
          </div>

          {/* Nav items */}
          <nav className="flex flex-col items-center gap-0.5 flex-1 min-h-0 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isActive ? t.page.navActive : t.page.navInactive
                      }`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${isActive && item.color ? item.color : ""}`}
                    />
                    {item.badge && (
                      <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-white text-[0.45rem] rounded-full flex items-center justify-center ${t.status.errorBg}`}>
                        {item.badge}
                      </span>
                    )}
                    {/* Action indicator dot for navigate items */}
                    {item.action === "navigate" && (
                      <span
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${t.home.navDot}`}
                      />
                    )}
                  </button>

                  {/* Tooltip */}
                  <div
                    className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap ${t.page.tooltipBg} border ${t.page.tooltipBorder} ${t.page.tooltipShadow} rounded-lg px-2.5 py-1.5`}
                  >
                    <div className={`text-[0.72rem] ${t.text.primary}`}>
                      {item.label}
                    </div>
                    {item.description && (
                      <div className={`text-[0.6rem] mt-0.5 ${t.text.muted}`}>
                        {item.description}
                      </div>
                    )}
                    {item.action === "navigate" && (
                      <div
                        className={`flex items-center gap-1 mt-1 text-[0.55rem] ${t.text.accent}`}
                      >
                        <ChevronRight className="w-2.5 h-2.5" />
                        <span>点击跳转</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="flex flex-col items-center gap-1 mt-auto">
            <ThemeSwitcher compact layout="vertical" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer mt-1 ${t.gradients.avatar}`}
            >
              <User className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col ml-[52px]">
        <div
          className="flex-1 flex flex-col items-center justify-center px-4 pb-8"
          id="top"
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden">
                {activeTheme?.branding?.logo?.dataUrl ? (
                  <img
                    src={activeTheme.branding.logo.dataUrl}
                    alt="Logo"
                    className="w-14 h-14 object-contain"
                    style={{
                      opacity: activeTheme.branding.logo.opacity / 100,
                    }}
                  />
                ) : (
                  <img
                    src={yyc3Logo}
                    alt="YYC³"
                    className="w-14 h-14 object-contain"
                  />
                )}
              </div>
              <h1
                className={`text-[2.2rem] tracking-tight bg-clip-text text-transparent ${t.gradients.title} ${t.home.cyberGlitchClass}`}
                data-text={activeTheme?.branding?.title?.appName || "YYC³ Family AI"}
              >
                {activeTheme?.branding?.title?.appName || "YYC³ Family AI"}
              </h1>
            </div>
            <p className={`text-[0.95rem] ${t.text.tertiary}`}>
              {activeTheme?.branding?.slogan?.primary || "言启象限 | 语枢未来"}
            </p>
            <p className={`text-[0.78rem] mt-1 ${t.text.caption}`}>
              {activeTheme?.branding?.slogan?.secondary || "Words Initiate Quadrants, Language Serves as Core for Future"}
            </p>
          </motion.div>

          {/* Chat Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <div
              className={`relative rounded-2xl overflow-hidden home-chat-box ${t.home.chatBoxBg}`}
            >
              {/* Quick actions panel */}
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`border-b p-3 ${t.home.actionsBorder}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAction(action.action);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] ${t.home.actionBtnHover}`}
                      >
                        <action.icon
                          className={`w-4 h-4 ${t.home.actionIcon} transition-transform`}
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-[0.8rem] ${t.home.actionLabel}`}
                          >
                            {action.label}
                          </div>
                          <div
                            className={`text-[0.7rem] ${t.home.actionShortcut}`}
                          >
                            {action.shortcut}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Hidden file inputs */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        Array.from(e.target.files).forEach(file => {
                          setChatInput(prev => `${prev}[图片: ${file.name}] `);
                        });
                      }
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        Array.from(e.target.files).forEach(file => {
                          setChatInput(prev => `${prev}[文件: ${file.name}] `);
                        });
                      }
                    }}
                  />
                </motion.div>
              )}

              {/* Input area */}
              <div className="flex items-end gap-2 p-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${t.home.plusBtn}`}
                >
                  <Plus className={`w-4 h-4 ${t.home.plusIcon} transition-transform`} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="描述你想创建的应用，或问我任何问题..."
                    className={`w-full resize-none bg-transparent border-0 outline-none text-[0.95rem] py-3 px-1 max-h-48 min-h-[52px] ${t.home.textareaText}`}
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!chatInput.trim() || isClassifying}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 ${t.home.submitBtn}`}
                >
                  {isClassifying ? (
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              {/* Live intent indicator (as user types) */}
              <AnimatePresence>
                {liveIntent && chatInput.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`border-t px-4 py-2 flex items-center gap-2 ${t.home.liveIntentBorder}`}
                  >
                    <Info
                      className={`w-3 h-3 flex-shrink-0 ${t.home.liveIntentIcon}`}
                    />
                    <span className={`text-[0.68rem] ${t.home.liveIntentText}`}>
                      {liveIntent.mode === "designer" ? "🛠 " : "💬 "}
                      {liveIntent.summary}
                    </span>
                    <div className="flex-1" />
                    <span
                      className={`text-[0.6rem] px-1.5 py-0.5 rounded-full ${liveIntent.mode === "designer"
                        ? t.home.designerBadge
                        : t.home.aiBadge
                        }`}
                    >
                      {liveIntent.mode === "designer" ? "编程模式" : "对话模式"}
                    </span>
                    <span
                      className={`text-[0.58rem] tabular-nums ${t.home.liveIntentConfidence}`}
                    >
                      {Math.round(liveIntent.confidence * 100)}%
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Feature highlights */}
            <div className="flex items-center justify-center gap-4 mt-4">
              {[
                { icon: Sparkles, label: "AI 智能生成" },
                { icon: Zap, label: "多联式布局" },
                { icon: Bot, label: "实时预览" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 text-[0.75rem] ${t.home.featureText}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Quick entry buttons */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => {
                  setWizardOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[0.8rem] transition-all duration-200 hover:scale-105 active:scale-95 ${t.home.newProjectBtn}`}
              >
                {wizardOpen ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{wizardOpen ? "加载中..." : "新建项目"}</span>
              </button>
              <button
                onClick={() =>
                  navigate("/ide/new", { state: { mode: "designer" } })
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[0.8rem] transition-all duration-200 hover:scale-105 active:scale-95 ${t.home.codingBtn}`}
              >
                <Terminal className="w-4 h-4" />
                <span>直接进入编程</span>
              </button>
              <button
                onClick={() => navigate("/ai-chat")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[0.8rem] transition-all duration-200 hover:scale-105 active:scale-95 ${t.home.aiChatBtn}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI 自由对话</span>
              </button>
            </div>
          </motion.div>

          {/* Featured App Templates Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="w-full max-w-3xl mt-16"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${t.text.accent}`} />
                <span className={`text-[0.85rem] ${t.text.primary}`}>
                  轻量应用模板
                </span>
              </div>
              <button
                onClick={() => navigate("/templates")}
                className={`flex items-center gap-1.5 text-[0.8rem] transition-colors ${t.text.accent}`}
              >
                <span>查看全部</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 合并：模版 + 最近项目 → 一排 */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
              {APP_TEMPLATES.slice(0, 6).map((tpl, i) => (
                <motion.div
                  key={tpl.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`flex-shrink-0 w-36 rounded-xl overflow-hidden cursor-pointer group home-project-card ${t.page.cardBgAlt} border ${t.page.cardBorder} snap-start`}
                >
                  <div
                    className={`h-14 bg-gradient-to-br ${tpl.gradient} flex items-center justify-center relative`}
                  >
                    <tpl.icon className="w-5 h-5 text-white/50" />
                    {tpl.previewCode && (
                      <span className="absolute top-1 right-1 text-[0.5rem] px-1 py-px rounded bg-white/20 text-white/90 backdrop-blur-sm font-medium">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className={`text-[0.7rem] truncate font-medium ${t.text.primary}`}>
                      {tpl.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      {tpl.difficulty && (
                        <span className={`text-[0.5rem] px-1 py-px rounded-full ${tpl.difficulty === "beginner" ? "bg-emerald-400/15 text-emerald-400" :
                          tpl.difficulty === "intermediate" ? "bg-amber-400/15 text-amber-400" :
                            "bg-rose-400/15 text-rose-400"
                          }`}>
                          {tpl.difficulty === "beginner" ? "入门" : tpl.difficulty === "intermediate" ? "中级" : "高级"}
                        </span>
                      )}
                      <span className={`text-[0.55rem] ${t.text.muted}`}>
                        {tpl.estimatedTime}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -3 }}
                  className={`flex-shrink-0 w-36 rounded-xl overflow-hidden cursor-pointer group home-project-card ${t.page.cardBgAlt} border ${t.page.cardBorder} snap-start`}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div
                    className={`h-14 ${project.thumbnail} flex items-center justify-center`}
                  >
                    <Layers className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-[0.7rem] truncate ${t.text.primary}`}>
                        {project.name}
                      </h3>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${project.status === "active"
                        ? t.status.successBg
                        : project.status === "draft"
                          ? t.status.warningBg
                          : t.status.infoBg
                        }`} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[0.6rem] ${t.text.muted}`}>
                        {project.updatedAt}
                      </span>
                      <span className={`text-[0.6rem] ${t.text.muted}`}>
                        {project.panels} 面板
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* 查看全部 */}
              <button
                onClick={() => navigate("/templates")}
                className={`flex-shrink-0 w-36 rounded-xl border border-dashed ${t.page.cardBorder} flex flex-col items-center justify-center gap-1 hover:bg-white/[0.02] transition-all ${t.text.muted}`}
              >
                <Plus className="w-5 h-5" />
                <span className="text-[0.65rem]">查看更多</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className={`fixed rounded-lg shadow-xl py-1 z-50 min-w-[140px] ${t.page.tooltipBg} border ${t.page.tooltipBorder}`}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { icon: ExternalLink, label: "打开项目" },
              { icon: Pencil, label: "重命名" },
              { icon: Trash2, label: "删除", danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.label === "打开项目")
                    handleProjectClick(contextMenu.id);
                  else if (item.label === "重命名")
                    handleProjectRename(contextMenu.id);
                  else if (item.label === "删除")
                    handleProjectDelete(contextMenu.id);
                  setContextMenu(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[0.8rem] transition-colors ${"danger" in item && item.danger
                  ? t.home.ctxMenuDanger
                  : t.home.ctxMenuNormal
                  }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Project Rename Dialog */}
        {renamingId && (
          <div
            className={`fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50`}
            onClick={() => setRenamingId(null)}
          >
            <div
              className={`w-full max-w-2xl rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-lg p-6 ${t.home.renameDialogBg}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-[1rem] ${t.text.primary}`}>重命名项目</h3>
                <button
                  onClick={() => setRenamingId(null)}
                  className={`p-1 rounded hover:bg-white/10 ${t.text.muted}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="输入新名称..."
                  className={`w-full px-3 py-2 rounded-lg border outline-none ${t.page.inputBorder} ${t.page.inputBg} ${t.page.inputText} ${t.page.inputPlaceholder}`}
                />
                <button
                  onClick={handleRenameConfirm}
                  className={`px-4 py-2 rounded-lg text-[0.8rem] transition-all ${t.home.renameConfirmBtn}`}
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}

        <footer
          className={`text-center py-4 text-[0.7rem] opacity-60 ${t.text.caption}`}
        >
          {activeTheme?.branding?.footer || "YanYuCloudCube · 万象归元于云枢 | 深栈智启新纪元"}
        </footer>
      </div>

      {/* Intent feedback toast */}
      <AnimatePresence>
        {intentVisible && (
          <IntentToast
            result={intentResult}
            visible={intentVisible}
            onDismiss={dismissToast}
          />
        )}
      </AnimatePresence>

      {/* Notification Drawer */}
      <NotificationDrawer
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Share Dialog */}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />

      {/* Project Create Wizard */}
      <ProjectCreateWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUse={(tpl) => {
            navigate("/ide/new", {
              state: { template: tpl.id, templateName: tpl.name },
            });
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}
