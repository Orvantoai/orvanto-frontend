import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import './Warmup.css';
import { FiGlobe, FiMail, FiClock, FiDownload } from 'react-icons/fi';

function MiniSpark({ values = [], color = 'var(--indigo)', width = 80, height = 28 }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values) || 1;
  const points = values.map((v, i) => `${(i * (width / (values.length - 1))).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mini-spark">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ProgressBar({ pct = 0 }) {
  return (
    <div className="progress-outer">
      <div className="progress-inner" style={{ width: `${pct}%` }} />
    </div>
  );
}

function WarmupTimeline({ series = [], highlightIndex = 9 }) {
  const w = 980, h = 320;
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  if (!series || series.length === 0) return <div className="chart-empty">No data</div>;
  const len = series[0].values.length;
  const left = 68, right = 24, top = 36, bottom = 84;
  const cw = w - left - right, ch = h - top - bottom;
  const max = Math.max(...series.flatMap(s => s.values), 500);

  const xFor = i => Math.round(left + (i * (cw / (len - 1))));
  const yFor = v => Math.round(top + (ch - (v / max) * ch));

  const seriesPaths = series.map(s => {
    const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
    return { ...s, d };
  });

  const recommended = new Array(len).fill(0).map((_, i) => Math.round(60 + i * (420 / (len - 1))));
  const recD = recommended.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');

  const startDate = new Date(2025, 4, 5); // May 5, 2025
  const xLabels = new Array(len).fill(0).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dayLabel = `Day ${i + 1}`;
    const month = d.toLocaleString('en-US', { month: 'short' });
    const date = `${month} ${d.getDate()}`;
    return { dayLabel, date, x: xFor(i) };
  });

  const hoveredIndex = hoverIdx ?? Math.max(0, Math.min(highlightIndex, len - 1));
  const highlightX = xFor(hoveredIndex);

  const handleMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(rel * (len - 1));
    const clamped = Math.max(0, Math.min(idx, len - 1));
    setHoverIdx(clamped);
  };

  const handleLeave = () => setHoverIdx(null);

  return (
    <div className="timeline-container">
      <div className="timeline-top">
        <div className="timeline-legend">
          {series.map((s, i) => (
            <div key={i} className="legend-item"><span className="dot" style={{ background: s.color }}></span>{s.name}</div>
          ))}
          <div className="legend-item"><span className="dash-legend">—</span>Recommended Range</div>
        </div>
        <div className="chart-dropdown">Emails Sent ▾</div>
      </div>

      <svg ref={svgRef} onMouseMove={handleMove} onMouseLeave={handleLeave} viewBox={`0 0 ${w} ${h}`} className="warmup-svg" preserveAspectRatio="none">
        {/* y grid + labels */}
        {[0,100,200,300,400,500].map((t, i) => {
          const y = yFor(t);
          return (
            <g key={i}>
              <line x1={left} x2={w - right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <text x={left - 12} y={y + 4} textAnchor="end" fill="var(--muted)" fontSize={12}>{t}</text>
            </g>
          );
        })}

        {/* recommended dashed guideline */}
        <path d={recD} fill="none" stroke="rgba(255,255,255,0.12)" strokeDasharray="6 6" strokeWidth={2} />

        {/* series paths */}
        {seriesPaths.map((s, idx) => (
          <g key={idx}>
            <path d={s.d} fill="none" stroke={s.color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) => (
              <circle key={i} cx={xFor(i)} cy={yFor(v)} r={i === hoveredIndex ? 6 : 3} fill={i === hoveredIndex ? 'var(--card)' : s.color} stroke={i === hoveredIndex ? s.color : 'transparent'} strokeWidth={i === hoveredIndex ? 2 : 0} />
            ))}
          </g>
        ))}

        {/* x-axis labels */}
        {xLabels.map((lab, i) => (
          <g key={i} transform={`translate(${lab.x}, ${h - bottom + 6})`}>
            <text x={0} y={0} textAnchor="middle" fill="var(--muted)" fontSize={12}>{lab.dayLabel}</text>
            <text x={0} y={18} textAnchor="middle" fill="var(--muted)" fontSize={12}>{lab.date}</text>
          </g>
        ))}

        {/* highlight day pill */}
        <g className="day-highlight" transform={`translate(${highlightX - 36}, ${h - bottom + 2})`}>
          <rect x={0} y={-6} width={72} height={28} rx={8} fill="transparent" stroke="var(--purple)" strokeWidth={2} />
          <text x={36} y={12} textAnchor="middle" fill="var(--purple)" fontWeight={700} fontSize={12}>Day {hoveredIndex + 1}</text>
          <text x={36} y={26} textAnchor="middle" fill="var(--muted)" fontSize={11}>May {5 + hoveredIndex}</text>
        </g>

        {/* tooltip box for highlighted day */}
        {hoveredIndex != null && (
          <g className="chart-tooltip" transform={`translate(${Math.min(highlightX + 40, w - 260)}, ${top + 18})`}>
            <rect x={0} y={0} width={220} height={120} rx={8} fill="var(--card)" stroke="var(--border)" />
            <text x={12} y={18} fill="var(--text)" fontWeight={800}>Day {hoveredIndex + 1} (Today)</text>
            {series.map((s, i) => (
              <g key={i} transform={`translate(12, ${36 + i * 20})`}>
                <rect x={0} y={-10} width={8} height={8} rx={2} fill={s.color} />
                <text x={16} y={0} fill="var(--text)">{s.name}</text>
                <text x={180} y={0} fill="var(--text)" textAnchor="end">{s.values[hoveredIndex]}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export default function Warmup() {
  const [range] = useState('May 5 - May 18, 2025');

  const kpis = [
    { title: 'Domains Active', value: '3 / 3', sub: 'All domains are active', spark: [1, 1, 1, 1] },
    { title: 'Overall Health Score', value: '92 / 100', sub: 'Excellent', spark: [80, 85, 90, 92] },
    { title: 'Emails Sent Today', value: '248', sub: '▲ 18.6% vs yesterday', spark: [120, 160, 200, 248] },
    { title: 'Positive Replies', value: '32', sub: '▲ 25.0% vs yesterday', spark: [4, 8, 16, 32] },
    { title: 'Spam Complaints', value: '0', sub: 'Great! No complaints', spark: [0, 0, 0, 0] }
  ];

  const domains = [
    { domain: 'acmecorp.com', role: 'Primary Domain', day: 'Day 10 of 14', progress: 72, sent: '248', total: '345', health: 95, status: 'Excellent', next: 'Increase to 270 Tomorrow' },
    { domain: 'mail.acmecorp.com', role: 'Sending Domain', day: 'Day 8 of 14', progress: 58, sent: '186', total: '320', health: 90, status: 'Good', next: 'Increase to 200 Tomorrow' },
    { domain: 'acme-outreach.com', role: 'Backup Domain', day: 'Day 5 of 14', progress: 32, sent: '96', total: '300', health: 85, status: 'Good', next: 'Increase to 120 Tomorrow' }
  ];

  const series = [
    { name: 'acmecorp.com', color: 'var(--purple)', values: [20, 60, 90, 110, 140, 160, 200, 220, 248, 260, 300, 320, 360, 420] },
    { name: 'mail.acmecorp.com', color: 'var(--indigo)', values: [10, 30, 50, 70, 90, 110, 130, 150, 170, 186, 200, 220, 240, 260] },
    { name: 'acme-outreach.com', color: '#06b6d4', values: [5, 10, 20, 30, 40, 50, 60, 72, 84, 96, 108, 120, 140, 160] }
  ];

  const engagement = [
    { title: 'Positive Replies', value: 32, pct: '12.9%', delta: '▲ 25.0%', color: 'var(--green)' },
    { title: 'Neutral Replies', value: 18, pct: '7.3%', delta: '▲ 5.9%', color: 'var(--indigo)' },
    { title: 'Negative Replies', value: 3, pct: '1.2%', delta: '—40.0%', color: 'var(--amber)' },
    { title: 'Out of Office', value: 7, pct: '2.8%', delta: '▲ 16.7%', color: 'var(--green)' },
    { title: 'No Replies', value: 188, pct: '75.8%', delta: '— 8.2%', color: 'rgba(255,255,255,0.06)' },
    { title: 'Spam Complaints', value: 0, pct: '0.0%', delta: '—', color: 'var(--red)' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex', marginTop: 40 }}>
      <Sidebar active="Warmup" />

      <div style={{ flex: 1, minWidth: 0, padding: 0 }}>
        <DashboardHeader showExport={false} />
        <div className="warmup-header">
          <div>
            <h2>Warmup</h2>
            <div className="warmup-sub">Monitor and optimize your email deliverability with our 14-day warmup program.</div>
          </div>
          {/* <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select className="range-select" value={range} onChange={() => {}}>
              <option>{range}</option>
            </select>
            <button className="btn-export"><FiDownload /> Export Report</button>
          </div> */}
        </div>

        <div className="warmup-wrap">
          <div className="kpis-row">
            {kpis.map((k, i) => (
              <div key={i} className="kpi-card">
                <div className="kpi-left">
                  <div className="kpi-title">{k.title}</div>
                  <div className="kpi-value">{k.value}</div>
                  <div className="kpi-sub">{k.sub}</div>
                </div>
                <div className="kpi-spark"><MiniSpark values={k.spark} /></div>
              </div>
            ))}
          </div>

          <div className="card warmup-progress">
            <div className="card-header">Warmup Progress</div>
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Warmup Stage</th>
                  <th>Progress</th>
                  <th>Health Score</th>
                  <th>Status</th>
                  <th>Next Step</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="domain-icon"><FiGlobe /></div>
                        <div>
                          <div style={{ fontWeight: 800 }}>{d.domain}</div>
                          <div className="muted">{d.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="warmup-stage">{d.day}<div className="stage-sub">{d.day.includes('Day') ? 'Ramp Up' : ''}</div></div>
                    </td>
                    <td>
                      <div style={{ width: 320 }}>
                        <ProgressBar pct={d.progress} />
                        <div className="progress-meta">{d.sent} / {d.total} emails • <strong>{d.progress}%</strong></div>
                      </div>
                    </td>
                    <td>
                      <div className="health-pill">{d.health}</div>
                    </td>
                    <td>
                      <div className="status-pill status-good">{d.status}</div>
                    </td>
                    <td className="muted">{d.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card warmup-timeline">
            <div className="card-header">Warmup Timeline (14-Day Schedule)</div>
            <WarmupTimeline series={series} highlightIndex={9} />
          </div>

          <div className="engagement-row">
            {engagement.map((e, i) => (
              <div key={i} className="eng-card">
                <div className="eng-title">{e.title}</div>
                <div className="eng-value">{e.value}</div>
                <div className="eng-sub"><span style={{ color: e.color }}>{e.pct}</span> <span className="muted">{e.delta} vs yesterday</span></div>
                <div className="eng-spark"><MiniSpark values={[1,2,3,4,5]} color={e.color} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
