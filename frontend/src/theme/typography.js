import { Platform } from 'react-native';

// System font stack that feels premium on both platforms
const FONT_FAMILY = Platform.select({
  ios: 'SF Pro Display',
  android: 'Roboto',
  default: 'System',
});

export const TYPOGRAPHY = {
  // Hero numbers (profit, value)
  hero: {
    fontFamily: FONT_FAMILY,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
  },

  // Large display
  display: {
    fontFamily: FONT_FAMILY,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },

  // Section headers
  heading: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Sub-headings
  subheading: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Body text
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },

  // Small / labels
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Micro
  micro: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '400',
  },
};
