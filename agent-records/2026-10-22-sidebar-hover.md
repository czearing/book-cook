# Software Change Record

## Context

Task: Make sidebar navigation hover visible using existing design tokens.
Repository: `C:\Users\czear\AppData\Roaming\com.czearing.spool\projects\40a09451-fb3e-461b-9ba0-50ec2dae8580\book-cook`.
Starting revision: `a871f1478e54096f746ef1766245b81f2874a96d`.
Starting branch: `fix/markdown-checkbox-20261022`.
Existing unrelated changes: editor implementation, editor tests, README, package
manifest, yarn lock, Jest configuration, gitignore, Playwright configuration,
browser tests, and another job record. Preserve and exclude them from commits.
No AGENTS.md exists. Follow package scripts, Fluent UI conventions, and the
requested engineering specification and template.

## Acceptance Contract

1. Every sidebar destination visibly changes full-row fill on hover in light
   and dark themes, including the selected destination.
2. Selected weight and brand indicator persist while hovering.
3. Keyboard focus remains visible; reduced motion disables nav transitions.
   Hover changes at least one RGB channel by 12 levels, with no target movement.
4. Navigation destinations, close-on-navigation, touch operation, and menu
   layout remain unchanged. Hover must not move the hit target.
5. Existing tokens supply colors, radius, typography, and motion.
6. Only task-owned changes are committed and merged to master.

Exclusions: desktop toolbar restyling, editor changes, new dependencies,
theme palette changes, and unrelated menu actions.
Verification commands: scoped Jest regression, Playwright browser interaction using
the available local harness, scoped ESLint, Prettier check, `yarn tsc --noEmit`,
and `yarn build`. Record baseline limitations rather than hide failures.

## Discovery and Baseline

Toolbar.tsx opens MobileDrawer.tsx below 900px. MobileDrawer maps the shared
navLinks array to Fluent subtle buttons and invokes onNavigate and onOpenChange.
NavigationLinks is a separate desktop toolbar implementation, not this sidebar.
MobileDrawer.styles.ts owns sidebar presentation; theme.ts supplies generated
light/dark tokens. No new state or data ownership is needed.
Current hover uses Background1Hover, foreground hover, and translateX(4px).
Selected hover repeats its resting background and foreground.
Light Background1 is get(0.98), hover get(0.96), so the fill is very subtle.
The inherited subtle-button resting fill is also get(0.96) in light and
get(0.18) in dark, exactly matching the original Background1Hover token.
This explains the measured absence of an unselected fill change.
Node 24.15.0, npm 11.12.1, Yarn 1.22.22; CI specifies Node 22.15.0.
Installed: Next 15.3.1, Fluent UI 9.62.0, Playwright 1.58.2,
TypeScript 5.8.3. Baseline `yarn tsc --noEmit --incremental false` fails
with TS1149 and TS1261 from existing Theme/theme versus theme/theme imports.
This unrelated defect is excluded and blocks all-checks-pass integration.

Research, primary public examples inspected:

- https://ui.shadcn.com/docs/components/sidebar documents themeable menu buttons
  and separate sidebar accent and selected states.
- https://primer.style/product/components/nav-list/ shows vertical navigation,
  leading visuals, and persistent current-view indication.
  Use their restrained full-row emphasis pattern, not copied implementation.

## Working Explanation

Low-contrast hover tokens and an identical selected hover explain missing
feedback. Contradictory evidence: existing translation means hover is not
entirely absent, and dark Background1Hover is stronger than light.
Smallest experiment: compare computed resting/hover fills for selected and
unselected buttons in both themes before and after. Baseline browser tests fail
because fill remains rgb(244, 244, 245) in light and rgb(43, 41, 50) in dark.

## Design Decision

Choose local CSS changes: stronger neutral row fills, selected-specific hover,
token motion limited to colors, visible keyboard outline, and reduced-motion
override. Add aria-current to expose existing selected state.
Alternative: add animated icons or a shared navigation abstraction. Rejected:
unneeded markup, broader desktop changes, and motion without meaningful reuse.
Keep selected brand indicator unchanged. Use no new dependency or palette.
Use Background3 for the resting selected row, matching desktop navigation.
Initial hover changes produced only 10 RGB levels for the unselected light
row and 6 for the selected dark row. They failed the new minimum 12-level
channel-difference assertion. Fluent subtle buttons inherit a tinted resting
surface. Explicitly match unselected rows to the sidebar's Background1 and
use Background3 for selected rows instead of weakening that assertion.
Risk: Fluent button style precedence; resolved through computed browser styles.
Recovery: revert only task-owned file changes, preserving unrelated work.

## Implementation Slices

1. Regression: planned approximately 100 lines. Actual style regression test:
   59 lines; browser interaction test: 127 lines, independently exercising both
   themes, both motion settings, and touch.
2. Presentation: planned approximately 125 style lines and 115 component lines.
   Actual MobileDrawer.styles.ts: 120 lines; MobileDrawer.tsx: 96 lines.
   No legacy exception needed.
