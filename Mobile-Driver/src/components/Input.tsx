/**
 * PORT FLOW DRIVER - Input Component
 * Form input with validation styling
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
    StyleProp,
    TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    style,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!error;

    const containerStyle = [
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        hasError && styles.inputContainerError,
    ];

    const inputStyles: StyleProp<TextStyle> = [
        styles.input,
        leftIcon ? styles.inputWithLeftIcon : null,
        rightIcon ? styles.inputWithRightIcon : null,
        style as TextStyle,
    ];

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={containerStyle}>
                {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

                <TextInput
                    style={inputStyles}
                    placeholderTextColor={colors.slate}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity
                        style={styles.iconRight}
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>

            {hasError && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.label,
        color: colors.white,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray800,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputContainerFocused: {
        borderColor: colors.cyan,
    },
    inputContainerError: {
        borderColor: colors.error,
    },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.white,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        minHeight: 56,
    },
    inputWithLeftIcon: {
        paddingLeft: spacing.sm,
    },
    inputWithRightIcon: {
        paddingRight: spacing.sm,
    },
    iconLeft: {
        paddingLeft: spacing.md,
    },
    iconRight: {
        paddingRight: spacing.md,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
});

export default Input;
