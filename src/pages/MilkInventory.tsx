// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - MILK INVENTORY PAGE
// Daily milk inventory tracking
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Droplets,
    Calendar,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, cn } from '../components/ui';
import type { MilkInventory } from '../types';

const MilkInventoryPage: React.FC = () => {
    const [inventory, setInventory] = useState<MilkInventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = async () => {
        setLoading(true);
        try {
            const startOfMonth = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), 'yyyy-MM-dd');
            const endOfMonth = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('milk_inventory')
                .select('*')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth)
                .order('date', { ascending: false });

            if (error) throw error;
            setInventory((data as MilkInventory[]) || []);
        } catch (error) {
            console.error('Error loading inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (months: number) => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + months, 1));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="page-content">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Süt Envanteri</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Günlük süt giriş-çıkış takibi</p>
                </div>

                <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-[var(--text-secondary)]" />
                    </button>
                    <div className="flex items-center gap-2 px-4 font-medium text-[var(--text-primary)]">
                        <Calendar size={18} className="text-[var(--primary-400)]" />
                        {format(selectedMonth, 'MMMM yyyy', { locale: tr })}
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors" disabled={selectedMonth > new Date()}>
                        <ChevronRight size={20} className="text-[var(--text-secondary)]" />
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-xl">Tarih</th>
                                <th className="px-4 py-3 text-right">Açılış</th>
                                <th className="px-4 py-3 text-right text-[var(--success)]">Üretim</th>
                                <th className="px-4 py-3 text-right text-[var(--info)]">Toplanan</th>
                                <th className="px-4 py-3 text-right text-[var(--warning)]">Satış</th>
                                <th className="px-4 py-3 text-right text-[var(--primary-400)]">İmalat</th>
                                <th className="px-4 py-3 text-right text-[var(--accent)]">Buzağı</th>
                                <th className="px-4 py-3 text-right text-[var(--error)]">Fire</th>
                                <th className="px-4 py-3 text-right font-bold rounded-tr-xl">Kapanış</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                                        Bu ay için kayıt bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                                            {format(new Date(item.date), 'd MMM EEEE', { locale: tr })}
                                        </td>
                                        <td className="px-4 py-3 text-right text-[var(--text-secondary)]">{item.opening_balance.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-[var(--success)]">+{item.total_produced.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-[var(--info)]">+{item.total_collected.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right text-[var(--warning)]">-{item.total_sold.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right text-[var(--primary-400)]">-{item.total_production_used.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right text-[var(--accent)]">-{item.total_calf_consumed.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right text-[var(--error)]">-{item.total_waste.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">{item.closing_balance.toFixed(1)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MilkInventoryPage;
