import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);
  const sectionRef = useRef(null);
  const previewVideoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 } // triggers when 20% of section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-32 overflow-hidden bg-[var(--dark)]">
      {/* Background ambient glow matching reference deeply dark purple tones */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--purple)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <div className="inline-block bg-[var(--purple)]/10 text-[var(--purple)] px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-4 border border-[var(--purple)]/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-36 tracking-tight text-white drop-shadow-lg">
            From signup to meetings in 4 steps
          </h2>
        </div>

        {/* The Radial Container */}
        <div className="relative w-full max-w-[1200px] mx-auto min-h-[800px] md:min-h-[600px] flex flex-col md:block items-center justify-center gap-6">
          
          {/* Connecting SVG Lines (Desktop Only) */}
          <svg className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] pointer-events-none opacity-40 z-0">
            <path d="M150 100 L500 250 L850 100" stroke="url(#line-grad-top)" strokeWidth="2" fill="none" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
            <path d="M150 400 L500 250 L850 400" stroke="url(#line-grad-bot)" strokeWidth="2" fill="none" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
            <defs>
              <linearGradient id="line-grad-top" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="var(--purple)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="line-grad-bot" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="var(--indigo)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Orb / Logo Container */}
          <div className={`md:absolute top-1/2 left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-72 h-72 rounded-full border border-[var(--purple)]/30 bg-[var(--card)] shadow-[0_0_50px_rgba(168,85,247,0.2),inset_0_0_50px_rgba(168,85,247,0.1)] flex items-center justify-center z-20 backdrop-blur-xl shrink-0 my-8 md:my-0 opacity-0 ${isVisible ? 'animate-[fade-up_0.8s_ease-out_0s_forwards]' : ''}`}>
            <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border-t-2 border-[var(--purple)] animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-8 rounded-full border-b-2 border-[var(--indigo)] animate-[spin_6s_linear_infinite_reverse]" />
            <div className="text-center flex flex-col items-center justify-center">
              <img src="/favicon.svg" alt="Orvanto AI Web Framework Logo" className="w-24 h-24 animate-[spin_12s_linear_infinite] drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
              <div className="text-xs font-bold text-white/50 tracking-[0.2em] uppercase mt-4">Core Engine</div>
            </div>
          </div>

          {/* Card 1: Top Left */}
          <div className={`radial-card md:absolute md:top-[10%] md:left-[2%] md:-translate-y-1/2 w-full max-w-[440px] opacity-0 ${isVisible ? 'animate-[fade-up_0.8s_ease-out_0.4s_forwards]' : ''}`}>
            <div className="glass-panel group relative p-8 rounded-3xl bg-[var(--card)]/80 backdrop-blur-md border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] hover:border-[var(--purple)]/30">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-[var(--purple)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--purple)]/20 to-transparent border border-[var(--purple)]/30 flex items-center justify-center text-2xl font-black text-[var(--purple)] shrink-0 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]">1</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[var(--purple)] transition-colors">Sign up in 10 minutes</h3>
                  <p className="text-[15px] text-[var(--muted)] leading-relaxed">Tell us about your business, your ideal customer, and your offer. Our proprietary AI core builds out your entire scaling strategy, mapping key personas and analyzing your website metrics in mere minutes. We establish exactly who to target without any manual configuration required from your end.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Right */}
          <div className={`radial-card md:absolute md:top-[10%] md:right-[2%] md:-translate-y-1/2 w-full max-w-[440px] opacity-0 ${isVisible ? 'animate-[fade-up_0.8s_ease-out_0.8s_forwards]' : ''}`}>
            <div className="glass-panel group relative p-8 rounded-3xl bg-[var(--card)]/80 backdrop-blur-md border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] hover:border-[var(--purple)]/30">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-[var(--purple)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-bl from-[var(--purple)]/20 to-transparent border border-[var(--purple)]/30 flex items-center justify-center text-2xl font-black text-[var(--purple)] shrink-0 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]">2</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[var(--purple)] transition-colors">We build your pipeline</h3>
                  <p className="text-[15px] text-[var(--muted)] leading-relaxed">Orvanto AI scrapes your deep website architecture, generates an exact Ideal Customer Profile matrix, establishes secure email domain warmups, and immediately starts compiling 50-200 highly-verified, perfect business prospects daily ensuring near-zero bounce rates across the board.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Bottom Left */}
          <div className={`radial-card md:absolute md:bottom-[10%] md:left-[2%] md:translate-y-1/2 w-full max-w-[440px] opacity-0 ${isVisible ? 'animate-[fade-up_0.8s_ease-out_1.2s_forwards]' : ''}`}>
            <div className="glass-panel group relative p-8 rounded-3xl bg-[var(--card)]/80 backdrop-blur-md border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] hover:border-[var(--purple)]/30">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-t from-[var(--purple)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[var(--indigo)]/20 to-transparent border border-[var(--indigo)]/30 flex items-center justify-center text-2xl font-black text-[var(--indigo)] shrink-0 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]">3</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[var(--indigo)] transition-colors">Outreach starts safely</h3>
                  <p className="text-[15px] text-[var(--muted)] leading-relaxed">Day 14: highly-personalised, multi-channel AI emails are deployed safely. Responses are automatically classified by intent. Interested prospects are elegantly nurtured and directly guided to book into your connected calendar scheduling system, entirely on autopilot.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Bottom Right */}
          <div className={`radial-card md:absolute md:bottom-[10%] md:right-[2%] md:translate-y-1/2 w-full max-w-[440px] opacity-0 ${isVisible ? 'animate-[fade-up_0.8s_ease-out_1.6s_forwards]' : ''}`}>
            <div className="glass-panel group relative p-8 rounded-3xl bg-[var(--card)]/80 backdrop-blur-md border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] hover:border-[var(--purple)]/30">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-t from-[var(--purple)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tl from-[var(--indigo)]/20 to-transparent border border-[var(--indigo)]/30 flex items-center justify-center text-2xl font-black text-[var(--indigo)] shrink-0 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]">4</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[var(--indigo)] transition-colors">Meetings on calendar</h3>
                  <p className="text-[15px] text-[var(--muted)] leading-relaxed">You receive a comprehensive AI intelligence briefing minutes prior to each scheduled meeting. All you need to do is consistently show up and close the deal. Orvanto autonomously dispatches the follow-up pipeline sequencing after every single finalized call preventing any ghosting.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- CUSTOM WIDESCREEN VIDEO PLAYER BANNER --- */}
      <div className="w-full px-6 flex justify-center pb-20">
        <div 
          onMouseEnter={() => { setIsHoveringVideo(true); if (previewVideoRef.current) previewVideoRef.current.play().catch(()=>{}); }}
          onMouseLeave={() => { setIsHoveringVideo(false); if (previewVideoRef.current) previewVideoRef.current.pause(); }}
          onClick={() => navigate('/tutorial')}
          className={`mt-20 md:mt-32 w-full max-w-[1600px] h-auto min-h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden relative shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/5 opacity-0 cursor-pointer ${isVisible ? 'animate-[fade-up_0.8s_ease-out_2s_forwards]' : ''}`}
        >
          
          {/* Background Image & Ambient Video Preview Overlay */}
          <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center transition-opacity duration-700 z-0 ${isHoveringVideo ? 'opacity-0' : 'opacity-100'}`} />
          <video 
            ref={previewVideoRef}
            src="/demo.mp4" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-0 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
            muted 
            loop 
            playsInline
          />
          
          {/* Gradients to preserve reading contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--dark)] via-[var(--dark)]/90 to-[var(--purple)]/10 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark)]/90 to-transparent z-[1]" />
          
          {/* Vertical Grid Lines (matching reference exactly) */}
          <div className="absolute inset-0 hidden md:grid grid-cols-3 pointer-events-none opacity-30 z-[2]">
            <div className="border-r border-white/20 h-full" />
            <div className="border-r border-white/20 h-full" />
            <div className="h-full" />
          </div>

          <div className="relative w-full h-full flex flex-col md:flex-row">
            
            {/* Left Content Half */}
            <div className="w-full md:w-[66%] p-10 md:p-16 flex flex-col justify-center z-[3]">
              <div className="text-xs font-bold text-white/50 tracking-[0.2em] uppercase mb-4">
                Tutorial
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
                The Autonomous Engine<br />Powering Your Outreach
              </h3>
              
              <p className="text-[15px] text-white/70 leading-relaxed max-w-xl mb-12">
                Discover the exact workflow we use to generate highly verified ICPs, execute multi-channel campaigns, and deposit closed-won meetings directly into your calendar without human intervention.
              </p>
              
              {/* Bottom Action Bar matching reference */}
              <div className="flex items-center gap-6 mt-auto text-white/50 text-sm font-semibold">
                <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                  <span>33K</span>
                </div>
                <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" /></svg>
                  <span>939</span>
                </div>
                <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  <span>Share</span>
                </div>
                
              </div>
            </div>

            {/* Right Content Half (Play Button) */}
            <div className="w-full md:w-[34%] flex items-center justify-center p-10 relative mt-10 md:mt-0 z-[3]">
              <button 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[var(--purple)] flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-[0_0_50px_rgba(168,85,247,0.7)] group relative z-10 cursor-pointer border-none outline-none overflow-visible"
              >
                <svg className="w-10 h-10 md:w-14 md:h-14 text-white translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4l12 6-12 6z" />
                </svg>
                {/* Ping animation rings behind play button */}
                <div className="absolute inset-0 rounded-full bg-[var(--purple)] animate-ping opacity-20 -z-10" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
