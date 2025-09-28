import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

type Item = {
    _id: string;
    name: string;
    description?: string;
    category: string;
    unit: string;
    minimumStock?: number;
    currentStock?: number;
};

type ItemsResponse = {
    success: boolean;
    data: Item[];
    total: number;
};

const defaultUnit = 'pcs';

const ItemsPage: React.FC = () => {
    const { api } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const query = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        return params.toString();
    }, [page, limit, search, category]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<ItemsResponse>(`/items?${query}`);
            if (res.data?.success) {
                setItems(res.data.data || []);
                setTotal(res.data.total || 0);
            } else {
                setError('Failed to load items');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [query]);

    const [formOpen, setFormOpen] = useState(false);
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [cat, setCat] = useState('');
    // unit removed
    const [minStock, setMinStock] = useState<number | ''>('');

    const openCreate = () => {
        setEditItem(null);
        setName('');
        setDesc('');
        setCat('');
        // unit removed
        setMinStock('');
        setFormOpen(true);
    };

    const openEdit = (it: Item) => {
        setEditItem(it);
        setName(it.name);
        setDesc(it.description || '');
        setCat(it.category || '');
        // unit removed
        setMinStock(typeof it.minimumStock === 'number' ? it.minimumStock : '');
        setFormOpen(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Record<string, any> = { name, category: cat };
            if (desc) payload.description = desc;
            if (minStock !== '') payload.minimumStock = Number(minStock);
            if (editItem) {
                await api.post(`/items/${editItem._id}?_method=PUT`, payload);
            } else {
                await api.post('/items', payload);
            }
            setFormOpen(false);
            await load();
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.message || 'Save failed');
        }
    };

    const remove = async (id: string) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await api.post(`/items/${id}?_method=DELETE`);
            await load();
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.message || 'Delete failed');
        }
    };

    return (
        <div className="mobile-padding" style={{ padding: 24 }}>
            <h2>Items</h2>
            <div className="filter-bar">
                <input placeholder="Search" value={search} onChange={e => { setPage(1); setSearch(e.target.value); }} />
                <input placeholder="Category" value={category} onChange={e => { setPage(1); setCategory(e.target.value); }} />
                <button onClick={openCreate} style={{ marginLeft: 'auto' }}>Add Item</button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={{ color: '#d33' }}>{error}</div>
            ) : (
                <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
                    <table className="responsive-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 12 }}>Name</th>
                                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 12 }}>Category</th>
                                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 12 }}>Min Stock</th>
                                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 12 }}>Current</th>
                                <th style={{ borderBottom: '1px solid #eee', padding: 12 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(it => (
                                <tr key={it._id}>
                                    <td style={{ padding: 12 }}>{it.name}</td>
                                    <td style={{ padding: 12 }}>{it.category}</td>
                                    <td style={{ padding: 12, textAlign: 'right' }}>{it.minimumStock ?? '-'}</td>
                                    <td style={{ padding: 12, textAlign: 'right' }}>{it.currentStock ?? '-'}</td>
                                    <td style={{ padding: 12 }}>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button onClick={() => openEdit(it)} style={{ fontSize: '12px', padding: '4px 8px' }}>Edit</button>
                                            <button onClick={() => remove(it._id)} style={{ fontSize: '12px', padding: '4px 8px' }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td colSpan={5} style={{ padding: 12, textAlign: 'center' }}>No items</td></tr>
                            )}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                        <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
                        <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            )}

            {formOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
                        <h3 style={{ marginBottom: 12 }}>{editItem ? 'Edit Item' : 'Add Item'}</h3>
                        <form onSubmit={submit} className="responsive-form">
                            <div>
                                <label>Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label>Description</label>
                                <input value={desc} onChange={e => setDesc(e.target.value)} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label>Category</label>
                                <input value={cat} onChange={e => setCat(e.target.value)} required style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label>Minimum Stock</label>
                                <input type="number" min={0} step={1} value={minStock} onChange={e => setMinStock(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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

export default ItemsPage;


