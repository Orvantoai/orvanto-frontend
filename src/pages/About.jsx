// Navbar moved to App.jsx (rendered globally)
import { useEffect, useRef } from 'react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faEnvelope, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const TEAM = [
  {
    icon: faBrain,
    color: 'var(--purple)',
    bg: 'rgba(168,85,247,0.12)',
    title: 'AI & Automation',
    desc: 'Workflow engineers who\'ve processed millions of B2B touchpoints across 50+ industries.',
  },
  {
    icon: faEnvelope,
    color: 'var(--emerald)',
    bg: 'rgba(16,185,129,0.12)',
    title: 'Deliverability Experts',
    desc: 'Email specialists who ensure 95%+ inbox rates across all major email providers.',
  },
  {
    icon: faBriefcase,
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.12)',
    title: 'B2B Sales Veterans',
    desc: 'Former heads of sales and CROs who understand what actually converts in real B2B deals.',
  },
];

const STATS = [
  { value: '12,400+', label: 'Meetings Booked' },
  { value: '200+', label: 'Active Clients' },
  { value: '4.1x', label: 'Avg Reply Rate Lift' },
  { value: '$48M+', label: 'Pipeline Generated' },
];

export default function About() {
  const counterRowRef = useRef(null);

  // Animated counter (same as Home page)
  useEffect(() => {
    const row = counterRowRef.current;
    if (!row) return;

    const nums = row.querySelectorAll('.counter .num');

    const runCounters = () => {
      nums.forEach((el) => {
        const target = el.dataset.target || el.textContent || '';
        const numeric = parseFloat(target.replace(/[^0-9.]/g, '')) || 0;

        if (target.includes('%')) el.textContent = '0%';
        else if (target.includes('+')) el.textContent = '0+';
        else if (target.toLowerCase().includes('x') || target.includes('.')) el.textContent = '0.0x';
        else el.textContent = '0';

        let start = null;
        const duration = 800;

        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * numeric;

          if (target.includes('.') || target.toLowerCase().includes('x')) {
            el.textContent = current.toFixed(1) + 'x';
          } else if (target.includes('%')) {
            el.textContent = Math.round(current) + '%';
          } else if (target.includes('+')) {
            el.textContent = Math.round(current).toLocaleString() + '+';
          } else if (target.includes('$')) {
            el.textContent = '$' + Math.round(current) + 'M+';
          } else {
            el.textContent = Math.round(current).toLocaleString();
          }

          if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) runCounters();
      });
    }, { threshold: 0.35 });

    observer.observe(row);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">

        {/* ───────── HERO SPLIT ───────── */}
        <section className="about-hero-section relative w-full pt-32 pb-24 overflow-hidden">

          {/* Ambient blobs */}
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[var(--purple)]/10 blur-[130px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[var(--emerald)]/8 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-7xl">
            <div className="about-hero-grid grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* LEFT — Content */}
              <div className="flex flex-col items-start">

                {/* Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-8">
                  <img src="/favicon.svg" alt="Orvanto" className="w-4 h-4" />
                  <span className="text-white/60 text-xs font-semibold tracking-wide">Our Story</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-[60px] font-semibold text-white tracking-tight leading-[1.05] mb-8">
                  We built the system we{' '}
                  <span className="bg-gradient-to-r from-[var(--purple)] to-indigo-400 bg-clip-text text-transparent">
                    wished existed.
                  </span>
                </h1>

                <p className="text-[#a1a1aa] text-[15px] md:text-base leading-relaxed mb-5">
                  Orvanto AI was born from frustration. We were spending thousands on SDRs and agencies getting mediocre results. High churn, generic messaging, and zero accountability. We decided to build something better — and then make it available to everyone.
                </p>
                <p className="text-[#a1a1aa] text-[15px] md:text-base leading-relaxed mb-8">
                  We spent 18 months testing every approach — email sequences, LinkedIn automation, cold calling, WhatsApp. We discovered that no single channel wins alone. The companies getting consistent pipeline were doing all of them, simultaneously, with precision timing and hyper-personalized copy. We built Orvanto to do exactly that — at a fraction of the cost of a human team.
                </p>

                <h2 className="text-lg font-semibold text-white mb-3">Our Mission</h2>
                <p className="text-[#a1a1aa] text-[15px] md:text-base leading-relaxed mb-4">
                  Every B2B company deserves a world-class sales machine, regardless of their budget. We believe AI can level the playing field — giving a 3-person startup the same outbound capability as a 50-person sales team.
                </p>
                <p className="text-[#a1a1aa] text-[15px] md:text-base leading-relaxed mb-4">
                  Most early-stage founders are incredible at their craft — but selling is a different skill, and building a sales team takes time and capital most startups don't have. Orvanto bridges that gap. You get enterprise-grade outbound from day one, without the enterprise budget.
                </p>
                <p className="text-[#a1a1aa] text-[15px] md:text-base leading-relaxed mb-10">
                  Orvanto AI is not just a tool. It's a complete done-for-you system. We handle everything from finding prospects to booking meetings to preparing you for every call. Your only job is to show up and close.
                </p>

                <div className="about-hero-ctas flex flex-row gap-4 flex-wrap">
                  <Link
                    to="/signup"
                    className="px-7 py-3 rounded-full bg-[var(--purple)] hover:bg-[#9333ea] text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    to="/contact"
                    className="px-7 py-3 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/80 hover:text-white font-semibold text-sm transition-all duration-300"
                  >
                    Talk to us
                  </Link>
                </div>
              </div>

              {/* RIGHT — Image + Why section */}
              <div className="flex flex-col gap-8">

                {/* Image */}
                <div className="about-hero-image relative w-full h-[450px] md:h-[520px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group">
                  {/* Overlay gradient on image */}
                  <div className="absolute inset-0 bg-gradient-to-tl from-[var(--purple)]/20 via-transparent to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b]/60 z-10 pointer-events-none"></div>
                  <img
                    src="/aboutimg.png"
                    alt="Orvanto Team"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #1a1428 0%, #111116 100%)';
                    }}
                  />
                  
                </div>

                {/* Why we built it this way */}
                <div className="about-why-box rounded-[1.5rem] bg-[#111116]/40 backdrop-blur-md border border-white/5 p-8 flex flex-col gap-4">
                  <h2 className="text-lg font-semibold text-white">Why we built it this way</h2>
                  <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                    Most outreach tools give you a platform and leave you to figure out how to use it. You still need to know what to write, who to target, how often to follow up. You still need to hire someone to run it.
                  </p>
                  <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                    We wanted to eliminate that entirely. Orvanto AI is the only platform where you sign up, connect your calendar, and receive meetings. Everything in between — lead generation, email writing, multi-channel follow-up, reply handling, meeting prep — is handled automatically by AI.
                  </p>
                  <p className="text-white font-medium text-[15px] leading-relaxed">
                    We built it because we use it ourselves. Every client that comes to Orvanto AI arrives because Orvanto AI found them, wrote to them, and booked the meeting. We're our own best case study.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ───────── STATS BAR ───────── */}
        {/* Gradient Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <section className="w-full py-12 bg-[#0c0c11]">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="counter-row" ref={counterRowRef}>
              <div className="counter"><div className="num" data-target="12,400+">12,400+</div><div className="label">Meetings Booked</div></div>
              <div className="counter"><div className="num" data-target="200+">200+</div><div className="label">Active Clients</div></div>
              <div className="counter"><div className="num" data-target="4.1x">4.1x</div><div className="label">Avg Reply Rate Lift</div></div>
              <div className="counter"><div className="num" data-target="$48M+">$48M+</div><div className="label">Pipeline Generated</div></div>
            </div>
          </div>
        </section>

        {/* ───────── PHILOSOPHY ───────── */}
        {/* Gradient Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <section className="team-section relative w-full py-28 overflow-hidden">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] bg-[var(--purple)]/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-7xl">

            {/* Section heading */}
            <div className="text-center mb-16">
              <div className="team-badge flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] w-fit mx-auto mb-5">
                <span className="text-white/60 text-xs font-semibold tracking-wide">The team</span>
              </div>
              <h2 className="team-heading text-3xl md:text-4xl lg:text-[48px] font-semibold text-white tracking-tight leading-tight">
                We're a small team of engineers,<br />
                <span className="bg-gradient-to-r from-[var(--purple)] to-indigo-400 bg-clip-text text-transparent">sales veterans & AI specialists</span>
              </h2>
              <p className="team-subheading text-[#a1a1aa] text-sm md:text-[15px] mt-4 max-w-2xl mx-auto leading-relaxed">
                Based across the UK, India, and UAE — obsessed with making B2B sales work better for everyone.
              </p>
            </div>

            {/* Cards */}
            <div className="team-cards grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEAM.map((item, i) => (
                <div
                  key={i}
                  className="team-card relative rounded-[1.5rem] bg-[#111116]/60 backdrop-blur-md border border-white/5 p-8 flex flex-col gap-4 hover:-translate-y-1 hover:border-white/10 transition-all duration-300 group overflow-hidden"
                >
                  {/* Top edge hover glow */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--purple)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Icon + Title inline row */}
                  <div className="flex items-center gap-4">
                    <div
                      className="team-card-icon flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: item.bg }}
                    >
                      <FontAwesomeIcon icon={item.icon} style={{ color: item.color }} className="text-lg" />
                    </div>
                    <h3 className="text-base font-semibold text-white leading-snug">{item.title}</h3>
                  </div>

                  <p className="text-[#a1a1aa] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── BOTTOM CTA STRIP ───────── */}
        {/* Gradient Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--purple)]/20 to-transparent"></div>

        <section className="about-cta-section w-full py-20">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
              Ready to see it <span className="bg-gradient-to-r from-[var(--purple)] to-indigo-400 bg-clip-text text-transparent">work for you?</span>
            </h2>
            <p className="text-[#a1a1aa] text-sm md:text-[15px] mb-8 leading-relaxed">
              Start your free 7-day trial. No charge until Day 8. 3 meetings in 30 days or your second month is completely free.
            </p>
            <Link
              to="/signup"
              className="inline-block px-9 py-4 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
            >
              Start Free Trial →
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
