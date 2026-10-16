# Performance Review Record

## Context

Task 89fa2072 requests a safe, substantial production performance improvement published to master. Work is isolated in book-cook-perf-89fa2072, based on origin/master at 0d87201. The unrelated main and recipe-search worktrees must remain unchanged.

## Measurement Contract

Primary metric: Chromium main-thread ScriptDuration, milliseconds for seven search input updates through paint and the settled debounced query in a rendered 300-recipe collection. Current median: 822.644 ms across seven fresh contexts. Target and acceptance threshold: at least 50% lower, at most 411.322 ms. Secondary metric: median input-to-paint latency, currently 88.7 ms across 49 updates; acceptance requires no regression and a target of at most 50 ms. All 300 cards, visible text, navigation, updated props, search debouncing, and menus must remain correct.

Reproduction from this worktree:

```powershell
npx --yes --package=node@22.14.0 -c "node node_modules\next\dist\bin\next build"
npx --yes --package=node@22.14.0 -c "node node_modules\next\dist\bin\next start -p 3147"
$env:PLAYWRIGHT_MODULE=(Resolve-Path '..\book-cook\node_modules\playwright').Path
$env:PERF_BROWSER="$env:LOCALAPPDATA\ms-playwright\chromium-1243\chrome-win64\chrome.exe"
node specs\measure-recipe-grid.cjs .cache\perf-89fa2072\new-run
```

Playwright and Chromium are existing host test tools, not application dependencies. The script also works with a normally installed Playwright module and its matching browser when the environment overrides are omitted.

## Before Evidence

Baseline revision: 0d8720105432b4231dde2e899bb1fd90970ea564. Host: Windows, AMD Ryzen 7 9800X3D, initial Node 24.15.0 and Yarn 1.22.22. The first build failed because this fresh worktree had no dependencies. Lockfile restoration under Node 24 failed because the locked Renovate version requires Node 20 or 22. Restoration succeeded under Node 22.14.0 without changing manifests or lockfiles.

Restoration and the unchanged production build succeeded under Node 22.14.0. Browser runner: Node 24.15.0; Chromium 153.0.8010.12; 1440x900; en-US; UTC; service workers enabled. Real production React, Fluent components, layout, and DOM are exercised with deterministic authenticated session and API responses. The fixture is a 300-recipe cookbook with stable IDs, timestamps, and tags. The boundary excludes initial load, database latency, and network variation. This is a reproducible large-collection interaction measurement, not a claim about live user telemetry or every collection size.

Raw evidence: `.cache\perf-89fa2072\before-valid\results.json`, `recipes.png`, and `visible-text.txt`. Seven ScriptDuration observations: 822.644, 814.072, 867.530, 893.592, 896.277, 821.490, 815.668 ms. Median TaskDuration: 1015.754 ms. All trials rendered 300 cards with no page errors.

Separate diagnostic CPU profile: `.cache\perf-89fa2072\diagnostic\search.cpuprofile` and `profile-summary.json`. The largest application self-time samples map to the shipped RecipeCard render (132.146 ms) and recipe-map callback (73.695 ms), both executing toLocaleDateString. Initial diagnostic service-worker blocking caused a PWA error, so that run was excluded; the accepted baseline uses normal enabled service workers.

## Hypothesis and Alternatives

Hypothesis: search context updates rerender the whole recipe grid despite stable recipe data. Each card is reconstructed, and the page formats its timestamp before the card parses and formats it again. Passing the raw timestamp and memoizing RecipeCard with React's default shallow comparison should remove redundant card work without changing list contents or introducing custom equality logic.

Alternatives: virtualization or pagination would change scrolling and collection behavior; increasing the existing 300 ms debounce would postpone results without removing synchronous work; a shared date formatter would reduce only one part of rendering; global provider restructuring is broader than necessary. The selected change is confined to the existing card boundary and its listing caller. Context consumers inside cards still receive their updates through React context.

## Change

Wrapped RecipeCard in React.memo with default shallow prop comparison. Passed the original createdAt timestamp from the listing instead of localizing it in the parent and parsing/localizing it again in each card. No custom comparator, dependency, provider restructuring, or pagination change was introduced.

