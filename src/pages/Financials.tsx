import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Expense = Database['public']['Tables']['expenses']['Row'];
type Sale = Database['public']['Tables']['sales']['Row'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Financials = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });

    // New Expense State
    const [newExpense, setNewExpense] = useState<Partial<Expense>>({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Yem'
    });

    useEffect(() => {
        fetchFinancials();
    }, [dateRange]);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            // Fetch Expenses
            const { data: expenseData, error: expenseError } = await supabase
                .from('expenses')
                .select('*')
                .gte('date', dateRange.start)
                .lte('date', dateRange.end)
                .order('date', { ascending: false });

            if (expenseError) throw expenseError;
            setExpenses(expenseData || []);

            // Fetch Sales (Income)
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('*')
                .gte('created_at', `${dateRange.start}T00:00:00`)
                .lte('created_at', `${dateRange.end}T23:59:59`)
                .order('created_at', { ascending: false });

            if (salesError) throw salesError;
            setSales(salesData || []);

        } catch (error) {
            console.error('Error fetching financials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('expenses')
                .insert([newExpense as Database['public']['Tables']['expenses']['Insert']]);

            if (error) throw error;

            setShowAddExpenseModal(false);
            setNewExpense({ date: format(new Date(), 'yyyy-MM-dd'), category: 'Yem' });
            fetchFinancials();
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Gider eklenirken bir hata oluştu.');
        }
    };

    const totalIncome = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const netProfit = totalIncome - totalExpense;

    // Prepare Chart Data
    const expenseByCategory = expenses.reduce((acc, curr) => {
        const cat = curr.category || 'Diğer';
        acc[cat] = (acc[cat] || 0) + Number(curr.amount);
        return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

    // Daily Income vs Expense for Bar Chart
    const dailyDataMap = new Map<string, { date: string, income: number, expense: number }>();

    sales.forEach(sale => {
        const date = sale.created_at.split('T')[0];
        const current = dailyDataMap.get(date) || { date, income: 0, expense: 0 };
        current.income += Number(sale.total_amount);
        dailyDataMap.set(date, current);
    });

    expenses.forEach(expense => {
        const date = expense.date;
        const current = dailyDataMap.get(date) || { date, income: 0, expense: 0 };
        current.expense += Number(expense.amount);
        dailyDataMap.set(date, current);
    });

    const barChartData = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Finans Yönetimi</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                        <Calendar size={18} className="text-gray-500 mr-2" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="text-sm border-none focus:ring-0 p-0 text-gray-700"
                        />
                        <span className="mx-2 text-gray-400">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="text-sm border-none focus:ring-0 p-0 text-gray-700"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddExpenseModal(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors"
                    >
                        <Plus size={20} className="mr-2" />
                        Gider Ekle
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Toplam Gider</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Kar</p>
                            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                ₺{netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-indigo-100' : 'bg-red-100'}`}>
                            <DollarSign className={netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'} size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <BarIcon className="mr-2 h-5 w-5 text-gray-500" />
                        Günlük Gelir/Gider Analizi
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => format(parseISO(str), 'dd MMM', { locale: tr })}
                                    fontSize={12}
                                />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                                    labelFormatter={(label) => format(parseISO(label), 'dd MMMM yyyy', { locale: tr })}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Gelir" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Gider" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <PieIcon className="mr-2 h-5 w-5 text-gray-500" />
                        Gider Dağılımı
                    </h3>
                    <div className="h-80">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: { name?: string | number, percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                Veri bulunamadı.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Gider Listesi</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Yükleniyor...</td>
                            </tr>
                        ) : expenses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Bu tarih aralığında gider bulunamadı.</td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {format(new Date(expense.date), 'dd MMM yyyy', { locale: tr })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{expense.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-red-600">
                                        -₺{Number(expense.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Expense Modal */}
            {showAddExpenseModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Yeni Gider Ekle</h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tarih</label>
                                <input
                                    type="date"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    <option value="Yem">Yem</option>
                                    <option value="Veteriner">Veteriner</option>
                                    <option value="Yakıt">Yakıt</option>
                                    <option value="Personel">Personel</option>
                                    <option value="Bakım">Bakım</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tutar (₺)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newExpense.amount || ''}
                                    onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                                <textarea
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={3}
                                    value={newExpense.description || ''}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddExpenseModal(false)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Financials;
