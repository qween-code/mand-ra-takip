import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Card, CardHeader, StatCard, Button, Input, Select, Modal, Table } from '../components/ui';
import { Milk, Plus, Sun, Moon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

type MilkRecord = Database['public']['Tables']['milk_records']['Row'];
type Animal = Database['public']['Tables']['animals']['Row'];

const MilkEntry: React.FC = () => {
    const [records, setRecords] = useState<(MilkRecord & { animals?: Animal | null })[]>([]);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Stats
    const [todayTotal, setTodayTotal] = useState(0);
    const [weekTotal, setWeekTotal] = useState(0);
    const [monthTotal, setMonthTotal] = useState(0);

    // Form state
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        shift: 'morning',
        quantity_liters: '',
        animal_id: '',
        fat_rate: '',
        ph_level: '',
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
            const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

            // Fetch recent records
            const { data: recordsData } = await supabase
                .from('milk_records')
                .select('*, animals(*)')
                .order('created_at', { ascending: false })
                .limit(20);

            // Fetch animals (cows only)
            const { data: animalsData } = await supabase
                .from('animals')
                .select('*')
                .eq('type', 'cow')
                .eq('status', 'active')
                .order('tag_number');

            // Calculate stats
            const { data: todayData } = await supabase
                .from('milk_records')
                .select('quantity_liters')
                .eq('date', today);

            const { data: weekData } = await supabase
                .from('milk_records')
                .select('quantity_liters')
                .gte('date', weekStart)
                .lte('date', weekEnd);

            const { data: monthData } = await supabase
                .from('milk_records')
                .select('quantity_liters')
                .gte('date', monthStart)
                .lte('date', monthEnd);

            // @ts-ignore
            setRecords(recordsData || []);
            setAnimals(animalsData || []);
            setTodayTotal(todayData?.reduce((sum, r) => sum + r.quantity_liters, 0) || 0);
            setWeekTotal(weekData?.reduce((sum, r) => sum + r.quantity_liters, 0) || 0);
            setMonthTotal(monthData?.reduce((sum, r) => sum + r.quantity_liters, 0) || 0);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('milk_records').insert([{
                date: formData.date,
                shift: formData.shift,
                quantity_liters: parseFloat(formData.quantity_liters),
                animal_id: formData.animal_id || null,
                fat_rate: formData.fat_rate ? parseFloat(formData.fat_rate) : null,
                ph_level: formData.ph_level ? parseFloat(formData.ph_level) : null,
                notes: formData.notes || null,
            }]);

            if (error) throw error;

            setShowModal(false);
            setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                shift: 'morning',
                quantity_liters: '',
                animal_id: '',
                fat_rate: '',
                ph_level: '',
                notes: '',
            });
            fetchData();
        } catch (error) {
            console.error('Error adding record:', error);
            alert('Kayıt eklenirken bir hata oluştu');
        }
    };

    const columns = [
        {
            key: 'date',
            header: 'Tarih',
            render: (record: MilkRecord & { animals?: Animal | null }) => (
                <div>
                    <p className="font-medium">{format(new Date(record.date), 'd MMMM', { locale: tr })}</p>
                    <p className="text-xs text-gray-500">{record.shift === 'morning' ? 'Sabah' : 'Akşam'}</p>
                </div>
            ),
        },
        {
            key: 'animal',
            header: 'Hayvan',
            render: (record: MilkRecord & { animals?: Animal | null }) => (
                record.animals ? (
                    <span className="text-gray-900">{record.animals.tag_number} - {record.animals.name}</span>
                ) : (
                    <span className="text-gray-400">Toplu</span>
                )
            ),
        },
        {
            key: 'quantity_liters',
            header: 'Miktar',
            render: (record: MilkRecord) => (
                <span className="font-semibold text-indigo-600">{record.quantity_liters} L</span>
            ),
        },
        {
            key: 'fat_rate',
            header: 'Yağ Oranı',
            render: (record: MilkRecord) => (
                record.fat_rate ? `%${record.fat_rate}` : '-'
            ),
        },
        {
            key: 'ph_level',
            header: 'pH',
            render: (record: MilkRecord) => record.ph_level || '-',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Süt Girişi</h1>
                    <p className="text-gray-500 mt-1">Günlük süt üretimini kaydedin</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus size={20} className="mr-2" />
                    Yeni Kayıt
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                    title="Bugün"
                    value={`${todayTotal.toFixed(1)} L`}
                    icon={<Milk size={24} />}
                    color="indigo"
                />
                <StatCard
                    title="Bu Hafta"
                    value={`${weekTotal.toFixed(1)} L`}
                    icon={<Milk size={24} />}
                    color="blue"
                />
                <StatCard
                    title="Bu Ay"
                    value={`${monthTotal.toFixed(1)} L`}
                    icon={<Milk size={24} />}
                    color="green"
                />
            </div>

            {/* Records Table */}
            <Card padding="none">
                <div className="p-6 border-b border-gray-100">
                    <CardHeader title="Son Kayıtlar" subtitle="En son 20 süt kayıdı" />
                </div>
                <Table
                    data={records}
                    columns={columns}
                    keyExtractor={(record) => record.id}
                    loading={loading}
                    emptyMessage="Henüz süt kaydı yok"
                />
            </Card>

            {/* Add Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Yeni Süt Kaydı"
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleSubmit}>
                            Kaydet
                        </Button>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vardiya</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, shift: 'morning' })}
                                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${formData.shift === 'morning'
                                            ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Sun size={18} />
                                    Sabah
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, shift: 'evening' })}
                                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${formData.shift === 'evening'
                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Moon size={18} />
                                    Akşam
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Miktar (Litre)"
                            type="number"
                            step="0.1"
                            value={formData.quantity_liters}
                            onChange={(e) => setFormData({ ...formData, quantity_liters: e.target.value })}
                            placeholder="Örn: 25.5"
                            required
                        />
                        <Select
                            label="Hayvan (Opsiyonel)"
                            value={formData.animal_id}
                            onChange={(value) => setFormData({ ...formData, animal_id: value })}
                            options={animals.map(a => ({
                                value: a.id,
                                label: `${a.tag_number} - ${a.name || 'İsimsiz'}`,
                            }))}
                            placeholder="Toplu sağım"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Yağ Oranı (%)"
                            type="number"
                            step="0.1"
                            value={formData.fat_rate}
                            onChange={(e) => setFormData({ ...formData, fat_rate: e.target.value })}
                            placeholder="Örn: 3.8"
                        />
                        <Input
                            label="pH Değeri"
                            type="number"
                            step="0.1"
                            value={formData.ph_level}
                            onChange={(e) => setFormData({ ...formData, ph_level: e.target.value })}
                            placeholder="Örn: 6.7"
                        />
                    </div>

                    <Input
                        label="Notlar"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Ek notlar..."
                    />
                </form>
            </Modal>
        </div>
    );
};

export default MilkEntry;
