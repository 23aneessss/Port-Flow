/**
 * PORT FLOW DRIVER - Login Screen
 * Driver authentication (login only, no registration)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { Button, Input, Toast } from '../components';
import { useAuth } from '../context';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen() {
    const insets = useSafeAreaInsets();
    const { login, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Validate form
    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            errors.email = 'Email requis';
        } else if (!EMAIL_REGEX.test(email)) {
            errors.email = 'Format email invalide';
        }

        if (!password) {
            errors.password = 'Mot de passe requis';
        } else if (password.length < 6) {
            errors.password = 'Minimum 6 caractères';
        }

        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle login
    const handleLogin = async () => {
        clearError();

        if (!validateForm()) {
            return;
        }

        try {
            await login({ email: email.trim(), password });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Échec de la connexion';
            setToastMessage(message);
            setShowToast(true);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/kamio.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.appName}>PORT FLOW</Text>
                    <Text style={styles.appSubtitle}>DRIVER</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <Text style={styles.welcomeText}>Bienvenue</Text>
                    <Text style={styles.instructionText}>
                        Connectez-vous avec vos identifiants
                    </Text>

                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="votre.email@transporteur.fr"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (localErrors.email) {
                                    setLocalErrors((prev) => ({ ...prev, email: undefined }));
                                }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={localErrors.email}
                            leftIcon={<Text style={styles.inputIcon}>📧</Text>}
                        />

                        <Input
                            label="Mot de passe"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (localErrors.password) {
                                    setLocalErrors((prev) => ({ ...prev, password: undefined }));
                                }
                            }}
                            secureTextEntry={!showPassword}
                            error={localErrors.password}
                            leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
                            rightIcon={
                                <Text style={styles.inputIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                            }
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />

                        <Button
                            title="Se connecter"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.loginButton}
                        />
                    </View>

                    {/* Helper text */}
                    <View style={styles.helperSection}>
                        <View style={styles.helperBox}>
                            <Text style={styles.helperIcon}>ℹ️</Text>
                            <Text style={styles.helperText}>
                                Compte fourni par votre transporteur
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>PORT FLOW © 2024</Text>
                </View>
            </ScrollView>

            {/* Toast for errors */}
            <Toast
                message={toastMessage}
                type="error"
                visible={showToast}
                onDismiss={() => setShowToast(false)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.navy,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
    },

    // Logo Section
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -15,
    },
    logoImage: {
        width: 150,
        height: 150,
    },
    appName: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 28,
        color: colors.white,
        letterSpacing: 3,
    },
    appSubtitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: colors.cyan,
        letterSpacing: 6,
    },

    // Form Section
    formSection: {
        flex: 1,
    },
    welcomeText: {
        ...typography.h2,
        color: colors.white,
        marginBottom: spacing.xs,
    },
    instructionText: {
        ...typography.body,
        color: colors.slate,
        marginBottom: spacing.xl,
    },
    form: {
        gap: spacing.sm,
    },
    inputIcon: {
        fontSize: 18,
    },
    loginButton: {
        marginTop: spacing.md,
    },

    // Helper Section
    helperSection: {
        marginTop: spacing.xl,
    },
    helperBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray800,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    helperIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    helperText: {
        ...typography.bodySmall,
        color: colors.slate,
        flex: 1,
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingTop: spacing.xl,
    },
    footerText: {
        ...typography.caption,
        color: colors.gray600,
    },
});

export default LoginScreen;
