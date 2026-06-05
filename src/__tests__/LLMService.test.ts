/**
 * @file: LLMService.test.ts
 * @description: LLM 服务测试 - 测试 LLM API 调用、流式响应和错误处理
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.0.0
 * @created: 2026-04-01
 * @status: dev
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: test,vitest,unit-test
 */

// @ts-nocheck
// ================================================================
// LLMService 单元测试
// 覆盖: API Key 管理、Ollama 探测、连通性测试、聊天完成、代码提取、意图分析
// ================================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getApiKey,
  setApiKey,
  hasApiKey,
  detectOllama,
  testModelConnectivity,
  chatCompletion,
  extractCodeBlock,
  getProviderConfigs,
  type ProviderConfig,
  type ProviderId,
} from "../app/components/ide/LLMService";

// ── Helper: 创建 mock Response ──
function mockFetchResponse(body: any, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Headers(),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    clone: () => mockFetchResponse(body, status),
    formData: () => Promise.resolve(new FormData()),
    redirected: false,
    type: "basic" as ResponseType,
    url: "",
    bytes: () => Promise.resolve(new Uint8Array()),
  } as Response;
}

// ================================================================
// 1. API Key 存储管理
// ================================================================

describe("API Key 管理", () => {
  it("getApiKey — 未设置时返回空字符串", () => {
    expect(getApiKey("openai")).toBe("");
  });

  it("setApiKey + getApiKey — 正常存取", () => {
    setApiKey("openai", "sk-test-123");
    expect(getApiKey("openai")).toBe("sk-test-123");
  });

  it("setApiKey 空字符串 — 删除 key", () => {
    setApiKey("zhipu", "zhipu-key-abc");
    expect(getApiKey("zhipu")).toBe("zhipu-key-abc");
    setApiKey("zhipu", "");
    expect(getApiKey("zhipu")).toBe("");
  });

  it("hasApiKey — 正确反映存在状态", () => {
    expect(hasApiKey("deepseek")).toBe(false);
    setApiKey("deepseek", "ds-key");
    expect(hasApiKey("deepseek")).toBe(true);
  });

  it("不同 Provider 的 key 互不干扰", () => {
    setApiKey("openai", "openai-key");
    setApiKey("zhipu", "zhipu-key");
    expect(getApiKey("openai")).toBe("openai-key");
    expect(getApiKey("zhipu")).toBe("zhipu-key");
    expect(getApiKey("deepseek")).toBe("");
  });
});

// ================================================================
// 2. getProviderConfigs 静态配置验证
// ================================================================

describe("getProviderConfigs 验证", () => {
  it("包含 2 个 Provider (zai-plan + ollama)", () => {
    const configs = getProviderConfigs();
    const ids = configs.map((p) => p.id);
    expect(ids).toContain("zai-plan");
    expect(ids).toContain("ollama");
    expect(configs).toHaveLength(2);
  });

  it("Ollama 为本地 provider、无需 auth、无预设模型", () => {
    const configs = getProviderConfigs();
    const ollama = configs.find((p) => p.id === "ollama")!;
    expect(ollama.isLocal).toBe(true);
    expect(ollama.authType).toBe("none");
    expect(ollama.models).toHaveLength(2); // yyc3-merged-v3 + qwen3-coder-30b 预设模型
  });

  it("Zai-Plan 需要 bearer auth 且有 3 个模型", () => {
    const configs = getProviderConfigs();
    const zaiPlan = configs.find((p) => p.id === "zai-plan")!;
    expect(zaiPlan.authType).toBe("bearer");
    expect(zaiPlan.isLocal).toBe(false);
    expect(zaiPlan.models.length).toBeGreaterThan(0);
    expect(zaiPlan.models).toHaveLength(3); // GLM-5, GLM-5.1, GLM-4.7
  });

  it("Zai-Plan 模型字段有效", () => {
    const configs = getProviderConfigs();
    const zaiPlan = configs.find((p) => p.id === "zai-plan")!;
    for (const model of zaiPlan.models) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(["llm"]).toContain(model.type);
      expect(model.maxTokens).toBeGreaterThan(0);
    }
  });

  it("每次调用返回新实例，互不影响", () => {
    const a = getProviderConfigs();
    const b = getProviderConfigs();
    expect(a).not.toBe(b);
    a[0].name = "MUTATED";
    expect(b[0].name).not.toBe("MUTATED");
  });

  it("Zai-Plan 包含 GLM-5 / GLM-5.1 / GLM-4.7 三个模型 ID", () => {
    const zaiPlan = getProviderConfigs().find((p) => p.id === "zai-plan")!;
    const ids = zaiPlan.models.map((m) => m.id);
    expect(ids).toEqual(expect.arrayContaining(["glm-5", "glm-5.1", "glm-4.7"]));
  });

  it("Ollama detected 标记为 true，表示需要运行时检测", () => {
    const ollama = getProviderConfigs().find((p) => p.id === "ollama")!;
    expect(ollama.detected).toBe(true);
  });

  it("Zai-Plan detected 标记为 false，无需运行时检测", () => {
    const zaiPlan = getProviderConfigs().find((p) => p.id === "zai-plan")!;
    expect(zaiPlan.detected).toBe(false);
  });

  it("所有 Provider 的 contextWindow 为有效正整数", () => {
    const configs = getProviderConfigs();
    for (const p of configs) {
      for (const m of p.models) {
        if (m.contextWindow !== undefined) {
          expect(m.contextWindow).toBeGreaterThan(0);
          expect(Number.isInteger(m.contextWindow)).toBe(true);
        }
      }
    }
  });

  it("Zai-Plan 的 baseUrl 包含 bigmodel.cn 域名", () => {
    const zaiPlan = getProviderConfigs().find((p) => p.id === "zai-plan")!;
    expect(zaiPlan.baseUrl).toContain("bigmodel.cn");
  });

  it("Ollama 的 baseUrl 指向 localhost", () => {
    const ollama = getProviderConfigs().find((p) => p.id === "ollama")!;
    expect(ollama.baseUrl).toContain("localhost");
  });
});

