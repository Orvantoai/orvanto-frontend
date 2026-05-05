import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FiHome, FiUsers, FiCalendar, FiMail, FiDollarSign, FiBarChart2, FiSettings, FiLogOut, FiDownload } from 'react-icons/fi';
import { FaLinkedin, FaPhone, FaWhatsapp, FaTrophy, FaShareAlt, FaStar, FaTicketAlt } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client') || 'orvanto_self';

  const [client, setClient] = useState({});
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [leadQuery, setLeadQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState('All');
  const [leadPage, setLeadPage] = useState(1);
  const leadsPerPage = 5;
  const [hoveredFunnel, setHoveredFunnel] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!clientId) {
      setErrorMsg('No client ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [clientResp, leadsResp] = await Promise.all([
        supabase.from('Clients').select('*').eq('client_id', clientId).limit(1),
        supabase.from('Leads').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(200)
      ]);
      if (clientResp.error) throw clientResp.error;
      if (!clientResp.data || clientResp.data.length === 0) {
        setErrorMsg('Client not found. Check your client ID in the URL.');
        setLoading(false);
        return;
      }
      setClient(clientResp.data[0]);
      setLeads(leadsResp.data || []);
    } catch (e) {
      setErrorMsg('Error loading dashboard: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Realtime: subscribe to Clients and Leads updates for this client
  useEffect(() => {
    if (!clientId) return;
    let clientChannel = null;
    let leadsChannel = null;
    try {
      clientChannel = supabase
        .channel(`dash-clients:${clientId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Clients', filter: `client_id=eq.${clientId}` }, (payload) => {
          const rec = payload.new || payload.record || payload;
          if (rec) setClient(prev => ({ ...(prev || {}), ...rec }));
        })
        .subscribe();
      leadsChannel = supabase
        .channel(`dash-leads:${clientId}`)
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

  if (loading) {
    return (
      <div id="loading" className="loading-screen">
        <img src="/favicon.svg?v=3" alt="Orvanto loading" className="loading-img" />
        <div className="loading-text">Loading Your Dashboard...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="dashboard-root">
        <div className="sidebar">
          <div className="logo-text">Orvanto AI</div>
        </div>
        <div className="dash-main">
          <div className="centered-text">
            <h2 className="error-title">{errorMsg}</h2>
            {errorMsg === 'No client ID' && <p className="error-help">Add <code>?client=your_client_id</code> to the URL</p>}
            <p className="error-signup"><Link to="/signup" className="signup-link">Sign up →</Link></p>
          </div>
        </div>
      </div>
    );
  }

  const c = client;
  const replyRate = c.emails_sent > 0 ? Math.round((c.replies_received / c.emails_sent) * 100) : 0;
  const meetings = c.meetings_booked || 0;
  const wd = c.warmup_day || 0;

  const activities = [
    ...leads.filter(l => l.meeting_booked).slice(0, 3).map(l => ({ text: `Meeting booked: ${l.first_name} ${l.last_name} from ${l.company}`, time: l.meeting_booked_at, color: 'var(--green)' })),
    ...leads.filter(l => l.email_replied).slice(0, 3).map(l => ({ text: `Reply received: ${l.first_name} ${l.last_name} — ${l.reply_intent || 'replied'}`, time: l.last_reply_at, color: 'var(--amber)' })),
    ...leads.filter(l => l.email_sent).slice(0, 5).map(l => ({ text: `Email sent to ${l.first_name} ${l.last_name} at ${l.company}`, time: l.emailed_at, color: 'var(--purple)' }))
  ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 10);

  const displayLeads = leads || [];
  const displayActivities = activities || [];
  const displayMeetings = [];

  // Variables already declared above

  // client-side search / filter / pagination for leads
  const filteredLeads = displayLeads.filter(l => {
    const q = leadQuery.trim().toLowerCase();
    const fullName = `${(l.first_name||'').toString()} ${(l.last_name||'').toString()}`.toLowerCase();
    const company = (l.company || '').toString().toLowerCase();
    const intent = (l.intent || '').toString();
    const matchesQuery = !q || fullName.includes(q) || company.includes(q);
    const matchesIntent = intentFilter === 'All' || intent === intentFilter;
    return matchesQuery && matchesIntent;
  });
  const totalLeadPages = Math.max(1, Math.ceil(filteredLeads.length / leadsPerPage));
  const paginatedLeads = filteredLeads.slice((leadPage - 1) * leadsPerPage, leadPage * leadsPerPage);

  // Pipeline funnel computation (derive stages from leads)
  const pipelineStage = (l) => {
    const s = (l.pipeline_stage || l.stage || l.deal_stage || l.deal_status || '').toString().toLowerCase();
    if (!s || s.trim() === '') {
      if (l.meeting_booked) return 'Qualified';
      if (l.email_replied) return 'Qualified';
      return 'New Leads';
    }
    if (s.includes('qual')) return 'Qualified';
    if (s.includes('proposal')) return 'Proposal Sent';
    if (s.includes('negoti') || s.includes('negotiat')) return 'Negotiation';
    if (s.includes('close') || s.includes('won')) return 'Closed Won';
    if (s.includes('lead')) return 'New Leads';
    return 'New Leads';
  };

  const funnelKeys = ['New Leads', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won'];
  const funnelBuckets = { 'New Leads': [], 'Qualified': [], 'Proposal Sent': [], 'Negotiation': [], 'Closed Won': [] };
  leads.forEach(l => {
    const k = pipelineStage(l) || 'New Leads';
    funnelBuckets[k] = funnelBuckets[k] || [];
    funnelBuckets[k].push(l);
  });

  const funnelCounts = funnelKeys.map(k => funnelBuckets[k]?.length || 0);
  const funnelMax = Math.max(...funnelCounts, 1);
  const funnelTotals = funnelKeys.reduce((acc, k) => ({ ...acc, [k]: (funnelBuckets[k] || []).reduce((s, x) => s + (Number(x.deal_value || x.deal || 0) || 0), 0) }), {});
  const newCount = funnelBuckets['New Leads']?.length || 0;
  const closedCount = funnelBuckets['Closed Won']?.length || 0;
  const conversionRate = newCount === 0 ? 0 : Math.round((closedCount / newCount) * 10000) / 100; // percent with 2 decimals
  const avgDeal = closedCount === 0 ? 0 : Math.round((funnelTotals['Closed Won'] || 0) / closedCount);

  const exportReport = () => {
    try {
      const rows = leads || [];
      if (!rows || rows.length === 0) {
        alert('No data to export');
        return;
      }
      const headers = Object.keys(rows[0]);
      const csvRows = [
        headers.join(','),
        ...rows.map(r => headers.map(h => {
          const val = r[h];
          if (val === null || val === undefined) return '';
          const s = typeof val === 'string' ? val.replace(/"/g, '""') : String(val);
          return `"${s}"`;
        }).join(','))
      ];
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orvanto_report_${clientId || 'report'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed');
    }
  };

  const loadDashboard = () => fetchDashboardData();

  // Analytics: Outreach performance sample data (matches attached image look)
  const outreachDates = ['May 5', 'May 12', 'May 19', 'May 26', 'Jun 2'];
  const leadsSeries = [320, 520, 720, 820, 950];
  const emailsSeries = [240, 420, 600, 720, 860];
  const repliesSeries = [40, 90, 160, 210, 280];
  const meetingsSeries = [6, 12, 20, 30, 45];

  const chartW = 640;
  const chartH = 220;
  const chartPad = 44;
  const chartMax = Math.max(...leadsSeries, ...emailsSeries, ...repliesSeries, ...meetingsSeries, 1);

  const buildPath = (series) => series.map((v, i) => {
    const x = chartPad + (i * (chartW - chartPad * 2) / (series.length - 1));
    const y = chartPad + (1 - (v / chartMax)) * (chartH - chartPad * 2);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const leadsPath = buildPath(leadsSeries);
  const emailsPath = buildPath(emailsSeries);
  const repliesPath = buildPath(repliesSeries);
  const meetingsPath = buildPath(meetingsSeries);

  const leadsPoints = leadsSeries.map((v, i) => ({ x: chartPad + (i * (chartW - chartPad * 2) / (leadsSeries.length - 1)), y: chartPad + (1 - (v / chartMax)) * (chartH - chartPad * 2) }));
  const emailsPoints = emailsSeries.map((v, i) => ({ x: chartPad + (i * (chartW - chartPad * 2) / (emailsSeries.length - 1)), y: chartPad + (1 - (v / chartMax)) * (chartH - chartPad * 2) }));
  const repliesPoints = repliesSeries.map((v, i) => ({ x: chartPad + (i * (chartW - chartPad * 2) / (repliesSeries.length - 1)), y: chartPad + (1 - (v / chartMax)) * (chartH - chartPad * 2) }));
  const meetingsPoints = meetingsSeries.map((v, i) => ({ x: chartPad + (i * (chartW - chartPad * 2) / (meetingsSeries.length - 1)), y: chartPad + (1 - (v / chartMax)) * (chartH - chartPad * 2) }));

  // Insights section data
  const insightsDonutTotal = 8342;
  const insightsDonut = [
    { label: 'Email', count: 5672, pct: 68, color: 'var(--purple)', icon: FiMail },
    { label: 'LinkedIn', count: 1501, pct: 18, color: 'var(--indigo)', icon: FaLinkedin },
    { label: 'SMS', count: 751, pct: 9, color: '#ec4899', icon: FaPhone },
    { label: 'WhatsApp', count: 418, pct: 5, color: 'var(--green)', icon: FaWhatsapp },
  ];

  const pipelineDates = ['May 5', 'May 12', 'May 19', 'May 26', 'Jun 2', 'Jun 9', 'Jun 16'];
  const pipelineSeries = [32000, 45000, 60000, 76000, 88000, 104000, 128450];
  const pipelineMax = Math.max(...pipelineSeries, 1);
  const buildPathFor = (series, max) => series.map((v, i) => {
    const x = chartPad + (i * (chartW - chartPad * 2) / (series.length - 1));
    const y = chartPad + (1 - (v / max)) * (chartH - chartPad * 2);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  const pipelinePath = buildPathFor(pipelineSeries, pipelineMax);

  const topCampaigns = [
    { name: 'Outreach – May 2025', replies: 128, rate: '6.2%', meetings: 18 },
    { name: 'LinkedIn + Email Drip', replies: 96, rate: '7.1%', meetings: 12 },
    { name: 'Tech Industry Campaign', replies: 64, rate: '5.4%', meetings: 9 },
  ];

  // Funnel data (use exact counts from the image)
  const funnelData = [
    { label: 'Leads', count: 2453, color: 'linear-gradient(90deg,var(--purple),var(--indigo))' },
    { label: 'Contacted', count: 1982, color: 'linear-gradient(90deg,var(--indigo),var(--purple))' },
    { label: 'Replied', count: 312, color: 'linear-gradient(90deg,#ec4899,#8b5cf6)' },
    { label: 'Qualified', count: 98, color: 'linear-gradient(90deg,var(--indigo),var(--purple))' },
    { label: 'Meetings', count: 45, color: 'linear-gradient(90deg,var(--amber),var(--green))' },
    { label: 'Closed', count: 23, color: 'linear-gradient(90deg,var(--green),#10b981)' },
  ];
  const funnelTotal = funnelData[0].count || 1;
  const funnelSegH = 30;
  const funnelGap = 6;
  const funnelTotalHeight = funnelData.length * (funnelSegH + funnelGap) - funnelGap;
  const funnelViewBoxHeight = funnelTotalHeight + 10; // small vertical padding inside viewBox

  // Account health
  const healthPercent = 92;
  const healthItems = [
    { label: 'Email Deliverability', status: 'Excellent', color: 'var(--green)' },
    { label: 'Reply Rate', status: 'Good', color: 'var(--amber)' },
    { label: 'Meetings Booked', status: 'Excellent', color: 'var(--green)' },
    { label: 'Optout Complaints', status: 'Excellent', color: 'var(--green)' },
    { label: 'Domain Warmup', status: 'Day 8 / 14', color: 'var(--muted)' },
  ];

  return (
    <div className="dashboard-root">
      {/* Full-width low-opacity Orvanto watermark background */}
      <div className="dashboard-watermark">
        <img src="/orvanto.png" alt="Orvanto watermark" className="dashboard-watermark-img" />
      </div>
      {/* Sidebar */}
      <Sidebar client={client} clientId={clientId} active="Overview" />

      {/* Main dashboard area */}
      <div className="dashboard-content">
        <DashboardHeader onExport={exportReport} onRefresh={loadDashboard} loading={loading} showRefresh={true} />
        <h1 className="page-title">ORVANTO AI - Client Dashbaord</h1>
        {/* Stats Cards Row - refined */}
        <div className="stats-row">

          {/* Leads Found */}
          <div className="stat-card">
            <div className="stat-head">
              <span className="stat-icon" style={{ color: 'var(--purple)' }}> <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="var(--purple)"/></svg></span>
              <span className="stat-title">Leads Found</span>
            </div>
            <div className="stat-value">{c.leads_generated || 0}</div>
            <div className="stat-trend">↑ 18.4% <span className="muted-small">vs Apr 5 – May 4</span></div>
          </div>
          {/* Emails Sent */}
          <div className="stat-card">
            <div className="stat-head">
              <span className="stat-icon" style={{ color: 'var(--indigo)' }}> <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 20V8.99l8 7 8-7V20H4z" fill="var(--indigo)"/></svg></span>
              <span className="stat-title">Emails Sent</span>
            </div>
            <div className="stat-value">{c.emails_sent || 0}</div>
            <div className="stat-trend">↑ 22.1% <span className="muted-small">vs Apr 5 – May 4</span></div>
          </div>
          {/* Replies */}
          <div className="stat-card">
            <div className="stat-head">
              <span className="stat-icon" style={{ color: 'var(--green)' }}> <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H6v-2h12v2zm0-4H6V8h12v2z" fill="var(--green)"/></svg></span>
              <span className="stat-title">Replies</span>
            </div>
            <div className="stat-value">{c.replies_received || 0}</div>
            <div className="stat-trend">↑ 24.7% <span className="muted-small">vs Apr 5 – May 4</span></div>
          </div>
          {/* Meetings Booked */}
          <div className="stat-card">
            <div className="stat-head">
              <span className="stat-icon" style={{ color: 'var(--amber)' }}> <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13zm0-15H5V5h14v1z" fill="var(--amber)"/></svg></span>
              <span className="stat-title">Meetings Booked</span>
            </div>
            <div className="stat-value">{meetings}</div>
            <div className="stat-trend">↑ 28.6% <span className="muted-small">vs Apr 5 – May 4</span></div>
          </div>
          {/* Pipeline Value */}
          <div className="stat-card">
            <div className="stat-head">
              <span className="stat-icon" style={{ color: 'var(--purple)' }}> <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--purple)"/></svg></span>
              <span className="stat-title">Pipeline Value</span>
            </div>
            <div className="stat-value">${Math.round(c.pipeline_value || 0).toLocaleString()}</div>
            <div className="stat-trend">↑ 35.4% <span className="muted-small">vs Apr 5 – May 4</span></div>
          </div>
        </div>
                {/* Meetings Guarantee & Warmup Status Row - refined */}
                <div className="secondary-row">
                {/* Meetings Guarantee */}
                  <div className="warmup-card">
                    <div className="card-header">
                      <span className="card-title">Meetings Guarantee</span>
                      <span className="card-value">{meetings} <span className="td-muted">/ 75</span></span>
                    </div>
                    <div className="meetings-progress">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (meetings / 75) * 100)}%` }}></div>
                    </div>
                    <div className="meetings-info">
                      <span style={{ color: 'var(--muted)', fontSize: 14 }}>{meetings >= 75 ? 'You hit your goal!' : `You’re on track! ${75 - meetings} meetings to go.`}</span>
                      <span className="meetings-percent">{Math.round((meetings / 75) * 100)}%</span>
                    </div>
                  </div>
                  {/* Warmup Status */}
                  <div className="warmup-card">
                    <div className="card-header">
                      <span className="card-title">Warmup Status</span>
                      <span className="card-value">Day {wd} <span className="td-muted">/ 14</span></span>
                    </div>
                    <div className="warmup-days">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const day = i + 1;
                        let bg = 'var(--border)';
                        let border = '2px solid var(--border)';
                        let boxShadow = 'none';
                        if (day < wd) { bg = 'linear-gradient(135deg,var(--purple),var(--indigo))'; border = '2px solid var(--border)'; }
                        else if (day === wd) { bg = 'linear-gradient(135deg,var(--purple),var(--indigo))'; border = '2.5px solid var(--purple)'; boxShadow = '0 0 0 3px var(--border)'; }
                        return (
                          <div key={day} className="warmup-day" style={{ background: bg, border, boxShadow }}>{day <= wd ? day : day}</div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span className={`dns-status ${c.dns_verified ? 'verified' : 'unverified'}`}>
                        <svg width="18" height="18" className="dns-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        DNS Records
                      </span>
                      <span className={`dns-status ${c.dns_verified ? 'verified' : 'unverified'} dns-text`}>{c.dns_verified ? 'All records verified' : 'Setup required'}</span>
                      <button className="btn-secondary">View Details</button>
                    </div>
                  </div>
                </div>

                {/* Recent Leads & Pipeline Overview Row */}
                <div className="recent-pipeline-row">
                  {/* Recent Leads Card */}
                  <div className="recent-card">
                      <div className="card-header" style={{ alignItems: 'center' }}>
                        <span className="card-heading">Recent Leads</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input value={leadQuery} onChange={(e) => { setLeadQuery(e.target.value); setLeadPage(1); }} placeholder="Search leads..." className="lead-search" />
                          <select value={intentFilter} onChange={(e) => { setIntentFilter(e.target.value); setLeadPage(1); }} className="lead-filter">
                            <option>All</option>
                            <option>Hot</option>
                            <option>Warm</option>
                            <option>Cold</option>
                          </select>
                          <button className="btn-small">View All Leads</button>
                        </div>
                      </div>
                      <div className="table-wrapper">
                        <table className="leads-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Company</th>
                              <th>Status</th>
                              <th>Intent</th>
                              <th>Score</th>
                              <th>Channels</th>
                              <th>Last Activity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedLeads.length === 0 ? (
                              <tr><td colSpan="7" className="no-leads">No leads yet — lead generation runs daily at 7AM.</td></tr>
                            ) : (
                              paginatedLeads.map((l, i) => {
                                const status = l.status || (l.meeting_booked ? 'Replied' : l.email_replied ? 'Interested' : l.email_sent ? 'Contacted' : 'New');
                                const intent = (l.intent || '').toString() || (status === 'Replied' ? 'Hot' : 'Warm');
                                const badgeColor = status === 'Replied' ? 'var(--green)' : status === 'Interested' ? 'var(--indigo)' : status === 'Contacted' ? 'var(--amber)' : 'var(--indigo)';
                                const badgeBg = status === 'Replied' ? 'rgba(34,197,94,0.12)' : status === 'Interested' ? 'rgba(99,102,241,0.12)' : status === 'Contacted' ? 'rgba(245,158,66,0.12)' : 'rgba(99,102,241,0.06)';
                                const lastContact = l.last_contact || (l.meeting_booked_at ? '2h ago' : l.last_reply_at ? '5h ago' : l.emailed_at ? '1d ago' : '—');
                                const channels = (l.channels || []).map(ch => {
                                  if (ch === 'linkedin') return <FaLinkedin key={ch} title="LinkedIn" style={{ color: 'var(--indigo)', marginRight: 8 }} />;
                                  if (ch === 'email') return <FiMail key={ch} title="Email" style={{ color: 'var(--purple)', marginRight: 8 }} />;
                                  if (ch === 'phone') return <FaPhone key={ch} title="Phone" style={{ color: 'var(--amber)', marginRight: 8 }} />;
                                  if (ch === 'whatsapp') return <FaWhatsapp key={ch} title="WhatsApp" style={{ color: 'var(--green)', marginRight: 8 }} />;
                                  return null;
                                }).filter(Boolean);
                                return (
                                  <tr key={i}>
                                    <td className="td-strong">{l.first_name} {l.last_name}</td>
                                    <td className="td-company">{l.company}</td>
                                    <td><span className="badge" style={{ background: badgeBg, color: badgeColor }}>{status}</span></td>
                                    <td><span className={`intent intent-${intent.toLowerCase()}`}>{intent}</span></td>
                                    <td className={(l.bant_score || l.score || 0) >= 70 ? 'score-good' : 'score-muted'}>{l.bant_score || l.score || '—'}</td>
                                    <td>{channels.length > 0 ? channels : <span className="td-muted">—</span>}</td>
                                    <td className="td-muted">{lastContact}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="pagination" style={{ justifyContent: 'flex-start', paddingTop: 12 }}>
                        <button className="pagination-btn" onClick={() => setLeadPage(p => Math.max(1, p - 1))}>&lt;</button>
                        {Array.from({ length: totalLeadPages }).map((_, idx) => (
                          <button key={idx+1} className={`pagination-btn ${leadPage === idx+1 ? 'active' : ''}`} onClick={() => setLeadPage(idx+1)}>{idx+1}</button>
                        ))}
                        <button className="pagination-btn" onClick={() => setLeadPage(p => Math.min(totalLeadPages, p + 1))}>&gt;</button>
                      </div>
                  </div>
                  {/* Center: Activity Feed */}
                  <div style={{ flex: 1.25 }} className="activity-feed-card">
                    <div className="card-header">
                      <span className="card-heading">Recent Activity</span>
                      <button className="btn-small">View All Activity</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {displayActivities.length === 0 ? (
                        <div className="td-muted" style={{ padding: '12px 6px' }}>No activity yet.</div>
                      ) : (
                        displayActivities.map((a, i) => (
                          <div key={i} className="activity-row">
                            <div className="activity-block">
                              <div className="activity-avatar">
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: a.color || 'var(--indigo)' }}></div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 700 }}>{a.text}</div>
                                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{a.time}</div>
                              </div>
                            </div>
                            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{a.time}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right: Upcoming Meetings */}
                  <div style={{ flex: 1 }} className="meetings-card">
                    <div className="card-header">
                      <span className="card-heading">Upcoming Meetings</span>
                      <button className="btn-small">View All</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {displayMeetings.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.01)' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>{m.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                            <div>
                              <div style={{ fontWeight: 800 }}>{m.name}</div>
                              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{m.company}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ fontWeight: 700 }}>{m.date}</div>
                            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{m.time}</div>
                            <div><button className="btn-small">View</button></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
          <div  style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    {/* Analytics Row: Outreach Performance, Funnel Overview, Account Health */}
    <div className="charts-row" style={{ alignItems: 'stretch' }}>
      <div style={{ flex: 2 }} className="leads-over-time-card">
        <div className="card-heading">Outreach Performance</div>
        <div style={{ position: 'absolute', top: 24, right: 24 }}>
          <button className="btn-small">Last 30 Days ▼</button>
        </div>
        <div style={{ padding: 12, position: 'relative' }}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="220" preserveAspectRatio="none">
            { [0,0.25,0.5,0.75,1].map((g,i) => {
              const y = chartPad + g*(chartH-chartPad*2);
              const val = Math.round((1 - g) * chartMax);
              return (
                <g key={'g'+i}>
                  <line x1={chartPad} x2={chartW-chartPad} y1={y} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
                  <text x={chartPad - 10} y={y + 4} fill="var(--muted)" fontSize={11} fontWeight={700} textAnchor="end">{val.toLocaleString()}</text>
                </g>
              );
            }) }
            <text x={chartPad - 34} y={chartH/2} transform={`rotate(-90 ${chartPad - 34} ${chartH/2})`} fill="var(--muted)" fontSize={12} fontWeight={700} textAnchor="middle">Counts</text>
            <path d={leadsPath} stroke="var(--purple)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={emailsPath} stroke="var(--indigo)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" />
            <path d={repliesPath} stroke="var(--green)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 6" />
            <path d={meetingsPath} stroke="var(--amber)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 6" />
            {leadsPoints.map((p,i) => <circle key={'l'+i} cx={p.x} cy={p.y} r={3.5} fill="var(--purple)" />)}
            {emailsPoints.map((p,i) => <circle key={'e'+i} cx={p.x} cy={p.y} r={3} fill="var(--indigo)" />)}
            {repliesPoints.map((p,i) => <circle key={'r'+i} cx={p.x} cy={p.y} r={3} fill="var(--green)" />)}
            {meetingsPoints.map((p,i) => <circle key={'m'+i} cx={p.x} cy={p.y} r={3} fill="var(--amber)" />)}
            <text x={(chartW)/2} y={chartH - 4} fill="var(--muted)" fontSize={12} fontWeight={700} textAnchor="middle">Dates</text>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color:'var(--muted)', fontWeight:700 }}>
            {outreachDates.map((d, idx) => <div key={d} style={{ fontSize: 13 }}>{d}</div>)}
          </div>
        </div>
        <div className="chart-legend">
          <span><span style={{ color: 'var(--purple)', marginRight: 6 }}>●</span>Leads</span>
          <span><span style={{ color: 'var(--indigo)', marginRight: 6 }}>●</span>Emails</span>
          <span><span style={{ color: 'var(--green)', marginRight: 6 }}>●</span>Replies</span>
          <span><span style={{ color: 'var(--amber)', marginRight: 6 }}>●</span>Meetings</span>
        </div>
      </div>

      <div style={{ flex: 1, margin: '0 18px' }} className="outreach-breakdown-card">
        <div className="card-heading">Funnel Overview</div>
        <div className="funnel-overview" style={{ padding: 12 }}>
          <div className="funnel-svg" style={{ width: 160, position: 'relative', zIndex: 2, marginRight: -28 }}>
            <svg width="160" height="100%" viewBox={`0 0 160 ${funnelViewBoxHeight}`} role="img" aria-label="Funnel Overview">
              <defs>
                <linearGradient id="g0" x1="0%" x2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#6366f1"/></linearGradient>
                <linearGradient id="g1" x1="0%" x2="100%"><stop offset="0%" stopColor="#4f46e5"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient>
                <linearGradient id="g2" x1="0%" x2="100%"><stop offset="0%" stopColor="#ec4899"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient>
                <linearGradient id="g3" x1="0%" x2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fb923c"/></linearGradient>
                <linearGradient id="g4" x1="0%" x2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#10b981"/></linearGradient>
                <linearGradient id="g5" x1="0%" x2="100%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#059669"/></linearGradient>
              </defs>
              {funnelData.map((f, i) => {
                const segH = funnelSegH;
                const gap = funnelGap;
                const topW = Math.max(20, 140 * (f.count / funnelTotal));
                const bottomW = i < funnelData.length - 1 ? Math.max(12, 140 * (funnelData[i+1].count / funnelTotal)) : 40;
                const xTopLeft = (160 - topW) / 2;
                const xTopRight = xTopLeft + topW;
                const xBottomLeft = (160 - bottomW) / 2;
                const xBottomRight = xBottomLeft + bottomW;
                const yTop = i * (segH + gap);
                const yBottom = yTop + segH;
                const points = `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`;
                const isHovered = hoveredFunnel === i;
                return (
                  <polygon
                    key={i}
                    points={points}
                    fill={`url(#g${i})`}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth={1}
                    className={`funnel-seg seg-${i} ${isHovered ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredFunnel(i)}
                    onMouseLeave={() => setHoveredFunnel(null)}
                    style={{ transition: 'all .18s ease', filter: isHovered ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.45))' : 'none', opacity: hoveredFunnel === null ? 1 : (isHovered ? 1 : 0.55) }}
                  />
                )
              })}
            </svg>
          </div>
          <div className="funnel-labels" style={{ flex: 1, position: 'relative', zIndex: 1, paddingLeft: 28, ['--funnel-seg-h']: `${funnelSegH}px`, ['--funnel-gap']: `${funnelGap}px` }}>
            <div className="funnel-label-list">
              {funnelData.map((f, i) => {
                const pct = ((f.count / funnelTotal) * 100).toFixed(1);
                return (
                  <div
                    key={f.label}
                    className="funnel-label-row"
                    onMouseEnter={() => setHoveredFunnel(i)}
                    onMouseLeave={() => setHoveredFunnel(null)}
                    onFocus={() => setHoveredFunnel(i)}
                    onBlur={() => setHoveredFunnel(null)}
                    tabIndex={0}
                  >
                    <div className="funnel-stage">{f.label}</div>
                    <div className="funnel-value">
                      <div className="count">{f.count.toLocaleString()}</div>
                      <div className="pct">{`(${pct}%)`}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} className="outreach-breakdown-card">
        <div className="card-heading">Account Health</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12 }}>
          <div style={{ width: 120, height: 120, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
              <circle cx="60" cy="60" r="48" stroke="url(#g1)" strokeWidth="14" strokeLinecap="round" fill="none" strokeDasharray={`${2*Math.PI*48}`} strokeDashoffset={`${2*Math.PI*48*(1 - healthPercent/100)}`} transform="rotate(-90 60 60)" />
              <text x="60" y="58" fill="var(--text)" fontSize="20" fontWeight="800" textAnchor="middle">{healthPercent}%</text>
              <text x="60" y="78" fill="var(--muted)" fontSize="12" textAnchor="middle">Excellent</text>
            </svg>
          </div>
          <div style={{ width: '100%', marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {healthItems.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'var(--muted)', fontWeight:700 }}>{it.label}</div>
                  <div style={{ color: it.color, fontWeight:800 }}>{it.status}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', marginTop: 12 }}>
            <button className="btn-small" style={{ width: '100%' }}>View Warmup Status</button>
          </div>
        </div>
      </div>
    </div>
  </div>

        {/* Insights Row: Channel Donut | Pipeline Value | Top Campaigns */}
        <div className="insights-row" style={{ padding: '0 36px', marginTop: 18, marginBottom: 18, display: 'flex', gap: 20 }}>
          {/* Channel Performance (Donut) */}
          <div className="insights-card channel-card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-heading">Channel Performance</span>
              <button className="btn-small">From omnichannel workflows</button>
            </div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', paddingTop: 6 }}>
              <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <defs>
                    <linearGradient id="d0" x1="0%" x2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#6366f1"/></linearGradient>
                    <linearGradient id="d1" x1="0%" x2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient>
                    <linearGradient id="d2" x1="0%" x2="100%"><stop offset="0%" stopColor="#ec4899"/><stop offset="100%" stopColor="#f472b6"/></linearGradient>
                    <linearGradient id="d3" x1="0%" x2="100%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#059669"/></linearGradient>
                  </defs>
                  <g transform="translate(60,60)">
                    {(() => {
                      const r = 36;
                      const c = 2 * Math.PI * r;
                      let offset = c * 0.25;
                      return insightsDonut.map((s, i) => {
                        const dash = c * (s.count / insightsDonutTotal);
                        const dashArr = `${dash} ${Math.max(0, c - dash)}`;
                        const so = offset;
                        offset -= dash;
                        const gradId = `d${i}`;
                        return (
                          <circle
                            key={i}
                            r={r}
                            cx={0}
                            cy={0}
                            fill="none"
                            stroke={`url(#${gradId})`}
                            strokeWidth={18}
                            strokeDasharray={dashArr}
                            strokeDashoffset={so}
                            strokeLinecap="round"
                            transform="rotate(-90)"
                          />
                        );
                      });
                    })()}
                    <circle r={24} cx={0} cy={0} fill="var(--card)" stroke="rgba(255,255,255,0.02)" strokeWidth={1} />
                    <text x={0} y={-4} textAnchor="middle" fill="var(--muted)" fontSize={12}>Total Sent</text>
                    <text x={0} y={14} textAnchor="middle" fill="var(--text)" fontWeight={800} fontSize={18}>{insightsDonutTotal.toLocaleString()}</text>
                  </g>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {insightsDonut.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ width: 12, height: 12, display: 'inline-block', background: s.color, borderRadius: 6 }} />
                          <div style={{ color: 'var(--muted)', fontWeight: 700 }}>{s.label}</div>
                        </div>
                        <div style={{ textAlign: 'right', color: 'var(--muted)', fontWeight: 700 }}>{s.pct}% <span style={{ color: 'var(--muted)', fontWeight: 600 }}>({s.count.toLocaleString()})</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Value Over Time */}
          <div className="insights-card pipeline-value-card" style={{ flex: 1.4 }}>
            <div className="card-header">
              <span className="card-heading">Pipeline Value Over Time</span>
              <button className="btn-small">View Trend</button>
            </div>
            <div style={{ padding: 12 }}>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pv" x1="0%" x2="0%" y1="0%" y2="100%"><stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6"/><stop offset="100%" stopColor="#7c3aed" stopOpacity="0.06"/></linearGradient>
                </defs>
                <path d={pipelinePath + ` L ${chartW - chartPad} ${chartH - chartPad} L ${chartPad} ${chartH - chartPad} Z`} fill="url(#pv)" opacity={0.9} />
                <path d={pipelinePath} stroke="var(--purple)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {pipelineSeries.map((v, i) => {
                  const x = chartPad + (i * (chartW - chartPad * 2) / (pipelineSeries.length - 1));
                  const y = chartPad + (1 - (v / pipelineMax)) * (chartH - chartPad * 2);
                  return <circle key={i} cx={x} cy={y} r={3.5} fill="var(--purple)" />
                })}
                {/* highlight last value */}
                {(() => {
                  const i = pipelineSeries.length - 1; const v = pipelineSeries[i];
                  const x = chartPad + (i * (chartW - chartPad * 2) / (pipelineSeries.length - 1));
                  const y = chartPad + (1 - (v / pipelineMax)) * (chartH - chartPad * 2);
                  return (
                    <g>
                      <rect x={x - 46} y={y - 36} rx={8} ry={8} width={92} height={28} fill="rgba(124,58,237,0.12)" />
                      <text x={x} y={y - 16} textAnchor="middle" fill="var(--text)" fontWeight={800} fontSize={12}>${v.toLocaleString()}</text>
                    </g>
                  );
                })()}
                <text x={(chartW)/2} y={chartH - 6} fill="var(--muted)" fontSize={12} fontWeight={700} textAnchor="middle">{pipelineDates[pipelineDates.length-1]}</text>
              </svg>
            </div>
          </div>

          {/* Top Performing Campaigns */}
          <div className="insights-card top-campaigns-card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-heading">Top Performing Campaigns</span>
              <button className="btn-small">View All Campaigns</button>
            </div>
            <div style={{ paddingTop: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'left' }}>
                    <th>Campaign</th>
                    <th style={{ textAlign: 'right' }}>Replies</th>
                    <th style={{ textAlign: 'right' }}>Reply Rate</th>
                    <th style={{ textAlign: 'right' }}>Meetings</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((c, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}><div style={{ fontWeight: 700 }}>{c.name}</div></td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>{c.replies}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--green)', fontWeight: 700 }}>{c.rate}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>{c.meetings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* KPI Metrics Row (5 columns) */}
        <div className="kpi-row">
          {[
            { title: 'Cost This Month', value: (c.cost_this_month !== undefined ? `$${Number(c.cost_this_month).toFixed(2)}` : '$2,450.75'), trend: { text: '↓ 8.2% vs last month', color: 'var(--green)' } },
            { title: 'Cost per Lead', value: (c.cost_per_lead !== undefined ? `$${Number(c.cost_per_lead).toFixed(2)}` : '$1.97'), trend: { text: '↓ 12.4% vs last month', color: 'var(--green)' } },
            { title: 'Cost per Meeting', value: (c.cost_per_meeting !== undefined ? `$${Number(c.cost_per_meeting).toFixed(2)}` : '$54.46'), trend: { text: '↓ 15.3% vs last month', color: 'var(--green)' } },
            { title: 'ROI (Meetings Value)', value: (c.roi_meetings_value !== undefined ? `${c.roi_meetings_value}%` : '428%'), trend: { text: '↑ 31.2% vs last month', color: 'var(--green)' } },
            { title: 'Plan Usage', value: (c.plan || 'Growth Plan'), extra: { percent: (c.plan_usage_percent !== undefined ? c.plan_usage_percent : 78) } },
          ].map((item, idx) => (
            <div key={idx} className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="kpi-title">{item.title}</div>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>●</div>
              </div>
              <div className="kpi-value">{item.value}{item.extra && item.extra.percent ? <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginLeft: 8 }}>{` (${item.extra.percent}%)`}</span> : null}</div>
              <div className="kpi-trend">
                {item.trend ? <div style={{ color: item.trend.color, fontWeight: 700, fontSize: 13 }}>{item.trend.text}</div> : <div style={{ flex: 1 }} />}
                {item.title === 'Plan Usage' ? (
                  <div style={{ width: '40%', textAlign: 'right' }}>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${item.extra.percent}%`, height: '100%', background: 'linear-gradient(90deg,var(--purple),var(--indigo))' }}></div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
