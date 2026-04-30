import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import './AuditLogs.css';
import { FiSearch, FiFilter, FiMoreHorizontal } from 'react-icons/fi';

function SeverityBadge({ level }){
  const cls = `severity-badge ${level ? 'sev-' + level.toLowerCase() : ''}`;
  return <span className={cls}>{level}</span>;
}

export default function AuditLogs(){
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const kpis = [
    { label: 'Total Events', value: '12,458', delta: '+18.6%' },
    { label: 'Unique Users', value: '326', delta: '+12.4%' },
    { label: 'Critical Events', value: '120', delta: '-5.1%' },
    { label: 'Login Events', value: '2,458', delta: '+8.8%' },
    { label: 'Failed Logins', value: '84', delta: '-10.4%' },
    { label: 'Data Changes', value: '5,142', delta: '+15.2%' }
  ];

  const sample = [
    { id:1, time:'Jun 4, 2025 · 03:45 PM', user:'John Doe', email:'john@acmecorp.com', tenant:'Acme Corp', action:'Updated Plan', resource:'Subscription', details:'Pro → Enterprise', ip:'192.168.1.10', severity:'Medium' },
    { id:2, time:'Jun 4, 2025 · 03:22 PM', user:'Sarah Connor', email:'sarah@acmecorp.com', tenant:'Acme Corp', action:'Created User', resource:'User', details:'Created new user Michael Scott', ip:'192.168.1.23', severity:'Low' },
    { id:3, time:'Jun 4, 2025 · 02:45 PM', user:'Super Admin', email:'super@orvanto.com', tenant:'-', action:'Deleted Tenant', resource:'Tenant', details:'Deleted tenant TechNova', ip:'10.0.0.5', severity:'Critical' },
    { id:4, time:'Jun 4, 2025 · 01:17 PM', user:'Michael Scott', email:'michael@dundermifflin.com', tenant:'Dunder Mifflin', action:'Updated Settings', resource:'Tenant Settings', details:'Updated email sending limit', ip:'172.16.0.8', severity:'Medium' },
    { id:5, time:'Jun 4, 2025 · 12:05 PM', user:'Emily Watson', email:'emily@futuretech.io', tenant:'FutureTech', action:'Login', resource:'Authentication', details:'User logged in successfully', ip:'192.168.1.44', severity:'Low' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex' }}>
      <Sidebar active="Audit Logs" admin={true} compact={true} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <DashboardHeader showExport={true} showRefresh={true} />

        <div className="al-container">
          <div className="al-header">
            <div>
              <h1 className="al-title">Audit Logs</h1>
              <div className="al-sub">Track and monitor all critical actions and changes across the platform</div>
            </div>
            <div className="al-actions">
              <div className="al-date">May 5 - Jun 4, 2025</div>
              <button className="btn-ghost">Filters</button>
              <button className="btn-ghost">Export</button>
            </div>
          </div>

          <div className="al-kpis">
            {kpis.map(k => (
              <div key={k.label} className="al-kpi">
                <div className="kpi-top"><div className="kpi-label-sm">{k.label}</div><div className="kpi-delta">{k.delta}</div></div>
                <div className="kpi-value-lg">{k.value}</div>
              </div>
            ))}
          </div>

          <div className="al-filter-row">
            <div className="al-search">
              <FiSearch style={{ marginRight: 8, color: 'var(--muted)' }} />
              <input placeholder="Search by user, action, resource, IP..." value={query} onChange={(e)=>setQuery(e.target.value)} />
            </div>
            <div className="al-filters">
              <select><option>All Tenants</option></select>
              <select><option>All Users</option></select>
              <select><option>All Actions</option></select>
              <select><option>All Resources</option></select>
              <select><option>All Severity</option></select>
              <button className="btn-ghost">Clear Filters</button>
            </div>
          </div>

          <div className="al-subtabs">
            {['All Logs','User Management','Tenant Management','Billing & Subscription','System & Security','Data Changes','Integrations','API Activity'].map(t => (
              <button key={t} className={`subtab ${t==='All Logs' ? 'active':''}`}>{t}</button>
            ))}
          </div>

          <div className="al-grid">
            <main className="al-main">
              <div className="al-table-card card">
                <div className="al-table-controls">
                  <div className="bulk-actions"><input type="checkbox" /> <button className="btn-ghost">Export Selected</button></div>
                  <div className="table-meta">Showing 1 to {sample.length} of 12,458 events</div>
                </div>

                <div className="table-wrap">
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th style={{width:44}}><input type="checkbox" /></th>
                        <th style={{width:160}}>Time</th>
                        <th style={{width:220}}>User</th>
                        <th>Tenant</th>
                        <th>Action</th>
                        <th>Resource</th>
                        <th>Details</th>
                        <th>IP</th>
                        <th style={{width:110}}>Severity</th>
                        <th style={{width:48}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sample.map(row => (
                        <tr key={row.id} className="audit-row" onClick={() => setSelected(row)}>
                          <td><input type="checkbox" /></td>
                          <td className="mono">{row.time}</td>
                          <td>
                            <div className="user-cell"><div className="user-name">{row.user}</div><div className="user-email muted">{row.email}</div></div>
                          </td>
                          <td className="muted">{row.tenant}</td>
                          <td>{row.action}</td>
                          <td className="muted">{row.resource}</td>
                          <td className="muted">{row.details}</td>
                          <td className="mono muted">{row.ip}</td>
                          <td><SeverityBadge level={row.severity} /></td>
                          <td style={{textAlign:'right'}}><button className="more-btn"><FiMoreHorizontal /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer"> <div className="muted">1 2 3 … 1,246</div><div className="pagination">10 / page</div> </div>
              </div>
            </main>

            <aside className="al-right">
              <div className="card right-actions">
                <h4>Actions</h4>
                <button className="action-btn">View Critical Events</button>
                <button className="action-btn">View Failed Logins</button>
                <button className="action-btn">View Data Changes</button>
                <button className="action-btn">Export Audit Logs</button>
              </div>

              <div className="card right-card">
                <h4>Events by Severity</h4>
                <div className="donut-small" style={{ background: 'conic-gradient(#ef4444 0 5%, #f97316 0 15%, #f59e0b 0 35%, #22c55e 0 100%)' }}><div className="donut-center-small">12,458</div></div>
              </div>

              <div className="card right-card">
                <h4>Events Over Time</h4>
                <svg viewBox="0 0 200 80" className="mini-line"><polyline fill="none" stroke="#8b5cf6" strokeWidth="2" points="0,70 20,60 40,58 60,50 80,46 100,40 120,38 140,36 160,30 180,24 200,20" /></svg>
              </div>

              <div className="card right-card">
                <h4>Top Active Users</h4>
                <ul className="top-users"><li>Super Admin <span>2,458</span></li><li>John Doe <span>1,245</span></li><li>Sarah Connor <span>842</span></li><li>Michael Scott <span>621</span></li></ul>
              </div>
            </aside>
          </div>

          {selected && (
            <div className="al-drawer" onClick={() => setSelected(null)}>
              <div className="drawer-card" onClick={(e)=>e.stopPropagation()}>
                <div className="drawer-head"><h4>Event Details</h4><div className="muted mono">{selected.time}</div></div>
                <pre className="event-json">{JSON.stringify(selected, null, 2)}</pre>
                <div className="drawer-actions"><button className="btn-ghost" onClick={() => setSelected(null)}>Close</button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
