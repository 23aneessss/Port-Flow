/**
 * PORT FLOW DRIVER - Toast Component
 * Temporary notification messages
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    visible: boolean;
    onDismiss: () => void;
    duration?: number;
}

const typeStyles: Record<ToastType, { bg: string; text: string; icon: string }> = {
    success: { bg: colors.success, text: colors.white, icon: '✓' },
    error: { bg: colors.error, text: colors.white, icon: '✕' },
    warning: { bg: colors.warning, text: colors.navy, icon: '⚠' },
    info: { bg: colors.cyan, text: colors.navy, icon: 'ℹ' },
};

export function Toast({
    message,
    type = 'info',
    visible,
    onDismiss,
    duration = 3000,
}: ToastProps) {
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
            ]).start();

            // Auto dismiss
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    if (!visible) return null;

    const style = typeStyles[type];

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: insets.top + spacing.sm,
                    backgroundColor: style.bg,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
                shadows.lg,
            ]}
        >
            <TouchableOpacity style={styles.content} onPress={hideToast} activeOpacity={0.8}>
                <Text style={[styles.icon, { color: style.text }]}>{style.icon}</Text>
                <Text style={[styles.message, { color: style.text }]} numberOfLines={2}>
                    {message}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: spacing.md,
        right: spacing.md,
        borderRadius: borderRadius.md,
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    icon: {
        fontSize: 18,
        marginRight: spacing.sm,
        fontWeight: 'bold',
    },
    message: {
        ...typography.body,
        flex: 1,
    },
});

export default Toast;
