import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

type Option = { _id: string; name: string };

const OutwardPage: React.FC = () => {
    const { api } = useAuth();
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
    const [challan, setChallan] = useState('');
    const [customer, setCustomer] = useState('');
    const [item, setItem] = useState('');
    const [okQty, setOkQty] = useState<number | ''>('');
    const [crQty, setCrQty] = useState<number | ''>('');
    const [mrQty, setMrQty] = useState<number | ''>('');
    const [asCastQty, setAsCastQty] = useState<number | ''>('');
    // unit removed
    // rate removed
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [customers, setCustomers] = useState<Option[]>([]);
    const [items, setItems] = useState<Option[]>([]);

    const loadRefs = async () => {
        try {
            const [cus, its] = await Promise.all([
                api.get<any>('/customers?limit=100'),
                api.get<any>('/items?limit=100')
            ]);
            setCustomers((cus.data?.data || []).map((s: any) => ({ _id: s._id, name: s.name })));
            setItems((its.data?.data || []).map((i: any) => ({ _id: i._id, name: i.name })));
        } catch {}
    };

    useEffect(() => { loadRefs(); }, []);

    const totalQty = (okQty === '' ? 0 : Number(okQty)) + (crQty === '' ? 0 : Number(crQty)) + (mrQty === '' ? 0 : Number(mrQty)) + (asCastQty === '' ? 0 : Number(asCastQty));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!customer || !item) { setError('Customer and Item are required'); return; }
        const ok = okQty === '' ? 0 : Number(okQty);
        const cr = crQty === '' ? 0 : Number(crQty);
        const mr = mrQty === '' ? 0 : Number(mrQty);
        const asCast = asCastQty === '' ? 0 : Number(asCastQty);
        if (ok + cr + mr + asCast <= 0) { setError('Total quantity must be > 0'); return; }
        setLoading(true);
        try {
            await api.post('/outward', {
                date,
                challanNo: challan,
                customer,
                item,
                okQty: ok,
                crQty: cr,
                mrQty: mr,
                asCastQty: asCast,
                
            });
            setChallan(''); setCustomer(''); setItem(''); setOkQty(''); setCrQty(''); setMrQty(''); setAsCastQty('');
            alert('Outward entry added');
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
                    <h2 style={{ margin: 0 }}>Outward Issue</h2>
                    <div style={{ color: '#666' }}>Issue stock to customers and track rejections</div>
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
                                    <input value={challan} onChange={e => setChallan(e.target.value)} required placeholder="e.g. CH/2025/101" style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Customer</label>
                                    <select value={customer} onChange={e => setCustomer(e.target.value)} required style={{ width: '100%' }}>
                                        <option value="">Select customer</option>
                                        {customers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
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

                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>Quantities</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>OK Qty</label>
                                        <input type="number" min={0} step={0.01} value={okQty} onChange={e => setOkQty(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>CR Qty</label>
                                        <input type="number" min={0} step={0.01} value={crQty} onChange={e => setCrQty(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>MR Qty</label>
                                        <input type="number" min={0} step={0.01} value={mrQty} onChange={e => setMrQty(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>As Cast</label>
                                        <input type="number" min={0} step={0.01} value={asCastQty} onChange={e => setAsCastQty(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                                    <div style={{ fontWeight: 600 }}>Total Quantity:</div>
                                    <div style={{ padding: '6px 10px', borderRadius: 8, background: '#f3f4f6', fontWeight: 600 }}>{totalQty.toFixed(2)}</div>
                                </div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>System prevents issuing more than available stock; CR/MR tracked for quality.</div>
                            </div>
                        </div>

                        <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: '#fafafa', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                            <div style={{ color: '#555' }}>Total Qty: <strong>{totalQty.toFixed(2)}</strong></div>
                            <button type="submit" disabled={loading || totalQty <= 0}>{loading ? 'Saving...' : 'Save Issue'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OutwardPage;


