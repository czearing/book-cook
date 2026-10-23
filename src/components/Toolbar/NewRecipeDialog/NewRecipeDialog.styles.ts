import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

import { sizing } from "../../theme/sizingTokens";

export const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: "450px",
    width: "100%",
    ...shorthands.borderRadius("14px"),
    boxShadow: tokens.shadow16,
  },
  dialogBody: {
    paddingTop: "12px",
    paddingBottom: "24px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  textArea: {
    width: "100%",
    flexGrow: 1,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    minHeight: sizing.textArea,
    resize: "none",
  },
  dialogActions: {
    paddingTop: "0",
    ...shorthands.gap("12px"),
  },
  primaryButton: {
    transition: "all 0.2s ease",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  },
  secondaryButton: {
    transition: "all 0.2s ease",
    ":hover": {
      transform: "translateY(-1px)",
    },
  },
  characterCount: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    textAlign: "right",
    marginTop: "4px",
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
    marginTop: tokens.spacingVerticalS,
  },
  spinnerContainer: {
    display: "inline-flex",
    marginLeft: tokens.spacingHorizontalS,
    alignItems: "center",
  },
});
