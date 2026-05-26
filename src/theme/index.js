// Flowmate design system — mid-century modern
// Two palettes; consumers should use useTheme().colors instead of Colors directly.

export const lightPalette = {
  // Primary surfaces
  paper:   '#FAF8F5',
  paper2:  '#F3EFE7',
  sage:    '#C5CFC1',
  petrol:  '#A3B5C7',

  // Accents
  mustard: '#D4A017',
  terra:   '#C8734C',

  // Text
  sepia:   '#3E3A35',

  // Gradient stops
  teak:    '#8B5A2B',
  honey:   '#C99A4A',

  // Lines / borders
  line:    '#E6DFD2',
  line2:   '#DCD3C2',

  // Tag chips
  tagMustardBg: '#F0D78A',
  tagMustardFg: '#6A4A05',
  tagTerraBg:   '#ECC4AC',
  tagTerraFg:   '#6E3614',
  tagPetrolBg:  '#C8D4DF',
  tagPetrolFg:  '#2D4154',
  tagSageBg:    '#D9E0D5',
  tagSageFg:    '#3A4A36',
};

export const darkPalette = {
  // Primary surfaces
  paper:   '#1E1C1A',
  paper2:  '#2A2826',
  sage:    '#2A2A28',
  petrol:  '#1F2A32',

  // Accents (slightly brighter for dark bg legibility)
  mustard: '#E6B422',
  terra:   '#E0926C',

  // Text (inverted — light on dark)
  sepia:   '#E6DFD2',

  // Gradient stops
  teak:    '#B87A4A',
  honey:   '#E6B422',

  // Lines / borders
  line:    '#3A3A36',
  line2:   '#4A4844',

  // Tag chips (dark tints of accent colors)
  tagMustardBg: '#342600',
  tagMustardFg: '#E6B422',
  tagTerraBg:   '#3A1A0A',
  tagTerraFg:   '#E0926C',
  tagPetrolBg:  '#121F28',
  tagPetrolFg:  '#A3B5C7',
  tagSageBg:    '#1E2620',
  tagSageFg:    '#C5CFC1',
};

/** Backward-compat alias — prefer useTheme().colors in new code. */
export const Colors = lightPalette;

export const Fonts = {
  display: 'Jost_600SemiBold',
  displayMedium: 'Jost_500Medium',
  displayRegular: 'Jost_400Regular',
  body: 'Lora_400Regular',
  bodyItalic: 'Lora_400Regular_Italic',
  ui: 'DMSans_500Medium',
  uiRegular: 'DMSans_400Regular',
  mono: 'JetBrainsMono_400Regular',
};

export const Radii = {
  card: 18,
  pill: 999,
  btn: 12,
  icon: 8,
};

/** Shadows are constant — same geometry on both themes. */
export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  fab: {
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  display: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.6,
  },
  h2: {
    fontFamily: 'Jost_500Medium',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Jost_500Medium',
    fontSize: 20,
    lineHeight: 26,
  },
  h4: {
    fontFamily: 'Jost_500Medium',
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    fontFamily: 'Lora_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  bodyItalic: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 16,
    lineHeight: 26,
  },
  lede: {
    fontFamily: 'Lora_400Regular',
    fontSize: 19,
    lineHeight: 30,
  },
  small: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  uiButton: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.15,
  },
  uiLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  uiCaption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  eyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
};
