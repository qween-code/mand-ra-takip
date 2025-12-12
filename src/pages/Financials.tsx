// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - FINANCIALS PAGE
// Financial overview with sales and expenses
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Receipt,
    CreditCard,
    Calendar,
    BarChart3,
    PieChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, Button, Badge, Modal, Input, Select, Tabs, cn } from '../components/ui';
import type { Sale, Expense, ExpenseCategory } from '../types';

const categoryLabels: Record<ExpenseCategory, string> = {
    feed: 'Yem',
    veterinary: 'Veteriner',
    fuel: 'Yakıt',
    labor: 'İşçilik',
    maintenance: 'Bakım',
    utilities: 'Faturalar',
    other: 'Diğer',
};

const categoryColors: Record<ExpenseCategory, string> = {
    feed: 'bg-green-500',
    veterinary: 'bg-blue-500',
    fuel: 'bg-yellow-500',
    labor: 'bg-purple-500',
    maintenance: 'bg-orange-500',
    utilities: 'bg-cyan-500',
    other: 'bg-gray-500',
};

const Financials: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'expenses'>('overview');
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [showAddSaleModal, setShowAddSaleModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Form state
    const [expenseForm, setExpenseForm] = useState({
        category: 'feed' as ExpenseCategory,
        amount: '',
        description: '',
        paid_to: '',
    });

    const [saleForm, setSaleForm] = useState({
        customer_name: '',
        total_amount: '',
        payment_status: 'pending',
        payment_method: 'cash',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = async () => {
        setLoading(true);
        try {
            const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
            const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

            // Load sales
            const { data: salesData } = await supabase
                .from('sales')
                .select('*')
                .gte('date', monthStart)
                .lte('date', monthEnd)
                .order('date', { ascending: false });

            setSales((salesData as any[]) || []);

            // Load expenses
            const { data: expensesData } = await supabase
                .from('financial_transactions' as any)
                .select('*')
                .eq('type', 'expense')
                .gte('date', monthStart)
                .lte('date', monthEnd)
                .order('date', { ascending: false });

            setExpenses((expensesData as any[])?.map(e => ({
                ...e,
                category: e.category as ExpenseCategory
            })) || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async () => {
        try {
            await supabase.from('financial_transactions' as any).insert({
                date: format(new Date(), 'yyyy-MM-dd'),
                type: 'expense',
                category: expenseForm.category,
                amount: parseFloat(expenseForm.amount),
                description: expenseForm.description,
                paid_to: expenseForm.paid_to,
            });

            setShowAddExpenseModal(false);
            setExpenseForm({ category: 'feed', amount: '', description: '', paid_to: '' });
            loadData();
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const handleAddSale = async () => {
        try {
            await supabase.from('sales').insert({
                date: format(new Date(), 'yyyy-MM-dd'),
                customer_name: saleForm.customer_name,
                total_amount: parseFloat(saleForm.total_amount),
                payment_status: saleForm.payment_status,
                payment_method: saleForm.payment_method,
                notes: saleForm.notes,
            });

            setShowAddSaleModal(false);
            setSaleForm({ customer_name: '', total_amount: '', payment_status: 'pending', payment_method: 'cash', notes: '' });
            loadData();
        } catch (error) {
            console.error('Error adding sale:', error);
        }
    };

    // Calculate stats
    const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const pendingSales = sales.filter(s => s.payment_status === 'pending').reduce((sum, s) => sum + (s.total_amount || 0), 0);

    // Expense breakdown by category
    const expenseByCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Finans</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Gelir ve giderlerinizi takip edin</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Receipt} onClick={() => setShowAddExpenseModal(true)}>
                        Gider Ekle
                    </Button>
                    <Button variant="primary" icon={Plus} onClick={() => setShowAddSaleModal(true)}>
                        Satış Ekle
                    </Button>
                </div>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                    className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                >
                    ←
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <Calendar size={18} className="text-[var(--primary-400)]" />
                    <span className="font-medium text-[var(--text-primary)]">
                        {format(selectedMonth, 'MMMM yyyy', { locale: tr })}
                    </span>
                </div>
                <button
                    onClick={() => setSelectedMonth(new Date())}
                    className="px-3 py-2 text-sm bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
                >
                    Bu Ay
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-[var(--text-secondary)]">Toplam Gelir</span>
                        <div className="w-10 h-10 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
                            <TrendingUp size={20} className="text-[var(--success)]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-[var(--success)]">
                        ₺{totalRevenue.toLocaleString('tr-TR')}
                    </div>
                </div>

                <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-[var(--text-secondary)]">Toplam Gider</span>
                        <div className="w-10 h-10 rounded-lg bg-[var(--error-bg)] flex items-center justify-center">
                            <DollarSign size={20} className="text-[var(--error)]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-[var(--error)]">
                        ₺{totalExpenses.toLocaleString('tr-TR')}
                    </div>
                </div>

                <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-[var(--text-secondary)]">Net Kar</span>
                        <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            netProfit >= 0 ? 'bg-[var(--success-bg)]' : 'bg-[var(--error-bg)]'
                        )}>
                            {netProfit >= 0 ? (
                                <ArrowUpRight size={20} className="text-[var(--success)]" />
                            ) : (
                                <ArrowDownRight size={20} className="text-[var(--error)]" />
                            )}
                        </div>
                    </div>
                    <div className={cn(
                        'text-2xl font-bold',
                        netProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                    )}>
                        ₺{netProfit.toLocaleString('tr-TR')}
                    </div>
                </div>

                <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-[var(--text-secondary)]">Bekleyen</span>
                        <div className="w-10 h-10 rounded-lg bg-[var(--warning-bg)] flex items-center justify-center">
                            <CreditCard size={20} className="text-[var(--warning)]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-[var(--warning)]">
                        ₺{pendingSales.toLocaleString('tr-TR')}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales List */}
                <Card>
                    <CardHeader
                        title="Son Satışlar"
                        subtitle={`${sales.length} kayıt`}
                    />
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {sales.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                Bu ay için satış kaydı yok
                            </div>
                        ) : (
                            sales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl"
                                >
                                    <div>
                                        <div className="font-medium text-[var(--text-primary)]">
                                            {sale.customer_name || 'Genel Müşteri'}
                                        </div>
                                        <div className="text-sm text-[var(--text-secondary)]">
                                            {format(new Date(sale.date), 'd MMM', { locale: tr })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={sale.payment_status === 'paid' ? 'success' : 'warning'}>
                                            {sale.payment_status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                                        </Badge>
                                        <span className="font-bold text-[var(--success)]">
                                            +₺{sale.total_amount.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Expenses List */}
                <Card>
                    <CardHeader
                        title="Son Giderler"
                        subtitle={`${expenses.length} kayıt`}
                    />
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {expenses.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                Bu ay için gider kaydı yok
                            </div>
                        ) : (
                            expenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn('w-3 h-3 rounded-full', categoryColors[expense.category])} />
                                        <div>
                                            <div className="font-medium text-[var(--text-primary)]">
                                                {expense.description || categoryLabels[expense.category]}
                                            </div>
                                            <div className="text-sm text-[var(--text-secondary)]">
                                                {expense.paid_to ? `${expense.paid_to} • ` : ''}
                                                {format(new Date(expense.date), 'd MMM', { locale: tr })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-[var(--error)]">
                                        -₺{expense.amount.toLocaleString('tr-TR')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Expense Breakdown */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Gider Dağılımı"
                        subtitle="Kategorilere göre giderler"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                        {Object.entries(categoryLabels).map(([category, label]) => {
                            const amount = expenseByCategory[category] || 0;
                            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                            return (
                                <div key={category} className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center">
                                    <div className={cn('w-4 h-4 rounded-full mx-auto mb-2', categoryColors[category as ExpenseCategory])} />
                                    <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>
                                    <div className="font-bold text-[var(--text-primary)] text-sm">
                                        ₺{amount.toLocaleString('tr-TR')}
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)]">{percentage.toFixed(0)}%</div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Add Expense Modal */}
            <Modal
                isOpen={showAddExpenseModal}
                onClose={() => setShowAddExpenseModal(false)}
                title="Gider Ekle"
                size="md"
            >
                <div className="space-y-4">
                    <Select
                        label="Kategori *"
                        options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))}
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                    />
                    <Input
                        label="Tutar (₺) *"
                        type="number"
                        placeholder="1000"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    />
                    <Input
                        label="Açıklama"
                        placeholder="Gider açıklaması..."
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    />
                    <Input
                        label="Ödenen Kişi/Firma"
                        placeholder="Örn: Yem Deposu"
                        value={expenseForm.paid_to}
                        onChange={(e) => setExpenseForm({ ...expenseForm, paid_to: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowAddExpenseModal(false)}>
                            İptal
                        </Button>
                        <Button variant="primary" onClick={handleAddExpense}>
                            Ekle
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Sale Modal */}
            <Modal
                isOpen={showAddSaleModal}
                onClose={() => setShowAddSaleModal(false)}
                title="Satış Ekle"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Müşteri Adı"
                        placeholder="Müşteri adı veya firma..."
                        value={saleForm.customer_name}
                        onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })}
                    />
                    <Input
                        label="Tutar (₺) *"
                        type="number"
                        placeholder="500"
                        value={saleForm.total_amount}
                        onChange={(e) => setSaleForm({ ...saleForm, total_amount: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Ödeme Durumu"
                            options={[
                                { value: 'pending', label: 'Bekliyor' },
                                { value: 'paid', label: 'Ödendi' },
                                { value: 'partial', label: 'Kısmi' },
                            ]}
                            value={saleForm.payment_status}
                            onChange={(e) => setSaleForm({ ...saleForm, payment_status: e.target.value })}
                        />
                        <Select
                            label="Ödeme Yöntemi"
                            options={[
                                { value: 'cash', label: 'Nakit' },
                                { value: 'credit', label: 'Veresiye' },
                                { value: 'bank_transfer', label: 'Havale' },
                                { value: 'other', label: 'Diğer' },
                            ]}
                            value={saleForm.payment_method}
                            onChange={(e) => setSaleForm({ ...saleForm, payment_method: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Notlar"
                        placeholder="Satış notları..."
                        value={saleForm.notes}
                        onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowAddSaleModal(false)}>
                            İptal
                        </Button>
                        <Button variant="primary" onClick={handleAddSale}>
                            Ekle
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Financials;
