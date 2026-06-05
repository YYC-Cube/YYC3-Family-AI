import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-window": path.resolve(__dirname, "./src/__mocks__/react-window.ts"),
      "pg": path.resolve(__dirname, "./src/__tests__/mocks/empty-module.ts"),
      "mysql2": path.resolve(__dirname, "./src/__tests__/mocks/empty-module.ts"),
      "mysql2/promise": path.resolve(__dirname, "./src/__tests__/mocks/empty-module.ts"),
      "better-sqlite3": path.resolve(__dirname, "./src/__tests__/mocks/empty-module.ts"),
      "node-pty": path.resolve(__dirname, "./src/__tests__/mocks/empty-module.ts"),
      "sql.js": path.resolve(__dirname, "./src/__tests__/mocks/empty-module.ts"),
      "child_process": path.resolve(__dirname, "./src/__tests__/mocks/empty-module.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    globalSetup: ["./src/__tests__/global-setup.ts"],
    deps: {
      interopDefault: true,
    },
    include: [
      "src/__tests__/**/*.test.{ts,tsx}",
      "src/services/**/__tests__/**/*.test.{ts,tsx}",
      "src/app/components/ide/**/__tests__/**/*.test.{ts,tsx}",
      "src/app/components/ide/stores/**/__tests__/**/*.test.{ts,tsx}",
      "src/app/components/**/__tests__/**/*.test.{ts,tsx}",
      "src/app/components/ide/services/__tests__/**/*.test.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",

      // ── 覆盖率阈值（YYC³ CI/CD门禁对齐）──────────────
      // 与 .github/workflows/quality-gate.yml 阈值保持一致
      thresholds: {
        statements: 38,
        branches: 26,
        functions: 33,
        lines: 40,

        'src/app/components/ide/services/**': {
          statements: 30,
          branches: 26,
          functions: 30,
          lines: 29,
        },

        // AI模块 - 高标准维持
        'src/app/components/ide/ai/**': {
          statements: 90,
          branches: 78,
          functions: 94,
          lines: 91,
        },

        // Settings组件 - 已补全测试
        'src/app/components/ide/settings/**': {
          statements: 35,
          branches: 30,
          functions: 33,
          lines: 35,
        },

        // Hooks - 已补全测试
        'src/app/components/ide/hooks/**': {
          statements: 25,
          branches: 18,
          functions: 22,
          lines: 2,
        },

        'src/app/components/ide/config/**': {
          statements: 2,
          branches: 0,
          functions: 0,
          lines: 2,
        },
      },

      include: ["src/app/**/*.{ts,tsx}"],
      exclude: [
        "src/__tests__/**",
        "src/imports/**",
        "src/app/components/figma/**",
        "src/app/components/ui/**",
        "src/app/core/**",
        "src/app/examples/**",
        "node_modules/**",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/types/**",
        // 临时排除（待后续补全测试）
        'src/app/components/settings/**',
        'src/app/components/ide/storage/**',
        'src/app/components/ide/plugins/**',
        'src/app/components/ide/components/**',
        'src/app/components/ide/factory/**',
        'src/app/components/ide/di/**',
        'src/app/components/ide/examples/**',
        'src/app/components/ide/bridge/**',
      ],

      // ── 增强报告选项 ────────────────────────────────
      reportOnFailure: true,  // CI失败时输出详细报告
    },
  },
})
