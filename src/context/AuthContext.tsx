// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - AUTH CONTEXT
// Simplified auth for local development (no Supabase auth required)
// ═══════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

type UserRole = 'admin' | 'manager' | 'worker';

interface AuthContextType {
    user: User | null;
    role: UserRole;
    loading: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isWorker: boolean;
    login: (name: string, role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default user for development
const defaultUser: User = {
    id: 'demo-user-1',
    email: 'admin@mandira.com',
    name: 'Mehmet Yılmaz',
    role: 'admin',
    phone: '0532 111 2233',
    created_at: new Date().toISOString(),
    is_active: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auto-login with default user for development
        const storedUser = localStorage.getItem('mandira_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Auto-login as admin for demo
            setUser(defaultUser);
            localStorage.setItem('mandira_user', JSON.stringify(defaultUser));
        }
        setLoading(false);
    }, []);

    const login = (name: string, role: UserRole) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            email: `${name.toLowerCase().replace(' ', '.')}@mandira.com`,
            name,
            role,
            phone: null,
            created_at: new Date().toISOString(),
            is_active: true,
        };
        setUser(newUser);
        localStorage.setItem('mandira_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mandira_user');
        // Re-login as admin for demo purposes
        setTimeout(() => {
            setUser(defaultUser);
            localStorage.setItem('mandira_user', JSON.stringify(defaultUser));
        }, 100);
    };

    const value: AuthContextType = {
        user,
        role: user?.role || 'worker',
        loading,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager',
        isWorker: user?.role === 'worker',
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
