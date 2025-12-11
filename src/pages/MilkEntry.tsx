import React, { useState, useMemo, useEffect } from 'react';
import { Save, Plus, Minus, History, Check, Search, Sun, Moon, Edit3, X, Activity, Calendar, FileText, Filter, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Cow, Calf } from '../types';
import { getTodayCows, saveMilkRecord, getCalves, updateCalfConsumption, addCowDB, addCalfDB, getCowHistory } from '../services/db';

// --- MODALS ---

const CowDetailModal: React.FC<{ cow: Cow; onClose: () => void }> = ({ cow, onClose }) => {
    const [historyData, setHistoryData] = useState<any[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            const data = await getCowHistory(cow.id);
            setHistoryData(data);
        };
        loadHistory();
    }, [cow.id]);

    // Calculate dynamic "Last Milking" status
    const lastMilking = cow.eveningMilked ? "Bugün Akşam" : cow.morningMilked ? "Bugün Sabah" : "Dün Akşam";

    // Placeholder data for Health Notes
    const healthNotes = [
        {
            id: 1,
            type: 'routine',
            title: 'Rutin Kontrol',
            date: '15 Kas 2025',
            note: 'Genel sağlık durumu iyi. Vitamin takviyesi yapıldı. Tırnak bakımı normal.'
        },
        {
            id: 2,
            type: 'vaccine',
            title: 'Aşı Takvimi',
            date: '01 Eki 2025',
            note: 'Şap aşısı 2. doz uygulandı. Reaksiyon gözlenmedi.'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
                            🐮
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{cow.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">{cow.tagNumber}</span>
                                <span className="text-sm text-slate-500">• Holştayn • 4 Yaşında</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <p className="text-xs font-bold text-orange-600 uppercase mb-1">Son Sağım</p>
                            <p className="font-bold text-slate-800">{lastMilking}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Günlük Ort.</p>
                            <p className="font-bold text-slate-800">24.5 Litre</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs font-bold text-green-600 uppercase mb-1">Laktasyon</p>
                            <p className="font-bold text-slate-800">145. Gün</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-xs font-bold text-purple-600 uppercase mb-1">Sağlık</p>
                            <p className="font-bold text-slate-800 flex items-center"><Activity size={16} className="mr-1 text-green-500" /> İyi</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                            <History size={18} className="mr-2 text-slate-400" />
                            Son 7 Gün Verimi
                        </h4>
                        <div className="h-64 w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`${value} L`, '']}
                                    />
                                    <Bar dataKey="morning" name="Sabah" fill="#fdba74" stackId="a" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="evening" name="Akşam" fill="#6366f1" stackId="a" radius={[4, 4, 0, 0]} />
                                    <ReferenceLine y={24} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'Hedef', fill: '#94a3b8', fontSize: 10 }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center space-x-6 mt-3">
                            <div className="flex items-center text-xs text-slate-500 font-medium">
                                <div className="w-3 h-3 bg-orange-300 rounded mr-2"></div> Sabah
                            </div>
                            <div className="flex items-center text-xs text-slate-500 font-medium">
                                <div className="w-3 h-3 bg-indigo-500 rounded mr-2"></div> Akşam
                            </div>
                        </div>
                    </div>

                    {/* Health Notes */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                            <FileText size={18} className="mr-2 text-slate-400" />
                            Veteriner & Sağlık Notları
                        </h4>
                        <div className="space-y-3">
                            {healthNotes.map((note) => (
                                <div key={note.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${note.type === 'routine' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {note.type === 'routine' ? <Check size={16} /> : <Activity size={16} />}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-slate-900 text-sm">{note.title}</p>
                                            <span className="text-xs text-slate-400 flex items-center"><Calendar size={12} className="mr-1" /> {note.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {note.note}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm">Kapat</button>
                    <button className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-lg shadow-slate-200 flex items-center">
                        <Edit3 size={16} className="mr-2" />
                        Not Ekle
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddCowModal: React.FC<{ onClose: () => void; onSave: (cow: Partial<Cow>) => void }> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', tagNumber: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.tagNumber) {
            onSave(formData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Yeni İnek Ekle</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Küpe Numarası</label>
                        <input
                            autoFocus
                            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                            placeholder="Örn: TR-001"
                            value={formData.tagNumber}
                            onChange={e => setFormData({ ...formData, tagNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">İsim</label>
                        <input
                            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                            placeholder="Örn: Sarıkız"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="pt-2 flex space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors">İptal</button>
                        <button type="submit" className="flex-1 py-3 text-white bg-blue-600 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddCalfModal: React.FC<{ onClose: () => void; onSave: (calf: Partial<Calf>) => void; mothers: Cow[] }> = ({ onClose, onSave, mothers }) => {
    const [formData, setFormData] = useState({ name: '', motherName: '', ageMonths: '', targetConsumption: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.motherName) {
            onSave({
                name: formData.name,
                motherName: formData.motherName,
                ageMonths: Number(formData.ageMonths) || 0,
                targetConsumption: Number(formData.targetConsumption) || 4
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Yeni Buzağı Ekle</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Buzağı İsmi</label>
                        <input
                            autoFocus
                            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                            placeholder="Örn: Minnoş"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Annesi</label>
                        <select
                            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium bg-white"
                            value={formData.motherName}
                            onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                        >
                            <option value="">Seçiniz...</option>
                            {mothers.map(cow => <option key={cow.id} value={cow.name}>{cow.tagNumber} - {cow.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Yaş (Ay)</label>
                            <input
                                type="number"
                                className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                                placeholder="0"
                                value={formData.ageMonths}
                                onChange={e => setFormData({ ...formData, ageMonths: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hedef (L)</label>
                            <input
                                type="number"
                                className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                                placeholder="4"
                                value={formData.targetConsumption}
                                onChange={e => setFormData({ ...formData, targetConsumption: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors">İptal</button>
                        <button type="submit" className="flex-1 py-3 text-white bg-orange-500 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-colors">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const MilkEntry: React.FC = () => {
    const [cows, setCows] = useState<Cow[]>([]);
    const [calves, setCalves] = useState<Calf[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'morning_done' | 'morning_pending' | 'evening_done' | 'evening_pending'>('all');
    const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
    const [isAddCowOpen, setIsAddCowOpen] = useState(false);
    const [isAddCalfOpen, setIsAddCalfOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // New State for Quick Manual Entry Form
    const [manualForm, setManualForm] = useState({
        cowId: '',
        session: 'morning' as 'morning' | 'evening',
        amount: ''
    });

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            const loadedCows = await getTodayCows();
            setCows(loadedCows);
            const loadedCalves = await getCalves();
            setCalves(loadedCalves);
        };
        loadData();
    }, [refreshTrigger]);

    const handleMilkChange = (id: string, session: 'morning' | 'evening', value: string) => {
        const val = parseFloat(value);
        const numVal = isNaN(val) ? 0 : val;

        // Optimistic Update
        setCows(prev => prev.map(c => {
            if (c.id !== id) return c;
            const keyMilked = session === 'morning' ? 'morningMilked' : 'eveningMilked';
            return {
                ...c,
                [session === 'morning' ? 'morningLiters' : 'eveningLiters']: numVal,
                [keyMilked]: numVal > 0
            };
        }));

        // DB Update
        saveMilkRecord(id, session, numVal);
    };

    const adjustCalfMilk = (id: string, delta: number) => {
        // Optimistic Update
        setCalves(prev => prev.map(c => c.id === id ? { ...c, dailyConsumption: Math.max(0, c.dailyConsumption + delta) } : c));

        // DB Update
        updateCalfConsumption(id, delta);
    };

    const handleSaveAll = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    // Quick Manual Form Submit
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualForm.cowId || !manualForm.amount) return;

        handleMilkChange(manualForm.cowId, manualForm.session, manualForm.amount);

        // Reset amount but keep cow/session for fast entry
        setManualForm(prev => ({ ...prev, amount: '' }));
    };

    const handleAddCow = (newCow: Partial<Cow>) => {
        addCowDB(newCow);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAddCalf = (newCalf: Partial<Calf>) => {
        addCalfDB(newCalf);
        setRefreshTrigger(prev => prev + 1);
    };

    const filteredCows = cows.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tagNumber.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        switch (filterStatus) {
            case 'morning_done':
                matchesFilter = c.morningMilked;
                break;
            case 'morning_pending':
                matchesFilter = !c.morningMilked;
                break;
            case 'evening_done':
                matchesFilter = c.eveningMilked;
                break;
            case 'evening_pending':
                matchesFilter = !c.eveningMilked;
                break;
            default:
                matchesFilter = true;
        }

        return matchesSearch && matchesFilter;
    });

    const totalMorning = useMemo(() => cows.reduce((sum, c) => sum + c.morningLiters, 0), [cows]);
    const totalEvening = useMemo(() => cows.reduce((sum, c) => sum + c.eveningLiters, 0), [cows]);
    const totalMilk = totalMorning + totalEvening;
    const totalCalf = useMemo(() => calves.reduce((sum, c) => sum + c.dailyConsumption, 0), [calves]);
    const netMilk = totalMilk - totalCalf;

    return (
        <div className="space-y-6 pb-32 md:pb-0">
            {/* Modals */}
            {selectedCow && <CowDetailModal cow={selectedCow} onClose={() => setSelectedCow(null)} />}
            {isAddCowOpen && <AddCowModal onClose={() => setIsAddCowOpen(false)} onSave={handleAddCow} />}
            {isAddCalfOpen && <AddCalfModal onClose={() => setIsAddCalfOpen(false)} onSave={handleAddCalf} mothers={cows} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Günlük Süt Girişi</h2>
                    <p className="text-slate-500 text-sm mt-1">Sabah ve akşam sağımlarını takip edin.</p>
                </div>
                <div>
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                        📅 {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* Quick Manual Entry Form */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <Edit3 size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800">Hızlı Manuel Giriş</h3>
                        </div>

                        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">İnek Seçimi</label>
                                <select
                                    value={manualForm.cowId}
                                    onChange={(e) => setManualForm({ ...manualForm, cowId: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-slate-50 h-12"
                                >
                                    <option value="">İnek Seç...</option>
                                    {cows.map(c => (
                                        <option key={c.id} value={c.id}>{c.tagNumber} - {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sağım Vakti</label>
                                <div className="flex bg-slate-100 rounded-xl p-1 h-12">
                                    <button
                                        type="button"
                                        onClick={() => setManualForm({ ...manualForm, session: 'morning' })}
                                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${manualForm.session === 'morning' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Sun size={16} className="mr-1.5" /> Sabah
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setManualForm({ ...manualForm, session: 'evening' })}
                                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${manualForm.session === 'evening' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Moon size={16} className="mr-1.5" /> Akşam
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Miktar (L)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.0"
                                        value={manualForm.amount}
                                        onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-3 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold text-slate-800 h-12"
                                    />
                                    <span className="absolute right-3 top-3.5 text-slate-400 text-xs font-medium">L</span>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <button
                                    type="submit"
                                    disabled={!manualForm.cowId || !manualForm.amount}
                                    className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 h-12"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* List Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Search Bar Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-slate-800">Sağım Listesi</h3>
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-600">{filteredCows.length} Baş</span>

                                <button onClick={() => setIsAddCowOpen(true)} className="ml-2 flex items-center px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors border border-blue-100">
                                    <UserPlus size={14} className="mr-1" /> Ekle
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                {/* Filter Dropdown */}
                                <div className="relative">
                                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="all">Tümü</option>
                                        <option value="morning_done">Sabah: Tamam</option>
                                        <option value="morning_pending">Sabah: Bekliyor</option>
                                        <option value="evening_done">Akşam: Tamam</option>
                                        <option value="evening_pending">Akşam: Bekliyor</option>
                                    </select>
                                </div>

                                {/* Search Input */}
                                <div className="relative w-full sm:w-64">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="İnek ara (No/İsim)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-2 md:px-4 py-3 font-semibold w-1/4">İnek Bilgisi</th>
                                        <th className="px-2 py-3 text-center font-semibold w-24 hidden sm:table-cell">Dün</th>
                                        <th className="px-2 md:px-4 py-3 text-center font-semibold bg-orange-50/30 text-orange-800 border-l border-r border-orange-100">
                                            <div className="flex items-center justify-center space-x-1">
                                                <Sun size={14} /> <span>Sabah</span>
                                            </div>
                                        </th>
                                        <th className="px-2 md:px-4 py-3 text-center font-semibold bg-indigo-50/30 text-indigo-800 border-r border-indigo-100">
                                            <div className="flex items-center justify-center space-x-1">
                                                <Moon size={14} /> <span>Akşam</span>
                                            </div>
                                        </th>
                                        <th className="px-2 md:px-4 py-3 text-center font-semibold w-24">Toplam</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCows.map(cow => (
                                        <tr key={cow.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-2 md:px-4 py-3 cursor-pointer group/cell" onClick={() => setSelectedCow(cow)}>
                                                <div className="font-semibold text-slate-900 group-hover/cell:text-blue-600 transition-colors text-sm md:text-base">{cow.name}</div>
                                                <div className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1 group-hover/cell:bg-blue-50 group-hover/cell:text-blue-600 transition-colors">{cow.tagNumber}</div>
                                            </td>
                                            <td className="px-2 py-3 text-center text-slate-400 hidden sm:table-cell">
                                                {cow.yesterdayLiters?.toFixed(1) || '0.0'} L
                                            </td>

                                            {/* Morning Column */}
                                            <td className={`px-2 py-3 border-l border-r border-slate-100 transition-colors ${cow.morningLiters > 0 ? 'bg-orange-50/30' : 'bg-transparent'}`}>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <input
                                                        type="number"
                                                        value={cow.morningLiters === 0 ? '' : cow.morningLiters}
                                                        placeholder="-"
                                                        onChange={(e) => handleMilkChange(cow.id, 'morning', e.target.value)}
                                                        className={`w-full max-w-[80px] h-10 text-center border rounded-lg py-2 px-1 focus:ring-2 focus:outline-none font-bold text-slate-800 transition-all ${cow.morningLiters > 0 ? 'border-orange-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-400 focus:ring-orange-100'}`}
                                                    />
                                                </div>
                                            </td>

                                            {/* Evening Column */}
                                            <td className={`px-2 py-3 border-r border-slate-100 transition-colors ${cow.eveningLiters > 0 ? 'bg-indigo-50/30' : 'bg-transparent'}`}>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <input
                                                        type="number"
                                                        value={cow.eveningLiters === 0 ? '' : cow.eveningLiters}
                                                        placeholder="-"
                                                        onChange={(e) => handleMilkChange(cow.id, 'evening', e.target.value)}
                                                        className={`w-full max-w-[80px] h-10 text-center border rounded-lg py-2 px-1 focus:ring-2 focus:outline-none font-bold text-slate-800 transition-all ${cow.eveningLiters > 0 ? 'border-indigo-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-100'}`}
                                                    />
                                                </div>
                                            </td>

                                            {/* Total Column */}
                                            <td className="px-2 md:px-4 py-3 text-center">
                                                <span className={`font-black text-lg ${cow.morningLiters + cow.eveningLiters > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                                                    {(cow.morningLiters + cow.eveningLiters).toFixed(1)}
                                                </span>
                                                <span className="text-xs text-slate-400 ml-1">L</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredCows.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                Kayıt bulunamadı.
                            </div>
                        )}
                    </div>

                    {/* Calf Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <span className="bg-orange-100 p-2 rounded-lg text-orange-600 mr-3">🍼</span>
                                Buzağı Tüketimi
                            </h3>
                            <button onClick={() => setIsAddCalfOpen(true)} className="flex items-center px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-100">
                                <Plus size={14} className="mr-1" /> Buzağı Ekle
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {calves.map(calf => (
                                <div key={calf.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">{calf.name}</p>
                                            <p className="text-xs text-slate-500">Anne: {calf.motherName} • {calf.ageMonths} Aylık</p>
                                        </div>
                                        <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-100">Hedef: {calf.targetConsumption}L</span>
                                    </div>

                                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                        <button onClick={() => adjustCalfMilk(calf.id, -0.5)} className="w-12 h-12 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors">
                                            <Minus size={20} />
                                        </button>
                                        <span className="font-bold text-2xl text-slate-800">{calf.dailyConsumption} <span className="text-sm font-normal text-slate-500">L</span></span>
                                        <button onClick={() => adjustCalfMilk(calf.id, 0.5)} className="w-12 h-12 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 flex items-center justify-center transition-colors">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Card - Desktop Sticky */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-6 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-50/50 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            Günün Özeti
                            <span className="ml-auto text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">Canlı</span>
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-900 text-sm font-medium flex items-center"><Sun size={14} className="mr-2" /> Sabah</span>
                                    <span className="font-bold text-orange-700 text-lg">{totalMorning.toFixed(1)} L</span>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-indigo-900 text-sm font-medium flex items-center"><Moon size={14} className="mr-2" /> Akşam</span>
                                    <span className="font-bold text-indigo-700 text-lg">{totalEvening.toFixed(1)} L</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <span className="text-slate-500 text-sm font-medium">Buzağı Tüketimi</span>
                                <span className="font-bold text-red-500 text-lg">- {totalCalf.toFixed(1)} L</span>
                            </div>

                            <div className="h-px bg-slate-200 my-2"></div>

                            <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                                <span className="font-bold opacity-90">NET SÜT</span>
                                <span className="font-black text-3xl tracking-tight">{netMilk.toFixed(1)} L</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAll}
                            disabled={isSaved}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 ${isSaved
                                ? 'bg-green-500 shadow-green-200 cursor-default'
                                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                                }`}
                        >
                            {isSaved ? (
                                <><Check size={20} /> <span>Kaydedildi</span></>
                            ) : (
                                <><Save size={20} /> <span>Günü Tamamla</span></>
                            )}
                        </button>

                        <div className="mt-6 flex justify-center">
                            <button className="text-xs text-slate-500 flex items-center hover:text-primary-600 font-medium transition-colors">
                                <History size={14} className="mr-1.5" /> Geçmiş kayıtları görüntüle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Footer */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Net Süt</p>
                        <p className="text-2xl font-black text-blue-600 leading-none">{netMilk.toFixed(1)} <span className="text-sm font-medium text-slate-400">L</span></p>
                    </div>
                    <button
                        onClick={handleSaveAll}
                        disabled={isSaved}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 ${isSaved
                            ? 'bg-green-500 shadow-green-200'
                            : 'bg-slate-900 shadow-slate-200'
                            }`}
                    >
                        {isSaved ? (
                            <><Check size={18} /> <span>Kaydedildi</span></>
                        ) : (
                            <><Save size={18} /> <span>Tamamla</span></>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MilkEntry;
