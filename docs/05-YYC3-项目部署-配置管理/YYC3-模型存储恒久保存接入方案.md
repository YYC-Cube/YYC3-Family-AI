# YYC³ Family AI — 模型存储恒久保存机制接入方案

> **更新日期**: 2026-06-05  
> **目标路径**: `/Users/yanyu/models`  
> **环境变量**: `OLLAMA_MODELS=/Users/yanyu/models`

---

## 一、变更概要

| 领域 | 变更说明 |
|------|---------|
| **系统级** | Ollama 模型存储从 `~/.ollama/models` 迁移至 `/Users/yanyu/models` |
| **Shell 配置** | `~/.zshrc` 中的 `OLLAMA_MODELS` 指向新路径 |
| **前端代码** | `config.ts` 新增 `MODEL_STORAGE_PATH` 常量 |
| **前端代码** | `storage-keys.ts` 新增 `SK_MODEL_STORAGE_PATH` 存储键 |
| **Tauri 后端** | `main.rs` 启动时 `env::set_var("OLLAMA_MODELS", ...)` + `get_model_storage_info` 命令 |
| **UI** | `ModelSettings` Ollama 标签页新增「模型存储路径」信息面板，标注恒久保存 |
| **Tauri 构建** | 需全量 `pnpm tauri:build` 使变更写入已封装 app |

---

## 二、系统级配置（需手动执行）

以下的系统级的操作需要在终端中手动运行一次，涉及系统环境变量和文件迁移。

### 2.1 Shell 环境变量持久化

`~/.zshrc` 中已更新：

```bash
# Model Storage — YYC³ Family AI 统一模型存储
export OLLAMA_MODELS="/Users/yanyu/models"
```

**使配置生效**（重新打开终端或运行）：

```bash
source ~/.zshrc
echo $OLLAMA_MODELS
# 应输出: /Users/yanyu/models
```

### 2.2 创建目标目录结构

```bash
mkdir -p /Users/yanyu/models/blobs
mkdir -p /Users/yanyu/models/manifests
```

### 2.3 迁移已有模型数据

将现有 Ollama 模型数据复制到新路径：

```bash
# 复制 blobs
cp -R /Users/yanyu/.ollama/models/blobs/* /Users/yanyu/models/blobs/

# 复制 manifests
cp -R /Users/yanyu/.ollama/models/manifests/* /Users/yanyu/models/manifests/

# 验证
ls /Users/yanyu/models/blobs/ | wc -l    # 应 > 0
ls /Users/yanyu/models/manifests/ | wc -l  # 应 > 0
```

### 2.4 验证 Ollama 可识别新路径

```bash
# 重启 Ollama 服务
ollama serve &

# 在新终端中查看模型列表（应能列出已有模型）
ollama list
```

如果模型列表正常显示，说明迁移成功。

> **注意**: 旧路径 `~/.ollama/models` 中的数据可以保留作为备份，确认新路径正常工作后可安全删除：
> ```bash
> rm -rf /Users/yanyu/.ollama/models/blobs
> rm -rf /Users/yanyu/.ollama/models/manifests
> ```

---

## 三、项目代码变更清单

### 3.1 新增/修改文件

| # | 文件 | 变更类型 | 说明 |
|---|------|---------|------|
| 1 | `constants/config.ts` | 修改 | 新增 `MODEL_STORAGE_PATH`、`MODEL_STORAGE_BLOBS`、`MODEL_STORAGE_MANIFESTS`、`OLLAMA_MODELS_ENV` 四个常量 |
| 2 | `constants/storage-keys.ts` | 修改 | 新增 `SK_MODEL_STORAGE_PATH` 存储键 |
| 3 | `src-tauri/src/main.rs` | 修改 | `main()` 启动时设置 `OLLAMA_MODELS` 环境变量；新增 `get_model_storage_info` Tauri 命令 + `ModelStorageInfo` 结构体 |
| 4 | `ModelSettings.tsx` | 修改 | Ollama 标签页中新增「模型存储路径」信息面板，显示路径、blobs/manifests 状态 |

### 3.2 常量定义详情

**config.ts** — 统一模型存储路径常量：

```typescript
export const MODEL_STORAGE_PATH = "/Users/yanyu/models";
export const MODEL_STORAGE_BLOBS = `${MODEL_STORAGE_PATH}/blobs`;
export const MODEL_STORAGE_MANIFESTS = `${MODEL_STORAGE_PATH}/manifests`;
export const OLLAMA_MODELS_ENV = "OLLAMA_MODELS";
```

**storage-keys.ts** — 若需前端持久化自定义路径时使用：

```typescript
export const SK_MODEL_STORAGE_PATH = "yyc3_model_storage_path";
```

### 3.3 Rust 后端变更

