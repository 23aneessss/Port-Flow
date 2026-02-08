/**
 * PORT FLOW DRIVER - Loading Component
 * Full-screen loading overlay
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export function Loading({ message, fullScreen = false }: LoadingProps) {
    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
                <ActivityIndicator size="large" color={colors.cyan} />
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.cyan} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullScreen: {
        flex: 1,
        backgroundColor: colors.navy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        ...typography.body,
        color: colors.white,
        marginTop: spacing.md,
        textAlign: 'center',
    },
});

export default Loading;
