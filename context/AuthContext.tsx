import React, { createContext, useContext, useState } from 'react';
import { store, HRMSUser, UserRole } from '../utils/store';
import { authApi } from '../src/api/auth';
import { adminApi } from '../src/api/admin';

interface AuthContextType {
    user: HRMSUser | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const SESSION_KEY = 'hrms_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<HRMSUser | null>(() => {
        try {
            const session = localStorage.getItem(SESSION_KEY);
            if (!session) return null;
            const parsed = JSON.parse(session);
            // Support both old format (userId) and new format (user object)
            return parsed.user ?? null;
        } catch { return null; }
    });

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!email.trim()) return { success: false, error: 'Email is required.' };
        if (!password) return { success: false, error: 'Password is required.' };

        // Try FastAPI backend first
        try {
            const response = await authApi.login(email.trim(), password);
            if (response && response.user) {
                const loggedInUser = response.user as HRMSUser;
                setUser(loggedInUser);
                localStorage.setItem(SESSION_KEY, JSON.stringify({ user: loggedInUser, token: response.token }));
                return { success: true };
            }
        } catch (apiError) {
            // Backend unavailable or returned error — fall back to local store
            console.warn('Backend login failed, falling back to local store:', apiError);
        }

        // Fallback: Use local store (works even when backend is offline)
        try {
            // Initialize store if needed
            store.init();
            const validated = store.validateLogin(email.trim(), password);
            if (validated) {
                setUser(validated);
                localStorage.setItem(SESSION_KEY, JSON.stringify({ user: validated }));
                return { success: true };
            }
        } catch (storeError) {
            console.error('Local store login also failed:', storeError);
        }

        return { success: false, error: 'Invalid email or password. Please try again.' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
    };

    const refreshUser = async () => {
        if (!user) return;
        try {
            const users = await adminApi.getUsers();
            const fresh = users.find((u: any) => u.id === user.id);
            if (fresh) {
                setUser(fresh as HRMSUser);
                localStorage.setItem(SESSION_KEY, JSON.stringify({ user: fresh }));
            }
        } catch {
            // Fallback to local store
            const fresh = store.getUsers().find(u => u.id === user.id);
            if (fresh) setUser(fresh);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

// Keep UserRole export for backward compat
export type { UserRole };
