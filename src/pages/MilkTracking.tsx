import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Activity, Droplet, ArrowUpRight, ArrowDownRight,
    History, TrendingUp
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const MilkTracking: React.FC = () => {
    const [tankStatus, setTankStatus] = useState({ current_amount: 0, updated_at: '' });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7'); // 7, 30, 90 days

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Tank Status
            const { data: tank } = await supabase.from('milk_tank').select('*').single();
            if (tank) setTankStatus(tank);

            // Fetch Transactions
            const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
            const { data: txs } = await supabase
                .from('milk_transactions')
                .select('*')
                .gte('date', startDate)
                .order('created_at', { ascending: false });

            if (txs) setTransactions(txs);

        } catch (error) {
            console.error('Error fetching milk data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Summaries
    const totalInflow = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalOutflow = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const netChange = totalInflow - totalOutflow;

    // Chart Data Preparation
    const chartData = React.useMemo(() => {
        const grouped = transactions.reduce((acc: any, curr) => {
            const date = curr.date;
            if (!acc[date]) acc[date] = { date, inflow: 0, outflow: 0 };
            if (curr.amount > 0) acc[date].inflow += Number(curr.amount);
            else acc[date].outflow += Math.abs(Number(curr.amount));
            return acc;
        }, {});

        return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }, [transactions]);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'milking': return <Droplet className="text-blue-500" />;
            case 'collection': return <ArrowUpRight className="text-green-500" />;
            case 'return': return <ArrowUpRight className="text-orange-500" />;
            case 'distribution': return <ArrowDownRight className="text-indigo-500" />;
            case 'feeding': return <ArrowDownRight className="text-pink-500" />;
            case 'production': return <ArrowDownRight className="text-purple-500" />;
            case 'waste': return <ArrowDownRight className="text-red-500" />;
            default: return <Activity className="text-gray-500" />;
        }
    };

    const getTransactionLabel = (type: string) => {
        const labels: Record<string, string> = {
            milking: 'Sağım',
            collection: 'Müstahsil Toplama',
            return: 'İade Alım',
            distribution: 'Dağıtım / Satış',
            feeding: 'Buzağı Besleme',
            production: 'Üretim Kullanımı',
            waste: 'Zayi / Atık'
        };
        return labels[type] || type;
    };

    if (loading && transactions.length === 0) {
        return <div className="p-8 text-center">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Süt Takip Merkezi</h1>
                    <p className="text-slate-500">Merkezi stok ve hareket takibi</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    {['7', '30', '90'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === range
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            Son {range} Gün
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Tank Status */}
                <div className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Droplet className="w-6 h-6 text-blue-100" />
                        </div>
                        <span className="text-xs font-medium bg-blue-500/30 px-2 py-1 rounded border border-blue-400/30">
                            Canlı Stok
                        </span>
                    </div>
                    <div className="mb-1">
                        <span className="text-4xl font-black tracking-tight">
                            {Number(tankStatus.current_amount).toFixed(1)}
                        </span>
                        <span className="ml-2 text-blue-100 font-medium">L</span>
                    </div>
                    <p className="text-xs text-blue-200 opacity-80">
                        Son güncelleme: {tankStatus.updated_at ? format(new Date(tankStatus.updated_at), 'HH:mm') : '-'}
                    </p>
                </div>

                {/* Inflow */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-2">Toplam Giriş</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-green-600">
                            +{totalInflow.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400">L</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                {/* Outflow */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-2">Toplam Çıkış</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-red-600">
                            -{totalOutflow.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400">L</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                {/* Net Change */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-2">Net Değişim</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${netChange >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                            {netChange > 0 ? '+' : ''}{netChange.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400">L</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Seçili dönem için</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-slate-400" />
                        Süt Akış Grafiği
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => format(new Date(str), 'd MMM', { locale: tr })}
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}L`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val: number) => [`${val} L`, '']}
                                    labelFormatter={(label) => format(new Date(label), 'd MMMM yyyy', { locale: tr })}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="inflow"
                                    name="Giriş"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorIn)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="outflow"
                                    name="Çıkış"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorOut)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                        <History className="w-5 h-5 mr-2 text-slate-400" />
                        Son Hareketler
                    </h3>
                    <div className="space-y-4">
                        {transactions.slice(0, 5).map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        {getTransactionIcon(tx.type)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{getTransactionLabel(tx.type)}</p>
                                        <p className="text-xs text-slate-500">
                                            {format(new Date(tx.created_at), 'd MMM HH:mm', { locale: tr })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-right ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    <p className="font-bold">
                                        {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(1)} L
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MilkTracking;
