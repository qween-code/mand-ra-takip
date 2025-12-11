import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import MilkEntry from './pages/MilkEntry';
import Animals from './pages/Animals';
import Production from './pages/Production';
import Logistics from './pages/Logistics';
import Financials from './pages/Financials';

// Placeholder components for other routes
const Reports = () => <div className="text-2xl font-bold text-gray-700">Raporlar (Yapım Aşamasında)</div>;

function App() {
    return (
        <Router>
            <DashboardLayout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/milk-entry" element={<MilkEntry />} />
                    <Route path="/animals" element={<Animals />} />
                    <Route path="/production" element={<Production />} />
                    <Route path="/logistics" element={<Logistics />} />
                    <Route path="/financials" element={<Financials />} />
                    <Route path="/reports" element={<Reports />} />
                </Routes>
            </DashboardLayout>
        </Router>
    );
}

export default App;
