import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import './Reports.css';
import { FiDownload } from 'react-icons/fi';

function MiniSpark({ values = [], color = 'var(--purple)', width = 80, height = 28 }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values) || 1;
  const points = values.map((v, i) => `${(i * (width / (values.length - 1))).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mini-spark">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function LineChart({ values = [] }) {
  const w = 720, h = 220;
  if (!values || values.length === 0) return <div className="chart-empty">No data</div>;
  const max = Math.max(...values) || 1;
  const points = values.map((v, i) => `${(i * (w / (values.length - 1))).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ');
  const area = `M0 ${h} L${points.split(' ').join(' L ')} L${w} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="line-svg-large">
      <defs>
        <linearGradient id="lg2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--purple)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--purple)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg2)" />
      <polyline points={points} fill="none" stroke="var(--purple)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Donut({ percent = 50, size = 140, stroke = 16, color = 'var(--purple)' }) {
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const dash = (percent / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
      <g transform={`translate(${size / 2},${size / 2})`}>
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={stroke} />
        <circle r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c * 0.25} />
        <text x="0" y="6" textAnchor="middle" fontWeight={800} fontSize={18} fill="var(--text)">{percent}%</text>
      </g>
    </svg>
  );
}

export default function Reports() {
  const [range, setRange] = useState('May 5 - Jun 4, 2025');
  const kpis = [
    { title: 'Leads Generated', value: '2,453', delta: '▲ 18.4% vs Apr 5 - May 4', spark: [300, 420, 360, 520, 610] },
    { title: 'Emails Sent', value: '8,342', delta: '▲ 22.1% vs Apr 5 - May 4', spark: [1200, 1250, 1100, 1500, 1340] },
    { title: 'Replies Received', value: '312', delta: '▲ 24.7% vs Apr 5 - May 4', spark: [30, 50, 60, 40, 80] },
    { title: 'Meetings Booked', value: '45', delta: '▲ 28.6% vs Apr 5 - May 4', spark: [2, 6, 8, 12, 17] },
    { title: 'Pipeline Value', value: '$328,450', delta: '▲ 35.8% vs Apr 5 - May 4', spark: [20, 40, 60, 80, 100] },
    { title: 'Win Rate (Est.)', value: '42%', delta: '▲ 5.2% vs Apr 5 - May 4', spark: [30, 35, 40, 38, 42] }
  ];

  const lineValues = [500, 700, 1100, 900, 1000, 1200, 1500, 1600, 1700, 1900, 2150, 2350];

  const channels = [
    { name: 'Email', value: 8342, pct: 64.9 },
    { name: 'LinkedIn', value: 2154, pct: 16.8 },
    { name: 'SMS', value: 1234, pct: 9.6 },
    { name: 'WhatsApp', value: 687, pct: 5.3 },
    { name: 'Voice Calls', value: 429, pct: 3.4 }
  ];

  const campaigns = [
    { name: 'May Outreach 2025', sent: 3245, delivered: 2891, replies: 231, rate: '8.0%', meetings: 16, value: '$98,450', status: 'Active' },
    { name: 'LinkedIn Connect - May', sent: 2154, delivered: 1872, replies: 116, rate: '6.2%', meetings: 6, value: '$76,200', status: 'Active' },
    { name: 'Product Launch - Q2', sent: 1876, delivered: 1642, replies: 143, rate: '7.6%', meetings: 9, value: '$64,800', status: 'Completed' }
  ];

  const repliesByIntent = [48, 92, 54, 18]; // placeholder counts
  const meetingsOutcome = [28, 8, 6, 3];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex', marginTop: 40 }}>
      <Sidebar active="Reports" />

      <div style={{ flex: 1, minWidth: 0, padding: 0 }}>
        <DashboardHeader showExport={false} />
        <div className="reports-header">
          <div className="reports-title">
            <h2>Reports</h2>
            <div className="reports-sub">Track performance, analyze results and get AI-powered insights.</div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* <select className="range-select" value={range} onChange={(e) => setRange(e.target.value)}>
              <option>May 5 - Jun 4, 2025</option>
              <option>Apr 5 - May 4, 2025</option>
            </select> */}
            {/* <button className="btn-export"><FiDownload /> Export Report</button> */}
          </div>
        </div>

        <div className="reports-tabs">
          <div className="tab active">Overview</div>
          <div className="tab">Performance</div>
          <div className="tab">Outreach</div>
          <div className="tab">Leads</div>
          <div className="tab">Meetings</div>
          <div className="tab">Pipeline</div>
          <div className="tab">Activity</div>
          <div className="tab">All Insights</div>
          <div className="tab">Custom Reports</div>
        </div>

        <div className="reports-container">
          <div className="left-col">
            <div className="kpis-row">
              {kpis.map((k, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-left">
                    <div className="kpi-title">{k.title}</div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-delta">{k.delta}</div>
                  </div>
                  <div className="kpi-spark"><MiniSpark values={k.spark} /></div>
                </div>
              ))}
            </div>

            <div className="main-grid">
              <div className="card chart-large">
                <div className="card-header">
                  <div>Performance Over Time</div>
                  <div className="card-sub">Leads • Emails Sent • Replies • Meetings</div>
                </div>
                <LineChart values={lineValues} />
              </div>

              <div className="card right-small">
                <div className="card-header">
                  <div>Channel Performance</div>
                </div>
                <div className="donut-wrap">
                  <Donut percent={100} size={180} stroke={18} color="var(--purple)" />
                  <div className="donut-legend">
                    <div className="donut-total">Total<br /><strong>12,846</strong></div>
                    {channels.map((c, idx) => (
                      <div key={idx} className="donut-row">
                        <div className="legend-color" style={{ background: ['var(--purple)','var(--indigo)','#06b6d4','var(--green)','var(--amber)'][idx] }}></div>
                        <div className="legend-name">{c.name}</div>
                        <div className="legend-value">{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card bottom-row">
                <div className="small-cards">
                  <div className="card small">
                    <div className="card-header">Replies by Intent</div>
                    <div className="donut-row-inner"><Donut percent={Math.round((repliesByIntent[0]/312)*100)} size={120} stroke={14} color="var(--green)" /><div className="donut-meta">312<br /><span className="muted">Total Replies</span></div></div>
                  </div>
                  <div className="card small">
                    <div className="card-header">Meetings Outcome</div>
                    <div className="donut-row-inner"><Donut percent={Math.round((meetingsOutcome[0]/45)*100)} size={120} stroke={14} color="var(--amber)" /><div className="donut-meta">45<br /><span className="muted">Total Meetings</span></div></div>
                  </div>
                  <div className="card small bars-card">
                    <div className="card-header">Top Industries</div>
                    <div className="bars">
                      <div className="bar-row"><div className="bar-label">SaaS</div><div className="bar"><div style={{ width: '70%' }} /></div><div className="bar-value">18</div></div>
                      <div className="bar-row"><div className="bar-label">IT Services</div><div className="bar"><div style={{ width: '55%' }} /></div><div className="bar-value">14</div></div>
                      <div className="bar-row"><div className="bar-label">E-commerce</div><div className="bar"><div style={{ width: '35%' }} /></div><div className="bar-value">10</div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card table-card">
                <div className="card-header">Campaign Performance</div>
                <table className="campaign-table">
                  <thead>
                    <tr>
                      <th>Campaign Name</th>
                      <th>Channel</th>
                      <th>Sent</th>
                      <th>Delivered</th>
                      <th>Replies</th>
                      <th>Reply Rate</th>
                      <th>Meetings</th>
                      <th>Pipeline Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
                        <td>—</td>
                        <td>{c.sent}</td>
                        <td>{c.delivered}</td>
                        <td>{c.replies}</td>
                        <td className="green">{c.rate}</td>
                        <td>{c.meetings}</td>
                        <td>{c.value}</td>
                        <td className={`status-pill status-${c.status.toLowerCase()}`}>{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="right-col">
            <div className="card insights">
              <div className="card-header">AI Insights</div>
              <div className="insight-pill">Key Insight</div>
              <div className="insight-body">Your response rate improved by 24.7% this month. LinkedIn outreach shows strong potential—consider increasing activity.</div>
              <div className="recommendations">
                <div className="rec">Increase follow-ups for warm leads</div>
                <div className="rec">Focus on SaaS and IT Services industries</div>
                <div className="rec">Best sending time: 10:00 AM — 12:00 PM</div>
              </div>
              <button className="btn-view">View Detailed Insights</button>
            </div>

            <div className="card summary">
              <div className="card-header">Report Summary</div>
              <div className="summary-row"><div className="muted">Date Range</div><div>May 5 - Jun 4, 2025</div></div>
              <div className="summary-row"><div className="muted">Compared To</div><div>Apr 5 - May 4, 2025</div></div>
              <div className="summary-row"><div className="muted">Total Outreach</div><div>12,846</div></div>
              <div className="summary-row"><div className="muted">Total Replies</div><div>312</div></div>
              <div className="summary-row"><div className="muted">Meetings Booked</div><div>45</div></div>
              <div className="summary-row"><div className="muted">Pipeline Value</div><div>$328,450</div></div>
            </div>

            <div className="card schedule">
              <div className="card-header">Schedule Reports</div>
              <div className="muted">Get this report automatically delivered to your inbox.</div>
              <div style={{ marginTop: 12 }}>
                <select className="range-select"><option>Weekly</option></select>
                <input className="input" placeholder="john.doe@acmecorp.com" />
                <button className="btn-schedule">Schedule Report</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
