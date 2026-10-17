# Performance Review Record

## Context

Task 8d42b3ae requests a safe, substantial improvement to Book Cook, proved before publication directly to master. The assigned project contains multiple worktrees. Changes are isolated to book-cook-perf-8d42b3ae, based on origin/master at 37eb5615c2633b9cd57bf8fc5f813b2b889a0816. Other worktrees and the default main branch are out of scope.

The affected behavior is typing in a populated recipe collection. Existing master already debounces requests and memoizes individual cards. The remaining synchronous work must be reduced without changing search timing, displayed results, sorting, filtering, recipe actions, loading/error states, or layout.

## Measurement Contract

Established before editing application code on October 17, 2026.

Primary metric: median main-thread ScriptDuration in milliseconds across seven fresh Chromium contexts, each exercising seven search updates and the settled query in the production application with 300 recipes. Current value: 279.012 ms. Target and acceptance threshold: at least 70% lower, at most 83.7036 ms. A repeat candidate batch must also meet this threshold.

Secondary metric: median input-to-paint estimate across 49 updates, currently 32.3 ms. Acceptance requires at most 35 ms, all 300 cards retained, no page errors, unchanged visible content and responsive layout, and functioning recipe actions and query-driven updates. The presentation estimate is not physical keyboard or display latency.

Reproduction from this worktree, using the existing host tools:

```powershell
$node22 = 'C:\Users\czear\AppData\Local\npm-cache\_npx\1c42e2583fe60b26\node_modules\node\bin\node.exe'
& $node22 node_modules\next\dist\bin\next build
& $node22 node_modules\next\dist\bin\next start -p 3157
$env:PERF_URL = 'http://localhost:3157'
$env:PLAYWRIGHT_MODULE = (Resolve-Path '..\book-cook\node_modules\playwright').Path
$env:PERF_BROWSER = "$env:LOCALAPPDATA\ms-playwright\chromium-1243\chrome-win64\chrome.exe"
node specs\measure-recipe-grid.cjs .cache\perf-8d42b3ae\new-run
```

Use a fresh output directory for every run. Do not enable PERF_PROFILE for acceptance measurements.

## Before Evidence

Revision: 37eb5615c2633b9cd57bf8fc5f813b2b889a0816. Windows, AMD Ryzen 7 9800X3D, production build and server under Node 22.14.0, browser runner under Node 24.15.0, Chromium 153.0.8010.12. Viewport 1440x900, en-US, UTC, service workers allowed, no CPU throttling.

The unchanged production build passed. Dependencies were initially missing and restored from the existing frozen lockfile using Node 22. An optional dtrace-provider install failed without affecting installation or the production build. No dependency or lockfile changes were made.

Boundary: actual shipped React/Fluent code and DOM, with deterministic authenticated session and 300-recipe API responses. Initial loading, database latency, network variation, and screenshots are outside the timed interaction window. Seven native input events exercise React handlers, each followed by two animation frames; the final 700 ms wait includes the settled 300 ms debounced query. This is production-build fixture evidence, not live telemetry.

Raw baseline: `.cache\perf-8d42b3ae\before\results.json`, screenshots, and visible text. ScriptDuration observations: 259.578, 279.012, 318.138, 286.314, 268.005, 266.928, 286.686 ms. Median TaskDuration: 369.314 ms. All seven trials retained 300 cards without page errors; the title action opened for the correct recipe.

Discovery evidence: `.cache\perf-8d42b3ae\discovery\search.cpuprofile` and results. Sampling shows React reconciliation, recipe-page rendering, Fluent work, and garbage collection during otherwise unchanged collection updates. Source confirms the parent reconstructs 300 wrappers and a new RecipeProvider value for every search input, propagating context updates into every RecipeActions despite card memoization. Profiling is excluded from the acceptance baseline.

## Hypothesis and Alternatives

Hypothesis: memoizing the recipe-grid subtree, including its recipe-action provider, by the query result reference will avoid list reconciliation and provider-driven action updates while input text changes but recipe data does not. React Query already preserves structurally equal data references. Real changed results must still replace the subtree, and context changes within the subtree must remain reactive.

Alternatives: memoizing wrappers alone leaves provider-driven updates; stabilizing every provider callback/value is broader and still reconstructs the list; pagination or virtualization changes collection behavior; increasing debounce delays results without eliminating synchronous work. Choose a memoized JSX subtree, an existing repository pattern, and narrow the provider to its actual consumers. No custom comparator, new dependency, or global provider redesign is needed.

## Change

The final change memoizes the grid, fallback, and its recipe-action provider while leaving the header/search controls reactive. It preserves the provider across loading/error states. The first candidate containing only this boundary was not accepted: measured median scripting was 133.819 ms, a 52.04% reduction, above the fixed 83.7036 ms threshold.

Before further application edits, the candidate CPU profile at `.cache\perf-8d42b3ae\candidate-profile\search.cpuprofile` demonstrated substantial remaining DOM removal/insertion, Fluent disposal, and card mounting. Switching to an uncached search key temporarily removes all recipe data even when the returned collection is unchanged. Rebuilding 300 cards at query settlement defeats the stable render boundary.

