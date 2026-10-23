import { tokens, shorthands } from "@fluentui/react-components";

import { sizing } from "../theme/sizingTokens";

export const heroStyles = {
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: "90vh",
    position: "relative",
    ...shorthands.padding("80px", "20px"),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  heroContent: {
    maxWidth: "1200px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
  },
  heading: {
    fontSize: "64px",
    lineHeight: 1.1,
    fontWeight: "800",
    marginBottom: "20px",
    // Gradient uses brand colors - appearance may vary slightly across themes
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackgroundHover} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
    maxWidth: "800px",
  },
  subHeading: {
    fontSize: "20px",
    lineHeight: 1.6,
    color: tokens.colorNeutralForeground2,
    marginBottom: "40px",
    maxWidth: "600px",
    textAlign: "center",
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    marginTop: "20px",
  },
  primaryButton: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: "16px",
    fontWeight: "600",
    height: sizing.controlLarge,
    ...shorthands.padding("0", "28px"),
    ...shorthands.borderRadius(tokens.borderRadiusLarge), // Use token
    border: "none",
    cursor: "pointer",
    transitionProperty: "transform, background-color, box-shadow",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ":hover": {
      transform: "translateY(-2px)",
      backgroundColor: tokens.colorBrandBackgroundHover,
      boxShadow: tokens.shadow8,
    },
    ":active": {
      backgroundColor: tokens.colorBrandBackgroundPressed,
      transform: "translateY(0)",
      boxShadow: tokens.shadow2,
    },
  },
  secondaryButton: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: "16px",
    fontWeight: "600",
    height: sizing.controlLarge,
    ...shorthands.padding("0", "28px"),
    ...shorthands.borderRadius(tokens.borderRadiusLarge), // Use token
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transitionProperty: "transform, background-color, border-color",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      transform: "translateY(-2px)",
    },
    ":active": {
      backgroundColor: tokens.colorNeutralBackground1Pressed,
      transform: "translateY(0)",
    },
  },
  floatingBubble: {
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground2, // Subtle brand background
    zIndex: 1,
    opacity: 0.5, // Adjust if needed for subtlety
  },
  heroImageContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "1000px",
    height: sizing.heroImage,
    marginTop: "40px",
  },
} as const;
