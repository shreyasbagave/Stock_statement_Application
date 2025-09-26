import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

type Supplier = {
    _id: string;
    name: string;
    contactPerson?: string;
    address?: string;
};

type SuppliersResponse = {
    success: boolean;
    data: Supplier[];
    total: number;
};

const SuppliersPage: React.FC = () => {
    const { api } = useAuth();
    const [items, setItems] = useState<Supplier[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');

    const query = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        return params.toString();
    }, [page, limit, search]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<SuppliersResponse>(`/suppliers?${query}`);
            if (res.data?.success) {
                setItems(res.data.data || []);
                setTotal(res.data.total || 0);
            } else {
                setError('Failed to load suppliers');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [query]);

    const [formOpen, setFormOpen] = useState(false);
    const [editItem, setEditItem] = useState<Supplier | null>(null);
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [address, setAddress] = useState('');

    const openCreate = () => {
        setEditItem(null);
        setName(''); setContactPerson(''); setAddress('');
        setFormOpen(true);
    };

    const openEdit = (it: Supplier) => {
        setEditItem(it);
        setName(it.name);
        setContactPerson(it.contactPerson || '');
        setAddress(it.address || '');
        setFormOpen(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Record<string, any> = { name };
            if (contactPerson) payload.contactPerson = contactPerson;
            if (address) payload.address = address;
            if (editItem) {
                await api.post(`/suppliers/${editItem._id}?_method=PUT`, payload);
            } else {
                await api.post('/suppliers', payload);
            }
            setFormOpen(false);
            await load();
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.message || 'Save failed');
        }
    };

    const remove = async (id: string) => {
        if (!window.confirm('Delete this supplier?')) return;
        try {
            await api.post(`/suppliers/${id}?_method=DELETE`);
            await load();
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.message || 'Delete failed');
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Suppliers</h2>
            <div className="filter-bar" style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <input placeholder="Search" value={search} onChange={e => { setPage(1); setSearch(e.target.value); }} />
                <button onClick={openCreate} style={{ marginLeft: 'auto' }}>Add Supplier</button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={{ color: '#d33' }}>{error}</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Name</th>
                                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Contact</th>
                                
                                <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(it => (
                                <tr key={it._id}>
                                    <td style={{ padding: 8 }}>{it.name}</td>
                                    <td style={{ padding: 8 }}>{it.contactPerson || '-'}</td>
                                    
                                    <td style={{ padding: 8 }}>
                                        <button onClick={() => openEdit(it)} style={{ marginRight: 8 }}>Edit</button>
                                        <button onClick={() => remove(it._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td colSpan={3} style={{ padding: 12, textAlign: 'center' }}>No suppliers</td></tr>
                            )}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, position: 'fixed', right: 16, bottom: 16, background: '#fff', padding: 8, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                        <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
                        <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            )}

            {formOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: 16, borderRadius: 8, width: 'min(100% - 24px, 520px)' }}>
                        <h3 style={{ marginBottom: 12 }}>{editItem ? 'Edit Supplier' : 'Add Supplier'}</h3>
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 8 }}>
                                <label>Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                    <label>Contact Person</label>
                                    <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} style={{ width: '100%' }} />
                                </div>
                                
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <label>Address</label>
                                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} style={{ width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setFormOpen(false)}>Cancel</button>
                                <button type="submit">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;


