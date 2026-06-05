# YYC³ 本地封装方案实施总结

> **版本**: v2.0.0 | **实施日期**: 2026-06-04 | **状态**: ✅ 已落地

---

## 一、审计发现问题（P0→P2）

| 优先级 | 问题域 | 影响范围 | 解决措施 |
|--------|--------|----------|----------|
| **P0** | **类型重复定义**：`PreviewMode` 在 2 处定义不一致 | 预览系统 + P0 核心 | 统一以 `previewTypes.ts` 为单一数据源 |
| **P0** | **错误体系碎片化**：4 套独立错误枚举 | 全系统 | 合并为 `ErrorCodes.ts`（6 领域 37 码）+ `AppError` |
| **P1** | **存储键名不一致**：`yyc3-` vs `yyc3_` 混用 | localStorage 兼容性 | `storage-migration.ts` 映射表 + 读写兼容层 |
| **P1** | **DI 容器闲置**：`di/index.ts` 定义了但未接线 | 服务治理 | `ServiceRegistry` 封装 + `initializeCore()` |
| **P2** | **工具函数散落**：7 个 utils 无统一 barrel | 开发效率 | `services/utils/index.ts` 统一 barrel |

---

## 二、5 层封装架构

```
src/app/components/ide/
├── services/                    ← 封装核心
│   ├── errors/                  ← L1: 统一错误系统
│   │   ├── ErrorCodes.ts        # 6 领域 37 错误码（替代 4 套枚举）
│   │   ├── AppError.ts          # 统一错误类 + 5 工厂方法
│   │   └── index.ts
│   ├── utils/                   ← L2: 统一工具函数
│   │   ├── helpers.ts           # 16 新增工具（debounce/throttle/retry/memoize...）
│   │   └── index.ts             # 合并 7 个原有 utils 的 barrel 导出
│   ├── stores.ts                ← L3: Store Hub（非 React 环境访问）
│   ├── registry.ts              ← L4: 服务注册中心（DI 实际接线）
│   └── index.ts                 ← L5: 顶层 barrel（一键导入）
├── types/
│   └── index.ts                 ← 类型规范化（DesignRoot + 统一 re-export）
├── constants/
│   └── storage-migration.ts     ← 存储键迁移辅助
└── factory/
    └── index.ts                 ← 全局初始化（initializeCore）
```

---

## 三、快速开始

### 3.1 统一导入

```typescript
// 从 barrel 一键导入，替代散落的 import
import {
  logger,
  AppError, ErrorCode,
  debounce, throttle, retry, formatBytes,
  generateId, copyToClipboard,
  serviceRegistry,
  getFileState, getModelState,
  batchUpdate,
} from '@/app/components/ide/services';
```

### 3.2 统一类型导入

```typescript
// 单一数据源，消除重复
import {
  PreviewMode,          // 以 previewTypes.ts 为准（含 "smart"）
  DevicePreset,
  PanelSpec, DesignRoot,
  SnapshotFile, Snapshot,
  ValidationResult,
} from '@/app/components/ide/types';
```

### 3.3 统一常量导入

```typescript
import {
  // 标准化后的存储键
  SK_THEME, SK_PANEL_LAYOUT,
  // 兼容层读取
  getStorageItem, setStorageJSON,
  // 一键迁移遗留键
  migrateAllLegacyKeys,
} from '@/app/components/ide/constants';
```

---

## 四、核心 API 参考

### 4.1 错误系统 `services/errors/`

```typescript
// 抛出统一错误
throw new AppError({
  code: ErrorCode.STORAGE_WRITE_FAILED,
  context: { filePath: '/data.json' }
});

// 快捷工厂
AppError.fromError(err, ErrorCode.AI_REQUEST_FAILED);
AppError.validation("参数 name 不能为空");
AppError.ai("响应超时", ErrorCode.AI_TIMEOUT, err);
AppError.storage("写入失败", ErrorCode.STORAGE_QUOTA_EXCEEDED);

// 判断恢复性
const error = AppError.fromError(err);
if (error.recoverable) { /* 自动恢复 */ }
if (error.retryable) { /* 自动重试 */ }
```

**错误码分类（6 领域 37 码）：**

| 领域 | 码数 | 举例 |
|------|------|------|
| `APP` | 7 | `APP_UNKNOWN`, `APP_TIMEOUT`, `APP_CONFIG_INVALID` |
| `AI` | 7 | `AI_REQUEST_FAILED`, `AI_RATE_LIMITED`, `AI_STREAM_ERROR` |
| `STORAGE` | 8 | `STORAGE_QUOTA_EXCEEDED`, `STORAGE_DECRYPTION_FAILED` |
| `NETWORK` | 5 | `NETWORK_ERROR`, `NETWORK_OFFLINE`, `NETWORK_CORS_BLOCKED` |
| `VALIDATION` | 8 | `VALIDATION_FILE_TOO_LARGE`, `VALIDATION_SANITIZE_BLOCKED` |
| `SYSTEM` | 5 | `SYSTEM_INTERNAL_ERROR`, `SYSTEM_EXTERNAL_API_ERROR` |

