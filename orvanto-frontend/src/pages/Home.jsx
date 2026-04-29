import { useEffect, useRef, useState } from 'react';
// Navbar moved to App.jsx (rendered globally)
import AIFlowAnimation from '../components/AIFlowAnimation';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import HowItWorks from '../components/HowItWorks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faBriefcase, faChartLine, faBalanceScale, faBuilding, faStethoscope, faClock, faEnvelope, faDollarSign, faRepeat, faBullseye, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const FAQS = [
  { q: "How quickly does outreach start?", a: "We begin finding leads and warming up your email accounts immediately. Outreach emails start on Day 14 to ensure maximum deliverability." },
  { q: "Is the outreach really personalised?", a: "Yes. GPT-4o writes a unique email for every single prospect referencing their specific company, role, and situation. No templates." },
  { q: "What if I don't get 3 meetings in 30 days?", a: "Your second month is completely free. We've never had to activate this guarantee when clients provide accurate ICP information." },
  { q: "Do prospects know this is automated?", a: "No. All outreach is signed as you or your company. Every email comes from your domain. Orvanto AI is completely invisible." },
  { q: "What industries does it work for?", a: "Any B2B industry with decision-makers who have email and LinkedIn. We've generated results for SaaS, consulting, professional services, and more." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel before Day 8 and you pay nothing. After Day 8, cancel anytime with 30 days notice. No annual contracts required." },
  { q: "What do I need to provide?", a: "Just 10 minutes to fill our onboarding form. We need your website, your ICP, and your Cal.com booking link. Our AI handles the rest." },
  { q: "How many leads per day?", a: "Starter: 50/day. Growth: 100/day. Pro: 200/day. All leads are verified and checked against your ICP before being contacted." },
  { q: "Do you handle GDPR compliance?", a: "Yes. Every email includes an unsubscribe link. Opt-outs are processed immediately. We follow all applicable regulations." },
  { q: "What happens after a meeting?", a: "Orvanto AI sends the follow-up email automatically within 1 hour. If the deal stalls, a multi-stage follow-up sequence runs for 21 days." },
];

