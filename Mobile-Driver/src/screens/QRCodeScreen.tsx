/**
 * PORT FLOW DRIVER - QR Code Screen
 * Displays the QR code for port access
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Card, Button, Loading, CountdownTimer, EmptyState } from '../components';
import { Booking, MainTabParamList } from '../types';
import { formatTimeRange, formatDate } from '../utils/dateFormat';
import { isQrAvailable } from '../utils/timeGating';
import { getBookingById, getBookingQrPayload, getCurrentMission } from '../api/client';

type NavigationProp = BottomTabNavigationProp<MainTabParamList>;
type QRCodeRouteProp = RouteProp<MainTabParamList, 'QRCode'>;

export function QRCodeScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<QRCodeRouteProp>();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [qrAvailable, setQrAvailable] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);

    // Get booking ID from route params or use current booking
    const bookingId = route.params?.bookingId;

    // Fetch booking data
    const fetchBooking = useCallback(async () => {
        try {
            setQrError(null);
            if (bookingId) {
                const found = await getBookingById(bookingId);
                setBooking(found);
            } else {
                const currentMission = await getCurrentMission();
                setBooking(currentMission);
            }
        } catch (err) {
            console.error('Failed to fetch booking:', err);
        } finally {
            setIsLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchBooking();
    }, [fetchBooking]);

    // Check QR availability
    useEffect(() => {
        if (!booking) return;

        const checkAvailability = () => {
            const available = isQrAvailable(booking.startTime);
            setQrAvailable(available);
        };

        checkAvailability();
        const interval = setInterval(checkAvailability, 1000);

        return () => clearInterval(interval);
    }, [booking]);

    const loadQrPayload = useCallback(async (targetBookingId: string) => {
        try {
            const payload = await getBookingQrPayload(targetBookingId);
            setQrError(null);
            setBooking((prev) => (
                prev && prev.id === targetBookingId
                    ? { ...prev, qrPayload: payload }
                    : prev
            ));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Impossible de générer le QR code.';
            setQrError(message);
        }
    }, []);

    useEffect(() => {
        if (!booking || !qrAvailable || booking.status !== 'CONFIRMED' || booking.qrPayload) return;
        loadQrPayload(booking.id);
    }, [booking, qrAvailable, loadQrPayload]);

    const handleGoBack = () => {
        navigation.navigate('Home');
    };

    if (isLoading) {
        return <Loading fullScreen message="Chargement..." />;
    }

    if (!booking) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <EmptyState
                    icon="📭"
                    title="Aucune mission"
                    message="Pas de mission confirmée pour afficher le QR code."
                    actionLabel="Retour"
                    onAction={handleGoBack}
                />
            </View>
        );
    }

    // If QR not yet available, show countdown
    if (!qrAvailable || booking.status !== 'CONFIRMED') {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Accès Port</Text>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {booking.status !== 'CONFIRMED' ? (
                        <EmptyState
                            icon="⏸️"
                            title="QR non disponible"
                            message={`Cette réservation est ${booking.status === 'CONSUMED' ? 'terminée' : 'non confirmée'}.`}
                            actionLabel="Retour"
                            onAction={handleGoBack}
                        />
                    ) : (
                        <CountdownTimer
                            targetTimeISO={booking.startTime}
                            onComplete={() => setQrAvailable(true)}
                        />
                    )}
                </ScrollView>
            </View>
        );
    }

    if (!booking.qrPayload) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Accès Port</Text>
                </View>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <EmptyState
                        icon={qrError ? '⚠️' : '⏳'}
                        title={qrError ? 'QR indisponible' : 'Génération du QR...'}
                        message={qrError || 'Veuillez patienter quelques secondes.'}
                        actionLabel="Réessayer"
                        onAction={() => loadQrPayload(booking.id)}
                    />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Accès Port</Text>
                <Text style={styles.headerSubtitle}>Présentez ce QR à l'entrée</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
            >
                {/* QR Card */}
                <Card variant="light" padding="lg" style={styles.qrCard}>
                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={booking.qrPayload}
                                size={220}
                                backgroundColor={colors.white}
                                color={colors.navy}
                            />
                        </View>
                    </View>

                    {/* Booking Info */}
                    <View style={styles.bookingInfo}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Référence</Text>
                            <Text style={styles.infoValue}>{booking.reference}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Terminal</Text>
                            <Text style={styles.infoValue}>{booking.terminalName}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>{formatDate(booking.startTime)}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Horaire</Text>
                            <Text style={styles.infoValue}>
                                {formatTimeRange(booking.startTime, booking.endTime)}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Security Instructions */}
                <Card variant="dark" padding="md" style={styles.instructionsCard}>
                    <View style={styles.instructionRow}>
                        <Text style={styles.instructionIcon}>🛡️</Text>
                        <Text style={styles.instructionText}>
                            Présentez ce QR à la porte principale du terminal
                        </Text>
                    </View>

                    <View style={styles.instructionRow}>
                        <Text style={styles.instructionIcon}>⏱️</Text>
                        <Text style={styles.instructionText}>
                            Arrivez au moins 10 minutes avant votre créneau
                        </Text>
                    </View>

                    <View style={styles.instructionRow}>
                        <Text style={styles.instructionIcon}>📋</Text>
                        <Text style={styles.instructionText}>
                            Gardez vos documents de transport à portée de main
                        </Text>
                    </View>
                </Card>

                {/* Back Button */}
                <Button
                    title="Retour à l'accueil"
                    variant="outline"
                    onPress={handleGoBack}
                    style={styles.backButton}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.navy,
    },

    // Header
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.h4,
        color: colors.white,
    },
    headerSubtitle: {
        ...typography.bodySmall,
        color: colors.slate,
        marginTop: spacing.xs,
    },

    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },

    // QR Card
    qrCard: {
        ...shadows.lg,
        marginBottom: spacing.lg,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    qrWrapper: {
        padding: spacing.lg,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },

    // Booking Info
    bookingInfo: {
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    infoLabel: {
        ...typography.bodySmall,
        color: colors.slate,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        ...typography.body,
        color: colors.navy,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray200,
    },

    // Instructions
    instructionsCard: {
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.gray700,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    instructionIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    instructionText: {
        ...typography.bodySmall,
        color: colors.white,
        flex: 1,
        lineHeight: 20,
    },

    // Back Button
    backButton: {
        marginTop: spacing.sm,
    },
});

export default QRCodeScreen;
