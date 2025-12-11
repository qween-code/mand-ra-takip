import React from 'react';
import {
    TrendingUp,
    Droplets,
    Package,
    AlertTriangle
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const stats = [
        {
            name: 'Günlük Süt Girişi',
            value: '1,250 L',
            change: '+12%',
            changeType: 'positive',
            icon: Droplets,
            color: 'bg-blue-500'
        },
        {
            name: 'Aktif Üretim',
            value: '3 Parti',
            change: 'Normal',
            changeType: 'neutral',
            icon: Package,
            color: 'bg-indigo-500'
        },
        {
            name: 'Günlük Satış',
            value: '₺15,400',
            change: '+8.2%',
            changeType: 'positive',
            icon: TrendingUp,
            color: 'bg-emerald-500'
        },
        {
            name: 'Kritik Stok',
            value: '2 Ürün',
            change: 'Acil',
            changeType: 'negative',
            icon: AlertTriangle,
            color: 'bg-orange-500'
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Komuta Merkezi
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    İşletmenizin anlık durum özeti.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                            <p
                                className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === 'positive' ? 'text-green-600' :
                                        item.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                                    }`}
                            >
                                {item.change}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Charts Placeholder */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg bg-white shadow">
                    <div className="p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Son Süt Girişleri</h3>
                        <div className="mt-4 flow-root">
                            <ul role="list" className="-my-5 divide-y divide-gray-200">
                                {[1, 2, 3].map((i) => (
                                    <li key={i} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <span className="text-sm font-medium leading-none text-blue-700">S</span>
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">Sabah Sağımı</p>
                                                <p className="truncate text-sm text-gray-500">Ahır 1 • 450 Litre</p>
                                            </div>
                                            <div>
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    Tamamlandı
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow">
                    <div className="p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Üretim Durumu</h3>
                        <div className="mt-4">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                            Kaşar Peyniri (Parti #2023-001)
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-indigo-600">
                                            70%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                                    <div style={{ width: "70%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                </div>
                            </div>

                            <div className="relative pt-1 mt-4">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                                            Yoğurt (Parti #2023-002)
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-emerald-600">
                                            30%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-200">
                                    <div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
