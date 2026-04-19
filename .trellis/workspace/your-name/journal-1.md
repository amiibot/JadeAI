# Journal - your-name (Part 1)

> AI development session journal
> Started: 2026-04-17

---



## Session 1: 家庭本地登录落地

**Date**: 2026-04-17
**Task**: 家庭本地登录落地
**Branch**: `main`

### Summary

完成家庭本地账号登录改造，移除 Google OAuth 与 fingerprint 主路径，补充本地账号映射、密码哈希、登录页与 gitignore 忽略规则。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `ad513cc` | (see git log) |
| `cc2a252` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 2: 本地登录配置化与认证收尾

**Date**: 2026-04-17
**Task**: 本地登录配置化与认证收尾
**Branch**: `main`

### Summary

补充家庭本地登录说明，新增密码 hash 脚本，改为从 LOCAL_AUTH_USERS_JSON 读取家庭账号，并将 middleware 迁移到 proxy。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `09c2a4b` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 3: 清理与本地认证配置收口

**Date**: 2026-04-19
**Task**: 清理与本地认证配置收口
**Branch**: `main`

### Summary

(Add summary)

### Main Changes

| Feature | Description |
|---------|-------------|
| Cleanup | 统一项目环境入口为 `.env`，清理本地构建/部署残留文件与旧说明 |
| Auth Config | 将本地账号配置从 `.env` JSON 迁移到独立 JSON 文件，再进一步固定为 `./data/local-auth-users.json` |
| Validation | 通过浏览器手工验证登录流程，确认 `/api/auth/callback/credentials` 与 `/api/auth/session` 返回 200 |
| Docs | 同步 README、README.zh-CN、ARCHITECTURE、博客文档与 `.env.example` |
| Spec | 补充 `.trellis/spec` 中关于“不要把结构化用户配置塞进 .env” 的踩坑指引 |

**Updated Files**:
- `.env.example`
- `README.md`
- `README.zh-CN.md`
- `ARCHITECTURE.md`
- `blog-zh.md`
- `blog-zh-2.md`
- `src/lib/auth/family-users.ts`
- `.trellis/spec/frontend/quality-guidelines.md`
- `.trellis/spec/guides/code-reuse-thinking-guide.md`
- `.trellis/spec/guides/cross-layer-thinking-guide.md`

**Verification**:
- `pnpm type-check`
- `pnpm build`
- 浏览器登录 `user1 / 123456789`
- 检查认证接口返回 200


### Git Commits

| Hash | Message |
|------|---------|
| `9643be4` | (see git log) |
| `7983271` | (see git log) |
| `9e30df1` | (see git log) |
| `edf3a02` | (see git log) |
| `83c11e1` | (see git log) |
| `3b922e5` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 4: 统一认证跳转基址

**Date**: 2026-04-19
**Task**: 统一认证跳转基址
**Branch**: `main`

### Summary

(Add summary)

### Main Changes

| Feature | Description |
|---------|-------------|
| Auth redirects | Unified login/logout/protected-page redirect origin handling so remote Docker deployments no longer fall back to `0.0.0.0:3000` |
| Frontend | Logout now redirects to the current locale login page on the current site origin; login callback is sanitized to relative paths |
| Middleware | Protected-page redirects now use a shared public-origin resolver with `AUTH_URL` / `NEXTAUTH_URL` fallback |
| Docs | Added `AUTH_URL` deployment guidance to `.env.example`, `README.md`, and `README.zh-CN.md` |
| Verification | Passed targeted ESLint, `pnpm type-check`, and browser smoke tests for login/logout redirect behavior |

**Updated Files**:
- `src/lib/utils/url.ts`
- `src/hooks/use-auth.ts`
- `src/components/auth/login-button.tsx`
- `src/proxy.ts`
- `src/lib/utils/share.ts`
- `.env.example`
- `README.md`
- `README.zh-CN.md`


### Git Commits

| Hash | Message |
|------|---------|
| `3e53f54` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 5: 清理 warning 并修复 JSON 归一化

**Date**: 2026-04-19
**Task**: 清理 warning 并修复 JSON 归一化
**Branch**: `main`

### Summary

(Add summary)

### Main Changes

| 项目 | 内容 |
|---|---|
| 结果 | 清理了 warning 相关改动，修复了 JSON 归一化问题，并把历史脏数据修复脚本、回归测试和仓库级归一化逻辑合并为一个提交。 |
| 验证 | `pnpm lint`、`pnpm type-check`、`pnpm test` 通过；本地 dev 访问冒烟通过，`/zh`、`/zh/login`、`/zh/dashboard`、`/zh/templates`、`/zh/interview`、`/zh/editor/*`、`/api/auth/*`、`/api/resume`、`/api/user/settings`、`/api/interview` 都正常返回 `200`。 |
| 提交 | `b9ac52a 🤡 chore(lint): 清理 warning 并修复 JSON 归一化` |

**Updated Files**:
- `package.json`
- `scripts/repair-json-columns.ts`
- `src/lib/db/json-normalize.ts`
- `src/lib/db/json-normalize.test.ts`
- `src/lib/db/repositories/user.repository.ts`
- `src/lib/db/repositories/resume.repository.ts`
- `src/components/landing/features-section.tsx`
- `src/components/tour/tour-overlay.tsx`


### Git Commits

| Hash | Message |
|------|---------|
| `b9ac52a` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete
