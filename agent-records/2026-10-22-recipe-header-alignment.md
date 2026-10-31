# Software Change Record

## Context

Task: align recipe header metadata labels with their values, including Tags
and its Add tags placeholder, and Created and its date.
Dedicated repository: `C:\Users\czear\AppData\Roaming\com.czearing.spool\projects\40a09451-fb3e-461b-9ba0-50ec2dae8580\book-cook-software-engineer-2`.
Starting revision: `f394b1dc1fb7f8a939ec8b8e576c0f5340bf3090`;
branch: `fix/recipe-gallery-alignment`.
Guidance: CLAUDE.md, supplied engineer specification and companion template.
Existing uncommitted work covers recipe actions, tag input collapse, gallery
alignment, their tests and records, and test-results metadata. Preserve it.
Only clean property-row files, a new focused test, and this record are in scope.

## Acceptance Contract

1. Created label and date share a text baseline within 0.25px.
2. Tags label and empty editor placeholder share a baseline within 0.25px.
3. Populated and wrapped tags align the label with the first text row, not the
   middle of the entire wrapped value. Check desktop and mobile layouts.
4. Preserve tag editing, focus, blur, removal, date formatting, icons, metadata
   columns and read-only rendering. No API or persistence changes.
5. Applicable checks pass and the authorized master merge is verified.

Exclusions: unrelated dirty work, global typography changes, data/API fixes.
Commands: focused Playwright regression and existing tag flows with retained
failure traces; relevant Jest tests; scoped Prettier and ESLint;
`yarn tsc --noEmit`; `yarn lint`; `yarn build`; `git diff --check`.
Unknown or failed required gates prevent a completion or merge claim.

## Discovery and Baseline

RecipePage renders RecipeView in editor mode. RecipeView passes the recipe and
mode to RecipeHeader, which owns local tags and forwards updates through its
save-state context. RecipePropertyRow is shared only by header metadata:
Chef, Tags, Created and Stats. Its label uses 14px MetaLabel, while values use
16px/1.5 BodyText and the tag editor uses 12px input/chips.
The row currently uses flex center alignment, including multiline values.
Nested tag editor and stats containers establish additional flex baselines.
Existing Playwright fixtures mock auth/recipe requests and reject unexpected
writes. They can exercise real CSS without production data.
Node 24.15.0, Yarn 1.22.22, Next 15.3.6, TypeScript 5.8.3, Playwright 1.58.2
are installed. Local Chromium exists under ignored `.cache\playwright`.
The repository default branch is main, but remote master now exists at
`a871f1478e54096f746ef1766245b81f2874a96d`.
Earlier records describe pre-existing lint/type/build failures; reconfirm them.
Browser baseline using the corrected geometry helper: all six focused tests
fail before implementation at a 0.25px threshold.
Created/date and empty placeholder baselines differ by 0.5px at both widths.
Populated tags differ by 0.5px on desktop and 26.5px on mobile, where the
fixture naturally wraps. A separate 1px-threshold baseline run reached the
forced-wrap assertion on desktop and also measured a 26.5px offset.
Failure traces are in `.cache\header-alignment-final-red`.

## Working Explanation

Centering boxes with different font metrics does not align text baselines.
Centering a tall tag value also moves its label away from its first line.
Supporting evidence: center alignment, unequal font sizes and wrapping flex
values, with measured browser baseline differences above.
Contradictory evidence: none in the baseline reproduction.
The first experiment disproved a row-only fix: the label's first child is an
icon, whose centered baseline is not the label text baseline. Baseline alignment
must also apply inside the label, leaving its icon independently centered.
The geometry helper must set explicit font properties because computed font
shorthand can be empty when numeric font variants are present. Initial metrics
using shorthand were discarded and the corrected helper will be re-baselined.
Smallest experiment: measure label/date and label/input text baselines before
and after replacing only the row alignment. Check wrapped tag first lines.
Jest alone cannot establish CSS geometry.

## Design Decision

Choose first-baseline flex alignment on the shared metadata row, preserving
existing typography and value-specific behavior. Extend styles only if measured
evidence shows nested controls fail to expose an appropriate baseline.
Apply baseline alignment inside the shared label too; center its icon with
align-self so text, rather than SVG geometry, determines the shared baseline.
Alternative: fixed row heights, value-specific offsets or equalized font sizes.
Reject offsets because they depend on fonts and wrapping; reject global font
changes because they broaden scope. Shared domain rules remain unchanged.
Risk: nested flex/input baselines or wrapping could differ; test real browser
geometry and existing tag interactions. Recovery: revert only this task's files.
No dependency or uncertain external API selection is needed.

## Implementation Slices