export default function Home() {
  const heroRef = useRef(null);
  const [selectedPlan, setSelectedPlan] = useState('growth');


  // Hero in-view observer for heading reveal
  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) node.classList.add('in-view');
        else node.classList.remove('in-view');
      });
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Generic reveal observer for any section with `data-reveal`
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('section[data-reveal]'));
    if (!targets.length) return;
    const timersByEl = new Map();
    const exitTimeoutsByEl = new Map();

    const clearTimersFor = (el) => {
      const ids = timersByEl.get(el) || [];
      ids.forEach(id => clearTimeout(id));
      timersByEl.delete(el);
    };

    const isMostlyInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return rect.top <= vh * 0.85 && rect.bottom >= vh * 0.15;
    };

    const scheduleReveal = (el) => {
      if (!el) return;
      if (el.dataset.revealed === 'true' && el.dataset.reveal !== 'channels' && el.dataset.reveal !== 'features' && el.dataset.reveal !== 'transform') return;

      // cancel any pending exit debounce
      const pendingExit = exitTimeoutsByEl.get(el);
      if (pendingExit) { clearTimeout(pendingExit); exitTimeoutsByEl.delete(el); }

      // make the section-level `in-view` active early so CSS delay rules apply
      el.classList.add('in-view');

      clearTimersFor(el);
      const animTargets = Array.from(el.querySelectorAll('[data-anim]'));

      if (el.dataset.reveal === 'problems') {
        const cards = Array.from(el.querySelectorAll('.grid-3 .card'));
        const cols = 3;
        const base = 80;
        const colDelay = 180;
        const rowDelay = 80;
        const ids = [];

        for (let idx = 0; idx < cards.length; idx++) {
          const node = cards[idx];
          if (!node) continue;
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const delay = base + col * colDelay + row * rowDelay;
          ids.push(setTimeout(() => node.classList.add('in-view'), delay));
        }

        const headerIds = [];
        const label = el.querySelector('.section-label[data-anim]');
        const title = el.querySelector('.section-title[data-anim]');
        const sub = el.querySelector('.section-sub[data-anim]');
        if (label) headerIds.push(setTimeout(() => label.classList.add('in-view'), 60));
        if (title) headerIds.push(setTimeout(() => title.classList.add('in-view'), 120));
        if (sub) headerIds.push(setTimeout(() => sub.classList.add('in-view'), 180));

        const lastIdx = Math.max(0, cards.length - 1);
        const lastRow = Math.floor(lastIdx / cols);
        const lastCol = lastIdx % cols;
        const lastDelay = base + lastCol * colDelay + lastRow * rowDelay;
        const doneId = setTimeout(() => { el.dataset.revealed = 'true'; }, lastDelay + 120);

        timersByEl.set(el, ids.concat(headerIds, doneId));
        return;
      }

      const ids = [];
      animTargets.forEach((node, i) => {
        node.classList.remove('in-view');
        ids.push(setTimeout(() => node.classList.add('in-view'), 80 + i * 80));
      });
      const lastDelay = 80 + Math.max(0, animTargets.length - 1) * 80;
      const doneId = setTimeout(() => { el.dataset.revealed = 'true'; }, lastDelay + 80);
      timersByEl.set(el, ids.concat(doneId));
    };

    const handleExit = (el) => {
      if (!el) return;
      // keep completed reveals visible (unless it's a replayable section)
      if (el.dataset.revealed === 'true' && el.dataset.reveal !== 'channels' && el.dataset.reveal !== 'features' && el.dataset.reveal !== 'transform') return;

      // debounce the exit to avoid rapid in/out races cancelling reveals
      const id = setTimeout(() => {
        if (!isMostlyInViewport(el)) {
          clearTimersFor(el);
          Array.from(el.querySelectorAll('[data-anim]')).forEach(node => node.classList.remove('in-view'));
          el.classList.remove('in-view');
        }
        exitTimeoutsByEl.delete(el);
      }, 260);

      // store exit debounce id (will be cleared if entry happens quickly)
      exitTimeoutsByEl.set(el, id);
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) scheduleReveal(el);
        else handleExit(el);
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.24 });

    targets.forEach((t) => obs.observe(t));

    const throttle = (fn, wait = 120) => {
      let last = 0, t;
      return (...args) => {
        const now = Date.now();
        if (now - last > wait) { last = now; fn(...args); }
        else { clearTimeout(t); t = setTimeout(() => { last = Date.now(); fn(...args); }, wait - (now - last)); }
      };
    };

    const checkAll = () => {
      targets.forEach(t => { if (!timersByEl.has(t) && isMostlyInViewport(t)) scheduleReveal(t); });
    };

    const onScroll = throttle(checkAll, 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    requestAnimationFrame(checkAll);

    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      timersByEl.forEach(ids => ids.forEach(id => clearTimeout(id)));
      timersByEl.clear();
      exitTimeoutsByEl.forEach(id => clearTimeout(id));
      exitTimeoutsByEl.clear();
    };
  }, []);

  return (
    <>
      {/* navbar rendered globally in App.jsx */}

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="container" style={{marginTop:90}}>
          {/* <div className="section-label">Trusted by 200+ B2B companies</div> */}
          <h1 className="hero-heading">
            <span className="hero-line">Stop Chasing Leads.</span>
            <span className="hero-line gradient-text">Start Getting Meetings.</span>
          </h1>
          <p>Orvanto AI finds your perfect prospects, writes personalised outreach, sends across 5 channels simultaneously, and books qualified meetings directly on your calendar. You do nothing until the meeting appears.</p>
          <div className="section-label">Trusted by 200+ B2B companies</div>
          <AIFlowAnimation />
          <div className="hero-ctas">
            <Link to="/signup" className="btn-primary">Get 3 Meetings in 30 Days — Free Trial →</Link>
            <a href="#how-it-works" className="btn-ghost">See how it works</a>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrapper">
        <div className="ticker">
          <div className="ticker-item ticker-item--purple">
            <FontAwesomeIcon icon={faRocket} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>SaaS</strong> — 14 meetings in 30 days</div>
          </div>
          <div className="ticker-item ticker-item--amber">
            <FontAwesomeIcon icon={faBriefcase} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>Consulting</strong> — 8 qualified calls this week</div>
          </div>
          <div className="ticker-item ticker-item--green">
            <FontAwesomeIcon icon={faChartLine} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>FinTech</strong> — $2.3M pipeline in 60 days</div>
          </div>
          <div className="ticker-item ticker-item--indigo">
            <FontAwesomeIcon icon={faBalanceScale} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>Legal Services</strong> — Closed 3 deals from Day 1</div>
          </div>
          <div className="ticker-item ticker-item--purple">
            <FontAwesomeIcon icon={faBuilding} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>B2B Agency</strong> — 22 meetings, 9 clients won</div>
          </div>
          <div className="ticker-item ticker-item--green">
            <FontAwesomeIcon icon={faStethoscope} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>HealthTech</strong> — First meeting booked in 18 days</div>
          </div>

          {/* duplicate set for seamless scroll */}
          <div className="ticker-item ticker-item--purple">
            <FontAwesomeIcon icon={faRocket} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>SaaS</strong> — 14 meetings in 30 days</div>
          </div>
          <div className="ticker-item ticker-item--amber">
            <FontAwesomeIcon icon={faBriefcase} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>Consulting</strong> — 8 qualified calls this week</div>
          </div>
          <div className="ticker-item ticker-item--green">
            <FontAwesomeIcon icon={faChartLine} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>FinTech</strong> — $2.3M pipeline in 60 days</div>
          </div>
          <div className="ticker-item ticker-item--indigo">
            <FontAwesomeIcon icon={faBalanceScale} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>Legal Services</strong> — Closed 3 deals from Day 1</div>
          </div>
          <div className="ticker-item ticker-item--purple">
            <FontAwesomeIcon icon={faBuilding} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>B2B Agency</strong> — 22 meetings, 9 clients won</div>
          </div>
          <div className="ticker-item ticker-item--green">
            <FontAwesomeIcon icon={faStethoscope} className="ticker-logo" aria-hidden="true" />
            <div className="ticker-text"><strong>HealthTech</strong> — First meeting booked in 18 days</div>
          </div>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="problems" data-reveal="problems">
        <div className="container">
          <div className="section-label" data-anim>The Problem</div>
          <h2 className="section-title" data-anim>Why most B2B sales pipelines fail</h2>
          <p className="section-sub" data-anim>You know you need more meetings. But finding prospects, writing emails, following up manually — it's a full-time job that takes time away from actually selling.</p>
          <div className="grid-3">
            <div className="card" data-anim>
              <div className="card-icon icon-purple"><FontAwesomeIcon icon={faClock} aria-hidden="true" /></div>
              <h3 className="card-title">You don't have time</h3>
              <p className="card-desc">Building a pipeline from scratch takes 4-6 hours a day. Most founders and sales leaders simply don't have that time.</p>
            </div>
            <div className="card" data-anim>
              <div className="card-icon icon-amber"><FontAwesomeIcon icon={faEnvelope} aria-hidden="true" /></div>
              <h3 className="card-title">Cold email doesn't work anymore</h3>
              <p className="card-desc">Generic email blasts get 1-2% reply rates. Without personalisation and multi-channel follow-up, you're invisible.</p>
            </div>
            <div className="card" data-anim>
              <div className="card-icon icon-green"><FontAwesomeIcon icon={faDollarSign} aria-hidden="true" /></div>
              <h3 className="card-title">Sales reps are expensive</h3>
              <p className="card-desc">A good SDR costs $60-90k/year. They take 3 months to ramp up. And they quit after 18 months.</p>
            </div>
            <div className="card" data-anim>
              <div className="card-icon icon-purple"><FontAwesomeIcon icon={faRepeat} aria-hidden="true" /></div>
              <h3 className="card-title">Manual follow-up falls through</h3>
              <p className="card-desc">80% of deals require 5+ touchpoints. Nobody does that consistently. Orvanto AI does it automatically across 5 channels.</p>
            </div>
            <div className="card" data-anim>
              <div className="card-icon icon-indigo"><FontAwesomeIcon icon={faChartLine} aria-hidden="true" /></div>
              <h3 className="card-title">No visibility into what works</h3>
              <p className="card-desc">You don't know your reply rate, open rate, or which messages are converting. You're flying blind.</p>
            </div>
            <div className="card" data-anim>
              <div className="card-icon icon-purple"><FontAwesomeIcon icon={faBullseye} aria-hidden="true" /></div>
              <h3 className="card-title">Wrong targeting</h3>
              <p className="card-desc">Most companies send to the wrong people. Orvanto AI uses AI to identify your exact ICP and finds verified decision-makers daily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* FEATURES */}
      <section id="features" data-reveal="features">
        <div className="container !max-w-[1600px] px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-16 pb-12 w-full mx-auto grid-flow-row-dense">
            
            {/* The Massive Left Assymetric Typography Pillar */}
            <div className="lg:col-span-5 lg:row-span-4 flex flex-col justify-start pr-0 lg:pr-8" data-anim>
              <div className="section-label !text-left !ml-0 mb-8 max-w-max">Everything Included</div>
              <h2 className="font-medium tracking-tight text-white m-0 text-left mb-6" style={{ fontSize: 'clamp(2.8rem, 4vw, 4.2rem)', lineHeight: '1.05', letterSpacing: '-0.02em' }}>
                One platform.<br/>Everything you need to close deals.
              </h2>
              <p className="text-[var(--muted)] text-[1.1rem] leading-relaxed text-left mb-12">
                Orvanto offers a suite of intelligent automation products tailored to the unique needs of modern outbound businesses, with a particular focus on infinite scale automated funnel conversion.
              </p>

              {/* Conversion Block to Fill Vertical Void */}
              <div className="mt-auto pt-10 border-t border-white/10 flex flex-col gap-8 w-full max-w-md">
                <div className="flex items-center gap-5">
                  <div className="flex -space-x-4">
                    <img className="w-12 h-12 rounded-full border-[3px] border-[#0a0a0b] shadow-lg" src="https://i.pravatar.cc/100?img=33" alt="User" />
                    <img className="w-12 h-12 rounded-full border-[3px] border-[#0a0a0b] shadow-lg" src="https://i.pravatar.cc/100?img=47" alt="User" />
                    <img className="w-12 h-12 rounded-full border-[3px] border-[#0a0a0b] shadow-lg" src="https://i.pravatar.cc/100?img=12" alt="User" />
                    <div className="w-12 h-12 rounded-full border-[3px] border-[#0a0a0b] bg-white/10 flex items-center justify-center text-[13px] font-bold text-white shadow-lg backdrop-blur-md">
                      +2k
                    </div>
                  </div>
                  <div className="text-[14.5px] text-[var(--muted)] leading-tight">
                    Trusted by <span className="text-white font-semibold">2,000+</span> teams<br/>scaling pipeline daily.
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <button className="px-8 py-3.5 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--indigo)] text-white text-[15px] font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] border border-transparent">
                    Start Free Trial
                  </button>
                  <button className="px-8 py-3.5 rounded-full bg-white/5 text-white text-[15px] font-medium hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
                    Book a Demo
                  </button>
                </div>
              </div>
            </div>

            <div className="group flex flex-col h-full lg:col-span-3 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(52,211,153,0.15)] hover:border-emerald-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-transparent border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-robot text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors m-0">AI ICP Gen</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-emerald-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Scrapes your website and auto-builds your ideal customer profile. No manual configuration needed.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-4 lg:row-span-3 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(52,211,153,0.15)] hover:border-emerald-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-transparent border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-bullseye text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors m-0">Daily Leads</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-emerald-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Apollo.io finds 50–200 verified decision-makers daily that match your exact ICP, ensuring a consistent and high-quality lead pipeline. Each contact is enriched with accurate emails and phone numbers, automatically mapped into active arrays for seamless outreach. This eliminates manual prospecting and reduces time spent on data collection. The system keeps your pipeline fresh by continuously updating and validating contact information.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-3 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(52,211,153,0.15)] hover:border-emerald-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-transparent border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-envelope-open-text text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors m-0">AI Emails</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-emerald-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">GPT-4o writes a unique email for every single prospect referencing their company.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-4 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(52,211,153,0.15)] hover:border-emerald-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-transparent border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-comment-dots text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors m-0">Reply Intel</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-emerald-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Every reply is automatically classified into clear intent categories such as interested, not interested, or meeting request, enabling instant understanding of lead behavior without manual effort. This classification system uses contextual analysis to accurately interpret tone, keywords, and response patterns from incoming messages. As a result, sales teams can prioritize high-intent prospects, re-engage lukewarm leads, and filter out uninterested responses efficiently. </p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-7 lg:row-span-1 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(52,211,153,0.15)] hover:border-emerald-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-transparent border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-regular fa-calendar-check text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors m-0">Auto Meeting Booking</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-emerald-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Interested prospects get your Cal.com link immediately. Meetings land directly in your calendar without intervention.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-5 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)] hover:border-amber-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-brain text-xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-amber-400 transition-colors m-0">AI Deal Coach</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-amber-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Full BANT analysis, prospect research, talking points, and objection handling sent 30 min before every meeting.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-4 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)] hover:border-amber-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-user-secret text-xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-amber-400 transition-colors m-0">Competitor Intel</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-amber-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Monitors G2, Capterra, Trustpilot for unhappy competitor customers.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-3 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)] hover:border-amber-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-chart-line text-xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-amber-400 transition-colors m-0">Intent Signals</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-amber-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Detects when prospects raise funding or hire sales staff.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-6 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)] hover:border-amber-400/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-rotate text-xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-amber-400 transition-colors m-0">90-Day Nurture</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-amber-400/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Every non-interested lead gets a 3-stage nurture sequence over 90 days with different angles. Then recycled at 6 months.</p>
            </div>

            <div className="group flex flex-col h-full lg:col-span-6 lg:row-span-2 p-8 lg:p-10 rounded-[2rem] bg-[var(--card)] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] hover:border-[var(--purple)]/40 transition-all duration-300 text-left" data-anim>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--purple)]/20 to-transparent border border-[var(--purple)]/30 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-chart-pie text-xl text-[var(--purple)] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"></i>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-[var(--purple)] transition-colors m-0">Weekly Reports</h3>
              </div>
              <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-[var(--purple)]/50 transition-colors" />
              <p className="text-sm lg:text-[15px] text-[var(--muted)] leading-relaxed m-0 mt-auto">Every Monday: leads, emails, replies, meetings, pipeline value, and GPT-4o recommendations sent to your inbox.</p>
            </div>

          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
