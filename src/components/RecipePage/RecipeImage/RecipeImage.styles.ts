import { makeStyles } from "@fluentui/react-components";

import { sizing } from "../../theme/sizingTokens";

export const useStyles = makeStyles({
  imageContainer: {
    width: "45%",
    height: sizing.recipeImage,
    position: "relative",
    "@media (max-width: 768px)": {
      width: "100%",
      height: sizing.recipeImageCompact,
      marginBottom: "20px",
    },
  },
  emojiMainContainer: {
    width: "25%",
    position: "relative",
    "@media (max-width: 768px)": {
      width: "100%",
    },
  },
  recipeImage: {
    objectFit: "cover",
    borderRadius: "12px",
    boxShadow: "rgba(0, 0, 0, 0.06) 0px 2px 8px",
  },
  emojiContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: "100px",
    lineHeight: 1,
    textAlign: "center",
    userSelect: "none",
    pointerEvents: "none",
  },
});
