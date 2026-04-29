import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FiHome, FiUsers, FiCalendar, FiMail, FiDollarSign, FiBarChart2, FiSettings, FiLogOut, FiRefreshCw, FiPlus, FiDownload, FiChevronRight, FiCheckCircle, FiXCircle, FiChevronDown } from 'react-icons/fi';
import { FaTrophy, FaShareAlt, FaStar, FaTicketAlt } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import './Meetings.css';

export default function Meetings() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');

  const [client, setClient] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      if (!clientId) {
        setErrorMsg('No client ID');
        setLoading(false);
        return;
      }

      // Fetch leads that have meetings booked
      const [clientResp, leadsResp] = await Promise.all([
        supabase.from('Clients').select('*').eq('client_id', clientId).limit(1),
        supabase.from('Leads').select('*').eq('client_id', clientId).eq('meeting_booked', true).order('meeting_booked_at', { ascending: false }).limit(200)
      ]);

      if (clientResp.error) throw clientResp.error;

      if (!clientResp.data || clientResp.data.length === 0) {
        setErrorMsg('Client not found.');
        setLoading(false);
        return;
      }

      setClient(clientResp.data[0]);
      setMeetings(leadsResp.data || []);
      try { setSelectedMeetingId((leadsResp.data && leadsResp.data[0] && leadsResp.data[0].id) || null); } catch (e) {}
      setLoading(false);
    } catch (e) {
      setErrorMsg('Error loading meetings: ' + e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
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
          setMeetings(prev => {
            if (!prev) prev = [];
            if (evt.toUpperCase().includes('INSERT')) {
              // only add if meeting_booked
              if (newRow && newRow.meeting_booked) return [newRow, ...prev];
              return prev;
            }
            if (evt.toUpperCase().includes('UPDATE')) {
              // update or remove depending on meeting_booked flag
              return prev.map(m => (m.id === (newRow && newRow.id) ? newRow : m)).filter(Boolean);
            }
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

  // Calendar helpers (week anchored at Mon May 5, 2025)
  const weekStartDate = new Date(2025, 4, 5); // May 5, 2025
  const msPerDay = 24 * 60 * 60 * 1000;
  const calendarStartHour = 9;
  const calendarEndHour = 17;
  const calendarTotalMinutes = (calendarEndHour - calendarStartHour) * 60;
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toDateObj = (m) => {
    if (!m) return null;
    if (m.meeting_booked_at) return new Date(m.meeting_booked_at);
    if (m.date && m.time) return new Date(m.date + ' ' + m.time);
    if (m.date) return new Date(m.date);
    return null;
  };

  const getDayIndex = (dt) => {
    if (!dt || isNaN(dt.getTime())) return null;
    const start = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
    const eventDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    return Math.round((eventDate - start) / msPerDay);
  };

  const getTopPercent = (dt) => {
    if (!dt || isNaN(dt.getTime())) return 0;
    const minutes = dt.getHours() * 60 + dt.getMinutes();
    const offset = minutes - calendarStartHour * 60;
    return Math.max(0, Math.min(100, (offset / calendarTotalMinutes) * 100));
  };

  const formatTimeLabel = (dt) => {
    if (!dt) return '';
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Build calendar events (from meetings or sample fallback)
  const sampleMeetings = [
    { id: '1', name: 'Alex Thompson', company: 'TechCorp', date: 'May 7, 2025', time: '10:00 AM', tag: 'Discovery Call', initials: 'AT' },
    { id: '2', name: 'Sophie Martin', company: 'InnovateLabs', date: 'May 7, 2025', time: '02:30 PM', tag: 'Demo Call', initials: 'SM' },
    { id: '3', name: 'Michael Brown', company: 'DataFlow', date: 'May 8, 2025', time: '11:00 AM', tag: 'Strategy Call', initials: 'MB' },
    { id: '4', name: 'Emily Davis', company: 'GrowthNova', date: 'May 8, 2025', time: '03:00 PM', tag: 'Follow-up Call', initials: 'ED' },
    { id: '5', name: 'James Wilson', company: 'CloudScale', date: 'May 9, 2025', time: '09:30 AM', tag: 'Discovery Call', initials: 'JW' }
  ];

  const outcomesData = [
    { label: 'Won / Closed', value: 10, color: '#10b981' },
    { label: 'In Progress', value: 12, color: '#6366f1' },
    { label: 'Lost', value: 3, color: '#ef4444' },
    { label: 'No Show', value: 3, color: '#f97316' }
  ];

  const sourcesData = [
    { label: 'Email Outreach', value: 18, color: '#7c3aed' },
    { label: 'LinkedIn Outreach', value: 6, color: '#60a5fa' },
    { label: 'Referral / Warm Intro', value: 3, color: '#fb923c' },
    { label: 'Other', value: 3, color: '#10b981' }
  ];

  const totalOutcomes = outcomesData.reduce((s, o) => s + o.value, 0);
  const totalSources = sourcesData.reduce((s, o) => s + o.value, 0);

  const Donut = ({ data, size = 140, stroke = 18 }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    const radius = (size - stroke) / 2;
    const C = 2 * Math.PI * radius;
    let cumulative = 0;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((seg, i) => {
            const dash = (seg.value / total) * C;
            const dashArray = `${dash} ${C - dash}`;
            const offset = -cumulative;
            cumulative += dash;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
              />
            );
          })}
        </g>
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="donut-center-number">{total}</text>
        <text x="50%" y="50%" dy="18" dominantBaseline="central" textAnchor="middle" className="donut-center-label">Total</text>
      </svg>
    );
  };

  const exportCSV = () => {
    const rows = meetings && meetings.length > 0 ? meetings : sampleMeetings;
    const header = ['Name', 'Company', 'Date', 'Time', 'Tag'];
    const csv = [header.join(',')].concat(rows.map(r => [
      (`${r.name || ''}`).replace(/,/g, ''),
      (`${r.company || ''}`).replace(/,/g, ''),
      (`${r.meeting_booked_at || r.date || ''}`),
      (`${r.time || ''}`),
      (`${r.tag || ''}`).replace(/,/g, '')
    ].join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meetings.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const tagClass = (tag) => {
    if (!tag) return 'tag-default';
    const t = (tag + '').toLowerCase();
    if (t.includes('discov')) return 'tag-discovery';
    if (t.includes('demo')) return 'tag-demo';
    if (t.includes('strateg')) return 'tag-strategy';
    if (t.includes('follow')) return 'tag-followup';
    return 'tag-default';
  };

  const sourceMeetings = (meetings && meetings.length > 0) ? meetings : sampleMeetings;
  const colors = ['linear-gradient(135deg,#7c3aed,#6366f1)', 'linear-gradient(135deg,#06b6d4,#06b6d4)', 'linear-gradient(135deg,#f59e0b,#fb923c)', 'linear-gradient(135deg,#10b981,#059669)'];
  const calendarEvents = sourceMeetings.map((m, i) => {
    const dt = toDateObj(m);
    const dayIndex = getDayIndex(dt);
    if (dayIndex === null || dayIndex < 0 || dayIndex > 6) return null;
    const top = getTopPercent(dt);
    const height = (60 / calendarTotalMinutes) * 100; // default 60m event
    const title = m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim();
    const tag = m.tag || m.meeting_summary || m.meeting_type || m.meeting_outcome || '';
    const timeLabel = dt ? formatTimeLabel(dt) : (m.time || '');
    return { id: m.id || `sample-${i}`, dayIndex, top, height, title, tag, timeLabel, color: colors[i % colors.length] };
  }).filter(Boolean);

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
        <div style={{ fontSize: 25, color: '#c5d0e6' }}>Loading Your Meetings...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--dark)' }}>
        <Sidebar client={client} clientId={clientId} active="Meetings" />
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
      <Sidebar client={client} clientId={clientId} active="Meetings" />

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
            <button onClick={() => loadMeetings()} disabled={loading} style={{
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

        <div className="meetings-wrap" style={{ padding: '0 36px 48px 36px' }}>
          <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Meetings</h1>
              <div style={{ marginTop: 6, color: 'var(--muted)' }}>Track, manage and analyze all your scheduled meetings.</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="btn-small" onClick={() => loadMeetings()}><FiRefreshCw style={{ marginRight: 8 }} />Sync Calendar</button>
              {/* <button className="btn-add"><FiPlus style={{ marginRight: 8 }} />Book Meeting</button> */}
              {/* <div style={{ position: 'relative' }}>
                <button className="btn-small" onClick={() => setExportOpen(s => !s)}><FiDownload style={{ marginRight: 8 }} />Export <FiChevronDown style={{ marginLeft: 8 }} /></button>
                {exportOpen && (
                  <div className="export-dropdown" role="menu">
                    <button className="export-item" onClick={exportCSV}>Export CSV</button>
                    <button className="export-item" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(meetings || sampleMeetings)); setExportOpen(false); }}>Copy JSON</button>
                  </div>
                )}
              </div> */}
            </div>
          </div>

          <div className="kpis-row">
            <div className="stat-card small">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon"><FiCalendar /></div>
                <div>
                  <div className="stat-title">Upcoming Meetings</div>
                  <div className="stat-value">12</div>
                  <div className="stat-trend">↑ 20% vs last 30 days</div>
                </div>
              </div>
            </div>
            <div className="stat-card small">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon"><FiCheckCircle /></div>
                <div>
                  <div className="stat-title">Completed Meetings</div>
                  <div className="stat-value">28</div>
                  <div className="stat-trend" style={{ color: 'var(--green)' }}>↑ 12% vs last 30 days</div>
                </div>
              </div>
            </div>
            <div className="stat-card small">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon"><FiXCircle /></div>
                <div>
                  <div className="stat-title">No-Shows</div>
                  <div className="stat-value">3</div>
                  <div className="stat-trend" style={{ color: 'var(--red)' }}>↓ 8% vs last 30 days</div>
                </div>
              </div>
            </div>
            <div className="stat-card small">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon"><FiBarChart2 /></div>
                <div>
                  <div className="stat-title">Conversion Rate</div>
                  <div className="stat-value">46%</div>
                  <div className="stat-trend" style={{ color: 'var(--green)' }}>↑ 6% vs last 30 days</div>
                </div>
              </div>
            </div>
            <div className="stat-card small">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon"><FiDollarSign /></div>
                <div>
                  <div className="stat-title">Pipeline Value</div>
                  <div className="stat-value">$328,450</div>
                  <div className="stat-trend" style={{ color: 'var(--green)' }}>↑ 18% vs last 30 days</div>
                </div>
              </div>
            </div>
            {/* <div className="actions-right">
              <button className="btn-small"><FiRefreshCw style={{ marginRight: 8 }} />Sync Calendar</button>
              <button className="btn-add"><FiPlus style={{ marginRight: 8 }} />Book Meeting</button>
            </div> */}
          </div>

          <div className="meetings-tabs">
            <div className="tabs-left">
              <button className="tab active">Upcoming</button>
              <button className="tab">Completed</button>
              <button className="tab">No-Shows</button>
              <button className="tab">All Meetings</button>
            </div>
            <div className="tabs-right">
              <select className="lead-filter">
                <option>May 5 - Jun 4, 2025</option>
              </select>
              <button className="btn-small">Filters</button>
            </div>
          </div>

          <div className="meetings-main-grid">
            <aside className="upcoming-list">
              <div className="list-header">Upcoming Meetings ({sourceMeetings.length})</div>
              <div className="list-items">
                { sourceMeetings.map((m, idx) => {
                  const id = m.id || `sample-${idx}`;
                  const isActive = (selectedMeetingId ? selectedMeetingId === m.id : idx === 0);
                  return (
                    <div key={id} onClick={() => setSelectedMeetingId(id)} className={`meeting-row ${isActive ? 'active-row' : ''}`}>
                      <div className="meet-left">
                        <div className={`avatar-small ${isActive ? 'avatar-active' : ''}`}>{m.initials || (m.name||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                        <div style={{ marginLeft: 10 }}>
                          <div className="meet-name">{m.name}<div className="meet-company">{m.company}</div></div>
                          <div className="meet-meta"><span className="muted-small">{m.date}</span> • <span className="muted-small">{m.time}</span></div>
                        </div>
                      </div>
                      <div className="meet-right">
                        <span className={`tag ${tagClass(m.tag)}`}>{m.tag}</span>
                        <FiChevronRight className="chev-icon" />
                      </div>
                    </div>
                  );
                }) }
              </div>
              <div style={{ marginTop: 12 }}><a className="view-all" href="#">View all upcoming →</a></div>
            </aside>

            <div className="calendar-column">
              <div className="calendar-controls">
                <div className="view-toggle">
                  <button className="btn-small active">Calendar</button>
                  <button className="btn-small">List</button>
                  <button className="btn-small">Timeline</button>
                </div>
                <div className="calendar-title">May 5 – May 11, 2025</div>
                <div style={{ marginLeft: 'auto' }}><button className="btn-small">Today</button></div>
              </div>
              <div className="calendar">
                {(() => {
                  const numIntervals = calendarEndHour - calendarStartHour;
                  const numTicks = numIntervals + 1;
                  return (
                    <div className="calendar-grid" style={{ ['--intervals']: numIntervals }}>
                      <div className="day-head-empty" />
                      {Array.from({ length: 7 }).map((_, d) => {
                        const dateObj = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + d);
                        return (
                          <div key={`head-${d}`} className="day-head-cell">
                            <div className="day-head"><span className="day-label">{dayLabels[d]}</span><span className="day-num">{dateObj.getDate()}</span></div>
                          </div>
                        );
                      })}

                      <div className="hours-col">
                        {Array.from({ length: numTicks }).map((_, hIdx) => {
                          const topPercent = (hIdx / numIntervals) * 100;
                          return <div key={`tick-${hIdx}`} className="hour-slot" style={{ top: `${topPercent}%` }}>{String(calendarStartHour + hIdx).padStart(2, '0')}:00</div>;
                        })}
                      </div>

                      {Array.from({ length: 7 }).map((_, d) => {
                        const dateObj = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + d);
                        return (
                          <div key={`body-${d}`} className="day-body-cell">
                            <div className="day-body">
                              {calendarEvents.filter(e => e.dayIndex === d).map((ev) => (
                                <div key={ev.id} className="event" style={{ top: `${ev.top}%`, height: `${ev.height}%`, background: ev.color }}>
                                  <div className="event-time">{ev.timeLabel}</div>
                                  <div className="event-title"><strong>{ev.title}</strong></div>
                                  <div className="event-type">{ev.tag}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="meetings-bottom-row">
            <div className="outcomes-card">
              <div className="card-header"><div className="card-heading">Meeting Outcomes (Last 30 Days)</div></div>
              <div className="card-body outcomes-body">
                <div className="donut-wrap"><Donut data={outcomesData} size={140} stroke={18} /></div>
                <div className="outcome-legend">
                  {outcomesData.map((o, i) => (
                    <div key={i} className="legend-row">
                      <span className="legend-dot" style={{ background: o.color }} />
                      <div className="legend-label">{o.label}</div>
                      <div className="legend-value">{o.value} ({Math.round((o.value / totalOutcomes) * 100)}%)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sources-card">
              <div className="card-header"><div className="card-heading">Meeting Sources (Last 30 Days)</div></div>
              <div className="card-body sources-body">
                <div className="sources-list">
                  {sourcesData.map((s, i) => (
                    <div key={i} className="source-chart-row">
                      <div className="source-label">{s.label}</div>
                      <div className="bar-wrap"><div className="bar-fill" style={{ width: `${Math.round((s.value / totalSources) * 100)}%`, background: s.color }} /></div>
                      <div className="source-num muted-small">{s.value} ({Math.round((s.value / totalSources) * 100)}%)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