3. Verification and delivery: completed this record; integration is blocked by
   existing TypeScript and production build failures.

## Regression and Behavior Evidence

Before implementation, `yarn test --runInBand MobileDrawer.styles` fails all
three intended regressions: hover token/movement, selected fill, and focus/motion.
`yarn playwright test sidebar-hover --reporter=line` fails both theme cases
at the unchanged hover-fill assertion. Failure traces retained by Playwright.
After implementation:

- `yarn test --runInBand Toolbar`: passed, 2 suites, 4 tests, 1 snapshot.
- `yarn playwright test sidebar-hover --reporter=line`: passed, 5 tests.
  Every Home, Recipes, and Collections row exceeds the minimum 12-level channel
  difference on hover in light/dark themes with reduced and normal motion.
  Bounding boxes remain identical. Returning the pointer restores the fill.
  The selected 3px brand marker and semibold weight persist.
  aria-current identifies only the selected destination.
  Normal transition duration is 150ms; reduced-motion duration is zero.
  Tab shows a solid 2px focus outline. Enter navigates and closes the drawer.
  Touch at 390px width navigates and closes without hover.
  Close button behavior also passes.
- Chromium screenshots for both themes inspected visually:
  `test-results/sidebar-hover-sidebar-interactions-light-motion-reduce-chromium/selected-hover.png`
  and the matching `dark` path. Full-row neutral emphasis, rounded corners,
  legible text, and the brand marker remain visible.

Failure behavior: selected hover previously remained unchanged; the regression
failed before implementation. Navigation error handling is unchanged and outside
this presentation-only scope.
Concurrency and migrations: Not applicable, CSS and existing selected metadata
do not introduce asynchronous state, storage, or schema changes.

## Quality Review

Passed scoped ESLint:
`yarn eslint src\components\Toolbar\MobileDrawer\MobileDrawer.tsx src\components\Toolbar\MobileDrawer\MobileDrawer.styles.ts src\components\Toolbar\MobileDrawer\MobileDrawer.styles.test.ts tests\e2e\sidebar-hover.spec.ts`.

Passed scoped formatting:
`yarn prettier --check src\components\Toolbar\MobileDrawer\MobileDrawer.tsx src\components\Toolbar\MobileDrawer\MobileDrawer.styles.ts src\components\Toolbar\MobileDrawer\MobileDrawer.styles.test.ts tests\e2e\sidebar-hover.spec.ts agent-records\2026-10-22-sidebar-hover.md`.

`git diff --check`: passed. All four owned code files remain below 200 lines.
Reviewed every owned changed line: no duplicate domain rule, new abstraction,
new dependency, data handling, network endpoint, or navigation callback change.
Focus and current-page metadata improve accessibility without new tab stops.
Colors use existing theme tokens and retain neutral foreground readability.
Performance: no measured improvement claim. Color-only transitions avoid
geometric movement; no React state, timer, listener, or unmanaged resource added.

Blocked checks:
`yarn tsc --noEmit --incremental false` fails with the same existing
TS1149/TS1261 Theme/theme casing errors before and after the implementation.
`yarn build` fails during type validation at src/components/Theme/index.ts:1
for that same import-casing problem. No checks were disabled or weakened.
CI Node 22 execution was not available locally; runtime used Node 24.15.0.
Browser coverage uses installed Chromium, not Safari or Firefox.

## Acceptance Decision

Partial, not complete. Criteria 1 through 5 have passing scoped evidence.
Criterion 6 and the required all-checks-pass integration gate are blocked:
the pre-existing type error prevents a passing production build.
Do not merge while required checks fail. Fixing unrelated theme imports was
explicitly excluded; no such files were changed.

## Delivery

Implementation and tests are saved on local branch `fix/sidebar-hover-20261022`.
No commit, push, pull request, or master merge was made because required quality
checks fail. No production change was performed.
Job record: `agent-records/2026-10-22-sidebar-hover.md`.
Changed implementation: MobileDrawer.styles.ts and MobileDrawer.tsx.
Added tests: MobileDrawer.styles.test.ts and tests/e2e/sidebar-hover.spec.ts.
Unrelated dirty work remains intact and uncommitted.
The browser run used the pre-existing uncommitted Playwright configuration and
dependency setup without modifying or claiming those files. Browser testing on
a clean checkout requires that separate harness work to be integrated.
Remaining blockers: existing Theme import casing, production build, and required
master integration. No temporary implementation files were created.

## Integration Follow-up, 2026-10-23

User authorized integrating all remaining local changes. Full types, lint, build, all 43 unit tests and all 16 browser tests now pass, including light/dark hover, reduced motion, keyboard and touch navigation. Browser harness is already tracked on master. This evidence supersedes the earlier blocked quality and acceptance gates. Combined delivery details: `agent-records/2026-10-23-local-changes-integration.md`.
