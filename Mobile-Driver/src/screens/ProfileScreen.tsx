/**
 * PORT FLOW DRIVER - Profile Screen
 * Read-only driver profile with logout
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Card, Button } from '../components';
import { useAuth } from '../context';

export function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { driver, logout, isLoading } = useAuth();

    // Handle logout
    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    const fullName = driver ? `${driver.firstName} ${driver.lastName}` : 'Chauffeur';

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Profil</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + spacing.xl },
                ]}
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {driver?.firstName?.[0] || 'C'}
                            {driver?.lastName?.[0] || 'H'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{fullName}</Text>
                    <Text style={styles.role}>Chauffeur</Text>
                </View>

                {/* Profile Info Card */}
                <Card variant="light" padding="none" style={styles.infoCard}>
                    <ProfileRow
                        icon="📧"
                        label="Email"
                        value={driver?.email || '—'}
                    />
                    <ProfileRow
                        icon="📱"
                        label="Téléphone"
                        value={driver?.phone || '—'}
                    />
                    <ProfileRow
                        icon="🏢"
                        label="Transporteur"
                        value={driver?.transporterName || '—'}
                        isLast
                    />
                </Card>

                {/* App Info */}
                <View style={styles.appInfoSection}>
                    <Text style={styles.appInfoTitle}>PORT FLOW DRIVER</Text>
                    <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
                </View>

                {/* Logout Button */}
                <Button
                    title="Se déconnecter"
                    variant="outline"
                    onPress={handleLogout}
                    loading={isLoading}
                    style={styles.logoutButton}
                />

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2024 PORT FLOW</Text>
                    <Text style={styles.footerText}>Tous droits réservés</Text>
                </View>
            </ScrollView>
        </View>
    );
}

// Profile Row Component
interface ProfileRowProps {
    icon: string;
    label: string;
    value: string;
    isLast?: boolean;
}

function ProfileRow({ icon, label, value, isLast = false }: ProfileRowProps) {
    return (
        <View style={[styles.profileRow, !isLast && styles.profileRowBorder]}>
            <View style={styles.rowIcon}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                    {value}
                </Text>
            </View>
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
        textAlign: 'center',
    },

    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.cyan,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    avatarText: {
        ...typography.h2,
        color: colors.navy,
        fontWeight: 'bold',
    },
    name: {
        ...typography.h4,
        color: colors.white,
        marginBottom: spacing.xs,
    },
    role: {
        ...typography.body,
        color: colors.slate,
    },

    // Info Card
    infoCard: {
        ...shadows.md,
        marginBottom: spacing.xl,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    profileRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    rowIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    iconText: {
        fontSize: 18,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        ...typography.caption,
        color: colors.slate,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    rowValue: {
        ...typography.body,
        color: colors.navy,
        fontWeight: '600',
    },

    // App Info
    appInfoSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    appInfoTitle: {
        ...typography.bodyBold,
        color: colors.slate,
        letterSpacing: 2,
    },
    appInfoVersion: {
        ...typography.caption,
        color: colors.gray500,
        marginTop: spacing.xs,
    },

    // Logout
    logoutButton: {
        marginBottom: spacing.xl,
        borderColor: colors.gray500,
    },

    // Footer
    footer: {
        alignItems: 'center',
    },
    footerText: {
        ...typography.caption,
        color: colors.gray600,
    },
});

export default ProfileScreen;
