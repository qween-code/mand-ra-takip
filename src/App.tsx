// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - APP COMPONENT
// Main application with routing
// ═══════════════════════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import MilkEntry from './pages/MilkEntry';
import Animals from './pages/Animals';
import Production from './pages/Production';
import Financials from './pages/Financials';
import Logistics from './pages/Logistics';
import Suppliers from './pages/Suppliers';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="milk" element={<MilkEntry />} />
                        <Route path="animals" element={<Animals />} />
                        <Route path="production" element={<Production />} />
                        <Route path="financials" element={<Financials />} />
                        <Route path="distribution" element={<Logistics />} />
                        <Route path="logistics" element={<Logistics />} />

                        {/* Placeholder routes - will be implemented */}
                        <Route path="suppliers" element={<Suppliers />} />
                        <Route path="returns" element={<ComingSoon title="İadeler" />} />
                        <Route path="sales" element={<ComingSoon title="Satışlar" />} />
                        <Route path="analytics" element={<ComingSoon title="Analizler" />} />
                        <Route path="notifications" element={<ComingSoon title="Bildirimler" />} />
                        <Route path="settings" element={<ComingSoon title="Ayarlar" />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

// Temporary Coming Soon component for unimplemented pages
function ComingSoon({ title }: { title: string }) {
    return (
        <div className="page-content">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-6">
                    <span className="text-4xl">🚧</span>
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{title}</h1>
                <p className="text-[var(--text-secondary)]">Bu sayfa yakında aktif olacak</p>
            </div>
        </div>
    );
}

export default App;
