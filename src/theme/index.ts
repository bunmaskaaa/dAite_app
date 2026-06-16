export const colors = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  offWhite: '#F5F5F5',
  gray100: '#E8E8E8',
  gray200: '#CFCFCF',
  gray400: '#9A9A9A',
  gray600: '#5C5C5C',
  gray800: '#2E2E2E',
  error: '#FF3B30',
};

export const typography = {
  display: {
    fontFamily: undefined, // uses system default (SF Pro on iOS)
    fontSize: 40,
    fontWeight: '700' as const,
    letterSpacing: -1.5,
    lineHeight: 46,
    color: colors.black,
  },
  heading: {
    fontSize: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    lineHeight: 32,
    color: colors.black,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: -0.2,
    lineHeight: 26,
    color: colors.black,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
    color: colors.gray600,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
    color: colors.gray400,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    lineHeight: 16,
    color: colors.gray400,
    textTransform: 'uppercase' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 24,
  full: 999,
};
