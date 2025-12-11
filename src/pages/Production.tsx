import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Plus,
    Play,
    CheckCircle,
    Loader2,
    Package
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';

interface ProductionBatch {
    id: string;
    batch_number: string;
    product_type: string;
    milk_used_liters: number;
    start_time: string;
    end_time: string | null;
    status: 'planned' | 'in_progress' | 'completed' | 'failed';
    output_quantity: number | null;
    output_unit: string | null;
}

const Production: React.FC = () => {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewBatchForm, setShowNewBatchForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [productType, setProductType] = useState('Yoğurt');
    const [milkUsed, setMilkUsed] = useState('');
    const [batchNumber, setBatchNumber] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('production_batches')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBatches(data || []);
        } catch (error) {
            console.error('Error fetching batches:', error);
            alert('Üretim verileri yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!milkUsed || !batchNumber) return;

        try {
            setSubmitting(true);
            const { error } = await supabase.from('production_batches').insert([
                {
                    batch_number: batchNumber,
                    product_type: productType,
                    milk_used_liters: parseFloat(milkUsed),
                    start_time: new Date().toISOString(),
                    status: 'in_progress',
                },
            ]);

            if (error) throw error;

            setShowNewBatchForm(false);
            setBatchNumber('');
            setMilkUsed('');
            fetchBatches();
            alert('Üretim başlatıldı!');
        } catch (error) {
            console.error('Error starting batch:', error);
            alert('Üretim başlatılırken hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteBatch = async (id: string) => {
        const outputQty = prompt('Üretilen Miktar:');
        if (!outputQty) return;

        const outputUnit = prompt('Birim (Adet, Kg, Teneke):', 'Adet');

        try {
            const { error } = await supabase
                .from('production_batches')
                .update({
                    status: 'completed',
                    end_time: new Date().toISOString(),
                    output_quantity: parseFloat(outputQty),
                    output_unit: outputUnit,
                })
                .eq('id', id);

            if (error) throw error;
            fetchBatches();
        } catch (error) {
            console.error('Error completing batch:', error);
            alert('İşlem başarısız.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_progress':
                return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Üretimde</span>;
            case 'completed':
                return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Tamamlandı</span>;
            case 'failed':
                return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Hatalı</span>;
            default:
                return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Planlandı</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Üretim Yönetimi (MES)
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Üretim partilerini takip edin ve yönetin.
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        type="button"
                        onClick={() => setShowNewBatchForm(!showNewBatchForm)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Yeni Parti Başlat
                    </button>
                </div>
            </div>

            {/* New Batch Form */}
            {showNewBatchForm && (
                <div className="bg-white shadow sm:rounded-lg p-6 border border-indigo-100">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Yeni Üretim Partisi</h3>
                    <form onSubmit={handleStartBatch} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                        <div>
                            <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700">Parti No (Batch ID)</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="batchNumber"
                                    required
                                    value={batchNumber}
                                    onChange={(e) => setBatchNumber(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    placeholder="örn: 2023-YO-001"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="productType" className="block text-sm font-medium text-gray-700">Ürün Tipi</label>
                            <div className="mt-1">
                                <select
                                    id="productType"
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                >
                                    <option>Yoğurt</option>
                                    <option>Beyaz Peynir</option>
                                    <option>Kaşar Peyniri</option>
                                    <option>Tereyağı</option>
                                    <option>Ayran</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="milkUsed" className="block text-sm font-medium text-gray-700">Kullanılan Süt (Litre)</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    id="milkUsed"
                                    required
                                    value={milkUsed}
                                    onChange={(e) => setMilkUsed(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowNewBatchForm(false)}
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                {submitting ? 'Başlatılıyor...' : 'Üretimi Başlat'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Batches List */}
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <ul role="list" className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-indigo-500" />
                            Yükleniyor...
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Üretim kaydı yok</h3>
                            <p className="mt-1 text-sm text-gray-500">Yeni bir üretim partisi başlatarak başlayın.</p>
                        </div>
                    ) : (
                        batches.map((batch) => (
                            <li key={batch.id} className="hover:bg-gray-50 transition-colors">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className={clsx(
                                                    "inline-flex h-10 w-10 items-center justify-center rounded-full",
                                                    batch.status === 'completed' ? "bg-green-100" : "bg-blue-100"
                                                )}>
                                                    {batch.status === 'completed' ? (
                                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                                    ) : (
                                                        <Play className="h-6 w-6 text-blue-600" />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <h3 className="text-base font-semibold leading-6 text-gray-900 mr-2">
                                                        {batch.product_type}
                                                    </h3>
                                                    {getStatusBadge(batch.status)}
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <span className="truncate">Parti: {batch.batch_number}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{batch.milk_used_liters} L Süt</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <div className="text-sm text-gray-500">
                                                {format(new Date(batch.start_time), 'd MMM HH:mm', { locale: tr })}
                                                {batch.end_time && ` - ${format(new Date(batch.end_time), 'HH:mm')}`}
                                            </div>
                                            {batch.status === 'in_progress' && (
                                                <button
                                                    onClick={() => handleCompleteBatch(batch.id)}
                                                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                >
                                                    Tamamla
                                                </button>
                                            )}
                                            {batch.status === 'completed' && (
                                                <span className="text-sm font-medium text-gray-900">
                                                    Çıktı: {batch.output_quantity} {batch.output_unit}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Production;