1. Add isolated browser regression in `tests\recipe-header-alignment.spec.ts`,
   projected 170 lines. Measure the intended geometry before implementation.
2. Correct shared `RecipePropertyRow.module.css`, projected 40 lines, plus
   directly necessary nested styles only if the experiment requires them.
3. Re-run behavior and quality checks; review every scoped line and record
   integration evidence. No legacy line-count exceptions are authorized.

## Regression and Behavior Evidence

Before: `yarn test:e2e recipe-header-alignment --project=chromium --trace retain-on-failure --output .cache\header-alignment-final-red`
failed all six tests for measured alignment offsets, not setup failures.
After: `yarn test:e2e recipe-header-alignment recipe-tags --project=chromium --trace retain-on-failure --output .cache\header-alignment-final-green`
passed all eight tests. After the locator-only refinement, the same command
with `--output .cache\header-alignment-verified` again passed all eight tests.
The six new tests cover 1440px desktop and 390px mobile, Created/date, Chef,
Stats, the empty placeholder, populated tags, forced multiline wrapping,
and first-line alignment after focus and blur. Tolerance is 0.25px.
The two existing browser tag tests preserve reopening by click and keyboard,
Enter/comma/blur commits, removal and the final-tag empty state.
Tests use local Chromium via PLAYWRIGHT_BROWSERS_PATH, isolated intercepted
API data, semantic locators, awaited geometry assertions and retained failure
traces. No fixed sleeps, retries, live writes or production data are involved.
The new tests do not require the unrelated uncommitted input aria-label.

`yarn test --runInBand --runTestsByPath src\components\RecipeView\RecipeHeader\RecipeTags\RecipeTags.test.tsx src\components\RecipeView\RecipeHeader\RecipeCoverUpload\RecipeCoverUpload.test.tsx`
passed 18 tests across two suites, including duplicate rejection and tag
normalization. No API error handling, ownership or persistence behavior changed.
Read-only rendering shares the same row CSS; markup and callbacks are unchanged
by source review. There is no separate viewer route available for a browser flow.
Concurrency, migrations and asynchronous resource cleanup are not applicable:
production changes consist only of three CSS declarations.

## Quality Review

`yarn prettier --check tests\recipe-header-alignment.spec.ts src\components\RecipeView\RecipeHeader\RecipePropertyRow\RecipePropertyRow.module.css agent-records\2026-10-22-recipe-header-alignment.md`:
passed for all three scoped files.
`yarn lint --file tests\recipe-header-alignment.spec.ts`: passed, no warnings.
`yarn tsc --noEmit --pretty false`: failed before and after, with the exact
same 94 diagnostics and no introduced or removed diagnostics. Logs:
`.cache\header-baseline-types.log` and `.cache\header-final-types.log`.
`yarn lint`: failed on pre-existing upload-related warnings and unresolved
`@aws-sdk/s3-request-presigner` in the upload presign route.
`yarn build`: failed during its lint gate on the same unresolved import and
existing warnings. Logs: `.cache\header-baseline-lint.log`,
`.cache\header-build.log`. No manifests/dependencies or controls were changed.
`git diff --check`: passed.
Changed-line review: the row and label use first-baseline alignment; the icon
uses align-self center to keep its appearance without exporting its SVG
baseline. Typography, spacing, row sizing, responsive column rules, labels,
focusability, text editing and data contracts are unchanged.
No new runtime JavaScript, dependency, external API, security boundary or
accessibility interaction is introduced. No performance gain is claimed.
Modified production CSS is 34 lines and the new browser test is 154 lines,
both below the 200-line limit. No legacy exception is needed.

## Acceptance Decision

Partial, integration blocked.
Criteria 1 to 3 have passing desktop/mobile browser evidence at the exact
0.25px threshold. Criterion 4 has passing adjacent interaction/unit tests and
source review showing unchanged typography, markup and data paths.
Criterion 5 is unmet: required repository-wide lint, type and build gates fail
for pre-existing issues. Scoped passing checks do not waive these failures.

## Delivery

Saved locally on the existing `fix/recipe-gallery-alignment` branch.
Scoped production change:
`src\components\RecipeView\RecipeHeader\RecipePropertyRow\RecipePropertyRow.module.css`.
Regression: `tests\recipe-header-alignment.spec.ts`.
Completed record: `agent-records/2026-10-22-recipe-header-alignment.md`.
Remote master exists, but no commit, push, PR or master merge was performed
because the required checks fail. No successful integration is claimed.
Unrelated existing work was preserved and is not part of this task's change.
Remaining limitations: repository-wide failures and Chromium-only browser
verification; read-only rendering was source-reviewed, not separately mounted.
