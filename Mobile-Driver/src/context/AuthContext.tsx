/**
 * PORT FLOW DRIVER - Authentication Context
 * Manages user authentication state throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Driver, LoginCredentials, AuthResponse } from '../types';
import { saveToken, getToken, clearAuthData, saveDriverProfile, getDriverProfile } from '../utils/storage';
import { login as apiLogin, getProfile } from '../api/client';

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    driver: Driver | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check for existing session on app start
    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();

            if (token) {
                // Try to get stored profile or fetch from API
                const storedProfile = await getDriverProfile();

                if (storedProfile) {
                    setDriver(storedProfile as Driver);
                    setIsAuthenticated(true);
                } else {
                    // Fetch profile from API when local profile is missing
                    const profile = await getProfile();
                    setDriver(profile);
                    await saveDriverProfile(profile);
                    setIsAuthenticated(true);
                }
            }
        } catch (err) {
            // Token expired or invalid, clear auth data
            await clearAuthData();
            setIsAuthenticated(false);
            setDriver(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            setError(null);

            const response: AuthResponse = await apiLogin(credentials);

            // Save token and profile
            await saveToken(response.token);
            await saveDriverProfile(response.driver);

            setDriver(response.driver);
            setIsAuthenticated(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Échec de la connexion';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setIsLoading(true);
            await clearAuthData();
            setDriver(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        try {
            const profile = await getProfile();
            setDriver(profile);
            await saveDriverProfile(profile);
        } catch (err) {
            console.error('Failed to refresh profile:', err);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: AuthContextType = {
        isLoading,
        isAuthenticated,
        driver,
        login,
        logout,
        refreshProfile,
        error,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;
