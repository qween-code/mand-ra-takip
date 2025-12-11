import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    ShoppingCart,
    RotateCcw,
    Package,
    Loader2,
    Plus
} from 'lucide-react';
import { clsx } from 'clsx';

interface Product {
    id: string;
    name: string;
    stock_quantity: number;
    unit_price: number;
}

interface Sale {
    id: string;
    customer_name: string;
    total_amount: number;
    created_at: string;
}

const Logistics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'returns'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);

    // Forms
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductStock, setNewProductStock] = useState('');

    useEffect(() => {
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'sales') fetchSales();
    }, [activeTab]);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase.from('products').select('*');
        setProducts(data || []);
        setLoading(false);
    };

    const fetchSales = async () => {
        setLoading(true);
        const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
        setSales(data || []);
        setLoading(false);
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('products').insert([{
            name: newProductName,
            unit_price: parseFloat(newProductPrice),
            stock_quantity: parseFloat(newProductStock),
        }]);

        if (!error) {
            setNewProductName('');
            setNewProductPrice('');
            setNewProductStock('');
            fetchProducts();
            alert('Ürün eklendi');
        }
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Lojistik ve Satış
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Stok takibi, satışlar ve iade yönetimi.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'products', name: 'Ürünler & Stok', icon: Package },
                        { id: 'sales', name: 'Satışlar', icon: ShoppingCart },
                        { id: 'returns', name: 'İadeler', icon: RotateCcw },
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

                {!loading && activeTab === 'products' && (
                    <div className="space-y-6">
                        {/* Add Product Form */}
                        <div className="bg-white shadow sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Yeni Ürün Ekle</h3>
                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fiyat (₺)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProductStock}
                                        onChange={(e) => setNewProductStock(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                >
                                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                                    Ekle
                                </button>
                            </form>
                        </div>

                        {/* Product List */}
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                            <ul role="list" className="divide-y divide-gray-200">
                                {products.map((product) => (
                                    <li key={product.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                                        <Package className="h-6 w-6" />
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-base font-semibold leading-6 text-gray-900">{product.name}</h3>
                                                    <p className="text-sm text-gray-500">Birim Fiyat: ₺{product.unit_price}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">Stok: {product.stock_quantity}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'sales' && (
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Satış Modülü</h3>
                            <p className="mt-1 text-sm text-gray-500">Satış kayıtları burada listelenecek.</p>
                            {/* Placeholder for Sales List */}
                            <ul className="mt-4 divide-y divide-gray-200 text-left">
                                {sales.map((sale) => (
                                    <li key={sale.id} className="py-4">
                                        <div className="flex justify-between">
                                            <span>{sale.customer_name}</span>
                                            <span className="font-bold">₺{sale.total_amount}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'returns' && (
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                            <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">İade Yönetimi</h3>
                            <p className="mt-1 text-sm text-gray-500">İade talepleri ve nedenleri burada yönetilecek.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logistics;
