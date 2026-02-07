/**
 * PORT FLOW DRIVER - Card Component
 * Rounded cards with subtle shadows
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, StyleProp } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

interface CardProps extends ViewProps {
    children: ReactNode;
    variant?: 'light' | 'dark';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    children,
    variant = 'light',
    padding = 'md',
    shadow = 'md',
    style,
    ...props
}: CardProps) {
    const paddingKey = `padding_${padding}` as keyof typeof styles;

    const cardStyles: StyleProp<ViewStyle> = [
        styles.base,
        styles[variant],
        styles[paddingKey],
        shadow !== 'none' ? shadows[shadow] : null,
    ];

    return (
        <View style={[cardStyles, style]} {...props}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },

    // Variants
    light: {
        backgroundColor: colors.white,
    },
    dark: {
        backgroundColor: colors.navy,
    },

    // Padding
    padding_none: {
        padding: 0,
    },
    padding_sm: {
        padding: spacing.sm,
    },
    padding_md: {
        padding: spacing.md,
    },
    padding_lg: {
        padding: spacing.lg,
    },
});

export default Card;
