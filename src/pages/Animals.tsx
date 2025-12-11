import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Animal = Database['public']['Tables']['animals']['Row'];

const Animals = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [newAnimal, setNewAnimal] = useState<Partial<Animal>>({
        type: 'cow',
        gender: 'female',
        status: 'active'
    });

    useEffect(() => {
        fetchAnimals();
    }, []);

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
                                <tr key={animal.id} className="hover:bg-gray-50">
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
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Detay</button>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal size={20} />
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
        </div>
    );
};

export default Animals;
