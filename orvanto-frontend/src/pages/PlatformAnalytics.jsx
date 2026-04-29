import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import './PlatformAnalytics.css';

function Sparkline({ values = [], stroke = 'rgba(124,58,237,0.9)' }) {
  const w = 88, h = 28;
  if (!values || values.length === 0) return <svg width={w} height={h} />;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 6) + 3;
    const y = max === min ? h / 2 : h - 4 - ((v - min) / (max - min)) * (h - 8);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="sparkline">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PlatformAnalytics() {
  const [range, setRange] = useState('Last 30 days');
  const [activeTab, setActiveTab] = useState('Overview');

  const kpis = useMemo(() => ([
    { label: 'Total Tenants', value: '128', delta: '+12.4%', spark: [2,3,4,5,4,5,6,7,8,9] },
    { label: 'Active Users', value: '2,843', delta: '+15.6%', spark: [10,12,15,14,18,19,21,22,24,28] },
    { label: 'MRR', value: '$248,750', delta: '+18.6%', spark: [40,45,48,52,56,60,67,72,80,88] },
    { label: 'Total Revenue', value: '$2,984,540', delta: '+16.2%', spark: [200,220,240,260,280,300,320,340,360,380] },
    { label: 'New Signups', value: '318', delta: '+9.3%', spark: [8,10,12,15,17,18,20,22,25,28] },
    { label: 'Churn Rate', value: '2.45%', delta: '-0.6%', spark: [3,3,2.9,2.8,2.7,2.6,2.5,2.5,2.45,2.4] }
  ]), []);

  const tenants = useMemo(() => (
    [
      { tenant: 'Acme Corp', plan: 'Enterprise', mrr: '$24,950', users: 1248, growth: '+22.5%' },
      { tenant: 'InnovateX', plan: 'Pro', mrr: '$12,450', users: 856, growth: '+18.7%' },
      { tenant: 'Growth Labs', plan: 'Pro', mrr: '$12,450', users: 643, growth: '+16.3%' },
      { tenant: 'SaaSify', plan: 'Growth', mrr: '$7,950', users: 512, growth: '+14.8%' },
      { tenant: 'TechNova', plan: 'Pro', mrr: '$6,250', users: 432, growth: '+12.4%' }
    ]
  ), []);

  const tabs = ['Overview','Growth','Revenue','Users','Usage','Engagement','Subscriptions','Churn'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex' }}>
      <Sidebar active="Platform Analytics" admin={true} compact={true} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <DashboardHeader showExport={true} showRefresh={true} />

        <div className="pa-container">
          <div className="pa-header">
            <div>
              <h1 className="pa-title">Platform Analytics</h1>
              <div className="pa-sub">Comprehensive overview of platform performance, growth, revenue and usage.</div>
            </div>
            <div className="pa-controls">
              <div className="pa-filter"><select value={range} onChange={(e) => setRange(e.target.value)}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select></div>
              <button className="btn-ghost">Filters</button>
              <button className="btn-ghost">Export</button>
            </div>
          </div>

          <div className="pa-filter-bar">
            <div className="fb-left">
              <select className="fb-select"><option>All Tenants</option></select>
              <select className="fb-select"><option>All Plans</option></select>
              <select className="fb-select"><option>Region</option></select>
              <select className="fb-select"><option>Channel</option></select>
            </div>
            <div className="fb-right"><button className="btn-ghost">Apply</button></div>
          </div>

          <div className="pa-kpis">
            {kpis.map(k => (
              <div key={k.label} className="pa-kpi">
                <div className="kpi-top"><div className="kpi-icon" /> <div className={`kpi-delta ${k.delta.startsWith('+') ? 'pos':'neg'}`}>{k.delta}</div></div>
                <div className="kpi-value">{k.value}</div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-spark"><Sparkline values={k.spark} stroke={'rgba(124,58,237,0.9)'} /></div>
              </div>
            ))}
          </div>

          <div className="pa-tabs">
            {tabs.map(t => (
              <button key={t} className={`tab ${activeTab===t? 'active':''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          <div className="pa-grid-main">
            <div className="card mrr-card">
              <div className="card-head"><h4>MRR Overview</h4><div className="muted">Monthly recurring revenue over time</div></div>
              <div className="mrr-chart">
                <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="mrr-svg">
                  <polyline fill="none" stroke="#8b5cf6" strokeWidth="3" points="10,190 60,170 110,150 160,130 210,110 260,95 310,82 360,68 410,56 460,42 540,28" />
                </svg>
              </div>
            </div>

            <div className="card donut-card">
              <h4>Revenue Breakdown</h4>
              <div className="donut-wrap">
                <div className="donut-chart" style={{ background: 'conic-gradient(#7c3aed 0 45%, #6366f1 0 72%, #22c55e 0 88%, #f59e0b 0 100%)' }}>
                  <div className="donut-center">$248,750</div>
                </div>
                <ul className="donut-legend">
                  <li><span className="dot" style={{background:'#7c3aed'}} /> Enterprise <span>$112,500 (45%)</span></li>
                  <li><span className="dot" style={{background:'#6366f1'}} /> Pro <span>$87,200 (35%)</span></li>
                  <li><span className="dot" style={{background:'#22c55e'}} /> Growth <span>$37,100 (15%)</span></li>
                  <li><span className="dot" style={{background:'#f59e0b'}} /> Starter <span>$11,950 (5%)</span></li>
                </ul>
              </div>
            </div>

            <div className="card user-growth">
              <h4>User Growth</h4>
              <div className="bars">
                {[1200,1400,1600,1800,2100,2400,2843].map((v,i) => (
                  <div key={i} className="bar" style={{height: `${Math.min(100, Math.round((v/3000)*100))}%`}} title={v} />
                ))}
              </div>
            </div>

            <div className="card tenants-plan">
              <h4>Tenants by Plan</h4>
              <div className="plan-donut">
                <div className="donut-small" style={{ background: 'conic-gradient(#7c3aed 0 25%, #6366f1 0 57%, #22c55e 0 87%, #f59e0b 0 100%)' }}>
                  <div className="donut-center-small">128<br/><span className="muted">Total</span></div>
                </div>
              </div>
            </div>

            <div className="card signups-trend">
              <h4>New Signups</h4>
              <div className="mini-bars">
                {[80,120,160,200,260,300,318].map((v,i) => <div key={i} className="mini-bar" style={{height:`${Math.min(100, Math.round((v/400)*100))}%`}} />)}
              </div>
            </div>

            <div className="card funnel-card">
              <h4>Trials & Conversions</h4>
              <div className="funnel"> 
                <div className="f-step">Trial <span className="muted">18</span></div>
                <div className="f-step">Active <span className="muted">12</span></div>
                <div className="f-step">Converted <span className="muted">7</span></div>
                <div className="f-step">Conversion Rate <span className="muted">38.9%</span></div>
              </div>
            </div>

            <div className="card top-tenants">
              <h4>Top Performing Tenants</h4>
              <table className="simple-table">
                <thead><tr><th>Tenant</th><th>Plan</th><th>MRR</th><th>Users</th><th>Growth</th></tr></thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.tenant}><td>{t.tenant}</td><td>{t.plan}</td><td>{t.mrr}</td><td>{t.users}</td><td className="green">{t.growth}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card revenue-changes">
              <h4>Top Revenue Changes</h4>
              <ul className="rev-list">
                <li>Acme Corp <span className="green">+22.5%</span> <strong>$4,550</strong></li>
                <li>InnovateX <span className="green">+18.7%</span> <strong>$1,950</strong></li>
                <li>Cloudly <span className="red">-6.2%</span> <strong>-$420</strong></li>
              </ul>
            </div>

            <div className="card usage-card">
              <h4>Platform Usage Overview</h4>
              <ul className="usage-list">
                <li>Emails Sent<div className="usage-bar"><div style={{width:'48%'}} /></div><span>2.48M / 5M</span></li>
                <li>Leads Generated<div className="usage-bar"><div style={{width:'50%'}} /></div><span>1.25M / 2.5M</span></li>
                <li>Meetings Booked<div className="usage-bar"><div style={{width:'24%'}} /></div><span>48.6K / 100K</span></li>
                <li>Storage Used<div className="usage-bar"><div style={{width:'40%'}} /></div><span>1.2 TB / 3 TB</span></li>
                <li>API Requests<div className="usage-bar"><div style={{width:'43%'}} /></div><span>8.6M / 20M</span></li>
              </ul>
            </div>
          </div>

          <div className="activity-row">
            <div className="card activity-feed fullwidth">
              <h4>Recent Platform Activity</h4>
              <ul className="activity-list">
                <li>New tenant Acme Corp — 2 mins ago</li>
                <li>Plan upgraded to Enterprise — 15 mins ago</li>
                <li>Payment of $24,950 received — 1 hour ago</li>
                <li>Trial started by SaaSify — 2 hours ago</li>
                <li>Invoice INV-000124 paid — Growth Labs — 3 hours ago</li>
                <li>New user added — TechNova — 4 hours ago</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
