import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const ReportsPage: React.FC = () => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dashboard, setDashboard] = useState<any>(null);

    const [month, setMonth] = useState<string>('');
    const [year, setYear] = useState<string>('');

    const monthOptions = useMemo(() => [
        { v: '1', l: 'January' }, { v: '2', l: 'February' }, { v: '3', l: 'March' },
        { v: '4', l: 'April' }, { v: '5', l: 'May' }, { v: '6', l: 'June' },
        { v: '7', l: 'July' }, { v: '8', l: 'August' }, { v: '9', l: 'September' },
        { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
    ], []);
    const yearOptions = useMemo(() => {
        const current = new Date().getFullYear();
        const years: Array<string> = [];
        for (let y = current; y >= current - 10; y--) years.push(String(y));
        return years;
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await api.get<any>('/dashboard');
                if (res.data?.success) setDashboard(res.data.data); else setError('Failed to load dashboard');
            } catch (e: any) {
                setError(e?.message || 'Failed to load dashboard');
            } finally { setLoading(false); }
        })();
    }, [api]);

    const exportExcel = async () => {
        if (!month || !year) { alert('Please select month and year'); return; }
        try {
            const res = await api.get(`/reports/export/excel?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`, { responseType: 'blob' } as any);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (e: any) { alert(e?.message || 'Export failed'); }
    };

    const exportPdf = async () => {
        if (!month || !year) { alert('Please select month and year'); return; }
        try {
            const res = await api.get(`/reports/export/pdf?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`, { responseType: 'blob' } as any);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (e: any) { alert(e?.message || 'Export failed'); }
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Reports</h2>
            {loading ? <div>Loading...</div> : error ? <div style={{ color: '#d33' }}>{error}</div> : (
                <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                        <select value={month} onChange={e => setMonth(e.target.value)} style={{ minWidth: 160 }}>
                            <option value="">Select Month</option>
                            {monthOptions.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                        </select>
                        <select value={year} onChange={e => setYear(e.target.value)} style={{ minWidth: 120 }}>
                            <option value="">Select Year</option>
                            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#666' }}>Total Inward Qty (monthly)</div>
                        <div style={{ fontSize: 24, fontWeight: 600 }}>{dashboard?.inwardMonthlyTotal ?? '-'}</div>
                    </div>
                    <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#666' }}>Total Outward Qty (monthly)</div>
                        <div style={{ fontSize: 24, fontWeight: 600 }}>{dashboard?.outwardMonthlyTotal ?? '-'}</div>
                    </div>
                    <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#666' }}>CR & MR summary</div>
                        <div style={{ fontSize: 24, fontWeight: 600 }}>{dashboard?.rejectSummary ?? '-'}</div>
                    </div>
                    <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#666' }}>Current Stock Balance</div>
                        <div style={{ fontSize: 24, fontWeight: 600 }}>{dashboard?.currentStockBalance ?? '-'}</div>
                    </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        <button onClick={exportExcel}>Export Excel</button>
                        <button onClick={exportPdf}>Export PDF</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReportsPage;