// ================================================================
// 2b. getProviderConfig 单项查询边界测试
// ================================================================

describe("getProviderConfig 单项查询", () => {
  it("查询 zai-plan 返回有效配置", async () => {
    const { getProviderConfig } = await import("../app/components/ide/LLMService");
    const config = getProviderConfig("zai-plan");
    expect(config).toBeDefined();
    expect(config!.id).toBe("zai-plan");
  });

  it("查询 ollama 返回有效配置", async () => {
    const { getProviderConfig } = await import("../app/components/ide/LLMService");
    const config = getProviderConfig("ollama");
    expect(config).toBeDefined();
    expect(config!.id).toBe("ollama");
  });
});

// ================================================================
// 3. detectOllama — 本地探测
// ================================================================

describe("detectOllama", () => {
  it("Ollama 在线 — 返回模型列表", async () => {
    const mockModels = {
      models: [
        {
          name: "llama3.1:8b",
          model: "llama3.1:8b",
          details: { family: "llama", parameter_size: "8B" },
        },
        {
          name: "deepseek-coder:6.7b",
          model: "deepseek-coder:6.7b",
          details: { family: "deepseek" },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse(mockModels));

    const result = await detectOllama();
    expect(result.available).toBe(true);
    expect(result.models).toHaveLength(2);
    expect(result.models[0].id).toBe("llama3.1:8b");
    expect(result.models[0].type).toBe("llm");
    expect(result.models[1].type).toBe("code"); // deepseek-coder 应被检测为 code 类型
  });

  it("Ollama 离线 — 返回不可用", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Connection refused"));

    const result = await detectOllama();
    expect(result.available).toBe(false);
    expect(result.models).toHaveLength(0);
  });

  it("Ollama 返回非 200 — 返回不可用", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, 500));

    const result = await detectOllama();
    expect(result.available).toBe(false);
    expect(result.models).toHaveLength(0);
  });

  it("Ollama 返回空模型列表 — 可用但无模型", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ models: [] }));

    const result = await detectOllama();
    expect(result.available).toBe(true);
    expect(result.models).toHaveLength(0);
  });
});

// ================================================================
// 4. testModelConnectivity — 连通性测试
// ================================================================

describe("testModelConnectivity", () => {
  const zaiPlanConfig = getProviderConfigs().find((p) => p.id === "zai-plan")!;

  it("无 API Key — 立即返回 NO_API_KEY 错误", async () => {
    const result = await testModelConnectivity(zaiPlanConfig, "glm-5");
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("NO_API_KEY");
    expect(result.providerId).toBe("zai-plan");
    expect(result.modelId).toBe("glm-5");
  });

  it("有 API Key 且连通成功", async () => {
    setApiKey("zai-plan", "test-key");

    const mockResponse = {
      choices: [{ message: { content: "Hello!" } }],
    };
    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse(mockResponse));

    const result = await testModelConnectivity(zaiPlanConfig, "glm-5");
    expect(result.success).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.reply).toBe("Hello!");
    expect(result.error).toBeUndefined();
  });

  it("HTTP 401 — 认证失败", async () => {
    setApiKey("zai-plan", "bad-key");

    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse({ error: { message: "Invalid API key" } }, 401),
    );

    const result = await testModelConnectivity(zaiPlanConfig, "glm-5");
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("HTTP_401");
    expect(result.error).toContain("认证失败");
  });

  it("HTTP 404 — 模型不存在", async () => {
    setApiKey("zai-plan", "test");

    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, 404));

    const result = await testModelConnectivity(zaiPlanConfig, "glm-nonexist");
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("HTTP_404");
    expect(result.error).toContain("glm-nonexist");
  });

  it("HTTP 429 — 频率超限", async () => {
    setApiKey("zai-plan", "test");

    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, 429));

    const result = await testModelConnectivity(zaiPlanConfig, "glm-5");
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("HTTP_429");
    expect(result.error).toContain("频率超限");
  });

  it("HTTP 500 — 服务端错误", async () => {
    setApiKey("zai-plan", "test");

    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, 500));

    const result = await testModelConnectivity(zaiPlanConfig, "glm-5");
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("HTTP_500");
    expect(result.error).toContain("服务端错误");
  });

  it("网络错误 — NETWORK 错误码", async () => {
    setApiKey("zai-plan", "test");

    vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to fetch"));

    const result = await testModelConnectivity(zaiPlanConfig, "glm-5");
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("NETWORK");
    expect(result.error).toContain("网络连接失败");
  });

  it("超时 — TIMEOUT 错误码", async () => {
    setApiKey("zai-plan", "test");

    const abortError = new DOMException("Aborted", "AbortError");
    vi.mocked(fetch).mockRejectedValueOnce(abortError);

    const result = await testModelConnectivity(zaiPlanConfig, "glm-5", {
      timeoutMs: 1000,
    });
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("TIMEOUT");
  });

  it("Ollama provider — 无需 API Key", async () => {
    const ollamaConfig = getProviderConfigs().find((p) => p.id === "ollama")!;

    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse({ message: { content: "Hi there!" } }),
    );

    const result = await testModelConnectivity(ollamaConfig, "llama3.1:8b");
    expect(result.success).toBe(true);
    expect(result.reply).toBe("Hi there!");
  });

  it("结果包含 timestamp", async () => {
    const ollamaConfig = getProviderConfigs().find((p) => p.id === "ollama")!;
    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse({ message: { content: "" } }),
    );

    const before = Date.now();
    const result = await testModelConnectivity(ollamaConfig, "test");
    expect(result.timestamp).toBeGreaterThanOrEqual(before);
  });
});

