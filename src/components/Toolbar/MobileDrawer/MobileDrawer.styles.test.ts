import { makeStyles, tokens } from '@fluentui/react-components';

import './MobileDrawer.styles';

jest.mock('@fluentui/react-components', () => ({
  ...jest.requireActual('@fluentui/react-components'),
  makeStyles: jest.fn(),
}));

describe('sidebar navigation interaction styles', () => {
  const styles = () => jest.mocked(makeStyles).mock.calls[0][0];

  it('uses a distinct full-row hover fill without moving the hit target', () => {
    expect(styles()).toEqual(
      expect.objectContaining({
        mobileNavLink: expect.objectContaining({
          backgroundColor: tokens.colorNeutralBackground1,
          ':hover': expect.objectContaining({
            backgroundColor: tokens.colorNeutralBackground3Hover,
            transform: 'none',
          }),
        }),
      }),
    );
  });

  it('preserves selection while providing a distinct selected hover fill', () => {
    expect(styles()).toEqual(
      expect.objectContaining({
        activeLink: expect.objectContaining({
          backgroundColor: tokens.colorNeutralBackground3,
          fontWeight: tokens.fontWeightSemibold,
          ':hover': expect.objectContaining({
            backgroundColor: tokens.colorNeutralBackground3Selected,
          }),
          '::before': expect.objectContaining({
            backgroundColor: tokens.colorCompoundBrandStroke,
          }),
        }),
      }),
    );
  });

  it('provides a keyboard focus outline and respects reduced motion', () => {
    expect(styles()).toEqual(
      expect.objectContaining({
        mobileNavLink: expect.objectContaining({
          ':focus-visible': expect.objectContaining({
            outlineColor: tokens.colorStrokeFocus2,
            outlineStyle: 'solid',
          }),
          '@media (prefers-reduced-motion: reduce)': {
            transitionDuration: '0s',
          },
        }),
      }),
    );
  });
});
