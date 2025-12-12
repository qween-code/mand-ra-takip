// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - AUTH CONTEXT
// Supabase Authentication
// ═══════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

type UserRole = 'admin' | 'manager' | 'worker';

interface AuthContextType {
    user: User | null;
    role: UserRole;
    loading: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isWorker: boolean;
    login: (email: string, password: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapSupabaseUser = (u: any): User => {
        return {
            id: u.id,
            email: u.email || '',
            name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
            role: u.user_metadata?.role || 'worker',
            phone: u.phone || null,
            created_at: u.created_at,
            is_active: true
        };
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const value: AuthContextType = {
        user,
        role: (user?.role as UserRole) || 'worker',
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
