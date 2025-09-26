import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

type NavItem = { path: string; label: string; icon: React.ReactNode };
const Icon = {
    Dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
    ),
    Items: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 16V8a2 2 0 0 0-1.106-1.789l-7-3.5a2 2 0 0 0-1.788 0l-7 3.5A2 2 0 0 0 3 8v8a2 2 0 0 0 1.106 1.789l7 3.5a2 2 0 0 0 1.788 0l7-3.5A2 2 0 0 0 21 16zM12 4.236 18.618 7.5 12 10.764 5.382 7.5 12 4.236zM5 9.618l6 3v7.146l-6-3V9.618zm8 10.146V12.618l6-3v7.146l-6 3z"/>
        </svg>
    ),
    Suppliers: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.96 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
    ),
    Customers: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
    ),
    Inward: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v6h2V5h14v6h2V5c0-1.1-.9-2-2-2zM11 12 8 9l-1.41 1.41L12 15.83l5.41-5.42L16 9l-3 3V3h-2v9zM5 19h14v-6h2v8H3v-8h2v6z"/>
        </svg>
    ),
    Outward: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v6h2V5h14v6h2V5c0-1.1-.9-2-2-2zM13 12l3-3 1.41 1.41L12 15.83 6.59 10.41 8 9l3 3V3h2v9zM5 19h14v-6h2v8H3v-8h2v6z"/>
        </svg>
    ),
    Reports: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zM3 9h2V7H3v2zm4 8h14v-2H7v2zm0-4h14v-2H7v2zm0-6v2h14V7H7z"/>
        </svg>
    ),
    Logs: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 3h18v2H3V3zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
        </svg>
    )
};

const navItems: Array<NavItem> = [
    { path: '/', label: 'Dashboard', icon: Icon.Dashboard },
    { path: '/items', label: 'Items', icon: Icon.Items },
    { path: '/suppliers', label: 'Suppliers', icon: Icon.Suppliers },
    { path: '/customers', label: 'Customers', icon: Icon.Customers },
    { path: '/inward', label: 'Inward', icon: Icon.Inward },
    { path: '/outward', label: 'Outward', icon: Icon.Outward },
    { path: '/reports', label: 'Reports', icon: Icon.Reports },
    { path: '/logs', label: 'Logs', icon: Icon.Logs },
];

const SidebarLayout: React.FC<{ children: React.ReactNode; onLogout?: () => void }>
    = ({ children, onLogout }) => {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const sidebarWidth = useMemo(() => collapsed ? 64 : 240, [collapsed]);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [pwdOpen, setPwdOpen] = useState(false);
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [savingPwd, setSavingPwd] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const onNavClick = () => {
        if (isMobile) setMobileOpen(false);
    };
    return (
        <>
        <div style={{ display: 'grid', gridTemplateRows: '56px 1fr', minHeight: '100vh', background: 'var(--app-bg)' }}>
            {/* Top Header */}
            <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--header-bg)', color: 'var(--header-fg)', position: 'relative', zIndex: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isMobile && (
                        <button aria-label="Open menu" onClick={() => setMobileOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--header-fg)', cursor: 'pointer', padding: 8 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
                        </button>
                    )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.5, justifySelf: 'center' }}>OM ENGINEERING WORKS</div>
                <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                    <button onClick={() => setProfileOpen(v => !v)} aria-label="Profile" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer', width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    </button>
                    {onLogout && (
                        <button onClick={onLogout} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Logout</button>
                    )}
                    {profileOpen && (
                        <div style={{ position: 'absolute', right: 0, top: 48, background: '#fff', color: '#111', border: '1px solid var(--border)', borderRadius: 8, minWidth: 220, boxShadow: '0 6px 20px rgba(0,0,0,.12)', overflow: 'hidden', zIndex: 70 }}>
                            <div style={{ padding: '10px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{user?.name || 'Admin'}</div>
                            <button onClick={() => { setPwdOpen(true); setProfileOpen(false); }} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 12px', cursor: 'pointer' }}>Change Password</button>
                            {onLogout && <button onClick={onLogout} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 12px', cursor: 'pointer' }}>Logout</button>}
                        </div>
                    )}
                </div>
            </header>
            {/* Body with Sidebar + Content */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : sidebarWidth + 'px 1fr', minHeight: 0 }}>
                {/* Sidebar */}
                <aside style={{
                    borderRight: '1px solid var(--border)',
                    padding: 12,
                    overflowY: 'auto',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-fg)',
                    position: isMobile ? 'fixed' : 'relative',
                    top: isMobile ? 56 : undefined,
                    left: 0,
                    height: isMobile ? 'calc(100vh - 56px)' : 'auto',
                    width: isMobile ? (collapsed ? 64 : 260) : undefined,
                    transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                    transition: 'transform 200ms ease',
                    zIndex: 50
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <button aria-label="More" title="Menu" onClick={() => setCollapsed(v => !v)} style={{ background: 'transparent', color: 'var(--sidebar-fg)', border: 'none', cursor: 'pointer', padding: 6 }}>
                            <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--sidebar-fg)', marginRight: 3 }} />
                            <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--sidebar-fg)', marginRight: 3 }} />
                            <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--sidebar-fg)' }} />
                        </button>
                        {!collapsed && <div style={{ fontSize: 12, color: '#6b7280' }}>Menu</div>}
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {navItems.map(item => (
                            <Link key={item.path} to={item.path} onClick={onNavClick} className="nav-link" style={{
                                padding: '10px 12px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                color: pathname === item.path ? '#fff' : 'var(--sidebar-fg)',
                                background: pathname === item.path ? 'var(--primary)' : 'transparent',
                                fontWeight: pathname === item.path ? 600 : 500,
                                display: 'grid',
                                gridTemplateColumns: collapsed ? '1fr' : '20px 1fr',
                                alignItems: 'center',
                                justifyContent: 'center',
                                columnGap: 8,
                                textAlign: collapsed ? 'center' : 'left'
                            }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.icon}
                                </span>
                                <span style={{ display: collapsed ? 'none' : 'inline' }}>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>
                {/* Backdrop for mobile */}
                {isMobile && mobileOpen && (
                    <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, top: 56, background: 'rgba(0,0,0,.35)', zIndex: 40 }} />
                )}
                <main style={{ padding: 16, overflow: 'auto', background: 'var(--content-bg)' }}>{children}</main>
            </div>
        </div>
        {pwdOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }} onClick={() => !savingPwd && setPwdOpen(false)}>
                <div style={{ background: '#fff', padding: 16, borderRadius: 8, width: 'min(100% - 24px, 420px)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Change Password</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div>
                            <label>Current Password</label>
                            <input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>New Password</label>
                            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={{ width: '100%' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="button" onClick={() => setPwdOpen(false)} disabled={savingPwd}>Cancel</button>
                            <button type="button" onClick={() => setPwdOpen(false)} disabled={savingPwd}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default SidebarLayout;