**main.rs** — `main()` 函数：

```rust
fn main() {
    // 设置统一模型存储路径 — 恒久保存机制
    // 确保 Ollama 子进程继承此环境变量，使模型存储在 /Users/yanyu/models
    env::set_var("OLLAMA_MODELS", MODEL_STORAGE_PATH);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            get_model_storage_info,  // ← 新增
            exec_command,
            open_url,
            show_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

新增 `ModelStorageInfo` 结构体和 `get_model_storage_info` 命令，前端可通过 `invoke('get_model_storage_info')` 查询当前存储路径状态。

### 3.4 UI 变更

在 **ModelSettings** → **Ollama 标签页** 中，服务端点配置下方新增「模型存储路径」恒久保存信息面板：

```
┌──────────────────────────────────────────────┐
│  ● 模型存储路径                [恒久保存]       │
│                                                │
│  OLLAMA_MODELS=/Users/yanyu/models             │
│                                                │
│  blobs: 4个文件 | manifests: registry.ollama.ai │
│  ✓ 模型数据已迁移                               │
└──────────────────────────────────────────────┘
```

---

## 四、封装 app 同步流程

### 4.1 开发环境验证

```bash
# 1. TypeScript 类型检查
pnpm typecheck

# 2. Tauri 开发模式运行（验证变更生效）
pnpm tauri:dev
```

### 4.2 构建更新

```bash
# 全量构建（vite build → Rust compile → macOS .app + .dmg）
pnpm tauri:build

# 如需构建通用二进制（Apple Silicon + Intel）
pnpm tauri:build:macos
```

### 4.3 替换已安装 app

```bash
# 方式一：直接替换 .app Bundle
cp -R src-tauri/target/release/bundle/macos/YYC3\ Family\ AI.app /Applications/

# 方式二：重新安装 DMG
open src-tauri/target/release/bundle/dmg/YYC3\ Family\ AI_1.0.0_aarch64.dmg
```

### 4.4 构建产物

| 产物 | 路径 |
|------|------|
| Unix 二进制 | `src-tauri/target/release/YYC3 Family AI` |
| macOS .app Bundle | `src-tauri/target/release/bundle/macos/YYC3 Family AI.app` |
| DMG 安装包 | `src-tauri/target/release/bundle/dmg/YYC3 Family AI_1.0.0_aarch64.dmg` |

---

## 五、恒久保存机制说明

### 5.1 实现层次

```
系统 Shell 配置 (~/.zshrc)
  └─ export OLLAMA_MODELS=/Users/yanyu/models
       │
       ├─ Ollama 服务进程继承此变量
       │   └─ 所有模型 pull/run/list 操作使用新路径
       │
       ├─ Tauri 后端 (main.rs)
       │   └─ env::set_var("OLLAMA_MODELS", ...) 
       │       └─ 当 app 启动 Ollama 子进程时继承
       │
       └─ 前端代码 (config.ts)
           └─ MODEL_STORAGE_PATH 常量
               └─ UI 显示 / 后续扩展可配置
```

### 5.2 持久化保证

| 层面 | 持久化方式 | 恢复方式 |
|------|-----------|---------|
| Shell | `~/.zshrc` 中 `export` | 重新登录 shell 自动生效 |
| Tauri App | `main.rs` 中 `env::set_var` | 每次 app 启动自动设置 |
| Ollama 服务 | `launchctl` / 命令行启动继承环境变量 | 配合 shell 配置自动生效 |
| 文件系统 | `/Users/yanyu/models/` 物理目录 | 磁盘存在则永久保存 |

### 5.3 数据安全

- 模型文件存储在 `/Users/yanyu/models/blobs/` 和 `/Users/yanyu/models/manifests/`
- 迁移后旧路径 `~/.ollama/models/` 数据保留，可随时回滚
- Tauri 应用使用 `allowlist.fs.scope: ["**"]`，可正常读取 `/Users/yanyu/models/`

---

## 六、快速参考命令

```bash
# 环境变量
echo $OLLAMA_MODELS                          # 查看当前设置
source ~/.zshrc                               # 重载配置

# 目录验证
ls /Users/yanyu/models/blobs/ | wc -l         # blob 文件数
ls /Users/yanyu/models/manifests/ | wc -l     # manifest 数

# Ollama 验证
ollama list                                    # 模型列表
ollama serve &                                 # 启动服务

# 项目构建
cd /Volumes/Max/YYC3-Family-AI
pnpm typecheck                                 # TS 类型检查
pnpm tauri:build                               # 全量构建
pnpm tauri:dev                                 # 开发模式

# 更新已封装 app
cp -R src-tauri/target/release/bundle/macos/YYC3\ Family\ AI.app /Applications/
```