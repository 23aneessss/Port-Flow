/**
 * PORT FLOW DRIVER - Button Component
 * Large, accessible buttons for field use
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles = {
    primary: { backgroundColor: colors.cyan },
    secondary: { backgroundColor: colors.navy },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.cyan },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
};

const textVariantStyles = {
    primary: { color: colors.navy },
    secondary: { color: colors.white },
    outline: { color: colors.cyan },
    ghost: { color: colors.cyan },
    danger: { color: colors.white },
};

const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 40 },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 48 },
    lg: { paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl, minHeight: 56 },
};

const textSizeStyles = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
};

export function Button({
    title,
    variant = 'primary',
    size = 'lg',
    loading = false,
    disabled = false,
    icon,
    fullWidth = true,
    style,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.base,
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            disabled={isDisabled}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.navy : colors.cyan}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.text,
                            textVariantStyles[variant],
                            textSizeStyles[size],
                            isDisabled && styles.textDisabled,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...typography.button,
        textAlign: 'center',
    },
    textDisabled: {
        opacity: 0.7,
    },
});

export default Button;
