/**
 * PORT FLOW DRIVER - Typography System
 * Montserrat for headings, Roboto Condensed for UI text
 */

export const fonts = {
    // Montserrat (Headings)
    montserrat: {
        regular: 'Montserrat_400Regular',
        medium: 'Montserrat_500Medium',
        semiBold: 'Montserrat_600SemiBold',
        bold: 'Montserrat_700Bold',
    },
    // Roboto Condensed (UI Text)
    robotoCondensed: {
        regular: 'RobotoCondensed_400Regular',
        medium: 'RobotoCondensed_500Medium',
        bold: 'RobotoCondensed_700Bold',
    },
};

export const fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
};

export const lineHeights = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
};

export const typography = {
    // Headings - Montserrat
    h1: {
        fontFamily: fonts.montserrat.bold,
        fontSize: fontSizes['4xl'],
        lineHeight: fontSizes['4xl'] * lineHeights.tight,
    },
    h2: {
        fontFamily: fonts.montserrat.bold,
        fontSize: fontSizes['3xl'],
        lineHeight: fontSizes['3xl'] * lineHeights.tight,
    },
    h3: {
        fontFamily: fonts.montserrat.semiBold,
        fontSize: fontSizes['2xl'],
        lineHeight: fontSizes['2xl'] * lineHeights.tight,
    },
    h4: {
        fontFamily: fonts.montserrat.semiBold,
        fontSize: fontSizes.xl,
        lineHeight: fontSizes.xl * lineHeights.tight,
    },
    h5: {
        fontFamily: fonts.montserrat.medium,
        fontSize: fontSizes.lg,
        lineHeight: fontSizes.lg * lineHeights.tight,
    },

    // Body - Roboto Condensed
    body: {
        fontFamily: fonts.robotoCondensed.regular,
        fontSize: fontSizes.md,
        lineHeight: fontSizes.md * lineHeights.normal,
    },
    bodyBold: {
        fontFamily: fonts.robotoCondensed.bold,
        fontSize: fontSizes.md,
        lineHeight: fontSizes.md * lineHeights.normal,
    },
    bodySmall: {
        fontFamily: fonts.robotoCondensed.regular,
        fontSize: fontSizes.sm,
        lineHeight: fontSizes.sm * lineHeights.normal,
    },
    caption: {
        fontFamily: fonts.robotoCondensed.regular,
        fontSize: fontSizes.xs,
        lineHeight: fontSizes.xs * lineHeights.normal,
    },

    // UI elements
    button: {
        fontFamily: fonts.robotoCondensed.bold,
        fontSize: fontSizes.lg,
        lineHeight: fontSizes.lg * lineHeights.tight,
    },
    label: {
        fontFamily: fonts.robotoCondensed.medium,
        fontSize: fontSizes.sm,
        lineHeight: fontSizes.sm * lineHeights.tight,
    },
};

export default typography;
