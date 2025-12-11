import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

type Expense = Database['public']['Tables']['expenses']['Row'];
type Sale = Database['public']['Tables']['sales']['Row'];

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
