import { tokens } from "@fluentui/react-components";
import { makeStyles, shorthands } from "@griffel/react";

import { controlSurface, singleLineControl } from "../theme/controlStyles";
import { sizing } from "../theme/sizingTokens";

export const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    maxWidth: "600px",
    position: "relative",
  },
  inputContainer: {
    ...controlSurface,
    ...singleLineControl,
    display: "flex",
    alignItems: "center",
    ...shorthands.padding("0", "12px"),
  },
  searchIcon: {
    color: tokens.colorNeutralForeground3,
    marginRight: "8px",
    fontSize: "16px",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: "14px",
    color: tokens.colorNeutralForeground1,
    "::placeholder": {
      color: tokens.colorNeutralForeground4,
    },
  },
  addButton: {
    ...shorthands.padding("2px", "8px"),
    ...shorthands.borderRadius("4px"),
    ...shorthands.border("none"),
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralBackground1,
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    ":hover": {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
  dropdown: {
    position: "absolute",
    top: `calc(${sizing.control} + ${tokens.spacingVerticalXS})`,
    left: 0,
    right: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius("8px"),
    boxShadow: tokens.shadow8,
    zIndex: 100,
    maxHeight: sizing.suggestionList,
    overflowY: "auto",
    animationName: {
      from: {
        opacity: 0,
        transform: "translateY(-4px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
    animationDuration: "0.2s",
    animationTimingFunction: "ease-out",
  },
  dropdownItem: {
    ...shorthands.padding("8px", "12px"),
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.1s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  selectedTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "8px",
  },
  tagPill: {
    display: "flex",
    alignItems: "center",
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("6px", "10px"),
    fontSize: "12px",
    transition: "all 0.2s ease",
    animationName: {
      from: {
        opacity: 0,
        transform: "scale(0.9)",
      },
      to: {
        opacity: 1,
        transform: "scale(1)",
      },
    },
    animationDuration: "0.2s",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  removeButton: {
    background: "none",
    ...shorthands.border("none"),
    marginLeft: "6px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorNeutralForeground3,
    transition: "color 0.15s ease",
    ":hover": {
      color: tokens.colorNeutralForeground1,
    },
  },
  emptyMessage: {
    ...shorthands.padding("12px"),
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
    fontSize: "12px",
  },
});
