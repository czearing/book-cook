import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

import { sizing } from '../../theme/sizingTokens';

export const useMobileDrawerStyles = makeStyles({
  mobileMenu: {
    backgroundColor: tokens.colorNeutralBackground1,
  },

  drawerHeader: {},

  drawerHeaderAction: {
    color: tokens.colorNeutralForeground1,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      transform: 'rotate(90deg)',
    },
  },

  drawerContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
    ...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalL, tokens.spacingVerticalL),
    gap: tokens.spacingVerticalL,
  },

  searchWrapper: {},

  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
  },

  mobileNavLink: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    width: '100%',
    textAlign: 'left',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    transitionProperty: 'background-color, color',
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveEasyEase,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    justifyContent: 'flex-start',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      transform: 'none',
      color: tokens.colorNeutralForeground1,
    },
    ':focus-visible': {
      outlineColor: tokens.colorStrokeFocus2,
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidthThick,
      outlineOffset: tokens.strokeWidthThick,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground1Pressed,
      color: tokens.colorNeutralForeground1Pressed,
    },
  },

  activeLink: {
    backgroundColor: tokens.colorNeutralBackground3,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    position: 'relative',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Selected,
      color: tokens.colorNeutralForeground1,
    },
    '::before': {
      content: "''",
      position: 'absolute',
      left: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '3px',
      height: sizing.navigationIndicator,
      backgroundColor: tokens.colorCompoundBrandStroke,
      borderTopRightRadius: tokens.borderRadiusMedium,
      borderBottomRightRadius: tokens.borderRadiusMedium,
      borderTopLeftRadius: '0px',
      borderBottomLeftRadius: '0px',
    },
  },

  footerSection: {
    paddingTop: tokens.spacingVerticalL,
    flexShrink: 0,
  },

  primaryActionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    minHeight: sizing.touchTarget,
    width: '100%',
    textWrap: 'nowrap',
    ...shorthands.padding('0', tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
    },
  },
});
