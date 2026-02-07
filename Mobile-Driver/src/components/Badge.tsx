/**
 * PORT FLOW DRIVER - Badge Component
 * Status badges for bookings and notifications
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { BookingStatus } from '../types';

type BadgeVariant = 'confirmed' | 'pending' | 'consumed' | 'cancelled' | 'expired' | 'info' | 'warning';

interface BadgeProps {
    text: string;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    confirmed: { bg: colors.cyanTransparent, text: colors.cyan },
    pending: { bg: 'rgba(245, 158, 11, 0.2)', text: colors.warning },
    consumed: { bg: colors.gray200, text: colors.slate },
    cancelled: { bg: colors.errorLight, text: colors.error },
    expired: { bg: colors.gray200, text: colors.slate },
    info: { bg: colors.cyanTransparent, text: colors.cyan },
    warning: { bg: 'rgba(245, 158, 11, 0.2)', text: colors.warning },
};

export function Badge({ text, variant = 'info', size = 'md' }: BadgeProps) {
    const colorScheme = variantColors[variant];

    const badgeStyle: ViewStyle = {
        backgroundColor: colorScheme.bg,
        paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        paddingVertical: size === 'sm' ? 2 : 4,
        borderRadius: borderRadius.full,
    };

    const textStyle: TextStyle = {
        ...typography.label,
        color: colorScheme.text,
        fontSize: size === 'sm' ? 10 : 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    };

    return (
        <View style={badgeStyle}>
            <Text style={textStyle}>{text}</Text>
        </View>
    );
}

// Helper to get badge props from booking status
export function getStatusBadgeProps(status: BookingStatus): { text: string; variant: BadgeVariant } {
    const statusMap: Record<BookingStatus, { text: string; variant: BadgeVariant }> = {
        CONFIRMED: { text: 'Confirmé', variant: 'confirmed' },
        PENDING: { text: 'En attente', variant: 'pending' },
        REJECTED: { text: 'Rejeté', variant: 'cancelled' },
        CONSUMED: { text: 'Terminé', variant: 'consumed' },
        CANCELLED: { text: 'Annulé', variant: 'cancelled' },
        EXPIRED: { text: 'Expiré', variant: 'expired' },
    };

    return statusMap[status] || { text: status, variant: 'info' };
}

export default Badge;
