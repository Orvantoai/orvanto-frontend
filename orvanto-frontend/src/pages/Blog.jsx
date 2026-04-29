// Navbar moved to App.jsx (rendered globally)
import { useEffect, useRef } from 'react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import blogs from '../data/blogs.json';

// Helper to extract meta info from raw HTML strings in blogs.json
const getBlogMeta = (slug, html) => {
  // Simple extraction for listing - in a real app these would be separate fields
  const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
  const tagMatch = html.match(/<span className="tag">(.*?)<\/span>/);
  const excerptMatch = html.match(/<p>(.*?)<\/p>/);
  
  return {
    slug,
    title: titleMatch ? titleMatch[1] : 'Untitled Post',
    tag: tagMatch ? tagMatch[1] : 'Insight',
    excerpt: excerptMatch ? excerptMatch[1].substring(0, 120) + '...' : 'Dive into our latest thoughts and strategies on AI-powered sales outreach.'
  };
};

const BLOG_POSTS = Object.entries(blogs).map(([slug, html]) => getBlogMeta(slug, html));

export default function Blog() {
  const counterRowRef = useRef(null);

  // Animated counter (same as About page)
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
        <section className="relative w-full pt-32 pb-24 overflow-hidden">

          {/* Ambient blobs */}
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[var(--purple)]/10 blur-[130px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[var(--emerald)]/8 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* LEFT — Content */}
              <div className="flex flex-col items-start">

                {/* Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-8">
                  <img src="/favicon.svg" alt="Orvanto" className="w-4 h-4" />
                  <span className="text-white/60 text-xs font-semibold tracking-wide">Our Blog</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-[60px] font-semibold text-white tracking-tight leading-[1.05] mb-8">
                  Insights for the{' '}
                  <span className="bg-gradient-to-r from-[var(--purple)] to-indigo-400 bg-clip-text text-transparent">
                    AI-First Sales Leader.
                  </span>
                </h1>

                <p className="text-[#a1a1aa] text-[15px] md:text-base leading-relaxed mb-8">
                  Stay ahead with data-driven strategies, deep-dives into deliverability, and actionable insights on how AI is fundamentally rewriting the B2B outbound playbook.
                </p>

                <p className="text-[#a1a1aa] text-[15px] md:text-base leading-relaxed mb-8">
                  We don't just write about theory. Every post is backed by data from over 10,000 campaigns run on the Orvanto AI platform. We share what's working right now, so you can scale your pipeline with confidence.
                </p>

                <div className="flex flex-row gap-4 flex-wrap mt-2">
                  <a href="#posts" className="px-7 py-3 rounded-full bg-[var(--purple)] hover:bg-[#9333ea] text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                    Explore Articles
                  </a>
                </div>
              </div>

              {/* RIGHT — Image */}
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[580px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group">
                {/* Overlay gradient on image */}
                <div className="absolute inset-0 bg-gradient-to-tl from-[var(--purple)]/20 via-transparent to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b]/60 z-10 pointer-events-none"></div>
                <img
                  src="/blogimg.png"
                  alt="Orvanto Blog"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #1a1428 0%, #111116 100%)';
                  }}
                />
                {/* Glowing corner accent */}
                
              </div>

            </div>
          </div>
        </section>

        {/* ───────── STATS BAR ───────── */}
        {/* Gradient Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

       

        {/* ───────── BLOG POSTS ───────── */}
        {/* Gradient Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <section id="posts" className="relative w-full py-28 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] bg-[var(--purple)]/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] w-fit mx-auto mb-5">
                <span className="text-white/60 text-xs font-semibold tracking-wide">Latest Articles</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-[48px] font-semibold text-white tracking-tight leading-tight">
                Master the art of<br />
                <span className="bg-gradient-to-r from-[var(--purple)] to-indigo-400 bg-clip-text text-transparent">AI sales outreach</span>
              </h2>
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BLOG_POSTS.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group relative rounded-[1.5rem] bg-[#111116]/60 backdrop-blur-md border border-white/5 p-8 flex flex-col gap-5 hover:-translate-y-1 hover:border-white/10 transition-all duration-300 overflow-hidden"
                >
                  {/* Top edge hover glow */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--purple)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[var(--purple)] text-[10px] font-bold uppercase tracking-widest">{post.tag}</span>
                    <h3 className="text-xl font-semibold text-white leading-tight group-hover:text-[var(--purple)] transition-colors line-clamp-2">{post.title}</h3>
                  </div>
                  
                  <p className="text-[#a1a1aa] text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-4 flex items-center text-white/50 text-xs font-medium group-hover:text-white transition-colors">
                    Read Article <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── BOTTOM CTA STRIP ───────── */}
        {/* Gradient Divider */}
        {/* ───────── 1st COUNTER (Primary Stats) ───────── */}
        {/* ───────── 2nd COUNTER (Numbers That Matter) ───────── */}
          <div className="mt-24 mb-16">
            <div className="flex items-center gap-3 mb-8">
               <div className="h-px flex-1 bg-white/10"></div>
               <h2 className="text-2xl font-semibold text-white tracking-tight px-4">The Numbers That Matter</h2>
               <div className="h-px flex-1 bg-white/10"></div>
            </div>
            <p className="text-[#a1a1aa] text-center mb-12 max-w-2xl mx-auto">
              Based on 10,000+ campaigns run through the Orvanto AI platform, here's what we see when comparing generic vs. AI-personalised outreach:
            </p>
            <div className="container mx-auto px-6 max-w-7xl">
          <div className="counter-row">
            <div className="counter"><div className="num" data-target="4.8x">4.8x</div><div className="label">Higher ROI than paid social</div></div>
            <div className="counter"><div className="num" data-target="$42">$42</div><div className="label">Return per $1 spent</div></div>
            <div className="counter"><div className="num" data-target="347B">347B</div><div className="label">Emails sent daily in 2025</div></div>
          </div>
        </div>
            <div className="counter-row bg-[#111116]/40 backdrop-blur-md rounded-[2rem] ">
              
              <div className="counter">
                <div className="num" data-target="11.4%">11.4%</div>
                <div className="label">AI-personalised reply rate</div></div>
              <div className="counter">
                <div className="num" data-target="5.4x">5.4x</div>
                <div className="label">Improvement in conversion</div></div>
            </div>
          </div>

        <section className="w-full py-20">
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
