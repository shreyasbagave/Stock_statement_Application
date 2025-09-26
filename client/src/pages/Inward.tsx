import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

type Option = { _id: string; name: string };

const InwardPage: React.FC = () => {
    const { api } = useAuth();
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
    const [challan, setChallan] = useState('');
    const [supplier, setSupplier] = useState('');
    const [item, setItem] = useState('');
    const [quantityReceived, setQty] = useState<number | ''>('');
    // unit removed
    // rate removed
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [suppliers, setSuppliers] = useState<Option[]>([]);
    const [items, setItems] = useState<Option[]>([]);

    const loadRefs = async () => {
        try {
            const [sup, its] = await Promise.all([
                api.get<any>('/suppliers?limit=100'),
                api.get<any>('/items?limit=100')
            ]);
            setSuppliers((sup.data?.data || []).map((s: any) => ({ _id: s._id, name: s.name })));
            setItems((its.data?.data || []).map((i: any) => ({ _id: i._id, name: i.name })));
        } catch {}
    };

    useEffect(() => { loadRefs(); }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!supplier || !item) { setError('Supplier and Item are required'); return; }
        const qty = quantityReceived === '' ? 0 : Number(quantityReceived);
        if (qty <= 0) { setError('Quantity must be greater than 0'); return; }
        setLoading(true);
        try {
            await api.post('/inward', {
                date,
                challanNo: challan,
                supplier,
                item,
                quantityReceived: qty,
                
            });
            setChallan(''); setSupplier(''); setItem(''); setQty('');
            alert('Inward entry added');
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{ maxWidth: 920, margin: '0 auto' }}>
                <div style={{ marginBottom: 16 }}>
                    <h2 style={{ margin: 0 }}>Inward Entry</h2>
                    <div style={{ color: '#666' }}>Record received stock with challan and party details</div>
                </div>

                {error && <div style={{ color: '#842029', background: '#f8d7da', border: '1px solid #f5c2c7', padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}

                <form onSubmit={submit}>
                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
                        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>Basic Details</div>
                        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Challan No</label>
                                    <input value={challan} onChange={e => setChallan(e.target.value)} required placeholder="e.g. CH/2025/001" style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Supplier</label>
                                    <select value={supplier} onChange={e => setSupplier(e.target.value)} required style={{ width: '100%' }}>
                                        <option value="">Select supplier</option>
                                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Item</label>
                                    <select value={item} onChange={e => setItem(e.target.value)} required style={{ width: '100%' }}>
                                        <option value="">Select item</option>
                                        {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Quantity Received</label>
                                    <input type="number" min={0} step={0.01} value={quantityReceived} onChange={e => setQty(e.target.value === '' ? '' : Number(e.target.value))} required placeholder="Enter quantity" style={{ width: '100%' }} />
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>No negative quantity allowed. System checks duplicate challans per supplier.</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#fafafa', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Entry'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InwardPage;


