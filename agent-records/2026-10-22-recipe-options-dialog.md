# Software Change Record

## Context

Task: Replace persistent floating recipe actions with a three-dot options dialog, following existing design patterns and researched layouts.
Dedicated repository: `C:\Users\czear\AppData\Roaming\com.czearing.spool\projects\40a09451-fb3e-461b-9ba0-50ec2dae8580\book-cook-software-engineer-2`.
Baseline revision: `f394b1dc1fb7f8a939ec8b8e576c0f5340bf3090`.
Guidance: `CLAUDE.md`, supplied design spec and job template, repository PR template.
Existing unrelated changes: RecipeTags TSX/CSS, RecipeTags test, recipe-tags browser test, and tag-editor job record. Preserve and exclude from this change.

## Acceptance Contract

1. Unchanged recipes show an accessible three-dot header action, not a floating save bar.
2. Activating it opens a compact, titled dialog with Save changes, Discard changes, and visually separated Delete recipe options. Save/discard are disabled without edits.
3. Saving persists edited fields; discarding restores persisted content. Dismissing the dialog preserves edits.
4. Deletion requires a named-recipe confirmation, provides a safe cancel, blocks duplicate submissions, navigates after success, and exposes failure without losing the recipe.
5. Keyboard dismissal, focus restoration, narrow-screen layout, and mutation pending/error states work.
6. Scoped Jest, isolated Playwright flows, formatting, lint, type check, and build provide evidence. Required integration targets remote `master`, which explicit remote discovery found despite the initial local branch inventory only listing main.
   Preserved: inline title, emoji, tags and body editing; existing save payload and cache invalidation; server authorization; cover uploads.
   Excluded: card menus, tag layout changes, API redesign, autosave, global lint cleanup.
   Verification commands and results are recorded in Regression and Behavior Evidence and Quality Review below. Browser selectors use filenames because Playwright treats Windows path separators as regular-expression escapes.

## Discovery and Baseline

Active route `pages/recipes/[recipes].tsx` renders RecipePage, which owns PUT persistence, editor reference and save status. RecipeView owns the header/editor composition; RecipeViewSaveStateContext owns unsaved title/emoji/tags/body state. RecipeSaveBar is floating; it checks dirty state but provides no deletion. The separate RecipeActions card component uses a legacy context with default no-op actions, so it cannot safely be reused for this page.
Reusable primitives: Radix-backed Dialog, DialogTrigger, DialogContent, DialogHeader/Body/Footer, Button ghost/primary/destructive, Phosphor DotsThreeIcon. Delete API wrapper and mutation hook already exist.
Runtime: Node 24.15.0, Yarn 1.22.22; installed Next 15.3.6, React 19, Playwright 1.58.x, Jest 30. Dependencies already installed.
Existing browser fixtures intercept auth and recipe APIs with isolated data. Existing tag work remains outside scope.
Primary research: Paprika Android guide https://www.paprikaapp.com/help/android/ places recipe actions in a toolbar and uses contextual actions for photos. Material https://m1.material.io/patterns/confirmation-acknowledgement.html recommends meaningful action-specific confirmation titles and explaining consequences. NN/g https://www.nngroup.com/articles/confirmation-dialog/ recommends identifying the deleted object and avoiding generic confirmation copy. Search synthesis claims about exact Samsung/Paprika confirmation wording are unverified and are not adopted.
Baseline: `yarn test:e2e recipe-options.spec.ts --grep 'clean options' --trace retain-on-failure` fails waiting for the missing Recipe options trigger. The clean page did not show Save, contradicting unconditional floating-bar behavior. Initial Windows path selector found no tests; filename selector correctly runs the regression.
`yarn tsc --noEmit` fails with 94 existing errors, including API test mocks, browser NodeList iteration, and the missing AWS presigner module. `yarn lint` fails on existing repository-wide errors/warnings. Logs are retained locally under `.cache\recipe-options-baseline-*`.

## Working Explanation

