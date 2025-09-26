import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

type DashboardData = {
    totals?: Record<string, number>;
    recentActivities?: Array<{ action: string; entityType?: string; createdAt?: string; }>
};

const Dashboard: React.FC = () => {
    const { api, user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await api.get<{ success: boolean; data?: DashboardData; message?: string }>('/dashboard/overview');
                if (!mounted) return;
                if (res.data?.success) setData(res.data.data || null); else setError(res.data?.message || 'Failed to load dashboard');
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || 'Failed to load dashboard');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [api]);

    if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;
    if (error) return <div style={{ padding: 24, color: '#d33' }}>{error}</div>;

    return (
        <div style={{ padding: 24 }}>
            <h2>Welcome{user ? `, ${user.name}` : ''}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
                {data?.totals && Object.entries(data.totals).map(([key, value]) => (
                    <div key={key} style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase' }}>{key}</div>
                        <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: 24 }}>
                <h3>Recent Activity</h3>
                <ul>
                    {data?.recentActivities?.map((a, idx) => (
                        <li key={idx}>{a.action} {a.entityType ? `on ${a.entityType}` : ''} {a.createdAt ? `at ${new Date(a.createdAt).toLocaleString()}` : ''}</li>
                    )) || <li>No recent activity</li>}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;


