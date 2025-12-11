import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Card, Button, Input, Select, Modal, Table, StatusBadge } from '../components/ui';
import { Beef, Plus, Search, Eye, Heart, Utensils, Milk } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Animal = Database['public']['Tables']['animals']['Row'];
type HealthRecord = Database['public']['Tables']['health_records']['Row'];
type FeedLog = Database['public']['Tables']['feed_logs']['Row'];
type MilkRecord = Database['public']['Tables']['milk_records']['Row'];

const Animals: React.FC = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [detailTab, setDetailTab] = useState<'health' | 'feed' | 'milk'>('health');

    // Detail data
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
    const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        tag_number: '',
        name: '',
        type: 'cow',
        gender: 'female',
        birth_date: '',
        notes: '',
    });

    useEffect(() => {
        fetchAnimals();
    }, []);

    useEffect(() => {
        if (selectedAnimal) {
            fetchAnimalDetails(selectedAnimal.id);
        }
    }, [selectedAnimal, detailTab]);

    const fetchAnimals = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('animals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnimals(data || []);
        } catch (error) {
            console.error('Error fetching animals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnimalDetails = async (animalId: string) => {
        try {
            if (detailTab === 'health') {
                const { data } = await supabase
                    .from('health_records')
                    .select('*')
                    .eq('animal_id', animalId)
                    .order('date', { ascending: false });
                setHealthRecords(data || []);
            } else if (detailTab === 'feed') {
                const { data } = await supabase
                    .from('feed_logs')
                    .select('*')
                    .eq('animal_id', animalId)
                    .order('date', { ascending: false });
                setFeedLogs(data || []);
            } else if (detailTab === 'milk') {
                const { data } = await supabase
                    .from('milk_records')
                    .select('*')
                    .eq('animal_id', animalId)
                    .order('date', { ascending: false });
                setMilkRecords(data || []);
            }
        } catch (error) {
            console.error('Error fetching animal details:', error);
        }
    };

    const handleAddAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('animals').insert([{
                tag_number: formData.tag_number,
                name: formData.name || null,
                type: formData.type,
                gender: formData.gender,
                birth_date: formData.birth_date || null,
                notes: formData.notes || null,
                status: 'active',
            }]);

            if (error) throw error;

            setShowAddModal(false);
            setFormData({ tag_number: '', name: '', type: 'cow', gender: 'female', birth_date: '', notes: '' });
            fetchAnimals();
        } catch (error) {
            console.error('Error adding animal:', error);
            alert('Hayvan eklenirken bir hata oluştu');
        }
    };

    const filteredAnimals = animals.filter(animal => {
        const matchesSearch = animal.tag_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesType = !filterType || animal.type === filterType;
        return matchesSearch && matchesType;
    });

    const animalTypeLabel = (type: string) => {
        const types: Record<string, string> = { cow: 'İnek', calf: 'Buzağı', bull: 'Boğa' };
        return types[type] || type;
    };

    const columns = [
        {
            key: 'tag_number',
            header: 'Küpe No',
            render: (animal: Animal) => (
                <span className="font-semibold text-gray-900">{animal.tag_number}</span>
            ),
        },
        {
            key: 'name',
            header: 'İsim',
            render: (animal: Animal) => animal.name || <span className="text-gray-400">-</span>,
        },
        {
            key: 'type',
            header: 'Tür',
            render: (animal: Animal) => animalTypeLabel(animal.type),
        },
        {
            key: 'gender',
            header: 'Cinsiyet',
            render: (animal: Animal) => animal.gender === 'female' ? 'Dişi' : 'Erkek',
        },
        {
            key: 'status',
            header: 'Durum',
            render: (animal: Animal) => <StatusBadge status={animal.status || 'active'} />,
        },
        {
            key: 'actions',
            header: '',
            render: (animal: Animal) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedAnimal(animal)}>
                    <Eye size={16} className="mr-1" />
                    Detay
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hayvanlar</h1>
                    <p className="text-gray-500 mt-1">Sürü yönetimi ve takibi</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={20} className="mr-2" />
                    Yeni Hayvan
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Küpe no veya isim ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        />
                    </div>
                    <Select
                        value={filterType}
                        onChange={setFilterType}
                        options={[
                            { value: 'cow', label: 'İnekler' },
                            { value: 'calf', label: 'Buzağılar' },
                            { value: 'bull', label: 'Boğalar' },
                        ]}
                        placeholder="Tümü"
                    />
                </div>
            </Card>

            {/* Animals Table */}
            <Table
                data={filteredAnimals}
                columns={columns}
                keyExtractor={(animal) => animal.id}
                loading={loading}
                emptyMessage="Henüz hayvan kaydı yok"
            />

            {/* Add Animal Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Yeni Hayvan Ekle"
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>İptal</Button>
                        <Button onClick={handleAddAnimal}>Kaydet</Button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Küpe Numarası"
                            value={formData.tag_number}
                            onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })}
                            placeholder="TR12345678"
                            required
                        />
                        <Input
                            label="İsim (Opsiyonel)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Örn: Sarıkız"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Tür"
                            value={formData.type}
                            onChange={(value) => setFormData({ ...formData, type: value })}
                            options={[
                                { value: 'cow', label: 'İnek' },
                                { value: 'calf', label: 'Buzağı' },
                                { value: 'bull', label: 'Boğa' },
                            ]}
                        />
                        <Select
                            label="Cinsiyet"
                            value={formData.gender}
                            onChange={(value) => setFormData({ ...formData, gender: value })}
                            options={[
                                { value: 'female', label: 'Dişi' },
                                { value: 'male', label: 'Erkek' },
                            ]}
                        />
                    </div>
                    <Input
                        label="Doğum Tarihi"
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                    <Input
                        label="Notlar"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Ek bilgiler..."
                    />
                </form>
            </Modal>

            {/* Animal Detail Modal */}
            <Modal
                isOpen={!!selectedAnimal}
                onClose={() => setSelectedAnimal(null)}
                title={selectedAnimal ? `${selectedAnimal.tag_number} - ${selectedAnimal.name || 'İsimsiz'}` : ''}
                size="xl"
            >
                {selectedAnimal && (
                    <div className="space-y-6">
                        {/* Animal Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Beef size={32} className="text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-gray-900">{selectedAnimal.tag_number}</p>
                                <p className="text-gray-500">{animalTypeLabel(selectedAnimal.type)} • {selectedAnimal.gender === 'female' ? 'Dişi' : 'Erkek'}</p>
                            </div>
                            <StatusBadge status={selectedAnimal.status || 'active'} />
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {[
                                { id: 'health', label: 'Sağlık', icon: Heart },
                                { id: 'feed', label: 'Yem', icon: Utensils },
                                { id: 'milk', label: 'Süt', icon: Milk },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setDetailTab(tab.id as typeof detailTab)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${detailTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="max-h-64 overflow-y-auto">
                            {detailTab === 'health' && (
                                <div className="space-y-3">
                                    {healthRecords.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">Sağlık kaydı yok</p>
                                    ) : (
                                        healthRecords.map((record) => (
                                            <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                                                <p className="font-medium">{record.treatment_type}</p>
                                                <p className="text-sm text-gray-500">{format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}</p>
                                                {record.description && <p className="text-sm text-gray-600 mt-1">{record.description}</p>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {detailTab === 'feed' && (
                                <div className="space-y-3">
                                    {feedLogs.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">Yem kaydı yok</p>
                                    ) : (
                                        feedLogs.map((log) => (
                                            <div key={log.id} className="p-4 bg-gray-50 rounded-lg flex justify-between">
                                                <div>
                                                    <p className="font-medium">{log.feed_type}</p>
                                                    <p className="text-sm text-gray-500">{format(new Date(log.date), 'd MMMM yyyy', { locale: tr })}</p>
                                                </div>
                                                <p className="font-semibold">{log.quantity} kg</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {detailTab === 'milk' && (
                                <div className="space-y-3">
                                    {milkRecords.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">Süt kaydı yok</p>
                                    ) : (
                                        milkRecords.map((record) => (
                                            <div key={record.id} className="p-4 bg-gray-50 rounded-lg flex justify-between">
                                                <div>
                                                    <p className="font-medium">{record.shift === 'morning' ? 'Sabah' : 'Akşam'}</p>
                                                    <p className="text-sm text-gray-500">{format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}</p>
                                                </div>
                                                <p className="font-semibold text-indigo-600">{record.quantity_liters} L</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Animals;
