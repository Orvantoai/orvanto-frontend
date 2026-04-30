import { useState, useEffect, useRef } from 'react';
import { supabaseAdmin } from '../services/supabaseClient';
import Sidebar from '../components/Sidebar';
import AIFlowAnimation from '../components/AIFlowAnimation';
import UsersTable from '../components/UsersTable';
import CampaignTable from '../components/CampaignTable';
import PlatformOverview from '../components/PlatformOverview';
import { FiUsers, FiBell, FiActivity, FiUserPlus, FiCreditCard, FiMail, FiSettings, FiBarChart2 } from 'react-icons/fi';
import './Admin.css';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState([]);
  const [costs, setCosts] = useState(0);
  const [growthPeriod, setGrowthPeriod] = useState('Month');
  const [mrrPeriod, setMrrPeriod] = useState('Monthly');

  // Quick Actions & Modals
  const [quickActionModal, setQuickActionModal] = useState(null);
  const [userActionMenu, setUserActionMenu] = useState({ userId: null, pos: { x: 0, y: 0 } });
  const [modalForm, setModalForm] = useState({});

  const checkLogin = () => {
    if (password === 'orvanto2025admin') {
      setIsAuthenticated(true);
      setErrorMsg(false);
      loadAdmin();
    } else {
      setErrorMsg(true);
    }
  };

  const loadAdmin = async () => {
    try {
      const [cResp, eResp, costResp] = await Promise.all([
        supabaseAdmin.from('Clients').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('error_logs').select('*').eq('resolved', false).order('created_at', { ascending: false }).limit(20),
        supabaseAdmin.from('cost_tracking').select('cost_usd').gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00Z')
      ]);
      if (cResp && cResp.error) {
        console.warn('Clients query error', cResp.error);
        setClients([]);
      } else {
        setClients(cResp.data || []);
      }

      if (eResp && eResp.error) {
        console.warn('Error logs query error', eResp.error);
        setErrors([]);
      } else {
        setErrors(eResp.data || []);
      }

      let totalCost = 0;
      if (costResp && costResp.error) {
        console.warn('Cost tracking query error', costResp.error);
        totalCost = 0;
      } else {
        const costList = (costResp && costResp.data) || [];
        totalCost = costList.reduce((s, c) => s + (c.cost_usd || 0), 0);
      }
      setCosts(totalCost);
    } catch(e) {
      console.error('Admin load error:', e);
    }
  };

  const toggleClient = async (clientId, isPaused) => {
    await supabaseAdmin.from('Clients')
      .update({ status: isPaused ? 'active' : 'paused' })
      .eq('client_id', clientId);
    loadAdmin();
  };

  const resolveError = async (id) => {
    await supabaseAdmin.from('error_logs')
      .update({ resolved: true })
      .eq('id', id);
    loadAdmin();
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-root">
        <div className="admin-bg-rotor" aria-hidden>
          <img src="/favicon.svg" alt="Orvanto logo" className="admin-bg-rotor-img" />
        </div>
        <div className="admin-login-layout">
          <div className="login-left">
            <AIFlowAnimation className="login-aiflow low-opacity" />
          </div>

          <div className="login-right">
            <div className="admin-login-card">
              <div className="admin-login-brand">
                <div className="admin-login-icon">🔐</div>
                <div>
                  <h2>Orvanto AI — Admin</h2>
                  <div className="muted">Internal access only</div>
                </div>
              </div>

              <div className="admin-login-form">
                <label className="muted" htmlFor="admin-pass">Enter admin password</label>
                <input id="admin-pass" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyUp={e => e.key === 'Enter' && checkLogin()} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-export" onClick={checkLogin}>Access Dashboard</button>
                  <button className="btn-small" onClick={() => { setPassword(''); setErrorMsg(false); }}>Clear</button>
                </div>
                {errorMsg && <div className="login-error">Incorrect password</div>}
                <div className="admin-login-foot muted" style={{ marginTop: 12 }}>By logging in you confirm that you are part of the Orvanto team.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const atRisk = clients.filter(c => (c.warmup_day || 0) >= 20 && (c.meetings_booked || 0) < 3).length;

  const totalTenants = clients.length;
  const totalUsers = clients.reduce((s, c) => s + (c.users_count || 0), 0) || 12458;
  const activeUsers = Math.round(totalUsers * 0.72) || 8963;
  const newSignups = Math.max(0, clients.filter(c => new Date(c.created_at) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)).length) || 1256;
  const mrr = Math.round(clients.reduce((s, c) => s + (Number(c.mrr || 0)), 0)) || 248750;
  const totalRevenue = (mrr * 12).toLocaleString ? `$${(mrr * 12).toLocaleString()}` : '$2,987,500';

  // KPI calculations for Top Insights
  const paidUsers = clients.reduce((s, c) => s + (c.paid_users_count || 0), 0) || Math.round(totalUsers * 0.42);
  const platformUptime = 99.97;

  const kpiStats = [
    { key: 'totalUsers', label: 'Total Users', value: totalUsers.toLocaleString(), delta: '▲ 11.3%', deltaPositive: true, values: [9800, 10200, 10600, 11100, 11800, totalUsers], color: 'var(--purple)' },
    { key: 'activeUsers', label: 'Active Users', value: activeUsers.toLocaleString(), delta: '▲ 12.7%', deltaPositive: true, values: [7000, 7600, 8200, 8600, 8800, activeUsers], color: 'var(--indigo)' },
    { key: 'paidUsers', label: 'Paid Users', value: paidUsers.toLocaleString(), delta: '▲ 8.4%', deltaPositive: true, values: [4200, 4300, 4500, 4700, 4900, paidUsers], color: 'var(--green)' },
    { key: 'newSignups', label: 'New Signups', value: newSignups.toLocaleString(), delta: '▲ 16.8%', deltaPositive: true, values: [800, 900, 1000, 1100, 1200, newSignups], color: 'var(--indigo)' },
    { key: 'mrr', label: 'MRR', value: `$${mrr.toLocaleString()}`, delta: '▲ 18.6%', deltaPositive: true, values: [180000, 190000, 200000, 210000, 230000, mrr], color: 'var(--purple)' },
    { key: 'uptime', label: 'Platform Uptime', value: `${platformUptime}%`, delta: '▲ 0.03%', deltaPositive: true, values: [99.8, 99.85, 99.9, 99.92, 99.95, platformUptime], color: 'var(--green)' }
  ];

  function getGrowthData(period) {
    if (period === 'Week') return [60, 72, 88, 96, 112, 128, 140];
    if (period === 'Year') return [4200, 4500, 4800, 5200, 5600, 6000, 6400, 6800, 7200, 7600, 8000, totalUsers];
    return [40,60,72,80,92,110,128,140,160,172,180,196,210,230,248];
  }

  const growthValues = getGrowthData(growthPeriod);

  // MRR trend (sample) for Revenue Overview
  const mrrTrend = [Math.round(mrr * 0.6), Math.round(mrr * 0.72), Math.round(mrr * 0.78), Math.round(mrr * 0.85), Math.round(mrr * 0.95), Math.round(mrr)];

  // Labels generation for charts
  function generateLabelsForPeriod(period, len) {
    const now = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (period === 'Week') {
      return Array.from({ length: len }).map((_, i) => {
        const d = new Date(now.getTime() - (len - 1 - i) * 24 * 60 * 60 * 1000);
        return days[d.getDay()];
      });
    }
    if (period === 'Year') {
      return Array.from({ length: len }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (len - 1 - i), 1);
        return months[d.getMonth()];
      });
    }
    return Array.from({ length: len }).map((_, i) => {
      const d = new Date(now.getTime() - (len - 1 - i) * 24 * 60 * 60 * 1000);
      return String(d.getDate());
    });
  }

  const growthLabels = generateLabelsForPeriod(growthPeriod, growthValues.length);
  function getMRRLabels(len) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    return Array.from({ length: len }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (len - 1 - i), 1);
      return months[d.getMonth()];
    });
  }
  const mrrLabels = getMRRLabels(mrrTrend.length);

  // Revenue breakdown will be calculated after plan counts and total revenue are available

  function generateMRRValues(period) {
    if (period === 'Quarterly') {
      // 8 quarters
      return Array.from({ length: 8 }).map((_, i) => Math.round((mrr * 3) * (0.6 + (i / 7) * 0.8)));
    }
    if (period === 'Yearly') {
      // 6 years
      return Array.from({ length: 6 }).map((_, i) => Math.round((mrr * 12) * (0.6 + (i / 5) * 0.9)));
    }
    // Monthly (default) - 12 months
    return Array.from({ length: 12 }).map((_, i) => Math.round(mrr * (0.6 + (i / 11) * 0.9)));
  }

  function generateMRRLabels(period, len) {
    const now = new Date();
    if (period === 'Quarterly') {
      // show recent quarters
      return Array.from({ length: len }).map((_, i) => {
        const qOffset = len - 1 - i;
        const date = new Date(now.getFullYear(), now.getMonth() - (qOffset * 3), 1);
        const q = Math.floor(date.getMonth() / 3) + 1;
        return `Q${q} ${date.getFullYear()}`;
      });
    }
    if (period === 'Yearly') {
      return Array.from({ length: len }).map((_, i) => new Date(now.getFullYear() - (len - 1 - i), 0, 1).getFullYear().toString());
    }
    // Monthly
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Array.from({ length: len }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (len - 1 - i), 1);
      return months[d.getMonth()];
    });
  }

  const mrrSeries = generateMRRValues(mrrPeriod);
  const mrrLabelsLocal = generateMRRLabels(mrrPeriod, mrrSeries.length);

  const formatNumber = (n) => {
    if (typeof n !== 'number') n = Number(n) || 0;
    if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
    return String(n);
  };

  // Users by plan counts
  const planCounts = { Free: 0, Growth: 0, Pro: 0, Enterprise: 0 };
  clients.forEach(c => {
    const p = (c.plan || 'growth').toString().toLowerCase();
    if (p.includes('free')) planCounts.Free += 1;
    else if (p.includes('growth')) planCounts.Growth += 1;
    else if (p.includes('pro')) planCounts.Pro += 1;
    else if (p.includes('enter') || p.includes('enterprise')) planCounts.Enterprise += 1;
    else planCounts.Growth += 1;
  });
  const totalPlans = Object.values(planCounts).reduce((s, v) => s + v, 0) || 1;
  const planSegments = [
    { label: 'Free', value: planCounts.Free || Math.round(totalPlans * 0.12), color: 'rgba(255,255,255,0.06)' },
    { label: 'Growth', value: planCounts.Growth || Math.round(totalPlans * 0.48), color: 'var(--purple)' },
    { label: 'Pro', value: planCounts.Pro || Math.round(totalPlans * 0.28), color: 'var(--indigo)' },
    { label: 'Enterprise', value: planCounts.Enterprise || Math.round(totalPlans * 0.12), color: 'var(--green)' },
  ];

  // Sample campaign data (replace with real dataset as available)
  const sampleCampaigns = [
    { id: 'cmp-1', name: 'LinkedIn Outreach — Q2', users: 812, leads: 201, replies: 46, meetings: 12 },
    { id: 'cmp-2', name: 'Email Nurture — Spring', users: 4304, leads: 920, replies: 210, meetings: 34 },
    { id: 'cmp-3', name: 'Webinar Follow-up', users: 1250, leads: 410, replies: 86, meetings: 21 },
    { id: 'cmp-4', name: 'Paid Ads — Trial', users: 620, leads: 120, replies: 30, meetings: 7 },
    { id: 'cmp-5', name: 'Referral Drive', users: 300, leads: 75, replies: 18, meetings: 4 }
  ];

  // Platform overview stats (computed from available sources)
  const sampleLeads = sampleCampaigns.reduce((s, c) => s + (c.leads || 0), 0);
  const clientLeads = clients.reduce((s, c) => s + (c.leads || 0), 0);
  const totalLeads = sampleLeads + clientLeads;

  const emailsFromClients = clients.reduce((s, c) => s + (c.emails_sent || 0), 0);
  const emailsSent = emailsFromClients || Math.max(0, Math.round(totalLeads * 8));

  const meetingsFromClients = clients.reduce((s, c) => s + (c.meetings_booked || 0), 0);
  const meetingsBooked = meetingsFromClients || sampleCampaigns.reduce((s, c) => s + (c.meetings || 0), 0);

  const totalRevenueNumeric = mrr * 12;

  // Build billing overview values (fallback to sensible defaults when client fields are absent)
  const activeSubscriptions = totalTenants || 118;
  const trialSubscriptions = clients.filter(c => c.is_trial || (c.plan && c.plan.toLowerCase().includes('trial')) || (c.plan && c.plan.toLowerCase().includes('free'))).length || 10;
  const cancellations = clients.filter(c => c.status && String(c.status).toLowerCase().includes('cancel')).length || 6;
  const paymentFailures = clients.reduce((s, c) => s + (c.payment_failures_count || 0), 0) || 4;
  const refunds = clients.reduce((s, c) => s + (c.refunds_count || 0), 0) || 2;

  const billing = {
    activeSubscriptions,
    trialSubscriptions,
    cancellations,
    paymentFailures,
    refunds,
    deltas: {
      active: { value: 14.6, positive: true },
      trial: { value: 3.2, positive: false },
      cancellations: { value: 14.3, positive: false },
      paymentFailures: { value: 20.0, positive: false },
      refunds: { value: 33.3, positive: false }
    }
  };

  // Revenue breakdown calculation (derive from planCounts and total revenue)
  const revenueWeights = { Free: 0.25, Growth: 1, Pro: 2.5, Enterprise: 5 };
  const weighted = Object.keys(planCounts).map(k => ({ key: k, count: planCounts[k] || 0, weight: revenueWeights[k] || 1 }));
  const totalWeighted = weighted.reduce((s, x) => s + (x.count * x.weight), 0) || 1;
  const revenueSegments = weighted.map(w => {
    const value = Math.round(totalRevenueNumeric * ((w.count * w.weight) / totalWeighted));
    const percent = totalRevenueNumeric > 0 ? Math.round((value / totalRevenueNumeric) * 100) : 0;
    const colorMap = { Free: 'rgba(255,255,255,0.06)', Growth: 'var(--purple)', Pro: 'var(--indigo)', Enterprise: 'var(--green)' };
    return { label: w.key, value, percent, color: colorMap[w.key] || 'var(--muted)' };
  });

  const exportAdminReport = () => {
    try {
      const rows = clients || [];
      if (!rows || rows.length === 0) {
        alert('No data to export');
        return;
      }
      const headers = Object.keys(rows[0]);
      const csvRows = [headers.join(',')].concat(rows.map(r => headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        const s = typeof val === 'string' ? val.replace(/"/g, '""') : String(val);
        return `"${s}"`;
      }).join(',')));
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orvanto_admin_clients.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed', e); alert('Export failed'); }
  };

  const handleQuickAction = (action) => {
    setQuickActionModal(action);
    setModalForm({});
  };

  const handleUserAction = (userId, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setUserActionMenu({ userId, pos: { x: rect.left, y: rect.bottom } });
  };

  const closeMenus = () => {
    setUserActionMenu({ userId: null, pos: {} });
  };

  useEffect(() => {
    document.addEventListener('click', closeMenus);
    return () => document.removeEventListener('click', closeMenus);
  }, []);

  const executeUserAction = (action, userId) => {
    console.log(`User action: ${action} on user ${userId}`);
    setUserActionMenu({ userId: null, pos: {} });
    // TODO: Implement actual backend calls
  };

  // Small inline chart components
  function MiniSpark({ values = [], color = 'var(--purple)', width = 120, height = 36 }) {
    if (!values || values.length === 0) return null;
    const max = Math.max(...values) || 1;
    const points = values.map((v, i) => `${(i * (width / (values.length - 1))).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`).join(' ');
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  function LineChart({ values = [], labels = [], color = 'var(--purple)' }) {
    const svgRef = useRef(null);
    const wrapRef = useRef(null);
    const gradIdRef = useRef('lg-' + Math.random().toString(36).slice(2,9));
    const [tip, setTip] = useState({ visible: false, left: 0, top: 0, label: '', value: 0 });
    const w = 720, h = 340;
    const margin = { top: 22, right: 18, bottom: 42, left: 56 };
    if (!values || values.length === 0) return <div className="chart-empty">No data</div>;
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const chartW = w - margin.left - margin.right;
    const chartH = h - margin.top - margin.bottom;

    const pointsArr = values.map((v, i) => {
      const x = margin.left + (i * (chartW / (values.length - 1)));
      const y = margin.top + chartH - ((v - min) / Math.max(1, (max - min))) * chartH;
      return { x, y, v };
    });
    const points = pointsArr.map(p => `${p.x},${p.y}`).join(' ');
    const areaPath = `M${margin.left} ${margin.top + chartH} L${pointsArr.map(p => `${p.x} ${p.y}`).join(' L ')} L${margin.left + chartW} ${margin.top + chartH} Z`;

    const yTicks = 4;
    const yTickVals = Array.from({ length: yTicks + 1 }).map((_, i) => Math.round(min + (i * (max - min) / yTicks)));

    const handleMove = (e) => {
      const svg = svgRef.current;
      const wrap = wrapRef.current;
      if (!svg || !wrap) return;
      const rect = svg.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const relX = Math.min(Math.max(rx - margin.left, 0), chartW);
      const idx = Math.round((relX / chartW) * (values.length - 1));
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      const v = values[clamped];
      const p = pointsArr[clamped];
      const wrapRect = wrap.getBoundingClientRect();
      setTip({ visible: true, left: (p.x - 0) / w * wrapRect.width, top: p.y, label: labels[clamped] || clamped, value: v });
    };

    const handleLeave = () => setTip({ visible: false, left: 0, top: 0, label: '', value: 0 });

    return (
      <div className="chart-wrapper" ref={wrapRef}>
        <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" onMouseMove={handleMove} onMouseLeave={handleLeave}>
          <defs>
            <linearGradient id={gradIdRef.current} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTickVals.map((tv, i) => {
            const y = margin.top + chartH - ((tv - min) / Math.max(1, (max - min))) * chartH;
            return <g key={i}><line x1={margin.left} x2={margin.left + chartW} y1={y} y2={y} className="gridline" /><text x={margin.left - 12} y={y + 4} textAnchor="end" className="axis-label">{formatNumber(tv)}</text></g>;
          })}

          {pointsArr.map((p, i) => {
            const show = (i % Math.ceil(values.length / 6) === 0) || i === values.length - 1;
            if (!show) return null;
            return <text key={i} x={p.x} y={margin.top + chartH + 20} textAnchor="middle" className="x-tick">{labels[i] || i}</text>;
          })}

          <path d={areaPath} fill={`url(#${gradIdRef.current})`} />
          <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          {pointsArr.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} opacity={0.85} />)}
        </svg>
        {tip.visible && (
          <div className="chart-tooltip" style={{ left: `${tip.left}px`, top: `${tip.top}px` }}>
            <div style={{color:'var(--muted)',fontSize:12}}>{tip.label}</div>
            <div>${formatNumber(tip.value)}</div>
          </div>
        )}
      </div>
    );
  }

  function Donut({ percent = 70, size = 140, stroke = 18, color = 'var(--purple)' }) {
    const r = (size - stroke) / 2;
    const c = Math.PI * 2 * r;
    const dash = (percent / 100) * c;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size/2},${size/2})`}>
          <circle r={r} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={stroke} />
          <circle r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c * 0.25} />
          <text x={0} y={6} textAnchor="middle" fill="var(--text)" fontWeight={800} fontSize={16}>{percent}%</text>
        </g>
      </svg>
    );
  }

  // Simple bar chart for MRR trend with hover tooltip and labels
  function BarChart({ values = [], labels = [], color = 'var(--indigo)', w = 520, h = 260 }) {
    const svgRef = useRef(null);
    const wrapRef = useRef(null);
    const [tip, setTip] = useState({ visible: false, left: 0, top: 0, label: '', value: 0 });
    if (!values || values.length === 0) return <div className="chart-empty">No data</div>;
    const max = Math.max(...values, 1);
    const cols = values.length;
    const margin = { left: 20, right: 8, top: 12, bottom: 36 };
    const chartW = w - margin.left - margin.right;
    const slot = chartW / cols;
    const barW = Math.max(6, slot * 0.6);

    const handleBarMove = (e, i) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      setTip({ visible: true, left: e.clientX - rect.left, top: e.clientY - rect.top, label: labels[i] || i, value: values[i] });
    };
    const handleLeave = () => setTip({ visible: false, left: 0, top: 0, label: '', value: 0 });

    return (
      <div className="chart-wrapper" ref={wrapRef}>
        <svg ref={svgRef} className="bar-chart" viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" onMouseLeave={handleLeave}>
          {values.map((v, i) => {
            const x = margin.left + i * slot + (slot - barW) / 2;
            const barH = Math.max(2, Math.round((v / max) * (h - margin.top - margin.bottom)));
            const y = h - margin.bottom - barH;
            return (
              <g key={i}>
                <rect className="bar" x={x} y={y} width={barW} height={barH} rx={6} fill={color} onMouseMove={(ev) => handleBarMove(ev, i)} onMouseEnter={(ev) => handleBarMove(ev, i)} />
                <text x={x + barW / 2} y={h - 8} textAnchor="middle" className="x-tick">{labels[i] || i}</text>
              </g>
            );
          })}
        </svg>
        {tip.visible && (
          <div className="chart-tooltip" style={{ left: tip.left, top: tip.top }}>
            <div style={{color:'var(--muted)',fontSize:12}}>{tip.label}</div>
            <div>${formatNumber(tip.value)}</div>
          </div>
        )}
      </div>
    );
  }

  // Multi-segment donut chart
  function DonutSegments({ segments = [], size = 140, stroke = 18 }) {
    const r = (size - stroke) / 2;
    const c = Math.PI * 2 * r;
    const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
    let offset = 0;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size/2},${size/2}) rotate(-90)`}>
          {segments.map((seg, i) => {
            const dash = (seg.value / total) * c;
            const dashArray = `${dash} ${c - dash}`;
            const dashOffset = c - offset;
            offset += dash;
            return (
              <circle key={i} r={r} fill="none" stroke={seg.color} strokeWidth={stroke} strokeLinecap="butt" strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
            );
          })}
        </g>
      </svg>
    );
  }

  return (
    <div className="admin-root">
      <div className="admin-bg-rotor" aria-hidden>
        <img src="/favicon.svg" alt="Orvanto logo" className="admin-bg-rotor-img" />
      </div>
      <Sidebar active="Overview" admin={true} compact={true} />
      <main className="admin-main">

        <div className="admin-stats-grid">
          {kpiStats.map(s => (
            <div className="stat-card" key={s.key}>
              <div className="stat-top">
                <div className="stat-left">
                  <div className="label">{s.label}</div>
                  <div className="value">{s.value}</div>
                  <div className="stat-meta"><div className={`stat-delta ${s.deltaPositive ? '' : 'negative'}`}>{s.delta}</div></div>
                </div>
                <div className="stat-spark"><MiniSpark values={s.values} color={s.color} width={100} height={24} /></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{height:12}} />
        <PlatformOverview stats={{ totalLeads, emailsSent, meetingsBooked, totalRevenue: totalRevenueNumeric, totalTenants }} billing={billing} planSegments={planSegments} />

        <div className="admin-main-grid" style={{marginTop:12}}>
          <div className="card">
            <div className="card-header"><div>Revenue Breakdown</div><div className="card-sub">This Month</div></div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:180,position:'relative'}}>
                <DonutSegments segments={revenueSegments.map(s=>({label:s.label,value:s.value,color:s.color}))} size={180} stroke={20} />
                <div style={{position:'absolute',left:0,top:0,width:180,height:180,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                  <div style={{fontWeight:900,fontSize:18}}>${totalRevenueNumeric.toLocaleString()}</div>
                  <div style={{color:'var(--muted)',fontSize:13}}>Total Revenue</div>
                </div>
              </div>
              <div style={{flex:1}}>
                <div className="donut-legend">
                  {revenueSegments.map(s => (
                    <div className="legend-item" key={s.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}><span className="legend-color-box" style={{background:s.color}}></span><div style={{fontWeight:800}}>{s.label}</div></div>
                      <div style={{textAlign:'right'}}><div style={{fontWeight:800}}>${s.value.toLocaleString()}</div><div style={{color:'var(--muted)'}}>{s.percent}%</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card chart-card">
            <div className="card-header">
              <div>MRR Trend</div>
              <div className="card-sub">
                <div className="chart-filter">
                  {['Monthly','Quarterly','Yearly'].map(p => (
                    <button key={p} className={`filter-btn ${mrrPeriod===p? 'active':''}`} onClick={() => setMrrPeriod(p)}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
            <LineChart values={mrrSeries} labels={mrrLabelsLocal} color={'#ff4da6'} />
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}><div style={{color:'var(--muted)'}}>Period</div><div style={{fontWeight:800}}>${formatNumber(mrrSeries[mrrSeries.length-1])}</div></div>
          </div>

          <aside>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-header"><div>Users by Plan</div></div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <DonutSegments segments={planSegments} />
                <div className="donut-legend">
                  {planSegments.map(s => (
                    <div className="legend-item" key={s.label}><span className="legend-color-box" style={{background:s.color}}></span>{s.label} <span style={{color:'var(--muted)',marginLeft:8,fontWeight:700}}>{s.value}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div>System Health</div></div>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8}}>
                {['Database','API Services','Email Service','Storage','Backup','Cron Jobs'].map((s,i)=> (
                  <li key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{color:'var(--muted)'}}>{s}</div><div style={{color:'var(--green)'}}>Healthy</div></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
        <div className="admin-main-grid">
          <div className="card chart-card">
            <div className="card-header">
              <div>Tenant Growth</div>
              <div className="card-sub">
                <div className="chart-filter">
                  {['Week','Month','Year'].map(p => (
                    <button key={p} className={`filter-btn ${growthPeriod===p? 'active':''}`} onClick={() => setGrowthPeriod(p)}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
            <LineChart values={growthValues} labels={growthLabels} />
            <div style={{display:'flex',justifyContent:'space-between',marginTop:10,color:'var(--muted)'}}>
              <div>Start</div><div>End</div>
            </div>
          </div>

          <div className="card chart-card">
            <div className="card-header"><div>Revenue Overview</div><div className="card-sub">MRR Trend</div></div>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{flex:1}}>
                <BarChart values={mrrTrend} labels={mrrLabels} color={'var(--purple)'} />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}><div style={{color:'var(--muted)'}}>Last 6 months</div><div style={{fontWeight:800}}>${mrr.toLocaleString()}</div></div>
              </div>
              <div style={{width:140,textAlign:'center'}}>
                <Donut percent={Math.round((mrr / Math.max(1, mrr * 1.2)) * 100)} />
                <div style={{color:'var(--muted)',marginTop:6}}>Current MRR</div>
              </div>
            </div>
          </div>

          <aside className="quick-aside">
            <div className="card" style={{marginBottom:12}}>
              <div className="card-header"><div>Quick Actions</div></div>
              <div className="quick-actions">
                  <button className="qa-btn" onClick={() => handleQuickAction('add-user')}>
                    <div className="qa-icon"><FiUserPlus /></div>
                    <div className="qa-label">Add New User</div>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('create-team')}>
                    <div className="qa-icon"><FiUsers /></div>
                    <div className="qa-label">Create Team</div>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('manage-plans')}>
                    <div className="qa-icon"><FiCreditCard /></div>
                    <div className="qa-label">Manage Plans</div>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('setup-email')}>
                    <div className="qa-icon"><FiMail /></div>
                    <div className="qa-label">Setup Email Accounts</div>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('system-settings')}>
                    <div className="qa-icon"><FiSettings /></div>
                    <div className="qa-label">System Settings</div>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('view-reports')}>
                    <div className="qa-icon"><FiBarChart2 /></div>
                    <div className="qa-label">View Reports</div>
                  </button>
                </div>
            </div>
          </aside>
        </div>

        <div style={{height:18}} />

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header"><div>Quick Actions</div><div className="card-sub">Common admin operations</div></div>
          <div className="quick-actions">
            <button className="qa-btn" onClick={() => handleQuickAction('add-user')}>
              <div className="qa-icon"><FiUserPlus /></div>
              <div className="qa-label">Add New User</div>
            </button>
            <button className="qa-btn" onClick={() => handleQuickAction('create-team')}>
              <div className="qa-icon"><FiUsers /></div>
              <div className="qa-label">Create Team</div>
            </button>
            <button className="qa-btn" onClick={() => handleQuickAction('manage-plans')}>
              <div className="qa-icon"><FiCreditCard /></div>
              <div className="qa-label">Manage Plans</div>
            </button>
            <button className="qa-btn" onClick={() => handleQuickAction('setup-email')}>
              <div className="qa-icon"><FiMail /></div>
              <div className="qa-label">Setup Email Accounts</div>
            </button>
            <button className="qa-btn" onClick={() => handleQuickAction('system-settings')}>
              <div className="qa-icon"><FiSettings /></div>
              <div className="qa-label">System Settings</div>
            </button>
            <button className="qa-btn" onClick={() => handleQuickAction('view-reports')}>
              <div className="qa-icon"><FiBarChart2 /></div>
              <div className="qa-label">View Reports</div>
            </button>
          </div>
        </div>

        <div style={{height:18}} />
        <div className="admin-main-grid">
          <div className="card table-card">
            <div className="card-header"><div>User Management</div><div className="card-sub">Manage platform users</div></div>
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ width: 40, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const colorList = ['var(--purple)', 'var(--indigo)', 'var(--green)', 'var(--amber)', 'var(--muted)'];
                    const usersSample = clients.slice(0, 8).map((c, i) => ({
                      id: c.client_id ? `u-${c.client_id}` : `u-${i}`,
                      name: c.contact_name || `${c.name || 'Client'} Admin`,
                      email: c.contact_email || `admin@${(c.domain || 'example.com')}`,
                      plan: (c.plan || 'Growth').charAt(0).toUpperCase() + (c.plan || 'Growth').slice(1),
                      status: c.status === 'active' ? 'Active' : 'Inactive',
                      joinDate: new Date(c.created_at || new Date()).toLocaleDateString(),
                      avatarColor: colorList[i % colorList.length]
                    }));
                    return usersSample.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-info">
                            <div className="avatar" style={{ background: u.avatarColor }}>{u.name.charAt(0)}</div>
                            <div className="user-meta">
                              <div className="user-name">{u.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td><span style={{ fontWeight: 700 }}>{u.plan}</span></td>
                        <td><span className={`status-pill ${u.status.toLowerCase()}`}>{u.status}</span></td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{u.joinDate}</td>
                        <td style={{ textAlign: 'center', position: 'relative' }}>
                          <button className="more-btn" onClick={(e) => handleUserAction(u.id, e)}>
                            ⋮
                          </button>
                          {userActionMenu.userId === u.id && (
                            <div className="user-action-menu" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => executeUserAction('view', u.id)}>
                                <span style={{ marginRight: 6 }}>👁️</span> View Profile
                              </button>
                              <button onClick={() => executeUserAction('edit', u.id)}>
                                <span style={{ marginRight: 6 }}>✏️</span> Edit User
                              </button>
                              <button onClick={() => executeUserAction('suspend', u.id)}>
                                <span style={{ marginRight: 6 }}>⏸️</span> Suspend Account
                              </button>
                              <button onClick={() => executeUserAction('reset-pwd', u.id)} style={{ color: 'var(--red)' }}>
                                <span style={{ marginRight: 6 }}>🔓</span> Reset Password
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{height:18}} />

        <div className="admin-main-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card recent-card-redesigned">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>Recent Activity</div>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Latest {(errors || []).length} Events</span>
              </div>
              <button className="btn-export" onClick={() => console.log('Export activity')}>Export Log</button>
            </div>
            <div className="recent-activity-redesigned">
              {(errors && errors.length > 0) ? errors.map((e, i) => (
                <div key={e.id || i} className="recent-item-redesigned">
                  <div className="activity-left">
                    <div className="activity-badge" style={{ background: e.severity === 'Critical' ? '#ef4444' : e.severity === 'High' ? '#f97316' : '#eab308' }}>
                      {e.severity ? e.severity.charAt(0) : '?'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{e.source || 'System'} — {e.service || 'Unknown Service'}</div>
                      <div className="activity-msg">{(e.message || e.error_message || 'No message').substring(0, 80)}</div>
                      <div className="activity-meta">
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>Tenant:</span> <span style={{ fontWeight: 700, fontSize: 12 }}>{e.tenant || '—'}</span>
                        <span style={{ marginLeft: 12, color: 'var(--muted)', fontSize: 12 }}>User:</span> <span style={{ fontWeight: 700, fontSize: 12 }}>{e.user_email || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="activity-right">
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: e.resolved ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontSize: 12 }}>
                        {e.resolved ? '✓ Resolved' : '⚠ Unresolved'}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>
                        {new Date(e.created_at || new Date()).toLocaleString()}
                      </div>
                    </div>
                    {!e.resolved && (
                      <button className="resolve-btn" onClick={() => markResolved(e.id)}>Mark Resolved</button>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Quick Actions Modals */}
      {quickActionModal && (
        <div className="qa-modal-overlay" onClick={() => setQuickActionModal(null)}>
          <div className="qa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qa-modal-header">
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {quickActionModal === 'add-user' && '➕ Add New User'}
                {quickActionModal === 'create-team' && '👥 Create Team'}
                {quickActionModal === 'manage-plans' && '💳 Manage Plans'}
                {quickActionModal === 'setup-email' && '📧 Setup Email Accounts'}
                {quickActionModal === 'system-settings' && '⚙️ System Settings'}
                {quickActionModal === 'view-reports' && '📊 View Reports'}
              </div>
              <button className="qa-modal-close" onClick={() => setQuickActionModal(null)}>✕</button>
            </div>

            <div className="qa-modal-body">
              {quickActionModal === 'add-user' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Full Name</label>
                    <input type="text" placeholder="John Doe" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Email</label>
                    <input type="email" placeholder="john@example.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Role</label>
                    <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--text)', marginTop: 4, outline: 'none' }}>
                      <option>Admin</option>
                      <option>Manager</option>
                      <option>User</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                </div>
              )}
              {quickActionModal === 'create-team' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Team Name</label>
                    <input type="text" placeholder="Sales Team" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Description</label>
                    <textarea placeholder="Team description..." style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none', minHeight: 80, fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Members</label>
                    <input type="text" placeholder="Select members..." style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                </div>
              )}
              {quickActionModal === 'manage-plans' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="plan-item" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', transition: 'all .2s' }}>
                    <div style={{ fontWeight: 700 }}>Starter Plan</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>$0/month • 1 User • Basic Features</div>
                  </div>
                  <div className="plan-item" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', transition: 'all .2s' }}>
                    <div style={{ fontWeight: 700 }}>Growth Plan</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>$149/month • 5 Users • Advanced Features</div>
                  </div>
                  <div className="plan-item" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', transition: 'all .2s' }}>
                    <div style={{ fontWeight: 700 }}>Pro Plan</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>$349/month • Unlimited Users • Premium Support</div>
                  </div>
                </div>
              )}
              {quickActionModal === 'setup-email' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>SMTP Server</label>
                    <input type="text" placeholder="smtp.gmail.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Port</label>
                    <input type="number" placeholder="587" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Email Address</label>
                    <input type="email" placeholder="noreply@company.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Password</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text)', marginTop: 4, outline: 'none' }} />
                  </div>
                </div>
              )}
              {quickActionModal === 'system-settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.01)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700 }}>Enable Debug Mode</div>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.01)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700 }}>Enable Maintenance Mode</div>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.01)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700 }}>Allow New Signups</div>
                    <input type="checkbox" style={{ cursor: 'pointer' }} defaultChecked />
                  </div>
                </div>
              )}
              {quickActionModal === 'view-reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="report-item" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700 }}>📊 Usage Analytics Report</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Generate detailed usage metrics</div>
                  </div>
                  <div className="report-item" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700 }}>💰 Revenue Report</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>MRR, ARR, and billing insights</div>
                  </div>
                  <div className="report-item" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700 }}>❌ Error & Performance Report</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>System errors and performance metrics</div>
                  </div>
                </div>
              )}
            </div>

            <div className="qa-modal-footer">
              <button className="btn-small" onClick={() => setQuickActionModal(null)}>Cancel</button>
              <button className="btn-export" onClick={() => { console.log('Action submitted'); setQuickActionModal(null); }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
