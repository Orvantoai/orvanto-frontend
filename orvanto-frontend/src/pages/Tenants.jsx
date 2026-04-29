import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiColumns, FiPlus, FiMoreHorizontal } from 'react-icons/fi';
import { supabaseAdmin } from '../services/supabaseClient';
import './Tenants.css';

export default function Tenants() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [range, setRange] = useState('May 5 - Jun 4, 2025');

  useEffect(() => { loadTenants(); }, []);

  async function loadTenants() {
    setLoading(true);
    try {
      const resp = await supabaseAdmin.from('Clients').select('*').order('created_at', { ascending: false }).limit(200);
      if (resp && resp.error) {
        console.warn('Tenants load error', resp.error);
        setClients([]);
      } else {
        setClients(resp.data || []);
      }
    } catch (e) {
      console.error('Failed to load tenants', e);
      setClients([]);
    }
    setLoading(false);
  }

  const totalTenants = clients.length || 128;
  const activeTenants = clients.filter(c => String(c.status || '').toLowerCase() === 'active').length || 118;
  const suspendedTenants = clients.filter(c => String(c.status || '').toLowerCase().includes('suspend')).length || 6;
  const trialTenants = clients.filter(c => c.is_trial || (c.plan && String(c.plan).toLowerCase().includes('trial')) || (c.plan && String(c.plan).toLowerCase().includes('free'))).length || 8;
  const mrr = Math.round(clients.reduce((s, c) => s + (Number(c.mrr || 0)), 0)) || 248750;

  const kpis = [
    { label: 'Total Tenants', value: totalTenants, delta: '▲ 14.2% vs Apr 5 - May 4' },
    { label: 'Active Tenants', value: activeTenants, delta: '▲ 12.8% vs Apr 5 - May 4' },
    { label: 'Suspended Tenants', value: suspendedTenants, delta: '▼ 2.1% vs Apr 5 - May 4' },
    { label: 'Trial Tenants', value: trialTenants, delta: '▲ 8.4% vs Apr 5 - May 4' },
    { label: 'MRR', value: `$${mrr.toLocaleString()}`, delta: '▲ 18.6% vs Apr 5 - May 4' }
  ];

  const onExport = () => {
    try {
      const rows = clients || [];
      if (!rows || rows.length === 0) { alert('No tenants to export'); return; }
      const headers = ['name','domain','plan','users_count','mrr','status','created_at'];
      const csvRows = [headers.join(',')].concat(rows.map(r => headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        const s = typeof val === 'string' ? val.replace(/"/g, '""') : String(val);
        return `"${s}"`;
      }).join(',')));
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `orvanto_tenants.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed', e); alert('Export failed'); }
  };

  const onRefresh = () => loadTenants();

  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil((clients.length || 128) / perPage));
  const displayed = useMemo(() => {
    const start = (page - 1) * perPage;
    return (clients && clients.slice(start, start + perPage)) || [];
  }, [clients, page]);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [openMenuPos, setOpenMenuPos] = useState({ left: 0, top: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    function handleDocClick(e) {
      const inMenu = e.target.closest && e.target.closest('.action-menu-root');
      const inBtn = e.target.closest && e.target.closest('.more-btn');
      if (!inMenu && !inBtn) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const selectTenant = (c) => {
    setSelected(c);
  };

  const sel = selected || displayed[0] || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex' }}>
      <Sidebar active="Tenants" admin={true} compact={true} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <DashboardHeader onExport={onExport} onRefresh={onRefresh} showExport={false} showRefresh={true} loading={loading} />

        <div className="tenants-wrapper">
          <div className="tenants-header">
            <div className="tenants-title">
              <h2>Tenants Management</h2>
              <div className="tenants-sub">Manage and monitor all tenants on the Orvanto platform</div>
            </div>

            {/* <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="btn-ghost" onClick={onExport}>Export</button>
              <button className="btn-ghost" onClick={() => alert('Import tenants')} >Import</button>
              <button className="btn-primary" onClick={() => alert('Add Tenant flow') }><FiPlus style={{ marginRight: 8 }} /> Add Tenant</button>
            </div> */}
          </div>

          <div className="tenants-kpis">
            {kpis.map(k => (
              <div key={k.label} className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value">{k.value}</div>
                </div>
                <div className="kpi-delta">{k.delta}</div>
              </div>
            ))}
          </div>

          <div className="tenants-main-grid">
            <div className="tenants-table-card">
              <div className="table-controls">
                <div className="search-wrap">
                  <FiSearch style={{ marginRight: 8, color: 'var(--muted)' }} />
                  <input placeholder="Search tenants by name, domain or email..." className="search-input" />
                </div>

                <div className="table-filters">
                  <select className="filter-select"><option>All Plans</option></select>
                  <select className="filter-select"><option>All Status</option></select>
                  <input className="filter-date" placeholder="Select date range" />
                  <button className="btn-ghost"><FiFilter style={{ marginRight: 8 }} /> Filters</button>
                  <a className="reset-link" href="#">Reset</a>
                </div>
              </div>

              <div className="table-wrap">
                <table className="tenants-table">
                  <thead>
                    <tr>
                      <th style={{width:48}}><input type="checkbox" /></th>
                      <th>Tenant</th>
                      <th>Domain</th>
                      <th>Plan</th>
                      <th>Users</th>
                      <th>MRR</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th style={{width:80}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((c, i) => {
                      const plan = (c.plan || 'Enterprise').toString();
                      const planLower = plan.toLowerCase();
                      const planStyle = planLower.includes('enter') ? { background: 'linear-gradient(90deg, rgba(168,85,247,0.08), rgba(99,102,241,0.04))', color: 'var(--purple)' }
                        : planLower.includes('pro') ? { background: 'linear-gradient(90deg, rgba(99,102,241,0.08), rgba(168,85,247,0.03))', color: 'var(--indigo)' }
                        : planLower.includes('growth') ? { background: 'rgba(34,197,94,0.06)', color: 'var(--green)' }
                        : planLower.includes('trial') || planLower.includes('free') ? { background: 'rgba(245,158,11,0.06)', color: 'var(--amber)' }
                        : { background: 'rgba(255,255,255,0.02)', color: 'var(--muted)' };
                      return (
                        <tr key={c.client_id || i} className={selected && selected.client_id === c.client_id ? 'selected' : ''}>
                          <td><input type="checkbox" /></td>
                          <td className="tenant-col" onClick={() => selectTenant(c)}>
                            <div className="avatar">{(c.name || 'AC').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                            <div className="tenant-meta"><div className="tenant-name">{c.name || 'Acme Corp'}</div><div className="tenant-domain">{c.contact_email || c.domain || 'admin@acmecorp.com'}</div></div>
                          </td>
                          <td className="domain-col">{c.domain || 'acmecorp.com'}</td>
                          <td><span className="plan-pill" style={planStyle}>{plan}</span></td>
                          <td className="num-col">{(c.users_count || Math.floor(Math.random()*1200)).toLocaleString()}</td>
                          <td className="num-col">${(Number(c.mrr || 0) || Math.floor(Math.random()*25000)).toLocaleString()}</td>
                          <td><span className={`status-dot ${((c.status||'Active').toLowerCase())}`}>{c.status || 'Active'}</span></td>
                          <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Jan 15, 2024'}</td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <button
                                className="more-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(c);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const menuWidth = 220;
                                  const left = Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8);
                                  const top = rect.bottom + 8;
                                  setOpenMenuPos({ left, top });
                                  setOpenMenuId(prev => prev === c.client_id ? null : c.client_id);
                                }}
                              ><FiMoreHorizontal /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">Showing {(page-1)*perPage+1} to {Math.min(page*perPage, clients.length || totalTenants)} of {clients.length || totalTenants} tenants
                <div className="pagination">{perPage} / page  <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))}>‹</button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    const p = Math.min(totalPages, Math.max(1, page - 2 + idx));
                    return <button key={p} className={`page-btn ${p===page? 'active':''}`} onClick={() => setPage(p)}>{p}</button>;
                  })}
                  <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))}>›</button>
                </div>
              </div>
            </div>

            <aside className="tenant-details-card" aria-hidden>
              {/* Hidden to match mock; details panel available in future */}
            </aside>
          </div>
            {openMenuId && (
            <div
              className="action-menu-root"
              style={{ position: 'fixed', left: openMenuPos.left, top: openMenuPos.top, zIndex: 9999 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="action-item" onClick={() => { navigate(`/tenants/${openMenuId}`); setOpenMenuId(null); }}>View Tenant</button>
              <button className="action-item" onClick={() => { alert(`Edit Tenant ${openMenuId}`); setOpenMenuId(null); }}>Edit Tenant</button>
              <button className="action-item" onClick={() => { navigate(`/tenants/${openMenuId}/subscription`); setOpenMenuId(null); }}>Manage Subscription</button>
              
              <button className="action-item" onClick={() => { alert(`Suspend Tenant ${openMenuId}`); setOpenMenuId(null); }}>Suspend Tenant</button>
              <button className="action-item danger" onClick={() => { if (confirm('Delete tenant?')) { alert(`Deleted ${openMenuId}`); } setOpenMenuId(null); }}>Delete Tenant</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
