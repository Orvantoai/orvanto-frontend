import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Footer from '../components/Footer';
import blogs from '../data/blogs.json';
import { Link } from 'react-router-dom';

/**
 * Utility to parse the raw HTML strings from blogs.json into 
 * structured segments for the redesigned template.
 */
const parseBlogPost = (html) => {
  if (!html) return null;

  const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : 'Untitled Article';

  const tagMatch = html.match(/<span className="tag">(.*?)<\/span>/);
  const tag = tagMatch ? tagMatch[1] : 'Insight';

  const paragraphs = html.match(/<p>(.*?)<\/p>/gs) || [];
  const intro = paragraphs.slice(0, 2).join('\n');

  let body = html
    .replace(/<div className="breadcrumb">.*?<\/div>/gs, '')
    .replace(/<span className="tag">.*?<\/span>/gs, '')
    .replace(/<h1>.*?<\/h1>/gs, '')
    .replace(/<div className="meta">.*?<\/div>/gs, '')
    .replace(/<div className="stat-row">.*?<\/div>/gs, '') // Global strip of all original stat rows
    .replace(/<div className="cta-box">.*?<\/div>/gs, ''); // Strip the original CTA box to use our premium one
  
  // Robustly remove the first two paragraphs from the body to avoid duplication in the hero
  paragraphs.slice(0, 2).forEach(p => {
    body = body.replace(p, '');
  });

  return { title, tag, intro, body };
};

export default function BlogPost() {
  const { slug } = useParams();
  const containerRef = useRef(null);
  
  const postData = parseBlogPost(blogs[slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Centralized Animated counter logic for multiple rows
  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const rows = parent.querySelectorAll('.counter-row');
    if (!rows.length) return;

    const runCounters = (row) => {
      const nums = row.querySelectorAll('.num');
      nums.forEach((el) => {
        const target = el.dataset.target || el.textContent || '';
        const numeric = parseFloat(target.replace(/[^0-9.]/g, '')) || 0;

        // reset start state
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
            const hasM = target.toLowerCase().includes('m');
            el.textContent = '$' + Math.round(current) + (hasM ? 'M+' : '');
          } else if (target.toLowerCase().includes('b')) {
            el.textContent = Math.round(current).toLocaleString() + 'B';
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
        if (entry.isIntersecting) runCounters(entry.target);
      });
    }, { threshold: 0.15 });

    rows.forEach(row => observer.observe(row));
    return () => observer.disconnect();
  }, [postData]);

  if (!blogs[slug]) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-white mb-4">Post not found</h1>
          <Link to="/blog" className="text-[var(--purple)] hover:underline">Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden font-inter" ref={containerRef}>
      
      {/* ───────── HERO SPLIT ───────── */}
      <section className="relative w-full pt-32 pb-24 overflow-hidden border-b border-white/[0.02]">
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[var(--purple)]/10 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[var(--emerald)]/8 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="flex flex-col items-start translate-y-4">
              <Link to="/blog" className="flex items-center gap-2 text-white/40 text-xs font-medium hover:text-white transition-colors mb-8 group">
                <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to insights
              </Link>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6">
                <span className="text-white/60 text-xs font-semibold tracking-wide uppercase">{postData.tag}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1] mb-8">
                {postData.title}
              </h1>

              <div 
                className="text-[#a1a1aa] text-lg leading-relaxed mb-6 italic border-l-2 border-[var(--purple)]/30 pl-6"
                dangerouslySetInnerHTML={{ __html: postData.intro.replace(/className="/g, 'class="') }}
              />
              
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--purple)] to-indigo-600 flex items-center justify-center text-[10px] font-bold">OA</div>
                   <div className="flex flex-col">
                     <span className="text-white text-xs font-semibold">Orvanto AI Team</span>
                     <span className="text-white/40 text-[10px]">April 2025</span>
                   </div>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">8 min read</span>
              </div>
            </div>

            <div className="relative w-full h-[350px] md:h-[450px] lg:h-[520px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-tl from-[var(--purple)]/20 via-transparent to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b]/60 z-10 pointer-events-none"></div>
              <img src="/blogimg.png" alt={postData.title} className="w-full h-full object-cover animate-float-slow" />
            </div>
          </div>
        </div>
      </section>

      

      {/* ───────── MAIN CONTENT ───────── */}
      <section className="w-full py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div 
            className="blog-content prose prose-invert prose-purple max-w-none"
            dangerouslySetInnerHTML={{ __html: postData.body.replace(/className="/g, 'class="') }}
          />

          

          {/* Continue Body Content if any - checking if there's rest of content after stats */}
          {/* Note: In our current parsing, we already stripped the 2nd counter area, so we assume the rest is handled or we could further refine parsing */}
        </div>
      </section>

      {/* ───────── BOTTOM CTA ───────── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--purple)]/20 to-transparent"></div>
      <section className="w-full py-24 bg-[#09090b]">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 tracking-tight">
             Ready to see it <span className="bg-gradient-to-r from-[var(--purple)] to-indigo-400 bg-clip-text text-transparent">work for you?</span>
          </h2>
          <p className="text-[#a1a1aa] text-lg mb-10 leading-relaxed">
            Start your free 7-day trial. No charge until Day 8. 3 meetings in 30 days or your second month is completely free.
          </p>
          <Link to="/signup" className="inline-block px-10 py-4 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.12)]">
            Start Free Trial →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
