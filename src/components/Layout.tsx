// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - LAYOUT COMPONENT
// Premium Sidebar with Navigation
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Milk,
    Beef,
    Factory,
    Truck,
    TrendingUp,
    BarChart3,
    Settings,
    Bell,
    ShoppingCart,
    Users,
    Undo2,
    Droplets,
    LogOut,
    DollarSign
} from 'lucide-react';
import { cn } from './ui';
import { useAuth } from '../context/AuthContext';

interface NavItem {
    path: string;
    label: string;
    icon: React.ElementType;
    adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
    { path: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
];

const dailyNavItems: NavItem[] = [
    { path: '/milk', label: 'Süt Girişi', icon: Milk },
    { path: '/animals', label: 'Hayvanlar', icon: Beef },
    { path: '/financials', label: 'Finans', icon: DollarSign },
];

const managementNavItems: NavItem[] = [
    { path: '/production', label: 'Üretim', icon: Factory, adminOnly: true },
    { path: '/suppliers', label: 'Tedarikçiler', icon: Users, adminOnly: true },
    { path: '/distribution', label: 'Lojistik', icon: Truck, adminOnly: true },
    { path: '/returns', label: 'İadeler', icon: Undo2, adminOnly: true },
];

const reportNavItems: NavItem[] = [
    { path: '/analytics', label: 'Raporlar', icon: BarChart3, adminOnly: true },
];

const SidebarLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const location = useLocation();
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
        <NavLink
            to={item.path}
            className={cn(
                'sidebar-link relative',
                isActive && 'active'
            )}
        >
            <Icon size={20} />
            <span>{item.label}</span>
        </NavLink>
    );
};

const SidebarSection: React.FC<{ title: string; items: NavItem[] }> = ({ title, items }) => {
    const { user } = useAuth();

    const filteredItems = items.filter(item => {
        if (item.adminOnly && user?.role !== 'admin') return false;
        return true;
    });

    if (filteredItems.length === 0) return null;

    return (
        <div className="sidebar-section">
            <div className="sidebar-section-title">{title}</div>
            <nav className="sidebar-nav">
                {filteredItems.map((item) => (
                    <SidebarLink key={item.path} item={item} />
                ))}
            </nav>
        </div>
    );
};

export const Layout: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Sidebar */}
            <aside className="sidebar">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Droplets size={24} />
                    </div>
                    <span className="sidebar-logo-text">Mandıra</span>
                </div>

                {/* Main Navigation */}
                <nav className="sidebar-nav">
                    {mainNavItems.map((item) => (
                        <SidebarLink key={item.path} item={item} />
                    ))}
                </nav>

                {/* Daily Operations */}
                <SidebarSection title="Günlük İşlemler" items={dailyNavItems} />

                {/* Management Section */}
                <SidebarSection title="Yönetim" items={managementNavItems} />

                {/* Reports Section */}
                <SidebarSection title="Raporlar" items={reportNavItems} />

                {/* Bottom Section */}
                <div className="mt-auto pt-6 border-t border-[var(--border-subtle)]">
                    <NavLink to="/notifications" className="sidebar-link">
                        <Bell size={20} />
                        <span>Bildirimler</span>
                        {/* Notification badge */}
                        <span className="ml-auto w-5 h-5 bg-[var(--error)] rounded-full flex items-center justify-center text-xs font-medium">
                            3
                        </span>
                    </NavLink>
                    <NavLink to="/settings" className="sidebar-link">
                        <Settings size={20} />
                        <span>Ayarlar</span>
                    </NavLink>

                    {/* User Info */}
                    <div className="mt-4 p-4 bg-[var(--bg-elevated)] rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || 'M'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {user?.name || 'Kullanıcı'}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] capitalize">
                                    {user?.role || 'admin'}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                                title="Çıkış Yap"
                            >
                                <LogOut size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
