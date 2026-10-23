# Software Change Record

## Context

Task: make `[]` create a formatted checkbox in the recipe editor.
Dedicated repository: `C:\Users\czear\AppData\Roaming\com.czearing.spool\projects\40a09451-fb3e-461b-9ba0-50ec2dae8580\book-cook`.
Starting worktree was clean on main at f394b1d. Requested integration target master
uses Tiptap rather than main's Lexical editor. Work is based on origin/master at
a871f14 on branch fix/markdown-checkbox-20261022. No unrelated migration is included.
Guidance: CLAUDE.md, supplied design spec and supplied software change template.

## Acceptance Contract

1. Typing `[] ` or `[ ] ` at the start of a paragraph creates an unchecked task.
2. Typing `[x] ` creates a checked task. Native checkbox interaction updates HTML.
3. Task content and checked state survive sanitization, save serialization and reload.
4. Viewer mode displays tasks without allowing changes.
5. Ordinary paragraphs, bullet lists, ordered lists and existing formatting survive.

Excluded: replacing the editor, importing arbitrary Markdown documents, unrelated UI.
Planned checks: scoped Jest regression tests, browser interaction with isolated data,
Prettier check, scoped ESLint, TypeScript noEmit, production build and broader Jest.
Required integration: commit, push and merge only the scoped fix to master, as
authorized by the explicit integration instruction.

## Discovery and Baseline

Master's Editor uses getEditorExtensions with StarterKit, Placeholder, Link and
Underline. It has no task-list schema or input rule. Editor reports HTML through
onChange and updates external values with setContent. RecipeContent owns editing
state; useUpdateRecipe sanitizes HTML with DOMPurify before sending it to the API.
Main's TextEditor implementation is not present on the requested target.
Runtime: Node 24.15.0, Yarn 1.22.22. Master requires restoration of its dependencies:
the current node_modules contains main's Lexical packages and lacks Tiptap.
Baseline regression: seven task-related assertions failed while six existing
behavior assertions passed. Baseline TypeScript already failed with TS1149 and
TS1261 because ThemeProvider imports components/theme/theme while the directory
is components/Theme. The unchanged import also blocks full lint and production
build. No unrelated theme code is modified.

Restored master's locked dependencies with Node 22.15.0, matching its CI, after
the locked Renovate package rejected Node 24. Verified registry metadata and
installed version-matched primary source before adding exact TaskItem and
TaskList 2.11.7 versions. Both are MIT, maintained alongside the existing editor,
and their peer requirements ^2.7.0 include the installed Tiptap 2.11.7 packages.
Playwright 1.58.2 is Apache-2.0 and supports Node >=18. Its addition closes the
demonstrated absence of a browser runner on master for the required browser flow.
Chromium was installed after the initial run reported its missing executable.

## Working Explanation

Checkbox markup remains plain text because StarterKit does not register task nodes
or task input rules. A visual-only checkbox would not preserve state through HTML.
Contradictory evidence: main has a separate editor, so a main-only repair would not
fix master. Smallest experiment: type the prefix into master's real Tiptap schema,
assert a task node and HTML checked-state round trip before and after registration.

## Design Decision

Prefer the official version-matched Tiptap TaskList and TaskItem extensions, with
scoped task-list layout and native inputs, over a custom schema and transaction
handler. Official extensions share maintained schema, interaction and serialization
semantics. Dependency availability, compatibility and license must be checked before
addition. Keep HTML as the storage contract. No migration or server change unless
round-trip evidence demonstrates a need. Recovery is removal of only the scoped
extension, style, test and dependency additions. No data migration is involved.

The official TaskItem node view provides no accessible checkbox name. A cohesive
wrapper adds and updates task-text labels while delegating all task behavior.
Browser testing exposed focus loss when those attribute mutations were observed
as editor content changes. Ignoring mutations confined to the native checkbox
preserves its DOM and keyboard focus without ignoring editable task content.
The smallest useful experiment was the failing real-browser focus and Space
assertion: a stopEvent override did not fix it; checkbox mutation isolation did.
The ineffective event override was removed. No custom event listeners are added.

## Implementation Slices

1. Regression and schema: getEditorExtensions.ts registers the shared schema
   (projected 20 lines, actual 19). getEditorExtensions.test.ts owns input-rule and
   HTML contracts (projected 150, actual 80). recipeTaskItem.ts supplies accessible
   naming at the official node-view boundary (refined projection 50, actual 40).
   package.json and yarn.lock record only verified dependencies and the test script.
2. Rendering: Editor.tsx owns scoped task styles and editor naming (projected about
   35 added lines, actual 30 added, total 179). Editor.test.tsx owns component
   interactions and read-only contracts (projected below 100, actual 68).
3. Browser verification and usage: tests/e2e/editor-checkbox.spec.ts owns the page
   save/reload flow (projected below 180, actual 84). playwright.config.ts owns the
   isolated runner (actual 21). jest.config.js excludes browser tests; .gitignore
   excludes generated browser artifacts. README.md provides brief usage and runner
   commands. This record captures evidence. No legacy exceptions are needed.

## Regression and Behavior Evidence

Fourteen focused tests now pass. They cover `[] `, `[ ] `, `[x] `, non-shortcut
text without a trailing space, inline and invalid markers, unchanged bullet,
ordered-list and heading rules, sanitized HTML round trips, native mouse toggles,
read-only behavior, transition to editing, and externally updated task labels.
Typing `- [ ] ` continues to use the existing bullet-list rule. Arbitrary Markdown
import and uppercase `[X]` conversion are excluded; upstream's verified rule
supports lowercase `[x]`. No expectation was added for unsupported upstream syntax.

