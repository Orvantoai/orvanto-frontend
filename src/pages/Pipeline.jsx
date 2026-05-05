import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FiHome, FiUsers, FiCalendar, FiMail, FiDollarSign, FiBarChart2, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaTrophy, FaShareAlt, FaStar, FaTicketAlt } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import './Pipeline.css';

export default function Pipeline() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client') || 'orvanto_self';

  const [client, setClient] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      if (!clientId) {
        setErrorMsg('No client ID');
        setLoading(false);
        return;
      }

      const [clientResp, leadsResp] = await Promise.all([
        supabase.from('Clients').select('*').eq('client_id', clientId).limit(1),
        supabase.from('Leads').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(500)
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
      setErrorMsg('Error loading pipeline: ' + e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
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

  const fmt = (n) => {
    return `$${Number(n || 0).toLocaleString()}`;
  };

  const stageOf = (l) => {
    const stage = (l.pipeline_stage || l.stage || l.deal_stage || l.deal_status || '').toString().toLowerCase();
    if (!stage) return 'Lead';
    if (stage.includes('qual')) return 'Qualified';
    if (stage.includes('close') || stage.includes('won')) return 'Closed';
    if (stage.includes('lead')) return 'Lead';
    return 'Lead';
  };

  const stages = ['Lead', 'Qualified', 'Closed'];
  const buckets = { Lead: [], Qualified: [], Closed: [] };
  leads.forEach(l => {
    const s = stageOf(l);
    buckets[s] = buckets[s] || [];
    buckets[s].push(l);
  });

  const sumDeal = (arr) => arr.reduce((s, x) => s + (parseFloat(x.deal_value || x.deal || 0) || 0), 0);
  const totals = {
    Lead: sumDeal(buckets.Lead),
    Qualified: sumDeal(buckets.Qualified),
    Closed: sumDeal(buckets.Closed),
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-GB'); } catch (e) { return '—'; }
  };

  const qualifiedRate = (buckets.Lead.length === 0) ? 0 : Math.round((buckets.Qualified.length / buckets.Lead.length) * 100);
  const closeRate = (buckets.Qualified.length === 0) ? 0 : Math.round((buckets.Closed.length / buckets.Qualified.length) * 100);

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
        <div style={{ fontSize: 25, color: '#c5d0e6' }}>Loading Your Pipeline...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--dark)' }}>
        <div className="sidebar">
          <div className="logo-text" style={{ padding: '0 20px 24px' }}>Orvanto AI</div>
        </div>
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
      <Sidebar client={client} clientId={clientId} active="Pipeline" />

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
            <button onClick={() => loadPipeline()} disabled={loading} style={{
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

        <div className="pipeline-wrap">
          <div className="pipeline-top">
            <div className="kpis-row">
              <div className="kpi-card">
                <div className="kpi-title">Total Pipeline Value</div>
                <div className="kpi-value">{fmt(sumDeal(leads))}</div>
                <div className="kpi-sub">▲ 18.6% vs Apr 5 - May 4</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Total Deals</div>
                <div className="kpi-value">{leads.length}</div>
                <div className="kpi-sub">+12.3% vs Apr 5 - May 4</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Weighted Value</div>
                <div className="kpi-value">{fmt(sumDeal(leads))}</div>
                <div className="kpi-sub">+16.4% vs Apr 5 - May 4</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Avg Deal Value</div>
                <div className="kpi-value">{leads.length ? fmt(Math.round(sumDeal(leads)/Math.max(1,leads.length))) : fmt(0)}</div>
                <div className="kpi-sub">+8.7% vs Apr 5 - May 4</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Win Rate (Est.)</div>
                <div className="kpi-value">{closeRate}%</div>
                <div className="kpi-sub">+5.2% vs Apr 5 - May 4</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Closed Won Value</div>
                <div className="kpi-value">{fmt(totals.Closed || 0)}</div>
                <div className="kpi-sub">+22.1% vs Apr 5 - May 4</div>
              </div>
            </div>

            <div className="pipeline-controls">
              <input className="pipeline-search" placeholder="Search deals by name, company..." />
              <div className="pipeline-filters">
                <select><option>All Owners</option></select>
                <select><option>All Deal Stages</option></select>
                <select><option>All Sources</option></select>
                <button className="btn-small">Filters</button>
              </div>
              <div className="pipeline-actions">
                <button className="btn-small">Board</button>
                <button className="btn-small">Export</button>
                <button className="btn-add">+ Add Deal</button>
              </div>
            </div>
          </div>

          <div className="pipeline-board">
            <div className="board-columns">
              {(() => {
                const pipelineColumns = [
                  { key: 'Qualified', title: '1. Qualified', color: '#7c3aed' },
                  { key: 'Proposal Sent', title: '2. Proposal Sent', color: '#06b6d4' },
                  { key: 'Negotiation', title: '3. Negotiation', color: '#60a5fa' },
                  { key: 'Closing', title: '4. Closing', color: '#d97706' },
                  { key: 'Closed Won', title: '5. Closed Won', color: '#059669' },
                  { key: 'Closed Lost', title: '6. Closed Lost', color: '#be185d' }
                ];
                const colBuckets = pipelineColumns.reduce((acc, c) => (acc[c.key] = [], acc), {});
                const columnOf = (l) => {
                  const s = ((l.pipeline_stage || l.stage || l.deal_stage || l.deal_status || '') + '').toLowerCase();
                  if (s.includes('qual')) return 'Qualified';
                  if (s.includes('proposal')) return 'Proposal Sent';
                  if (s.includes('negoti')) return 'Negotiation';
                  if (s.includes('closing') && !s.includes('closed')) return 'Closing';
                  if (s.includes('lost')) return 'Closed Lost';
                  if (s.includes('won') || s.includes('closed')) return 'Closed Won';
                  if (l.is_lost) return 'Closed Lost';
                  if (l.is_closed || (l.deal_status && l.deal_status.toLowerCase().includes('closed'))) return 'Closed Won';
                  return 'Qualified';
                };
                leads.forEach(l => { const col = columnOf(l); colBuckets[col] = colBuckets[col] || []; colBuckets[col].push(l); });
                return pipelineColumns.map((col, idx) => (
                  <div key={col.key} className="column" style={{ borderTop: `3px solid ${col.color}` }}>
                    <div className="column-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="col-number" style={{ background: col.color }}>{idx + 1}</div>
                        <div>
                          <div className="col-title">{col.title}</div>
                          <div className="col-sub">({colBuckets[col.key].length}) • {fmt(sumDeal(colBuckets[col.key]))}</div>
                        </div>
                      </div>
                      <div className="col-actions">...</div>
                    </div>
                    <div className="column-cards">
                      { (colBuckets[col.key] || []).map((d) => (
                        <div key={d.id || d.email} className="card" onClick={() => setSelectedLead(d)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div className="avatar-small-card">{(d.first_name||d.name||'').toString().charAt(0)}</div>
                              <div>
                                <div className="card-company">{d.company || ((d.first_name||'') + ' ' + (d.last_name||''))}</div>
                                <div className="card-person muted-small">{(d.first_name || '') + ' ' + (d.last_name || '')}</div>
                              </div>
                            </div>
                            <div className="card-amount">{fmt(d.deal_value || d.deal)}</div>
                          </div>
                          <div className="card-meta">
                            <div className="card-date muted-small">{formatDate(d.expected_close_date || d.close_date || d.created_at)}</div>
                            <div className="card-tags">{d.tag && <span className="small-tag">{d.tag}</span>}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}><button className="btn-small">+ Add Deal</button></div>
                  </div>
                ));
              })()}
            </div>

            <aside className="pipeline-right">
              {selectedLead ? (
                <div className="detail-card">
                  <div className="detail-header">
                    <div className="avatar-large">{(selectedLead.first_name||selectedLead.name||'').toString().charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div className="detail-name">{(selectedLead.first_name || '') + ' ' + (selectedLead.last_name || selectedLead.name || '')}</div>
                      <div className="detail-company">{selectedLead.company}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{fmt(selectedLead.deal_value || selectedLead.deal)}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>{selectedLead.pipeline_stage || selectedLead.deal_stage || ''}</div>
                    </div>
                  </div>

                  <div className="detail-body">
                    <div className="detail-row"><strong>Deal Name</strong><div>{selectedLead.company || '—'}</div></div>
                    <div className="detail-row"><strong>Deal Stage</strong><div>{selectedLead.pipeline_stage || selectedLead.deal_stage || '—'}</div></div>
                    <div className="detail-row"><strong>Probability</strong><div>{selectedLead.probability || '—'}</div></div>
                    <div className="detail-row"><strong>Expected Close Date</strong><div>{formatDate(selectedLead.expected_close_date || selectedLead.close_date || selectedLead.created_at)}</div></div>
                    <div className="detail-row"><strong>Owner</strong><div>{selectedLead.owner || '—'}</div></div>
                    <div className="detail-row"><strong>Tags</strong><div>{(selectedLead.tags || selectedLead.tag || '').toString()}</div></div>
                  </div>

                  <div className="detail-actions">
                    <button className="btn-full">Update Stage</button>
                    <button className="btn-outline danger">Mark as Lost</button>
                  </div>
                </div>
              ) : (
                <div className="detail-empty">Select a deal to see details</div>
              )}
            </aside>
          </div>

          {/* <div className="pipeline-charts">
            <div className="chart">Pipeline Value Over Time</div>
            <div className="chart">Pipeline by Stage</div>
            <div className="chart">Win Rate Trend</div>
            <div className="chart">Top Owners by Pipeline</div>
          </div> */}
        </div>

      </div>
    </div>
  );
}
