import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function Outreach() {
  const [activeTab, setActiveTab] = useState('Overview');

  const kpis = [
    { title: 'Total Outreach', value: '12,846', sub: '▲ 18.6% vs Apr 5 - May 4', icon: <FiUpload /> },
    { title: 'Delivered', value: '11,204', sub: '▲ 17.2% vs Apr 5 - May 4', icon: <FiMail /> },
    { title: 'Opened', value: '3,456', sub: '32.7% vs delivered', icon: <FiUsers /> },
    { title: 'Replied', value: '786', sub: '7.0% vs delivered', icon: <FiMail /> },
    { title: 'Meetings Booked', value: '45', sub: '▲ 25.0% vs Apr 5 - May 4', icon: <FiPhone /> },
    { title: 'Response Rate', value: '7.0%', sub: '▲ 12.4% vs Apr 5 - May 4', icon: <FiMail /> }
  ];

  const lineValues = [300, 420, 600, 420, 560, 720, 880, 900, 1020, 1180, 1400, 1680];

  const channels = [
    { name: 'Email', sent: 8342, delivered: 7245, replies: 563, rate: '7.8%' },
    { name: 'LinkedIn', sent: 2154, delivered: 1872, replies: 116, rate: '6.2%' },
    { name: 'SMS', sent: 1234, delivered: 1098, replies: 56, rate: '5.1%' },
    { name: 'WhatsApp', sent: 687, delivered: 612, replies: 54, rate: '8.9%' },
    { name: 'Voice Calls', sent: 429, delivered: 377, replies: 35, rate: '9.3%' }
  ];

  const recent = [
    { id: 1, name: 'Alex Thompson', company: 'TechCorp', channel: 'Email', campaign: 'May Outreach 2025', step: 'Step 1 - Intro Email', status: 'Replied', sentAt: 'May 7, 9:15 AM', openedAt: 'May 7, 11:32 AM', repliedAt: 'May 7, 3:45 PM', result: 'Interested' },
    { id: 2, name: 'Sophie Martin', company: 'InnovateLabs', channel: 'LinkedIn', campaign: 'LinkedIn Connect - May', step: 'Connection Request', status: 'Accepted', sentAt: 'May 7, 10:02 AM', openedAt: '—', repliedAt: '—', result: '—' },
    { id: 3, name: 'Michael Brown', company: 'DataFlow', channel: 'Email', campaign: 'Product Launch - Q2', step: 'Step 2 - Follow up', status: 'Opened', sentAt: 'May 6, 2:30 PM', openedAt: 'May 6, 6:12 PM', repliedAt: '—', result: '—' },
  ];

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

            <div className="pipeline-controls" style={{ marginTop: 10 }}>
              <input className="pipeline-search" placeholder="Search campaigns, leads, messages..." />
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
                    <div style={{ color: 'var(--muted)' }}>7.0% Overall</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
                    <Donut percent={7} />
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
                  <div style={{ color: 'var(--muted)', marginTop: 6 }}>Conversion to Meeting: 0.4%</div>
                  <div style={{ marginTop: 12 }}>
                    <div className="funnel-stage" style={{ '--w': '100%', background: 'linear-gradient(90deg,var(--purple),var(--indigo))' }}>
                      <div className="funnel-meta">Sent <span>12,846</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': '86%', background: 'linear-gradient(90deg,var(--indigo),#06b6d4)' }}>
                      <div className="funnel-meta">Delivered <span>11,204</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': '30%', background: 'linear-gradient(90deg,#06b6d4,var(--green))' }}>
                      <div className="funnel-meta">Opened <span>3,456</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': '7%', background: 'linear-gradient(90deg,var(--green),var(--amber))' }}>
                      <div className="funnel-meta">Replied <span>786</span></div>
                    </div>
                    <div className="funnel-stage" style={{ '--w': '0.4%', background: 'linear-gradient(90deg,var(--amber),var(--purple))' }}>
                      <div className="funnel-meta">Meetings <span>45</span></div>
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
                    <div style={{ color: 'var(--muted)' }}>May Outreach 2025</div>
                    <div style={{ fontWeight: 800 }}>3,245</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: 'var(--muted)' }}>LinkedIn Connect - May</div>
                    <div style={{ fontWeight: 800 }}>2,154</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ fontWeight: 800 }}>Sequence Performance</div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: 'var(--muted)' }}>Intro Email Sequence</div>
                    <div style={{ fontWeight: 800 }}>2,456</div>
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
