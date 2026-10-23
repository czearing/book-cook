# Software Change Record

## Context

Task: unify recipe search, sort, tag filter, and other text-entry controls; tokenize heights and enforce the convention repository-wide.
Repository: `C:\Users\czear\AppData\Roaming\com.czearing.spool\projects\40a09451-fb3e-461b-9ba0-50ec2dae8580\book-cook`.
Starting revision: `a871f1478e54096f746ef1766245b81f2874a96d`, branch `fix/sidebar-hover-20261022`.
No AGENTS.md exists. README, package scripts, CI, supplied design spec, and supplied record template were read.
Existing changes cover editor checkboxes, account settings, mobile drawer, Playwright setup, README, package/config files, lockfile, and other job records. Preserve unrelated changes. Reuse only the necessary shared browser harness, its Jest exclusion, and exact Playwright dependency entries for persistent regression coverage. Stage only our sizing edits in overlapping files.
The user authorizes integration to `master`; remote master exists at the starting revision. Remote default branch is `main`, which is not the requested target.

## Acceptance Contract

1. Search, sort, and tag-filter surfaces have identical computed border colors, radius, and tokenized single-line height in light/dark themes, desktop/mobile, rest/hover/focus.
2. Other Fluent Input, SearchBox, Dropdown, and Textarea surfaces share the same visual rules. Multiline textareas retain their multiline sizing. Disabled controls retain disabled semantics and appearance.
3. Fixed CSS height/minHeight/maxHeight values in application source come from a centralized sizing-token module. Intrinsic sizing, percentages, viewport-relative layout, zero, typography lineHeight, and intrinsic image dimensions are not fixed control-height violations.
4. An automated source audit rejects future literal fixed heights, including nested and inline styles. Existing fixed heights are migrated without changing non-control dimensions.
5. Search debounce, sorting, tag add/remove, responsive layout, dialog interactions, and theme selection remain functional.
6. Every touched hand-written code file remains below 200 physical lines. No legacy exception is assumed.
7. Applicable Jest, browser, formatting, lint, TypeScript, and production-build checks pass before integration. Save this completed record and merge only task changes to master.

Commands: `yarn test --runInBand`, `yarn playwright test control-styling form-surfaces`, `node node_modules\prettier\bin\prettier.cjs --check --end-of-line auto --print-width 80 --single-quote false <changed-files>`, `node node_modules\eslint\bin\eslint.js --max-warnings 0 <changed-code-files>`, `yarn lint`, `yarn tsc --noEmit --incremental false`, `yarn build`, `git diff --cached --check`.

## Discovery and Baseline

Recipe controls originate in `src/pages/recipes.tsx`, `Toolbar/SearchBar`, and `TagPicker`. SearchBox and Dropdown use Fluent defaults, while TagPicker independently sets a 36px height, 8px radius, neutral border, and focus shadow.
Installed Fluent Input source defines private 24/32/40px heights and a contrasting accessible bottom border. SearchBox reuses Input styles. No public control-height token was found in installed Fluent declarations.
`AppContainer` owns the FluentProvider boundary. Settings and dialogs use the same Fluent controls. ThemeProvider supplies dynamic light/dark colors.
Many non-control fixed heights also exist, including imagery and editor content. Oversized touched components need cohesive style/view extractions, not arbitrary line slicing.
Node: v24.15.0. Yarn: 1.22.22. Existing local dependencies and Chromium browser harness are available. CI uses Node 22.15.0.
Browser tests already isolate authentication and APIs through Playwright routes with retained failure traces.
Baseline audit failed on 34 literal fixed-height declarations. Chromium confirmed search was 32px rather than the shared 36px. Baseline lint and TypeScript exposed an existing theme-import casing error. TypeScript additionally failed in the unrelated, untracked account session fixture.
The existing Playwright 1.58.2 harness is required for computed browser styles, a gap Jest cannot cover. Its installed metadata declares Node >=18 and Apache-2.0, compatible with local Node 24 and CI Node 22. Reuse the existing pinned package and integrity-locked transitive entries, not a newly selected version. It is test-only; no application runtime dependency is added.
GitHub's public advisory API returned no advisories for the exact @playwright/test, playwright, playwright-core 1.58.2 and fsevents 2.3.2 versions on 2026-10-22. This is a limited dependency check, not a security guarantee.

## Working Explanation

The mismatch comes from mixing Fluent's outlined-control defaults with a separately authored tag input and local height overrides. Sharing only a color token would not resolve box sizing, bottom borders, radius, or focus treatment.
Supporting evidence: installed Fluent root CSS and TagPicker.styles.ts differ in each of these properties.
Contradictory evidence: Fluent search and sort already share some defaults, so their actual computed sizes must be measured rather than assumed.
Smallest experiment: compare all four border sides, radius, and bounding height for the three controls with isolated Playwright data before and after the change.
Portal propagation was confirmed from the installed FluentProvider implementation and browser checks. Disabled textarea styling stays stable on hover and clears its focus shadow. Browser coverage also checks forced-colors focus outlines.

