import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { FiGlobe, FiLock } from 'react-icons/fi';
import { supabase } from '../services/supabaseClient';
import { submitOnboarding } from '../services/api';
import { load } from '@cashfreepayments/cashfree-js';
import Footer from '../components/Footer';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const urlPlan = searchParams.get('plan') || 'growth';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '', website: '', contact_name: '', work_email: '', phone: '', industry: '', company_size: '',
    countries: [], problem_solved: '', ideal_job_titles: '', target_industries: [], target_company_sizes: [],
    target_geographies: [], unique_selling_point: '', competitor_names: '', value_proposition: '', 
    average_deal_value: '', sales_cycle: '', cal_booking_link: '', plan: urlPlan, referral_source: '',
    password: ''
  });
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successClientId, setSuccessClientId] = useState('');
  const [errors, setErrors] = useState({});

  // Payment & Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplying, setIsCouponApplying] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  
  const planPrices = { starter: 597, growth: 997, pro: 1997 };
  const basePrice = planPrices[formData.plan] || 997;
  const finalPrice = Math.max(0, basePrice - (basePrice * (discountPercent / 100)));

  const setError = (field, msg) => setErrors(prev => ({ ...prev, [field]: msg }));
  const clearError = (field) => setErrors(prev => {
    const copy = { ...prev };
    delete copy[field];
    return copy;
  });

  const validateField = (field, value = formData[field], setErrorsFlag = true) => {
    const v = typeof value === 'string' ? value.trim() : value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const freeDomains = ["gmail.com","yahoo.com","hotmail.com","outlook.com","aol.com"];

    try {
      switch (field) {
        case 'company_name': {
          const ok = /^[a-zA-Z0-9\s.&-]{2,}$/.test(v || '');
          if (!ok) { if (setErrorsFlag) setError(field, 'Enter a valid company name'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'website': {
          if (!v) { if (setErrorsFlag) setError(field, 'Enter your website'); return false; }
          try {
            let parsed;
            try { parsed = new URL(v); } catch { parsed = new URL('https://' + v); }
            const hostname = parsed.hostname || '';
            // require a domain-like hostname (has a dot + TLD) unless it's localhost or an IP
            const isLocalhost = hostname === 'localhost';
            const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
            const hasTld = /\.([a-z]{2,})$/i.test(hostname);
            if (!isLocalhost && !isIP && !hasTld) {
              if (setErrorsFlag) setError(field, 'Enter a valid website domain (e.g. company.com)');
              return false;
            }
            if (setErrorsFlag) clearError(field);
            return true;
          } catch (err) {
            if (setErrorsFlag) setError(field, 'Enter a valid website URL');
            return false;
          }
        }

        case 'contact_name': {
          if (!v) { if (setErrorsFlag) setError(field, 'Enter your full name'); return false; }
          // allow letters (unicode), spaces, hyphens, apostrophes and dots
          try {
            const nameRegex = /^[\p{L}\p{M}.'\- ]+$/u;
            if (!nameRegex.test(v)) { if (setErrorsFlag) setError(field, 'Name contains invalid characters'); return false; }
            const parts = v.split(/\s+/).filter(Boolean);
            if (parts.length < 2) { if (setErrorsFlag) setError(field, 'Please enter your full name (first and last)'); return false; }
            if (parts.some(p => p.replace(/[.'\-]/g, '').length < 2)) { if (setErrorsFlag) setError(field, 'Each name part should be at least 2 letters'); return false; }
            if (setErrorsFlag) clearError(field);
            return true;
          } catch (err) {
            if (setErrorsFlag) setError(field, 'Enter a valid name');
            return false;
          }
        }

        case 'work_email': {
          if (!v || !emailRegex.test(v)) { if (setErrorsFlag) setError(field, 'Invalid email format'); return false; }
          const domain = v.split('@')[1]?.toLowerCase();
          if (freeDomains.includes(domain)) { if (setErrorsFlag) setError(field, 'Please use a work email, not a free provider'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'phone': {
          const ok = /^\+?[0-9]{10,15}$/.test(v || '');
          if (!ok) { if (setErrorsFlag) setError(field, 'Enter a valid phone number (10-15 digits)'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'industry': {
          if (!v) { if (setErrorsFlag) setError(field, 'Select industry'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'company_size': {
          if (!v) { if (setErrorsFlag) setError(field, 'Select company size'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'countries': {
          if (!Array.isArray(v) || v.length === 0) { if (setErrorsFlag) setError(field, 'Select at least one country'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'problem_solved': {
          if (!v || v.length < 15) { if (setErrorsFlag) setError(field, 'Explain your problem clearly (15+ chars)'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'ideal_job_titles': {
          if (!v) { if (setErrorsFlag) setError(field, 'Enter at least one job title'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'target_industries':
        case 'target_company_sizes':
        case 'target_geographies': {
          if (!Array.isArray(v) || v.length === 0) { if (setErrorsFlag) setError(field, 'Select at least one option'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'unique_selling_point':
        case 'different': {
          if (!v || v.length < 10) { if (setErrorsFlag) setError(field, 'Please provide at least 10 characters'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'competitor_names': {
          if (!v) { if (setErrorsFlag) clearError(field); return true; }
          if (!v.includes(',')) { if (setErrorsFlag) setError(field, 'Provide competitors as a comma-separated list'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'value_proposition': {
          if (!v || v.length < 10) { if (setErrorsFlag) setError(field, 'Write a clear value proposition (10+ chars)'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'average_deal_value': {
          const num = Number(v);
          if (!num || Number.isNaN(num) || num <= 0) { if (setErrorsFlag) setError(field, 'Enter a valid deal value'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'sales_cycle': {
          if (!v) { if (setErrorsFlag) setError(field, 'Select sales cycle'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'cal_booking_link': {
          if (!v) { if (setErrorsFlag) setError(field, 'Enter your booking link'); return false; }
          try { new URL(v); }
          catch { try { new URL('https://' + v); } catch { if (setErrorsFlag) setError(field, 'Enter a valid booking link'); return false; } }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'referral_source': {
          if (!v) { if (setErrorsFlag) setError(field, 'Select how you heard about us'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        case 'password': {
          if (!v || v.length < 8) { if (setErrorsFlag) setError(field, 'Password must be at least 8 characters'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }
        case 'plan': {
          if (!v) { if (setErrorsFlag) setError(field, 'Select a plan'); return false; }
          if (setErrorsFlag) clearError(field); return true;
        }

        default:
          return true;
      }
    } catch (err) {
      if (setErrorsFlag) setError(field, 'Invalid value');
      return false;
    }
  };

  const validateStep1 = (setErrorsFlag = true) => {
    return (
      validateField('company_name', formData.company_name, setErrorsFlag) &&
      validateField('website', formData.website, setErrorsFlag) &&
      validateField('contact_name', formData.contact_name, setErrorsFlag) &&
      validateField('work_email', formData.work_email, setErrorsFlag) &&
      validateField('phone', formData.phone, setErrorsFlag) &&
      validateField('password', formData.password, setErrorsFlag) &&
      validateField('industry', formData.industry, setErrorsFlag) &&
      validateField('company_size', formData.company_size, setErrorsFlag) &&
      validateField('countries', formData.countries, setErrorsFlag)
    );
  };

  const validateStep2 = (setErrorsFlag = true) => {
    return (
      validateField('problem_solved', formData.problem_solved, setErrorsFlag) &&
      validateField('ideal_job_titles', formData.ideal_job_titles, setErrorsFlag) &&
      validateField('target_industries', formData.target_industries, setErrorsFlag) &&
      validateField('target_company_sizes', formData.target_company_sizes, setErrorsFlag) &&
      validateField('target_geographies', formData.target_geographies, setErrorsFlag) &&
      validateField('unique_selling_point', formData.unique_selling_point, setErrorsFlag) &&
      validateField('different', formData.different, setErrorsFlag) &&
      validateField('competitor_names', formData.competitor_names, setErrorsFlag)
    );
  };

  const validateStep3 = (setErrorsFlag = true) => {
    return (
      validateField('value_proposition', formData.value_proposition, setErrorsFlag) &&
      validateField('average_deal_value', formData.average_deal_value, setErrorsFlag) &&
      validateField('sales_cycle', formData.sales_cycle, setErrorsFlag) &&
      validateField('cal_booking_link', formData.cal_booking_link, setErrorsFlag) &&
      validateField('referral_source', formData.referral_source, setErrorsFlag)
    );
  };

  const validateStep4 = (setErrorsFlag = true) => {
    // We don't validate raw card fields here — payment should be handled by Stripe/checkout.
    return validateField('plan', formData.plan, setErrorsFlag);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, isSuccess]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
    // clear inline error while typing
    if (id) clearError(id);
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    if (id) validateField(id, value);
  };

  const toggleTag = (group, val) => {
    setFormData(prev => {
      const arr = prev[group] || [];
      const newArr = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
      return { ...prev, [group]: newArr };
    });
  };

  const nextStep = (n) => {
    if (n === 2) {
      if (!validateStep1(true)) return;
    }
    if (n === 3) {
      if (!validateStep2(true)) return;
    }
    if (n === 4) {
      if (!validateStep3(true)) return;
    }
    setCurrentStep(n);
  };

  const prevStep = (n) => {
    setCurrentStep(n);
  };

  const selectPlan = (plan) => {
    setFormData(prev => ({...prev, plan}));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCouponApplying(true);
    setCouponMessage('');
    try {
      const { data, error } = await supabase
        .from('Coupons')
        .select('discount_percent, is_active')
        .eq('code', couponCode.trim().toUpperCase())
        .single();
        
      if (error || !data || !data.is_active) {
        setCouponMessage('Invalid or expired coupon code.');
        setDiscountPercent(0);
      } else {
        setDiscountPercent(data.discount_percent);
        setCouponMessage(`${data.discount_percent}% discount applied!`);
      }
    } catch (err) {
      setCouponMessage('Error verifying coupon.');
    }
    setIsCouponApplying(false);
  };

  const submitForm = async () => {
    // final validation (step 4)
    if (!validateStep1(true) || !validateStep2(true) || !validateStep3(true) || !validateStep4(true)) {
      alert('Please check all steps for errors.');
      return;
    }
    setIsSubmitting(true);
    try {
      let cashfreeOrderId = null;

      // --- PAYMENT FLOW ---
      if (finalPrice > 0) {
        // 1. Call Backend to create Cashfree Order
        const webhookResponse = await fetch('https://primary-production-809296.up.railway.app/webhook/wf13a-create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: formData.plan,
            amount: finalPrice,
            email: formData.work_email,
            phone: formData.phone,
            name: formData.contact_name || formData.company_name
          })
        });
        const orderData = await webhookResponse.json();

        if (!webhookResponse.ok || !orderData?.success || !orderData?.payment_session_id) {
          throw new Error('Could not initialize payment session. Please try again.');
        }

        // 2. Open Cashfree Checkout Modal
        const cashfree = await load({ mode: 'production' });
        const checkoutOptions = {
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: '_modal',
        };

        const result = await cashfree.checkout(checkoutOptions);
        if (result.error) {
          throw new Error(result.error.message || 'Payment was cancelled or failed.');
        }

        cashfreeOrderId = orderData.order_id;
      }

      // --- ACCOUNT CREATION FLOW ---

      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: formData.work_email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.contact_name,
            company: formData.company_name,
          }
        }
      });

      if (authErr) throw authErr;

      // 2. Create Client record in Supabase
      const clientId = formData.company_name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);

      const { error: clientErr } = await supabase.from('Clients').insert({
        client_id: clientId,
        name: formData.company_name,
        website: formData.website,
        contact_name: formData.contact_name,
        contact_email: formData.work_email,
        phone: formData.phone,
        target_industry: formData.industry,
        plan: formData.plan,
        value_proposition: formData.value_proposition,
        onboarding_complete: true,
        status: 'active',
        auth_user_id: authData?.user?.id
      });

      if (clientErr) {
        console.error('Client creation failed, but auth succeeded:', clientErr);
      }

      // 3. Record Payment if applicable
      if (cashfreeOrderId) {
        await supabase.from('Payments').insert({
          order_id: cashfreeOrderId,
          client_id: clientId,
          amount: finalPrice,
          status: 'success'
        });
      } else if (finalPrice === 0 && discountPercent === 100) {
        await supabase.from('Payments').insert({
          order_id: 'FREE_' + clientId,
          client_id: clientId,
          amount: 0,
          status: 'success'
        });
      }

      // 4. Trigger n8n webhook
      await submitOnboarding({ ...formData, client_id: clientId });

      setSuccessClientId(clientId);
      setIsSuccess(true);
      setIsSubmitting(false);

      // Auto-redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate(`/dashboard?client=${clientId}`);
      }, 3000);

    } catch (err) {
      console.error('Submission failed:', err);
      alert('Signup failed: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const renderTag = (group, val, label) => {
    const isSelected = formData[group].includes(val);
    return (
      <div 
        className={`urgency-tag px-3 py-2 rounded-lg cursor-pointer transition-all border text-xs ${isSelected ? 'bg-[var(--purple)]/20 border-[var(--purple)] text-white' : 'bg-white/5 border-white/10 text-muted hover:border-white/20'}`} 
        onClick={() => toggleTag(group, val)}
      >
        {label || val}
      </div>
    );
  };

  return (
    <>
      <div className="signup-page contact-page">
        {/* Reuse the high-fi background pattern */}
        <div className="contact-glow" style={{ background: 'radial-gradient(circle at top, rgba(168, 85, 247, 0.15), transparent 50%)' }} />

        {/* Spinning background orb (reuses site logo) */}
        <div className="contact-orb" aria-hidden="true">
          <div className="contact-orb-inner">
            <div className="contact-orb-logo-wrap" aria-hidden="true">
              <img src="/favicon.svg" alt="" className="logo-rotator spin contact-orb-logo" />
            </div>
          </div>
        </div>

        <div className="signup-bg-text">SIGNUP</div>
        
        <div className="contact-lines">
          <div className="contact-line contact-line-1"></div>
          <div className="contact-line contact-line-2"></div>
          <div className="contact-line contact-line-3"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="signup-grid contact-grid">
            
            {/* LEFT COLUMN: BRANDING & BENEFITS */}
            <div className="signup-left contact-left mt-8">
              <div className="signup-tag contact-tag">
                <img src="/favicon.svg" alt="Orvanto" className="w-5 h-5" />
                <span>Signup Orvanto AI</span>
              </div>
              
              <h1 className="signup-title contact-title">Start your growth journey</h1>
              <p className="signup-sub contact-sub">
                Select a plan and tell us about your business. Our AI will handle the rest, from ICP research to 5-channel outreach.
              </p>

              <div className="signup-info-list contact-info-list">
                <div className="contact-info-card group">
                  <div className="contact-info-content">
                    <div className="contact-info-icon">
                      <i className="fa-solid fa-bolt-lightning text-[var(--amber)]"></i>
                    </div>
                    <div className="contact-info-text">
                      <span className="contact-info-label">Automated ICP Research</span>
                      <span className="contact-info-value">High-intent lead identification.</span>
                    </div>
                  </div>
                </div>

                <div className="contact-info-card group">
                  <div className="contact-info-content">
                    <div className="contact-info-icon">
                      <i className="fa-solid fa-layer-group text-[var(--purple)]"></i>
                    </div>
                    <div className="contact-info-text">
                      <span className="contact-info-label">5-Channel Outreach</span>
                      <span className="contact-info-value">LinkedIn, Email, SMS, & Voice.</span>
                    </div>
                  </div>
                </div>

                <div className="contact-info-card group">
                  <div className="contact-info-content">
                    <div className="contact-info-icon">
                      <i className="fa-solid fa-shield-halved text-[var(--green)]"></i>
                    </div>
                    <div className="contact-info-text">
                      <span className="contact-info-label">Risk-Free Guarantee</span>
                      <span className="contact-info-value">3 meetings or Month 2 is free.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="signup-support-row support-row">
                <div className="support-hours-badge signup-support-card">
                  <i className="fa-solid fa-lock"></i>
                  <div>
                    <strong>Secure Onboarding</strong>
                    <span>Your data is end-to-end encrypted.</span>
                  </div>
                </div>
                
                <div className="social-connect">
                  <div className="social-icon-btn"><i className="fa-brands fa-linkedin-in"></i></div>
                  <div className="social-icon-btn"><i className="fa-brands fa-x"></i></div>
                  <div className="social-icon-btn"><i className="fa-brands fa-instagram"></i></div>
                  <div className="social-icon-btn"><i className="fa-brands fa-whatsapp"></i></div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MULTI-STEP FORM */}
            <div className="signup-right contact-right">
              <div className="signup-form-card contact-form-card">
                {!isSuccess ? (
                  <>
                    <div className="signup-progress">
                      <div className={`signup-step-dot ${currentStep === 1 ? 'active' : 'done'}`}></div>
                      <div className={`signup-step-dot ${currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : ''}`}></div>
                      <div className={`signup-step-dot ${currentStep === 3 ? 'active' : currentStep > 3 ? 'done' : ''}`}></div>
                      <div className={`signup-step-dot ${currentStep === 4 ? 'active' : ''}`}></div>
                    </div>

                    {/* STEP 1 */}
                    {currentStep === 1 && (
                      <div className="animate-in fade-in duration-500">
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
                          <p className="text-muted text-sm">We'll use this to auto-generate your ICP and set up your entire pipeline.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                          <div className="field">
                            <label className="required">Company Name</label>
                            <input type="text" id="company_name" placeholder="Acme Corp" value={formData.company_name} onChange={handleInputChange} onBlur={handleBlur} />
                            {errors.company_name && <div className="text-rose-400 text-sm mt-2">{errors.company_name}</div>}
                          </div>
                          <div className="field">
                            <label className="required">Company Website</label>
                            <input type="url" id="website" placeholder="https://yourcompany.com" value={formData.website} onChange={handleInputChange} onBlur={handleBlur} />
                            {errors.website && <div className="text-rose-400 text-sm mt-2">{errors.website}</div>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="field">
                            <label className="required">Your Full Name</label>
                            <input type="text" id="contact_name" placeholder="John Smith" value={formData.contact_name} onChange={handleInputChange} onBlur={handleBlur} />
                            {errors.contact_name && <div className="text-rose-400 text-sm mt-2">{errors.contact_name}</div>}
                          </div>
                          <div className="field">
                            <label className="required">Work Email</label>
                            <input type="email" id="work_email" placeholder="john@yourcompany.com" value={formData.work_email} onChange={handleInputChange} onBlur={handleBlur} />
                            {errors.work_email && <div className="text-rose-400 text-sm mt-2">{errors.work_email}</div>}
                          </div>
                        </div>

                        <div className="field mb-8">
                          <label className="required">Create Password</label>
                          <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input type="password" id="password" className="pl-12" style={{ paddingLeft: '3rem' }} placeholder="Min. 8 characters" value={formData.password} onChange={handleInputChange} onBlur={handleBlur} />
                          </div>
                          {errors.password && <div className="text-rose-400 text-sm mt-2">{errors.password}</div>}
                        </div>

                          <div className="field">
                          <label className="required">Industry / Sector</label>
                          <select id="industry" value={formData.industry} onChange={handleInputChange} onBlur={handleBlur}>
                            <option value="">Select your industry</option>
                            <option>SaaS</option><option>Professional Services</option><option>Consulting</option>
                            <option>Agency</option><option>Finance</option><option>Healthcare</option>
                            <option>Tech</option><option>Other</option>
                          </select>
                          {errors.industry && <div className="text-rose-400 text-sm mt-2">{errors.industry}</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="field">
                            <label className="required">Phone Number</label>
                            <input type="tel" id="phone" placeholder="+1 555 000 0000" value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} />
                            {errors.phone && <div className="text-rose-400 text-sm mt-2">{errors.phone}</div>}
                          </div>
                          <div className="field">
                            <label className="required">Company Size</label>
                            <select id="company_size" value={formData.company_size} onChange={handleInputChange} onBlur={handleBlur}>
                              <option value="">Select company size</option>
                              <option>1–10</option><option>11–50</option><option>51–200</option><option>201–500</option><option>500+</option>
                            </select>
                            {errors.company_size && <div className="text-rose-400 text-sm mt-2">{errors.company_size}</div>}
                          </div>
                        </div>

                          <div className="field">
                          <label className="required">Countries you operate in</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {renderTag('countries', 'United States', (<><img src="https://flagcdn.com/24x18/us.png" alt="United States" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />United States</>))}
                            {renderTag('countries', 'United Kingdom', (<><img src="https://flagcdn.com/24x18/gb.png" alt="United Kingdom" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />United Kingdom</>))}
                            {renderTag('countries', 'India', (<><img src="https://flagcdn.com/24x18/in.png" alt="India" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />India</>))}
                            {renderTag('countries', 'UAE', (<><img src="https://flagcdn.com/24x18/ae.png" alt="UAE" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />UAE</>))}
                            {renderTag('countries', 'Australia', (<><img src="https://flagcdn.com/24x18/au.png" alt="Australia" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />Australia</>))}
                            {renderTag('countries', 'Canada', (<><img src="https://flagcdn.com/24x18/ca.png" alt="Canada" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />Canada</>))}
                            {renderTag('countries', 'Singapore', (<><img src="https://flagcdn.com/24x18/sg.png" alt="Singapore" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />Singapore</>))}
                            {renderTag('countries', 'Europe', (<><img src="https://flagcdn.com/24x18/eu.png" alt="Europe" className="inline-block w-5 h-3 mr-2 rounded-sm object-cover" />Europe</>))}
                            {renderTag('countries', 'Global', (<><FiGlobe className="inline-block w-4 h-4 mr-2 text-muted" />Global</>))}
                          </div>
                          {errors.countries && <div className="text-rose-400 text-sm mt-2">{errors.countries}</div>}
                        </div>

                        <button className="btn-submit-new" onClick={() => nextStep(2)} disabled={!validateStep1(false)} aria-disabled={!validateStep1(false)}>Continue →</button>
                      </div>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                      <div className="animate-in fade-in duration-500">
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold mb-2">Your ideal customer</h2>
                          <p className="text-muted text-sm">The more specific, the better your results. Our AI will refine this further.</p>
                        </div>

                        <div className="field">
                          <label className="required">What problem do you solve?</label>
                          <textarea id="problem_solved" value={formData.problem_solved} onChange={handleInputChange} onBlur={handleBlur} placeholder="We help SaaS companies reduce churn..." className="min-h-[100px]"></textarea>
                          {errors.problem_solved && <div className="text-rose-400 text-sm mt-2">{errors.problem_solved}</div>}
                        </div>

                        <div className="field">
                          <label className="required">Ideal job titles to target</label>
                          <input type="text" id="ideal_job_titles" value={formData.ideal_job_titles} onChange={handleInputChange} onBlur={handleBlur} placeholder="VP Sales, Head of Revenue..." />
                          {errors.ideal_job_titles && <div className="text-rose-400 text-sm mt-2">{errors.ideal_job_titles}</div>}
                        </div>

                        <div className="field">
                          <label className="required">Industries you target</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['SaaS','Consulting','Finance','Healthcare','Legal','Agency','Real Estate','Professional Services','Technology','Manufacturing'].map(val => (
                              <div key={val}>{renderTag('target_industries', val)}</div>
                            ))}
                          </div>
                          {errors.target_industries && <div className="text-rose-400 text-sm mt-2">{errors.target_industries}</div>}
                        </div>

                        <div className="field">
                          <label className="required">Target company sizes</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['1-10','11-50','51-200','201-500','500+'].map(val => (
                              <div key={val}>{renderTag('target_company_sizes', val)}</div>
                            ))}
                          </div>
                          {errors.target_company_sizes && <div className="text-rose-400 text-sm mt-2">{errors.target_company_sizes}</div>}
                        </div>

                        <div className="field">
                          <label className="required">Target geographies</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['North America','Europe','Asia Pacific','Middle East','India','UK','Australia','Global'].map(val => (
                              <div key={val}>{renderTag('target_geographies', val)}</div>
                            ))}
                          </div>
                          {errors.target_geographies && <div className="text-rose-400 text-sm mt-2">{errors.target_geographies}</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-0">
                          <div className="field">
                            <label className="required">Unique selling point</label>
                            <textarea id="unique_selling_point" value={formData.unique_selling_point} onChange={handleInputChange} onBlur={handleBlur} placeholder="Unlike [competitor], we..." className="min-h-[80px]"></textarea>
                            {errors.unique_selling_point && <div className="text-rose-400 text-sm mt-2">{errors.unique_selling_point}</div>}
                          </div>
                          <div className="field">
                            <label className="required">What makes you different?</label>
                            <textarea id="different" value={formData.different} onChange={handleInputChange} onBlur={handleBlur} placeholder="We're the only company that..." className="min-h-[80px]"></textarea>
                            {errors.different && <div className="text-rose-400 text-sm mt-2">{errors.different}</div>}
                          </div>
                        </div>

                        <div className="field">
                          <label className="required">Main competitors (comma separated)</label>
                          <input type="text" id="competitor_names" value={formData.competitor_names} onChange={handleInputChange} onBlur={handleBlur} placeholder="Competitor A, Competitor B, Competitor C" />
                          {errors.competitor_names && <div className="text-rose-400 text-sm mt-2">{errors.competitor_names}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                          <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-muted hover:bg-white/10 transition-all" onClick={() => prevStep(1)}>← Back</button>
                          <button className="btn-submit-new !mt-0" onClick={() => nextStep(3)} disabled={!validateStep2(false)} aria-disabled={!validateStep2(false)}>Continue →</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                      <div className="animate-in fade-in duration-500">
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold mb-2">Your offer and goal</h2>
                          <p className="text-muted text-sm">This tells our AI exactly how to position you in every outreach message.</p>
                        </div>

                        <div className="field">
                          <label className="required">Value proposition in one sentence</label>
                          <input type="text" id="value_proposition" value={formData.value_proposition} onChange={handleInputChange} onBlur={handleBlur} placeholder="We help [ICP] achieve [result]..." />
                          {errors.value_proposition && <div className="text-rose-400 text-sm mt-2">{errors.value_proposition}</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-0">
                          <div className="field">
                            <label className="required">Average deal value ($)</label>
                            <input type="number" id="average_deal_value" value={formData.average_deal_value} onChange={handleInputChange} onBlur={handleBlur} placeholder="5000" />
                            {errors.average_deal_value && <div className="text-rose-400 text-sm mt-2">{errors.average_deal_value}</div>}
                          </div>
                          <div className="field">
                            <label className="required">Sales cycle length</label>
                            <select id="sales_cycle" value={formData.sales_cycle} onChange={handleInputChange} onBlur={handleBlur}>
                              <option value="">Select sales cycle</option>
                              <option>1–4 weeks</option><option>1–3 months</option><option>3–6 months</option>
                            </select>
                            {errors.sales_cycle && <div className="text-rose-400 text-sm mt-2">{errors.sales_cycle}</div>}
                          </div>
                        </div>

                        <div className="field">
                          <label className="required">Your Cal.com booking link</label>
                          <input type="url" id="cal_booking_link" value={formData.cal_booking_link} onChange={handleInputChange} onBlur={handleBlur} placeholder="https://cal.com/yourname/discovery" />
                          {errors.cal_booking_link && <div className="text-rose-400 text-sm mt-2">{errors.cal_booking_link}</div>}
                          <small className="text-muted text-[0.75rem] mt-2 block">Don't have one? <a href="https://cal.com" target="_blank" rel="noreferrer" className="text-[var(--purple)] hover:underline">Create a free Cal.com account →</a></small>
                        </div>

                        <div className="field">
                          <label className="required">How did you hear about us?</label>
                          <select id="referral_source" value={formData.referral_source} onChange={handleInputChange} onBlur={handleBlur}>
                            <option value="">Select source</option>
                            <option>Google Search</option><option>LinkedIn</option><option>Referral</option>
                            <option>Twitter / X</option><option>YouTube</option><option>Podcast</option><option>Other</option>
                          </select>
                          {errors.referral_source && <div className="text-rose-400 text-sm mt-2">{errors.referral_source}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                          <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-muted hover:bg-white/10 transition-all" onClick={() => prevStep(2)}>← Back</button>
                          <button className="btn-submit-new !mt-0" onClick={() => nextStep(4)} disabled={!validateStep3(false)} aria-disabled={!validateStep3(false)}>Continue →</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4 */}
                    {currentStep === 4 && (
                      <div className="animate-in fade-in duration-500">
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
                          <p className="text-muted text-sm">7-day free trial. You are charged on Day 8. Cancel anytime.</p>
                        </div>

                        <div className="plan-grid-new">
                          <div className={`plan-card-new ${formData.plan === 'starter' ? 'selected' : ''}`} onClick={() => selectPlan('starter')}>
                            <h3>Starter</h3>
                            <div className="price">$597<sub>/mo</sub></div>
                            <p>50 leads/day • 1 ICP</p>
                          </div>
                          <div className={`plan-card-new ${formData.plan === 'growth' ? 'selected' : ''}`} onClick={() => selectPlan('growth')}>
                            <div className="popular-badge-new">POPULAR</div>
                            <h3>Growth</h3>
                            <div className="price">$997<sub>/mo</sub></div>
                            <p>100 leads/day • 5 Channels</p>
                          </div>
                          <div className={`plan-card-new ${formData.plan === 'pro' ? 'selected' : ''}`} onClick={() => selectPlan('pro')}>
                            <h3>Pro</h3>
                            <div className="price">$1,997<sub>/mo</sub></div>
                            <p>200 leads/day • Deal Coach</p>
                          </div>
                        </div>
                        {errors.plan && <div className="text-rose-400 text-sm mt-2">{errors.plan}</div>}

                        <div className="guarantee-box-new flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <i className="fa-solid fa-shield-halved text-[var(--green)]"></i>
                            <span className="text-sm"><strong className="text-[var(--green)]">Meeting Guarantee:</strong> 3 meetings in 30 days or month 2 is free.</span>
                          </div>
                          <div className="flex items-center gap-3 pl-0">
                            <i className="fa-solid fa-clock-rotate-left text-muted text-xs"></i>
                            <span className="text-xs">Cancel before Day 8 and you pay <strong className="text-white">$0</strong>.</span>
                          </div>
                        </div>

                        <div className="field">
                          <label>Have a coupon code?</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Enter code" 
                              value={couponCode} 
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="!mb-0 uppercase"
                            />
                            <button 
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-semibold"
                              onClick={handleApplyCoupon}
                              disabled={isCouponApplying}
                            >
                              {isCouponApplying ? '...' : 'Apply'}
                            </button>
                          </div>
                          {couponMessage && (
                            <div className={`text-sm mt-2 ${discountPercent > 0 ? 'text-[var(--green)]' : 'text-rose-400'}`}>
                              {couponMessage}
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex justify-between items-center mt-6">
                          <div>
                            <div className="text-sm text-muted">Total Due Today</div>
                            {discountPercent > 0 && <div className="text-xs text-[var(--green)]">({discountPercent}% off applied)</div>}
                          </div>
                          <div className="text-2xl font-bold">${finalPrice}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                          <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-muted hover:bg-white/10 transition-all" onClick={() => prevStep(3)}>← Back</button>
                          <button className="btn-submit-new !mt-0" onClick={submitForm} disabled={!validateStep4(false) || isSubmitting} aria-disabled={!validateStep4(false) || isSubmitting}>
                            {isSubmitting ? 'Starting...' : 'Start Trial →'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* SUCCESS SCREEN */
                  <div className="contact-success animate-in fade-in duration-500">
                    <span className="contact-success-icon"></span>
                    <h2 className="text-2xl font-bold mb-4">🎉 Pipeline initiated!</h2>
                    <p className="text-muted leading-relaxed mb-8">
                      Welcome aboard! Your account is set up for <strong>{formData.work_email}</strong>.<br/>
                      Redirecting you to your dashboard in 3 seconds...
                    </p>
                    <div className="flex flex-col gap-3 text-left max-w-sm mx-auto mb-8">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
                        <span className="text-muted mr-2">Step 1:</span> Welcome & Roadmap
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
                        <span className="text-muted mr-2">Step 2:</span> Live Dashboard Access
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
                        <span className="text-muted mr-2">Step 3:</span> AI Outreach Begins
                      </div>
                    </div>
                    <button
                      className="btn-submit-new inline-block mt-2"
                      onClick={() => navigate(`/dashboard?client=${successClientId}`)}
                    >
                      Go to Dashboard →
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
