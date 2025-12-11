import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StatCard, Card, CardHeader } from '../components/ui';
import { Milk, Beef, Factory, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DashboardStats {
    todayMilk: number;
    totalAnimals: number;
    activeProduction: number;
    monthlyIncome: number;
}

interface RecentSale {
    id: string;
    created_at: string;
    total_amount: number;
    customer_name: string | null;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        todayMilk: 0,
        totalAnimals: 0,
        activeProduction: 0,
        monthlyIncome: 0,
    });
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

            // Fetch today's milk
            const { data: milkData } = await supabase
                .from('milk_records')
                .select('quantity_liters')
                .eq('date', today);

            const todayMilk = milkData?.reduce((sum, r) => sum + (r.quantity_liters || 0), 0) || 0;

            // Fetch total animals
            const { count: animalCount } = await supabase
                .from('animals')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Fetch active production batches
            const { count: productionCount } = await supabase
                .from('production_batches')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'in_progress');

            // Fetch monthly income
            const { data: salesData } = await supabase
                .from('sales')
                .select('total_amount')
                .gte('created_at', monthStart);

            const monthlyIncome = salesData?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

            // Fetch recent sales
            const { data: recentSalesData } = await supabase
                .from('sales')
                .select('id, created_at, total_amount, customer_name')
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                todayMilk,
                totalAnimals: animalCount || 0,
                activeProduction: productionCount || 0,
                monthlyIncome,
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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hoş Geldiniz 👋</h1>
                <p className="text-gray-500 mt-1">
                    {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Bugünkü Süt"
                    value={`${stats.todayMilk.toFixed(1)} L`}
                    icon={<Milk size={24} />}
                    color="indigo"
                />
                <StatCard
                    title="Toplam Hayvan"
                    value={stats.totalAnimals}
                    icon={<Beef size={24} />}
                    color="green"
                />
                <StatCard
                    title="Aktif Üretim"
                    value={stats.activeProduction}
                    icon={<Factory size={24} />}
                    color="yellow"
                />
                <StatCard
                    title="Aylık Gelir"
                    value={`₺${stats.monthlyIncome.toLocaleString('tr-TR')}`}
                    icon={<TrendingUp size={24} />}
                    color="blue"
                />
            </div>

            {/* Recent Sales */}
            <Card>
                <CardHeader
                    title="Son Satışlar"
                    subtitle="En son 5 satış işlemi"
                />
                <div className="space-y-3">
                    {recentSales.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Henüz satış kaydı yok</p>
                    ) : (
                        recentSales.map((sale) => (
                            <div
                                key={sale.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {sale.customer_name || 'Genel Müşteri'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(sale.created_at), 'd MMM HH:mm', { locale: tr })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-900">
                                        ₺{sale.total_amount.toLocaleString('tr-TR')}
                                    </span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
