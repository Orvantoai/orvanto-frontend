import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartSimple,
  faGear,
  faDownload,
  faMagnifyingGlass,
  faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';


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
    const pause = isAtFull ? 1200 : isAtEmpty && headingDeleting ? 350 : speed;

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
const gradientText = {
  background: "linear-gradient(90deg,#ff95b4,#a855f7)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent"
};
  async function loadPortal(cId) {
    try {
      const [cResp, lResp, mResp] = await Promise.all([
        supabase.from('Clients').select('*').eq('client_id', cId).limit(1),
        supabase.from('Leads').select('*').eq('client_id', cId).order('created_at', { ascending: false }).limit(50),
        supabase.from('meetings').select('*').eq('client_id', cId).order('meeting_at', { ascending: false }).limit(5)
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

  const toggleSMS = () => setClientData({...clientData, sms_enabled: !clientData.sms_enabled});
  const toggleWA = () => setClientData({...clientData, whatsapp_enabled: !clientData.whatsapp_enabled});

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
      <div
        id="loading"
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
          background: '#070915',
          color: '#f4f6ff',
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif'
        }}
      >
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
            width: 152,
            height: 152,
            animation: 'portalFaviconSpin 1s linear infinite',
            filter: 'drop-shadow(0 0 16px rgba(168,85,247,.35))'
          }}
        />
        <div style={{ fontSize: 25, color: '#c5d0e6' }}>Verifying access...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div id="loading" style={{ display: 'flex' }}>
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          <h2>Access Error</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>{errorMsg}</p>
          <p style={{ marginTop: '16px' }}><a href="/contact" style={{ color: 'var(--purple)' }}>Contact support →</a></p>
        </div>
      </div>
    );
  }

  const c = clientData;
  const filteredLeads = leads.filter(l => (l.first_name + ' ' + l.last_name + ' ' + l.company + ' ' + l.email).toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 25);
  const navItems = [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog/post-1' },
    { label: 'Contact', href: '/contact' },
    { label: 'Active Leads', href: '#active-leads' },
    { label: 'Upcoming Meetings', href: '#upcoming-meetings' }
  ];
  const appBg = '#070915';
  const panelBg = '#0c1020';
  const panelBorder = '#1a2033';
  const muted = '#93a0bb';
  const subtle = '#68718b';
  const text = '#f4f6ff';
  const accent = '#8b5cf6';
  const good = '#22c55e';

  return (
    <>
      <div style={{ minHeight: '100vh', background: appBg, color: text, fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif' }}>
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '16px 0', borderBottom: `1px solid ${panelBorder}`, backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,.8)' }}>
          <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none',textAlign: 'center' }}>
              Orvanto AI
            </a>
            {!isMobileNav ? (
              <div style={{ display: 'flex', gap: 26, alignItems: 'center', flexWrap: 'wrap' }}>
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} style={{ color: muted, fontSize: '.9rem', fontWeight: 500, textDecoration: 'none' }}>
                    {item.label}
                  </a>
                ))}
                <a href={`/dashboard?client=${clientId}`} style={{ display: 'inline-block', background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: '#fff', padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', boxShadow: '0 0 30px rgba(168,85,247,.3)' }}>
                  Full Dashboard <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginLeft: 6 }} />
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${panelBorder}`,
                  color: text,
                  borderRadius: 8,
                  padding: '8px 11px',
                  fontSize: 18,
                  cursor: 'pointer',
                  lineHeight: 1
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            )}
          </div>
          {isMobileNav && mobileMenuOpen && (
            <div style={{ maxWidth: 1500, margin: '10px auto 0', padding: '0 24px 10px' }}>
              <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, background: '#0c1020', padding: 12 }}>
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: 'block', color: muted, fontSize: '.9rem', fontWeight: 500, textDecoration: 'none', padding: '10px 8px', borderRadius: 8 }}
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href={`/dashboard?client=${clientId}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'block', marginTop: 10, textAlign: 'center', background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: '#fff', padding: '10px 14px', borderRadius: 10, fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', boxShadow: '0 0 30px rgba(168,85,247,.3)' }}
                >
                  Full Dashboard <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginLeft: 6 }} />
                </a>
              </div>
            </div>
          )}
        </nav>

        <div style={{ maxWidth: 1500, margin: '0 auto', padding: '8px 24px 24px' }}>
          <main>
            <div>
              <section>
                <div style={{ marginBottom: 14, textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontSize: 45, fontWeight: 700 }}>
                  {typedHeading}
                  <span style={{ color: accent, marginLeft: 3 }}>|</span>
                </h1>
                  <div style={{ color: muted, fontSize: 13, marginTop: 7 }}>
                    {(c.plan || 'starter').toUpperCase()} PLAN · {c.warmup_complete ? 'OUTREACH LIVE' : `WARMING UP — DAY ${c.warmup_day || 0}/14`}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .95fr .75fr', gap: 16, marginBottom: 16 }}>
                  <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, background: panelBg, padding: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 30 }}>
                      <FontAwesomeIcon icon={faChartSimple} style={{ color: accent, fontSize: 30 }} /> Pipeline Overview
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', rowGap: 14 }}>
                      <div><div style={{ color: subtle, fontSize: 11, textTransform: 'uppercase' }}>Leads Generated</div><div style={{ fontSize: 34, fontWeight: 700 }}>{c.leads_generated || 0}</div></div>
                      <div><div style={{ color: subtle, fontSize: 11, textTransform: 'uppercase' }}>Emails Sent</div><div style={{ fontSize: 34, fontWeight: 700, color: accent }}>{c.emails_sent || 0}</div></div>
                      <div><div style={{ color: subtle, fontSize: 11, textTransform: 'uppercase' }}>Replies</div><div style={{ fontSize: 34, fontWeight: 700 }}>{c.replies_received || 0}</div></div>
                      <div><div style={{ color: subtle, fontSize: 11, textTransform: 'uppercase' }}>Meetings Booked</div><div style={{ fontSize: 34, fontWeight: 700, color: good }}>{c.meetings_booked || 0}</div></div>
                      <div><div style={{ color: subtle, fontSize: 11, textTransform: 'uppercase' }}>Pipeline Value</div><div style={{ fontSize: 34, fontWeight: 700, color: accent }}>${Math.round(c.pipeline_value || 0).toLocaleString()}</div></div>
                    </div>
                  </div>
                  <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, background: panelBg, padding: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,fontSize: 27}}>
                      <FontAwesomeIcon icon={faGear} style={{ fontSize: 22 }} /> Controls
                    </div>
                    {[
                      { label: 'Outreach Active', sub: 'Pause to stop all emails and calls', enabled: c.status !== 'paused', onClick: toggleOutreach },
                      { label: 'SMS Enabled', sub: 'Twilio SMS outreach', enabled: !!c.sms_enabled, onClick: toggleSMS },
                      { label: 'WhatsApp Enabled', sub: '360dialog WhatsApp', enabled: !!c.whatsapp_enabled, onClick: toggleWA }
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                        <button
                          type="button"
                          onClick={item.onClick}
                          style={{
                            width: 34,
                            height: 20,
                            marginTop: 2,
                            borderRadius: 999,
                            border: `1px solid ${item.enabled ? '#16a34a' : '#525c73'}`,
                            background: item.enabled ? '#14b85f' : '#394359',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: 1.5,
                              left: item.enabled ? 16 : 2,
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'all .2s'
                            }}
                          />
                        </button>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                          <div style={{ color: muted, fontSize: 12 }}>{item.sub}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); downloadCSV(); }}
                        style={{ border: `1px solid ${panelBorder}`, color: text, textDecoration: 'none', fontSize: 12, padding: '9px 10px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                      >
                        <FontAwesomeIcon icon={faDownload} style={{ fontSize: 22 }} /> Download Leads CSV
                      </a>
                    </div>
                  </div>
                  <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, background: panelBg, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 30 }}>Need Help?</div>
                      <p style={{ 
                        color: muted, 
                        fontSize: 15, 
                        lineHeight: 1.6,
                        margin: '0 0 14px',
                        maxWidth: 280
                      }}>
                        Have a question or issue? Our team responds fast.
                      </p>
                    </div>
                    <a href="/contact" style={{ color: accent, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                      Contact Support <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                  </div>
                </div>

                <div id="active-leads" style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, background: panelBg, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h2 style={{ fontWeight: 700, marginBottom: 8, fontSize: 30, marginTop: 2 }}>Active Leads</h2>
                    <div style={{ width: 250, position: 'relative' }}>
                      <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: 12, top: 10, color: subtle, fontSize: 12 }} />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', background: '#0a0f1d', border: `1px solid ${panelBorder}`, borderRadius: 10, color: text, padding: '8px 10px 8px 32px', fontSize: 13, outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 340 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ color: subtle, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          <th style={{ textAlign: 'left', padding: '8px 6px' }}>Name</th>
                          <th style={{ textAlign: 'left', padding: '8px 6px' }}>Company</th>
                          <th style={{ textAlign: 'left', padding: '8px 6px' }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '8px 6px' }}>Channel</th>
                          <th style={{ textAlign: 'left', padding: '8px 6px' }}>BANT</th>
                          <th style={{ textAlign: 'left', padding: '8px 6px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.length === 0 ? (
                          <tr><td colSpan="6" style={{ color: muted, padding: 24 }}>No leads found.</td></tr>
                        ) : (
                          filteredLeads.map((l, i) => {
                            const status = l.meeting_booked ? 'booked' : l.email_replied ? 'replied' : l.email_sent ? 'emailed' : 'new';
                            const channels = [l.email_sent && 'Email', l.sms_sent && 'SMS', l.whatsapp_sent && 'WA', l.voice_called && 'Voice', l.linkedin_sent && 'LI'].filter(Boolean).join(' · ') || '—';
                            return (
                              <tr key={i} style={{ borderTop: `1px solid ${panelBorder}` }}>
                                <td style={{ padding: '10px 6px' }}><div style={{ fontWeight: 600 }}>{l.first_name || ''} {l.last_name || ''}</div><div style={{ color: subtle, fontSize: 11 }}>{l.email || ''}</div></td>
                                <td style={{ padding: '10px 6px' }}><div>{l.company || '—'}</div><div style={{ color: subtle, fontSize: 11 }}>{l.title || ''}</div></td>
                                <td style={{ padding: '10px 6px' }}>
                                  <span style={{ fontSize: 11, textTransform: 'lowercase', borderRadius: 999, padding: '3px 10px', border: `1px solid ${status === 'booked' ? '#245f3a' : status === 'replied' ? '#6d5d2a' : status === 'emailed' ? '#473a77' : '#38425a'}`, color: status === 'booked' ? '#63f29f' : status === 'replied' ? '#facc15' : status === 'emailed' ? '#bf9cff' : '#9aa5bf' }}>
                                    {status}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 6px', color: muted, fontSize: 12 }}>{channels}</td>
                                <td style={{ padding: '10px 6px', color: (l.bant_score || 0) >= 70 ? good : muted }}>{l.bant_score || '—'}</td>
                                <td style={{ padding: '10px 6px' }}><a href={`mailto:${l.email}`} style={{ color: accent, fontSize: 12, textDecoration: 'none' }}>Email</a></td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, background: panelBg, padding: 14,marginTop: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 30, marginTop: 2 }}>Upcoming Meetings</div>
                  {meetings.length === 0 ? (
                    <p style={{ color: muted, fontSize: 12, lineHeight: 1.5, margin: 0 }}>No meetings yet. Meetings appear here when prospects book via your Cal.com link.</p>
                  ) : (
                    meetings.map((m, i) => (
                      <div key={i} style={{ border: `1px solid ${panelBorder}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <strong style={{ color: '#e9edfb' }}>Meeting {m.id}</strong>
                          <span style={{ color: muted }}>{m.meeting_at ? new Date(m.meeting_at).toLocaleDateString() : '—'}</span>
                        </div>
                        <div style={{ color: muted, fontSize: 12, marginTop: 4 }}>{m.outcome || 'Scheduled'} · ${m.deal_value || 0}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* <section id="upcoming-meetings" style={{ display: 'grid', gap: 0, alignContent: 'start', marginTop: 0 }}>
                <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, background: panelBg, padding: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 18 }}>Upcoming Meetings</div>
                  {meetings.length === 0 ? (
                    <p style={{ color: muted, fontSize: 12, lineHeight: 1.5, margin: 0 }}>No meetings yet. Meetings appear here when prospects book via your Cal.com link.</p>
                  ) : (
                    meetings.map((m, i) => (
                      <div key={i} style={{ border: `1px solid ${panelBorder}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <strong style={{ color: '#e9edfb' }}>Meeting {m.id}</strong>
                          <span style={{ color: muted }}>{m.meeting_at ? new Date(m.meeting_at).toLocaleDateString() : '—'}</span>
                        </div>
                        <div style={{ color: muted, fontSize: 12, marginTop: 4 }}>{m.outcome || 'Scheduled'} · ${m.deal_value || 0}</div>
                      </div>
                    ))
                  )}
                </div>
              </section> */}
            </div>
          </main>
        </div>

        <footer style={{ background: '#0a0a0f', borderTop: `1px solid ${panelBorder}`, padding: '60px 24px' }}>
          <div style={{ maxWidth: 1500, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 42 }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>Orvanto AI</div>
                <p style={{ color: muted, fontSize: '.85rem', lineHeight: 1.7, maxWidth: 360 }}>
                  The world's most complete done-for-you B2B sales infrastructure. Find leads, send outreach, book meetings on autopilot.
                </p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '.9rem' }}>Portal</h4>
                <a href={`/dashboard?client=${clientId}`} style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Dashboard</a>
                <a href="#active-leads" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Active Leads</a>
                <a href="#upcoming-meetings" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Upcoming Meetings</a>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '.9rem' }}>Company</h4>
                <a href="/" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Home</a>
                <a href="/about" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>About</a>
                <a href="/blog/post-1" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Blogs</a>
                <a href="/contact" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Contact</a>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '.9rem' }}>Legal</h4>
                <a href="/policy" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/terms-of-service" style={{ display: 'block', color: muted, fontSize: '.85rem', marginBottom: 10, textDecoration: 'none' }}>Terms of Service</a>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${panelBorder}`, marginTop: 40, paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ color: subtle, fontSize: '.8rem', margin: 0 }}>© 2025 Orvanto AI / Sanfy Consultancy Services Pvt. Ltd. All rights reserved.</p>
              <p style={{ color: subtle, fontSize: '.8rem', margin: 0 }}>support@orvantoai.com</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
