import { useEffect, useState } from 'react';
import { supabaseAdmin } from '../services/supabaseClient';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import './ErrorLogs.css';
import { FiSearch, FiMoreHorizontal, FiDownload, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function SeverityBadge({ level }){
  const cls = `el-severity ${level ? 'sev-' + level.toLowerCase() : ''}`;
  return <span className={cls}>{level}</span>;
}

export default function ErrorLogs(){
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('All');
  const [source, setSource] = useState('All');
  const [resolvedFilter, setResolvedFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(()=>{ loadLogs(); }, []);
  useEffect(()=>{ applyFilters(); }, [logs, query, severity, source, resolvedFilter]);

  async function loadLogs(){
    setLoading(true);
    try{
      const resp = await supabaseAdmin.from('error_logs').select('*').order('created_at', { ascending: false }).limit(1000);
      if (resp && resp.error) { console.error('error_logs query error', resp.error); setLogs([]); }
      else setLogs(resp.data || []);
    }catch(e){ console.error('loadLogs', e); setLogs([]); }
    setLoading(false);
  }

  function applyFilters(){
    let list = (logs || []).slice();
    const q = (query || '').trim().toLowerCase();
    if (q){
      list = list.filter(l => (l.message || '').toLowerCase().includes(q) || (l.stack || '').toLowerCase().includes(q) || (l.user_email || '').toLowerCase().includes(q) || (l.tenant || '').toLowerCase().includes(q));
    }
    if (severity !== 'All') list = list.filter(l => (l.severity || '').toLowerCase() === severity.toLowerCase());
    if (source !== 'All') list = list.filter(l => (l.source || '').toLowerCase() === source.toLowerCase());
    if (resolvedFilter !== 'All') list = list.filter(l => !!l.resolved === (resolvedFilter === 'Resolved'));
    setFiltered(list);
  }

  async function markResolved(id){
    try{
      await supabaseAdmin.from('error_logs').update({ resolved: true }).eq('id', id);
      loadLogs();
    }catch(e){ console.error('markResolved', e); }
  }

  async function bulkResolve(){
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return alert('No logs selected');
    try{
      await supabaseAdmin.from('error_logs').update({ resolved: true }).in('id', ids);
      setSelectedIds(new Set());
      loadLogs();
    }catch(e){ console.error('bulkResolve', e); }
  }

  function toggleSelect(id){
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedIds(s);
  }

  function exportSelected(){
    const rows = filtered.filter(r => selectedIds.size === 0 ? true : selectedIds.has(r.id));
    if (!rows || rows.length === 0) return alert('No rows to export');
    const headers = ['id','created_at','source','service','severity','message','stack','tenant','user_email','resolved'];
    const csvRows = [headers.join(',')].concat(rows.map(r => headers.map(h => {
      const v = r[h];
      if (v === null || v === undefined) return '';
      const s = typeof v === 'object' ? JSON.stringify(v).replace(/"/g,'""') : String(v).replace(/"/g,'""');
      return `"${s}"`;
    }).join(',')));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orvanto_error_logs.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function clearFilters(){ setQuery(''); setSeverity('All'); setSource('All'); setResolvedFilter('All'); }

  const stats = {
    total: logs.length,
    unresolved: (logs || []).filter(l => !l.resolved).length,
    bySeverity: (logs || []).reduce((acc, l) => { const k = (l.severity||'Unknown'); acc[k] = (acc[k]||0)+1; return acc; }, {}),
    bySource: (logs || []).reduce((acc, l) => { const k = (l.source||'Unknown'); acc[k] = (acc[k]||0)+1; return acc; }, {})
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex' }}>
      <Sidebar active="Overview" admin={true} compact={true} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <DashboardHeader showExport={true} showRefresh={true} />

        <div className="el-container">
          <div className="el-header"><div>
            <h1 className="el-title">Error Logs</h1>
            <div className="el-sub">All system errors (frontend, backend, API, DB, workflows)</div>
          </div>
          <div className="el-actions">
            <button className="btn-ghost" onClick={loadLogs}><FiDownload style={{marginRight:8}}/>Refresh</button>
            <button className="btn-ghost" onClick={exportSelected}><FiDownload style={{marginRight:8}}/>Export</button>
            <button className="btn-ghost" onClick={bulkResolve}><FiCheckCircle style={{marginRight:8}}/>Mark Resolved</button>
          </div></div>

          <div className="el-filter-row">
            <div className="el-search"><FiSearch style={{marginRight:8,color:'var(--muted)'}} /><input placeholder="Search message, stack, tenant, user..." value={query} onChange={e=>setQuery(e.target.value)} /></div>
            <div className="el-filters">
              <select value={source} onChange={e=>setSource(e.target.value)}><option>All</option><option value="frontend">Frontend</option><option value="backend">Backend</option><option value="api">API</option><option value="database">Database</option><option value="workflow">Workflow</option></select>
              <select value={severity} onChange={e=>setSeverity(e.target.value)}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
              <select value={resolvedFilter} onChange={e=>setResolvedFilter(e.target.value)}><option>All</option><option>Resolved</option><option>Unresolved</option></select>
              <button className="btn-ghost" onClick={clearFilters}>Clear</button>
            </div>
          </div>

          <div className="el-grid">
            <main className="el-main">
              <div className="card el-table-card">
                <div className="el-table-controls"><div><input type="checkbox" onChange={e=>{ if(e.target.checked) setSelectedIds(new Set((filtered||[]).map(r=>r.id))); else setSelectedIds(new Set()); }} /></div><div className="muted">Showing {filtered.length} of {stats.total} errors</div></div>
                <div className="table-wrap">
                  <table className="el-table">
                    <thead>
                      <tr>
                        <th style={{width:44}}></th>
                        <th style={{width:160}}>Time</th>
                        <th>Source</th>
                        <th>Service</th>
                        <th>Message</th>
                        <th>Tenant / User</th>
                        <th style={{width:120}}>Severity</th>
                        <th style={{width:90}}>Resolved</th>
                        <th style={{width:48}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(filtered||[]).map(row => (
                        <>
                          <tr key={row.id} className="el-row" onClick={(e)=>{
                            // don't toggle when clicking inputs or buttons inside the row
                            const tag = (e.target && e.target.tagName || '').toLowerCase();
                            if (tag === 'input' || e.target.closest && e.target.closest('button')) return;
                            setSelected(selected && selected.id === row.id ? null : row);
                          }}>
                            <td><input type="checkbox" checked={selectedIds.has(row.id)} onChange={(e)=>{ e.stopPropagation(); toggleSelect(row.id); }} /></td>
                            <td className="mono">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                            <td className="muted">{row.source || '-'}</td>
                            <td className="muted">{row.service || row.component || '-'}</td>
                            <td className="el-message">{(row.message || '').slice(0,120)}{(row.message||'').length>120 ? '…':''}</td>
                            <td className="muted"><div>{row.tenant || '-'}</div><div className="user-email muted">{row.user_email || ''}</div></td>
                            <td><SeverityBadge level={row.severity || 'Unknown'} /></td>
                            <td>{row.resolved ? <span className="resolved">Yes</span> : <span className="unresolved">No</span>}</td>
                            <td style={{textAlign:'right'}}>
                              <button className="more-btn" onClick={(e)=>{ e.stopPropagation(); setSelected(selected && selected.id === row.id ? null : row); }}><FiMoreHorizontal /></button>
                            </td>
                          </tr>

                          {selected && selected.id === row.id && (
                            <tr key={row.id + '-expanded'} className="el-expanded-row">
                              <td colSpan={9} className="expanded-td">
                                <div className="expanded-card">
                                  <div className="expanded-actions">
                                    <button className="btn-ghost" onClick={()=>markResolved(row.id)}><FiCheckCircle style={{marginRight:8}}/>Mark Resolved</button>
                                    <button className="btn-ghost" onClick={()=>exportSelected()}><FiDownload style={{marginRight:8}}/>Export</button>
                                    <button className="btn-ghost" onClick={()=>setSelected(null)}><FiXCircle style={{marginRight:8}}/>Close</button>
                                  </div>
                                  <div className="drawer-section"><strong>Message</strong><div className="muted">{row.message}</div></div>
                                  <div className="drawer-section"><strong>Stack / Trace</strong><pre className="event-json">{row.stack || JSON.stringify(row.meta || {}, null, 2)}</pre></div>
                                  <div className="drawer-section"><strong>Metadata</strong><pre className="event-json">{JSON.stringify(row, null, 2)}</pre></div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer"><div className="muted">Bulk actions apply to selected items</div><div className="pagination muted">10 / page</div></div>
              </div>
            </main>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