The Chromium test uses isolated API fixtures with no production writes. It loads
the real recipe page, types `[] Chop onions`, checks native focus and Space
toggling, presses Enter to create an unchecked next task, saves through the real
DOMPurify/client path, reloads, and verifies both checked and unchecked states.
Semantic locators and awaited assertions are used. Traces are retained on failure,
service workers are blocked, and the runner owns and stops its development server.
There are no fixed sleeps or retries. The 90-second timeout accommodates initial
Next.js compilation, not a retry or an assertion bypass.

Concurrency and data migration are not applicable: synchronous local editor schema
change with unchanged HTML storage. Database durability and additional browser
engines are not claimed by the isolated client save/reload test.

## Quality Review

Changed-line review covers schema reuse, checked-state ownership, sanitized HTML,
accessible checkbox naming, read-only preservation, dependency scope, resource
cleanup and unchanged list behavior. No performance improvement is claimed and no
benchmark was required for this bounded schema/style addition. All changed
hand-written code files are below 200 physical lines; no legacy exception is used.

Verification results:

- `yarn test --runInBand`: passed, five suites, 27 tests, one snapshot.
- `yarn test:e2e`: passed, one Chromium test including keyboard focus, Enter,
  save and reload. Initial missing-browser and focus failures were resolved.
- Scoped strict TypeScript: passed for all changed TypeScript, including imported
  editor extension modules and test matcher declarations.
- Scoped ESLint with `--max-warnings=0`: passed for all changed JS/TS/TSX.
- Prettier check: passed for all changed supported files, including this record.
- `git diff --check`: passed.
- `yarn tsc --noEmit --incremental false`: blocked by existing TS1149 and TS1261
  from the unchanged theme import casing.
- `yarn lint`: failed on the same existing casing at
  src/context/ThemeProvider/ThemeProvider.tsx:22.
- `yarn build`: failed on the same existing casing before production compilation.
- `yarn audit --groups dependencies --json`: failed with existing dependency
  advisories (23 low, 74 moderate, 133 high, six critical). No advisory entry named
  the added task extensions or Playwright packages. This is limited audit evidence,
  not a comprehensive security review or a security guarantee.

The existing pre-commit hook invokes the absent `yarn format` script and would
require a separate authorized prerequisite repair. It has not been bypassed.

The final passing Jest, Chromium, scoped types and scoped lint runs used Node
22.15.0. Jest and Chromium also passed on the installed Node 24.15.0. Full-project
gate failures above were reconfirmed with the installed runtime.

Reproducible scoped validation commands used:

```powershell
$yarnCli = Join-Path (Split-Path (Get-Command yarn).Source) 'node_modules\corepack\dist\yarn.js'
npm exec --yes --package=node@22.15.0 -- node $yarnCli test --runInBand
npm exec --yes --package=node@22.15.0 -- node $yarnCli test:e2e
npm exec --yes --package=node@22.15.0 -- node node_modules\typescript\bin\tsc --noEmit --strict --skipLibCheck --jsx react-jsx --esModuleInterop --moduleResolution bundler --module esnext --target esnext --types 'jest,node,@testing-library/jest-dom' src\components\Editor\Editor.tsx src\components\Editor\Editor.test.tsx src\components\Editor\utils\getEditorExtensions.test.ts playwright.config.ts tests\e2e\editor-checkbox.spec.ts
npm exec --yes --package=node@22.15.0 -- node node_modules\eslint\bin\eslint.js --max-warnings=0 jest.config.js src\components\Editor\Editor.tsx src\components\Editor\utils\getEditorExtensions.ts src\components\Editor\utils\recipeTaskItem.ts src\components\Editor\Editor.test.tsx src\components\Editor\utils\getEditorExtensions.test.ts playwright.config.ts tests\e2e\editor-checkbox.spec.ts
yarn prettier --check README.md jest.config.js package.json src\components\Editor\Editor.tsx src\components\Editor\utils\getEditorExtensions.ts src\components\Editor\utils\recipeTaskItem.ts src\components\Editor\Editor.test.tsx src\components\Editor\utils\getEditorExtensions.test.ts playwright.config.ts tests\e2e\editor-checkbox.spec.ts agent-records\2026-10-22-markdown-checkbox.md
git diff --check
```

## Acceptance Decision

Partial, blocked for integration. Functional acceptance criteria 1 through 5 have
focused test evidence, including actual browser save/reload. Required repository
lint, type and build gates do not pass because of the baseline theme casing defect.
The unrelated prerequisite was left untouched to honor the scope restriction.
No completion or master-integration claim is made.

## Delivery

Implementation is saved on fix/markdown-checkbox-20261022 based on origin/master.
No commit, push, pull request or merge was performed with unresolved gates.
Master merge requires an authorized repair of the existing theme casing and
pre-commit prerequisites, followed by passing full checks.
Job record: agent-records/2026-10-22-markdown-checkbox.md.

## Integration Follow-up, 2026-10-23

User authorized integrating all remaining local changes. Full types, lint, build, all 43 unit tests and all 16 browser tests now pass, including the editor save/reload and keyboard checkbox flow. Browser harness is already tracked on master. This evidence supersedes the earlier blocked quality and acceptance gates. Combined delivery details: `agent-records/2026-10-23-local-changes-integration.md`.
