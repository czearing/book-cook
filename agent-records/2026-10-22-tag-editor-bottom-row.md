# Software Change Record

## Context

Task: prevent an empty bottom row after clicking away from adding recipe tags.
Dedicated repository: `C:\Users\czear\AppData\Roaming\com.czearing.spool\projects\40a09451-fb3e-461b-9ba0-50ec2dae8580\book-cook-software-engineer-2`.
Starting revision: `f394b1dc1fb7f8a939ec8b8e576c0f5340bf3090`.
Initial worktree is clean. Guidance: `CLAUDE.md`, supplied engineer design
specification and job template. Changes are limited to inline recipe tags,
their regression coverage, and this requested record.

## Acceptance Contract

1. After leaving a populated tag editor, its height includes only actual tag
   rows, including when the final tag fills the available width.
2. Clicking the editor or keyboard-focusing its input permits adding more tags.
3. Empty recipes retain the add-tags placeholder. Enter, comma, blur commits,
   normalization, duplicate rejection, removal, and read-only tags are preserved.
4. Required checks pass and authorized integration is recorded accurately.

Exclusions: tag management dialog, API/storage changes, unrelated header styling.
Commands: targeted Jest tests; targeted Playwright with `--trace retain-on-failure`;
Prettier check; scoped ESLint; `yarn tsc --noEmit`; `yarn build`.
Existing documented `yarn lint` is also checked for compatibility.

## Discovery and Baseline

`RecipeHeader` renders `RecipeTags` in the Tags property row for editable recipes.
It owns local tags and forwards updates to `RecipeViewSaveStateContext`.
`RecipeTags` is a controlled component and owns only pending input text.
Its editor is a wrapping flex container. The input always occupies a flex slot
with a 40px minimum width, even after blur clears a committed value.
`ChangeTagsDialog` is separate and is not involved.
Existing class composition uses `clsx`. Jest/RTL and Playwright are established.
Browser tests already mock auth and recipe endpoints; no live data is needed.
History shows this inline editor predates this task.
Runtime: Node 24.15.0, Yarn 1.22.22; manifest Next 15.3.6, React 19,
TypeScript ^5.8.3, Playwright ^1.58.2.
Baseline adjacent upload test cannot start because Jest is not installed.
Dependency restoration is now justified by that missing-tool failure.
Remote/default branch is `main`; no local or remote `master` exists.

## Working Explanation

The unused input becomes an additional flex row when remaining inline space is
less than its minimum width plus the gap. Blur does not change its layout.
Supporting evidence: unconditional input rendering and `.tagInput` min-width.
Contradictory evidence: none. Browser geometry reproduces a 24px extra row.
Smallest experiment: constrain the editor to exactly one tag's width, focus then
blur the input, and compare editor height with that tag's height.
Unit DOM assertions alone cannot prove layout because jsdom has no layout engine.

## Design Decision

Choose a conditional CSS class on populated editors' input, taking it out of
normal flow only when unfocused. Keep it focusable so existing container click
and keyboard navigation restore the normal input layout without new state.
Anchor its absolute positioning to the editor.
Alternative: conditional rendering with React focus state and a new add button.
Rejected because it adds interaction state and changes keyboard/accessibility UX.
No domain logic is moved or duplicated. Risk: losing the ability to reopen or
focus the collapsed input; cover both in browser tests. Recovery: revert the
isolated class/style change. No dependency or API selection is required.

## Implementation Slices

1. Regression coverage: new RecipeTags Jest test file, projected 120 lines;
   isolated Playwright tag flow file, projected 150 lines. Establish red layout
   regression and preserved controlled-input behaviors.
2. Layout fix: RecipeTags.tsx, projected 90 lines; CSS module, projected 85 lines.
   Add an input label and conditional collapsed style; preserve tag callbacks.
3. Verification and delivery: run recorded checks, review diff, complete record.
   No task-authorized legacy line-count exceptions are required.

## Regression and Behavior Evidence

