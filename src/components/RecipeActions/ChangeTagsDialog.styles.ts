import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

import { sizing } from "../theme/sizingTokens";

export const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: "450px",
    width: "100%",
    ...shorthands.borderRadius("14px"),
  },
  dialogBody: { display: "flex", flexDirection: "column", gap: "16px" },
  inputContainer: { display: "flex", alignItems: "center", gap: "8px" },
  dropdownContainer: { position: "relative", width: "100%" },
  suggestionsDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius("4px"),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    boxShadow: tokens.shadow8,
    maxHeight: sizing.suggestionList,
    overflowY: "auto",
    zIndex: 100,
  },
  suggestionItem: {
    ...shorthands.padding("8px"),
    cursor: "pointer",
    ":hover": { backgroundColor: tokens.colorNeutralBackground2 },
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    minHeight: sizing.tagList,
  },
  dialogTitle: {
    paddingBottom: "8px",
  },
  tag: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: "4px 8px",
    ...shorthands.borderRadius("4px"),
    fontSize: tokens.fontSizeBase200,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    ":hover": { backgroundColor: tokens.colorNeutralBackground3 },
  },
  noTagsMessage: {
    color: tokens.colorNeutralForeground3,
    padding: "16px 0",
    textAlign: "center",
  },
});
