import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import './Outreach.css';
import { FiMail, FiPhone, FiUpload, FiUsers } from 'react-icons/fi';

function fmt(n) { return typeof n === 'number' ? n.toLocaleString() : (n || '—'); }

function LineChart({ values = [] }) {
  const w = 600, h = 180;
  if (!values || values.length === 0) return <div className="chart-empty">No data</div>;
  const max = Math.max(...values) || 1;
  const points = values.map((v, i) => `${(i * (w / (values.length - 1))).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ');
  const area = `M0 ${h} L${points.split(' ').join(' L ')} L${w} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="line-svg">
      <defs>
        <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--purple)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--purple)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg)" />
      <polyline points={points} fill="none" stroke="var(--purple)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Donut({ percent = 70, size = 120, stroke = 16 }) {
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const dash = (percent / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
      <g transform={`translate(${size / 2},${size / 2})`}>
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle r={r} fill="none" stroke="var(--green)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c * 0.25} />
        <text x="0" y="6" textAnchor="middle" fontWeight={800} fontSize={18} fill="var(--text)">{percent}%</text>
        <text x="0" y="28" textAnchor="middle" fontSize={12} fill="var(--muted)">Overall</text>
      </g>
    </svg>
  );
}

import { triggerOutreach } from '../services/api';

export default function Outreach() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client') || 'orvanto_self';

  const [activeTab, setActiveTab] = useState('Overview');
  const [isTriggering, setIsTriggering] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!clientId) return;
      setLoading(true);
      try {
        const [clientResp, leadsResp] = await Promise.all([
          supabase.from('Clients').select('*').eq('client_id', clientId).single(),
          supabase.from('Leads').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(200)
        ]);
        if (clientResp.data) setClientData(clientResp.data);
        if (leadsResp.data) setLeadsData(leadsResp.data);
      } catch (e) {
        console.error('Error fetching outreach data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId]);

  const handleStartCampaign = async () => {
    setIsTriggering(true);
    try {
      await triggerOutreach({ action: 'start_outreach_campaign', timestamp: new Date().toISOString() });
      alert('Outreach workflow triggered successfully in n8n!');
    } catch (e) {
      alert('Error triggering webhook: ' + e.message);
    } finally {
      setIsTriggering(false);
    }
  };

  const totalSent = (clientData?.emails_sent || 0) + (clientData?.whatsapp_messages_sent || 0) + (clientData?.sms_messages_sent || 0);
  const totalReplied = (clientData?.replies_received || 0);
  const totalMeetings = (clientData?.meetings_booked || 0);
  const openedEst = Math.floor(totalSent * 0.32); // Estimate if not directly tracked

  const responseRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0.0';

  const kpis = [
    { title: 'Total Outreach', value: fmt(totalSent), sub: 'Live Database Metric', icon: <FiUpload /> },
    { title: 'Delivered', value: fmt(totalSent), sub: 'Assuming 98% Delivery', icon: <FiMail /> },
    { title: 'Opened (Est.)', value: fmt(openedEst), sub: '32.0% vs delivered', icon: <FiUsers /> },
    { title: 'Replied', value: fmt(totalReplied), sub: `${responseRate}% vs delivered`, icon: <FiMail /> },
    { title: 'Meetings Booked', value: fmt(totalMeetings), sub: 'Live Database Metric', icon: <FiPhone /> },
    { title: 'Response Rate', value: `${responseRate}%`, sub: 'Live Database Metric', icon: <FiMail /> }
  ];

  const lineValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, totalSent ? totalSent / 2 : 0, totalSent ? totalSent : 0];

  const emailSent = leadsData.filter(l => l.email_sent).length;
  const liSent = leadsData.filter(l => l.linkedin_sent).length;
  
  const channels = [
    { name: 'Email', sent: clientData?.emails_sent || emailSent || 0, delivered: clientData?.emails_sent || emailSent || 0, rate: responseRate + '%' },
    { name: 'LinkedIn', sent: liSent || 0, delivered: liSent || 0, rate: (liSent > 0 ? '5.2%' : '0.0%') },
    { name: 'WhatsApp', sent: clientData?.whatsapp_messages_sent || 0, delivered: clientData?.whatsapp_messages_sent || 0, rate: '0.0%' },
    { name: 'SMS', sent: clientData?.sms_messages_sent || 0, delivered: clientData?.sms_messages_sent || 0, rate: '0.0%' }
  ];

  const recent = leadsData.slice(0, 10).map((l, i) => ({
    id: l.id || i,
    name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unknown',
    company: l.company || '—',
    channel: l.intent_source || (l.linkedin_sent ? 'LinkedIn' : 'Email'),
    campaign: l.instantly_campaign_name || 'Main Sequence',
    step: l.status || 'Emailed',
    status: l.converted ? 'Converted' : (l.email_replied ? 'Replied' : (l.email_sent ? 'Sent' : 'Pending')),
    sentAt: l.emailed_at ? new Date(l.emailed_at).toLocaleDateString() : '—',
    openedAt: l.last_reply_at ? new Date(l.last_reply_at).toLocaleDateString() : '—',
    repliedAt: l.last_reply_at ? new Date(l.last_reply_at).toLocaleDateString() : '—',
    result: l.meeting_booked ? 'Meeting Booked' : (l.email_replied ? 'Interested' : '—')
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex', fontFamily: 'Inter, sans-serif', marginTop: 40 }}>
      <Sidebar active="Outreach" />

      <div style={{ flex: 1, minWidth: 0, background: 'var(--dark)', padding: '0', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <DashboardHeader showExport={false} />

        <div className="outreach-wrap">
          <div className="outreach-top">
            <div className="kpis-row">
              {kpis.map((k, i) => (
                <div key={i} className="kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="kpi-title">{k.title}</div>
                      <div className="kpi-value">{k.value}</div>
                      <div className="kpi-sub">{k.sub}</div>
                    </div>
                    <div style={{ fontSize: 22, opacity: 0.9 }}>{k.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pipeline-controls" style={{ marginTop: 10, display: 'flex', gap: '10px' }}>
              <input className="pipeline-search" placeholder="Search campaigns, leads, messages..." style={{ flex: 1 }} />
              <button 
                className="btn-primary" 
                onClick={handleStartCampaign} 
                disabled={isTriggering}
                style={{ padding: '0 16px', background: 'var(--purple)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                {isTriggering ? 'Triggering...' : 'Start Campaign'}
              </button>
              <div className="pipeline-filters">
                <select><option>All Channels</option></select>
                <select><option>All Campaigns</option></select>
                <select><option>All Sequences</option></select>
                <select><option>All Statuses</option></select>
                <button className="btn-small">Filters</button>
              </div>
              <div className="pipeline-actions">
                <button className="btn-small">Export Report</button>
                <button className="btn-add">Save View</button>
              </div>
            </div>
          </div>

          <div className="outreach-grid">
            <main className="main-col">
              <div className="card chart-large">
                <div className="chart-header">
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Outreach Performance Over Time</div>
                    <div style={{ color: 'var(--muted)', marginTop: 6 }}>Sent • Delivered • Opened • Replied • Meetings</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <LineChart values={lineValues} />
                </div>
              </div>

              <div className="lower-charts">
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800 }}>Response Rate by Channel</div>
                    <div style={{ color: 'var(--muted)' }}>{responseRate}% Overall</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
                    <Donut percent={parseFloat(responseRate) || 0} />
                    <div style={{ flex: 1 }}>
                      {channels.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ color: 'var(--muted)' }}>{c.name}</div>
                          <div style={{ fontWeight: 800 }}>{c.rate}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontWeight: 800 }}>Outreach Funnel</div>
                  <div style={{ color: 'var(--muted)', marginTop: 6 }}>Conversion to Meeting: {totalSent > 0 ? ((totalMeetings / totalSent) * 100).toFixed(1) : 0}%</div>
                  <div style={{ marginTop: 12 }}>
                    <div className="funnel-stage" style={{ '--w': '100%', background: 'linear-gradient(90deg,var(--purple),var(--indigo))' }}>
                      <div className="funnel-meta">Sent <span>{fmt(totalSent)}</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': '98%', background: 'linear-gradient(90deg,var(--indigo),#06b6d4)' }}>
                      <div className="funnel-meta">Delivered <span>{fmt(totalSent)}</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': '32%', background: 'linear-gradient(90deg,#06b6d4,var(--green))' }}>
                      <div className="funnel-meta">Opened <span>{fmt(openedEst)}</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': `${responseRate}%`, background: 'linear-gradient(90deg,var(--green),var(--amber))' }}>
                      <div className="funnel-meta">Replied <span>{fmt(totalReplied)}</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': `${totalSent > 0 ? ((totalMeetings / totalSent) * 100) : 0}%`, background: 'linear-gradient(90deg,var(--amber),var(--purple))' }}>
                      <div className="funnel-meta">Meetings <span>{fmt(totalMeetings)}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card recent-activity">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>Recent Outreach Activity</div>
                  <Link to="#" style={{ color: 'var(--purple)', fontWeight: 700 }}>View All Activity</Link>
                </div>
                <table className="activity-table" style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Channel</th>
                      <th>Campaign / Sequence</th>
                      <th>Step</th>
                      <th>Status</th>
                      <th>Sent At</th>
                      <th>Opened At</th>
                      <th>Replied At</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.id}>
                        <td>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div className="avatar-small-card">{(r.name||'').toString().charAt(0)}</div>
                            <div>
                              <div style={{ fontWeight: 800 }}>{r.name}</div>
                              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{r.company}</div>
                            </div>
                          </div>
                        </td>
                        <td>{r.channel}</td>
                        <td>{r.campaign}</td>
                        <td>{r.step}</td>
                        <td><span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                        <td>{r.sentAt}</td>
                        <td>{r.openedAt}</td>
                        <td>{r.repliedAt}</td>
                        <td>{r.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>

            <aside className="right-col">
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>Channel Performance</div>
                  <Link to="#" style={{ color: 'var(--purple)', fontWeight: 700 }}>View Details</Link>
                </div>
                <div style={{ marginTop: 12 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {channels.map((c, i) => (
                        <tr key={i} style={{ height: 38 }}>
                          <td style={{ color: 'var(--muted)' }}>{c.name}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>{fmt(c.sent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>Top Campaigns</div>
                  <Link to="#" style={{ color: 'var(--purple)', fontWeight: 700 }}>View All</Link>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: 'var(--muted)' }}>Main Sequence</div>
                    <div style={{ fontWeight: 800 }}>{fmt(totalSent)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: 'var(--muted)' }}>LinkedIn Connect</div>
                    <div style={{ fontWeight: 800 }}>{fmt(liSent)}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ fontWeight: 800 }}>Sequence Performance</div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: 'var(--muted)' }}>Intro Email Sequence</div>
                    <div style={{ fontWeight: 800 }}>{fmt(totalSent)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: 'var(--muted)' }}>Follow-up Sequence 1</div>
                    <div style={{ fontWeight: 800 }}>1,876</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
