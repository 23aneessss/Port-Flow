/**
 * PORT FLOW DRIVER - Splash Screen
 * Loading screen with branding and animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface SplashScreenProps {
    onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Run animation sequence
        Animated.sequence([
            // Logo fade in and scale
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
            // Text fade in
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            // Hold for a moment
            Animated.delay(800),
        ]).start(() => {
            onFinish();
        });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={require('../assets/kamio.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </Animated.View>

            <Animated.View style={{ opacity: textFadeAnim }}>
                <Text style={styles.appName}>PORT FLOW</Text>
                <Text style={styles.appSubtitle}>DRIVER</Text>
            </Animated.View>

            <View style={styles.loaderContainer}>
                <Animated.View style={[styles.loader, { opacity: textFadeAnim }]}>
                    <View style={styles.loaderDot} />
                    <View style={[styles.loaderDot, styles.loaderDotMiddle]} />
                    <View style={styles.loaderDot} />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.navy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    logoImage: {
        width: 180,
        height: 180,
    },
    appName: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 36,
        color: colors.white,
        textAlign: 'center',
        letterSpacing: 4,
    },
    appSubtitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 24,
        color: colors.cyan,
        textAlign: 'center',
        letterSpacing: 8,
        marginTop: spacing.xs,
    },
    loaderContainer: {
        position: 'absolute',
        bottom: 80,
    },
    loader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    loaderDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.cyan,
        opacity: 0.4,
    },
    loaderDotMiddle: {
        opacity: 0.7,
        transform: [{ scale: 1.2 }],
    },
});

export default SplashScreen;