## Design Decision

Choose a shared control-surface style contract applied at the application's FluentProvider boundary using exported Fluent slot class names, plus the same contract for the custom TagPicker. Centralize fixed sizing values in a typed, dependency-free token object.
Alternative: wrap every Fluent control and rewrite all callers. Rejected because it adds component indirection and duplicates the existing library API for a presentation-only convention.
The provider rule covers existing and future Fluent controls, including portal content via FluentProvider custom classes. Textarea shares the surface but not single-line height. Disabled overrides remain explicit.
Recovery: revert the scoped commit; no data/schema changes are required. The existing browser test dependency is included as a development-only prerequisite.

## Implementation Slices

1. Regression and token audit: source-audit Jest test (under 150 lines), isolated browser control test (under 190 lines). Establish failing baseline.
2. Shared presentation: sizing tokens (under 70 lines), control style contract/provider hook (under 150 lines), AppContainer and TagPicker wiring (each under 200 lines).
3. Fixed-height migration: existing small style files retain their dimensions through tokens. Extract dialog styles and landing hero/section styles at cohesive presentation boundaries so touched legacy files finish below 200 lines. Projected extracted files: 60 to 180 lines each.
4. Verification and integration: run the recorded checks, review exact task diff, commit task-owned changes with the required coauthor trailer, push a task branch, and merge to master after checks pass.

## Regression and Behavior Evidence

- `yarn test --runInBand`: passed in the original dirty tree, 8 suites, 43 tests, 1 snapshot.
- `yarn playwright test control-styling form-surfaces`: passed, six Chromium cases. Light/dark and desktop/mobile recipe fields match all border sides, widths, radius, background, shadow, and 36px height at rest, hover, and focus. Search debounce, sort queries, tag add/remove, and horizontal overflow assertions pass.
- Settings color, email, search, and dropdown fields match. Portal textarea retains at least 80px, shares the surface, disables during a gated request, retains disabled hover styling, and reports an API failure before cancellation. Forced-colors focus outlines and theme-preference persistence pass.
- Source audit and negative fixtures pass, including nested/inline styles, numeric heights, and template literals; tokens, intrinsic dimensions, percentages, and zero are allowed. No CSS/SCSS/LESS source files exist.
- Original dirty-tree `yarn tsc --noEmit --incremental false` remains blocked only by the unrelated account test's missing session user. That file is untouched and excluded from the task-only verification tree.
- An isolated directory inside this repository was populated from the staged index, excluding unrelated work. Its node_modules junction reused existing dependencies without modifying the original installation.
- In that task-only tree, `yarn test --runInBand` passed: 4 suites, 16 tests, 1 snapshot. `yarn tsc --noEmit --incremental false` passed. `yarn lint` passed with no warnings or errors.
- Changed-file checks selected `$files = @((git diff --cached --name-only) | Where-Object { $_ -match '\.(ts|tsx)$' } | ForEach-Object { $_.Replace('/', '\') })` before changing into the isolated directory.
- `node node_modules\prettier\bin\prettier.cjs --check --end-of-line auto --print-width 80 --single-quote false @files` passed for all 34 changed TypeScript files. `node node_modules\eslint\bin\eslint.js --max-warnings 0 @files` passed for the same files. Auto line endings accommodate Git's Windows checkout conversion without changing source formatting.
- Final task-only `yarn playwright test control-styling form-surfaces` passed all six cases with no retries. Expected API rejection is observed explicitly; the test awaits and dismisses Next's development error overlay before cancellation.
- Task-only `yarn build` passed, including lint, type validation, optimized compilation, and static generation. Existing warnings concern stale Browserslist data, webpack cache serialization, and Next's Edge Runtime URL import. They are outside this task and were not suppressed.
- `git diff --cached --check` passed. All 34 changed TypeScript files are below 200 lines; the largest is 194 lines. No literal fixed-height violations remain in the audited application source.

## Quality Review

Reviewed shared rules and cohesive extractions. Non-control numeric dimensions are unchanged through semantic tokens. Landing sections, dialog styles, emoji utilities, and theme persistence are extracted along real presentation/domain boundaries to satisfy the under-200-line rule. All new theme imports match Git's canonical lowercase `theme` path, and the existing Windows directory casing was normalized to match. This avoids introducing Linux-only import failures.
Scoped formatting and import ordering have been applied. All task-touched code files are below 200 physical lines. No performance or security improvement is claimed. Chromium is the available browser; Firefox/WebKit and CI Node 22 are not yet exercised.

## Acceptance Decision

Acceptance criteria 1 through 6 have evidence. All local verification gates in criterion 7 passed in the task-only tree. The remaining gate is verifying the merge into remote master.

## Delivery

Completed implementation record: `agent-records/2026-10-22-consistent-controls.md`.
Branch: `fix/consistent-controls-20261022`. Integration pending. Existing unrelated work remains unstaged and intact.
