/**
 * PORT FLOW DRIVER - Notifications Screen
 * Shows all notifications for the driver
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Card, EmptyState, Loading } from '../components';
import { Notification, NotificationType } from '../types';
import { getRelativeTime } from '../utils/dateFormat';
import { getNotifications, markNotificationAsRead } from '../api/client';

// Icon for each notification type
const notificationIcons: Record<NotificationType, string> = {
    BOOKING_CONFIRMED: '✅',
    QR_READY: '🔓',
    GENERIC: 'ℹ️',
    REMINDER_15M: '🔔',
    BOOKING_CANCELLED: '❌',
    BOOKING_UPDATED: '📝',
    SYSTEM: 'ℹ️',
};

export function NotificationsScreen() {
    const insets = useSafeAreaInsets();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Count unread notifications
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    // Mark notification as read
    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.isRead) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
            );

            try {
                await markNotificationAsRead(notification.id);
            } catch (err) {
                console.error('Failed to mark notification as read:', err);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, isRead: false } : n))
                );
            }
        }
    };

    // Render notification item
    const renderNotification = ({ item }: { item: Notification }) => {
        const icon = notificationIcons[item.type] || 'ℹ️';

        return (
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <Card
                    variant="light"
                    padding="md"
                    style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                >
                    <View style={styles.notificationContent}>
                        {/* Unread indicator */}
                        {!item.isRead && <View style={styles.unreadDot} />}

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>{icon}</Text>
                        </View>

                        {/* Content */}
                        <View style={styles.textContent}>
                            <Text style={styles.title} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={styles.message} numberOfLines={2}>
                                {item.message}
                            </Text>
                            <Text style={styles.timestamp}>{getRelativeTime(item.createdAt)}</Text>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <Loading fullScreen message="Chargement des notifications..." />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.headerSubtitle}>
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {notifications.length === 0 ? (
                <EmptyState
                    icon="🔔"
                    title="Pas de notifications"
                    message="Vous recevrez ici les confirmations de vos trajets et rappels."
                />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
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
    badge: {
        backgroundColor: colors.cyan,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        ...typography.caption,
        color: colors.navy,
        fontWeight: 'bold',
    },

    // List
    listContent: {
        padding: spacing.lg,
    },
    separator: {
        height: spacing.sm,
    },

    // Notification Card
    notificationCard: {
        ...shadows.sm,
    },
    unreadCard: {
        borderLeftWidth: 3,
        borderLeftColor: colors.cyan,
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.cyan,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    icon: {
        fontSize: 18,
    },
    textContent: {
        flex: 1,
    },
    title: {
        ...typography.bodyBold,
        color: colors.navy,
        marginBottom: 2,
    },
    message: {
        ...typography.bodySmall,
        color: colors.slate,
        lineHeight: 18,
        marginBottom: spacing.xs,
    },
    timestamp: {
        ...typography.caption,
        color: colors.gray400,
    },
});

export default NotificationsScreen;
