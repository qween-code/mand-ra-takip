import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Card, CardHeader, StatCard, Button, Input, Select, Modal, Table } from '../components/ui';
import { Wallet, TrendingUp, TrendingDown, Plus, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';

type Expense = Database['public']['Tables']['expenses']['Row'];

interface DailyData {
    date: string;
    income: number;
    expense: number;
}

interface CategoryData {
    category: string;
    amount: number;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Financials: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Stats
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

    // Date range
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    // Form state
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        amount: '',
        description: '',
    });

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch expenses
            const { data: expensesData } = await supabase
                .from('expenses')
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            // Fetch sales (income)
            const { data: salesData } = await supabase
                .from('sales')
                .select('*')
                .gte('created_at', startDate)
                .lte('created_at', endDate + 'T23:59:59');

            setExpenses(expensesData || []);

            // Calculate totals
            const income = salesData?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
            const expense = expensesData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
            setTotalIncome(income);
            setTotalExpense(expense);

            // Calculate daily data for charts
            const dailyMap = new Map<string, { income: number; expense: number }>();

            salesData?.forEach(sale => {
                const date = format(new Date(sale.created_at), 'yyyy-MM-dd');
                const current = dailyMap.get(date) || { income: 0, expense: 0 };
                dailyMap.set(date, { ...current, income: current.income + sale.total_amount });
            });

            expensesData?.forEach(exp => {
                const current = dailyMap.get(exp.date) || { income: 0, expense: 0 };
                dailyMap.set(exp.date, { ...current, expense: current.expense + exp.amount });
            });

            const daily = Array.from(dailyMap.entries())
                .map(([date, values]) => ({ date: format(new Date(date), 'd MMM', { locale: tr }), ...values }))
                .sort((a, b) => a.date.localeCompare(b.date));
            setDailyData(daily);

            // Calculate category distribution
            const categoryMap = new Map<string, number>();
            expensesData?.forEach(exp => {
                const current = categoryMap.get(exp.category) || 0;
                categoryMap.set(exp.category, current + exp.amount);
            });

            const categories = Array.from(categoryMap.entries())
                .map(([category, amount]) => ({ category: getCategoryLabel(category), amount }))
                .sort((a, b) => b.amount - a.amount);
            setCategoryData(categories);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('expenses').insert([{
                date: formData.date,
                category: formData.category,
                amount: parseFloat(formData.amount),
                description: formData.description || null,
            }]);

            if (error) throw error;

            setShowAddModal(false);
            setFormData({ date: format(new Date(), 'yyyy-MM-dd'), category: '', amount: '', description: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Gider eklenirken bir hata oluştu');
        }
    };

    const getCategoryLabel = (category: string) => {
        const categories: Record<string, string> = {
            feed: 'Yem',
            vet: 'Veteriner',
            fuel: 'Yakıt',
            staff: 'Personel',
            maintenance: 'Bakım',
            other: 'Diğer',
        };
        return categories[category] || category;
    };

    const expenseCategories = [
        { value: 'feed', label: 'Yem' },
        { value: 'vet', label: 'Veteriner' },
        { value: 'fuel', label: 'Yakıt' },
        { value: 'staff', label: 'Personel' },
        { value: 'maintenance', label: 'Bakım' },
        { value: 'other', label: 'Diğer' },
    ];

    const netProfit = totalIncome - totalExpense;

    const columns = [
        {
            key: 'date',
            header: 'Tarih',
            render: (expense: Expense) => format(new Date(expense.date), 'd MMMM yyyy', { locale: tr }),
        },
        {
            key: 'category',
            header: 'Kategori',
            render: (expense: Expense) => getCategoryLabel(expense.category),
        },
        {
            key: 'description',
            header: 'Açıklama',
            render: (expense: Expense) => expense.description || '-',
        },
        {
            key: 'amount',
            header: 'Tutar',
            render: (expense: Expense) => (
                <span className="font-semibold text-red-600">₺{expense.amount.toLocaleString('tr-TR')}</span>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finansal Analiz</h1>
                    <p className="text-gray-500 mt-1">Gelir, gider ve kar takibi</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={20} className="mr-2" />
                    Gider Ekle
                </Button>
            </div>

            {/* Date Filter */}
            <Card>
                <div className="flex flex-wrap items-center gap-4">
                    <Calendar size={20} className="text-gray-400" />
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-auto"
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-auto"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                            setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
                        }}
                    >
                        Bu Ay
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const lastMonth = subMonths(new Date(), 1);
                            setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
                            setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
                        }}
                    >
                        Geçen Ay
                    </Button>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                    title="Toplam Gelir"
                    value={`₺${totalIncome.toLocaleString('tr-TR')}`}
                    icon={<TrendingUp size={24} />}
                    color="green"
                />
                <StatCard
                    title="Toplam Gider"
                    value={`₺${totalExpense.toLocaleString('tr-TR')}`}
                    icon={<TrendingDown size={24} />}
                    color="red"
                />
                <StatCard
                    title="Net Kar"
                    value={`₺${netProfit.toLocaleString('tr-TR')}`}
                    icon={<Wallet size={24} />}
                    color={netProfit >= 0 ? 'indigo' : 'red'}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Income/Expense Chart */}
                <Card>
                    <CardHeader title="Günlük Gelir/Gider" subtitle="Seçili dönem analizi" />
                    <div className="h-80">
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="income" name="Gelir" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Bu dönemde veri yok
                            </div>
                        )}
                    </div>
                </Card>

                {/* Expense Distribution Chart */}
                <Card>
                    <CardHeader title="Gider Dağılımı" subtitle="Kategoriye göre" />
                    <div className="h-80">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData as any}
                                        dataKey="amount"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={({ name, percent }) =>
                                            `${name} ${((percent as number) * 100).toFixed(0)}%`
                                        }
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Bu dönemde gider yok
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Expenses Table */}
            <Card padding="none">
                <div className="p-6 border-b border-gray-100">
                    <CardHeader title="Gider Kayıtları" />
                </div>
                <Table
                    data={expenses}
                    columns={columns}
                    keyExtractor={(expense) => expense.id}
                    loading={loading}
                    emptyMessage="Bu dönemde gider kaydı yok"
                />
            </Card>

            {/* Add Expense Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Yeni Gider Ekle"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>İptal</Button>
                        <Button onClick={handleAddExpense}>Kaydet</Button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tarih"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                        <Select
                            label="Kategori"
                            value={formData.category}
                            onChange={(value) => setFormData({ ...formData, category: value })}
                            options={expenseCategories}
                            placeholder="Kategori seçiniz"
                        />
                    </div>
                    <Input
                        label="Tutar (₺)"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Örn: 1500.00"
                        required
                    />
                    <Input
                        label="Açıklama"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Gider açıklaması..."
                    />
                </form>
            </Modal>
        </div>
    );
};

export default Financials;
