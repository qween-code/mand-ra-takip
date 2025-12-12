// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - CATTLE PAGE
// Cattle management (Cows, Bulls)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Beef,
    Plus,
    Search,
    Heart,
    Syringe,
    Activity,
    Eye,
    Calendar,
    Tag,
    Droplets
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, Button, Badge, Input, Select, Modal, cn } from '../components/ui';
import type { Cattle, HealthRecord, AnimalStatus, LactationStatus } from '../types';

interface CattleWithDetails extends Cattle {
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

const lactationLabels: Record<LactationStatus, string> = {
    lactating: 'Sağmal',
    dry: 'Kuru'
};

const CattlePage: React.FC = () => {
    const [cattle, setCattle] = useState<CattleWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<AnimalStatus | 'all'>('all');
    const [filterLactation, setFilterLactation] = useState<LactationStatus | 'all'>('all');
    const [selectedCattle, setSelectedCattle] = useState<CattleWithDetails | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        tag_number: '',
        name: '',
        gender: 'female' as 'male' | 'female',
        date_of_birth: '',
        breed: '',
        weight: '',
        status: 'active' as AnimalStatus,
        lactation_status: 'lactating' as LactationStatus,
        notes: '',
    });

    useEffect(() => {
        loadCattle();
    }, []);

    const loadCattle = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cattle')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCattle((data as CattleWithDetails[]) || []);
        } catch (error) {
            console.error('Error loading cattle:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCattle = cattle.filter((c) => {
        const matchesSearch =
            (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            c.tag_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchesLactation = filterLactation === 'all' || c.lactation_status === filterLactation;
        return matchesSearch && matchesStatus && matchesLactation;
    });

    const handleAddCattle = async () => {
        try {
            const { error } = await supabase.from('cattle').insert({
                tag_number: formData.tag_number,
                name: formData.name || null,
                gender: formData.gender,
                date_of_birth: formData.date_of_birth || null,
                breed: formData.breed || null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                status: formData.status,
                lactation_status: formData.lactation_status,
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
                weight: '',
                status: 'active',
                lactation_status: 'lactating',
                notes: '',
            });
            loadCattle();
        } catch (error) {
            console.error('Error adding cattle:', error);
        }
    };

    const handleViewDetails = async (c: CattleWithDetails) => {
        // Load health records
        const { data: healthRecords } = await supabase
            .from('cattle_health_records')
            .select('*')
            .eq('cattle_id', c.id)
            .order('record_date', { ascending: false });

        setSelectedCattle({ ...c, health_records: (healthRecords as any[]) || [] });
        setShowDetailModal(true);
    };

    const getAge = (birthDate: string | null): string => {
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
        total: cattle.length,
        lactating: cattle.filter((c) => c.lactation_status === 'lactating' && c.status === 'active').length,
        dry: cattle.filter((c) => c.lactation_status === 'dry' && c.status === 'active').length,
        sick: cattle.filter((c) => c.status === 'sick').length,
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="page-content">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">İnek Yönetimi</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Sürü takibi ve sağlık kayıtları</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} className="mr-2" />
                    İnek Ekle
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--primary-500)] mb-2">
                        <Beef size={18} />
                        <span className="text-sm font-medium">Toplam Sürü</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--success)] mb-2">
                        <Droplets size={18} />
                        <span className="text-sm font-medium">Sağmal</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.lactating}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--warning)] mb-2">
                        <Activity size={18} />
                        <span className="text-sm font-medium">Kuru</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.dry}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--error)] mb-2">
                        <Heart size={18} />
                        <span className="text-sm font-medium">Hasta/Revir</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.sick}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="İnek ara (isim veya kulak no)..."
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
                        { value: 'quarantine', label: 'Karantina' },
                        { value: 'sold', label: 'Satıldı' },
                    ]}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as AnimalStatus | 'all')}
                />
                <Select
                    options={[
                        { value: 'all', label: 'Tümü (Sağmal/Kuru)' },
                        { value: 'lactating', label: 'Sağmal' },
                        { value: 'dry', label: 'Kuru' },
                    ]}
                    value={filterLactation}
                    onChange={(e) => setFilterLactation(e.target.value as LactationStatus | 'all')}
                />
            </div>

            {/* List */}
            <Card>
                <div className="space-y-4">
                    {filteredCattle.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-secondary)]">Kayıt bulunamadı</div>
                    ) : (
                        filteredCattle.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                                onClick={() => handleViewDetails(c)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary-100)] flex items-center justify-center text-[var(--primary-600)]">
                                        <Beef size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--text-primary)]">{c.name || c.tag_number}</span>
                                            <Badge variant={statusColors[c.status]}>{statusLabels[c.status]}</Badge>
                                            {c.status === 'active' && (
                                                <Badge variant={c.lactation_status === 'lactating' ? 'success' : 'warning'}>
                                                    {lactationLabels[c.lactation_status]}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1"><Tag size={12} />{c.tag_number}</span>
                                            {c.breed && <span className="flex items-center gap-1">{c.breed}</span>}
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
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni İnek Ekle" size="md">
                <div className="space-y-4">
                    <Input label="Kulak Numarası *" placeholder="TR-XX-XXXX" value={formData.tag_number} onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })} />
                    <Input label="İsim" placeholder="Sarıkız" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Doğum Tarihi" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                        <Input label="Irk" placeholder="Holstein" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Durum" options={[{ value: 'active', label: 'Aktif' }, { value: 'sick', label: 'Hasta' }, { value: 'quarantine', label: 'Karantina' }]} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as AnimalStatus })} />
                        <Select label="Laktasyon" options={[{ value: 'lactating', label: 'Sağmal' }, { value: 'dry', label: 'Kuru' }]} value={formData.lactation_status} onChange={(e) => setFormData({ ...formData, lactation_status: e.target.value as LactationStatus })} />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>İptal</Button>
                        <Button variant="primary" onClick={handleAddCattle}>Ekle</Button>
                    </div>
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedCattle?.name || 'İnek Detayı'} size="lg">
                {selectedCattle && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Kulak No</div><div className="font-medium">{selectedCattle.tag_number}</div></div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Irk</div><div className="font-medium">{selectedCattle.breed || '-'}</div></div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Yaş</div><div className="font-medium">{getAge(selectedCattle.date_of_birth)}</div></div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl"><div className="text-sm text-[var(--text-muted)]">Durum</div><div className="font-medium capitalize">{statusLabels[selectedCattle.status]}</div></div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><Syringe size={20} /> Sağlık Kayıtları</h4>
                            {selectedCattle.health_records?.length === 0 ? (
                                <div className="text-center py-4 text-[var(--text-secondary)]">Kayıt yok</div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedCattle.health_records?.map((rec) => (
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

export default CattlePage;