Before fix: 18 Jest tests passed across RecipeTags and adjacent cover upload.
Playwright layout assertion failed for the intended reason: expected excess
height below 1px, received 24px after input blur. Empty editor browser test passed.
Failure trace retained in ignored `.cache/tag-tests-before`.
After fix: the same browser layout assertion passes, including after Enter and
blur commits. Clicking a chip reopens the input; Tab from the final remove button
focuses it. Removing every tag restores the placeholder and comma adds a tag.
The input now has the accessible name "Add tags".
`yarn test --runInBand --runTestsByPath src\components\RecipeView\RecipeHeader\RecipeTags\RecipeTags.test.tsx src\components\RecipeView\RecipeHeader\RecipeCoverUpload\RecipeCoverUpload.test.tsx`:
passed, 18 tests in 2 suites, both before and after.
`yarn test:e2e recipe-tags --project=chromium --trace retain-on-failure --output .cache\tag-tests-after`:
passed, 2 tests. Uses repository-local Chromium via `PLAYWRIGHT_BROWSERS_PATH`,
isolated mock session/recipe data, real CSS geometry, semantic controls,
awaited assertions, no fixed sleeps or retries, and failure traces.
Browser mocks reject unexpected API requests and all writes.
No concurrency or migration paths apply to this synchronous presentation change.
API failure handling is unchanged; no API calls are added.

## Quality Review

Dependency setup: global Yarn 1 cannot consume the Yarn modern lockfile.
Its temporary resolution produced an MSW ESM setup failure before any test ran.
Yarn 4.18.1 immutable install rejected lockfile migration; its generated config
changes were removed. `corepack yarn@4.9.2 install --immutable` succeeded with
the exact checked-in versions and no manifest/lockfile changes. Jest then passed.
Missing Chromium was installed under ignored repository-local `.cache/playwright`.
`yarn prettier --check` on the 5 changed files: passed.
`yarn lint --file src\components\RecipeView\RecipeHeader\RecipeTags\RecipeTags.tsx --file src\components\RecipeView\RecipeHeader\RecipeTags\RecipeTags.test.tsx --file tests\recipe-tags.spec.ts`:
passed with no warnings or errors.
`yarn tsc --noEmit`: failed on 95 existing diagnostics. An in-memory TypeScript
compiler-host comparison against original HEAD source, excluding only the added
test files from the baseline, confirmed 95 baseline and 95 current diagnostics,
zero introduced and zero resolved.
`yarn lint`: failed on existing upload-related warnings and the unresolved
`@aws-sdk/s3-request-presigner` import in `src/pages/api/upload/presign.ts`.
`yarn build`: failed at that same missing dependency. Its import exists in the
starting revision and the dependency is absent from the manifest. No check was
disabled, and no unrelated upload/dependency changes were made.
Build and lint output are retained under ignored `.cache`.
`git diff --check`: passed.
Changed-line review: layout is local to populated editable inputs; no tag
normalization, data ownership, persistence, read-only navigation, or error
handling changed. The input remains focusable without introducing event handlers,
timers, effects, or external resources. Browser focus checks passed.
All changed hand-written code files are below 200 physical lines.
No security boundary or persistent-data contract changes were made.
Performance benchmarking is not applicable to this small layout correction;
no performance improvement is claimed.

## Acceptance Decision

Partial, with integration blocked.
Criteria 1 to 3 have passing behavior evidence, including a measured failing
layout regression before the fix and passing geometry after it.
Criterion 4 is blocked by pre-existing full lint/type/build failures and the
absence of the requested `master` branch. Scoped checks passing do not establish
repository-wide readiness. No merge is claimed.

## Delivery

Implemented locally on `fix/tag-editor-bottom-row`, based on `main`.
The CSS collapses the unfocused input out of flex flow only when tags exist,
preserving empty-state and focused editing layout. Regression tests accompany it.
Changes and this record are saved in the dedicated repository.
Record: `agent-records/2026-10-22-tag-editor-bottom-row.md`.
Integration limitation: the requested `master` branch does not exist; repository
default is `main`. Do not create a replacement branch or claim a master merge.
Follow-up authorization: the user explicitly requested committing and pushing
the local fix. Delivery target is `origin/fix/tag-editor-bottom-row`, containing
only the tag component, CSS, unit tests, browser tests, and this record.
Other tasks now have uncommitted work in this checkout, so an isolated Git index
is used to preserve their branch, index, and working files without including them.
Remote commit verification is reported in the delivery response.
No PR or merge is claimed. Repository-wide check failures and the original
integration gate remain blocked, not waived by publishing the fix branch.
