/**
 * @file: routes.ts
 * @description: 应用路由配置，基于 react-router 数据模式，支持懒加载，
 *              自动检测 iframe 环境选择 Hash/Browser 路由
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.3.0
 * @created: 2026-03-06
 * @updated: 2026-03-18
 * @status: dev
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: routes,navigation,lazy-loading,iframe-detection
 */

import { createElement, lazy, Suspense } from "react";
import { createHashRouter, type RouteObject } from "react-router";
import HomePage from "./components/HomePage";
import { LoadingSpinner } from "./components/ide/LoadingSpinner";
import { errorReporting } from "./components/ide/services/ErrorReportingService";
import NotFoundPage from "./components/NotFoundPage";
import RouteErrorFallback from "./components/RouteErrorFallback";

// ── 路由懒加载 — 减少首屏 bundle 体积 ──
const IDEPage = lazy(() => import("./components/IDEPage"));
const AIChatPage = lazy(() => import("./components/AIChatPage"));
const ChatPage = lazy(() => import("./components/ChatPage"));
const TemplatesPage = lazy(() => import("./components/TemplatesPage"));
const DocsPage = lazy(() => import("./components/DocsPage"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));
const IconAssetsPage = lazy(() => import("./components/IconAssetsPage"));

// ── 懒加载组件包装器 ──
function withSuspense(Component: React.LazyExoticComponent<React.ComponentType<any>>) {
  return function SuspenseWrapper(props: any) {
    return createElement(
      Suspense,
      { fallback: createElement(LoadingSpinner) },
      createElement(Component, props)
    );
  };
}

/**
 * 路由导航面包屑采集 loader — 在每次路由切换时自动记录导航事件，
 * 供 ErrorReportingService 在错误上报时附带用户操作轨迹
 */
function navigationBreadcrumbLoader(routePath: string, routeLabel: string) {
  return ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    errorReporting.addBreadcrumb({
      type: "navigation",
      category: "route",
      message: `导航至 ${routeLabel} (${routePath})`,
      data: {
        from: document.referrer || undefined,
        to: url.pathname + url.hash,
        route: routePath,
      },
    });
    return null;
  };
}

const errorElement = createElement(RouteErrorFallback);

const routes: RouteObject[] = [
  {
    path: "/",
    Component: HomePage,
    errorElement,
    loader: navigationBreadcrumbLoader("/", "首页"),
  },
  {
    path: "/ide",
    Component: withSuspense(IDEPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/ide", "IDE"),
  },
  {
    path: "/ide/:projectId",
    Component: withSuspense(IDEPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/ide/:projectId", "IDE 项目"),
  },
  {
    path: "/ai-chat",
    Component: withSuspense(AIChatPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/ai-chat", "AI 对话"),
  },
  {
    path: "/chat",
    Component: withSuspense(ChatPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/chat", "富文本对话"),
  },
  {
    path: "/templates",
    Component: withSuspense(TemplatesPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/templates", "模板中心"),
  },
  {
    path: "/docs",
    Component: withSuspense(DocsPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/docs", "文档中心"),
  },
  {
    path: "/settings",
    Component: withSuspense(SettingsPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/settings", "设置"),
  },
  {
    path: "/icons",
    Component: withSuspense(IconAssetsPage),
    errorElement,
    loader: navigationBreadcrumbLoader("/icons", "图标资源"),
  },
  // ── 404 catch-all ──
  {
    path: "*",
    Component: NotFoundPage,
    errorElement,
    loader: navigationBreadcrumbLoader("*", "未知页面"),
  },
];

// Always use hash-based routing — this app runs inside Figma's iframe
// where the History API triggers IframeMessageAbortError on navigation.
export const router = createHashRouter(routes);
