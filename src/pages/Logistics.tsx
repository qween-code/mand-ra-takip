import React, { useState, useEffect } from 'react';
import { Truck, Map, Building2, Save, Calendar, ChevronDown, ChevronUp, Plus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Types
interface FarmerCollection {
    id: string;
    farmerId: string;
    name: string;
    amount: number;
    temperature: number;
    qualityOk: boolean;
    collected: boolean;
}

interface Seller {
    id: string;
    name: string;
    distributed: number;
    returned: number;
}

interface Region {
    id: string;
    name: string;
    sellers: Seller[];
}

const Logistics = () => {
    const [activeTab, setActiveTab] = useState<'collection' | 'distribution' | 'factory'>('collection');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    // Collection State
    const [collections, setCollections] = useState<FarmerCollection[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Distribution State
    const [regions, setRegions] = useState<Region[]>([]);
    const [expandedRegions, setExpandedRegions] = useState<string[]>([]);

    // Factory State
    const [factoryShipment, setFactoryShipment] = useState({
        plate: '',
        driver: '',
        amount: '',
        ph: '',
        fat: '',
        temperature: ''
    });

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchCollections(), fetchDistributions()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        // Fetch farmers
        const { data: farmers } = await supabase.from('farmers').select('*');
        if (!farmers) return;

        // Fetch today's collections
        const { data: records } = await supabase
            .from('milk_collections')
            .select('*')
            .eq('date', date);

        const merged: FarmerCollection[] = farmers.map(farmer => {
            const record = records?.find(r => r.farmer_id === farmer.id);
            return {
                id: record?.id || `temp-${farmer.id}`,
                farmerId: farmer.id,
                name: farmer.name,
                amount: record?.amount || 0,
                temperature: record?.temperature || 0,
                qualityOk: record?.quality_ok ?? true,
                collected: !!record
            };
        });

        setCollections(merged);
    };

    const fetchDistributions = async () => {
        // Fetch regions and sales points
        const { data: regionsData } = await supabase.from('regions').select('*');
        const { data: salesPoints } = await supabase.from('sales_points').select('*');

        if (!regionsData || !salesPoints) return;

        // Fetch today's distributions
        const { data: distributions } = await supabase
            .from('daily_distributions')
            .select('*')
            .eq('date', date);

        const mergedRegions: Region[] = regionsData.map(region => {
            const regionSellers = salesPoints.filter(sp => sp.region_id === region.id);

            const sellers: Seller[] = regionSellers.map(sp => {
                const dist = distributions?.find(d => d.sales_point_id === sp.id);
                return {
                    id: sp.id,
                    name: sp.name,
                    distributed: dist?.distributed_amount || 0,
                    returned: dist?.returned_amount || 0
                };
            });

            return {
                id: region.id,
                name: region.name,
                sellers
            };
        });

        setRegions(mergedRegions);
        // Expand all by default
        setExpandedRegions(mergedRegions.map(r => r.id));
    };

    // Collection Handlers
    const handleCollectionChange = (farmerId: string, field: keyof FarmerCollection, value: any) => {
        setCollections(prev => prev.map(c =>
            c.farmerId === farmerId ? { ...c, [field]: value } : c
        ));
    };

    const saveCollection = async (farmerId: string) => {
        const collection = collections.find(c => c.farmerId === farmerId);
        if (!collection) return;

        const payload = {
            farmer_id: farmerId,
            date: date,
            amount: Number(collection.amount),
            temperature: Number(collection.temperature),
            quality_ok: collection.qualityOk,
            collected_at: new Date().toISOString()
        };

        // Check if exists by farmer_id and date (using upsert logic manually or via ID if we had it)
        // Since we generated temp IDs, we should query by farmer_id + date or use upsert with constraint

        const { error } = await supabase
            .from('milk_collections')
            .upsert(payload, { onConflict: 'farmer_id,date' });

        if (error) {
            console.error('Error saving collection:', error);
            alert('Kayıt başarısız');
        } else {
            // Refresh to get real IDs
            fetchCollections();
        }
    };

    // Distribution Handlers
    const toggleRegion = (id: string) => {
        setExpandedRegions(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleDistributionChange = (regionId: string, sellerId: string, field: 'distributed' | 'returned', value: number) => {
        setRegions(prev => prev.map(region => {
            if (region.id !== regionId) return region;
            return {
                ...region,
                sellers: region.sellers.map(seller =>
                    seller.id === sellerId ? { ...seller, [field]: value } : seller
                )
            };
        }));
    };

    const saveDistribution = async (sellerId: string, distributed: number, returned: number) => {
        const payload = {
            sales_point_id: sellerId,
            date: date,
            distributed_amount: distributed,
            returned_amount: returned
        };

        const { error } = await supabase
            .from('daily_distributions')
            .upsert(payload, { onConflict: 'sales_point_id,date' });

        if (error) {
            console.error('Error saving distribution:', error);
            alert('Kayıt başarısız');
        }
    };

    // Factory Handlers
    const handleFactorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save to product_transfers as a shipment
        const { error } = await supabase.from('product_transfers').insert({
            date: date,
            source_type: 'warehouse', // Assuming from warehouse
            target_type: 'factory',
            vehicle_plate: factoryShipment.plate,
            driver_name: factoryShipment.driver,
            quantity: Number(factoryShipment.amount),
            product_id: '00000000-0000-0000-0000-000000000000', // Needs a valid product ID, using placeholder or we need to look up 'Raw Milk'
            // For now, we'll just log it as we might not have a 'Raw Milk' product in products table
            status: 'pending'
        });

        if (error) {
            console.error('Error saving factory shipment:', error);
            alert('Kayıt başarısız: ' + error.message);
        } else {
            alert('Fabrika çıkışı kaydedildi');
            setFactoryShipment({ plate: '', driver: '', amount: '', ph: '', fat: '', temperature: '' });
        }
    };

    // Calculations
    const totalCollection = collections.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const totalDistributed = regions.reduce((sum, r) => sum + r.sellers.reduce((s, seller) => s + Number(seller.distributed || 0), 0), 0);
    const totalReturned = regions.reduce((sum, r) => sum + r.sellers.reduce((s, seller) => s + Number(seller.returned || 0), 0), 0);

    if (loading) return <div className="p-6">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lojistik Yönetimi</h1>
                    <p className="text-gray-500">Süt toplama ve dağıtım operasyonları</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('collection')}
                    className={`pb-4 px-4 font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'collection' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Truck className="w-5 h-5" />
                    Süt Toplama
                    {activeTab === 'collection' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('distribution')}
                    className={`pb-4 px-4 font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'distribution' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Map className="w-5 h-5" />
                    Bölge Dağıtımı
                    {activeTab === 'distribution' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('factory')}
                    className={`pb-4 px-4 font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'factory' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Building2 className="w-5 h-5" />
                    Fabrika
                    {activeTab === 'factory' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'collection' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-900">Müstahsil Listesi</h2>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Müstahsil ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müstahsil</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar (L)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıcaklık (°C)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalite</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {collections
                                            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((collection) => (
                                                <tr key={collection.farmerId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{collection.name}</td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={collection.amount || ''}
                                                            onChange={(e) => handleCollectionChange(collection.farmerId, 'amount', e.target.value)}
                                                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={collection.temperature || ''}
                                                            onChange={(e) => handleCollectionChange(collection.farmerId, 'temperature', e.target.value)}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleCollectionChange(collection.farmerId, 'qualityOk', !collection.qualityOk)}
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${collection.qualityOk
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {collection.qualityOk ? 'Uygun' : 'Red'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => saveCollection(collection.farmerId)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Save className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'distribution' && (
                        <div className="space-y-4">
                            {regions.map((region) => (
                                <div key={region.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleRegion(region.id)}
                                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Map className="w-5 h-5 text-gray-400" />
                                            <span className="font-semibold text-gray-900">{region.name}</span>
                                            <span className="text-sm text-gray-500">({region.sellers.length} Nokta)</span>
                                        </div>
                                        {expandedRegions.includes(region.id) ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>

                                    {expandedRegions.includes(region.id) && (
                                        <div className="p-4">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <th className="pb-3">Satış Noktası</th>
                                                        <th className="pb-3">Verilen (L)</th>
                                                        <th className="pb-3">İade (L)</th>
                                                        <th className="pb-3">Net (L)</th>
                                                        <th className="pb-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {region.sellers.map((seller) => (
                                                        <tr key={seller.id}>
                                                            <td className="py-3 text-sm text-gray-900">{seller.name}</td>
                                                            <td className="py-3">
                                                                <input
                                                                    type="number"
                                                                    value={seller.distributed || ''}
                                                                    onChange={(e) => handleDistributionChange(region.id, seller.id, 'distributed', Number(e.target.value))}
                                                                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="py-3">
                                                                <input
                                                                    type="number"
                                                                    value={seller.returned || ''}
                                                                    onChange={(e) => handleDistributionChange(region.id, seller.id, 'returned', Number(e.target.value))}
                                                                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="py-3 text-sm font-medium text-gray-900">
                                                                {(seller.distributed || 0) - (seller.returned || 0)}
                                                            </td>
                                                            <td className="py-3 text-right">
                                                                <button
                                                                    onClick={() => saveDistribution(seller.id, seller.distributed, seller.returned)}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'factory' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Fabrika Çıkış Formu</h2>
                            <form onSubmit={handleFactorySubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Araç Plakası</label>
                                        <input
                                            type="text"
                                            value={factoryShipment.plate}
                                            onChange={(e) => setFactoryShipment({ ...factoryShipment, plate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Şoför Adı</label>
                                        <input
                                            type="text"
                                            value={factoryShipment.driver}
                                            onChange={(e) => setFactoryShipment({ ...factoryShipment, driver: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Miktar (L)</label>
                                        <input
                                            type="number"
                                            value={factoryShipment.amount}
                                            onChange={(e) => setFactoryShipment({ ...factoryShipment, amount: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PH Değeri</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={factoryShipment.ph}
                                            onChange={(e) => setFactoryShipment({ ...factoryShipment, ph: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yağ Oranı (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={factoryShipment.fat}
                                            onChange={(e) => setFactoryShipment({ ...factoryShipment, fat: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sıcaklık (°C)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={factoryShipment.temperature}
                                            onChange={(e) => setFactoryShipment({ ...factoryShipment, temperature: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Günlük Özet</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-blue-700">Toplam Toplanan</span>
                                <span className="font-bold text-blue-900">{totalCollection} L</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-green-700">Toplam Dağıtılan</span>
                                <span className="font-bold text-green-900">{totalDistributed} L</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-red-700">Toplam İade</span>
                                <span className="font-bold text-red-900">{totalReturned} L</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                <span className="font-medium text-gray-900">Net Satış</span>
                                <span className="font-bold text-gray-900">{totalDistributed - totalReturned} L</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="font-semibold mb-2">Hızlı İşlemler</h3>
                        <p className="text-blue-100 text-sm mb-4">
                            Yeni müstahsil veya satış noktası eklemek için yönetim panelini kullanın.
                        </p>
                        <button className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            Yeni Kayıt Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logistics;
