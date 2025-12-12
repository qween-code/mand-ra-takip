import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Button, Input, Select, Modal, Table } from '../components/ui';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type BreedingRecord = Database['public']['Tables']['breeding_records']['Row'] & {
    animals: { tag_number: string; name: string | null } | null
};
type Animal = Database['public']['Tables']['animals']['Row'];

const Breeding: React.FC = () => {
    const [records, setRecords] = useState<BreedingRecord[]>([]);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        animal_id: '',
        type: 'insemination',
        date: format(new Date(), 'yyyy-MM-dd'),
        technician: '',
        cost: '',
        details: '', // JSON string or simple text for now, maybe parsed later
        notes: ''
    });

    useEffect(() => {
        fetchRecords();
        fetchAnimals();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('breeding_records')
                .select('*, animals(tag_number, name)')
                .order('date', { ascending: false });

            if (error) throw error;
            setRecords(data as any || []);
        } catch (error) {
            console.error('Error fetching breeding records:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnimals = async () => {
        try {
            const { data } = await supabase
                .from('animals')
                .select('*')
                .eq('gender', 'female') // Only females for breeding usually
                .eq('status', 'active');
            setAnimals(data || []);
        } catch (error) {
            console.error('Error fetching animals:', error);
        }
    };

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('breeding_records').insert([{
                animal_id: formData.animal_id,
                type: formData.type as any,
                date: formData.date,
                technician: formData.technician || null,
                cost: formData.cost ? parseFloat(formData.cost) : null,
                details: formData.notes ? { notes: formData.notes } : null,
            }]);

            if (error) throw error;

            setShowAddModal(false);
            setFormData({
                animal_id: '',
                type: 'insemination',
                date: format(new Date(), 'yyyy-MM-dd'),
                technician: '',
                cost: '',
                details: '',
                notes: ''
            });
            fetchRecords();
        } catch (error) {
            console.error('Error adding breeding record:', error);
            alert('Kayıt eklenirken bir hata oluştu');
        }
    };

    const columns = [
        {
            key: 'date',
            header: 'Tarih',
            render: (record: BreedingRecord) => format(new Date(record.date), 'd MMM yyyy', { locale: tr }),
        },
        {
            key: 'animal',
            header: 'Hayvan',
            render: (record: BreedingRecord) => (
                <div>
                    <span className="font-semibold text-gray-900">{record.animals?.tag_number}</span>
                    {record.animals?.name && <span className="text-gray-500 ml-2">({record.animals.name})</span>}
                </div>
            ),
        },
        {
            key: 'type',
            header: 'İşlem',
            render: (record: BreedingRecord) => {
                const labels: Record<string, string> = {
                    insemination: 'Tohumlama',
                    pregnancy_check: 'Gebelik Kontrolü',
                    dry_off: 'Kuruya Alma',
                    calving: 'Doğum',
                    abortion: 'Düşük'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.type === 'calving' ? 'bg-green-100 text-green-700' :
                        record.type === 'abortion' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {labels[record.type] || record.type}
                    </span>
                );
            },
        },
        {
            key: 'technician',
            header: 'Teknisyen',
            render: (record: BreedingRecord) => record.technician || '-',
        },
        {
            key: 'cost',
            header: 'Maliyet',
            render: (record: BreedingRecord) => record.cost ? `${record.cost} TL` : '-',
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Üreme Yönetimi</h1>
                    <p className="text-gray-500 mt-1">Tohumlama, gebelik ve doğum takibi</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={20} className="mr-2" />
                    Yeni Kayıt
                </Button>
            </div>

            {/* Stats Cards could go here */}

            <Table
                data={records}
                columns={columns}
                keyExtractor={(r) => r.id}
                loading={loading}
                emptyMessage="Henüz üreme kaydı yok"
            />

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Yeni Üreme Kaydı"
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>İptal</Button>
                        <Button onClick={handleAddRecord}>Kaydet</Button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <Select
                        label="Hayvan"
                        value={formData.animal_id}
                        onChange={(value) => setFormData({ ...formData, animal_id: value })}
                        options={animals.map(a => ({
                            value: a.id,
                            label: `${a.tag_number} ${a.name ? `(${a.name})` : ''}`
                        }))}
                        required
                        placeholder="Hayvan Seçin"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="İşlem Tipi"
                            value={formData.type}
                            onChange={(value) => setFormData({ ...formData, type: value })}
                            options={[
                                { value: 'insemination', label: 'Tohumlama' },
                                { value: 'pregnancy_check', label: 'Gebelik Kontrolü' },
                                { value: 'dry_off', label: 'Kuruya Alma' },
                                { value: 'calving', label: 'Doğum' },
                                { value: 'abortion', label: 'Düşük' },
                            ]}
                        />
                        <Input
                            label="Tarih"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Teknisyen / Veteriner"
                            value={formData.technician}
                            onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                            placeholder="Örn: Ahmet Vet"
                        />
                        <Input
                            label="Maliyet (TL)"
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Notlar"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Ek detaylar..."
                    />
                </form>
            </Modal>
        </div>
    );
};

export default Breeding;