Passing the precise timestamp follows the existing carousel caller and also preserves the intended rolling 24-hour NEW badge calculation instead of rounding creation to localized midnight. Regression tests cover 22-hour and 25-hour ages. The displayed calendar date remains unchanged in the production fixture.

## After Evidence

Measured on October 16, 2026. The candidate is the two-file source diff delivered with this review, built against baseline 0d87201. Each batch contains seven fresh browser contexts and 49 input updates. Medians are calculated by numeric sorting, selecting the middle observation. No CPU throttling or profiling was enabled during these batches.

| Production batch | Scripting, ms | Main-thread tasks, ms | Input-to-paint estimate, ms |
| --- | ---: | ---: | ---: |
| Original baseline | 822.644 | 1015.754 | 88.7 |
| Candidate | 408.333 | 510.770 | 32.4 |
| Candidate repeat | 380.337 | 486.770 | 32.2 |
| Exact baseline reversal | 715.263 | 910.128 | 73.1 |
| Final candidate | 395.070 | 504.258 | 32.4 |

Final scripting decreased 51.98% versus the original baseline and 44.77% versus the later reversal. Final input-to-paint estimate decreased 63.47% versus the original baseline and 55.68% versus the reversal. Restoring the exact baseline source and rebuilding reproduced the expensive behavior. Its median was 13.05% lower than the initial baseline, demonstrating host/timing variation. Consequently, a universal 50% improvement is not claimed. All three candidate batches independently satisfy the original fixed 411.322 ms threshold.

Raw observations from all five batches are committed in `specs\performance-evidence-89fa2072\*.json`. These are direct copies of runner output, not reconstructed aggregates. Desktop and mobile baseline-reversal/final screenshots and visible text are retained beside them. The full diagnostic CPU profile remains locally available under `.cache\perf-89fa2072\diagnostic`.

The input-to-paint estimate starts immediately before dispatching a bubbling native input event and ends after two animation frames. It exercises the shipped React handler and rendering, not physical keyboard, browser input-queue, or display-hardware latency. The timed CDP window also includes the final 700 ms debounce-settling wait. Menu checks, screenshots, and mobile resizing occur after that window.

## Behavior Verification

All 35 production trials displayed 300 cards without page errors. Baseline-reversal and final visible body text are byte-identical. The Change Title menu opens for the correct first recipe and cancels correctly in both builds, confirming that context-consuming descendants still respond.

Visual inspection of settled 1440x900 desktop and 390x844 mobile screenshots found the same card layout, dates, tags, controls, spacing, and responsive arrangement. Animations were disabled only when capturing screenshots after measurement.

The complete existing Jest suite plus the new RecipeCard regression tests passed: three suites, ten tests, one snapshot. Coverage includes unchanged-prop render skipping, updated title/date/tags and navigation, precise 24-hour badge timestamps, minimal cards, search debouncing/cancellation, and SearchBar behavior. Production build and type checking passed under Node 22.14.0. Lint passed with the existing import-order warning in `recipes-search.test.tsx`; no unrelated lint edits were made. `git diff --check` passed.

## Acceptance Decision

Accepted against the predeclared original-baseline contract: final 395.070 ms is below 411.322 ms, and 32.4 ms input-to-paint estimate is below 50 ms without a regression. Correctness and visual requirements passed.

Limitations: deterministic API fixtures isolate a 300-card client interaction, not live traffic, backend latency, initial load, other collection sizes, or other devices. Timing drift makes the later paired 44.77% scripting and 55.68% presentation-estimate improvements the more conservative observations. Context-driven action components still update, so this does not eliminate every grid update. Shared startup JavaScript remains about 260 kB; no startup improvement is claimed.

## Delivery

Requested target: origin/master, not the default origin/main. The target remained at the measured baseline immediately before publication. The repository workflow targets main only, so it does not supply master CI; the full local correctness suite, production build, lint, browser measurements, and visual checks above are the publication gate. Merge status is recorded in the associated pull request rather than predicted here.
