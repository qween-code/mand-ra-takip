import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Plus, Search, Filter, Activity, Syringe, Milk, X } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';

type Animal = Database['public']['Tables']['animals']['Row'];
type HealthRecord = Database['public']['Tables']['health_records']['Row'];
type FeedLog = Database['public']['Tables']['feed_logs']['Row'];
type MilkRecord = Database['public']['Tables']['milk_records']['Row'];

const Animals = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Detail Modal State
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [detailTab, setDetailTab] = useState<'health' | 'feed' | 'milk'>('health');
    const [animalDetails, setAnimalDetails] = useState<{
        health: HealthRecord[],
        feed: FeedLog[],
        milk: MilkRecord[]
    }>({ health: [], feed: [], milk: [] });
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Form state
    const [newAnimal, setNewAnimal] = useState<Partial<Animal>>({
        type: 'cow',
        gender: 'female',
        status: 'active'
    });

    useEffect(() => {
        fetchAnimals();
    }, []);

    useEffect(() => {
        if (selectedAnimal) {
            fetchAnimalDetails(selectedAnimal.id);
        }
    }, [selectedAnimal]);

    const fetchAnimals = async () => {
        try {
            const { data, error } = await supabase
                .from('animals')
                .select('*')
                .order('tag_number', { ascending: true });

            if (error) throw error;
            setAnimals(data || []);
        } catch (error) {
            console.error('Error fetching animals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnimalDetails = async (animalId: string) => {
        setLoadingDetails(true);
        try {
            const [healthRes, feedRes, milkRes] = await Promise.all([
                supabase.from('health_records').select('*').eq('animal_id', animalId).order('date', { ascending: false }),
                supabase.from('feed_logs').select('*').eq('animal_id', animalId).order('date', { ascending: false }),
                supabase.from('milk_records').select('*').eq('animal_id', animalId).order('date', { ascending: false })
            ]);

            setAnimalDetails({
                health: healthRes.data || [],
                feed: feedRes.data || [],
                milk: milkRes.data || []
            });
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleAddAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('animals')
                .insert([newAnimal as Database['public']['Tables']['animals']['Insert']]);

            if (error) throw error;

            setShowAddModal(false);
            setNewAnimal({ type: 'cow', gender: 'female', status: 'active' });
            fetchAnimals();
        } catch (error) {
            console.error('Error adding animal:', error);
            alert('Hayvan eklenirken bir hata oluştu.');
        }
    };

    const filteredAnimals = animals.filter(animal => {
        const matchesType = filterType === 'all' || animal.type === filterType;
        const matchesSearch = animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (animal.name && animal.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesType && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Hayvan Yönetimi</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Yeni Hayvan Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Küpe No veya İsim ile ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500" />
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tüm Hayvanlar</option>
                        <option value="cow">İnekler</option>
                        <option value="calf">Buzağılar</option>
                        <option value="bull">Boğalar</option>
                    </select>
                </div>
            </div>

            {/* Animals List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Küpe No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cinsiyet</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doğum Tarihi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Yükleniyor...</td>
                            </tr>
                        ) : filteredAnimals.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Kayıt bulunamadı.</td>
                            </tr>
                        ) : (
                            filteredAnimals.map((animal) => (
                                <tr key={animal.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAnimal(animal)}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{animal.tag_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{animal.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {animal.type === 'cow' ? 'İnek' : animal.type === 'calf' ? 'Buzağı' : 'Boğa'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {animal.gender === 'female' ? 'Dişi' : 'Erkek'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {animal.birth_date ? format(new Date(animal.birth_date), 'dd MMM yyyy', { locale: tr }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${animal.status === 'active' ? 'bg-green-100 text-green-800' :
                                                animal.status === 'sick' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {animal.status === 'active' ? 'Aktif' :
                                                animal.status === 'sick' ? 'Hasta' :
                                                    animal.status === 'sold' ? 'Satıldı' : 'Öldü'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedAnimal(animal); }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Detay
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Animal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Yeni Hayvan Ekle</h2>
                        <form onSubmit={handleAddAnimal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Küpe No</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newAnimal.tag_number || ''}
                                    onChange={e => setNewAnimal({ ...newAnimal, tag_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">İsim (Opsiyonel)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newAnimal.name || ''}
                                    onChange={e => setNewAnimal({ ...newAnimal, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tür</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newAnimal.type}
                                        onChange={e => setNewAnimal({ ...newAnimal, type: e.target.value })}
                                    >
                                        <option value="cow">İnek</option>
                                        <option value="calf">Buzağı</option>
                                        <option value="bull">Boğa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cinsiyet</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newAnimal.gender || 'female'}
                                        onChange={e => setNewAnimal({ ...newAnimal, gender: e.target.value as 'female' | 'male' })}
                                    >
                                        <option value="female">Dişi</option>
                                        <option value="male">Erkek</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newAnimal.birth_date || ''}
                                    onChange={e => setNewAnimal({ ...newAnimal, birth_date: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Animal Detail Modal */}
            {selectedAnimal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto py-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50 rounded-t-xl">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    {selectedAnimal.tag_number}
                                    <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                        {selectedAnimal.type === 'cow' ? 'İnek' : selectedAnimal.type === 'calf' ? 'Buzağı' : 'Boğa'}
                                    </span>
                                </h2>
                                <p className="text-gray-500 mt-1">{selectedAnimal.name || 'İsimsiz'}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAnimal(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 px-6">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { id: 'health', name: 'Sağlık Kayıtları', icon: Activity },
                                    { id: 'feed', name: 'Yem Tüketimi', icon: Syringe }, // Using Syringe as placeholder for Feed if needed, or maybe something else
                                    { id: 'milk', name: 'Süt Verimi', icon: Milk },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setDetailTab(tab.id as any)}
                                        className={clsx(
                                            detailTab === tab.id
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                            'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
                                        )}
                                    >
                                        <tab.icon className={clsx(
                                            detailTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                                            '-ml-0.5 mr-2 h-5 w-5'
                                        )} />
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingDetails ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <>
                                    {detailTab === 'health' && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">Geçmiş Tedaviler</h3>
                                                {/* Add Health Record Button Placeholder */}
                                            </div>
                                            {animalDetails.health.length === 0 ? (
                                                <p className="text-gray-500 text-center py-8">Kayıt bulunamadı.</p>
                                            ) : (
                                                <ul className="divide-y divide-gray-200">
                                                    {animalDetails.health.map((record) => (
                                                        <li key={record.id} className="py-4">
                                                            <div className="flex justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{record.treatment_type}</p>
                                                                    <p className="text-sm text-gray-500">{record.description}</p>
                                                                    <p className="text-xs text-gray-400 mt-1">Vet: {record.veterinarian || '-'}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-900">{format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}</p>
                                                                    <p className="text-sm font-medium text-red-600 mt-1">-{record.cost} ₺</p>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {detailTab === 'feed' && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Yem Tüketim Geçmişi</h3>
                                            {animalDetails.feed.length === 0 ? (
                                                <p className="text-gray-500 text-center py-8">Kayıt bulunamadı.</p>
                                            ) : (
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yem Tipi</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Miktar</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Maliyet</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {animalDetails.feed.map((log) => (
                                                            <tr key={log.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {format(new Date(log.date), 'dd MMM yyyy', { locale: tr })}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.feed_type}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{log.quantity} kg</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{log.cost} ₺</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}

                                    {detailTab === 'milk' && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Süt Verim Tablosu</h3>
                                            {animalDetails.milk.length === 0 ? (
                                                <p className="text-gray-500 text-center py-8">Kayıt bulunamadı.</p>
                                            ) : (
                                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vakit</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Miktar (L)</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Yağ %</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {animalDetails.milk.map((record) => (
                                                                <tr key={record.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {record.shift === 'morning' ? 'Sabah' : 'Akşam'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">
                                                                        {record.quantity_liters}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                                        {record.fat_rate || '-'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Animals;