### 4.2 工具函数 `services/utils/`

```typescript
// 时间控制
debounce(fn, 300);                 // 防抖
throttle(fn, 100);                 // 节流
await delay(1000);                 // 延迟
await retry(fn, { attempts: 3 });  // 重试（指数退避）

// 安全执行
const [data, err] = await tryCatch(fetchData);
const [result, err] = tryCatchSync(parseJSON);

// 缓存
const cachedFn = memoize(expensiveFn, 5000); // 5s TTL
const runOnce = once(initialize);            // 只执行一次

// 格式化
formatBytes(1048576);    // "1.0 MB"
formatDuration(1500);    // "1.5s"

// 断言
assertNonNull(value, "配置文件不能为空");
assert(condition, "状态异常");

// 原有工具统一 barrel
generateId('file');      // 从 utils/generateId
await copyToClipboard(text);  // 从 utils/clipboard
```

### 4.3 Store Hub `services/stores.ts`

```typescript
// 非 React 环境访问（如 services、agents）
const files = getFileState();
const model = getModelState();

// 批量更新
batchUpdate(
  { store: fileApi, partial: { activeFile: '/main.ts' } },
  { store: modelApi, partial: { showSettings: true } },
);
```

### 4.4 服务注册 `services/registry.ts`

```typescript
// 注册服务
serviceRegistry.register({
  token: new ServiceToken('MyService'),
  factory: () => new MyService(),
  lifecycle: Lifecycle.Singleton,
  init: (svc) => svc.initialize(),
  dispose: (svc) => svc.destroy(),
});

// 获取服务
const myService = serviceRegistry.get(myToken);

// 初始化/释放
await serviceRegistry.initialize();
await serviceRegistry.dispose();
```

### 4.5 全局初始化 `factory/index.ts`

```typescript
// 应用启动时调用
import { initializeCore } from './factory';

await initializeCore();  // 注册核心 store 到 DI + 初始化
// 应用关闭时
await disposeCore();
```

### 4.6 存储键迁移 `constants/storage-migration.ts`

```typescript
// 读取时自动兼容两种前缀
const value = getStorageItem('yyc3-theme');  // 自动查 yyc3_theme

// 写入时统一标准前缀
setStorageJSON('yyc3_custom_themes', themes);

// 一键迁移全部遗留键
const { migrated, skipped } = migrateAllLegacyKeys();
console.log(`已迁移 ${migrated.length} 个，跳过 ${skipped.length} 个`);
```

---

## 五、新旧导入对照表

| 场景 | 旧方式 | 新方式 |
|------|--------|--------|
| 错误处理 | `ErrorHandler.getInstance().handleError(...)` | `AppError.fromError(err)` |
| 错误码 | `ErrorType.AI_REQUEST_FAILED` | `ErrorCode.AI_REQUEST_FAILED` |
| 防抖 | 自实现或 lodash | `debounce(fn, 300)` |
| 重试 | 自实现 | `retry(fn, { attempts: 3 })` |
| 字节格式化 | 自实现 | `formatBytes(1024)` |
| 唯一 ID | `generateId()` from `utils/generateId` | `generateId('file')` from barrel |
| 剪贴板 | `copyToClipboard()` from `utils/clipboard` | `copyToClipboard()` from barrel |
| 非 React 读 Store | 无 | `getFileState()` |
| 存储键读写 | `localStorage.getItem('yyc3-theme')` | `getStorageItem('yyc3-theme')` |

---

## 六、技术验证

| 检查项 | 结果 |
|--------|------|
| `npx tsc --noEmit --pretty` | 0 errors, 0 warnings |
| `vitest run ErrorAnalyzer` | 77 passed |
| `vitest run StorageKeys + MigrationService` | 24 passed |
| `vitest run ModelStore + ProxyStore + ChatHistoryStore` | 54 passed |
| 新文件语法诊断（VSCode） | 全部通过 |

---

## 七、设计原则

- **高可用**：`AppError` 支持 `recoverable` / `retryable` 标识，配合 `serviceRegistry.initialize/dispose` 生命周期管理
- **高标准**：错误码 6 领域分层（APP/AI/STORAGE/NETWORK/VALIDATION/SYSTEM），37 个具体码覆盖全场景
- **高智能**：`retry` 支持指数退避，`memoize` 支持 TTL 自动过期，`tryCatch` 元组返回减少嵌套
- **高可扩展**：`ServiceRegistry` 基于 DI 容器，新增服务只需 `register()` 一行，不影响现有代码
- **可视化**：统一 barrel 导入路径，所有功能从 `services/` 单一入口导出

---

> **项目团队**: YanYuCloudCube Team
> **联系方式**: <admin@0379.email>
> **文档维护**: 请随新功能同步更新此文档
