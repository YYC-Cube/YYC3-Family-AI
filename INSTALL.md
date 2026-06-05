# 📦 YYC³ Family AI 安装指南

> **极简安装，3步启动！**

## 🚀 快速开始（推荐）

### 前置要求

- **Node.js** >= 18.x ([下载](https://nodejs.org/))
- **pnpm** >= 8.x (推荐) 或 npm
- **Git** ([下载](https://git-scm.com/))

### 一键安装

```bash
# 1. 克隆仓库
git clone https://github.com/YanYuCloudCube/YYC3-Family-AI.git
cd YYC3-Family-AI

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
```

🎉 **完成！** 访问 http://localhost:5173 即可使用

---

## 🔧 详细安装步骤

### 1. 环境准备

```bash
# 检查 Node.js 版本（需要 >= 18）
node --version  # v18.x.x 或更高

# 检查 pnpm 版本
pnpm --version  # 8.x.x 或更高

# 如果没有安装 pnpm
npm install -g pnpm
```

### 2. 克隆项目

```bash
# 使用 HTTPS（推荐）
git clone https://github.com/YanYuCloudCube/YYC3-Family-AI.git

# 或者使用 SSH（需要配置 SSH Key）
git clone git@github.com:YanYuCloudCube/YYC3-Family-AI.git

# 进入项目目录
cd YYC3-Family-AI
```

### 3. 安装依赖

```bash
# 使用 pnpm（推荐，速度更快）
pnpm install

# 或者使用 npm
npm install

# 或者使用 yarn
yarn install
```

### 4. 启动开发模式

```bash
# 启动开发服务器（热重载）
pnpm dev

# 服务器将在 http://localhost:5173 启动
# 支持热模块替换 (HMR)，修改代码自动刷新
```

### 5. 构建生产版本

```bash
# 构建（输出到 dist/ 目录）
pnpm build

# 预览构建结果
pnpm preview
```

---

## 🧪 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式（文件变化自动重新测试）
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 运行特定测试文件
pnpm test -- src/__tests__/LLMService.test.ts
```

---

## ⚙️ 配置说明

### 环境变量（可选）

创建 `.env` 文件（项目根目录）：

```env
# 应用配置
VITE_APP_TITLE=YYC³ Family AI
VITE_APP_URL=https://family-ai.yyc3.vip

# API 配置（可选，用于云端 LLM）
VITE_OPENAI_API_KEY=your-api-key-here
VITE_OLLAMA_URL=http://localhost:11434

# 功能开关
VITE_ENABLE_TELEMETRY=false
VITE_ENABLE_ERROR_REPORTING=true
```

### LLM Provider 配置

在应用内 **设置页面** → **模型配置** 中添加：

| Provider | 配置说明 |
|----------|----------|
| **Ollama** | 本地部署，默认 `http://localhost:11434` |
| **OpenAI** | 需要 API Key |
| **Anthropic** | 需要 API Key |
| **智谱 GLM** | 需要 API Key |
| **通义千问** | 需要 API Key (DashScope) |
| **DeepSeek** | 需要 API Key |
| **自定义** | 填写自定义 API 地址 |

---

## 🐳 Docker 部署（可选）

```bash
# 构建镜像
docker build -t yyc3-family-ai .

# 运行容器
docker run -d \
  --name yyc3-family-ai \
  -p 5173:80 \
  yyc3-family-ai

# 访问 http://localhost:5173
```

---

## 🌐 在线体验

不想本地安装？直接访问在线版本：

- **项目主页**: https://family-ai.yyc3.vip
- **文档中心**: https://docs.yyccube.com
- **品牌官网**: https://yyccube.com

---

## ❓ 常见问题

### Q: 安装依赖时报错？

```bash
# 清除缓存重试
rm -rf node_modules .pnpm-store
pnpm install
```

### Q: 端口被占用？

```bash
# 修改端口（在 vite.config.ts 中）
# 或指定端口启动
pnpm dev --port 3000
```

### Q: 如何更新到最新版本？

```bash
git pull origin main
pnpm install
pnpm dev
```

---

## 📚 更多资源

- [完整文档](https://docs.yyccube.com)
- [API 参考](https://docs.yyccube.com/api)
- [贡献指南](./CONTRIBUTING.md)
- [更新日志](./CHANGELOG.md)
- [GitHub Issues](https://github.com/YanYuCloudCube/YYC3-Family-AI/issues)

---

## 💡 提示

✅ **完全本地运行** - 无需后端服务器，数据存储在浏览器中  
✅ **隐私安全** - 所有数据本地处理，支持 Ollama 本地模型  
✅ **离线可用** - PWA 支持，断网也能使用  
✅ **开源免费** - MIT 协议，可自由使用和修改  

---

**需要帮助？**  
- 🐛 [报告问题](https://github.com/YanYuCloudCube/YYC3-Family-AI/issues)  
- 💬 [讨论交流](https://github.com/YanYuCloudCube/YYC3-Family-AI/discussions)  
- 📧 联系团队: admin@0379.email  

---

*最后更新: 2026-04-10 | 版本: v1.0.0*
