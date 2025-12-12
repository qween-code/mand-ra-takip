// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - SUPPLIERS PAGE
// Supplier management and milk collection tracking
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';
import {
    Users,
    Plus,
    Phone,
    MapPin,
    DollarSign,
    Droplets,
    CreditCard,
    Thermometer,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, Button, Badge, Modal, Input, Select } from '../components/ui';
import type { Supplier, MilkCollection } from '../types';

type QualityStatus = 'good' | 'acceptable' | 'rejected';

interface CollectionWithSupplier extends MilkCollection {
    supplier?: Supplier;
}

const qualityLabels: Record<QualityStatus, string> = {
    good: 'İyi',
    acceptable: 'Kabul Edilebilir',
    rejected: 'Reddedildi',
};

const qualityColorMap: Record<QualityStatus, 'success' | 'warning' | 'error'> = {
    good: 'success',
    acceptable: 'warning',
    rejected: 'error',
};

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [collections, setCollections] = useState<CollectionWithSupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', village: '', price_per_liter: '' });
    const [collectionForm, setCollectionForm] = useState({
        supplier_id: '',
        quantity_liters: '',
        temperature: '',
        quality_status: 'good' as QualityStatus,
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: supplierData } = await supabase.from('suppliers').select('*').order('name');
            setSuppliers((supplierData as Supplier[]) || []);

            const { data: collectionData } = await supabase
                .from('milk_collections')
                .select('*, supplier:suppliers(*)')
                .order('date', { ascending: false })
                .limit(20);
            setCollections((collectionData as CollectionWithSupplier[]) || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSupplier = async () => {
        try {
            const { error } = await supabase.from('suppliers').insert({
                name: supplierForm.name,
                phone: supplierForm.phone || null,
                village: supplierForm.village || null,
                price_per_liter: supplierForm.price_per_liter ? parseFloat(supplierForm.price_per_liter) : 0,
                is_active: true,
            });
            if (error) throw error;
            setShowAddSupplierModal(false);
            setSupplierForm({ name: '', phone: '', village: '', price_per_liter: '' });
            loadData();
        } catch (error) {
            console.error('Error adding supplier:', error);
        }
    };

    const handleAddCollection = async () => {
        try {
            const supplier = suppliers.find(s => s.id === collectionForm.supplier_id);
            const { error } = await supabase.from('milk_collections').insert({
                date: format(new Date(), 'yyyy-MM-dd'),
                supplier_id: collectionForm.supplier_id,
                quantity_liters: parseFloat(collectionForm.quantity_liters),
                temperature: collectionForm.temperature ? parseFloat(collectionForm.temperature) : null,
                quality_status: collectionForm.quality_status,
                unit_price: supplier?.price_per_liter || 0,
            });
            if (error) throw error;
            setShowAddCollectionModal(false);
            setCollectionForm({ supplier_id: '', quantity_liters: '', temperature: '', quality_status: 'good' });
            loadData();
        } catch (error) {
            console.error('Error adding collection:', error);
        }
    };

    const totalSuppliers = suppliers.filter(s => s.is_active).length;
    const todayCollections = collections.filter(c => c.date === format(new Date(), 'yyyy-MM-dd'));
    const todayTotal = todayCollections.reduce((sum, c) => sum + (c.quantity_liters || 0), 0);
    const todayValue = todayCollections.reduce((sum, c) => sum + (c.total_amount || 0), 0);
    const pendingPayments = suppliers.reduce((sum, s) => sum + (s.total_collected - s.total_paid), 0);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="page-content">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tedarikçiler</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Süt tedarikçileri ve toplama kayıtları</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setShowAddCollectionModal(true)}>
                        <Droplets size={16} className="mr-2" />Toplama Ekle
                    </Button>
                    <Button variant="primary" onClick={() => setShowAddSupplierModal(true)}>
                        <Plus size={16} className="mr-2" />Tedarikçi Ekle
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--primary-400)] mb-2"><Users size={18} /><span className="text-sm font-medium">Tedarikçi</span></div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{totalSuppliers}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--accent)] mb-2"><Droplets size={18} /><span className="text-sm font-medium">Bugün Toplanan</span></div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{todayTotal.toFixed(0)} L</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--success)] mb-2"><DollarSign size={18} /><span className="text-sm font-medium">Bugün Değer</span></div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">₺{todayValue.toLocaleString('tr-TR')}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--warning)] mb-2"><CreditCard size={18} /><span className="text-sm font-medium">Ödenmemiş</span></div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">₺{pendingPayments.toLocaleString('tr-TR')}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader title="Tedarikçiler" subtitle={`${totalSuppliers} aktif tedarikçi`} />
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {suppliers.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]"><Users size={48} className="mx-auto mb-4 opacity-30" /><p>Henüz tedarikçi eklenmedi</p></div>
                        ) : (
                            suppliers.map((supplier) => (
                                <div key={supplier.id} className={clsx('p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer transition-colors', selectedSupplier?.id === supplier.id && 'ring-2 ring-[var(--primary-500)]')} onClick={() => setSelectedSupplier(supplier)}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-[var(--text-primary)]">{supplier.name}</span>
                                        <Badge variant={supplier.is_active ? 'success' : 'default'}>{supplier.is_active ? 'Aktif' : 'Pasif'}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                                        {supplier.village && <span className="flex items-center gap-1"><MapPin size={12} />{supplier.village}</span>}
                                        {supplier.phone && <span className="flex items-center gap-1"><Phone size={12} />{supplier.phone}</span>}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                                        <span className="text-sm text-[var(--text-muted)]">Fiyat: ₺{supplier.price_per_liter}/L</span>
                                        <span className="text-sm font-medium text-[var(--accent)]">{supplier.total_collected.toFixed(0)} L toplandı</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader title="Bugünün Toplamaları" subtitle={format(new Date(), 'd MMMM yyyy', { locale: tr })} />
                    {todayCollections.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-secondary)]">
                            <Droplets size={48} className="mx-auto mb-4 opacity-30" /><p>Bugün için toplama kaydı yok</p>
                            <Button variant="secondary" className="mt-4" onClick={() => setShowAddCollectionModal(true)}><Plus size={16} className="mr-2" />Toplama Ekle</Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayCollections.map((collection) => {
                                const qStatus = (collection.quality_status || 'good') as QualityStatus;
                                return (
                                    <div key={collection.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center"><Droplets size={24} className="text-[var(--accent)]" /></div>
                                            <div>
                                                <div className="font-medium text-[var(--text-primary)]">{collection.supplier?.name || 'Bilinmiyor'}</div>
                                                <div className="text-sm text-[var(--text-secondary)] flex items-center gap-3 mt-1">
                                                    {collection.temperature && <span className="flex items-center gap-1"><Thermometer size={12} />{collection.temperature}°C</span>}
                                                    <Badge variant={qualityColorMap[qStatus]}>{qualityLabels[qStatus]}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-[var(--accent)]">{collection.quantity_liters} L</div>
                                            <div className="text-sm text-[var(--text-muted)]">₺{(collection.total_amount || 0).toLocaleString('tr-TR')}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader title="Son Toplanmalar" subtitle="Tüm toplama geçmişi" />
                <div className="space-y-3">
                    {collections.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-secondary)]">Toplama kaydı bulunamadı</div>
                    ) : (
                        collections.map((collection) => {
                            const qStatus = (collection.quality_status || 'good') as QualityStatus;
                            return (
                                <div key={collection.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', qStatus === 'good' && 'bg-green-100', qStatus === 'acceptable' && 'bg-yellow-100', qStatus === 'rejected' && 'bg-red-100')}>
                                            <Droplets size={20} className={clsx(qStatus === 'good' && 'text-green-600', qStatus === 'acceptable' && 'text-yellow-600', qStatus === 'rejected' && 'text-red-600')} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-[var(--text-primary)]">{collection.supplier?.name || 'Bilinmiyor'}</span>
                                                <Badge variant={qualityColorMap[qStatus]}>{qualityLabels[qStatus]}</Badge>
                                            </div>
                                            <div className="text-sm text-[var(--text-secondary)]">{format(new Date(collection.date), 'd MMM yyyy', { locale: tr })}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-[var(--text-primary)]">{collection.quantity_liters} L</div>
                                        <div className="text-sm text-[var(--text-muted)]">₺{(collection.total_amount || 0).toLocaleString('tr-TR')}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            <Modal isOpen={showAddSupplierModal} onClose={() => setShowAddSupplierModal(false)} title="Yeni Tedarikçi Ekle" size="md">
                <div className="space-y-4">
                    <Input label="İsim *" placeholder="Tedarikçi adı" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Telefon" placeholder="0532 XXX XX XX" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                        <Input label="Köy/Mahalle" placeholder="Köy adı" value={supplierForm.village} onChange={(e) => setSupplierForm({ ...supplierForm, village: e.target.value })} />
                    </div>
                    <Input label="Litre Fiyatı (₺)" type="number" placeholder="12.50" value={supplierForm.price_per_liter} onChange={(e) => setSupplierForm({ ...supplierForm, price_per_liter: e.target.value })} />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowAddSupplierModal(false)}>İptal</Button>
                        <Button variant="primary" onClick={handleAddSupplier}>Ekle</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showAddCollectionModal} onClose={() => setShowAddCollectionModal(false)} title="Süt Toplama Kaydı" size="md">
                <div className="space-y-4">
                    <Select label="Tedarikçi *" options={[{ value: '', label: 'Seçin...' }, ...suppliers.filter(s => s.is_active).map(s => ({ value: s.id, label: `${s.name} (₺${s.price_per_liter}/L)` }))]} value={collectionForm.supplier_id} onChange={(e) => setCollectionForm({ ...collectionForm, supplier_id: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Miktar (L) *" type="number" placeholder="100" value={collectionForm.quantity_liters} onChange={(e) => setCollectionForm({ ...collectionForm, quantity_liters: e.target.value })} />
                        <Input label="Sıcaklık (°C)" type="number" placeholder="4.5" step="0.1" value={collectionForm.temperature} onChange={(e) => setCollectionForm({ ...collectionForm, temperature: e.target.value })} />
                    </div>
                    <Select label="Kalite Durumu" options={[{ value: 'good', label: 'İyi' }, { value: 'acceptable', label: 'Kabul Edilebilir' }, { value: 'rejected', label: 'Reddedildi' }]} value={collectionForm.quality_status} onChange={(e) => setCollectionForm({ ...collectionForm, quality_status: e.target.value as QualityStatus })} />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowAddCollectionModal(false)}>İptal</Button>
                        <Button variant="primary" onClick={handleAddCollection}>Kaydet</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Suppliers;
