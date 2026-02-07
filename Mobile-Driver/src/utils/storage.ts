/**
 * PORT FLOW DRIVER - Secure Storage Wrapper
 * Uses Expo SecureStore for token storage
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'portflow_driver_token';
const DRIVER_KEY = 'portflow_driver_profile';

const isWeb = Platform.OS === 'web';

/**
 * Save authentication token securely
 */
export async function saveToken(token: string): Promise<void> {
    if (isWeb) {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
}

/**
 * Get stored authentication token
 */
export async function getToken(): Promise<string | null> {
    if (isWeb) {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (e) {
            console.warn('LocalStorage error:', e);
            return null;
        }
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Remove authentication token (logout)
 */
export async function removeToken(): Promise<void> {
    if (isWeb) {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
}

/**
 * Save driver profile
 */
export async function saveDriverProfile(driver: object): Promise<void> {
    if (isWeb) {
        try {
            localStorage.setItem(DRIVER_KEY, JSON.stringify(driver));
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    } else {
        await SecureStore.setItemAsync(DRIVER_KEY, JSON.stringify(driver));
    }
}

/**
 * Get stored driver profile
 */
export async function getDriverProfile(): Promise<object | null> {
    if (isWeb) {
        try {
            const profile = localStorage.getItem(DRIVER_KEY);
            return profile ? JSON.parse(profile) : null;
        } catch (e) {
            console.warn('LocalStorage error:', e);
            return null;
        }
    }

    const profile = await SecureStore.getItemAsync(DRIVER_KEY);
    return profile ? JSON.parse(profile) : null;
}

/**
 * Remove driver profile (logout)
 */
export async function removeDriverProfile(): Promise<void> {
    if (isWeb) {
        try {
            localStorage.removeItem(DRIVER_KEY);
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    } else {
        await SecureStore.deleteItemAsync(DRIVER_KEY);
    }
}

/**
 * Clear all auth data (full logout)
 */
export async function clearAuthData(): Promise<void> {
    await Promise.all([
        removeToken(),
        removeDriverProfile(),
    ]);
}
