/**
 * PORT FLOW DRIVER - Countdown Timer Component
 * Displays countdown until QR code becomes available
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getQrAvailability, formatCountdown } from '../utils/timeGating';
import { Card } from './Card';

interface CountdownTimerProps {
    targetTimeISO: string;
    onComplete?: () => void;
}

export function CountdownTimer({ targetTimeISO, onComplete }: CountdownTimerProps) {
    const [countdown, setCountdown] = useState({ minutes: 0, seconds: 0 });
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const updateCountdown = () => {
            const availability = getQrAvailability(targetTimeISO);

            if (availability.isAvailable) {
                setIsComplete(true);
                onComplete?.();
                return;
            }

            setCountdown({
                minutes: availability.minutesRemaining,
                seconds: availability.secondsRemaining,
            });
        };

        // Initial update
        updateCountdown();

        // Update every second
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [targetTimeISO, onComplete]);

    if (isComplete) {
        return null;
    }

    const displayTime = formatCountdown(countdown.minutes, countdown.seconds);

    return (
        <Card variant="dark" padding="lg" style={styles.container}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.title}>QR Code verrouillé</Text>
            <Text style={styles.subtitle}>Disponible dans</Text>

            <View style={styles.timerContainer}>
                <View style={styles.timeBlock}>
                    <Text style={styles.timeNumber}>
                        {countdown.minutes.toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.timeLabel}>min</Text>
                </View>

                <Text style={styles.separator}>:</Text>

                <View style={styles.timeBlock}>
                    <Text style={styles.timeNumber}>
                        {countdown.seconds.toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.timeLabel}>sec</Text>
                </View>
            </View>

            <Text style={styles.securityNote}>
                Pour des raisons de sécurité, le QR code{'\n'}
                est disponible 15 minutes avant l'heure du créneau
            </Text>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray700,
    },
    lockIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        ...typography.h4,
        color: colors.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.slate,
        marginBottom: spacing.lg,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    timeBlock: {
        alignItems: 'center',
        backgroundColor: colors.gray800,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minWidth: 80,
    },
    timeNumber: {
        ...typography.h1,
        color: colors.cyan,
        fontSize: 48,
        fontVariant: ['tabular-nums'],
    },
    timeLabel: {
        ...typography.caption,
        color: colors.slate,
        textTransform: 'uppercase',
    },
    separator: {
        ...typography.h1,
        color: colors.cyan,
        fontSize: 48,
        marginHorizontal: spacing.sm,
    },
    securityNote: {
        ...typography.bodySmall,
        color: colors.slate,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default CountdownTimer;
