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

    {/* Quick Actions - Top Priority */ }
    <div className="grid grid-cols-2 gap-4 mb-8">
        <Button
            variant="primary"
            className="h-32 flex-col gap-4 text-xl font-bold hover:scale-[1.02] transition-transform shadow-lg"
            onClick={() => window.location.href = '/milk'}
        >
            <div className="p-4 rounded-full bg-white/20">
                <Milk size={40} />
            </div>
            <span>Süt Girişi</span>
        </Button>
        <Button
            variant="secondary"
            className="h-32 flex-col gap-4 text-xl font-bold hover:bg-[var(--bg-elevated)] transition-colors shadow-md"
            onClick={() => window.location.href = '/animals'}
        >
            <div className="p-4 rounded-full bg-[var(--bg-secondary)]">
                <Beef size={40} />
            </div>
            <span>Hayvan Ekle</span>
        </Button>
        <Button
            variant="secondary"
            className="h-32 flex-col gap-4 text-xl font-bold hover:bg-[var(--bg-elevated)] transition-colors shadow-md"
            onClick={() => window.location.href = '/sales'}
        >
            <div className="p-4 rounded-full bg-[var(--bg-secondary)]">
                <DollarSign size={40} />
            </div>
            <span>Satış Yap</span>
        </Button>
        <Button
            variant="secondary"
            className="h-32 flex-col gap-4 text-xl font-bold hover:bg-[var(--bg-elevated)] transition-colors shadow-md"
            onClick={() => window.location.href = '/financials'}
        >
            <div className="p-4 rounded-full bg-[var(--bg-secondary)]">
                <TrendingUp size={40} />
            </div>
            <span>Gider Ekle</span>
        </Button>
    </div>

    {/* Key Stats - Simple & Clear */ }
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex items-center justify-between bg-gradient-to-br from-[var(--primary-900)] to-[var(--primary-800)] text-white border-none">
            <div>
                <p className="text-primary-100 mb-1">Bugünkü Süt</p>
                <h3 className="text-4xl font-bold">{stats.todayMilk.toFixed(1)} L</h3>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
                <Milk size={32} />
            </div>
        </Card>

        <Card className="p-6 flex items-center justify-between bg-[var(--bg-secondary)]">
            <div>
                <p className="text-[var(--text-secondary)] mb-1">Aktif Hayvan</p>
                <h3 className="text-4xl font-bold text-[var(--text-primary)]">{stats.totalAnimals}</h3>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                <Beef size={32} className="text-[var(--primary-500)]" />
            </div>
        </Card>

        <Card className="p-6 flex items-center justify-between bg-[var(--bg-secondary)]">
            <div>
                <p className="text-[var(--text-secondary)] mb-1">Bu Ay Ciro</p>
                <h3 className="text-4xl font-bold text-[var(--success)]">₺{stats.monthlyRevenue.toLocaleString('tr-TR')}</h3>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                <TrendingUp size={32} className="text-[var(--success)]" />
            </div>
        </Card>
    </div>

    {/* Recent Activity - Simple List */ }
    <Card>
        <CardHeader title="Son Hareketler" />
        <div className="divide-y divide-[var(--border-color)]">
            {recentSales.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)]">
                    Henüz işlem yok
                </div>
            ) : (
                recentSales.map((sale) => (
                    <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-[var(--success-bg)] text-[var(--success)]">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">Satış: {sale.customer_name || 'Müşteri'}</p>
                                <p className="text-sm text-[var(--text-secondary)]">{format(new Date(sale.date), 'd MMMM HH:mm', { locale: tr })}</p>
                            </div>
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">
                            +₺{sale.total_amount.toLocaleString('tr-TR')}
                        </span>
                    </div>
                ))
            )}
        </div>
    </Card>
        </div >
    );
};

export default Dashboard;
