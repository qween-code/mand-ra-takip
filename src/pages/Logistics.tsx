// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - LOGISTICS PAGE
// Distribution and shipment management
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Truck,
    Plus,
    Package,
    MapPin,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Navigation,
    Store
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, Button, Badge, Modal, Input, Select, cn } from '../components/ui';
import type { Shipment, Retailer, Region, ShipmentStatus } from '../types';

interface ShipmentWithDetails extends Shipment {
    retailer?: Retailer & { region?: Region };
}

const statusLabels: Record<ShipmentStatus, string> = {
    preparing: 'Hazırlanıyor',
    in_transit: 'Yolda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal',
};

const statusColors: Record<ShipmentStatus, 'info' | 'warning' | 'success' | 'error'> = {
    preparing: 'info',
    in_transit: 'warning',
    delivered: 'success',
    cancelled: 'error',
};

const Logistics: React.FC = () => {
    const [shipments, setShipments] = useState<ShipmentWithDetails[]>([]);
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<ShipmentWithDetails | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        retailer_id: '',
        driver_name: '',
        vehicle_plate: '',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load shipments with retailer info
            const { data: shipmentData } = await supabase
                .from('shipments')
                .select(`
          *,
          retailer:retailers(*, region:regions(*))
        `)
                .order('date', { ascending: false });

            setShipments(shipmentData || []);

            // Load retailers
            const { data: retailerData } = await supabase
                .from('retailers')
                .select('*')
                .eq('is_active', true);

            setRetailers(retailerData || []);

            // Load regions
            const { data: regionData } = await supabase
                .from('regions')
                .select('*')
                .eq('is_active', true);

            setRegions(regionData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShipment = async () => {
        try {
            const shipmentNumber = `SHP-${format(new Date(), 'yyyyMMdd')}-${Date.now().toString().slice(-4)}`;

            const { error } = await supabase.from('shipments').insert({
                shipment_number: shipmentNumber,
                date: format(new Date(), 'yyyy-MM-dd'),
                retailer_id: formData.retailer_id,
                driver_name: formData.driver_name || null,
                vehicle_plate: formData.vehicle_plate || null,
                status: 'preparing',
                notes: formData.notes || null,
            });

            if (error) throw error;

            setShowCreateModal(false);
            setFormData({ retailer_id: '', driver_name: '', vehicle_plate: '', notes: '' });
            loadData();
        } catch (error) {
            console.error('Error creating shipment:', error);
        }
    };

    const handleStatusChange = async (shipmentId: string, newStatus: ShipmentStatus) => {
        try {
            const updateData: Record<string, unknown> = { status: newStatus };

            if (newStatus === 'in_transit') {
                updateData.departure_time = new Date().toISOString();
            } else if (newStatus === 'delivered') {
                updateData.delivery_time = new Date().toISOString();
            }

            await supabase
                .from('shipments')
                .update(updateData)
                .eq('id', shipmentId);

            loadData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const stats = {
        total: shipments.length,
        preparing: shipments.filter(s => s.status === 'preparing').length,
        inTransit: shipments.filter(s => s.status === 'in_transit').length,
        delivered: shipments.filter(s => s.status === 'delivered').length,
    };

    const todayShipments = shipments.filter(
        s => s.date === format(new Date(), 'yyyy-MM-dd')
    );

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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dağıtım & Lojistik</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Sevkiyatları ve teslimatları yönetin</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
                    Yeni Sevkiyat
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--primary-400)] mb-2">
                        <Package size={18} />
                        <span className="text-sm font-medium">Toplam</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--info)] mb-2">
                        <Clock size={18} />
                        <span className="text-sm font-medium">Hazırlanıyor</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.preparing}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--warning)] mb-2">
                        <Truck size={18} />
                        <span className="text-sm font-medium">Yolda</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.inTransit}</div>
                </div>
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-2 text-[var(--success)] mb-2">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium">Teslim Edildi</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.delivered}</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Retailers */}
                <Card>
                    <CardHeader
                        title="Satış Noktaları"
                        subtitle={`${retailers.length} aktif nokta`}
                    />
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {retailers.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                Satış noktası bulunamadı
                            </div>
                        ) : (
                            retailers.map((retailer) => (
                                <div
                                    key={retailer.id}
                                    className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                                    onClick={() => {
                                        setFormData({ ...formData, retailer_id: retailer.id });
                                        setShowCreateModal(true);
                                    }}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                                        <Store size={18} className="text-[var(--text-secondary)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[var(--text-primary)] truncate">
                                            {retailer.name}
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] truncate">
                                            {retailer.address || retailer.contact_name || 'Adres yok'}
                                        </div>
                                    </div>
                                    <Badge variant="default">{retailer.type}</Badge>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Today's Shipments */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Bugünün Sevkiyatları"
                        subtitle={format(new Date(), 'd MMMM yyyy', { locale: tr })}
                    />
                    {todayShipments.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-secondary)]">
                            <Truck size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Bugün için sevkiyat yok</p>
                            <Button
                                variant="secondary"
                                className="mt-4"
                                icon={Plus}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Sevkiyat Oluştur
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todayShipments.map((shipment) => (
                                <div
                                    key={shipment.id}
                                    className="p-4 bg-[var(--bg-secondary)] rounded-xl"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                                shipment.status === 'preparing' && 'bg-[var(--info-bg)]',
                                                shipment.status === 'in_transit' && 'bg-[var(--warning-bg)]',
                                                shipment.status === 'delivered' && 'bg-[var(--success-bg)]',
                                            )}>
                                                <Truck
                                                    size={20}
                                                    className={cn(
                                                        shipment.status === 'preparing' && 'text-[var(--info)]',
                                                        shipment.status === 'in_transit' && 'text-[var(--warning)]',
                                                        shipment.status === 'delivered' && 'text-[var(--success)]',
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-[var(--text-primary)]">
                                                    {shipment.retailer?.name || 'Bilinmiyor'}
                                                </div>
                                                <div className="text-sm text-[var(--text-secondary)]">
                                                    {shipment.shipment_number}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={statusColors[shipment.status]}>
                                            {statusLabels[shipment.status]}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-3">
                                        {shipment.driver_name && (
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                {shipment.driver_name}
                                            </span>
                                        )}
                                        {shipment.vehicle_plate && (
                                            <span className="flex items-center gap-1">
                                                <Truck size={14} />
                                                {shipment.vehicle_plate}
                                            </span>
                                        )}
                                        {shipment.retailer?.address && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {shipment.retailer.address}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {shipment.status === 'preparing' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={Navigation}
                                                onClick={() => handleStatusChange(shipment.id, 'in_transit')}
                                            >
                                                Yola Çık
                                            </Button>
                                        )}
                                        {shipment.status === 'in_transit' && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                icon={CheckCircle2}
                                                onClick={() => handleStatusChange(shipment.id, 'delivered')}
                                            >
                                                Teslim Et
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* All Shipments */}
            <Card className="mt-6">
                <CardHeader
                    title="Tüm Sevkiyatlar"
                    subtitle="Son 30 günlük sevkiyat geçmişi"
                />
                <div className="space-y-3">
                    {shipments.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-secondary)]">
                            Sevkiyat kaydı bulunamadı
                        </div>
                    ) : (
                        shipments.slice(0, 10).map((shipment) => (
                            <div
                                key={shipment.id}
                                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center',
                                        shipment.status === 'preparing' && 'bg-[var(--info-bg)]',
                                        shipment.status === 'in_transit' && 'bg-[var(--warning-bg)]',
                                        shipment.status === 'delivered' && 'bg-[var(--success-bg)]',
                                        shipment.status === 'cancelled' && 'bg-[var(--error-bg)]',
                                    )}>
                                        <Truck
                                            size={24}
                                            className={cn(
                                                shipment.status === 'preparing' && 'text-[var(--info)]',
                                                shipment.status === 'in_transit' && 'text-[var(--warning)]',
                                                shipment.status === 'delivered' && 'text-[var(--success)]',
                                                shipment.status === 'cancelled' && 'text-[var(--error)]',
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--text-primary)]">
                                                {shipment.retailer?.name || 'Bilinmiyor'}
                                            </span>
                                            <Badge variant={statusColors[shipment.status]}>
                                                {statusLabels[shipment.status]}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-3 mt-1">
                                            <span>{shipment.shipment_number}</span>
                                            <span>{format(new Date(shipment.date), 'd MMM yyyy', { locale: tr })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {shipment.total_amount > 0 && (
                                        <div className="font-bold text-[var(--text-primary)]">
                                            ₺{shipment.total_amount.toLocaleString('tr-TR')}
                                        </div>
                                    )}
                                    {shipment.delivery_time && (
                                        <div className="text-xs text-[var(--text-muted)]">
                                            Teslim: {format(new Date(shipment.delivery_time), 'HH:mm')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Yeni Sevkiyat Oluştur"
                size="md"
            >
                <div className="space-y-4">
                    <Select
                        label="Satış Noktası *"
                        options={[
                            { value: '', label: 'Seçin...' },
                            ...retailers.map(r => ({ value: r.id, label: r.name }))
                        ]}
                        value={formData.retailer_id}
                        onChange={(e) => setFormData({ ...formData, retailer_id: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Şoför Adı"
                            placeholder="Mehmet..."
                            value={formData.driver_name}
                            onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                        />
                        <Input
                            label="Araç Plakası"
                            placeholder="34 ABC 123"
                            value={formData.vehicle_plate}
                            onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Notlar"
                        placeholder="Sevkiyat notları..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            İptal
                        </Button>
                        <Button variant="primary" onClick={handleCreateShipment}>
                            Oluştur
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Logistics;
