import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FiHome, FiUsers, FiCalendar, FiMail, FiDollarSign, FiBarChart2, FiSettings, FiLogOut, FiMoreVertical } from 'react-icons/fi';
import { FaTrophy, FaShareAlt, FaStar, FaTicketAlt, FaLinkedin, FaPhone, FaWhatsapp } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import './Leads.css';

export default function Leads() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');

  const [client, setClient] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  // UI state for Leads page
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [intentFilter, setIntentFilter] = useState('All');
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const sampleLeads = [
    { id: '1', first_name: 'Alex', last_name: 'Thompson', email: 'alex@techcorp.com', company: 'TechCorp', title: 'VP of Sales', status: 'Replied', intent: 'Hot', score: 92, channels: ['linkedin','email','whatsapp'], last_activity: '2h ago', owner: 'John D.' },
    { id: '2', first_name: 'Sophie', last_name: 'Martin', email: 'sophie@innovatelabs.io', company: 'InnovateLabs', title: 'Head of Growth', status: 'Interested', intent: 'Warm', score: 88, channels: ['email','linkedin'], last_activity: '5h ago', owner: 'Sarah M.' },
    { id: '3', first_name: 'Michael', last_name: 'Brown', email: 'michael@dataflow.com', company: 'DataFlow', title: 'CTO', status: 'Contacted', intent: 'Warm', score: 76, channels: ['email','phone'], last_activity: '1d ago', owner: 'John D.' },
    { id: '4', first_name: 'Emily', last_name: 'Davis', email: 'emily@growthnova.com', company: 'GrowthNova', title: 'Head of Marketing', status: 'New', intent: 'Cold', score: 71, channels: ['linkedin'], last_activity: '1d ago', owner: 'Sarah M.' },
    { id: '5', first_name: 'James', last_name: 'Wilson', email: 'james@cloudscale.com', company: 'CloudScale', title: 'Director', status: 'Replied', intent: 'Hot', score: 69, channels: ['email','phone'], last_activity: '2d ago', owner: 'Mike R.' }
  ];

  const loadLeads = async () => {
    setLoading(true);
    try {
      if (!clientId) {
        setErrorMsg('No client ID');
        setLoading(false);
        return;
      }

      const [clientResp, leadsResp] = await Promise.all([
        supabase.from('Clients').select('*').eq('client_id', clientId).limit(1),
        supabase.from('Leads').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(200)
      ]);

      if (clientResp.error) throw clientResp.error;

      if (!clientResp.data || clientResp.data.length === 0) {
        setErrorMsg('Client not found.');
        setLoading(false);
        return;
      }

      setClient(clientResp.data[0]);
      setLeads(leadsResp.data || []);
      setLoading(false);
    } catch (e) {
      setErrorMsg('Error loading leads: ' + e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [clientId]);

  // Realtime: subscribe to Clients and Leads updates for this client
  useEffect(() => {
    if (!clientId) return;
    let clientChannel = null;
    let leadsChannel = null;
    try {
      clientChannel = supabase
        .channel(`clients:${clientId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Clients', filter: `client_id=eq.${clientId}` }, (payload) => {
          const rec = payload.new || payload.record || payload;
          if (rec) setClient(prev => ({ ...(prev || {}), ...rec }));
        })
        .subscribe();

      leadsChannel = supabase
        .channel(`leads:${clientId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Leads', filter: `client_id=eq.${clientId}` }, (payload) => {
          const evt = payload.eventType || payload.type || payload.event || '';
          const newRow = payload.new || payload.record || null;
          const oldRow = payload.old || null;
          setLeads(prev => {
            if (!prev) prev = [];
            if (evt.toUpperCase().includes('INSERT')) return newRow ? [newRow, ...prev] : prev;
            if (evt.toUpperCase().includes('UPDATE')) return prev.map(l => (l.id === (newRow && newRow.id) ? newRow : l));
            if (evt.toUpperCase().includes('DELETE')) {
              const idToRemove = (oldRow && oldRow.id) || (newRow && newRow.id);
              return prev.filter(l => l.id !== idToRemove);
            }
            return prev;
          });
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscribe failed', e);
    }

    return () => {
      try {
        if (clientChannel) supabase.removeChannel(clientChannel);
        if (leadsChannel) supabase.removeChannel(leadsChannel);
      } catch (e) {}
    };
  }, [clientId]);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB');
    } catch (e) {
      return '—';
    }
  };

  // Derived UI data
  const displayLeads = (leads && leads.length > 0) ? leads : sampleLeads;
  const statusCounts = {
    all: displayLeads.length,
    new: displayLeads.filter(l => ((l.status || '').toString().toLowerCase()).includes('new')).length,
    replied: displayLeads.filter(l => ((l.status || '').toString().toLowerCase()).includes('reply') || l.email_replied).length,
    qualified: displayLeads.filter(l => ((l.pipeline_stage || l.stage || '').toString().toLowerCase()).includes('qual') || ((l.status||'').toString().toLowerCase()).includes('qualified')).length,
    hot: displayLeads.filter(l => ((l.intent||'').toString().toLowerCase()) === 'hot').length
  };

  const filteredLeads = displayLeads.filter(l => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      const hay = `${l.first_name||''} ${l.last_name||''} ${l.email||''} ${l.company||''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (statusFilter && statusFilter !== 'All') {
      if (!((l.status||'').toString().toLowerCase().includes(statusFilter.toLowerCase()))) return false;
    }
    if (intentFilter && intentFilter !== 'All') {
      if (!((l.intent||'').toString().toLowerCase().includes(intentFilter.toLowerCase()))) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / rowsPerPage));
  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const allSelectedOnPage = paginatedLeads.length > 0 && paginatedLeads.every(l => selected.has(l.id));
  const toggleSelectAll = () => {
    const s = new Set(selected);
    if (allSelectedOnPage) {
      paginatedLeads.forEach(l => s.delete(l.id));
    } else {
      paginatedLeads.forEach(l => s.add(l.id));
    }
    setSelected(s);
  };
  const toggleSelectOne = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  let selectedLead = null;
  if (selectedLeadId) selectedLead = displayLeads.find(l => l.id === selectedLeadId) || null;
  if (!selectedLead) selectedLead = displayLeads.find(l => selected.has(l.id)) || paginatedLeads[0] || null;

  if (loading) {
    return (
      <div
        id="loading"
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
          background: '#070915',
          color: '#f4f6ff',
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif'
        }}
      >
        <style>{`
          @keyframes portalFaviconSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <img
          src="/favicon.svg?v=3"
          alt="Orvanto loading"
          style={{
            width: 152,
            height: 152,
            animation: 'portalFaviconSpin 1s linear infinite',
            filter: 'drop-shadow(0 0 16px rgba(168,85,247,.35))'
          }}
        />
        <div style={{ fontSize: 25, color: '#c5d0e6' }}>Loading Your Leads...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--dark)' }}>
        <Sidebar client={client} clientId={clientId} active="Leads" />
        <div className="dash-main" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--red)' }}>{errorMsg}</h2>
            {errorMsg === 'No client ID' && <p style={{ color: 'var(--muted)', marginTop: 8 }}>Add <code>?client=your_client_id</code> to the URL</p>}
            <p style={{ marginTop: 16 }}><Link to="/signup" style={{ color: 'var(--purple)' }}>Sign up →</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex', fontFamily: 'Inter, sans-serif', marginTop:40}}>
      {/* Sidebar */}
      <Sidebar client={client} clientId={clientId} active="Leads" />

      {/* Main area */}
      <div style={{ flex: 1, minWidth: 0, background: 'var(--dark)', padding: '0', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(90deg,var(--dark) 80%,var(--border) 100%)',
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 4px 24px 0 rgba(20,20,40,0.18)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 36 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <img src="/orvanto.png" alt="Orvanto logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
              <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>Orvanto AI</span>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 , paddingRight: 36}}>
            <a href="#how-it-works" style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, textDecoration: 'none', transition: 'color 0.2s' }}>How it works</a>
            <a href="#features" style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
            <a href="#about" style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, textDecoration: 'none', transition: 'color 0.2s' }}>About</a>
            <a href="#blog" style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, textDecoration: 'none', transition: 'color 0.2s' }}>Blog</a>
            <a href="#contact" style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, textDecoration: 'none', transition: 'color 0.2s' }}>Contact</a>
            <button onClick={() => loadLeads()} disabled={loading} style={{
              background: 'linear-gradient(135deg,var(--purple),var(--indigo))',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              padding: '12px 20px',
              textDecoration: 'none',
              marginLeft: 0,
              border: 'none',
              boxShadow: '0 2px 16px 0 rgba(80,80,160,0.18)',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.8 : 1
            }}>{loading ? 'Refreshing...' : 'Refresh'}</button>
            <Link to={`/portal?client=${clientId}`} style={{
              background: 'linear-gradient(135deg,var(--purple),var(--indigo))',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              padding: '12px 28px',
              textDecoration: 'none',
              marginLeft: 8,
              boxShadow: '0 2px 16px 0 rgba(80,80,160,0.18)'
            }}>Go to Portal</Link>
          </div>
        </div>

        <div style={{ height: 20 }} />

        <div className="leads-wrap" style={{ padding: '0 36px 48px 36px' }}>
          <div className="leads-kpis">
            <div className="kpi-card">
              <div className="kpi-label">Total Leads</div>
              <div className="kpi-value">{displayLeads.length}</div>
              <div className="kpi-trend">↑ 18.4% <span className="muted-small">vs last 30 days</span></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">New Leads</div>
              <div className="kpi-value">{statusCounts.new || 312}</div>
              <div className="kpi-trend" style={{ color: 'var(--green)' }}>↑ 12.6% <span className="muted-small">last 30 days</span></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Replied</div>
              <div className="kpi-value">{statusCounts.replied || 186}</div>
              <div className="kpi-trend" style={{ color: 'var(--green)' }}>↑ 24.7% <span className="muted-small">last 30 days</span></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Qualified</div>
              <div className="kpi-value">{statusCounts.qualified || 98}</div>
              <div className="kpi-trend" style={{ color: 'var(--green)' }}>↑ 15.3% <span className="muted-small">last 30 days</span></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Hot Leads</div>
              <div className="kpi-value">{statusCounts.hot || 45}</div>
              <div className="kpi-trend" style={{ color: 'var(--green)' }}>↑ 31.2% <span className="muted-small">last 30 days</span></div>
            </div>
          </div>

          <div className="leads-controls">
            <div className="search-row">
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search leads by name, company, email..." className="leads-search" />
              {/* <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn-small">Import Leads</button>
                <button className="btn-add">+ Add Lead</button>
              </div> */}
            </div>
            <div className="filters-row">
              <div className="filter-chips">
                <button className={`chip ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => { setStatusFilter('All'); setPage(1); }}>All Leads <span className="chip-count">{statusCounts.all}</span></button>
                <button className={`chip ${statusFilter === 'New' ? 'active' : ''}`} onClick={() => { setStatusFilter('New'); setPage(1); }}>New <span className="chip-count">{statusCounts.new}</span></button>
                <button className={`chip ${statusFilter === 'Replied' ? 'active' : ''}`} onClick={() => { setStatusFilter('Replied'); setPage(1); }}>Replied <span className="chip-count">{statusCounts.replied}</span></button>
                <button className={`chip ${statusFilter === 'Qualified' ? 'active' : ''}`} onClick={() => { setStatusFilter('Qualified'); setPage(1); }}>Qualified <span className="chip-count">{statusCounts.qualified}</span></button>
                <button className={`chip ${statusFilter === 'Hot' ? 'active' : ''}`} onClick={() => { setStatusFilter('Hot'); setPage(1); }}>Hot <span className="chip-count">{statusCounts.hot}</span></button>
              </div>
              <div className="more-filters">
                <select value={intentFilter} onChange={(e) => { setIntentFilter(e.target.value); setPage(1); }} className="lead-filter">
                  <option>All</option>
                  <option>Hot</option>
                  <option>Warm</option>
                  <option>Cold</option>
                </select>
              </div>
            </div>
          </div>

          <div className="leads-main-grid">
            <div className="leads-table-card">
              {/* <div className="bulk-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAll} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-small">Email</button>
                    <button className="btn-small">Add to Sequence</button>
                    <button className="btn-small">Move to Pipeline</button>
                    <button className="btn-small">Export</button>
                    <button className="btn-danger">Delete</button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select className="lead-filter" onChange={(e) => { setPage(1); }}>
                    <option>Sort: Last Activity</option>
                  </select>
                </div>
              </div> */}

              <div className="table-wrapper">
                <table className="leads-list-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}><input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAll} /></th>
                      <th style={{ minWidth: 220 }}>Lead</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Intent</th>
                      <th>Score</th>
                      <th>Channel</th>
                      <th>Last Activity</th>
                      <th>Owner</th>
                      <th style={{ width: 44 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.length === 0 ? (
                      <tr><td colSpan="10" className="no-leads">No leads to show.</td></tr>
                    ) : (
                      paginatedLeads.map((l) => (
                        <tr key={l.id} onClick={() => setSelectedLeadId(l.id)} className={selectedLeadId === l.id ? 'selected' : ''} style={{ cursor: 'pointer' }}>
                          <td><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelectOne(l.id)} onClick={(e) => e.stopPropagation()} /></td>
                          <td>
                            <div className="lead-name-cell">
                              <div className="avatar">{(l.first_name||'').slice(0,1)}{(l.last_name||'').slice(0,1)}</div>
                              <div style={{ marginLeft: 12 }}>
                                <div className="lead-name">{l.first_name} {l.last_name}</div>
                                <div className="lead-email">{l.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="lead-company">{l.company}</div>
                            <div className="lead-title">{l.title}</div>
                          </td>
                          <td><span className={`badge status-${(l.status||'').toLowerCase()}`}>{l.status}</span></td>
                          <td><span className={`intent intent-${(l.intent||'').toLowerCase()}`}>{l.intent || '—'}</span></td>
                          <td className="score-col">{l.score || '—'}</td>
                          <td className="channels-col">
                            {(l.channels || []).map(ch => {
                              if (ch === 'linkedin') return <FaLinkedin key={ch} title="LinkedIn" style={{ color: 'var(--indigo)', marginRight: 8 }} />;
                              if (ch === 'email') return <FiMail key={ch} title="Email" style={{ color: 'var(--purple)', marginRight: 8 }} />;
                              if (ch === 'phone') return <FaPhone key={ch} title="Phone" style={{ color: 'var(--amber)', marginRight: 8 }} />;
                              if (ch === 'whatsapp') return <FaWhatsapp key={ch} title="WhatsApp" style={{ color: 'var(--green)', marginRight: 8 }} />;
                              return null;
                            })}
                          </td>
                          <td className="last-activity">{l.last_activity || formatDate(l.last_reply_at || l.emailed_at || l.created_at)}</td>
                          <td className="owner-col">{l.owner || '—'}</td>
                          <td className="actions-col"><button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}>{/* menu */}<FiMoreVertical /></button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="rows-info">Showing {((page-1)*rowsPerPage)+1} to {Math.min(page*rowsPerPage, filteredLeads.length)} of {filteredLeads.length} leads</div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p-1))}>&lt;</button>
                    {Array.from({ length: totalPages }).slice(0,5).map((_, idx) => (
                      <button key={idx+1} className={`pagination-btn ${page === idx+1 ? 'active' : ''}`} onClick={() => setPage(idx+1)}>{idx+1}</button>
                    ))}
                    <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))}>&gt;</button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="lead-detail-panel">
              {selectedLead ? (
                <div>
                  <div className="profile-head">
                    <div className="profile-avatar">{(selectedLead.first_name||'').slice(0,1)}{(selectedLead.last_name||'').slice(0,1)}</div>
                    <div style={{ marginLeft: 12 }}>
                      <div className="profile-name">{selectedLead.first_name} {selectedLead.last_name}</div>
                      <div className="profile-title">{selectedLead.title || ''}</div>
                      <div style={{ marginTop: 8 }}>
                        <span className={`badge`}>{selectedLead.intent}</span>
                        <span style={{ marginLeft: 8 }} className={`badge`}><strong>{selectedLead.status}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <div className="detail-section">
                      <div className="detail-title">Contact Information</div>
                      <div className="detail-row">Email: <span className="td-muted">{selectedLead.email}</span></div>
                      <div className="detail-row">Phone: <span className="td-muted">{selectedLead.phone || '—'}</span></div>
                      <div className="detail-row">Company: <span className="td-muted">{selectedLead.company}</span></div>
                    </div>
                    <div className="detail-section" style={{ marginTop: 12 }}>
                      <div className="detail-title">Lead Details</div>
                      <div className="detail-row">Intent: <span className={`intent intent-${(selectedLead.intent||'').toLowerCase()}`}>{selectedLead.intent}</span></div>
                      <div className="detail-row">Score: <strong>{selectedLead.score}</strong></div>
                    </div>
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ flex: 1 }}>Send Email</button>
                      <button className="btn-small">Add to Sequence</button>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button className="btn-secondary">Book Meeting</button>
                      <button className="btn-danger">Delete Lead</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--muted)' }}>Select a lead to see details</div>
              )}
            </aside>
          </div>
        </div>

      </div>
    </div>
  );
}
