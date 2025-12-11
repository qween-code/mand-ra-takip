import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Card, Button, Input, Select, Modal, StatusBadge } from '../components/ui';
import { Factory, Plus, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';

type ProductionBatch = Database['public']['Tables']['production_batches']['Row'];

const Production: React.FC = () => {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        product_type: '',
        milk_used_liters: '',
        start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('production_batches')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBatches(data || []);
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateBatchNumber = () => {
        const date = format(new Date(), 'yyyyMMdd');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `B${date}-${random}`;
    };

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('production_batches').insert([{
                batch_number: generateBatchNumber(),
                product_type: formData.product_type,
                milk_used_liters: parseFloat(formData.milk_used_liters),
                start_time: formData.start_time,
                status: 'in_progress',
            }]);

            if (error) throw error;

            setShowAddModal(false);
            setFormData({
                product_type: '',
                milk_used_liters: '',
                start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            });
            fetchBatches();
        } catch (error) {
            console.error('Error creating batch:', error);
            alert('Parti oluşturulurken bir hata oluştu');
        }
    };

    const handleCompleteBatch = async (batch: ProductionBatch) => {
        const quantity = prompt('Üretilen miktar:');
        const unit = prompt('Birim (Adet, Kg, Teneke):');

        if (!quantity || !unit) return;

        try {
            const { error } = await supabase
                .from('production_batches')
                .update({
                    status: 'completed',
                    end_time: new Date().toISOString(),
                    output_quantity: parseFloat(quantity),
                    output_unit: unit,
                })
                .eq('id', batch.id);

            if (error) throw error;
            fetchBatches();
        } catch (error) {
            console.error('Error completing batch:', error);
        }
    };

    const filteredBatches = batches.filter(batch => {
        return !filterStatus || batch.status === filterStatus;
    });

    const productTypes = [
        { value: 'yogurt', label: 'Yoğurt' },
        { value: 'cheese', label: 'Peynir' },
        { value: 'butter', label: 'Tereyağı' },
        { value: 'cream', label: 'Krema' },
        { value: 'ayran', label: 'Ayran' },
    ];

    const getProductTypeLabel = (type: string) => {
        const found = productTypes.find(p => p.value === type);
        return found ? found.label : type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Üretim</h1>
                    <p className="text-gray-500 mt-1">Süt ürünleri üretim takibi</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={20} className="mr-2" />
                    Yeni Parti
                </Button>
            </div>

            {/* Filter */}
            <Card>
                <div className="flex gap-4">
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[
                            { value: 'planned', label: 'Planlandı' },
                            { value: 'in_progress', label: 'Devam Ediyor' },
                            { value: 'completed', label: 'Tamamlandı' },
                            { value: 'failed', label: 'Başarısız' },
                        ]}
                        placeholder="Tüm Durumlar"
                    />
                </div>
            </Card>

            {/* Batches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Henüz üretim partisi yok
                    </div>
                ) : (
                    filteredBatches.map((batch) => (
                        <Card key={batch.id} className="hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        'w-12 h-12 rounded-xl flex items-center justify-center',
                                        batch.status === 'completed' ? 'bg-green-100' :
                                            batch.status === 'in_progress' ? 'bg-yellow-100' :
                                                'bg-gray-100'
                                    )}>
                                        <Factory size={24} className={clsx(
                                            batch.status === 'completed' ? 'text-green-600' :
                                                batch.status === 'in_progress' ? 'text-yellow-600' :
                                                    'text-gray-600'
                                        )} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{getProductTypeLabel(batch.product_type)}</p>
                                        <p className="text-sm text-gray-500">{batch.batch_number}</p>
                                    </div>
                                </div>
                                <StatusBadge status={batch.status || 'planned'} />
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Kullanılan Süt</span>
                                    <span className="font-medium">{batch.milk_used_liters} L</span>
                                </div>
                                {batch.start_time && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Başlangıç</span>
                                        <span className="font-medium">
                                            {format(new Date(batch.start_time), 'd MMM HH:mm', { locale: tr })}
                                        </span>
                                    </div>
                                )}
                                {batch.end_time && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Bitiş</span>
                                        <span className="font-medium">
                                            {format(new Date(batch.end_time), 'd MMM HH:mm', { locale: tr })}
                                        </span>
                                    </div>
                                )}
                                {batch.output_quantity && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Üretim</span>
                                        <span className="font-semibold text-green-600">
                                            {batch.output_quantity} {batch.output_unit}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {batch.status === 'in_progress' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleCompleteBatch(batch)}
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Tamamla
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Yeni Üretim Partisi"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>İptal</Button>
                        <Button onClick={handleAddBatch}>Başlat</Button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <Select
                        label="Ürün Tipi"
                        value={formData.product_type}
                        onChange={(value) => setFormData({ ...formData, product_type: value })}
                        options={productTypes}
                        placeholder="Ürün seçiniz"
                    />
                    <Input
                        label="Kullanılacak Süt (Litre)"
                        type="number"
                        step="0.1"
                        value={formData.milk_used_liters}
                        onChange={(e) => setFormData({ ...formData, milk_used_liters: e.target.value })}
                        placeholder="Örn: 100"
                        required
                    />
                    <Input
                        label="Başlangıç Zamanı"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                </form>
            </Modal>
        </div>
    );
};

export default Production;