The save controls are mounted separately from the header, keeping actions spatially detached from the recipe. Moving page-owned actions to an explicit three-dot dialog eliminates floating controls regardless of dirty initialization and retains the existing persistence boundary.
Contradictory evidence: the current save bar already hides when clean and idle, so an unconditional-render explanation is incorrect. The browser baseline confirmed no Save button on the clean fixture. Dirty initialization was not established as a separate defect and is not changed.
Smallest experiment: open an isolated unedited recipe, inspect the action trigger and disabled Save, then edit the title and verify the actual PUT payload.
Experiment outcome: the baseline lacked the trigger; the implemented browser flow verifies disabled clean actions, title persistence after reload, and discard. Required integration remains blocked as described in Delivery.

## Design Decision

Chosen: header action slot passed through RecipeView, rendering a small RecipePageActions dialog. Page retains save/discard; actions component owns delete mutation and confirmation. Use a vertical choice list, primary save, secondary discard, separator and destructive delete. Confirmation names the recipe and explains permanent deletion with Cancel first.
Alternative: dropdown menu followed by separate dialogs. Rejected because the request explicitly asks the three-dot trigger to open a dialog of options; a second navigation layer adds unnecessary interaction.
Risks: remounting provider after save/discard, focus restoration, overlapping mutations. Keep dialog mounted while saving, prevent conflicting actions while pending, and exercise actual browser focus. Recovery: revert this scoped commit; no schema or migration changes.

## Implementation Slices

1. Regression tests: RecipePageActions Jest (~160 lines), recipe-options Playwright (~190 lines). Establish red behavior before implementation.
2. UI: RecipePageActions (~170 lines) and CSS (~25 lines); header slot in RecipeView/types and RecipeHeader/types/CSS (each resulting file below 200 lines).
3. Wire page save/discard/status to dialog, remove floating bar from this route, and verify save errors/pending and delete outcomes. RecipePage remains below 200 lines.
   No legacy line-count exception requested or authorized.

## Regression and Behavior Evidence

Baseline red: `yarn test:e2e recipe-options.spec.ts --grep 'clean options' --trace retain-on-failure` failed waiting for the absent Recipe options trigger.

Final unit command: `yarn test --runInBand --runTestsByPath src\components\RecipePage\RecipePageActions.test.tsx src\components\RecipeView\RecipeHeader\RecipeTags\RecipeTags.test.tsx` passed 17 tests: eight new action cases and nine existing tag cases. Coverage includes clean/dirty choices, save/discard callbacks, pending save/delete dismissal blocking, duplicate-delete prevention, safe Cancel focus, visible failures, and both rejected and cancelled navigation after successful deletion.

Final browser command: `yarn test:e2e recipe-options.spec.ts recipe-tags.spec.ts --trace retain-on-failure` passed five Chromium tests, including three options tests and two existing tag flows. Isolated API interception verifies save failure/retry, reload persistence, discard, dismiss-without-discard, delete confirmation/cancel/failure/retry/navigation, 375px dialog bounds, pointer access, Escape, and restored trigger focus.

An intermediate browser run exposed the full-width emoji container intercepting pointer events after absolute positioning of the trigger. Adding a scoped stacking layer fixed it without moving the cover/emoji layout. Both desktop click flows and the mobile click/keyboard flow pass without forced clicks, sleeps, or retries. The app already retries failed mutations once; assertions preserve that behavior rather than changing shared retry policy.

Concurrency: pending mutations disable conflicting choices and prevent dismissal; unit tests verify one delete submission while pending. Migration: not applicable because storage schema is unchanged. Browser engines other than Chromium and live-backend operation were not exercised; intercepted fixtures avoid production writes.

## Quality Review

Formatting passed for all ten task-owned code/style files:

```powershell
yarn prettier --check src\components\RecipePage\RecipePage.tsx src\components\RecipePage\RecipePageActions.tsx src\components\RecipePage\RecipePageActions.test.tsx src\components\RecipePage\RecipePageActions.module.css src\components\RecipeView\RecipeView.tsx src\components\RecipeView\RecipeView.types.ts src\components\RecipeView\RecipeHeader\RecipeHeader.tsx src\components\RecipeView\RecipeHeader\RecipeHeader.types.ts src\components\RecipeView\RecipeHeader\RecipeHeader.module.css tests\recipe-options.spec.ts
```

Scoped lint passed with zero warnings:

