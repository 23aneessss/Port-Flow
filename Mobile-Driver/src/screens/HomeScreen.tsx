/**
 * PORT FLOW DRIVER - Home Screen (Mission)
 * Main screen showing current/upcoming mission with QR access
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Card, Button, Badge, getStatusBadgeProps, EmptyState, Loading, CountdownTimer } from '../components';
import { useAuth } from '../context';
import { Booking, MainTabParamList } from '../types';
import { formatTimeRange, getFriendlyDateLabel } from '../utils/dateFormat';
import { isQrAvailable } from '../utils/timeGating';
import { getCurrentMission } from '../api/client';

type NavigationProp = BottomTabNavigationProp<MainTabParamList>;

export function HomeScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { driver } = useAuth();

    const [mission, setMission] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [qrAvailable, setQrAvailable] = useState(false);

    // Fetch mission data
    const fetchMission = useCallback(async () => {
        try {
            const currentMission = await getCurrentMission();
            setMission(currentMission);
        } catch (err) {
            console.error('Failed to fetch mission:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMission();
    }, [fetchMission]);

    // Check QR availability periodically
    useEffect(() => {
        if (!mission) return;

        const checkAvailability = () => {
            const available = isQrAvailable(mission.startTime);
            setQrAvailable(available);
        };

        checkAvailability();
        const interval = setInterval(checkAvailability, 1000);

        return () => clearInterval(interval);
    }, [mission]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchMission();
    }, [fetchMission]);

    // Navigate to QR screen
    const handleShowQR = () => {
        if (qrAvailable && mission?.status === 'CONFIRMED') {
            navigation.navigate('QRCode', { bookingId: mission.id });
        }
    };

    if (isLoading) {
        return <Loading fullScreen message="Chargement de votre mission..." />;
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTitleContainer}>
                        <Image
                            source={require('../assets/kamio.png')}
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.headerTitle}>PORT FLOW</Text>
                    </View>
                    <Text style={styles.headerGreeting}>
                        Bonjour, {driver?.firstName || 'Chauffeur'}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.cyan}
                        colors={[colors.cyan]}
                    />
                }
            >
                {/* Mission Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mission actuelle</Text>

                    {mission ? (
                        <MissionCard
                            mission={mission}
                            qrAvailable={qrAvailable}
                            onShowQR={handleShowQR}
                        />
                    ) : (
                        <EmptyState
                            icon="📭"
                            title="Aucune mission"
                            message="Vous n'avez pas de mission confirmée pour le moment."
                        />
                    )}
                </View>

                {/* QR Access Section */}
                {mission && mission.status === 'CONFIRMED' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Accès Port</Text>

                        {qrAvailable ? (
                            <Card variant="light" padding="lg" style={styles.qrCard}>
                                <View style={styles.qrCardContent}>
                                    <Text style={styles.qrIcon}>✅</Text>
                                    <View style={styles.qrTextContent}>
                                        <Text style={styles.qrTitle}>QR Code disponible</Text>
                                        <Text style={styles.qrSubtitle}>
                                            Présentez-le à l'entrée du terminal
                                        </Text>
                                    </View>
                                </View>
                                <Button
                                    title="Afficher QR Code"
                                    onPress={handleShowQR}
                                    style={styles.qrButton}
                                />
                            </Card>
                        ) : (
                            <CountdownTimer
                                targetTimeISO={mission.startTime}
                                onComplete={() => setQrAvailable(true)}
                            />
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// Mission Card Component
interface MissionCardProps {
    mission: Booking;
    qrAvailable: boolean;
    onShowQR: () => void;
}

function MissionCard({ mission, qrAvailable, onShowQR }: MissionCardProps) {
    const badgeProps = getStatusBadgeProps(mission.status);

    return (
        <Card variant="light" padding="lg" style={styles.missionCard}>
            {/* Header with badge */}
            <View style={styles.missionHeader}>
                <Text style={styles.missionReference}>{mission.reference}</Text>
                <Badge text={badgeProps.text} variant={badgeProps.variant} />
            </View>

            {/* Terminal */}
            <View style={styles.missionRow}>
                <Text style={styles.missionIcon}>📍</Text>
                <View style={styles.missionInfo}>
                    <Text style={styles.missionLabel}>Terminal</Text>
                    <Text style={styles.missionValue}>{mission.terminalName}</Text>
                </View>
            </View>

            {/* Date and Time */}
            <View style={styles.missionRow}>
                <Text style={styles.missionIcon}>📅</Text>
                <View style={styles.missionInfo}>
                    <Text style={styles.missionLabel}>Date</Text>
                    <Text style={styles.missionValue}>
                        {getFriendlyDateLabel(mission.startTime)}
                    </Text>
                </View>
            </View>

            <View style={styles.missionRow}>
                <Text style={styles.missionIcon}>🕐</Text>
                <View style={styles.missionInfo}>
                    <Text style={styles.missionLabel}>Horaire</Text>
                    <Text style={styles.missionValue}>
                        {formatTimeRange(mission.startTime, mission.endTime)}
                    </Text>
                </View>
            </View>

            {/* Driver Info */}
            <View style={styles.divider} />

            <View style={styles.missionRow}>
                <Text style={styles.missionIcon}>👤</Text>
                <View style={styles.missionInfo}>
                    <Text style={styles.missionLabel}>Chauffeur</Text>
                    <Text style={styles.missionValue}>{mission.driverName}</Text>
                </View>
            </View>

            {mission.driverPhone && (
                <View style={styles.missionRow}>
                    <Text style={styles.missionIcon}>📱</Text>
                    <View style={styles.missionInfo}>
                        <Text style={styles.missionLabel}>Téléphone</Text>
                        <Text style={styles.missionValue}>{mission.driverPhone}</Text>
                    </View>
                </View>
            )}

            {/* Container/Vehicle info if available */}
            {mission.vehiclePlate && (
                <View style={styles.missionRow}>
                    <Text style={styles.missionIcon}>🚚</Text>
                    <View style={styles.missionInfo}>
                        <Text style={styles.missionLabel}>Véhicule</Text>
                        <Text style={styles.missionValue}>{mission.vehiclePlate}</Text>
                    </View>
                </View>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.navy,
    },

    // Header
    header: {
        backgroundColor: colors.navy,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray800,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerLogo: {
        width: 32,
        height: 32,
    },
    headerTitle: {
        ...typography.h4,
        color: colors.white,
    },
    headerGreeting: {
        ...typography.bodySmall,
        color: colors.slate,
    },

    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },

    // Section
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h5,
        color: colors.white,
        marginBottom: spacing.md,
    },

    // Mission Card
    missionCard: {
        ...shadows.md,
    },
    missionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    missionReference: {
        ...typography.h5,
        color: colors.navy,
    },
    missionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    missionIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
        marginTop: 2,
    },
    missionInfo: {
        flex: 1,
    },
    missionLabel: {
        ...typography.caption,
        color: colors.slate,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    missionValue: {
        ...typography.body,
        color: colors.navy,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray200,
        marginVertical: spacing.md,
    },

    // QR Card
    qrCard: {
        ...shadows.md,
        borderWidth: 2,
        borderColor: colors.cyan,
    },
    qrCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    qrIcon: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    qrTextContent: {
        flex: 1,
    },
    qrTitle: {
        ...typography.h5,
        color: colors.navy,
    },
    qrSubtitle: {
        ...typography.bodySmall,
        color: colors.slate,
    },
    qrButton: {
        marginTop: spacing.sm,
    },
});

export default HomeScreen;