// ================================================================
// 5. chatCompletion — 非流式调用
// ================================================================

describe("chatCompletion", () => {
  it("OpenAI 格式 — 正确解析 choices 响应 (Zai-Plan)", async () => {
    setApiKey("zai-plan", "test-key");
    const config = getProviderConfigs().find((p) => p.id === "zai-plan")!;

    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse({
        choices: [{ message: { content: "Generated code here" } }],
      }),
    );

    const result = await chatCompletion(config, "glm-5", [
      { role: "user", content: "Write hello world" },
    ]);
    expect(result).toBe("Generated code here");
  });

  it("Ollama 格式 — 正确解析 message.content 响应", async () => {
    const config = getProviderConfigs().find((p) => p.id === "ollama")!;

    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse({ message: { content: "Ollama reply" } }),
    );

    const result = await chatCompletion(config, "llama3.1:8b", [
      { role: "user", content: "Hello" },
    ]);
    expect(result).toBe("Ollama reply");
  });

  it("API 错误 — 抛出带 provider 名称的 Error (Zai-Plan)", async () => {
    setApiKey("zai-plan", "test-key");
    const config = getProviderConfigs().find((p) => p.id === "zai-plan")!;

    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse("Rate limit exceeded", 429),
    );

    await expect(
      chatCompletion(config, "glm-5", [
        { role: "user", content: "test" },
      ]),
    ).rejects.toThrow(/Z.ai/);
  });

  it("支持自定义 temperature 和 maxTokens", async () => {
    setApiKey("zai-plan", "test-key");
    const config = getProviderConfigs().find((p) => p.id === "zai-plan")!;

    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse({ choices: [{ message: { content: "ok" } }] }),
    );

    await chatCompletion(
      config,
      "glm-5",
      [{ role: "user", content: "test" }],
      {
        temperature: 0.2,
        maxTokens: 1024,
      },
    );

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.temperature).toBe(0.2);
    expect(body.max_tokens).toBe(1024);
  });
});

// ================================================================
// 6. extractCodeBlock — 代码块提取
// ================================================================

describe("extractCodeBlock", () => {
  it("提取带语言标记的代码块", () => {
    const text = "Here is the code:\n```typescript\nconst x = 1\n```\nDone.";
    const result = extractCodeBlock(text);
    expect(result).not.toBeNull();
    expect((result as any).lang).toBe("typescript");
    expect((result as any).code).toBe("const x = 1");
  });

  it("无语言标记 — 默认 tsx", () => {
    const text = "```\nconst y = 2\n```";
    const result = extractCodeBlock(text);
    expect(result).not.toBeNull();
    expect((result as any).lang).toBe("tsx");
    expect((result as any).code).toBe("const y = 2");
  });

  it("无代码块 — 返回 null", () => {
    const text = "No code block here";
    expect(extractCodeBlock(text)).toBeNull();
  });

  it("多行代码块 — 正确提取", () => {
    const text = "```jsx\nfunction App() {\n  return <div>Hello</div>\n}\n```";
    const result = extractCodeBlock(text);
    expect((result as any).lang).toBe("jsx");
    expect((result as any).code).toContain("function App()");
    expect((result as any).code).toContain("return <div>Hello</div>");
  });

  it("多个代码块 — 提取第一个", () => {
    const text =
      '```python\nprint("hello")\n```\n\n```javascript\nconsole.log("world")\n```';
    const result = extractCodeBlock(text);
    expect((result as any).lang).toBe("python");
    expect((result as any).code).toContain("print");
  });
});
