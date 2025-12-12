// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - MILK ENTRY PAGE
// Daily milk production entry per cow with date selection
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Save,
    Calendar,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Plus,
    Minus,
    Beef,
    Droplets
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, Button, Badge, QuickNumberInput, cn } from '../components/ui';
import type { Animal, DailyMilkProduction, CalfMilkConsumption } from '../types';

interface CowMilkEntry {
    animal: Animal;
    morning: number;
    evening: number;
    morningRecordId: string | null;
    eveningRecordId: string | null;
}

interface CalfFeedingEntry {
    calf: Animal;
    consumption: number;
    recordId: string | null;
}

const MilkEntry: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [cowEntries, setCowEntries] = useState<CowMilkEntry[]>([]);
    const [calfEntries, setCalfEntries] = useState<CalfFeedingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'cows' | 'calves'>('cows');
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch active cows
            const { data: cows } = await supabase
                .from('animals')
                .select('*')
                .eq('type', 'cow')
                .eq('status', 'active')
                .order('name');

            // Fetch existing milk records for the date
            const { data: milkRecords } = await supabase
                .from('daily_milk_production')
                .select('*')
                .eq('date', selectedDate);

            // Merge cows with their records
            const entries: CowMilkEntry[] = (cows || []).map((cow) => {
                const morningRecord = milkRecords?.find(
                    (r) => r.animal_id === cow.id && r.shift === 'morning'
                );
                const eveningRecord = milkRecords?.find(
                    (r) => r.animal_id === cow.id && r.shift === 'evening'
                );
                return {
                    animal: cow,
                    morning: morningRecord?.quantity_liters || 0,
                    evening: eveningRecord?.quantity_liters || 0,
                    morningRecordId: morningRecord?.id || null,
                    eveningRecordId: eveningRecord?.id || null,
                };
            });

            setCowEntries(entries);

            // Fetch calves
            const { data: calves } = await supabase
                .from('animals')
                .select('*, mother:animals!mother_id(name)')
                .eq('type', 'calf')
                .eq('status', 'active')
                .order('name');

            // Fetch calf consumption records
            const { data: consumptionRecords } = await supabase
                .from('calf_milk_consumption')
                .select('*')
                .eq('date', selectedDate);

            const calfData: CalfFeedingEntry[] = (calves || []).map((calf) => {
                const record = consumptionRecords?.find((r) => r.calf_id === calf.id);
                return {
                    calf,
                    consumption: record?.quantity_liters || 0,
                    recordId: record?.id || null,
                };
            });

            setCalfEntries(calfData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCowMilkChange = (index: number, shift: 'morning' | 'evening', value: number) => {
        setCowEntries((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [shift]: value };
            return updated;
        });
    };

    const handleCalfConsumptionChange = (index: number, value: number) => {
        setCalfEntries((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], consumption: value };
            return updated;
        });
    };

    const saveCowRecords = async () => {
        setSaving(true);
        setSaveSuccess(false);

        try {
            for (const entry of cowEntries) {
                // Save morning record
                if (entry.morning > 0) {
                    if (entry.morningRecordId) {
                        await supabase
                            .from('daily_milk_production')
                            .update({ quantity_liters: entry.morning })
                            .eq('id', entry.morningRecordId);
                    } else {
                        await supabase.from('daily_milk_production').insert({
                            date: selectedDate,
                            animal_id: entry.animal.id,
                            shift: 'morning',
                            quantity_liters: entry.morning,
                        });
                    }
                }

                // Save evening record
                if (entry.evening > 0) {
                    if (entry.eveningRecordId) {
                        await supabase
                            .from('daily_milk_production')
                            .update({ quantity_liters: entry.evening })
                            .eq('id', entry.eveningRecordId);
                    } else {
                        await supabase.from('daily_milk_production').insert({
                            date: selectedDate,
                            animal_id: entry.animal.id,
                            shift: 'evening',
                            quantity_liters: entry.evening,
                        });
                    }
                }
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            loadData(); // Refresh to get new record IDs
        } catch (error) {
            console.error('Error saving milk records:', error);
        } finally {
            setSaving(false);
        }
    };

    const saveCalfRecords = async () => {
        setSaving(true);
        setSaveSuccess(false);

        try {
            for (const entry of calfEntries) {
                if (entry.consumption > 0) {
                    if (entry.recordId) {
                        await supabase
                            .from('calf_milk_consumption')
                            .update({ quantity_liters: entry.consumption })
                            .eq('id', entry.recordId);
                    } else {
                        await supabase.from('calf_milk_consumption').insert({
                            date: selectedDate,
                            calf_id: entry.calf.id,
                            source_cow_id: entry.calf.mother_id,
                            quantity_liters: entry.consumption,
                            feeding_time: 'morning',
                        });
                    }
                }
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            loadData();
        } catch (error) {
            console.error('Error saving calf records:', error);
        } finally {
            setSaving(false);
        }
    };

    const changeDate = (days: number) => {
        const newDate = days > 0
            ? format(subDays(new Date(selectedDate), -days), 'yyyy-MM-dd')
            : format(subDays(new Date(selectedDate), Math.abs(days)), 'yyyy-MM-dd');
        setSelectedDate(newDate);
    };

    const totalMorning = cowEntries.reduce((sum, e) => sum + e.morning, 0);
    const totalEvening = cowEntries.reduce((sum, e) => sum + e.evening, 0);
    const totalDaily = totalMorning + totalEvening;
    const totalCalfConsumption = calfEntries.reduce((sum, e) => sum + e.consumption, 0);

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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Süt Girişi</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Günlük süt üretimini kaydedin</p>
                </div>

                {/* Date Selector */}
                <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-2">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} className="text-[var(--text-secondary)]" />
                    </button>
                    <div className="flex items-center gap-2 px-4">
                        <Calendar size={18} className="text-[var(--primary-400)]" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent text-[var(--text-primary)] font-medium outline-none"
                        />
                    </div>
                    <button
                        onClick={() => changeDate(1)}
                        className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                        disabled={selectedDate >= format(new Date(), 'yyyy-MM-dd')}
                    >
                        <ChevronRight size={20} className="text-[var(--text-secondary)]" />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--warning)] mb-2">
                        <Sun size={18} />
                        <span className="text-sm font-medium">Sabah</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{totalMorning.toFixed(1)} L</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--primary-400)] mb-2">
                        <Moon size={18} />
                        <span className="text-sm font-medium">Akşam</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{totalEvening.toFixed(1)} L</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
                        <Droplets size={18} />
                        <span className="text-sm font-medium">Toplam</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{totalDaily.toFixed(1)} L</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--error)] mb-2">
                        <Beef size={18} />
                        <span className="text-sm font-medium">Buzağı</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{totalCalfConsumption.toFixed(1)} L</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('cows')}
                    className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                        activeTab === 'cows'
                            ? 'bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-500)] text-white'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                >
                    <Droplets size={18} />
                    İnekler ({cowEntries.length})
                </button>
                <button
                    onClick={() => setActiveTab('calves')}
                    className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                        activeTab === 'calves'
                            ? 'bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-500)] text-white'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                >
                    <Beef size={18} />
                    Buzağılar ({calfEntries.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'cows' ? (
                <Card>
                    <CardHeader
                        title="Süt Üretimi"
                        subtitle="Her inek için sabah ve akşam sütünü girin"
                        action={
                            <Button
                                variant="primary"
                                icon={Save}
                                loading={saving}
                                onClick={saveCowRecords}
                            >
                                {saveSuccess ? <CheckCircle2 size={18} /> : 'Kaydet'}
                            </Button>
                        }
                    />

                    {/* Cow List */}
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-[var(--text-muted)]">
                            <div className="col-span-4">İnek</div>
                            <div className="col-span-3 text-center">Sabah</div>
                            <div className="col-span-3 text-center">Akşam</div>
                            <div className="col-span-2 text-right">Toplam</div>
                        </div>

                        {cowEntries.map((entry, index) => (
                            <div
                                key={entry.animal.id}
                                className="grid grid-cols-12 gap-4 items-center p-4 bg-[var(--bg-secondary)] rounded-xl"
                            >
                                {/* Cow Info */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                                        <Beef size={20} className="text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-[var(--text-primary)]">
                                            {entry.animal.name || entry.animal.ear_tag}
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)]">{entry.animal.ear_tag}</div>
                                    </div>
                                </div>

                                {/* Morning */}
                                <div className="col-span-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleCowMilkChange(index, 'morning', Math.max(0, entry.morning - 0.5))}
                                            className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={14} className="text-[var(--text-secondary)]" />
                                        </button>
                                        <input
                                            type="number"
                                            value={entry.morning || ''}
                                            onChange={(e) => handleCowMilkChange(index, 'morning', parseFloat(e.target.value) || 0)}
                                            className="w-16 text-center bg-[var(--bg-elevated)] rounded-lg py-2 text-[var(--text-primary)] font-medium outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                                            step="0.5"
                                            min="0"
                                            placeholder="0"
                                        />
                                        <button
                                            onClick={() => handleCowMilkChange(index, 'morning', entry.morning + 0.5)}
                                            className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={14} className="text-[var(--text-secondary)]" />
                                        </button>
                                    </div>
                                </div>

                                {/* Evening */}
                                <div className="col-span-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleCowMilkChange(index, 'evening', Math.max(0, entry.evening - 0.5))}
                                            className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={14} className="text-[var(--text-secondary)]" />
                                        </button>
                                        <input
                                            type="number"
                                            value={entry.evening || ''}
                                            onChange={(e) => handleCowMilkChange(index, 'evening', parseFloat(e.target.value) || 0)}
                                            className="w-16 text-center bg-[var(--bg-elevated)] rounded-lg py-2 text-[var(--text-primary)] font-medium outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                                            step="0.5"
                                            min="0"
                                            placeholder="0"
                                        />
                                        <button
                                            onClick={() => handleCowMilkChange(index, 'evening', entry.evening + 0.5)}
                                            className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={14} className="text-[var(--text-secondary)]" />
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="col-span-2 text-right">
                                    <span className="text-lg font-bold text-[var(--accent)]">
                                        {(entry.morning + entry.evening).toFixed(1)} L
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save Button (Mobile) */}
                    <div className="mt-6 sm:hidden">
                        <Button
                            variant="primary"
                            icon={Save}
                            loading={saving}
                            onClick={saveCowRecords}
                            className="w-full"
                        >
                            {saveSuccess ? 'Kaydedildi!' : 'Tümünü Kaydet'}
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card>
                    <CardHeader
                        title="Buzağı Besleme"
                        subtitle="Buzağılara verilen süt miktarları"
                        action={
                            <Button
                                variant="primary"
                                icon={Save}
                                loading={saving}
                                onClick={saveCalfRecords}
                            >
                                {saveSuccess ? <CheckCircle2 size={18} /> : 'Kaydet'}
                            </Button>
                        }
                    />

                    <div className="space-y-4">
                        {calfEntries.length === 0 ? (
                            <div className="text-center py-12 text-[var(--text-secondary)]">
                                Henüz buzağı kaydı yok
                            </div>
                        ) : (
                            calfEntries.map((entry, index) => (
                                <div
                                    key={entry.calf.id}
                                    className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--warning-bg)] flex items-center justify-center">
                                            <Beef size={20} className="text-[var(--warning)]" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-[var(--text-primary)]">
                                                {entry.calf.name || entry.calf.ear_tag}
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)]">
                                                Anne: {(entry.calf as any).mother?.name || 'Bilinmiyor'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCalfConsumptionChange(index, Math.max(0, entry.consumption - 0.5))}
                                            className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={16} className="text-[var(--text-secondary)]" />
                                        </button>
                                        <div className="w-20 text-center">
                                            <input
                                                type="number"
                                                value={entry.consumption || ''}
                                                onChange={(e) => handleCalfConsumptionChange(index, parseFloat(e.target.value) || 0)}
                                                className="w-full text-center bg-[var(--bg-elevated)] rounded-lg py-2 text-[var(--text-primary)] font-bold text-lg outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                                                step="0.5"
                                                min="0"
                                                placeholder="0"
                                            />
                                            <span className="text-xs text-[var(--text-muted)]">litre</span>
                                        </div>
                                        <button
                                            onClick={() => handleCalfConsumptionChange(index, entry.consumption + 0.5)}
                                            className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={16} className="text-[var(--text-secondary)]" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            )}

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 bg-[var(--success)] text-white rounded-xl shadow-lg animate-fadeIn">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">Kayıt başarılı!</span>
                </div>
            )}
        </div>
    );
};

export default MilkEntry;
