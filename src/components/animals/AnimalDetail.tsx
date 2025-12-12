import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { StatusBadge } from '../ui';
import {
    Beef, Heart, Activity,
    Dna, Baby, Calendar, MapPin, X
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Milk } from 'lucide-react';

type Animal = Database['public']['Tables']['animals']['Row'];
type HealthRecord = Database['public']['Tables']['health_records']['Row'];
type BreedingRecord = Database['public']['Tables']['breeding_records']['Row'];
type MilkRecord = Database['public']['Tables']['milk_records']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface AnimalDetailProps {
    animal: Animal;
    onClose: () => void;
}

const AnimalDetail: React.FC<AnimalDetailProps> = ({ animal, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'breeding' | 'genealogy' | 'milk'>('overview');
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
    const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
    const [dateRange, setDateRange] = useState({ start: format(new Date().setDate(new Date().getDate() - 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') });
    const [sire, setSire] = useState<Animal | null>(null);
    const [dam, setDam] = useState<Animal | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [animal.id, dateRange]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            // Fetch Health Records
            const { data: health } = await supabase
                .from('health_records')
                .select('*')
                .eq('animal_id', animal.id)
                .order('date', { ascending: false });
            setHealthRecords(health || []);

            // Fetch Breeding Records
            const { data: breeding } = await supabase
                .from('breeding_records')
                .select('*')
                .eq('animal_id', animal.id)
                .order('date', { ascending: false });
            setBreedingRecords(breeding || []);

            // Fetch Milk Records
            const { data: milk } = await supabase
                .from('milk_records')
                .select('*')
                .eq('animal_id', animal.id)
                .gte('date', dateRange.start)
                .lte('date', dateRange.end)
                .order('date', { ascending: true });
            setMilkRecords(milk || []);

            // Fetch Parents
            if (animal.sire_id) {
                const { data: sireData } = await supabase.from('animals').select('*').eq('id', animal.sire_id).single();
                setSire(sireData);
            }
            if (animal.dam_id) {
                const { data: damData } = await supabase.from('animals').select('*').eq('id', animal.dam_id).single();
                setDam(damData);
            }

            // Fetch Location
            if (animal.barn_id) {
                const { data: locData } = await supabase.from('locations').select('*').eq('id', animal.barn_id).single();
                setLocation(locData);
            }

        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: Activity },
        { id: 'genealogy', label: 'Soy Ağacı', icon: Dna },
        { id: 'breeding', label: 'Üreme', icon: Baby },
        { id: 'health', label: 'Sağlık', icon: Heart },
        { id: 'milk', label: 'Süt Üretimi', icon: Milk },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-20 h-20 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    {animal.photo_url ? (
                        <img src={animal.photo_url} alt={animal.tag_number} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <Beef size={40} className="text-indigo-600" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">{animal.tag_number}</h2>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={animal.status || 'active'} />
                            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <p className="text-lg font-medium text-slate-700">{animal.name || 'İsimsiz'}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <Dna size={14} /> {animal.breed || 'Irk Belirtilmemiş'}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin size={14} /> {location?.name || 'Konum Yok'}
                        </span>
                        {animal.birth_date && (
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> {format(new Date(animal.birth_date), 'd MMM yyyy', { locale: tr })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600 font-medium'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center py-8 text-slate-400">Yükleniyor...</div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-medium text-slate-900 border-b pb-2">Temel Bilgiler</h3>
                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                        <div className="text-slate-500">Cinsiyet</div>
                                        <div className="font-medium">{animal.gender === 'female' ? 'Dişi' : 'Erkek'}</div>

                                        <div className="text-slate-500">Köken</div>
                                        <div className="font-medium">
                                            {animal.origin === 'born_on_farm' ? 'Çiftlikte Doğdu' : 'Satın Alındı'}
                                        </div>

                                        {animal.origin === 'purchased' && (
                                            <>
                                                <div className="text-slate-500">Satın Alma Tarihi</div>
                                                <div className="font-medium">
                                                    {animal.purchase_date ? format(new Date(animal.purchase_date), 'd MMM yyyy', { locale: tr }) : '-'}
                                                </div>
                                                <div className="text-slate-500">Fiyat</div>
                                                <div className="font-medium">
                                                    {animal.purchase_price ? `${animal.purchase_price} TL` : '-'}
                                                </div>
                                            </>
                                        )}

                                        <div className="text-slate-500">Güncel Ağırlık</div>
                                        <div className="font-medium">
                                            {animal.current_weight ? `${animal.current_weight} kg` : '-'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-medium text-slate-900 border-b pb-2">Notlar</h3>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg min-h-[100px]">
                                        {animal.notes || 'Not bulunmuyor.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'genealogy' && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-8">
                                {/* Parents */}
                                <div className="flex gap-12">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                            <Beef className="text-blue-600" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">Baba (Sire)</p>
                                        <p className="text-xs text-slate-500">{sire?.tag_number || 'Bilinmiyor'}</p>
                                        {sire?.name && <p className="text-xs text-slate-400">{sire.name}</p>}
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-2">
                                            <Beef className="text-pink-600" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">Anne (Dam)</p>
                                        <p className="text-xs text-slate-500">{dam?.tag_number || 'Bilinmiyor'}</p>
                                        {dam?.name && <p className="text-xs text-slate-400">{dam.name}</p>}
                                    </div>
                                </div>

                                {/* Connector */}
                                <div className="w-px h-8 bg-slate-300"></div>

                                {/* Current Animal */}
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-lg">
                                        <Beef size={40} className="text-indigo-600" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{animal.tag_number}</p>
                                    <p className="text-sm text-slate-500">{animal.name}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'breeding' && (
                            <div className="space-y-4">
                                <h3 className="font-medium text-slate-900 border-b pb-2">Üreme Kayıtları</h3>
                                {breedingRecords.length === 0 ? (
                                    <p className="text-sm text-slate-500">Kayıt bulunamadı.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {breedingRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                                        <Baby size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {record.type === 'insemination' ? 'Tohumlama' :
                                                                record.type === 'pregnancy_check' ? 'Gebelik Kontrolü' :
                                                                    record.type === 'calving' ? 'Doğum' : record.type}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {record.technician && (
                                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                        {record.technician}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'health' && (
                            <div className="space-y-4">
                                <h3 className="font-medium text-slate-900 border-b pb-2">Sağlık Geçmişi</h3>
                                {healthRecords.length === 0 ? (
                                    <p className="text-sm text-slate-500">Kayıt bulunamadı.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {healthRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                                        <Heart size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{record.diagnosis}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {record.medication && (
                                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                        {record.medication}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'milk' && (
                            <div className="space-y-6">
                                {/* Date Filter */}
                                <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Başlangıç</label>
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Bitiş</label>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium">Toplam Üretim</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {milkRecords.reduce((sum, r) => sum + Number(r.quantity_liters), 0).toFixed(1)} L
                                        </p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <p className="text-xs text-indigo-600 font-medium">Günlük Ortalama</p>
                                        <p className="text-2xl font-bold text-indigo-700">
                                            {(milkRecords.length > 0
                                                ? milkRecords.reduce((sum, r) => sum + Number(r.quantity_liters), 0) / milkRecords.length
                                                : 0).toFixed(1)} L
                                        </p>
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="h-64 w-full bg-white p-4 rounded-xl border border-slate-200">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={milkRecords}>
                                            <defs>
                                                <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(str) => format(new Date(str), 'd MMM', { locale: tr })}
                                                stroke="#94a3b8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(val) => `${val}L`}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(val: number) => [`${val} L`, 'Miktar']}
                                                labelFormatter={(label) => format(new Date(label), 'd MMMM yyyy', { locale: tr })}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="quantity_liters"
                                                stroke="#6366f1"
                                                fillOpacity={1}
                                                fill="url(#colorMilk)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* List */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-slate-900">Kayıtlar</h4>
                                    {milkRecords.length === 0 ? (
                                        <p className="text-sm text-slate-500">Bu tarih aralığında kayıt bulunamadı.</p>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                            {milkRecords.slice().reverse().map((record) => (
                                                <div key={record.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-medium text-xs">
                                                            {record.shift === 'morning' ? 'S' : 'A'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {record.shift === 'morning' ? 'Sabah' : 'Akşam'} Sağımı
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-indigo-600">{record.quantity_liters} L</p>
                                                        {record.fat_rate && (
                                                            <p className="text-xs text-slate-400">Yağ: %{record.fat_rate}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnimalDetail;
