# brainstorm: 清理 warning

## Goal

在不破坏当前可用性的前提下，系统性降低仓库里的 ESLint warning 数量，先确定本轮清理范围、优先级和可接受的改动深度，避免一次性大面积重构。

## What I already know

* 当前分支是 `chore/lint-cleanup`，最近已把阻塞性的 lint error 清到 0。
* 当前 `pnpm lint` 结果是 `0 errors, 1328 warnings`。
* warning 分布高度集中：
  * `@typescript-eslint/no-explicit-any`: 1249
  * `@typescript-eslint/no-unused-vars`: 66
  * `@next/next/no-img-element`: 5
  * `react-hooks/exhaustive-deps`: 3
  * `react-hooks/set-state-in-effect`: 3
* `no-explicit-any` 主要落在 API route、导出模板、边界转换代码，属于历史债务，处理成本最高。
* 非 `any` warning 数量少，通常更适合优先清理，回报高、风险低。
* 已抽样查看代表文件：
  * `src/hooks/use-interview-chat.ts`
  * `src/components/tour/tour-overlay.tsx`
  * `src/hooks/use-media-query.ts`
  * `src/components/preview/avatar-image.tsx`
  * `src/app/api/resume/[id]/export/templates/engineer.ts`

## Assumptions (temporary)

* 本轮不追求一次性清零全部 1328 个 warning。
* 应优先做低风险、高收益的 warning 批次。
* 对 `no-explicit-any`，更合理的是按模块/边界分批，而不是全仓库一次性横扫。
* 用户已接受按常规顺序推进：先低风险 warning，再考虑 `any`。

## Open Questions

* 本轮 MVP 的 warning 清理范围要到哪一层？

## Requirements (evolving)

* 本轮范围锁定为：清理全部非 `any` warning。
* `@typescript-eslint/no-explicit-any` 暂不作为本轮目标。
* 采用实用优先策略：
  * 低风险和中风险项尽量直接修复
  * 对明显不适合强行改写的 `no-img-element` / `no-page-custom-font`，允许局部 eslint-disable 并保留现有实现理由
* 优先采用与现有代码风格一致的最小改动方案。
* 保持 `pnpm lint` 和 `pnpm type-check` 可通过。

## Acceptance Criteria (evolving)

* [x] 明确本轮要清理的 warning 范围和不做的范围。
* [ ] 全部非 `any` warning 被清理。
* [ ] `@typescript-eslint/no-explicit-any` 仍保持现状，不做大规模重构。
* [ ] 完成后的 `pnpm lint` 保持 0 error。
* [ ] 完成后的 `pnpm type-check` 通过。
* [ ] warning 总数相对当前基线下降。

## Definition of Done (team quality bar)

* Tests added/updated (unit/integration where appropriate)
* Lint / typecheck / CI green
* Docs/notes updated if behavior changes
* Rollout/rollback considered if risky

## Out of Scope (explicit)

* 一次性清零全仓库所有 `no-explicit-any`
* 为了消 warning 而引入大规模抽象重构
* 为了满足 lint 规则而牺牲既有预览/导出一致性或拍照预览体验
* 与 warning 清理无关的功能性修改

## Technical Notes

* 当前基线：`pnpm lint` → `0 errors, 1328 warnings`
* 重点观察：warning 以 `no-explicit-any` 为主，适合单独成批处理。
* 低成本批次候选：`no-unused-vars`、`no-img-element`、`react-hooks/exhaustive-deps`、`react-hooks/set-state-in-effect`
* 高成本批次候选：`no-explicit-any`（建议按模块分治，如 interview / ai route / export templates）
* 进一步抽样后，非 `any` warning 可再分成：
  * 低风险：`no-unused-vars`、unused eslint-disable
  * 中风险：hooks 依赖/`set-state-in-effect`（可能需要调整初始化方式或依赖关系）
  * 需要决策：`no-img-element` 与 `no-page-custom-font`
* `no-img-element` 并不总适合机械替换成 `next/image`：
  * `src/components/preview/avatar-image.tsx` 和 `src/components/editor/sections/personal-info.tsx` 更像普通产品 UI，适合考虑改成 `Image`
  * `src/app/[locale]/linkedin-photo/page.tsx` 是拍照/预览流程，可能更适合保留 `<img>` 并局部豁免
* `src/components/preview/resume-preview.tsx` 的 Google Fonts `<link>` 主要是为了让预览与导出字体指标一致，未必适合为消 warning 而强行改成 Next font。

## Common Cleanup Order

通常会按这个顺序清：

1. 先清会影响理解和维护、但改动很小的 warning
   * `no-unused-vars`
   * 少量 hooks 依赖警告
   * 少量 `set-state-in-effect`

2. 再清规则明确、改动局部的 warning
   * `no-img-element`
   * 个别组件/页面里的局部 warning

3. 最后处理高成本类型债务
   * `no-explicit-any`
   * 按模块分批，不横扫全仓库

这样做的原因：
* 先快速降低噪音，提升后续 warning 信噪比
* 先做低风险项，避免一上来进入大规模类型重构
* 给 `any` 清理保留模块边界，便于验证和回滚
