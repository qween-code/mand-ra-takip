// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - DASHBOARD
// Main overview page with stats and quick actions
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Milk,
    Beef,
    Factory,
    TrendingUp,
    DollarSign,
    Droplets,
    ArrowRight,
    Plus,
    AlertTriangle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, StatCard, Button, Badge, cn } from '../components/ui';
import type { DashboardStats, Animal, Sale, MilkInventory } from '../types';

interface RecentSale {
    id: string;
    date: string;
    customer_name: string | null;
    total_amount: number;
    payment_status: string;
}

interface RecentActivity {
    id: string;
    type: 'milk' | 'sale' | 'production' | 'health' | 'expense';
    title: string;
    description: string;
    timestamp: string;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        todayMilk: 0,
        totalAnimals: 0,
        activeCows: 0,
        totalCalves: 0,
        activeProduction: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        tankBalance: 0,
    });
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [milkInventory, setMilkInventory] = useState<MilkInventory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

            // Fetch today's milk inventory
            const { data: inventoryData } = await supabase
                .from('milk_inventory')
                .select('*')
                .eq('date', today)
                .single();

            if (inventoryData) {
                setMilkInventory(inventoryData);
            }

            // Fetch today's milk production total
            const { data: milkData } = await supabase
                .from('daily_milk_production')
                .select('quantity_liters')
                .eq('date', today);

            const todayMilk = milkData?.reduce((sum, r) => sum + (r.quantity_liters || 0), 0) || 0;

            // Fetch animal counts
            const { data: animalsData } = await supabase
                .from('animals')
                .select('type, status');

            const activeCows = animalsData?.filter(a => a.type === 'cow' && a.status === 'active').length || 0;
            const totalCalves = animalsData?.filter(a => a.type === 'calf').length || 0;
            const totalAnimals = animalsData?.filter(a => a.status === 'active').length || 0;

            // Fetch active production batches
            const { count: productionCount } = await supabase
                .from('production_batches')
                .select('*', { count: 'exact', head: true })
                .in('status', ['planned', 'in_progress']);

            // Fetch monthly revenue
            const { data: salesData } = await supabase
                .from('sales')
                .select('total_amount')
                .gte('date', monthStart);

            const monthlyRevenue = salesData?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

            // Fetch monthly expenses
            const { data: expensesData } = await supabase
                .from('expenses')
                .select('amount')
                .gte('date', monthStart);

            const monthlyExpenses = expensesData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

            // Fetch recent sales
            const { data: recentSalesData } = await supabase
                .from('sales')
                .select('id, date, customer_name, total_amount, payment_status')
                .order('date', { ascending: false })
                .limit(5);

            setStats({
                todayMilk,
                totalAnimals,
                activeCows,
                totalCalves,
                activeProduction: productionCount || 0,
                monthlyRevenue,
                monthlyExpenses,
                tankBalance: inventoryData?.closing_balance || 0,
            });

            setRecentSales(recentSalesData || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Hoş Geldiniz 👋</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Bugünkü Süt"
                    value={`${stats.todayMilk.toFixed(1)} L`}
                    icon={Milk}
                    color="accent"
                    change={{ value: 8.2, label: 'dün' }}
                />
                <StatCard
                    title="Tank Dengesi"
                    value={`${stats.tankBalance.toFixed(1)} L`}
                    icon={Droplets}
                    color="info"
                />
                <StatCard
                    title="Aktif İnek"
                    value={stats.activeCows}
                    icon={Beef}
                    color="success"
                />
                <StatCard
                    title="Aylık Gelir"
                    value={`₺${stats.monthlyRevenue.toLocaleString('tr-TR')}`}
                    icon={TrendingUp}
                    color="primary"
                    change={{ value: 12.5, label: 'geçen ay' }}
                />
            </div>

            {/* Quick Actions - Simplified & Prominent */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Hızlı İşlemler</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                        variant="primary"
                        className="h-24 flex-col gap-3 text-lg hover:scale-105 transition-transform"
                        onClick={() => window.location.href = '/milk'}
                    >
                        <Milk size={32} />
                        <span>Süt Girişi</span>
                    </Button>
                    <Button
                        variant="secondary"
                        className="h-24 flex-col gap-3 text-lg hover:bg-[var(--bg-elevated)] transition-colors"
                        onClick={() => window.location.href = '/animals'}
                    >
                        <Beef size={32} />
                        <span>Hayvan Ekle</span>
                    </Button>
                    <Button
                        variant="secondary"
                        className="h-24 flex-col gap-3 text-lg hover:bg-[var(--bg-elevated)] transition-colors"
                        onClick={() => window.location.href = '/sales'}
                    >
                        <DollarSign size={32} />
                        <span>Satış Yap</span>
                    </Button>
                    <Button
                        variant="secondary"
                        className="h-24 flex-col gap-3 text-lg hover:bg-[var(--bg-elevated)] transition-colors"
                        onClick={() => window.location.href = '/financials'}
                    >
                        <TrendingUp size={32} />
                        <span>Gider Ekle</span>
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Milk Tank Status */}
                <Card>
                    <CardHeader
                        title="Süt Tankı Durumu"
                        subtitle="Bugünkü süt hareketleri"
                    />
                    {milkInventory ? (
                        <div className="space-y-4">
                            {/* Tank visualization */}
                            <div className="relative h-40 bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--accent)] to-[var(--accent-light)] transition-all duration-500"
                                    style={{ height: `${Math.min(100, (milkInventory.closing_balance / 500) * 100)}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white drop-shadow-lg">
                                            {milkInventory.closing_balance.toFixed(1)} L
                                        </div>
                                        <div className="text-sm text-white/70">Mevcut Miktar</div>
                                    </div>
                                </div>
                            </div>

                            {/* Flow details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--success-bg)] rounded-xl">
                                    <div className="text-2xl font-bold text-[var(--success)]">
                                        +{(milkInventory.total_produced + milkInventory.total_collected).toFixed(1)} L
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)]">Giriş (Üretim + Toplama)</div>
                                </div>
                                <div className="p-4 bg-[var(--error-bg)] rounded-xl">
                                    <div className="text-2xl font-bold text-[var(--error)]">
                                        -{(milkInventory.total_calf_consumed + milkInventory.total_production_used + milkInventory.total_sold).toFixed(1)} L
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)]">Çıkış (Tüketim + Üretim)</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[var(--text-secondary)]">
                            Bugün için henüz veri yok
                        </div>
                    )}
                </Card>

                {/* Recent Sales */}
                <Card>
                    <CardHeader
                        title="Son Satışlar"
                        subtitle="En son 5 satış işlemi"
                        action={
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/sales'}>
                                Tümünü Gör <ArrowRight size={14} />
                            </Button>
                        }
                    />
                    <div className="space-y-3">
                        {recentSales.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                Henüz satış kaydı yok
                            </div>
                        ) : (
                            recentSales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                                >
                                    <div>
                                        <p className="font-medium text-[var(--text-primary)]">
                                            {sale.customer_name || 'Genel Müşteri'}
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {format(new Date(sale.date), 'd MMM', { locale: tr })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={sale.payment_status === 'paid' ? 'success' : 'warning'}>
                                            {sale.payment_status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                                        </Badge>
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            ₺{sale.total_amount.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Animal Overview */}
                <Card>
                    <CardHeader
                        title="Hayvan Özeti"
                        subtitle="Aktif hayvan durumu"
                        action={
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/animals'}>
                                Detay <ArrowRight size={14} />
                            </Button>
                        }
                    />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
                                <Beef size={24} className="text-[var(--success)]" />
                            </div>
                            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.activeCows}</div>
                            <div className="text-sm text-[var(--text-secondary)]">Aktif İnek</div>
                        </div>
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--warning-bg)] flex items-center justify-center">
                                <Beef size={24} className="text-[var(--warning)]" />
                            </div>
                            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCalves}</div>
                            <div className="text-sm text-[var(--text-secondary)]">Buzağı</div>
                        </div>
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--info-bg)] flex items-center justify-center">
                                <CheckCircle2 size={24} className="text-[var(--info)]" />
                            </div>
                            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalAnimals}</div>
                            <div className="text-sm text-[var(--text-secondary)]">Toplam</div>
                        </div>
                    </div>
                </Card>

                {/* Financial Summary */}
                <Card>
                    <CardHeader
                        title="Aylık Finans"
                        subtitle={format(new Date(), 'MMMM yyyy', { locale: tr })}
                    />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[var(--success-bg)] rounded-xl">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} className="text-[var(--success)]" />
                                <span className="text-[var(--text-secondary)]">Gelir</span>
                            </div>
                            <span className="text-xl font-bold text-[var(--success)]">
                                ₺{stats.monthlyRevenue.toLocaleString('tr-TR')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--error-bg)] rounded-xl">
                            <div className="flex items-center gap-3">
                                <DollarSign size={20} className="text-[var(--error)]" />
                                <span className="text-[var(--text-secondary)]">Gider</span>
                            </div>
                            <span className="text-xl font-bold text-[var(--error)]">
                                ₺{stats.monthlyExpenses.toLocaleString('tr-TR')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border-2 border-[var(--border-visible)]">
                            <span className="font-medium text-[var(--text-primary)]">Net Kar</span>
                            <span className={cn(
                                'text-xl font-bold',
                                stats.monthlyRevenue - stats.monthlyExpenses >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                            )}>
                                ₺{(stats.monthlyRevenue - stats.monthlyExpenses).toLocaleString('tr-TR')}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
