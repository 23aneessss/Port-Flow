/**
 * PORT FLOW DRIVER - Header Component
 * App header with navy background
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface HeaderProps {
    title: string;
    subtitle?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onLeftPress?: () => void;
    onRightPress?: () => void;
    showLogo?: boolean;
}

export function Header({
    title,
    subtitle,
    leftIcon,
    rightIcon,
    onLeftPress,
    onRightPress,
    showLogo = false,
}: HeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

            <View style={styles.content}>
                {/* Left area */}
                <View style={styles.sideArea}>
                    {leftIcon && onLeftPress ? (
                        <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                            {leftIcon}
                        </TouchableOpacity>
                    ) : (
                        leftIcon
                    )}
                </View>

                {/* Center - Title */}
                <View style={styles.centerArea}>
                    {showLogo && (
                        <Image
                            source={require('../assets/kamio.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    )}
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {subtitle && (
                        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                    )}
                </View>

                {/* Right area */}
                <View style={styles.sideArea}>
                    {rightIcon && onRightPress ? (
                        <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                            {rightIcon}
                        </TouchableOpacity>
                    ) : (
                        rightIcon
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.navy,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
    },
    sideArea: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 32,
        height: 32,
        marginBottom: 4,
    },
    title: {
        ...typography.h4,
        color: colors.white,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.bodySmall,
        color: colors.slate,
        textAlign: 'center',
        marginTop: 2,
    },
    iconButton: {
        padding: spacing.sm,
        marginLeft: -spacing.sm,
        marginRight: -spacing.sm,
    },
});

export default Header;
