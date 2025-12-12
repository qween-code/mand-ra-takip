// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - ANIMALS PAGE
// Animal management with cows, calves, health records
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Beef,
    Plus,
    Search,
    Filter,
    Heart,
    Syringe,
    Baby,
    Activity,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    X,
    Calendar,
    Scale,
    Tag
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, Button, Badge, Input, Select, Modal, Table, cn } from '../components/ui';
import type { Animal, HealthRecord, AnimalType, AnimalStatus } from '../types';

interface AnimalWithDetails {
    id: string;
    ear_tag: string;
    name: string | null;
    type: AnimalType;
    gender: 'male' | 'female';
    birth_date: string | null;
    breed: string | null;
    status: AnimalStatus;
    weight_kg: number | null;
    notes: string | null;
    mother?: { name: string } | null;
    health_records?: any[];
}

const statusLabels: Record<AnimalStatus, string> = {
    active: 'Aktif',
    sold: 'Satıldı',
    deceased: 'Öldü',
    sick: 'Hasta',
    dry: 'Kuru',
};

const statusColors: Record<AnimalStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    active: 'success',
    sold: 'default',
    deceased: 'error',
    sick: 'warning',
    dry: 'info',
};

const Animals: React.FC = () => {
    const [animals, setAnimals] = useState<AnimalWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<AnimalType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<AnimalStatus | 'all'>('all');
    const [selectedAnimal, setSelectedAnimal] = useState<AnimalWithDetails | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Form state for adding new animal
    const [formData, setFormData] = useState({
        ear_tag: '',
        name: '',
        type: 'cow' as AnimalType,
        gender: 'female' as 'male' | 'female',
        birth_date: '',
        breed: '',
        weight_kg: '',
        notes: '',
    });

    useEffect(() => {
        loadAnimals();
    }, []);

    const loadAnimals = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('animals')
                .select(`
          *,
          mother:animals!mother_id(name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnimals((data as AnimalWithDetails[]) || []);
        } catch (error) {
            console.error('Error loading animals:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAnimals = animals.filter((animal) => {
        const matchesSearch =
            animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            animal.ear_tag.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || animal.type === filterType;
        const matchesStatus = filterStatus === 'all' || animal.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleAddAnimal = async () => {
        try {
            const { error } = await supabase.from('animals').insert({
                ear_tag: formData.ear_tag,
                name: formData.name || null,
                type: formData.type,
                gender: formData.gender,
                birth_date: formData.birth_date || null,
                breed: formData.breed || null,
                weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
                notes: formData.notes || null,
                status: 'active',
            });

            if (error) throw error;

            setShowAddModal(false);
            setFormData({
                ear_tag: '',
                name: '',
                type: 'cow',
                gender: 'female',
                birth_date: '',
                breed: '',
                weight_kg: '',
                notes: '',
            });
            loadAnimals();
        } catch (error) {
            console.error('Error adding animal:', error);
        }
    };

    const handleViewDetails = async (animal: AnimalWithDetails) => {
        // Load health records for the animal
        const { data: healthRecords } = await supabase
            .from('health_records')
            .select('*')
            .eq('animal_id', animal.id)
            .order('date', { ascending: false });

        setSelectedAnimal({ ...animal, health_records: (healthRecords as any[]) || [] });
        setShowDetailModal(true);
    };

    const getAnimalAge = (birthDate: string | null): string => {
        if (!birthDate) return 'Bilinmiyor';
        const birth = new Date(birthDate);
        const now = new Date();
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (months < 12) return `${months} ay`;
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return remainingMonths > 0 ? `${years} yıl ${remainingMonths} ay` : `${years} yıl`;
    };

    const stats = {
        totalCows: animals.filter((a) => a.type === 'cow' && a.status === 'active').length,
        totalCalves: animals.filter((a) => a.type === 'calf' && a.status === 'active').length,
        totalBulls: animals.filter((a) => a.type === 'bull' && a.status === 'active').length,
        sickAnimals: animals.filter((a) => a.status === 'sick').length,
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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Hayvanlar</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Tüm hayvanlarınızı yönetin</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} className="mr-2" />
                    Hayvan Ekle
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--success)] mb-2">
                        <Beef size={18} />
                        <span className="text-sm font-medium">İnekler</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCows}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--warning)] mb-2">
                        <Baby size={18} />
                        <span className="text-sm font-medium">Buzağılar</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCalves}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--info)] mb-2">
                        <Beef size={18} />
                        <span className="text-sm font-medium">Boğalar</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalBulls}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--error)] mb-2">
                        <Heart size={18} />
                        <span className="text-sm font-medium">Hasta</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.sickAnimals}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Hayvan ara (isim veya kulak numarası)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={Search}
                    />
                </div>
                <Select
                    options={[
                        { value: 'all', label: 'Tüm Türler' },
                        { value: 'cow', label: 'İnekler' },
                        { value: 'calf', label: 'Buzağılar' },
                        { value: 'bull', label: 'Boğalar' },
                    ]}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as AnimalType | 'all')}
                />
                <Select
                    options={[
                        { value: 'all', label: 'Tüm Durumlar' },
                        { value: 'active', label: 'Aktif' },
                        { value: 'sick', label: 'Hasta' },
                        { value: 'dry', label: 'Kuru' },
                        { value: 'sold', label: 'Satıldı' },
                    ]}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as AnimalStatus | 'all')}
                />
            </div>

            {/* Animal List */}
            <Card>
                <div className="space-y-4">
                    {filteredAnimals.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-secondary)]">
                            Hayvan bulunamadı
                        </div>
                    ) : (
                        filteredAnimals.map((animal) => (
                            <div
                                key={animal.id}
                                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                                onClick={() => handleViewDetails(animal)}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            'w-12 h-12 rounded-full flex items-center justify-center',
                                            animal.type === 'cow' && 'bg-[var(--success-bg)]',
                                            animal.type === 'calf' && 'bg-[var(--warning-bg)]',
                                            animal.type === 'bull' && 'bg-[var(--info-bg)]'
                                        )}
                                    >
                                        <Beef
                                            size={24}
                                            className={cn(
                                                animal.type === 'cow' && 'text-[var(--success)]',
                                                animal.type === 'calf' && 'text-[var(--warning)]',
                                                animal.type === 'bull' && 'text-[var(--info)]'
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--text-primary)]">
                                                {animal.name || animal.ear_tag}
                                            </span>
                                            <Badge variant={statusColors[animal.status]}>
                                                {statusLabels[animal.status]}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Tag size={12} />
                                                {animal.ear_tag}
                                            </span>
                                            {animal.breed && (
                                                <span className="flex items-center gap-1">
                                                    {animal.breed}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {getAnimalAge(animal.birth_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {animal.type === 'calf' && animal.mother && (
                                        <span className="text-sm text-[var(--text-muted)]">
                                            Anne: {animal.mother.name}
                                        </span>
                                    )}
                                    <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
                                        <Eye size={18} className="text-[var(--text-secondary)]" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Add Animal Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Yeni Hayvan Ekle"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Kulak Numarası *"
                        placeholder="TR-34-XXX"
                        value={formData.ear_tag}
                        onChange={(e) => setFormData({ ...formData, ear_tag: e.target.value })}
                    />
                    <Input
                        label="İsim"
                        placeholder="Hayvan ismi"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Tür"
                            options={[
                                { value: 'cow', label: 'İnek' },
                                { value: 'calf', label: 'Buzağı' },
                                { value: 'bull', label: 'Boğa' },
                            ]}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as AnimalType })}
                        />
                        <Select
                            label="Cinsiyet"
                            options={[
                                { value: 'female', label: 'Dişi' },
                                { value: 'male', label: 'Erkek' },
                            ]}
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Doğum Tarihi"
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        />
                        <Input
                            label="Irk"
                            placeholder="Holstein, Simental..."
                            value={formData.breed}
                            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Ağırlık (kg)"
                        type="number"
                        placeholder="500"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            İptal
                        </Button>
                        <Button variant="primary" onClick={handleAddAnimal}>
                            Ekle
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Animal Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={selectedAnimal?.name || selectedAnimal?.ear_tag || 'Hayvan Detayı'}
                size="lg"
            >
                {selectedAnimal && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                                <div className="text-sm text-[var(--text-muted)] mb-1">Kulak No</div>
                                <div className="font-medium text-[var(--text-primary)]">{selectedAnimal.ear_tag}</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                                <div className="text-sm text-[var(--text-muted)] mb-1">Tür</div>
                                <div className="font-medium text-[var(--text-primary)] capitalize">{selectedAnimal.type}</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                                <div className="text-sm text-[var(--text-muted)] mb-1">Irk</div>
                                <div className="font-medium text-[var(--text-primary)]">{selectedAnimal.breed || '-'}</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                                <div className="text-sm text-[var(--text-muted)] mb-1">Yaş</div>
                                <div className="font-medium text-[var(--text-primary)]">{getAnimalAge(selectedAnimal.birth_date)}</div>
                            </div>
                        </div>

                        {/* Health Records */}
                        <div>
                            <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <Syringe size={20} className="text-[var(--primary-400)]" />
                                Sağlık Kayıtları
                            </h4>
                            {selectedAnimal.health_records && selectedAnimal.health_records.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedAnimal.health_records.map((record) => (
                                        <div key={record.id} className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant={record.record_type === 'vaccination' ? 'info' : 'warning'}>
                                                    {record.record_type === 'vaccination' ? 'Aşı' :
                                                        record.record_type === 'treatment' ? 'Tedavi' :
                                                            record.record_type === 'checkup' ? 'Kontrol' : record.record_type}
                                                </Badge>
                                                <span className="text-sm text-[var(--text-muted)]">
                                                    {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                                                </span>
                                            </div>
                                            {record.medication && (
                                                <p className="text-sm text-[var(--text-primary)]">
                                                    İlaç: {record.medication}
                                                </p>
                                            )}
                                            {record.notes && (
                                                <p className="text-sm text-[var(--text-secondary)] mt-1">{record.notes}</p>
                                            )}
                                            {record.vet_name && (
                                                <p className="text-xs text-[var(--text-muted)] mt-2">
                                                    Veteriner: {record.vet_name}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--text-secondary)]">
                                    Sağlık kaydı bulunamadı
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                                Kapat
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Animals;
