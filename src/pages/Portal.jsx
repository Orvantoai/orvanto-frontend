import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartSimple,
  faGear,
  faDownload,
  faMagnifyingGlass,
  faArrowUpRightFromSquare,
  faMessage,
  faCalendarCheck,
  faShieldHalved,
  faCircleCheck,
  faEnvelope,
  faPhone,
  faCheckCircle,
  faCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import { FiLinkedin, FiExternalLink } from 'react-icons/fi';
import './Portal.css';

export default function Portal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const clientIdDirect = searchParams.get('client');
  const [clientId, setClientId] = useState(clientIdDirect);
  
  const [clientData, setClientData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typedHeading, setTypedHeading] = useState('');
  const [headingDeleting, setHeadingDeleting] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function init() {
      let resolvedClientId = clientIdDirect;
      if (token) {
        const { data: tokens, error } = await supabase
          .from('portal_tokens')
          .select('client_id,expires_at')
          .eq('token', token)
          .limit(1);
          
        if (error || !tokens || tokens.length === 0) {
          setErrorMsg('Invalid or expired access token.');
          setLoading(false);
          return;
        }
        
        const t = tokens[0];
        if (new Date(t.expires_at) < new Date()) {
          setErrorMsg('Your portal access has expired. Please contact support.');
          setLoading(false);
          return;
        }
        resolvedClientId = t.client_id;
        setClientId(resolvedClientId);
      }

      if (!resolvedClientId) {
        setErrorMsg('No access token or client ID provided.');
        setLoading(false);
        return;
      }
      
      loadPortal(resolvedClientId);
    }
    
    init();
  }, [token, clientIdDirect]);

  useEffect(() => {
    const updateViewport = () => setIsMobileNav(window.innerWidth <= 980);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!clientData?.name) return;

    const fullText = `${clientData.name} — Client Portal`;
    const isAtFull = typedHeading === fullText;
    const isAtEmpty = typedHeading.length === 0;
    const speed = headingDeleting ? 45 : 80;
    const pause = isAtFull ? 2500 : isAtEmpty && headingDeleting ? 500 : speed;

    const timer = setTimeout(() => {
      if (isAtFull && !headingDeleting) {
        setHeadingDeleting(true);
        return;
      }

      if (isAtEmpty && headingDeleting) {
        setHeadingDeleting(false);
        return;
      }

      setTypedHeading((prev) =>
        headingDeleting ? fullText.slice(0, prev.length - 1) : fullText.slice(0, prev.length + 1)
      );
    }, pause);

    return () => clearTimeout(timer);
  }, [clientData, typedHeading, headingDeleting]);

  async function loadPortal(cId) {
    try {
      const [cResp, lResp, mResp] = await Promise.all([
        supabase.from('Clients').select('*').eq('client_id', cId).limit(1),
        supabase.from('Leads').select('*').eq('client_id', cId).order('created_at', { ascending: false }).limit(100),
        supabase.from('meetings').select('*').eq('client_id', cId).order('meeting_at', { ascending: false }).limit(10)
      ]);

      if (cResp.error) throw cResp.error;

      if (!cResp.data || cResp.data.length === 0) {
        setErrorMsg('Client not found.');
        setLoading(false);
        return;
      }

      setClientData(cResp.data[0]);
      setLeads(lResp.data || []);
      setMeetings(mResp.data || []);
      setLoading(false);
    } catch(e) {
      setErrorMsg('Error loading portal: ' + e.message);
      setLoading(false);
    }
  }

  const toggleOutreach = async () => {
    const paused = clientData.status === 'paused';
    const newStatus = paused ? 'active' : 'paused';
    setClientData({...clientData, status: newStatus});
    
    await supabase.from('Clients').update({ 
      status: newStatus, 
      paused_at: !paused ? new Date().toISOString() : null 
    }).eq('client_id', clientId);
  };

  const toggleSMS = async () => {
    const newValue = !clientData.sms_enabled;
    setClientData({...clientData, sms_enabled: newValue});
    await supabase.from('Clients').update({ sms_enabled: newValue }).eq('client_id', clientId);
  };

  const toggleWA = async () => {
    const newValue = !clientData.whatsapp_enabled;
    setClientData({...clientData, whatsapp_enabled: newValue});
    await supabase.from('Clients').update({ whatsapp_enabled: newValue }).eq('client_id', clientId);
  };

  const downloadCSV = () => {
    if (!leads.length) return;
    const headers = ['id','first_name','last_name','email','company','title','phone','linkedin_url','industry','country','status','email_sent','email_replied','meeting_booked','bant_score','created_at'];
    const rows = leads.map(l => headers.map(h => JSON.stringify(l[h] || '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'orvanto_leads_' + clientId + '_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="cp-loading">
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
            width: 120,
            height: 120,
            animation: 'portalFaviconSpin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            filter: 'drop-shadow(0 0 20px rgba(168,85,247,.4))'
          }}
        />
        <div style={{ fontSize: 20, color: '#94a3b8', fontWeight: 500, letterSpacing: 1 }}>VERIFYING PORTAL ACCESS</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="cp-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40, background: '#111118', borderRadius: 24, border: '1px solid #ef4444' }}>
          <FontAwesomeIcon icon={faCircleXmark} style={{ fontSize: 60, color: '#ef4444', marginBottom: 20 }} />
          <h2 style={{ fontSize: 28, color: '#f4f6ff', margin: 0 }}>Access Denied</h2>
          <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 16 }}>{errorMsg}</p>
          <div style={{ marginTop: 24 }}>
            <a href="/contact" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>Contact support help →</a>
          </div>
        </div>
      </div>
    );
  }

  const c = clientData;
  const filteredLeads = leads.filter(l => 
    (l.first_name + ' ' + l.last_name + ' ' + l.company + ' ' + l.email).toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50);

  const navItems = [
    { label: 'Active Leads', href: '#active-leads' },
    { label: 'Meetings', href: '#meetings' },
    { label: 'Reports', href: '/reports' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <div className="cp-root">
      {/* ─── PREMIUM NAVBAR ─── */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, 
        padding: '20px 0', borderBottom: '1px solid #1e1e2e', 
        backdropFilter: 'blur(25px)', background: 'rgba(10,10,15,.75)' 
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ 
            fontSize: '1.5rem', fontWeight: 900, 
            background: 'linear-gradient(135deg,#a855f7,#6366f1)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
            textDecoration: 'none', letterSpacing: -1
          }}>
            ORVANTO AI
          </a>
          
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {!isMobileNav && navItems.map((item) => (
              <a key={item.label} href={item.href} style={{ color: '#94a3b8', fontSize: '.9rem', fontWeight: 600, textDecoration: 'none', transition: 'color .2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
                {item.label}
              </a>
            ))}
            <a href={`/dashboard?client=${clientId}`} style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg,#a855f7,#6366f1)', 
              color: '#fff', padding: '12px 24px', borderRadius: 12, 
              fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', 
              boxShadow: '0 10px 25px rgba(168,85,247,.25)',
              transition: 'transform .2s'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Full Dashboard <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 12 }} />
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="cp-hero" style={{ marginTop: 80 }}>
        <div className="cp-hero-glow"></div>
        <h1 className="cp-hero-heading" style={{ color: '#f4f6ff' }}>
          {typedHeading}
          <span style={{ color: '#a855f7', marginLeft: 4, animation: 'blink 1s infinite' }}>|</span>
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.2)', color: '#a855f7', fontSize: '.75rem', fontWeight: 700, letterSpacing: 1 }}>
            {(c.plan || 'starter').toUpperCase()} PLAN
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 20, background: c.warmup_complete ? 'rgba(34,197,94,.1)' : 'rgba(245,158,11,.1)', border: c.warmup_complete ? '1px solid rgba(34,197,94,.2)' : '1px solid rgba(245,158,11,.2)', color: c.warmup_complete ? '#22c55e' : '#f59e0b', fontSize: '.75rem', fontWeight: 700, letterSpacing: 1 }}>
            {c.warmup_complete ? 'OUTREACH LIVE' : `WARMING UP — DAY ${c.warmup_day || 0}/14`}
          </span>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <div className="cp-body" style={{ gridTemplateColumns: '1fr 340px' }}>
        <div className="cp-center">
          
          {/* Stats Grid */}
          <div className="cp-overview-row">
            <div className="cp-card cp-pipeline-card" style={{ background: 'linear-gradient(135deg, #111118 0%, #0c0c14 100%)' }}>
              <div className="cp-card-header">
                <div className="cp-card-heading">
                  <FontAwesomeIcon icon={faChartSimple} style={{ color: '#a855f7' }} /> Pipeline Performance
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 16 }}>
                {[
                  { label: 'Leads Found', val: c.leads_generated || 0, color: '#f4f6ff' },
                  { label: 'Outreach Sent', val: c.emails_sent || 0, color: '#a855f7' },
                  { label: 'Positive Replies', val: c.replies_received || 0, color: '#f59e0b' },
                  { label: 'Meetings', val: c.meetings_booked || 0, color: '#22c55e' },
                  { label: 'Pipeline Value', val: `$${Math.round(c.pipeline_value || 0).toLocaleString()}`, color: '#a855f7' },
                  { label: 'Conv. Rate', val: `${((c.meetings_booked || 0) / (Math.max(c.emails_sent, 1)) * 100).toFixed(1)}%`, color: '#f4f6ff' }
                ].map(stat => (
                  <div key={stat.label} className="cp-pipeline-item">
                    <div className="cp-pipeline-label">{stat.label}</div>
                    <div className="cp-pipeline-value" style={{ color: stat.color }}>{stat.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cp-card cp-controls-card">
              <div className="cp-card-header">
                <div className="cp-card-heading"><FontAwesomeIcon icon={faGear} /> System Controls</div>
              </div>
              <div className="cp-ctrl-list" style={{ marginTop: 10 }}>
                {[
                  { label: 'Outreach Status', sub: c.status === 'paused' ? 'Currently Paused' : 'Running', on: c.status !== 'paused', toggle: toggleOutreach },
                  { label: 'SMS Integration', sub: 'Twilio Cloud', on: !!c.sms_enabled, toggle: toggleSMS },
                  { label: 'WhatsApp', sub: '360Dialog API', on: !!c.whatsapp_enabled, toggle: toggleWA }
                ].map(ctrl => (
                  <div key={ctrl.label} className="cp-ctrl-row">
                    <div className="cp-ctrl-info">
                      <div className="cp-ctrl-dot" style={{ background: ctrl.on ? '#22c55e' : '#64748b' }}></div>
                      <div>
                        <div className="cp-ctrl-label">{ctrl.label}</div>
                        <div className="cp-ctrl-desc">{ctrl.sub}</div>
                      </div>
                    </div>
                    <button className={`cp-toggle ${ctrl.on ? 'on' : ''}`} onClick={ctrl.toggle}>
                      <div className="cp-toggle-knob"></div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="cp-ctrl-actions">
                <button onClick={downloadCSV} className="cp-btn-outline" style={{ width: '100%' }}>
                  <FontAwesomeIcon icon={faDownload} /> Export Leads Database
                </button>
              </div>
            </div>
          </div>

          {/* Active Leads Table */}
          <div className="cp-card" id="active-leads">
            <div className="cp-card-header">
              <div className="cp-card-heading">Active Lead Pipeline</div>
              <div className="cp-table-search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input type="text" placeholder="Search leads..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Lead Details</th>
                    <th>Company / Title</th>
                    <th>Status</th>
                    <th>Engagement</th>
                    <th>BANT</th>
                    <th>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr><td colSpan="6" className="cp-empty">No matching leads found in your pipeline.</td></tr>
                  ) : (
                    filteredLeads.map((l, i) => {
                      const status = l.meeting_booked ? 'booked' : l.email_replied ? 'replied' : l.email_sent ? 'emailed' : 'new';
                      const channels = [
                        l.email_sent && <FontAwesomeIcon icon={faEnvelope} title="Email" />,
                        l.sms_sent && <FontAwesomeIcon icon={faMessage} title="SMS" />,
                        l.voice_called && <FontAwesomeIcon icon={faPhone} title="Voice" />,
                        l.linkedin_sent && <FiLinkedin title="LinkedIn" />
                      ].filter(Boolean);
                      
                      return (
                        <tr key={i}>
                          <td>
                            <div className="cp-lead-name">{l.first_name} {l.last_name}</div>
                            <div className="cp-lead-email">{l.email}</div>
                          </td>
                          <td>
                            <div className="cp-lead-company">{l.company || '—'}</div>
                            <div className="cp-lead-title">{l.title || ''}</div>
                          </td>
                          <td>
                            <span className={`cp-badge cp-badge-${status}`}>{status}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 10, color: '#64748b' }}>
                              {channels.length > 0 ? channels.map((ic, ii) => <span key={ii}>{ic}</span>) : '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, height: 4, background: '#1e1e2e', borderRadius: 2, minWidth: 40 }}>
                                <div style={{ height: '100%', borderRadius: 2, width: `${l.bant_score || 0}%`, background: (l.bant_score || 0) >= 70 ? '#22c55e' : (l.bant_score || 0) >= 40 ? '#f59e0b' : '#64748b' }}></div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: (l.bant_score || 0) >= 70 ? '#22c55e' : '#94a3b8' }}>{l.bant_score || 0}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <a href={`mailto:${l.email}`} className="cp-action-link"><FontAwesomeIcon icon={faEnvelope} /></a>
                              {l.linkedin_url && <a href={l.linkedin_url} target="_blank" rel="noreferrer" className="cp-action-link"><FiLinkedin /></a>}
                              <a href="#" className="cp-action-link"><FiExternalLink /></a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="cp-right">
          
          {/* Meeting Guarantee */}
          <div className="cp-card cp-guarantee-card">
            <div className="cp-guarantee-header">
              <FontAwesomeIcon icon={faShieldHalved} className="cp-guarantee-icon" style={{ fontSize: 24 }} />
              <div>
                <div className="cp-guarantee-title">Meeting Guarantee</div>
                <div className="cp-guarantee-sub">3 meetings in 30 days</div>
              </div>
            </div>
            <div className="cp-guarantee-bar">
              <div className="cp-guarantee-fill" style={{ width: `${Math.min((c.meetings_booked || 0) / 3 * 100, 100)}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '.7rem', fontWeight: 600 }}>
              <span style={{ color: '#22c55e' }}>{c.meetings_booked || 0} SECURED</span>
              <span style={{ color: '#94a3b8' }}>GOAL: 3</span>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="cp-card" id="meetings">
            <div className="cp-card-header">
              <div className="cp-card-heading"><FontAwesomeIcon icon={faCalendarCheck} style={{ color: '#22c55e' }} /> Upcoming Meetings</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {meetings.length === 0 ? (
                <div className="cp-empty">No meetings booked yet.</div>
              ) : (
                meetings.map((m, i) => (
                  <div key={i} className="cp-doc-row" style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 }}>
                    <div className="cp-doc-icon"><FontAwesomeIcon icon={faCalendarCheck} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="cp-doc-name">{m.contact_name || `Prospect ${m.id.toString().slice(-4)}`}</div>
                      <div className="cp-doc-meta">
                        {m.meeting_at ? new Date(m.meeting_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending Time'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="cp-btn-primary" style={{ width: '100%' }}>Sync Calendar</button>
            </div>
          </div>

          {/* Support Widget */}
          <div className="cp-card" style={{ background: 'linear-gradient(135deg, #a855f710, #6366f110)', border: '1px solid #a855f730' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Need Priority Help?</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
              Your account manager is available 24/7 for strategy adjustments and technical support.
            </p>
            <a href="/contact" className="cp-btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
              Message Support
            </a>
          </div>

        </div>
      </div>

      <footer className="cp-footer">
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>© 2025 Orvanto AI. Sanfy Consultancy Services Pvt. Ltd.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="/policy">Privacy</a>
            <a href="/terms-of-service">Terms</a>
            <a href="/contact">Support</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        .cp-action-link { transition: transform 0.2s; display: inline-block; }
        .cp-action-link:hover { transform: scale(1.2); color: #fff; }
        .cp-table-wrap::-webkit-scrollbar { height: 6px; }
        .cp-table-wrap::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 10px; }
      `}</style>
    </div>
  );
}
