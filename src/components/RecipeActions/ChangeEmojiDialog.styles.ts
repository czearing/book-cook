import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

import { sizing } from "../theme/sizingTokens";

export const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: "480px",
    width: "100%",
    ...shorthands.borderRadius("16px"),
    boxShadow: tokens.shadow64,
    border: "none",
  },
  dialogTitle: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightSemibold,
    paddingBottom: "8px",
    color: tokens.colorNeutralForeground1,
  },
  dialogBody: {
    paddingTop: "16px",
    paddingBottom: "24px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  gridContainer: {
    minHeight: sizing.emojiGrid,
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    ...shorthands.padding("16px"),
  },
  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(38px, 1fr))",
    gap: "4px",
    maxHeight: sizing.emojiList,
    flexGrow: 1,
    ...shorthands.padding("8px", "0"),
    overflowY: "auto",
  },
  emojiButton: {
    width: "38px",
    height: sizing.emojiButton,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: tokens.fontSizeBase600,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", "transparent"),
    ...shorthands.borderRadius("8px"),
    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ":focus": {
      outlineWidth: "2px",
      outlineStyle: "solid",
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: "1px",
    },
  },
  selectedEmoji: {
    backgroundColor: tokens.colorNeutralBackground3,
    boxShadow: tokens.shadow2,
    transform: "scale(1.08) translateY(-2px)",
    ...shorthands.borderColor(tokens.colorBrandStroke1),
  },
  emojiSectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: "12px",
    color: tokens.colorNeutralForeground2,
  },
  noResultsText: {
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    paddingTop: "30px",
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontStyle: "italic",
  },
  primaryButton: {
    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
    height: sizing.emojiButton,
    ...shorthands.padding("0", "20px"),
    ...shorthands.borderRadius("8px"),
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  secondaryButton: {
    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
    height: sizing.emojiButton,
    ...shorthands.padding("0", "20px"),
    ...shorthands.borderRadius("8px"),
    ":hover": {
      transform: "translateY(-2px)",
    },
  },
});
