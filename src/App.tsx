import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import MilkEntry from './pages/MilkEntry';
import Animals from './pages/Animals';
import Production from './pages/Production';
import Financials from './pages/Financials';
import Logistics from './pages/Logistics';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="milk" element={<MilkEntry />} />
                    <Route path="animals" element={<Animals />} />
                    <Route path="production" element={<Production />} />
                    <Route path="financials" element={<Financials />} />
                    <Route path="logistics" element={<Logistics />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