Refined hypothesis: use TanStack Query's existing keepPreviousData helper while a changed search/sort/filter request is pending. This keeps existing cards mounted during a fast request. Preserve the existing delayed loading indicator for requests taking more than 300 ms by including isPlaceholderData in that timer's condition; initial loading, final empty results, and errors still use the existing fallbacks. The intentional visible difference is that pending requests retain the last collection instead of briefly flashing the empty-state screen. The change is gated by the query's placeholder state, not an indefinite stale-data fallback. Custom cross-query deep equality or manually caching results would add unnecessary state and invalidation risks.

The final implementation includes this helper and delayed-loading condition. Application changes are confined to `src\pages\recipes.tsx`. The existing search regression suite is extended, and `specs\verify-recipe-grid.cjs` exercises real production interactions using deterministic API fixtures.

## After Evidence

All batches use the same reproduction command, machine, browser settings, production mode, seven fresh contexts, and 300-recipe fixture. Acceptance batches do not enable profiling or CPU throttling.

| Batch | Median scripting, ms | Median main-thread tasks, ms | Median presentation estimate, ms |
| --- | ---: | ---: | ---: |
| Original master baseline | 279.012 | 369.314 | 32.3 |
| Boundary-only candidate | 133.819 | 210.878 | 32.6 |
| Boundary-only repeat | 135.582 | 212.511 | 32.5 |
| Final candidate | 65.422 | 83.382 | 32.6 |
| Final candidate repeat | 65.879 | 84.178 | 32.6 |

Final scripting decreased 213.590 ms, or 76.55%. The repeat decreased 213.133 ms, or 76.39%. Final main-thread task time decreased 77.42%. Presentation estimates remain effectively unchanged at the two-frame measurement granularity; no keyboard-latency improvement is claimed.

Original machine-readable runner output from every batch is committed in `specs\performance-evidence-8d42b3ae\*.json`. The final batches retained 300 cards in all 14 trials with no page errors. Baseline and final desktop/mobile screenshots and visible body text are retained beside the JSON; both PNG pairs and the text are byte-identical. Local build logs and coverage output are retained under `.cache\perf-8d42b3ae\logs`. Discovery and candidate profiles remain under that cache directory.

The final production source is the `src\pages\recipes.tsx` diff in the delivery commit against baseline 37eb5615. There are no dependency, lockfile, framework, or configuration changes.

## Behavior Verification

The complete Jest coverage run passed: three suites, 13 tests, one snapshot. New regression cases prove that unchanged search inputs do not rerender the grid/provider, changed query data and empty results replace cards, pending requests retain existing data, and requests exceeding 300 ms still show loading followed by the error fallback when they fail. Existing debounce, sorting, tag-filter, card-prop, navigation, and badge tests remain green.

The final production build, standalone TypeScript check, lint with zero warnings/errors, and whitespace check passed. Baseline and candidate builds emit the same existing Edge Runtime compatibility warnings; they are not introduced by this change.

Targeted Prettier checks passed for all changed source and executable verification files. The repository's pre-commit hook runs a whole-tree formatting write, so it is not invoked for publication to avoid unrelated rewrites; the scoped formatting check and all correctness gates were run explicitly instead.

Production browser verification passed six checks with no page errors: matching DOM nodes survive a pending and completed search; sorting changes order; tag filtering/clearing replaces results; changing a title saves the correct recipe and updates the query; empty results remove stale cards and clearing restores them; clicking the updated card opens its correct detail page. Raw requests and outcomes are committed in `specs\performance-evidence-8d42b3ae\behavior.json`.

Reproduce those checks with the same production server and browser environment overrides:

```powershell
node specs\verify-recipe-grid.cjs .cache\perf-8d42b3ae\new-behavior-run
```

Visual inspection of the 1440x900 desktop and 390x844 mobile baseline/final screenshots found unchanged settled layout, controls, card spacing, dates, tags, and responsive structure. Exact PNG equality corroborates that inspection. Screenshots are captured after measurement with animations disabled.

## Acceptance Decision

Accepted. Both final medians, 65.422 and 65.879 ms, are below the original 83.7036 ms threshold. Their presentation estimates, 32.6 ms, are below 35 ms. Correctness, loading/error handling, actual changed results, recipe actions, and visual requirements passed. The boundary-only candidate was rejected against the same contract and was not published separately.

Limitations: this demonstrates a large-collection client interaction in a local production build with controlled API responses, not live-user telemetry or backend/network improvement. No initial-load, bundle-size, database, memory, physical-input-latency, or all-device improvement is claimed. Host scheduling variation remains possible; a repeated final batch reproduces the reduction. Slow requests intentionally retain the existing delayed loading screen, which can still unmount cards. The only intentional pending-state UX change is retaining the prior collection during a fast request instead of flashing an empty state.

## Delivery

Published directly to origin/master by a non-force fast-forward from 37eb5615 to implementation commit 0b92dbd073f595c4af893ac80ebbe07eb8675967 on October 17, 2026. `git ls-remote origin refs/heads/master` independently returned that exact commit after the push. This delivery-only follow-up records the observed publication; application code and measured artifacts are unchanged. The existing workflow targets main only, so no master CI run is claimed.

No blockers remain. Other worktrees and main were left unchanged. Full raw measurements, visual evidence, reproduction commands, and focused verification are included in the published implementation commit.
