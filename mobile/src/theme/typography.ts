import { TextStyle } from 'react-native'

export const typography = {
  // Headings
  headingXL: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,

  headingLG: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.3,
  } as TextStyle,

  headingMD: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,

  headingSM: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  headingXS: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  } as TextStyle,

  // Body text
  bodyLG: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: 0.3,
  } as TextStyle,

  bodyMD: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.2,
  } as TextStyle,

  bodySM: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  bodyXS: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  // Labels and buttons
  labelLG: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  labelMD: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  labelSM: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  } as TextStyle,

  labelXS: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  } as TextStyle,

  // Special cases
  mono: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    fontFamily: 'monospace',
  } as TextStyle,

  caption: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  } as TextStyle,
}
