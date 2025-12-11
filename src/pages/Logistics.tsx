import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import {
    ShoppingCart,
    Loader2,
    Plus,
    MapPin,
    Store,
    Truck,
    ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Region = Database['public']['Tables']['regions']['Row'];
type SalesPoint = Database['public']['Tables']['sales_points']['Row'];
type ProductTransfer = Database['public']['Tables']['product_transfers']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Sale = Database['public']['Tables']['sales']['Row'];

const Logistics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'regions' | 'transfers' | 'sales'>('regions');
    const [loading, setLoading] = useState(false);

    // Data State
    const [regions, setRegions] = useState<(Region & { sales_points: SalesPoint[] })[]>([]);
    const [transfers, setTransfers] = useState<(ProductTransfer & { products: Product | null, regions_source: Region | null, regions_target: Region | null, sales_points: SalesPoint | null })[]>([]);
    const [sales, setSales] = useState<(Sale & { sales_points: SalesPoint | null })[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Modal State
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Form State
    const [newTransfer, setNewTransfer] = useState<Partial<ProductTransfer>>({
        transfer_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        quantity: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'regions') fetchRegions();
        if (activeTab === 'transfers') fetchTransfers();
        if (activeTab === 'sales') fetchSales();
    }, [activeTab]);

    const fetchInitialData = async () => {
        const { data: productsData } = await supabase.from('products').select('*');
        setProducts(productsData || []);

        // Fetch regions for dropdowns regardless of tab
        const { data: regionsData } = await supabase.from('regions').select('*, sales_points(*)').order('name');
        // @ts-ignore
        setRegions(regionsData || []);
    };

    const fetchRegions = async () => {
        setLoading(true);
        // Already fetched in initial data, but good to refresh
        const { data, error } = await supabase
            .from('regions')
            .select('*, sales_points(*)')
            .order('name');

        if (error) console.error('Error fetching regions:', error);
        // @ts-ignore
        setRegions(data || []);
        setLoading(false);
    };

    const fetchTransfers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('product_transfers')
            .select(`
                *,
                products(*),
                regions_source:source_region_id(*),
                regions_target:target_region_id(*),
                sales_points:target_sales_point_id(*)
            `)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching transfers:', error);
        // @ts-ignore
        setTransfers(data || []);
        setLoading(false);
    };

    const fetchSales = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sales')
            .select('*, sales_points(*)')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching sales:', error);
        // @ts-ignore
        setSales(data || []);
        setLoading(false);
    };

    const handleAddTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('product_transfers')
                .insert([newTransfer as Database['public']['Tables']['product_transfers']['Insert']]);

            if (error) throw error;

            setShowTransferModal(false);
            setNewTransfer({
                transfer_date: new Date().toISOString().split('T')[0],
                status: 'pending',
                quantity: 0
            });
            fetchTransfers();
            alert('Transfer başarıyla oluşturuldu.');
        } catch (error) {
            console.error('Error adding transfer:', error);
            alert('Transfer eklenirken bir hata oluştu.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Lojistik ve Dağıtım
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Bölge yönetimi, dağıtım ve satış noktaları.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'regions', name: 'Bölgeler & Noktalar', icon: MapPin },
                        { id: 'transfers', name: 'Transferler', icon: Truck },
                        { id: 'sales', name: 'Satışlar', icon: ShoppingCart },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
                            )}
                        >
                            <tab.icon className={clsx(
                                activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                                '-ml-0.5 mr-2 h-5 w-5'
                            )} />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="mt-6">
                {loading && <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto" />}

                {!loading && activeTab === 'regions' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {regions.map((region) => (
                            <div key={region.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                        <MapPin className="mr-2 h-5 w-5 text-indigo-500" />
                                        {region.name}
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {region.description}
                                    </p>
                                </div>
                                <div className="px-4 py-4 sm:p-6">
                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Satış Noktaları</h4>
                                    <ul className="space-y-3">
                                        {region.sales_points && region.sales_points.length > 0 ? (
                                            region.sales_points.map((point) => (
                                                <li key={point.id} className="flex items-start">
                                                    <Store className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{point.name}</p>
                                                        <p className="text-xs text-gray-500">{point.type} • {point.contact_info}</p>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-500 italic">Satış noktası bulunmuyor.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && activeTab === 'transfers' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowTransferModal(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
                            >
                                <Plus size={20} className="mr-2" />
                                Yeni Transfer
                            </button>
                        </div>

                        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                            <ul className="divide-y divide-gray-200">
                                {transfers.length === 0 ? (
                                    <li className="px-6 py-4 text-center text-gray-500">Henüz transfer kaydı yok.</li>
                                ) : (
                                    transfers.map((transfer) => (
                                        <li key={transfer.id} className="px-6 py-4 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                            <Truck className="h-5 w-5 text-indigo-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {transfer.products?.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <span>{transfer.regions_source?.name || 'Merkez'}</span>
                                                            <ArrowRight className="h-3 w-3 mx-2" />
                                                            <span>{transfer.regions_target?.name}</span>
                                                            {transfer.sales_points && (
                                                                <>
                                                                    <span className="mx-1">/</span>
                                                                    <span>{transfer.sales_points.name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transfer.quantity} Adet
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {format(new Date(transfer.transfer_date), 'dd MMM yyyy', { locale: tr })}
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                                                        ${transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {transfer.status === 'completed' ? 'Tamamlandı' :
                                                            transfer.status === 'pending' ? 'Yolda' : transfer.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'sales' && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satış Noktası</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Satış kaydı bulunamadı.</td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(sale.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {sale.sales_points?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {sale.customer_name || 'Genel Müşteri'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                                ₺{sale.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${sale.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        sale.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {sale.payment_status === 'completed' ? 'Ödendi' :
                                                        sale.payment_status === 'pending' ? 'Bekliyor' : 'İptal'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Yeni Transfer Oluştur</h2>
                        <form onSubmit={handleAddTransfer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ürün</label>
                                <select
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTransfer.product_id || ''}
                                    onChange={e => setNewTransfer({ ...newTransfer, product_id: e.target.value })}
                                >
                                    <option value="">Ürün Seçiniz</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kaynak Bölge</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTransfer.source_region_id || ''}
                                    onChange={e => setNewTransfer({ ...newTransfer, source_region_id: e.target.value })}
                                >
                                    <option value="">Merkez Depo</option>
                                    {regions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hedef Bölge</label>
                                <select
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTransfer.target_region_id || ''}
                                    onChange={e => setNewTransfer({ ...newTransfer, target_region_id: e.target.value, target_sales_point_id: null })}
                                >
                                    <option value="">Bölge Seçiniz</option>
                                    {regions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            {newTransfer.target_region_id && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hedef Satış Noktası (Opsiyonel)</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newTransfer.target_sales_point_id || ''}
                                        onChange={e => setNewTransfer({ ...newTransfer, target_sales_point_id: e.target.value })}
                                    >
                                        <option value="">Bölge Deposu</option>
                                        {regions.find(r => r.id === newTransfer.target_region_id)?.sales_points.map(sp => (
                                            <option key={sp.id} value={sp.id}>{sp.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Miktar</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTransfer.quantity || ''}
                                    onChange={e => setNewTransfer({ ...newTransfer, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transfer Tarihi</label>
                                <input
                                    type="date"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTransfer.transfer_date || ''}
                                    onChange={e => setNewTransfer({ ...newTransfer, transfer_date: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Logistics;
