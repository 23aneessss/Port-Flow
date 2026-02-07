/**
 * PORT FLOW DRIVER - Navigation Configuration
 * Root navigation with auth flow and main tabs
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList, MainTabParamList, Booking } from '../types';
import { useAuth } from '../context';
import { isQrAvailable } from '../utils/timeGating';
import { getCurrentMission } from '../api/client';
import {
    SplashScreen,
    LoginScreen,
    HomeScreen,
    QRCodeScreen,
    NotificationsScreen,
    HistoryScreen,
    ProfileScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icons (using emojis, replace with proper icons in production)
const tabIcons: Record<keyof MainTabParamList, { active: string; inactive: string }> = {
    Home: { active: '🏠', inactive: '🏠' },
    QRCode: { active: '📱', inactive: '📱' },
    Notifications: { active: '🔔', inactive: '🔔' },
    History: { active: '📋', inactive: '📋' },
    Profile: { active: '👤', inactive: '👤' },
};

// Main Tab Navigator
function MainTabs() {
    const insets = useSafeAreaInsets();
    const [showQrLockedModal, setShowQrLockedModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

    // Get current booking to check QR availability
    useEffect(() => {
        let isMounted = true;

        const syncCurrentBooking = async () => {
            try {
                const mission = await getCurrentMission();
                if (isMounted) {
                    setCurrentBooking(mission);
                }
            } catch (err) {
                if (isMounted) {
                    setCurrentBooking(null);
                }
                console.error('Failed to fetch current mission for QR access:', err);
            }
        };

        syncCurrentBooking();
        const interval = setInterval(syncCurrentBooking, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Check if QR tab should be accessible
    const isQrTabAccessible = () => {
        if (!currentBooking || currentBooking.status !== 'CONFIRMED') {
            return false;
        }
        return isQrAvailable(currentBooking.startTime);
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colors.navy,
                        borderTopColor: colors.gray800,
                        borderTopWidth: 1,
                        paddingTop: spacing.sm,
                        paddingBottom: insets.bottom + spacing.sm,
                        height: 60 + insets.bottom,
                    },
                    tabBarActiveTintColor: colors.cyan,
                    tabBarInactiveTintColor: colors.slate,
                    tabBarLabelStyle: {
                        ...typography.caption,
                        marginTop: 4,
                    },
                    tabBarIcon: ({ focused }) => {
                        const icons = tabIcons[route.name];
                        const isQrTab = route.name === 'QRCode';
                        const qrLocked = isQrTab && !isQrTabAccessible();

                        return (
                            <View style={[styles.tabIcon, qrLocked && styles.tabIconLocked]}>
                                <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>
                                    {qrLocked ? '🔒' : focused ? icons.active : icons.inactive}
                                </Text>
                            </View>
                        );
                    },
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ tabBarLabel: 'Accueil' }}
                />
                <Tab.Screen
                    name="QRCode"
                    component={QRCodeScreen}
                    options={{ tabBarLabel: 'QR Code' }}
                    listeners={{
                        tabPress: (e) => {
                            if (!isQrTabAccessible()) {
                                e.preventDefault();
                                setShowQrLockedModal(true);
                            }
                        },
                    }}
                />
                <Tab.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ tabBarLabel: 'Notifs' }}
                />
                <Tab.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{ tabBarLabel: 'Historique' }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ tabBarLabel: 'Profil' }}
                />
            </Tab.Navigator>

            {/* QR Locked Modal */}
            <Modal
                visible={showQrLockedModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQrLockedModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowQrLockedModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalIcon}>🔒</Text>
                        <Text style={styles.modalTitle}>QR Code verrouillé</Text>
                        <Text style={styles.modalText}>
                            {!currentBooking
                                ? "Vous n'avez pas de mission confirmée."
                                : 'Le QR code sera disponible 15 minutes avant votre créneau.'}
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowQrLockedModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Compris</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

// Root Navigator
export function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Show splash for a minimum time
    useEffect(() => {
        if (!isLoading && showSplash) {
            // Keep splash for animation
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, showSplash]);

    if (showSplash || isLoading) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <Stack.Screen name="Main" component={MainTabs} />
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
}

// App Navigation Container
export function AppNavigation() {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    // Tab Icons
    tabIcon: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconLocked: {
        opacity: 0.5,
    },
    tabIconText: {
        fontSize: 20,
    },
    tabIconTextActive: {
        fontSize: 22,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    },
    modalIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    modalTitle: {
        ...typography.h4,
        color: colors.navy,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    modalText: {
        ...typography.body,
        color: colors.slate,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    modalButton: {
        backgroundColor: colors.cyan,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        width: '100%',
    },
    modalButtonText: {
        ...typography.button,
        color: colors.navy,
        textAlign: 'center',
    },
});

export default AppNavigation;