<section style={{ background: 'var(--bg)' }} data-reveal="transform" className="relative overflow-hidden py-24 scroll-mt-20">
        
        <div className="container relative z-10 max-w-[1400px]">
          <div className="text-center mb-24">
            <div className="section-label mx-auto" data-anim>Transformation</div>
            <h2 className="section-title mb-6" data-anim>Before vs. After Orvanto AI</h2>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between xl:justify-center xl:gap-[11.25rem] mt-16 lg:mt-8 w-full pb-16 px-4 lg:px-12">
            
            {/* The Swooping SVG Arrow spanning the center */}
            <svg className="absolute top-[25%] left-1/2 -translate-x-[45%] w-72 h-48 z-30 hidden lg:block drop-shadow-[0_0_25px_rgba(168,85,247,0.4)] pointer-events-none anim-arrow" data-anim viewBox="0 0 300 150" fill="none">
                <path d="M 20 130 C 50 10, 150 -10, 260 50" stroke="url(#paint_arrow)" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M 220 50 L 275 60 L 250 15" stroke="#10b981" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <defs>
                  <linearGradient id="paint_arrow" x1="20" y1="130" x2="260" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a855f7" stopOpacity="0" />
                    <stop offset="0.3" stopColor="#a855f7" />
                    <stop offset="1" stopColor="#10b981" />
                  </linearGradient>
                </defs>
            </svg>

            {/* BEFORE CARD */}
            <div className="relative w-full lg:w-[42%] lg:mt-32 z-10 anim-before" data-anim>
              {/* Floating Pill */}
              <div className="absolute -top-12 lg:-top-16 left-1/2 -translate-x-1/2 px-10 py-3 bg-white text-black rounded-full font-black text-lg shadow-[0_10px_30px_rgba(255,255,255,0.15)] z-20">
                Before
              </div>
              
              {/* Fake Browser Window Card */}
              <div className="w-full bg-[#131316] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-white/5 transition-all duration-[600ms] hover:-translate-y-4 hover:scale-[1.02] hover:shadow-[0_30px_70px_rgba(255,255,255,0.06)] hover:border-white/10 group-hover:border-white/10">
                {/* Browser Header */}
                <div className="flex items-center px-6 py-4 bg-white/[0.02] border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/80"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="mx-auto text-xs font-semibold text-white/30 tracking-widest uppercase">The Manual Era</div>
                </div>
                
                {/* Content Area */}
                <div className="p-8 lg:p-12 flex-1">
                  <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">Manual pipelines<br/><span className="text-[#a1a1aa] font-medium opacity-80">are fundamentally broken.</span></h3>
                  <div className="w-16 h-1 bg-red-500/50 mb-10 mt-8 rounded-full"></div>
                  
                  <ul className="space-y-6 text-[#a1a1aa] text-base lg:text-[1.05rem] leading-relaxed font-medium">
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-xmark text-red-500/80 mt-1.5 text-lg"></i> 
                      <span>Spending 3 hours/day manually prospecting</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-xmark text-red-500/80 mt-1.5 text-lg"></i> 
                      <span>Writing generic emails nobody replies to</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-xmark text-red-500/80 mt-1.5 text-lg"></i> 
                      <span>Chasing cold leads with no system</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-xmark text-red-500/80 mt-1.5 text-lg"></i> 
                      <span>Forgetting to follow up</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-xmark text-red-500/80 mt-1.5 text-lg"></i> 
                      <span>No idea what's working</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-xmark text-red-500/80 mt-1.5 text-lg"></i> 
                      <span>Paying $80K for an SDR who just quit</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-xmark text-red-500/80 mt-1.5 text-lg"></i> 
                      <span>Inconsistent pipeline, inconsistent revenue</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AFTER CARD */}
            <div className="relative w-full lg:w-[42%] lg:mb-32 z-20 anim-after" data-anim>
              {/* Floating Pill */}
              <div className="absolute -top-12 lg:-top-16 left-1/2 -translate-x-1/2 px-10 py-3 bg-white text-black rounded-full font-black text-lg shadow-[0_10px_30px_rgba(255,255,255,0.15)] z-20">
                After
              </div>
              
              {/* Fake Browser Window Card */}
              <div className="w-full bg-gradient-to-b from-[#18181b] to-[#09090b] border border-emerald-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(52,211,153,0.15)] overflow-hidden flex flex-col h-full relative group transition-all duration-[600ms] hover:-translate-y-4 hover:scale-[1.02] hover:shadow-[0_40px_100px_rgba(16,185,129,0.35)] hover:border-emerald-400">
                
                {/* Background Core Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>

                {/* Browser Header */}
                <div className="relative z-10 flex items-center px-6 py-4 bg-white/[0.03] border-b border-emerald-500/20">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10"></div>
                  </div>
                  <div className="mx-auto text-xs font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-2">
                    <i className="fa-solid fa-bolt"></i> <span>Orvanto Engine</span>
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="relative z-10 p-8 lg:p-12 flex-1">
                  <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">Scale infinite revenue<br/><span className="text-emerald-400">completely on autopilot.</span></h3>
                  <div className="w-16 h-1 bg-emerald-400/80 mb-10 mt-8 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                  
                  <ul className="space-y-6 text-white text-base lg:text-[1.05rem] leading-relaxed font-semibold">
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-check text-emerald-400 mt-1.5 text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"></i> 
                      <span>50-200 perfect leads found automatically every day</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-check text-emerald-400 mt-1.5 text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"></i> 
                      <span>AI emails personalised for every single prospect</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-check text-emerald-400 mt-1.5 text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"></i> 
                      <span>5-channel follow-up on autopilot</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-check text-emerald-400 mt-1.5 text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"></i> 
                      <span>Meetings appearing directly in your calendar</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-check text-emerald-400 mt-1.5 text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"></i> 
                      <span>Weekly reports showing exactly what's working</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-check text-emerald-400 mt-1.5 text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"></i> 
                      <span>Deal coaching built before every meeting</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <i className="fa-solid fa-check text-emerald-400 mt-1.5 text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"></i> 
                      <span>Predictable, scalable pipeline growth</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" data-reveal="pricing" className="relative pb-32 pt-40 overflow-hidden bg-[#09090b]">
        {/* Massive Background Logo Watermark acting as radial circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] lg:w-[130vw] lg:h-[130vw] pointer-events-none flex items-center justify-center z-0 opacity-13">
          <img 
             src="/favicon.svg" 
             alt="Orvanto Core" 
             className="w-[100%] h-[100%] opacity-[0.5] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-[spin_20s_linear_infinite]" 
          />
          {/* Radial Ring Emulations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] border-[5px] border-[var(--purple)]/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] border-[5px] border-[var(--purple)]/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-[var(--purple)]/5 rounded-full"></div>
        </div>

        <div className="container relative z-10 max-w-6xl">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white mb-6 tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent leading-tight" data-anim>
              Try It Out First, Then<br/>Choose a Strategy.
            </h2>
            <p className="text-[#a1a1aa] text-lg lg:text-xl font-medium max-w-2xl mx-auto" data-anim>
              Simple plans, simple prices. Only pay for what you really need. Change or cancel your plan at anytime
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-12 w-full mx-auto items-stretch">
            
            {/* STARTER TIER */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('starter')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedPlan('starter'); }}
              className={`tier-card relative z-10 w-full rounded-[2rem] p-8 lg:p-10 flex flex-col hover:-translate-y-2 transition-all duration-300 group ${selectedPlan === 'starter' ? 'bg-[#1a1428]/50 backdrop-blur-md border border-[var(--purple)] shadow-[0_0_60px_rgba(168,85,247,0.15)] xl:scale-105 z-10' : 'bg-[#111116]/40 backdrop-blur-md border border-white/10 shadow-xl'}`}
              data-anim
            >

              <div className={`px-4 py-1.5 rounded-full w-fit mb-8 ${selectedPlan === 'starter' ? 'bg-[var(--purple)]/20 border border-[var(--purple)]/50 text-xs font-bold text-[var(--purple)] shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/[0.04] border border-white/10 text-xs font-bold text-white/50 shadow-sm'}`}>
                {selectedPlan === 'starter' ? 'Popular Plan' : 'Starter Plan'}
              </div>
              
              <div className="mb-10">
                <h3 className="text-[44px] font-black text-white tracking-tight leading-none mb-3">$597<span className="text-2xl font-bold text-white/40 tracking-normal">/month</span></h3>
                <p className="text-sm text-white/40 font-medium">Perfect for marketers / scale up business</p>
                <div className="text-xs text-amber-500/80 font-bold mt-2">+ $3,000 setup fee</div>
              </div>
              
              <ul className="space-y-4 text-sm font-medium text-[#c0c0c0] mb-12 flex-1">
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span><strong className="text-white">50</strong> leads found per day</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>AI personalised email outreach</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Reply handling + routing</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Auto meeting booking</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Weekly performance reports</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>1 ICP</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Email channel only</span>
                </li>
              </ul>
              
              <Link to="/signup?plan=starter" className={`${selectedPlan === 'starter' ? 'relative z-10 w-full py-4 rounded-full bg-gradient-to-r from-[var(--purple)] to-indigo-600 text-white font-bold hover:scale-[1.03] transition-all text-center shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'w-full py-4 rounded-full bg-white/[0.04] text-white/60 font-bold hover:bg-white/10 hover:text-white transition-all text-center border border-white/5 hover:border-white/20 shadow-inner'}`}>
                Start Free Trial
              </Link>
            </div>

            {/* GROWTH TIER (Middle) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('growth')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedPlan('growth'); }}
              className={`tier-card relative w-full rounded-[2rem] p-8 lg:p-10 flex flex-col hover:-translate-y-2 transition-all duration-300 group ${selectedPlan === 'growth' ? 'bg-[#1a1428]/50 backdrop-blur-md border border-[var(--purple)] shadow-[0_0_60px_rgba(168,85,247,0.15)] xl:scale-105 z-10' : 'bg-[#111116]/40 backdrop-blur-md border border-white/10 p-8 lg:p-10 flex flex-col shadow-xl'}`}
              data-anim
            >
              
              {/* Inner Glow */}
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100%] h-[60%] bg-[var(--purple)]/20 blur-[80px] pointer-events-none rounded-full"></div>

              <div className={`relative z-10 px-4 py-1.5 rounded-full w-fit mb-8 ${selectedPlan === 'growth' ? 'bg-[var(--purple)]/20 border border-[var(--purple)]/50 text-xs font-bold text-[var(--purple)] shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/[0.04] border border-white/10 text-xs font-bold text-white/50 shadow-sm'}`}>{selectedPlan === 'growth' ? 'Popular Plan' : 'Growth Plan'}</div>
              
              <div className="relative z-10 mb-10">
                <h3 className="text-[44px] font-black text-white tracking-tight leading-none mb-3">$997<span className="text-2xl font-bold text-white/60 tracking-normal">/month</span></h3>
                <p className="text-sm text-white/60 font-medium">Perfect for marketers / scale up business</p>
                <div className="text-xs text-amber-500 font-bold mt-2">+ $3,000 setup fee</div>
              </div>
              
              <ul className="relative z-10 space-y-4 text-sm font-medium text-[#d4d4d8] mb-12 flex-1">
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-[var(--purple)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-0.5 text-[1.1rem]"></i> 
                  <span><strong className="text-white">100</strong> leads found per day</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-[var(--purple)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-0.5 text-[1.1rem]"></i> 
                  <span>All 5 channels (Omnichannel)</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-[var(--purple)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-0.5 text-[1.1rem]"></i> 
                  <span>Buying signal detection</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-[var(--purple)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-0.5 text-[1.1rem]"></i> 
                  <span>2 ICPs</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-[var(--purple)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-0.5 text-[1.1rem]"></i> 
                  <span>AI reply intelligence</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-[var(--purple)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-0.5 text-[1.1rem]"></i> 
                  <span>Competitor monitoring</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-[var(--purple)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-0.5 text-[1.1rem]"></i> 
                  <span className="text-white/80">Everything in Starter</span>
                </li>
              </ul>
              
              <Link to="/signup?plan=growth" className={`${selectedPlan === 'growth' ? 'relative z-10 w-full py-4 rounded-full bg-gradient-to-r from-[var(--purple)] to-indigo-600 text-white font-bold hover:scale-[1.03] transition-all text-center shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'relative z-10 w-full py-4 rounded-full bg-gradient-to-r from-[var(--purple)] to-indigo-600 text-white font-bold hover:scale-[1.03] transition-all text-center shadow-[0_0_30px_rgba(168,85,247,0.4)]'}`}>
                Start 7-days Free Trial
              </Link>
            </div>

            {/* PRO TIER */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('pro')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedPlan('pro'); }}
              className={`tier-card relative z-10 w-full rounded-[2rem] p-8 lg:p-10 flex flex-col hover:-translate-y-2 transition-all duration-300 group ${selectedPlan === 'pro' ? 'bg-[#1a1428]/50 backdrop-blur-md border border-[var(--purple)] shadow-[0_0_60px_rgba(168,85,247,0.15)] xl:scale-105 z-10' : 'bg-[#111116]/40 backdrop-blur-md border border-white/10 shadow-xl'}`}
              data-anim
            >

              <div className={`px-4 py-1.5 rounded-full w-fit mb-8 ${selectedPlan === 'pro' ? 'bg-[var(--purple)]/20 border border-[var(--purple)]/50 text-xs font-bold text-[var(--purple)] shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/[0.04] border border-white/10 text-xs font-bold text-white/50 shadow-sm'}`}>
                {selectedPlan === 'pro' ? 'Popular Plan' : 'Pro Plan'}
              </div>
              
              <div className="mb-10">
                <h3 className="text-[44px] font-black text-white tracking-tight leading-none mb-3">$1,997<span className="text-2xl font-bold text-white/40 tracking-normal">/month</span></h3>
                <p className="text-sm text-white/40 font-medium">Perfect for marketers / scale up business</p>
                <div className="text-xs text-amber-500/80 font-bold mt-2">+ $3,000 setup fee</div>
              </div>
              
              <ul className="space-y-4 text-sm font-medium text-[#c0c0c0] mb-12 flex-1">
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span><strong className="text-white">200</strong> leads found per day</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>AI Deal Coach before every meeting</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Referral automation engine</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Warm intro network</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Competitor client poaching</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Proposal automation</span>
                </li>
                <li className="flex items-start gap-4">
                  <i className="fa-solid fa-circle-check text-white/20 group-hover:text-white/40 mt-0.5 text-[1.1rem]"></i> 
                  <span>Everything in Growth</span>
                </li>
              </ul>
              
              <Link to="/signup?plan=pro" className={`${selectedPlan === 'pro' ? 'relative z-10 w-full py-4 rounded-full bg-gradient-to-r from-[var(--purple)] to-indigo-600 text-white font-bold hover:scale-[1.03] transition-all text-center shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'w-full py-4 rounded-full bg-white/[0.04] text-white/60 font-bold hover:bg-white/10 hover:text-white transition-all text-center border border-white/5 hover:border-white/20 shadow-inner'}`}>
                Start Free Trial
              </Link>
            </div>

          </div>

          <div className="relative mx-auto max-w-4xl mt-20 rounded-[2rem] bg-[#111116]/60 backdrop-blur-xl border border-emerald-500/30 p-10 md:p-14 text-center shadow-2xl z-10" data-anim>
            
            {/* Floating Shield Icon Breaking the Top Border */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
              <div className="w-12 h-12 relative flex items-center justify-center drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="var(--purple)" opacity="0.3" />
                  <path d="M12 4v16c3.8-1.1 6.5-5.2 6.5-9.5V7L12 4z" fill="var(--emerald)" opacity="0.9"/>
                  <path d="M12 4v16c-3.8-1.1-6.5-5.2-6.5-9.5V7L12 4z" fill="var(--purple)" opacity="0.9"/>
                </svg>
              </div>
            </div>

            {/* Subtle Inner Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-emerald-500/10 blur-[60px] pointer-events-none rounded-t-[2rem]"></div>
            
            <h2 className="relative z-10 text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-snug">
              3 Qualified Meetings in 30 Days<br/>
              <span className="bg-gradient-to-r from-[var(--purple)] to-indigo-500 bg-clip-text text-transparent">Or Month 2 is Completely Free</span>
            </h2>
            
            <p className="relative z-10 text-[#a1a1aa] mt-6 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
              We're so confident in our system that if you don't have 3 qualified meetings booked by Day 30, your entire second month is free. No questions asked. No fine print.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" data-reveal="faq" className="w-full bg-[#09090b] relative py-32 overflow-hidden border-t border-white/[0.02]">
        
        {/* Subtle Background Starfield or Glow */}
        <div className="absolute inset-0 bg-[#09090b] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] to-[#09090b]"></div>
        
        <div className="container relative z-10 px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-7xl mx-auto">
            
            {/* Left Column: Heading & CTA & FAQs */}
            <div className="flex flex-col items-start w-full gap-10" data-anim>
              
              <div className="w-full">
                {/* Pill Badge */}
                <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] mb-6">
                  <img src="/favicon.svg" alt="Orvanto" className="w-4 h-4" />
                  <span className="text-white/70 text-xs font-semibold tracking-wide">Orvanto best AI outreach</span>
                </div>
                
                {/* Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-[56px] font-medium text-white tracking-tight leading-[1.1] mb-20">
                  Frequently asked<br/>questions
                </h2>
                
                {/* CTA Box */}
                <div className="w-full rounded-[1.5rem] bg-[#111116]/60 backdrop-blur-xl border border-white/5 p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--purple)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <h3 className="text-2xl font-medium text-white mb-3">Still have a questions?</h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed mb-8">
                    Can't find the answer to your question? Send us an email and we'll get back to you as soon as possible!
                  </p>
                  <Link to="/contact" className="inline-block px-7 py-3 rounded-xl bg-[var(--purple)] hover:bg-[#9333ea] text-white font-medium text-sm transition-colors duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                    Send email
                  </Link>
                </div>
              </div>

              {/* Left Column FAQs (Utilizing extra space) */}
              <div className="flex flex-col gap-4 w-full">
                {FAQS.slice(8, 10).map((faq, idx) => (
                  <details key={`left-${idx}`} className="group w-full rounded-[1.2rem] bg-[#111116]/40 backdrop-blur-md border border-white/5 overflow-hidden transition-all duration-300 open:border-white/10">
                    
                    <summary className="cursor-pointer p-6 flex flex-row items-center justify-between font-medium text-white/90 list-none [&::-webkit-details-marker]:hidden hover:bg-white/[0.02] transition-colors">
                      <span className="text-[15px] md:text-base pr-6">{faq.q}</span>
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center text-[var(--purple)] group-open:bg-[var(--purple)]/20 transition-all duration-300">
                        <FontAwesomeIcon icon={faChevronDown} className="text-sm transition-transform duration-300 group-open:rotate-180" />
                      </div>
                    </summary>
                    
                    <div className="px-6 pb-6 pt-0 text-sm md:text-[15px] text-[#a1a1aa] leading-relaxed border-t border-white/[0.02]">
                      {faq.a}
                    </div>
                    
                  </details>
                ))}
              </div>
              
            </div>

            {/* Right Column: Main Accordion List */}
            <div className="flex flex-col gap-4 w-full lg:mt-0">
              {FAQS.slice(0, 8).map((faq, idx) => (
                <details key={`right-${idx}`} className="group w-full rounded-[1.2rem] bg-[#111116]/40 backdrop-blur-md border border-white/5 overflow-hidden transition-all duration-300 open:border-white/10" data-anim>
                  
                  <summary className="cursor-pointer p-6 flex flex-row items-center justify-between font-medium text-white/90 list-none [&::-webkit-details-marker]:hidden hover:bg-white/[0.02] transition-colors">
                    <span className="text-[15px] md:text-base pr-6">{faq.q}</span>
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center text-[var(--purple)] group-open:bg-[var(--purple)]/20 transition-all duration-300">
                      <FontAwesomeIcon icon={faChevronDown} className="text-sm transition-transform duration-300 group-open:rotate-180" />
                    </div>
                  </summary>
                  
                  <div className="px-6 pb-6 pt-0 text-sm md:text-[15px] text-[#a1a1aa] leading-relaxed border-t border-white/[0.02]">
                    {faq.a}
                  </div>
                  
                </details>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA Cinematic Section */}
      <section id="cta" data-reveal="cta" className="relative w-full bg-[#09090b] py-32 md:py-48 flex flex-col items-center justify-center text-center overflow-hidden border-t border-white/[0.02]">
        
        {/* Massive Ambient Core Glows (Theme Colors) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[var(--purple)]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-[var(--emerald)]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
        
        <div className="container relative z-10 px-6 mx-auto flex flex-col items-center">
          
          {/* Floating Massive Logo */}
          <img 
            src="/favicon.svg" 
            alt="Orvanto Core" 
            className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-10 relative z-10 drop-shadow-[0_0_50px_rgba(168,85,247,0.7)] animate-[spin_20s_linear_infinite] opacity-80" 
            data-anim 
          />

          {/* Typography */}
          <h2 className="text-[36px] md:text-5xl lg:text-[64px] font-medium text-white tracking-tight leading-[1.05] max-w-4xl mx-auto mb-6 drop-shadow-lg" data-anim>
            Orvanto AI:<br/>
            Your next client is already out there.<br/>
            <span className="text-white/90">We'll find them for you.</span>
          </h2>
          
          <p className="text-[#a1a1aa] text-sm md:text-[15px] max-w-xl mx-auto mb-10 leading-relaxed" data-anim>
            Start your free 7-day trial today. No charge until Day 8.<br/>Cancel before then and you pay nothing.
          </p>
          
          {/* Action Buttons precisely modeled on reference hierarchy */}
          <div className="flex flex-row items-center justify-center gap-6 md:gap-8" data-anim>
            <Link to="/signup" className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]">
              Start Free Trial
            </Link>
            <Link to="/contact" className="text-white/70 hover:text-white font-medium text-sm transition-colors flex items-center gap-2 group">
              Talk to us first <span className="text-white/40 group-hover:text-white/80 transition-colors">&gt;</span>
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
