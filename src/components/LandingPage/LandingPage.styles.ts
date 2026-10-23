import { tokens } from "@fluentui/react-components";
import { makeStyles, shorthands } from "@griffel/react";

import { heroStyles } from "./LandingHero.styles";
import { sizing } from "../theme/sizingTokens";

export const useStyles = makeStyles({
  ...heroStyles,
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
    ...shorthands.overflow("hidden"),
    color: tokens.colorNeutralForeground1,
  },

  featuredSection: {
    ...shorthands.padding("80px", "20px"),
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "48px",
    textAlign: "center",
    color: tokens.colorNeutralForeground1,
  },

  recipesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    width: "100%",
    maxWidth: "1200px",
  },

  recipeCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    transitionProperty: "transform, box-shadow",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    cursor: "pointer",
    overflow: "hidden", // Ensure image radius applies correctly
    ":hover": {
      transform: "translateY(-8px)",
      boxShadow: tokens.shadow16,
    },
  },

  cardImage: {
    display: "block", // Fix potential spacing issues
    width: "100%",
    height: sizing.featuredImage,
    objectFit: "cover",
    // No radius needed here if recipeCard uses overflow: hidden
  },

  featuresSection: {
    ...shorthands.padding("100px", "20px"),
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "40px",
    maxWidth: "1200px",
    width: "100%",
  },

  featureItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    ...shorthands.padding("20px"),
  },

  featureIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "80px",
    height: sizing.featureIcon,
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground2, // Subtle brand background
    marginBottom: "24px",
    color: tokens.colorBrandForeground1,
    fontSize: "32px",
    transition: `transform ${tokens.durationNormal} ${tokens.curveEasyEase}`,
    ":hover": {
      transform: "scale(1.1)",
    },
  },

  featureTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: tokens.colorNeutralForeground1,
  },

  featureDesc: {
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.6,
  },

  ctaSection: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    ...shorthands.padding("80px", "20px"),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  ctaTitle: {
    fontSize: "40px",
    fontWeight: "700",
    marginBottom: "20px",
    color: tokens.colorNeutralForegroundOnBrand,
  },

  ctaDesc: {
    fontSize: "18px",
    marginBottom: "40px",
    maxWidth: "600px",
    lineHeight: 1.6,
  },

  ctaButton: {
    backgroundColor: tokens.colorNeutralBackgroundStatic, // Static white
    color: tokens.colorBrandForeground1,
    fontSize: "18px",
    fontWeight: "600",
    height: sizing.callToAction,
    ...shorthands.padding("0", "32px"),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge), // Use token
    border: "none",
    cursor: "pointer",
    transitionProperty: "transform, box-shadow, color",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ":hover": {
      transform: "translateY(-3px) scale(1.05)",
      boxShadow: tokens.shadow16,
    },
    ":active": {
      transform: "translateY(0) scale(1)",
      boxShadow: tokens.shadow4,
    },
  },
});
