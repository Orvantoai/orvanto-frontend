import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');

  const [client, setClient] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDashboard = async () => {
    try {
      if (!clientId) {
        setErrorMsg('No client ID');
        setLoading(false);
        return;
      }

      const [clientResp, leadsResp] = await Promise.all([
        supabase.from('Clients').select('*').eq('client_id', clientId).limit(1),
        supabase.from('Leads').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(20)
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
      setErrorMsg('Error loading dashboard: ' + e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [clientId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--dark)', color: 'var(--text)' }}>
        <div className="sidebar" style={{ display: 'block' }}>
          <div className="logo-text" style={{ padding: '0 20px 24px', fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--purple),var(--indigo))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Orvanto AI</div>
        </div>
        <div className="dash-main">
          <div className="loading"><div className="spinner"></div>Loading your dashboard...</div>
        </div>
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
            <h2 style={{ color: '#ef4444' }}>{errorMsg}</h2>
            {errorMsg === 'No client ID' && <p style={{ color: 'var(--muted)', marginTop: 8 }}>Add <code>?client=your_client_id</code> to the URL</p>}
            <p style={{ marginTop: 16 }}><Link to="/signup" style={{ color: 'var(--purple)' }}>Sign up →</Link></p>
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)' }}>
      <div className="sidebar" style={{ display: 'block' }}>
        <div className="logo-text" style={{ padding: '0 20px 24px', fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--purple),var(--indigo))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>Orvanto AI</div>
        <div className="nav-item active">📊 Dashboard</div>
        <div className="nav-item">👥 Leads</div>
        <div className="nav-item">📅 Meetings</div>
        <div className="nav-item">📧 Outreach</div>
        <div className="nav-item">💰 Pipeline</div>
        <div className="nav-item">📈 Reports</div>
        <div className="nav-item">⚙️ Settings</div>
        <div style={{ marginTop: 'auto', padding: 20, color: 'var(--subtle)', fontSize: '.75rem', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ wordBreak: 'break-all' }}>ID: {clientId}</div>
        </div>
      </div>

      <div className="dash-main">
        <div className="header-row">
          <div>
            <h1>{c.name || 'Your Pipeline'}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{(c.plan || 'starter').toUpperCase()} PLAN · {(c.status || 'active').toUpperCase()}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={loadDashboard} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '.85rem' }}>↻ Refresh</button>
            <Link to={`/portal?client=${clientId}`} style={{ background: 'linear-gradient(135deg,var(--purple),var(--indigo))', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>Portal →</Link>
          </div>
        </div>

        {/* Guarantee Progress */}
        <div className="guarantee-bar">
          <div style={{ fontSize: '2rem' }}>🛡️</div>
          <div className="guar-progress">
            <div style={{ fontWeight: 700 }}>Guarantee Progress: {meetings}/3 meetings</div>
            <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{meetings >= 3 ? '✅ Guarantee achieved! You hit 3+ meetings.' : '3 qualified meetings in 30 days — or month 2 is free'}</div>
            <div className="guar-bar"><div className="guar-fill" style={{ width: `${Math.min(100, (meetings / 3) * 100)}%` }}></div></div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><div className="label">Leads Found</div><div className="value">{c.leads_generated || 0}</div><div className="change">Total to date</div></div>
          <div className="stat-card"><div className="label">Emails Sent</div><div className="value">{c.emails_sent || 0}</div><div className="change">{replyRate}% reply rate</div></div>
          <div className="stat-card"><div className="label">Replies</div><div className="value">{c.replies_received || 0}</div><div className="change">All channels</div></div>
          <div className="stat-card"><div className="label">Meetings Booked</div><div className="value" style={{ color: 'var(--green)' }}>{meetings}</div><div className="change">Qualified calls</div></div>
          <div className="stat-card"><div className="label">Pipeline Value</div><div className="value" style={{ color: 'var(--purple)' }}>${Math.round(c.pipeline_value || 0).toLocaleString()}</div><div className="change">Estimated</div></div>
        </div>

        {/* Warmup Status */}
        <div className="section" style={{ borderColor: c.warmup_complete ? 'var(--green)' : 'var(--border)' }}>
          <h2>Email Warmup Status</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Day {wd} / 14</div>
              <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{c.warmup_complete ? '✅ Warmup complete — outreach is live' : (c.dns_verified ? 'DNS verified ✓ — ' + (14 - wd) + ' days until outreach' : '⚠️ DNS setup required — check your email')}</div>
            </div>
            <div className="warmup-indicator">
              {Array.from({ length: 14 }).map((_, i) => {
                const day = i + 1;
                return (
                  <div key={day} className={`warmup-dot ${day < wd ? 'done' : day === wd ? 'active' : ''}`} title={`Day ${day}`}></div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="section">
          <h2>Recent Leads</h2>
          <div className="lead-row lead-header">
            <div>Name</div><div>Company</div><div>Status</div><div>Last Activity</div><div>Score</div>
          </div>
          <div>
            {leads.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '.85rem', padding: '20px 0' }}>No leads yet — lead generation runs daily at 7AM.</div>
            ) : (
              leads.slice(0, 10).map((l, i) => {
                const status = l.meeting_booked ? 'booked' : l.email_replied ? 'replied' : l.email_sent ? 'emailed' : l.converted ? 'converted' : 'new';
                const badgeClass = { new: 'badge-new', emailed: 'badge-emailed', replied: 'badge-replied', booked: 'badge-booked', converted: 'badge-converted' }[status] || 'badge-new';
                const date = l.created_at ? new Date(l.created_at).toLocaleDateString() : '—';
                return (
                  <div className="lead-row" key={i}>
                    <div><strong>{l.first_name || ''} {l.last_name || ''}</strong><br /><span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{l.email || ''}</span></div>
                    <div><span style={{ color: 'var(--text)' }}>{l.company || '—'}</span><br /><span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{l.title || ''}</span></div>
                    <div><span className={`badge ${badgeClass}`}>{status}</span></div>
                    <div style={{ color: 'var(--muted)' }}>{date}</div>
                    <div style={{ color: (l.bant_score || 0) >= 70 ? 'var(--green)' : 'var(--muted)' }}>{l.bant_score || l.score || '—'}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="section">
          <h2>Activity Feed</h2>
          <div>
            {activities.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '.85rem', padding: '20px 0' }}>No activity yet. Come back after Day 14 when outreach begins.</div>
            ) : (
              activities.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-dot" style={{ background: a.color }}></div>
                  <div>
                    <div>{a.text}</div>
                    <div style={{ color: 'var(--subtle)', fontSize: '.75rem' }}>{a.time ? new Date(a.time).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
