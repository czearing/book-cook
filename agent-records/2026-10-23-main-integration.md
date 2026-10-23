# Software Change Record

## Context

The user authorized merging all recent agent fixes into main, including work
previously delivered to master and the separate tag-editor branch. Starting main:
f394b1d. Master delivery: 5d895a4. Tag-editor delivery: 32a6e0e.
The working tree was clean before integration. All original branches are retained.

## Acceptance Contract

Remote main contains the master and tag-editor histories and their intended fixes:
checkbox input, Settings layout, account layout, sidebar feedback, consistent
controls, recipe-list performance and collapsed unused tag input. Preserve main's
React 19, Lexical editor, CSS design system, sharing, uploads and newer application.
No force push, data writes or branch deletion. Verify types, lint, tests, build and
browser flows before reporting integration. Verify the exact remote main SHA.

## Discovery and Baseline

Main is 157 commits ahead of master; master has 16 commits absent from main.
The original fixes targeted Fluent UI and Tiptap, which main has replaced.
A normal history-preserving merge exposes modify/delete and content conflicts.
The tag-editor branch targets main and contains one recent fix.

## Working Explanation

Blindly choosing master's files would roll back main's newer application. Merely
choosing main would lose the fixes. Preserve current architecture and port each
observable fix into its owning main component, retaining historical records as
evidence of the original work rather than claiming their old results apply here.

## Design Decision

Use a real merge of master, resolve architectural conflicts in favor of the
current main ownership, and adapt affected behavior. Merge the separate tag fix
afterward. Alternative: replace main with master. Rejected because it discards
the newer application. Recovery is a normal revert of integration commits.

## Implementation Slices

1. Resolve architecture and dependency conflicts without reviving removed UI.
2. Adapt checkbox, Settings, sidebar, control and recipe-list behavior in main's
   existing cohesive modules. Keep new or modified hand-written files below 200
   physical lines; extract only meaningful reused boundaries when necessary.
3. Merge tag-editor fix, validate combined behavior, commit and push main.

File responsibilities and size estimates: editor integration and transformers
about 140 and 100 lines; Settings composition about 40 lines with cohesive
account, preferences and sharing modules each below 150; control appearance
ownership below 100 lines; paginated search below 150; browser fixtures and
individual regression files below 150. Final changed application, unit-test and
browser source files are all below 200 physical lines. Imported historical
performance evidence and its original scripts are retained without rewriting.

Excluded older March/April experimental feature branches. The recent branch
audit covers the October agent fixes, including master-contained local settings,
controls, checkbox, sidebar, search and grid branches, plus the tag branch.

## Regression and Behavior Evidence

Before the tag merge, `yarn jest --runInBand --silent` passed 41 suites and
336 tests, with the existing one-suite/one-test skip unchanged.
`yarn playwright test e2e --workers=1` passed seven isolated browser regressions:
checkbox shorthand, keyboard toggle, continuation, click, persistence, ordinary
lists, responsive Settings/profile layout, clear-history failure, and sidebar
interaction in both themes. The first checkbox run exposed generated checkmark
text contaminating accessible names. Drawing the mark with CSS borders fixed
the actual accessibility defect. All seven tests then passed.

The new fake-timer regression checks the exact 300ms search delay, latest query
payload, first-page reset before fetching, and timeout cleanup on unmount.
Button regressions cover all four legacy variants without competing appearance
classes. A render-count regression verifies unchanged RecipeCard props reuse
the existing render and updated props still navigate.
No schema migration or application data write is involved.

## Quality Review

`yarn build` passed with existing warnings. Scoped ESLint passed after import
ordering fixes. Full `yarn lint --no-cache` still reports eleven existing
warnings in unchanged cover-upload and upload API/test files.

Full `yarn tsc --noEmit --pretty false` reports 93 test-fixture diagnostics.
An untouched f394b1d source archive, with its original jest.setup.ts and
vitest.shims.d.ts and the same installed dependencies, reports the exact same
93 diagnostics. Comparing normalized diagnostic lines yields no differences.
The temporary baseline archive and extracted tree were removed. No type
exclusions, ignored errors, disabled lint rules, or weakened tests were added.

Main's existing cover-upload code imports an undeclared request presigner.
Added direct S3 client and presigner dependencies at matching 3.922.0 versions.
Confirmed the installed/transitive client version, compatible Node engine,
Apache-2.0 license and package dependency metadata before selecting them.
The repository uses Yarn Berry lockfile format 8; Yarn 4.9.2 immutable install
passed. The initial Yarn Classic lock conversion was discarded.

Removed merge-added obsolete Tiptap/Fluent modules and tests, replacing affected
behavior with active Lexical/CSS tests. Original branch history, delivery records
and measurement artifacts remain available. Historical measurements are not
claims about current-main performance.

The existing pre-commit hook formats the entire repository. Integration commits
use a command-local hooksPath override after explicitly formatting and linting
changed source, avoiding unrelated formatting edits.

## Acceptance Decision

Master adaptation passes its unit, browser and production-build gates. The
tag branch merged without conflicts. Final combined results:

| Command | Result |
| --- | --- |
| `yarn jest --runInBand --silent` | 42 suites and 345 tests passed; existing one-suite/one-test skip |
| `yarn playwright test e2e recipe-tags --workers=1` | All 9 browser tests passed |
| `yarn build` | Passed, including production compilation and page generation |
| `node node_modules\eslint\bin\eslint.js --max-warnings=0 <changed TS/TSX files>` | Passed |
| `node node_modules\prettier\bin\prettier.cjs --check <changed source files>` | Passed |
| `yarn tsc --noEmit --pretty false` | 93 pre-existing diagnostics, exactly matching untouched main |
| `yarn lint --no-cache` | Failed on 11 pre-existing warnings in unchanged files |
| `git diff --check` and staged equivalent | Passed |

The tag tests exercise blur collapse, pointer reopening, keyboard focus,
Enter/comma addition, removal and the empty placeholder. No browser writes leave
the mocked fixture. The broader pre-existing tests/ui.spec.ts was not run:
its recipe fixture returns the obsolete array response and its API mock lets
non-GET requests through. It is not evidence of isolated verification for this
integration. No retries or fixed sleeps were added to the new regressions.

Code review covered architecture preservation, shared transformer/appearance
ownership, disabled/focus behavior, accessible checkbox names, visible request
errors, callback stability and timer cleanup. No current-main speed improvement
or comprehensive security guarantee is asserted.

Branch integration and scoped behavior gates are satisfied locally. Remote
verification is pending below. Full-repository lint/type cleanliness remains a
pre-existing limitation, not a passing gate; this is not an all-checks-green
claim.

## Delivery

Record: agent-records/2026-10-23-main-integration.md.
Master merge: f403074. Tag history: 32a6e0e, merged with a separate two-parent
commit on main. Pending non-forced push and exact remote SHA verification.
