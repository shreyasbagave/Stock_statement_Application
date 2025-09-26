import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (isAuthenticated) return <Navigate to="/" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: '10vh auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2 style={{ marginBottom: 16 }}>Sign in</h2>
            {error && <div style={{ color: 'white', background: '#d33', padding: 8, borderRadius: 4, marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
            <div style={{ marginTop: 12, textAlign: 'center' }}>
                <button type="button" onClick={() => navigate('/signup')} style={{ background: 'transparent', border: 'none', color: '#06c', cursor: 'pointer' }}>Create an account</button>
            </div>
        </div>
    );
};

export default Login;


