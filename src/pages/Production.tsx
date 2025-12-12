// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - PRODUCTION PAGE
// Production batch management with milk source traceability
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Factory,
    Plus,
    Package,
    Droplets,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, Button, Badge, Modal, Input, Select, cn } from '../components/ui';
import type { Product, ProductionBatch, Supplier } from '../types';

interface BatchWithDetails extends ProductionBatch {
    product?: Product;
}

const statusLabels: Record<string, string> = {
    planned: 'Planlandı',
    in_progress: 'Üretiliyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
};

const statusColors: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'error',
};

const Production: React.FC = () => {
    const [batches, setBatches] = useState<BatchWithDetails[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<BatchWithDetails | null>(null);

    const [showProductModal, setShowProductModal] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        category: 'yogurt',
        unit: 'kg',
        price_per_unit: '',
        shelf_life_days: '',
        min_stock_alert: '10'
    });

    // Form state
    const [formData, setFormData] = useState({
        product_id: '',
        milk_used_liters: '',
        quantity_produced: '',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load batches with product info
            const { data: batchData } = await supabase
                .from('production_batches' as any)
                .select(`
          *,
          product:products(*)
        `)
                .order('production_date', { ascending: false });

            setBatches((batchData as any[])?.map(b => ({
                ...b,
                expiration_date: b.expiration_date || b.expiry_date // Handle potential DB column name mismatch if any, but prefer expiration_date
            })) || []);

            // Load products
            const { data: productData } = await supabase
                .from('products' as any)
                .select('*')
                .eq('is_active', true);

            setProducts((productData as unknown as Product[]) || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatch = async () => {
        try {
            const batchNumber = `${formData.product_id.substring(0, 3).toUpperCase()}-${format(new Date(), 'yyyyMMdd')}-${Date.now().toString().slice(-3)}`;

            const selectedProduct = products.find(p => p.id === formData.product_id);
            const expiryDate = selectedProduct
                ? format(new Date(Date.now() + (selectedProduct.shelf_life_days || 30) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                : null;

            const { error } = await supabase.from('production_batches' as any).insert({
                batch_number: batchNumber,
                product_id: formData.product_id,
                start_date: format(new Date(), 'yyyy-MM-dd'),
                milk_used_liters: parseFloat(formData.milk_used_liters),
                quantity_produced: parseFloat(formData.quantity_produced),
                expiration_date: expiryDate,
                status: 'in_progress',
                unit: selectedProduct?.unit || 'adet'
            });

            if (error) throw error;

            setShowCreateModal(false);
            setFormData({
                product_id: '',
                milk_used_liters: '',
                quantity_produced: '',
                notes: '',
            });
            loadData();
        } catch (error) {
            console.error('Error creating batch:', error);
        }
    };

    const handleAddProduct = async () => {
        try {
            const { error } = await supabase.from('products').insert({
                name: productForm.name,
                category: productForm.category,
                unit: productForm.unit,
                price_per_unit: parseFloat(productForm.price_per_unit),
                shelf_life_days: parseInt(productForm.shelf_life_days),
                min_stock_alert: parseInt(productForm.min_stock_alert),
                stock_quantity: 0,
                is_active: true
            });

            if (error) throw error;

            setShowProductModal(false);
            setProductForm({
                name: '',
                category: 'yogurt',
                unit: 'kg',
                price_per_unit: '',
                shelf_life_days: '',
                min_stock_alert: '10'
            });
            loadData();
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleStatusChange = async (batchId: string, newStatus: string) => {
        try {
            await supabase
                .from('production_batches')
                .update({ status: newStatus })
                .eq('id', batchId);
            loadData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const stats = {
        totalBatches: batches.length,
        inProgress: batches.filter(b => b.status === 'in_progress').length,
        completed: batches.filter(b => b.status === 'completed').length,
        totalMilkUsed: batches.reduce((sum, b) => sum + (b.milk_used_liters || 0), 0),
    };

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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Üretim</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Üretim partilerini ve ürünleri yönetin</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Package} onClick={() => setShowProductModal(true)}>
                        Ürün Ekle
                    </Button>
                    <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
                        Yeni Üretim
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--primary-400)] mb-2">
                        <Package size={18} />
                        <span className="text-sm font-medium">Toplam Parti</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalBatches}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--warning)] mb-2">
                        <Clock size={18} />
                        <span className="text-sm font-medium">Üretimde</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.inProgress}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--success)] mb-2">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium">Tamamlanan</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.completed}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
                        <Droplets size={18} />
                        <span className="text-sm font-medium">Kullanılan Süt</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalMilkUsed.toFixed(0)} L</div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Ürünler</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-visible)] transition-colors cursor-pointer relative group"
                            onClick={() => {
                                setFormData({ ...formData, product_id: product.id });
                                setShowCreateModal(true);
                            }}
                        >
                            <div className="text-2xl mb-2">
                                {product.category === 'yogurt' ? '🥛' :
                                    product.category === 'cheese' ? '🧀' :
                                        product.category === 'butter' ? '🧈' :
                                            product.category === 'ice_cream' ? '🍨' : '📦'}
                            </div>
                            <div className="font-medium text-[var(--text-primary)] text-sm">{product.name}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">
                                Stok: {product.stock_quantity} {product.unit}
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowProductModal(true)}
                        className="p-4 border border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-500)] hover:border-[var(--primary-500)] transition-colors"
                    >
                        <Plus size={24} className="mb-2" />
                        <span className="text-sm font-medium">Ürün Ekle</span>
                    </button>
                </div>
            </div>

            {/* Batch List */}
            <Card>
                <CardHeader
                    title="Üretim Partileri"
                    subtitle="Tüm üretim kayıtları"
                />
                <div className="space-y-4">
                    {batches.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-secondary)]">
                            Henüz üretim kaydı yok
                        </div>
                    ) : (
                        batches.map((batch) => (
                            <div
                                key={batch.id}
                                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-2xl">
                                        {batch.product?.category === 'yogurt' ? '🥛' :
                                            batch.product?.category === 'cheese' ? '🧀' :
                                                batch.product?.category === 'butter' ? '🧈' :
                                                    batch.product?.category === 'ice_cream' ? '🍨' : '📦'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--text-primary)]">
                                                {batch.product?.name || 'Bilinmeyen Ürün'}
                                            </span>
                                            <Badge variant={statusColors[batch.status]}>
                                                {statusLabels[batch.status]}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Package size={12} />
                                                {batch.batch_number}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Droplets size={12} />
                                                {batch.milk_used_liters} L süt
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {format(new Date(batch.start_date), 'd MMM', { locale: tr })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="font-bold text-[var(--text-primary)]">
                                            {batch.quantity_produced} {batch.unit}
                                        </div>
                                        {batch.expiration_date && (
                                            <div className="text-xs text-[var(--text-muted)]">
                                                SKT: {format(new Date(batch.expiration_date), 'd MMM', { locale: tr })}
                                            </div>
                                        )}
                                    </div>
                                    {batch.status === 'in_progress' && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleStatusChange(batch.id, 'completed')}
                                        >
                                            Tamamla
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Create Batch Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Yeni Üretim Başlat"
                size="md"
            >
                <div className="space-y-4">
                    <Select
                        label="Ürün *"
                        options={[
                            { value: '', label: 'Ürün seçin...' },
                            ...products.map(p => ({ value: p.id, label: p.name }))
                        ]}
                        value={formData.product_id}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Kullanılan Süt (L) *"
                            type="number"
                            placeholder="100"
                            value={formData.milk_used_liters}
                            onChange={(e) => setFormData({ ...formData, milk_used_liters: e.target.value })}
                        />
                        <Input
                            label="Üretilen Miktar *"
                            type="number"
                            placeholder="80"
                            value={formData.quantity_produced}
                            onChange={(e) => setFormData({ ...formData, quantity_produced: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Notlar"
                        placeholder="Opsiyonel notlar..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            İptal
                        </Button>
                        <Button variant="primary" onClick={handleCreateBatch}>
                            Üretimi Başlat
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Product Modal */}
            <Modal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                title="Yeni Ürün Ekle"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Ürün Adı *"
                        placeholder="Örn: Tam Yağlı Yoğurt"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Kategori *"
                            options={[
                                { value: 'yogurt', label: 'Yoğurt' },
                                { value: 'cheese', label: 'Peynir' },
                                { value: 'butter', label: 'Tereyağı' },
                                { value: 'ice_cream', label: 'Dondurma' },
                                { value: 'other', label: 'Diğer' }
                            ]}
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        />
                        <Input
                            label="Birim *"
                            placeholder="kg, lt, adet"
                            value={productForm.unit}
                            onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Birim Fiyat (₺) *"
                            type="number"
                            placeholder="0.00"
                            value={productForm.price_per_unit}
                            onChange={(e) => setProductForm({ ...productForm, price_per_unit: e.target.value })}
                        />
                        <Input
                            label="Raf Ömrü (Gün) *"
                            type="number"
                            placeholder="30"
                            value={productForm.shelf_life_days}
                            onChange={(e) => setProductForm({ ...productForm, shelf_life_days: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowProductModal(false)}>
                            İptal
                        </Button>
                        <Button variant="primary" onClick={handleAddProduct}>
                            Kaydet
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Production;
