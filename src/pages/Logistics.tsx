import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Card, Button, Input, Select, Modal, Table, StatusBadge } from '../components/ui';
import { Truck, MapPin, Store, Plus, ArrowRight, Package } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';

type Region = Database['public']['Tables']['regions']['Row'];
type SalesPoint = Database['public']['Tables']['sales_points']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductTransfer = Database['public']['Tables']['product_transfers']['Row'];

const Logistics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'regions' | 'transfers' | 'products'>('regions');
    const [loading, setLoading] = useState(true);

    // Data
    const [regions, setRegions] = useState<(Region & { sales_points: SalesPoint[] })[]>([]);
    const [transfers, setTransfers] = useState<(ProductTransfer & { products?: Product | null })[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Modals
    const [showAddRegionModal, setShowAddRegionModal] = useState(false);
    const [showAddTransferModal, setShowAddTransferModal] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);

    // Forms
    const [regionForm, setRegionForm] = useState({ name: '', description: '' });
    const [productForm, setProductForm] = useState({ name: '', sku: '', unit_price: '', category: '' });
    const [transferForm, setTransferForm] = useState({
        product_id: '',
        target_region_id: '',
        quantity: '',
        driver_name: '',
        vehicle_plate: '',
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'regions') {
                const { data } = await supabase
                    .from('regions')
                    .select('*, sales_points(*)')
                    .order('name');
                // @ts-ignore
                setRegions(data || []);
            } else if (activeTab === 'transfers') {
                const { data } = await supabase
                    .from('product_transfers')
                    .select('*, products(*)')
                    .order('created_at', { ascending: false });
                // @ts-ignore
                setTransfers(data || []);
            } else if (activeTab === 'products') {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .order('name');
                setProducts(data || []);
            }

            // Always fetch products and regions for forms
            const { data: productsData } = await supabase.from('products').select('*').order('name');
            const { data: regionsData } = await supabase.from('regions').select('*').order('name');
            setProducts(productsData || []);
            if (regionsData) {
                // @ts-ignore
                setRegions(prev => prev.length > 0 ? prev : regionsData.map(r => ({ ...r, sales_points: [] })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRegion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('regions').insert([{
                name: regionForm.name,
                description: regionForm.description || null,
            }]);
            if (error) throw error;
            setShowAddRegionModal(false);
            setRegionForm({ name: '', description: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding region:', error);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('products').insert([{
                name: productForm.name,
                sku: productForm.sku || null,
                unit_price: parseFloat(productForm.unit_price),
                category: productForm.category || null,
            }]);
            if (error) throw error;
            setShowAddProductModal(false);
            setProductForm({ name: '', sku: '', unit_price: '', category: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleAddTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('product_transfers').insert([{
                product_id: transferForm.product_id,
                target_region_id: transferForm.target_region_id,
                target_type: 'region',
                source_type: 'center',
                quantity: parseFloat(transferForm.quantity),
                driver_name: transferForm.driver_name || null,
                vehicle_plate: transferForm.vehicle_plate || null,
                status: 'pending',
            }]);
            if (error) throw error;
            setShowAddTransferModal(false);
            setTransferForm({ product_id: '', target_region_id: '', quantity: '', driver_name: '', vehicle_plate: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding transfer:', error);
        }
    };

    const handleUpdateTransferStatus = async (transfer: ProductTransfer, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('product_transfers')
                .update({ status: newStatus })
                .eq('id', transfer.id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error updating transfer:', error);
        }
    };

    const tabs = [
        { id: 'regions', label: 'Bölgeler', icon: MapPin },
        { id: 'transfers', label: 'Transferler', icon: Truck },
        { id: 'products', label: 'Ürünler', icon: Package },
    ];

    const transferColumns = [
        {
            key: 'product',
            header: 'Ürün',
            render: (transfer: ProductTransfer & { products?: Product | null }) => (
                <span className="font-medium">{transfer.products?.name || 'Bilinmiyor'}</span>
            ),
        },
        {
            key: 'quantity',
            header: 'Miktar',
            render: (transfer: ProductTransfer) => transfer.quantity,
        },
        {
            key: 'date',
            header: 'Tarih',
            render: (transfer: ProductTransfer) => format(new Date(transfer.created_at), 'd MMM yyyy', { locale: tr }),
        },
        {
            key: 'driver',
            header: 'Sürücü',
            render: (transfer: ProductTransfer) => transfer.driver_name || '-',
        },
        {
            key: 'status',
            header: 'Durum',
            render: (transfer: ProductTransfer) => <StatusBadge status={transfer.status || 'pending'} />,
        },
        {
            key: 'actions',
            header: '',
            render: (transfer: ProductTransfer) => (
                transfer.status !== 'delivered' && transfer.status !== 'cancelled' && (
                    <Select
                        value=""
                        onChange={(value) => handleUpdateTransferStatus(transfer, value)}
                        options={[
                            { value: 'in_transit', label: 'Yola Çıktı' },
                            { value: 'delivered', label: 'Teslim Edildi' },
                            { value: 'cancelled', label: 'İptal' },
                        ]}
                        placeholder="Güncelle"
                    />
                )
            ),
        },
    ];

    const productColumns = [
        {
            key: 'name',
            header: 'Ürün Adı',
            render: (product: Product) => <span className="font-medium">{product.name}</span>,
        },
        {
            key: 'sku',
            header: 'SKU',
            render: (product: Product) => product.sku || '-',
        },
        {
            key: 'category',
            header: 'Kategori',
            render: (product: Product) => product.category || '-',
        },
        {
            key: 'unit_price',
            header: 'Birim Fiyat',
            render: (product: Product) => `₺${product.unit_price.toLocaleString('tr-TR')}`,
        },
        {
            key: 'stock',
            header: 'Stok',
            render: (product: Product) => product.stock_quantity || 0,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lojistik</h1>
                    <p className="text-gray-500 mt-1">Bölgeler, transferler ve ürün yönetimi</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'regions' && (
                        <Button onClick={() => setShowAddRegionModal(true)}>
                            <Plus size={20} className="mr-2" />
                            Yeni Bölge
                        </Button>
                    )}
                    {activeTab === 'transfers' && (
                        <Button onClick={() => setShowAddTransferModal(true)}>
                            <Plus size={20} className="mr-2" />
                            Yeni Transfer
                        </Button>
                    )}
                    {activeTab === 'products' && (
                        <Button onClick={() => setShowAddProductModal(true)}>
                            <Plus size={20} className="mr-2" />
                            Yeni Ürün
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={clsx(
                            'flex items-center gap-2 px-6 py-3 border-b-2 transition-colors',
                            activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        )}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent" />
                </div>
            ) : (
                <>
                    {activeTab === 'regions' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {regions.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    Henüz bölge eklenmemiş
                                </div>
                            ) : (
                                regions.map((region) => (
                                    <Card key={region.id}>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                                <MapPin size={24} className="text-indigo-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{region.name}</h3>
                                                {region.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{region.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                                    <Store size={16} />
                                                    <span>{region.sales_points?.length || 0} satış noktası</span>
                                                </div>
                                            </div>
                                        </div>
                                        {region.sales_points && region.sales_points.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                                {region.sales_points.slice(0, 3).map((point) => (
                                                    <div key={point.id} className="flex items-center gap-2 text-sm">
                                                        <ArrowRight size={14} className="text-gray-400" />
                                                        <span className="text-gray-700">{point.name}</span>
                                                    </div>
                                                ))}
                                                {region.sales_points.length > 3 && (
                                                    <p className="text-xs text-gray-400">
                                                        +{region.sales_points.length - 3} daha...
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'transfers' && (
                        <Table
                            data={transfers}
                            columns={transferColumns}
                            keyExtractor={(t) => t.id}
                            emptyMessage="Henüz transfer kaydı yok"
                        />
                    )}

                    {activeTab === 'products' && (
                        <Table
                            data={products}
                            columns={productColumns}
                            keyExtractor={(p) => p.id}
                            emptyMessage="Henüz ürün eklenmemiş"
                        />
                    )}
                </>
            )}

            {/* Add Region Modal */}
            <Modal
                isOpen={showAddRegionModal}
                onClose={() => setShowAddRegionModal(false)}
                title="Yeni Bölge Ekle"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowAddRegionModal(false)}>İptal</Button>
                        <Button onClick={handleAddRegion}>Kaydet</Button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Bölge Adı"
                        value={regionForm.name}
                        onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                        placeholder="Örn: Kadıköy"
                        required
                    />
                    <Input
                        label="Açıklama"
                        value={regionForm.description}
                        onChange={(e) => setRegionForm({ ...regionForm, description: e.target.value })}
                        placeholder="Bölge açıklaması..."
                    />
                </form>
            </Modal>

            {/* Add Product Modal */}
            <Modal
                isOpen={showAddProductModal}
                onClose={() => setShowAddProductModal(false)}
                title="Yeni Ürün Ekle"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowAddProductModal(false)}>İptal</Button>
                        <Button onClick={handleAddProduct}>Kaydet</Button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Ürün Adı"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Örn: Beyaz Peynir 500g"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="SKU"
                            value={productForm.sku}
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                            placeholder="BP-500"
                        />
                        <Input
                            label="Birim Fiyat (₺)"
                            type="number"
                            step="0.01"
                            value={productForm.unit_price}
                            onChange={(e) => setProductForm({ ...productForm, unit_price: e.target.value })}
                            placeholder="45.00"
                            required
                        />
                    </div>
                    <Input
                        label="Kategori"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        placeholder="Örn: Peynir"
                    />
                </form>
            </Modal>

            {/* Add Transfer Modal */}
            <Modal
                isOpen={showAddTransferModal}
                onClose={() => setShowAddTransferModal(false)}
                title="Yeni Transfer Oluştur"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowAddTransferModal(false)}>İptal</Button>
                        <Button onClick={handleAddTransfer}>Oluştur</Button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <Select
                        label="Ürün"
                        value={transferForm.product_id}
                        onChange={(value) => setTransferForm({ ...transferForm, product_id: value })}
                        options={products.map(p => ({ value: p.id, label: p.name }))}
                        placeholder="Ürün seçiniz"
                    />
                    <Select
                        label="Hedef Bölge"
                        value={transferForm.target_region_id}
                        onChange={(value) => setTransferForm({ ...transferForm, target_region_id: value })}
                        options={regions.map(r => ({ value: r.id, label: r.name }))}
                        placeholder="Bölge seçiniz"
                    />
                    <Input
                        label="Miktar"
                        type="number"
                        value={transferForm.quantity}
                        onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                        placeholder="Örn: 50"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Sürücü Adı"
                            value={transferForm.driver_name}
                            onChange={(e) => setTransferForm({ ...transferForm, driver_name: e.target.value })}
                            placeholder="Örn: Ahmet Yılmaz"
                        />
                        <Input
                            label="Araç Plakası"
                            value={transferForm.vehicle_plate}
                            onChange={(e) => setTransferForm({ ...transferForm, vehicle_plate: e.target.value })}
                            placeholder="Örn: 34 ABC 123"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Logistics;