```powershell
yarn eslint src\components\RecipePage\RecipePage.tsx src\components\RecipePage\RecipePageActions.tsx src\components\RecipePage\RecipePageActions.test.tsx src\components\RecipeView\RecipeView.tsx src\components\RecipeView\RecipeView.types.ts src\components\RecipeView\RecipeHeader\RecipeHeader.tsx src\components\RecipeView\RecipeHeader\RecipeHeader.types.ts tests\recipe-options.spec.ts --max-warnings=0
```

Repository ESLint ordering was used where its external-import alphabetization differs from the requested generic next-before-libraries grouping. An intermediate PowerShell array invocation passed the filenames as one pattern and checked no files; literal-argument commands above replaced it and passed.

`yarn tsc --noEmit` failed with the same 94 baseline diagnostics; comparison of the baseline and final error lines produced no differences. `yarn lint` failed on pre-existing repository-wide problems, including unresolved `@aws-sdk/s3-request-presigner`. `yarn build` failed at `src\pages\api\upload\presign.ts:3:30` because that module is missing. No checks were suppressed and no unrelated dependency changes were made. Evidence logs: `.cache\recipe-options-final-types.log`, `.cache\recipe-options-baseline-lint.log`, `.cache\recipe-options-build.log`.

Final diff review covers every task-owned line. `git diff --check` passed. All ten task-owned code/style files remain below 200 physical lines; the largest is the browser test at 198 lines. No legacy exception is used.

Accessibility: labeled three-dot trigger; shared Radix dialog semantics, description and focus trapping; Escape/focus-return browser assertions; safe Cancel focus for deletion; explicit accessible names while shared loading buttons hide their children; visible alert errors. Header actions are positioned without changing normal emoji/cover flow.

Compatibility and cleanup: optional action slots preserve other RecipeView callers; save payload and cache invalidation remain page-owned; existing delete wrapper handles encoded IDs; server authorization is unchanged. Save/discard remounts retain existing state-reset behavior. The obsolete post-save timeout was removed; no new timer, listener, dependency, or background resource is introduced.

Performance: no performance improvement claimed; bundle or runtime benchmarks are not applicable to a claimed optimization because none is made. Security: existing authenticated API boundaries remain unchanged; all browser data and mutations are intercepted. Unrelated tag edits are preserved and excluded from this task.

## Acceptance Decision

Partial, integration blocked.

1. Passed: clean recipe has the labeled header trigger and no floating Save control.
2. Passed: dialog choices use existing primitives; clean save/discard are disabled; destructive delete is separated.
3. Passed: save persists after reload, discard restores saved title, dismissal retains edits, and save failures retain retryable changes.
4. Passed: named confirmation, safe Cancel, pending duplicate prevention, visible delete failure/retry, success navigation, and navigation-failure reporting have test evidence.
5. Passed within the exercised Chromium scope: keyboard/focus restoration, pointer access, narrow-screen bounds, and mutation pending/error handling.
6. Partial: scoped unit/browser/lint/format gates pass, but full lint/type/build gates fail on existing issues and master integration is not completed. No global-check or merge success is claimed.

## Delivery

Change location: this dedicated worktree on `fix/recipe-options-dialog`, based on `f394b1dc1fb7f8a939ec8b8e576c0f5340bf3090`. Source changes and this completed record are saved locally. No commit, push, PR, or merge was performed.

Required integration result: blocked, not merged. The default branch is main, while fetched remote master is `a871f1478e54096f746ef1766245b81f2874a96d`. The histories have 157 current-side commits and eight master-side commits after their merge base, and master uses an older RecipeProvider/framer-motion page architecture. Merging this branch directly would import unrelated architectural history. The user also requires all required checks passing before integration; existing lint/type/build failures prevent that gate.

Recovery and next required decision: resolve the baseline check failures and establish an authorized integration strategy for the divergent master architecture before committing and merging. Do not bypass gates, overwrite unrelated work, or merge the main lineage wholesale.

Job record: `agent-records\2026-10-22-recipe-options-dialog.md`. Remaining limitations: full repository validation, production build, and master integration are unmet; only Chromium with isolated API fixtures was exercised. This is a partial delivery, not completion.
