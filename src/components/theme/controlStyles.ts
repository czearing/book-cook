import {
  dropdownClassNames,
  inputClassNames,
  makeStyles,
  searchBoxClassNames,
  shorthands,
  textareaClassNames,
  tokens,
} from "@fluentui/react-components";

import { sizing } from "./sizingTokens";

export const controlSurface = {
  boxSizing: "border-box",
  backgroundColor: tokens.colorNeutralBackground1,
  ...shorthands.border(
    tokens.strokeWidthThin,
    "solid",
    tokens.colorNeutralStroke1,
  ),
  ...shorthands.borderRadius(tokens.borderRadiusMedium),
  ":hover": {
    ...shorthands.borderColor(tokens.colorNeutralStroke1Hover),
  },
  ":focus-within": {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    boxShadow: `0 0 0 ${tokens.strokeWidthThin} ${tokens.colorBrandStroke1}`,
    outlineColor: "transparent",
    outlineStyle: "solid",
    outlineWidth: tokens.strokeWidthThick,
  },
  "@media (forced-colors: active)": {
    ":focus-within": {
      outlineColor: "Highlight",
    },
  },
} as const;

export const singleLineControl = {
  height: sizing.control,
  minHeight: sizing.control,
} as const;

const singleLineSelector = [
  inputClassNames.root,
  searchBoxClassNames.root,
  dropdownClassNames.root,
]
  .map((name) => `& .${name}`)
  .join(", ");
const surfaceSelector = `${singleLineSelector}, & .${textareaClassNames.root}`;

export const useControlStyles = makeStyles({
  provider: {
    [surfaceSelector]: {
      ...controlSurface,
      // Replace Fluent's contrasting bottom border and underline with one shared focus ring.
      "::after": { display: "none" },
      ":has(:disabled)": {
        ...shorthands.borderColor(tokens.colorNeutralStrokeDisabled),
        backgroundColor: tokens.colorNeutralBackgroundDisabled,
        boxShadow: "none",
        cursor: "not-allowed",
      },
    },
    [singleLineSelector]: singleLineControl,
  },
});
