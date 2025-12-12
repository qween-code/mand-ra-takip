// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - CALVES PAGE
// Calf management
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Baby,
    Plus,
    Search,
    Heart,
    Syringe,
    Eye,
    Calendar,
    Tag,
    Milk
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, Button, Badge, Input, Select, Modal, cn } from '../components/ui';
import type { Calf, Cattle, HealthRecord, AnimalStatus } from '../types';

interface CalfWithDetails extends Calf {
    health_records?: HealthRecord[];
}

const statusLabels: Record<AnimalStatus, string> = {
    active: 'Aktif',
    sold: 'Satıldı',
    deceased: 'Öldü',
    sick: 'Hasta',
    quarantine: 'Karantina'
};

const statusColors: Record<AnimalStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    active: 'success',
    sold: 'default',
    deceased: 'error',
    sick: 'warning',
    quarantine: 'error'
};

const CalvesPage: React.FC = () => {
    const [calves, setCalves] = useState<CalfWithDetails[]>([]);
    const [cows, setCows] = useState<Cattle[]>([]); // For mother selection
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<AnimalStatus | 'all'>('all');
    const [selectedCalf, setSelectedCalf] = useState<CalfWithDetails | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        tag_number: '',
        name: '',
        gender: 'female' as 'male' | 'female',
        date_of_birth: '',
        breed: '',
        mother_id: '',
        birth_weight: '',
        status: 'active' as AnimalStatus,
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: calvesData, error: calvesError } = await supabase
                .from('calves')
                .select('*, mother:cattle!mother_id(name)')
                .order('created_at', { ascending: false });

            if (calvesError) throw calvesError;
            setCalves((calvesData as CalfWithDetails[]) || []);

            const { data: cowsData } = await supabase
                .from('cattle')
                .select('id, name, tag_number')
                .eq('gender', 'female');
            setCows((cowsData as Cattle[]) || []);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCalves = calves.filter((c) => {
        const matchesSearch =
            (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            c.tag_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAddCalf = async () => {
        try {
            const { error } = await supabase.from('calves').insert({
                tag_number: formData.tag_number,
                name: formData.name || null,
                gender: formData.gender,
                date_of_birth: formData.date_of_birth || null,
                breed: formData.breed || null,
                mother_id: formData.mother_id || null,
                birth_weight: formData.birth_weight ? parseFloat(formData.birth_weight) : null,
                status: formData.status,
                notes: formData.notes || null,
            });

            if (error) throw error;

            setShowAddModal(false);
            setFormData({
                tag_number: '',
                name: '',
                gender: 'female',
                date_of_birth: '',
                breed: '',
                mother_id: '',
                birth_weight: '',
                status: 'active',
                notes: '',
            });
            loadData();
        } catch (error) {
            console.error('Error adding calf:', error);
        }
    };

    const handleViewDetails = async (c: CalfWithDetails) => {
        // Load health records (assuming shared table or separate, PRD said separate but I can use generic logic if needed. I created separate tables)
        const { data: healthRecords } = await supabase
            .from('calf_health_records')
            .select('*')
            .eq('calf_id', c.id)
            .order('record_date', { ascending: false });

        setSelectedCalf({ ...c, health_records: (healthRecords as any[]) || [] });
        setShowDetailModal(true);
    };

    const getAge = (birthDate: string | null): string => {
        if (!birthDate) return 'Bilinmiyor';
        const birth = new Date(birthDate);
        const now = new Date();
        const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
        if (days < 30) return `${days} gün`;
        const months = Math.floor(days / 30);
        return `${months} ay`;
    };

    const stats = {
        total: calves.length,
        female: calves.filter((c) => c.gender === 'female').length,
        male: calves.filter((c) => c.gender === 'male').length,
        sick: calves.filter((c) => c.status === 'sick').length,
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="page-content">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Buzağı Yönetimi</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Buzağı takibi ve sağlık kayıtları</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} className="mr-2" />
                    Buzağı Ekle
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--primary-500)] mb-2">
                        <Baby size={18} />
                        <span className="text-sm font-medium">Toplam Buzağı</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--secondary-500)] mb-2">
                        <span className="text-sm font-medium">Dişi</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.female}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--info)] mb-2">
                        <span className="text-sm font-medium">Erkek</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.male}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--error)] mb-2">
                        <Heart size={18} />
                        <span className="text-sm font-medium">Hasta</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.sick}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Buzağı ara (isim veya kulak no)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={Search}
                    />
                </div>
                <Select
                    options={[
                        { value: 'all', label: 'Tüm Durumlar' },
                        { value: 'active', label: 'Aktif' },
                        { value: 'sick', label: 'Hasta' },
                        { value: 'sold', label: 'Satıldı' },
                    ]}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as AnimalStatus | 'all')}
                />
            </div>

            {/* List */}
            <Card>
                <div className="space-y-4">
                    {filteredCalves.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-secondary)]">Kayıt bulunamadı</div>
                    ) : (
                        filteredCalves.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                                onClick={() => handleViewDetails(c)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--warning-bg)] flex items-center justify-center text-[var(--warning)]">
                                        <Baby size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--text-primary)]">{c.name || c.tag_number}</span>
                                            <Badge variant={statusColors[c.status]}>{statusLabels[c.status]}</Badge>
                                            <Badge variant="default" className="text-xs">{c.gender === 'female' ? 'Dişi' : 'Erkek'}</Badge>
                                        </div>
                                        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1"><Tag size={12} />{c.tag_number}</span>
                                            {c.mother && <span className="flex items-center gap-1">Anne: {c.mother.name}</span>}
                                            <span className="flex items-center gap-1"><Calendar size={12} />{getAge(c.date_of_birth)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
                                    <Eye size={18} className="text-[var(--text-secondary)]" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Add Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Buzağı Ekle" size="md">
                <div className="space-y-4">
                    <Input label="Kulak Numarası *" placeholder="TR-XX-XXXX" value={formData.tag_number} onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })} />
                    <Input label="İsim" placeholder="Benekli" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Doğum Tarihi" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                        <Select label="Cinsiyet" options={[{ value: 'female', label: 'Dişi' }, { value: 'male', label: 'Erkek' }]} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })} />
                    </div>
                    <Select
                        label="Anne"
                        options={[{ value: '', label: 'Seçiniz...' }, ...cows.map(cow => ({ value: cow.id, label: `${cow.name || ''} (${cow.tag_number})` }))]}
                        value={formData.mother_id}
                        onChange={(e) => setFormData({ ...formData, mother_id: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Doğum Kilosu (kg)" type="number" value={formData.birth_weight} onChange={(e) => setFormData({ ...formData, birth_weight: e.target.value })} />
                        <Input label="Irk" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>İptal</Button>
                        <Button variant="primary" onClick={handleAddCalf}>Ekle</Button>
                    </div>
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedCalf?.name || 'Buzağı Detayı'} size="lg">
                {selectedCalf && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Kulak No</div><div className="font-medium">{selectedCalf.tag_number}</div></div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Anne</div><div className="font-medium">{selectedCalf.mother?.name || '-'}</div></div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Yaş</div><div className="font-medium">{getAge(selectedCalf.date_of_birth)}</div></div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Durum</div><div className="font-medium capitalize">{statusLabels[selectedCalf.status]}</div></div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><Syringe size={20} /> Sağlık Kayıtları</h4>
                            {selectedCalf.health_records?.length === 0 ? (
                                <div className="text-center py-4 text-[var(--text-secondary)]">Kayıt yok</div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedCalf.health_records?.map((rec) => (
                                        <div key={rec.id} className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium">{rec.diagnosis || rec.treatment}</span>
                                                <span className="text-sm text-[var(--text-muted)]">{format(new Date(rec.record_date), 'd MMM yyyy', { locale: tr })}</span>
                                            </div>
                                            {rec.notes && <p className="text-sm text-[var(--text-secondary)]">{rec.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end"><Button variant="secondary" onClick={() => setShowDetailModal(false)}>Kapat</Button></div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CalvesPage;
