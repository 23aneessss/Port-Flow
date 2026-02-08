/**
 * PORT FLOW DRIVER - History Screen
 * Shows past trips (consumed bookings)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, shadows } from '../theme/spacing';
import { Card, Badge, EmptyState, Loading } from '../components';
import { Booking } from '../types';
import { formatDate, formatTimeRange } from '../utils/dateFormat';
import { getHistory } from '../api/client';

export function HistoryScreen() {
    const insets = useSafeAreaInsets();

    const [history, setHistory] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch history
    const fetchHistory = useCallback(async () => {
        try {
            const data = await getHistory();
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchHistory();
    }, [fetchHistory]);

    // Render history item
    const renderHistoryItem = ({ item }: { item: Booking }) => (
        <Card variant="light" padding="md" style={styles.historyCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <Text style={styles.reference}>{item.reference}</Text>
                <Badge text="Terminé" variant="consumed" size="sm" />
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <Text style={styles.icon}>📍</Text>
                    <Text style={styles.value}>{item.terminalName}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.icon}>📅</Text>
                    <Text style={styles.value}>{formatDate(item.startTime)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.icon}>🕐</Text>
                    <Text style={styles.value}>
                        {formatTimeRange(item.startTime, item.endTime)}
                    </Text>
                </View>

                {item.vehiclePlate && (
                    <View style={styles.row}>
                        <Text style={styles.icon}>🚚</Text>
                        <Text style={styles.value}>{item.vehiclePlate}</Text>
                    </View>
                )}
            </View>
        </Card>
    );

    if (isLoading) {
        return <Loading fullScreen message="Chargement de l'historique..." />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Historique</Text>
                <Text style={styles.headerSubtitle}>
                    {history.length} trajet{history.length !== 1 ? 's' : ''} effectué{history.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {history.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="Aucun historique"
                    message="Vos trajets terminés apparaîtront ici."
                />
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + spacing.lg },
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.cyan}
                            colors={[colors.cyan]}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
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
        borderBottomWidth: 1,
        borderBottomColor: colors.gray800,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.white,
    },
    headerSubtitle: {
        ...typography.bodySmall,
        color: colors.slate,
        marginTop: spacing.xs,
    },

    // List
    listContent: {
        padding: spacing.lg,
    },
    separator: {
        height: spacing.md,
    },

    // History Card
    historyCard: {
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    reference: {
        ...typography.bodyBold,
        color: colors.navy,
    },
    cardContent: {
        gap: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 14,
        marginRight: spacing.sm,
        width: 20,
    },
    value: {
        ...typography.bodySmall,
        color: colors.slate,
        flex: 1,
    },
});

export default HistoryScreen;
