import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets } from 'lucide-react';
import { Button, Card } from '../components/ui';

const Login: React.FC = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = () => {
        login('Admin User', 'admin');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
            <Card className="w-full max-w-md p-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-[var(--primary-500)] flex items-center justify-center mb-4 text-white">
                        <Droplets size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mandıra Asistanı</h1>
                    <p className="text-[var(--text-secondary)] mt-2">Süt Takip ve Yönetim Sistemi</p>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="primary"
                        className="w-full h-12 text-lg"
                        onClick={handleLogin}
                    >
                        Giriş Yap
                    </Button>
                    <p className="text-xs text-center text-[var(--text-muted)]">
                        Geliştirme modu: Otomatik admin girişi
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
