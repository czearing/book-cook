# Control sizing

Import fixed CSS heights from `sizingTokens.ts`. Keep percentages, viewport-relative
layout, intrinsic sizing, zero, typography line heights, and intrinsic image
dimensions as appropriate for their layout.

`controlStyles.ts` shares the surface and 36px single-line height across Fluent
Input, SearchBox, Dropdown, and the custom TagPicker. Textarea shares the surface
but retains multiline sizing. AppContainer applies the rules through FluentProvider,
including its portals. Use the shared contract rather than local field overrides.

`yarn test --runInBand height-tokens` audits application height declarations.
`yarn test:e2e control-styling form-surfaces` exercises browser styling and behavior.
