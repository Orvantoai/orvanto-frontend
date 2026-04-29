import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { submitContact } from '../services/api';
import { supabase } from '../services/supabaseClient';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', client_id: '', issue_type: '', description: '', urgency: 'normal'
  });
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auth: load current user and subscribe to auth changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
      sub?.unsubscribe?.();
    };
  }, []);

  // Prefill name/email when user is available
  useEffect(() => {
    if (!user) return;
    // Prefill only if fields are empty — avoid overwriting user input
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(prev => ({
      ...prev,
      email: prev.email || user.email || '',
      name: prev.name || (user.user_metadata?.full_name || user.user_metadata?.name || '')
    }));
  }, [user]);

  const setUrgency = (val) => {
    setFormData(prev => ({...prev, urgency: val}));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in your name and email.');
      return;
    }

    // Require authentication to submit support requests
    if (!user) {
      // prompt user to sign up / login
      // keep them on page after login would be ideal, but redirect to signup for now
      if (confirm('You must be signed in to submit a support request. Go to Sign up / Login?')) {
        navigate('/signup');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        user_id: user.id,
        user_email: user.email,
        user_metadata: user.user_metadata || {}
      };
      await submitContact(payload);
      setIsSuccess(true);
    } catch (err) {
      console.error('submitContact error', err);
      alert('Failed to send message. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="contact-page">
        <div className="contact-glow" />
        <div className="contact-bg-text">CONTACT</div>
        
        <div className="contact-lines">
          <div className="contact-line contact-line-1"></div>
          <div className="contact-line contact-line-2"></div>
          <div className="contact-line contact-line-3"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="contact-grid">
            
            {/* LEFT COLUMN: INFO */}
            <div className="contact-left">
              <div className="contact-tag">
                <img src="/favicon.svg" alt="Orvanto" className="w-5 h-5" />
                <span>Contact Orvanto AI</span>
              </div>
              
              <h1 className="contact-title">Get in touch</h1>
              <p className="contact-sub">
                Have questions or ready to transform your business with AI automation? 
                Our team responds fast to ensure you stay ahead.
              </p>

              <div className="contact-info-list">
                <a href="mailto:support@orvantoai.com" className="contact-info-card group">
                  <div className="contact-info-content">
                    <div className="contact-info-icon">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div className="contact-info-text">
                      <span className="contact-info-label">Email us</span>
                      <span className="contact-info-value">support@orvantoai.com</span>
                    </div>
                  </div>
                  <div className="contact-info-arrow">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                </a>

                {/* <div className="contact-info-card group" onClick={() => window.open('tel:5011234567')}>
                  <div className="contact-info-content">
                    <div className="contact-info-icon">
                      <i className="fa-solid fa-phone-alt"></i>
                    </div>
                    <div className="contact-info-text">
                      <span className="contact-info-label">Call us</span>
                      <span className="contact-info-value">(501) 123-4567</span>
                    </div>
                  </div>
                  <div className="contact-info-arrow">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                </div> */}

                {/* <div className="contact-info-card group">
                  <div className="contact-info-content">
                    <div className="contact-info-icon">
                      <i className="fa-solid fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-info-text">
                      <span className="contact-info-label">Our location</span>
                      <span className="contact-info-value">Varanasi, Uttar Pradesh, India</span>
                    </div>
                  </div>
                  <div className="contact-info-arrow">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                </div> */}
              </div>

              {/* Extra left block info */}
              <div className="support-row">
                <div className="support-hours-badge">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <div>
                    <strong>Support Hours</strong>
                    <span>Mon - Fri | 9 AM - 6 PM EST</span>
                  </div>
                </div>
                <div className="social-connect">
                  <a href="https://www.linkedin.com/company/orvanto-ai/" className="social-icon-btn"><i className="fa-brands fa-linkedin-in"></i></a>
                  {/* <a href="#" className="social-icon-btn"><i className="fa-brands fa-x"></i></a>
                  <a href="#" className="social-icon-btn"><i className="fa-brands fa-instagram"></i></a> */}
                  <a href="https://wa.me/9795222283" className="social-icon-btn"><i className="fa-brands fa-whatsapp"></i></a>
                
                </div>
                
              </div>
            </div>

            {/* RIGHT COLUMN: FORM */}
            <div className="contact-right">
              <div className="contact-form-card">
                {!isSuccess ? (
                  <>
                    {authLoading && <div className="mb-4 text-sm text-[var(--muted)]">Checking authentication...</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                      <div className="field">
                        <label>Your Name</label>
                        <input 
                          type="text" 
                          placeholder="John Smith" 
                          className="w-full"
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                      </div>
                      <div className="field">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          placeholder="john@company.com" 
                          className="w-full"
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>Client ID (if applicable)</label>
                      <input 
                        type="text" 
                        placeholder="Existing client ID" 
                        className="w-full"
                        value={formData.client_id} 
                        onChange={e => setFormData({...formData, client_id: e.target.value})} 
                      />
                    </div>

                    <div className="field">
                      <label>Issue Type</label>
                      <select 
                        className="w-full"
                        value={formData.issue_type} 
                        onChange={e => setFormData({...formData, issue_type: e.target.value})}
                      >
                        <option value="">Select issue type</option>
                        <option>General enquiry</option>
                        <option>Technical support</option>
                        <option>Billing question</option>
                        <option>Campaign performance</option>
                        <option>DNS / Deliverability</option>
                        <option>Feature request</option>
                        <option>Cancel / Pause subscription</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>Urgency Level</label>
                      <div className="urgency-row text-[0.8rem] gap-3 flex flex-wrap mt-2">
                        <div className={`urgency-tag px-4 py-3 rounded-xl cursor-pointer transition-all border flex items-center gap-2 ${formData.urgency === 'low' ? 'bg-[var(--green)]/10 border-[var(--green)]/40 text-[var(--green)]' : 'bg-white/5 border-white/10 text-muted hover:border-white/20'}`} onClick={() => setUrgency('low')}>
                          <i className="fa-solid fa-circle text-[8px]"></i>
                          <span>Low (72h SLA)</span>
                        </div>
                        <div className={`urgency-tag px-4 py-3 rounded-xl cursor-pointer transition-all border flex items-center gap-2 ${formData.urgency === 'normal' ? 'bg-[var(--amber)]/10 border-[var(--amber)]/40 text-[var(--amber)]' : 'bg-white/5 border-white/10 text-muted hover:border-white/20'}`} onClick={() => setUrgency('normal')}>
                          <i className="fa-solid fa-circle text-[8px]"></i>
                          <span>Normal (24h SLA)</span>
                        </div>
                        <div className={`urgency-tag px-4 py-3 rounded-xl cursor-pointer transition-all border flex items-center gap-2 ${formData.urgency === 'urgent' ? 'bg-[var(--red)]/10 border-[var(--red)]/40 text-[var(--red)]' : 'bg-white/5 border-white/10 text-muted hover:border-white/20'}`} onClick={() => setUrgency('urgent')}>
                          <i className="fa-solid fa-circle text-[8px] animate-pulse"></i>
                          <span>Urgent (2h SLA)</span>
                        </div>
                      </div>
                    </div>

                    <div className="field">
                      <label>Describe your issue</label>
                      <textarea 
                        className="w-full min-h-[140px]"
                        placeholder="Tell us what's happening..." 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      ></textarea>
                    </div>

                    <button className="btn-submit-new" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </button>
                    
            
                  </>
                ) : (
                  <div className="contact-success">
                    <span className="contact-success-icon"></span>
                    <h2 className="text-2xl font-bold mb-4">Message received</h2>
                    <p className="text-muted leading-relaxed">
                      We'll get back to you within your selected SLA window.<br/>
                      Check your inbox for a confirmation email.
                    </p>
                    <button className="btn-submit-new mt-8" onClick={() => setIsSuccess(false)}>
                      Send another message
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
