import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { Database } from '../types/supabase';

type MilkRecord = Database['public']['Tables']['milk_records']['Row'];
type Animal = Database['public']['Tables']['animals']['Row'];

const MilkEntry: React.FC = () => {
    const [records, setRecords] = useState<(MilkRecord & { animals: Animal | null })[]>([]);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [shift, setShift] = useState<'morning' | 'evening'>('morning');
    const [quantity, setQuantity] = useState('');
    const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
    const [fatRate, setFatRate] = useState('');
    const [phLevel, setPhLevel] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchRecords();
        fetchAnimals();
    }, []);

    const fetchAnimals = async () => {
        const { data } = await supabase
            .from('animals')
            .select('*')
            .eq('type', 'cow')
            .eq('status', 'active')
            .order('tag_number');
        setAnimals(data || []);
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('milk_records')
                .select('*, animals(*)')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            // @ts-ignore: Supabase types join issue
            setRecords(data || []);
        } catch (error) {
            console.error('Error fetching records:', error);
            alert('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quantity) return;

        try {
            setSubmitting(true);
            const { error } = await supabase.from('milk_records').insert([
                {
                    date,
                    shift,
                    quantity_liters: parseFloat(quantity),
                    animal_id: selectedAnimalId || null,
                    fat_rate: fatRate ? parseFloat(fatRate) : null,
                    ph_level: phLevel ? parseFloat(phLevel) : null,
                    notes: notes || null,
                },
            ]);

            if (error) throw error;

            // Reset form and refresh list
            setQuantity('');
            setSelectedAnimalId('');
            setFatRate('');
            setPhLevel('');
            setNotes('');
            fetchRecords();
            alert('Kayıt başarıyla eklendi!');
        } catch (error) {
            console.error('Error adding record:', error);
            alert('Kayıt eklenirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

        try {
            const { error } = await supabase.from('milk_records').delete().eq('id', id);
            if (error) throw error;
            fetchRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Silme işlemi başarısız oldu.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Süt Giriş ve Sürü Yönetimi
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Günlük süt verimini kaydedin ve takip edin.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Entry Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Yeni Kayıt Ekle</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tarih</label>
                                    <input
                                        type="date"
                                        id="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shift" className="block text-sm font-medium text-gray-700">Sağım Vakti</label>
                                    <select
                                        id="shift"
                                        value={shift}
                                        onChange={(e) => setShift(e.target.value as 'morning' | 'evening')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    >
                                        <option value="morning">Sabah</option>
                                        <option value="evening">Akşam</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="animal" className="block text-sm font-medium text-gray-700">İnek (Opsiyonel - Toplu Giriş için Boş Bırakın)</label>
                                    <select
                                        id="animal"
                                        value={selectedAnimalId}
                                        onChange={(e) => setSelectedAnimalId(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    >
                                        <option value="">-- Toplu Giriş --</option>
                                        {animals.map(animal => (
                                            <option key={animal.id} value={animal.id}>
                                                {animal.tag_number} - {animal.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Miktar (Litre)</label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        required
                                        step="0.1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        placeholder="0.0"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="fatRate" className="block text-sm font-medium text-gray-700">Yağ Oranı (%)</label>
                                        <input
                                            type="number"
                                            id="fatRate"
                                            step="0.1"
                                            value={fatRate}
                                            onChange={(e) => setFatRate(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                            placeholder="Opt."
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phLevel" className="block text-sm font-medium text-gray-700">pH Değeri</label>
                                        <input
                                            type="number"
                                            id="phLevel"
                                            step="0.1"
                                            value={phLevel}
                                            onChange={(e) => setPhLevel(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                            placeholder="Opt."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notlar</label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        placeholder="Varsa ek açıklamalar..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="-ml-1 mr-2 h-4 w-4" />
                                            Kaydet
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Records List */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Son Kayıtlar</h3>
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                Son 10 Kayıt
                            </span>
                        </div>
                        <div className="border-t border-gray-200">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-indigo-500" />
                                    Yükleniyor...
                                </div>
                            ) : records.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Henüz kayıt bulunmuyor.
                                </div>
                            ) : (
                                <ul role="list" className="divide-y divide-gray-200">
                                    {records.map((record) => (
                                        <li key={record.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col sm:flex-row sm:items-center truncate">
                                                    <p className="truncate text-sm font-medium text-indigo-600">
                                                        {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                                                    </p>
                                                    <span className="hidden sm:inline mx-2 text-gray-300">|</span>
                                                    <div className="flex items-center mt-1 sm:mt-0">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${record.shift === 'morning'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {record.shift === 'morning' ? 'Sabah' : 'Akşam'}
                                                        </span>
                                                        {record.animals && (
                                                            <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                                                {record.animals.tag_number} ({record.animals.name})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-2 flex flex-shrink-0">
                                                    <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                        {record.quantity_liters} L
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        {record.fat_rate && `Yağ: %${record.fat_rate}`}
                                                        {record.fat_rate && record.ph_level && <span className="mx-2">•</span>}
                                                        {record.ph_level && `pH: ${record.ph_level}`}
                                                    </p>
                                                    {record.notes && (
                                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                            <span className="truncate max-w-xs">Not: {record.notes}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <button
                                                        onClick={() => handleDelete(record.id)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MilkEntry;
