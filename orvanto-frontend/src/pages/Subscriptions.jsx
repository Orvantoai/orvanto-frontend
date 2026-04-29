import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';
import './Subscriptions.css';

export default function Subscriptions(){
  const [activeTab, setActiveTab] = useState('Subscriptions');

  const stats = [
    { label: 'Total MRR', value: '$248,750', delta: '▲ 18.6%' },
    { label: 'Active Subscriptions', value: '128', delta: '▲ 12.4%' },
    { label: 'Total Paid', value: '$2,984,540', delta: '▲ 16.2%' },
    { label: 'Overdue', value: '$12,450', delta: '▼ 5.1%' },
    { label: 'Trial Tenants', value: '18', delta: '▲ 8.2%' },
    { label: 'Usage %', value: '41%', delta: '—' }
  ];

  const sample = Array.from({ length: 8 }).map((_, i) => ({
    id: `tenant-${i+1}`,
    tenant: ['Acme Corp','Growth Labs','SaaSify','TechNova','BluePeak','InnovateX','FutureTech','Cloudly'][i],
    domain: ['acmecorp.com','growthlabs.io','saasify.com','technova.io','bluepeak.com','innovatex.ai','futuretech.io','cloudly.com'][i],
    plan: ['Enterprise','Pro','Growth','Pro','Growth','Enterprise','Pro','Growth'][i],
    status: ['Active','Active','Active','Trial','Active','Past Due','Active','Active'][i],
    billing: 'Monthly',
    mrr: ['$24,950','$12,450','$7,950','$6,250','$5,250','$21,000','$3,950','$3,250'][i],
    next: ['Jul 15, 2025','Jul 10, 2025','Jul 22, 2025','Jul 11, 2025','Aug 03, 2025','Jun 20, 2025','Jul 28, 2025','Jul 30, 2025'][i],
    users: [1248,856,643,512,432,1062,321,287][i]
  }));

  const tabs = ['Subscriptions','Invoices','Payments','Usage','Coupons','Payment Methods','Plans'];

  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openMenuPos, setOpenMenuPos] = useState({ left: 0, top: 0 });
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    function handleDocClick(e) {
      const inMenu = e.target.closest && e.target.closest('.action-menu-root');
      const inBtn = e.target.closest && e.target.closest('.more-btn');
      if (!inMenu && !inBtn) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex' }}>
      <Sidebar active="Subscriptions" admin={true} compact={true} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <DashboardHeader showExport={true} showRefresh={true} />

        <div className="subs-container">
          <div className="subs-header-row">
            <div>
              <h1 className="page-title">Billing & Subscription</h1>
              <div className="page-sub">Manage your plan, billing, payments, and usage</div>
            </div>
            <div className="page-actions">
              <div className="date-filter">May 5 - Jun 4, 2025</div>
              <button className="btn-ghost">Export</button>
            </div>
          </div>

          <div className="stats-strip">
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-top"><div className="stat-icon" /> <div className="stat-delta">{s.delta}</div></div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="tabs-row">
            {tabs.map(t => (
              <button key={t} className={`tab-btn ${activeTab===t? 'active':''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          <div className="subs-grid">
            <main className="subs-main">
              {activeTab === 'Subscriptions' && (
                <div className="card subs-card">
                  <div className="subs-controls">
                    <div className="search-box"><input placeholder="Search tenant or domain..." /></div>
                    <div className="subs-filters">
                      <select><option>All Plans</option></select>
                      <select><option>All Status</option></select>
                      <button className="btn-primary">+ Add Subscription</button>
                    </div>
                  </div>

                  <div className="table-wrap">
                    <table className="subscriptions-table">
                      <thead>
                        <tr><th>Tenant</th><th>Plan</th><th>Status</th><th>Billing Cycle</th><th>MRR</th><th>Next Billing Date</th><th>Users</th><th style={{width:80}}>Actions</th></tr>
                      </thead>
                      <tbody>
                        {sample.map((r, i) => (
                          <tr key={i}>
                            <td className="tenant-col"><div className="avatar">{r.tenant.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div className="tenant-meta"><div className="tenant-name">{r.tenant}</div><div className="tenant-domain">{r.domain}</div></div></td>
                            <td><span className="plan-pill">{r.plan}</span></td>
                            <td><span className={`status-dot ${r.status.toLowerCase().replace(/ /g,'')}`}>{r.status}</span></td>
                            <td>{r.billing}</td>
                            <td>{r.mrr}</td>
                            <td>{r.next}</td>
                            <td>{r.users.toLocaleString()}</td>
                            <td style={{textAlign:'right'}}>
                              <button
                                className="more-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRow(r);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const menuWidth = 240;
                                  const left = Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8);
                                  const top = rect.bottom + 8;
                                  setOpenMenuPos({ left, top });
                                  setOpenMenuId(prev => prev === r.id ? null : r.id);
                                }}
                              ><FiMoreHorizontal /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>

                    <div className="table-footer">Showing 1 to {sample.length} of {sample.length} subscriptions <div className="pagination">1 2 3 …</div></div>

                    {openMenuId && (
                      <div
                        className="action-menu-root"
                        style={{ position: 'fixed', left: openMenuPos.left, top: openMenuPos.top, zIndex: 9999 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="action-item" onClick={() => { navigate(`/tenants/${openMenuId}`); setOpenMenuId(null); }}>View Tenant</button>
                        <button className="action-item" onClick={() => { navigate(`/tenants/${openMenuId}/subscription`); setOpenMenuId(null); }}>Manage Subscription</button>
                        <button className="action-item" onClick={() => { alert(`Open invoices for ${openMenuId}`); setOpenMenuId(null); }}>View Invoices</button>
                        <button className="action-item" onClick={() => {
                          const row = selectedRow || sample.find(s => s.id === openMenuId);
                          if (!row) { alert('No tenant data available'); setOpenMenuId(null); return; }
                          try {
                            const headers = ['tenant','domain','plan','status','billing','mrr','next','users'];
                            const csvRow = headers.map(h => `"${String(row[h]||'')}"`).join(',');
                            const csv = [headers.join(','), csvRow].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `${row.tenant.replace(/\s+/g,'_')}_subscription.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                          } catch (e) { console.error(e); alert('Export failed'); }
                          setOpenMenuId(null);
                        }}>Export Tenant</button>

                        <button className="action-item" onClick={() => { if (confirm('Send invoice to tenant?')) { alert('Invoice sent'); } setOpenMenuId(null); }}>Send Invoice</button>
                        <button className="action-item" onClick={() => { if (confirm('Cancel subscription? This will stop future billing.')) { alert('Subscription canceled'); } setOpenMenuId(null); }}>Cancel Subscription</button>
                        <button className="action-item" onClick={() => { if (confirm('Suspend tenant?')) { alert('Tenant suspended'); } setOpenMenuId(null); }}>Suspend Tenant</button>
                        <button className="action-item danger" onClick={() => { if (confirm('Delete tenant? This action is irreversible.')) { alert('Tenant deleted'); } setOpenMenuId(null); }}>Delete Tenant</button>
                      </div>
                    )}
                  </div>
              )}

              {activeTab !== 'Subscriptions' && (
                <div className="card subs-card"><div className="muted" style={{ padding: 24 }}>Placeholder content for the <strong>{activeTab}</strong> tab.</div></div>
              )}
            </main>

            <aside className="subs-right">
              <div className="card right-card">
                <h4>Subscription Distribution</h4>
                <div className="donut">128</div>
                <ul className="dist-list"><li>Enterprise <span>32 (25%)</span></li><li>Pro <span>41 (32%)</span></li><li>Growth <span>38 (30%)</span></li><li>Starter <span>17 (13%)</span></li></ul>
              </div>

              <div className="card right-card">
                <h4>Revenue Overview</h4>
                <div className="chart-placeholder">Revenue chart</div>
              </div>

              <div className="card right-card">
                <h4>Top Paying Tenants</h4>
                <ul className="top-tenants"><li>Acme Corp <span>$24,950</span></li><li>InnovateX <span>$21,900</span></li><li>Growth Labs <span>$12,450</span></li></ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
