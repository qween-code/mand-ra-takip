import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Loader2 } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';

const Login: React.FC = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await login(email, password);

        if (error) {
            setError(error.message || 'Giriş başarısız');
            setLoading(false);
        }
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

                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        label="E-posta"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="ornek@mandira.com"
                    />
                    <Input
                        label="Şifre"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        className="w-full h-12 text-lg"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Giriş Yap
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Login;
