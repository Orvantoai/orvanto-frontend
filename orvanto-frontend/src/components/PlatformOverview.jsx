import React from 'react';
import { FiUserPlus, FiMail, FiCalendar, FiDollarSign, FiUsers, FiXCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

function fmtNum(n) { if (n === null || n === undefined) return '—'; try { return Number(n).toLocaleString(); } catch { return String(n); } }
function fmtMoney(n) { if (n === null || n === undefined) return '—'; try { return `$${Number(n).toLocaleString()}`; } catch { return String(n); } }

function DonutSegments({ segments = [], size = 140, stroke = 18 }) {
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
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

export default function PlatformOverview({ stats = {}, billing = {}, planSegments = [] }) {
  const { totalLeads, emailsSent, meetingsBooked, totalRevenue } = stats;

  const items = [
    { key: 'leads', label: 'Total Leads', value: totalLeads, icon: <FiUserPlus /> , color: 'var(--purple)' },
    { key: 'emails', label: 'Emails Sent', value: emailsSent, icon: <FiMail /> , color: 'var(--indigo)' },
    { key: 'meetings', label: 'Meetings Booked', value: meetingsBooked, icon: <FiCalendar /> , color: 'var(--green)' },
    { key: 'revenue', label: 'Total Revenue', value: totalRevenue, icon: <FiDollarSign /> , color: 'var(--amber)' }
  ];

  const totalPlans = (planSegments || []).reduce((s, p) => s + (p.value || 0), 0) || 0;

  const b = {
    activeSubscriptions: billing.activeSubscriptions ?? billing.active ?? 0,
    trialSubscriptions: billing.trialSubscriptions ?? billing.trial ?? 0,
    cancellations: billing.cancellations ?? billing.cancelled ?? 0,
    paymentFailures: billing.paymentFailures ?? billing.payment_failures ?? 0,
    refunds: billing.refunds ?? 0,
    deltas: billing.deltas || {
      active: { value: 14.6, positive: true },
      trial: { value: 3.2, positive: false },
      cancellations: { value: 14.3, positive: false },
      paymentFailures: { value: 20.0, positive: false },
      refunds: { value: 33.3, positive: false }
    }
  };

  const billingItems = [
    { key: 'active', label: 'Active Subscriptions', value: b.activeSubscriptions, delta: b.deltas.active, icon: <FiUsers /> },
    { key: 'trial', label: 'Trial Subscriptions', value: b.trialSubscriptions, delta: b.deltas.trial, icon: <FiUserPlus /> },
    { key: 'cancellations', label: 'Cancelled (This Month)', value: b.cancellations, delta: b.deltas.cancellations, icon: <FiXCircle /> },
    { key: 'paymentFailures', label: 'Payment Failures', value: b.paymentFailures, delta: b.deltas.paymentFailures, icon: <FiAlertTriangle /> },
    { key: 'refunds', label: 'Refunds (This Month)', value: b.refunds, delta: b.deltas.refunds, icon: <FiRefreshCw /> }
  ];

  return (
    <div className="platform-overview card" style={{marginBottom:12}}>
      <div className="platform-overview-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div style={{fontWeight:800}}>Platform Overview</div>
        <div style={{color:'var(--muted)'}}>Live metrics across campaigns</div>
      </div>

      <div className="platform-overview-grid">
        {items.map(it => (
          <div className="overview-card" key={it.key}>
            <div className="overview-top" style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="overview-icon" style={{background: it.color}}>{it.icon}</div>
              <div style={{display:'flex',flexDirection:'column'}}>
                <div className="overview-label" style={{color:'var(--muted)',fontWeight:800}}>{it.label}</div>
                <div className="overview-value" style={{fontSize:'1.25rem',fontWeight:900}}>{it.key==='revenue' ? fmtMoney(it.value) : fmtNum(it.value)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{height:12}} />

      <div className="billing-plan-grid" style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:12,alignItems:'start'}}>
        <div className="card" style={{padding:12}}>
          <div className="card-header"><div>Subscription & Billing Overview</div><div className="card-sub">This Month</div></div>
          <div className="billing-grid" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginTop:6}}>
            {billingItems.map(bi => (
              <div key={bi.key} className="billing-item" style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:6}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="overview-icon" style={{width:36,height:36}}>{bi.icon}</div>
                  <div style={{fontSize:12,fontWeight:800,color:'var(--muted)'}}>{bi.label}</div>
                </div>
                <div style={{fontWeight:900,fontSize:'1.05rem'}}>{fmtNum(bi.value)}</div>
                <div className={`stat-delta ${bi.delta && !bi.delta.positive ? 'negative' : ''}`} style={{fontSize:12,padding:'4px 8px'}}>{(bi.delta && bi.delta.positive) ? `▲ ${bi.delta.value}%` : `▼ ${bi.delta.value}%`}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{padding:12}}>
          <div className="card-header"><div>Plan Distribution</div><div className="card-sub">{totalPlans} Total</div></div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:160,height:160}}>
              <DonutSegments segments={planSegments} size={160} stroke={20} />
            </div>
            <div className="donut-legend">
              {(planSegments || []).map(s => {
                const pct = totalPlans ? Math.round(((s.value || 0) / totalPlans) * 100) : 0;
                return (
                  <div key={s.label} className="legend-item"><span className="legend-color-box" style={{background:s.color}}></span>{s.label} <span style={{color:'var(--muted)',marginLeft:8,fontWeight:700}}>{s.value} <span style={{fontWeight:400,marginLeft:6}}>{pct}%</span></span></div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
