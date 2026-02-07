/**
 * PORT FLOW DRIVER - Empty State Component
 * Displayed when no data is available
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon = '📭',
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    variant="outline"
                    size="md"
                    onPress={onAction}
                    fullWidth={false}
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h4,
        color: colors.white,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        ...typography.body,
        color: colors.slate,
        textAlign: 'center',
        maxWidth: 280,
    },
    button: {
        marginTop: spacing.lg,
    },
});

export default EmptyState;
