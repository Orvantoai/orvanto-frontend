import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import './AIFlowAnimation.css';

export default function AIFlowAnimation({ className = '' }) {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef(null);
  const animRefs = useRef({});

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const lastScroll = { current: typeof window !== 'undefined' ? window.scrollY : 0 };
    const onScroll = () => { lastScroll.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const direction = window.scrollY > lastScroll.current ? 'down' : 'up';
          lastScroll.current = window.scrollY;

          node.classList.remove('in-view', 'enter-from-top', 'enter-from-bottom');
          void node.offsetWidth; // force reflow to restart animations
          node.classList.add(direction === 'down' ? 'enter-from-top' : 'enter-from-bottom');
          node.classList.add('in-view');

          // start SMIL sparks/animateMotion (beginElement)
          ['animL1','animL2','animR1','animR2'].forEach((id) => {
            const el = animRefs.current[id] || document.getElementById(id);
            if (el && typeof el.beginElement === 'function') {
              try { el.beginElement(); } catch (e) {}
            }
          });
        } else {
          node.classList.remove('in-view', 'enter-from-top', 'enter-from-bottom');
          // stop SMIL sparks when leaving
          ['animL1','animL2','animR1','animR2'].forEach((id) => {
            const el = animRefs.current[id] || document.getElementById(id);
            if (el && typeof el.endElement === 'function') {
              try { el.endElement(); } catch (e) {}
            }
          });
        }
      });
    }, { threshold: 0.2 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className={`aiflow-svg-wrap ${className}`}>
      <svg viewBox="0 0 1000 480" preserveAspectRatio="xMidYMid meet" aria-label="Orvanto AI workflow">
        <defs>
          <linearGradient id="grad-theme" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--purple)" />
            <stop offset="100%" stopColor="var(--indigo)" />
          </linearGradient>

          {/* Gradient used for animated strokes/outlines */}
          <linearGradient id="grad-stroke" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
            <stop offset="0%" stopColor="var(--purple)" />
            <stop offset="100%" stopColor="var(--indigo)" />
            {!prefersReduced && (
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="0 0"
                to="1000 0"
                dur="3.6s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>

          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Stronger outline glow for node/chip outlines */}
          <filter id="glow-outline" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="o" />
            <feMerge>
              <feMergeNode in="o" />
              <feMergeNode in="o" />
              <feMergeNode in="o" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="connectors" strokeLinecap="round" strokeWidth="3" fill="none">
          {/* Left column connectors to center */}
          <path id="pL1" className="connector-bg" d="M500 170 C420 160 260 120 0 85" />
          <path id="pL2" className="connector-bg" d="M500 170 C420 180 260 220 0 185" />
          <path id="pL3" className="connector-bg" d="M500 170 C420 200 260 300 0 285" />
          <path id="pL4" className="connector-bg" d="M500 170 C420 220 260 400 0 385" />
          
          {/* Right column connectors from center */}
          <path id="pR1" className="connector-bg" d="M500 170 C580 160 740 120 810 85" />
          <path id="pR2" className="connector-bg" d="M500 170 C580 180 740 220 810 185" />
          <path id="pR3" className="connector-bg" d="M500 170 C580 200 740 300 810 285" />
          <path id="pR4" className="connector-bg" d="M500 170 C580 220 740 400 810 385" />
        </g>

        {!prefersReduced && (
          <g className="pulses" strokeLinecap="round" strokeWidth="6" fill="none" filter="url(#glow-strong)">
            {/* Left side pulses */}
            <path className="connector-pulse pL1" d="M500 170 C420 160 260 120 0 85" />
            <path className="connector-pulse pL2" d="M500 170 C420 180 260 220 0 185" />
            <path className="connector-pulse pL3" d="M500 170 C420 200 260 300 0 285" />
            <path className="connector-pulse pL4" d="M500 170 C420 220 260 400 0 385" />
            
            {/* Right side pulses */}
            <path className="connector-pulse pR1" d="M500 170 C580 160 740 120 810 85" />
            <path className="connector-pulse pR2" d="M500 170 C580 180 740 220 810 185" />
            <path className="connector-pulse pR3" d="M500 170 C580 200 740 300 810 285" />
            <path className="connector-pulse pR4" d="M500 170 C580 220 740 400 810 385" />
            
            {/* Bubble particles on left connectors */}
            <circle className="bubble bL1" r="6" fill="url(#grad-theme)" opacity="0.8">
              <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pL1" />
              </animateMotion>
            </circle>
            <circle className="bubble bL2" r="4" fill="url(#grad-theme)" opacity="0.7">
              <animateMotion dur="3.5s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pL2" />
              </animateMotion>
            </circle>
            <circle className="bubble bL3" r="5" fill="url(#grad-theme)" opacity="0.75">
              <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pL3" />
              </animateMotion>
            </circle>
            <circle className="bubble bL4" r="7" fill="url(#grad-theme)" opacity="0.85">
              <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pL4" />
              </animateMotion>
            </circle>
            
            {/* Bubble particles on right connectors */}
            <circle className="bubble bR1" r="5" fill="url(#grad-theme)" opacity="0.8">
              <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pR1" />
              </animateMotion>
            </circle>
            <circle className="bubble bR2" r="6" fill="url(#grad-theme)" opacity="0.7">
              <animateMotion dur="3.5s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pR2" />
              </animateMotion>
            </circle>
            <circle className="bubble bR3" r="4" fill="url(#grad-theme)" opacity="0.75">
              <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pR3" />
              </animateMotion>
            </circle>
            <circle className="bubble bR4" r="5" fill="url(#grad-theme)" opacity="0.85">
              <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
                <mpath href="#pR4" />
              </animateMotion>
            </circle>

            {/* small moving sparks using SMIL for exact motion along path */}
            <circle r="6" className="spark" fill="url(#grad-theme)" style={{ opacity: 0.98 }}>
              <animateMotion id="animL1" ref={(el) => (animRefs.current.animL1 = el)} dur="2s" begin="indefinite" repeatCount="indefinite">
                <mpath xlinkHref="#pL1" />
              </animateMotion>
            </circle>
            <circle r="5.5" className="spark" fill="url(#grad-theme)" style={{ opacity: 0.92 }}>
              <animateMotion id="animL2" ref={(el) => (animRefs.current.animL2 = el)} dur="2.2s" begin="indefinite" repeatCount="indefinite">
                <mpath xlinkHref="#pL2" />
              </animateMotion>
            </circle>
            <circle r="5" className="spark" fill="url(#grad-theme)" style={{ opacity: 0.9 }}>
              <animateMotion id="animR1" ref={(el) => (animRefs.current.animR1 = el)} dur="2.4s" begin="indefinite" repeatCount="indefinite">
                <mpath xlinkHref="#pR1" />
              </animateMotion>
            </circle>
            <circle r="4.5" className="spark" fill="url(#grad-theme)" style={{ opacity: 0.88 }}>
              <animateMotion id="animR2" ref={(el) => (animRefs.current.animR2 = el)} dur="2.6s" begin="indefinite" repeatCount="indefinite">
                <mpath xlinkHref="#pR2" />
              </animateMotion>
            </circle>
          </g>
        )}

        {/* Center Orvanto Chip */}
        <g className="chip" transform="translate(420,135)">
          <rect x="-10" y="-10" width="190" height="100" rx="20" className="chip-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
          <g className="chip-body">
            <rect x="0" y="0" width="170" height="80" rx="14" className="chip-rect" />
            <text x="85" y="48" textAnchor="middle" className="chip-text" >Orvanto</text>
            <g className="pins">
              <rect x="-16" y="16" width="6" height="6" rx="2" className="pin" />
              <rect x="-16" y="40" width="6" height="6" rx="2" className="pin" />
              <rect x="154" y="16" width="6" height="6" rx="2" className="pin" />
              <rect x="154" y="40" width="6" height="6" rx="2" className="pin" />
            </g>
          </g>
        </g>

        <g className="nodes">
          {/* ===== LEFT COLUMN (4 boxes) ===== */}
          
          {/* Left - Box 1: ICP Research */}
          <g className="node" transform="translate(-20,20)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">


                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" transform="translate(-12,-12)" />
              </g>
                <text
                  x="55"
                  y="37"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  className="node-text"
                >
                  ICP Research
                </text>
            </g>
          </g>

          {/* Left - Box 2: Lead Search */}
          <g className="node" transform="translate(-20,135)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z" transform="translate(-12,-12)" />
              </g>
              <text
                  x="55"
                  y="37"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  className="node-text"
                >
                Lead Search
                
              </text>
            </g>
          </g>

          {/* Left - Box 3: Lead Found */}
          <g className="node" transform="translate(-20,255)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z" transform="translate(-12,-12)" />
              </g>
              <text
                  x="55"
                  y="37"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  className="node-text"
                >
                  Lead Found
                </text>
            </g>
          </g>

          {/* Left - Box 4: Lead Verify */}
          <g className="node" transform="translate(-20,375)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" transform="translate(-12,-12)" />
              </g>
              <text
                  x="55"
                  y="37"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  className="node-text"
                >
                  Lead Verify
                </text>
            </g>
          </g>

          {/* ===== RIGHT COLUMN (4 boxes) ===== */}

          {/* Right - Box 1: AI Writes Message */}
          <g className="node" transform="translate(830,20)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" transform="translate(-12,-12)" />
              </g>
              <text
                x="55"
                y="37"
                alignmentBaseline="middle"
                dominantBaseline="middle"
                className="node-text"
              >
                Writes Message
              </text>
            </g>
          </g>

          {/* Right - Box 2: Multi-Channel Send */}
          <g className="node" transform="translate(830,135)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">
                <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18v-2H4V6zm9 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm6-3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-6 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" transform="translate(-12,-12)" />
              </g>
              <text
                x="55"
                y="37"
                alignmentBaseline="middle"
                dominantBaseline="middle"
                className="node-text"
              >
                Multi-Channel Send
              </text>
            </g>
          </g>

          {/* Right - Box 3: Follow-up Sequence */}
          <g className="node" transform="translate(830,255)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" transform="translate(-12,-12)" />
              </g>
              <text
                x="55"
                y="37"
                alignmentBaseline="middle"
                dominantBaseline="middle"
                className="node-text"
              >
                Follow-up Sequence
              </text>
            </g>
          </g>

          {/* Right - Box 4: Meeting Booked */}
          <g className="node" transform="translate(830,375)">
            <rect x="-8" y="-8" width="200" height="90" rx="18" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect x="0" y="0" width="184" height="74" rx="12" className="node-rect" />
              <g className="node-icon" transform="translate(28,37) scale(1.05)">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6c0-1.1-.9-2-2-2zm0 14H5V9h14v9z" transform="translate(-12,-12)" />
              </g>
              <text
                x="55"
                y="37"
                alignmentBaseline="middle"
                dominantBaseline="middle"
                className="node-text"
              >
                Meeting Booked
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}