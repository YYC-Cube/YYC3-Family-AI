#!/usr/bin/env bash
# ==============================================================================
# ⚡ YYC³ Family AI — 本地 AI 导师 · 一键启动
# ==============================================================================
# 一句命令启动：./start.sh
# 自动完成：环境检查 → Ollama检测 → 模型拉取 → IDE启动 → 浏览器打开
# 设计原则：零配置、零网络依赖、99.9%可用率、永不断线
# ==============================================================================

set -e

# ── 色彩 ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BOLD}YYC³ Family AI — 本地 AI 导师                      ${NC}"
echo -e "${CYAN}║${NC}  言启千行代码 · 语枢万物智能                           "
echo -e "${CYAN}║${NC}  ${YELLOW}纯本地 · 零上传 · 永不断线                         ${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: 环境检查 ──
echo -e "${BOLD}[1/4] 🔍 环境检查${NC}"

# Node.js
if ! command -v node &> /dev/null; then
  echo -e "  ${RED}✗ Node.js 未安装${NC}"
  echo -e "  请安装 Node.js 18+: https://nodejs.org/"
  exit 1
fi
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "  ${RED}✗ Node.js 版本过低: $(node -v) (需要 18+)${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓ Node.js $(node -v)${NC}"

# pnpm
if ! command -v pnpm &> /dev/null; then
  echo -e "  ${YELLOW}⚠ pnpm 未安装，正在安装...${NC}"
  npm install -g pnpm
  echo -e "  ${GREEN}✓ pnpm $(pnpm -v) 已安装${NC}"
else
  echo -e "  ${GREEN}✓ pnpm $(pnpm -v)${NC}"
fi

# ── Step 2: Ollama 检测 ──
echo ""
echo -e "${BOLD}[2/4] 🦙 Ollama 本地模型检测${NC}"

OLLAMA_RUNNING=false
if command -v ollama &> /dev/null; then
  echo -e "  ${GREEN}✓ Ollama 已安装${NC}"
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    OLLAMA_RUNNING=true
    echo -e "  ${GREEN}✓ Ollama 服务运行中${NC}"
  else
    echo -e "  ${YELLOW}⚠ Ollama 服务未运行，正在启动...${NC}"
    ollama serve > /tmp/ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo -e "  ${YELLOW}  等待 Ollama 启动...${NC}"
    for i in $(seq 1 15); do
      if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        OLLAMA_RUNNING=true
        echo -e "  ${GREEN}✓ Ollama 服务已启动${NC}"
        break
      fi
      sleep 1
    done
  fi
else
  echo -e "  ${YELLOW}⚠ Ollama 未安装${NC}"
  echo -e "  ${YELLOW}  可选安装 (二选一):${NC}"
  echo -e "  ${CYAN}    macOS: brew install ollama${NC}"
  echo -e "  ${CYAN}    Linux: curl -fsSL https://ollama.com/install.sh | sh${NC}"
  echo -e "  ${YELLOW}  或跳过，使用 Z.ai 云端 API${NC}"
fi

# ── Step 3: 模型准备 ──
echo ""
echo -e "${BOLD}[3/4] 📦 AI 模型检查${NC}"

if [ "$OLLAMA_RUNNING" = true ]; then
  # 检查已有模型
  EXISTING_MODELS=$(curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; d=json.load(sys.stdin); [print(m['name']) for m in d.get('models',[])]" 2>/dev/null || echo "")
  
  # 优先使用 qwen2.5-coder:7b (轻量级代码模型，4G显存友好)
  MODEL="qwen2.5-coder:7b"
  FALLBACK_MODEL="qwen2.5:7b"
  
  if echo "$EXISTING_MODELS" | grep -q "$MODEL"; then
    echo -e "  ${GREEN}✓ ${MODEL} 已就绪${NC}"
  elif echo "$EXISTING_MODELS" | grep -q "$FALLBACK_MODEL"; then
    echo -e "  ${GREEN}✓ ${FALLBACK_MODEL} 已就绪 (代码优化版替代)${NC}"
    MODEL=$FALLBACK_MODEL
  else
    echo -e "  ${YELLOW}⚠ 需要拉取 ${MODEL} (~4.5GB, 视网络情况约3-10分钟)${NC}"
    echo -e "  ${YELLOW}  是否拉取? [Y/n]:${NC} \c"
    read -r response
    if [ "$response" != "n" ] && [ "$response" != "N" ]; then
      echo -e "  ${CYAN}  正在拉取 ${MODEL}...${NC}"
      ollama pull "$MODEL"
      echo -e "  ${GREEN}✓ ${MODEL} 拉取完成${NC}"
    else
      # 尝试拉取更小的模型
      MODEL="qwen2.5:3b"
      echo -e "  ${YELLOW}  拉取轻量模型 ${MODEL} (~2GB)...${NC}"
      ollama pull "$MODEL" 2>/dev/null || {
        echo -e "  ${RED}✗ 模型拉取取消，使用 Z.ai 云端 API${NC}"
        MODEL=""
      }
    fi
  fi

  # 保存默认模型配置
  if [ -n "$MODEL" ]; then
    mkdir -p .yyc3
    cat > .yyc3/local-config.json << EOF
{
  "provider": "ollama",
  "model": "${MODEL}",
  "type": "local",
  "autoStart": true
}
EOF
    echo -e "  ${GREEN}✓ 默认模型已配置: ${MODEL}${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠ Ollama 未就绪，IDE 将默认使用 Z.ai 云端 API${NC}"
  echo -e "  ${YELLOW}  如需本地模式，请先安装 Ollama 并拉取模型${NC}"
  echo -e "  ${CYAN}    brew install ollama && ollama pull qwen2.5-coder:7b${NC}"
fi

# ── Step 4: 安装依赖 + 启动 IDE ──
echo ""
echo -e "${BOLD}[4/4] 🚀 启动 YYC³ IDE${NC}"

# 安装依赖 (如果 node_modules 不存在)
if [ ! -d "node_modules" ]; then
  echo -e "  ${YELLOW}  安装依赖 (首次运行)...${NC}"
  pnpm install
  echo -e "  ${GREEN}✓ 依赖安装完成${NC}"
fi

# 启动开发服务器
echo -e "  ${GREEN}✓ YYC³ IDE 启动中...${NC}"
echo -e ""
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${BOLD}  浏览器打开: ${GREEN}http://localhost:5173${NC}"
echo -e "  ${BOLD}  按 ${YELLOW}Ctrl+C${NC} 停止服务"
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e ""
echo -e "  ${BOLD}📖 AI 家人已就绪:${NC}"
echo -e "  ${CYAN}  🧠 元启·天枢  📚 格物·宗师  🛡️ 智云·守护${NC}"
echo -e "  ${CYAN}  🤔 语枢·万物  🧭 言启·千行  🔮 预见·先知${NC}"
echo -e "  ${CYAN}  🎯 知遇·伯乐  🎨 创想·灵韵${NC}"
echo -e ""
echo -e "  ${YELLOW}  ⚡ 纯本地 · 零上传 · 永不断线${NC}"
echo -e ""

# 在浏览器中打开
if command -v open &> /dev/null; then
  (sleep 3 && open http://localhost:5173) &
elif command -v xdg-open &> /dev/null; then
  (sleep 3 && xdg-open http://localhost:5173) &
fi

# 启动 Vite
pnpm run dev
