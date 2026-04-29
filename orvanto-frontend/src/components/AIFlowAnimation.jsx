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
      <svg viewBox="0 0 1000 320" preserveAspectRatio="xMidYMid meet" aria-label="AI workflow">
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
          <path id="pL1" className="connector-bg" d="M500 150 C420 140 260 100 100 80" />
          <path id="pL2" className="connector-bg" d="M500 150 C420 160 260 200 100 220" />
          <path id="pR1" className="connector-bg" d="M500 150 C580 140 740 100 900 80" />
          <path id="pR2" className="connector-bg" d="M500 150 C580 160 740 200 900 220" />
        </g>

        {!prefersReduced && (
          <g className="pulses" strokeLinecap="round" strokeWidth="6" fill="none" filter="url(#glow-strong)">
            <path className="connector-pulse pL1" d="M500 150 C420 140 260 100 100 80" />
            <path className="connector-pulse pL2" d="M500 150 C420 160 260 200 100 220" />
            <path className="connector-pulse pR1" d="M500 150 C580 140 740 100 900 80" />
            <path className="connector-pulse pR2" d="M500 150 C580 160 740 200 900 220" />

            {/* small moving sparks using SMIL for exact motion along path — start after AI chip appears */}
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

        <g className="chip" transform="translate(420,100)">
          <rect x="-12" y="-12" width="184" height="124" rx="26" className="chip-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
          <g className="chip-body">
            <rect x="0" y="0" width="160" height="100" rx="18" className="chip-rect" />
            <text x="80" y="62" textAnchor="middle" className="chip-text">AI</text>
            <g className="pins">
              <rect x="-18" y="20" width="8" height="8" rx="2" className="pin" />
              <rect x="-18" y="50" width="8" height="8" rx="2" className="pin" />
              <rect x="178" y="20" width="8" height="8" rx="2" className="pin" />
              <rect x="178" y="50" width="8" height="8" rx="2" className="pin" />
            </g>
          </g>
        </g>

        <g className="nodes">
          {/* Left column - top */}
          <g className="node" transform="translate(40,20)">
            <rect x="-12" y="-12" width="144" height="144" rx="26" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect width="120" height="120" rx="20" className="node-rect" />
              <g className="node-icon" transform="translate(60,46) scale(0.78)">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z" transform="translate(-12,-12)" />
              </g>
              <text x="60" y="82" textAnchor="middle" className="node-text">
                <tspan x="60" dy="-6">Lead</tspan>
                <tspan x="60" dy="20">Search</tspan>
              </text>
            </g>
          </g>

          {/* Left column - bottom */}
          <g className="node" transform="translate(40,180)">
            <rect x="-12" y="-12" width="144" height="144" rx="26" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect width="120" height="120" rx="20" className="node-rect" />
              <g className="node-icon" transform="translate(60,46) scale(0.78)">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z" transform="translate(-12,-12)" />
              </g>
              <text x="60" y="82" textAnchor="middle" className="node-text">
                <tspan x="60" dy="-6">Lead</tspan>
                <tspan x="60" dy="20">Found</tspan>
              </text>
            </g>
          </g>

          {/* Right column - top */}
          <g className="node" transform="translate(840,20)">
            <rect x="-12" y="-12" width="144" height="144" rx="26" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect width="120" height="120" rx="20" className="node-rect" />
              <g className="node-icon" transform="translate(60,46) scale(0.78)">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" transform="translate(-12,-12)" />
              </g>
              <text x="60" y="82" textAnchor="middle" className="node-text">
                <tspan x="60" dy="-6">AI Writes</tspan>
                <tspan x="60" dy="20">Message</tspan>
              </text>
            </g>
          </g>

          {/* Right column - bottom */}
          <g className="node" transform="translate(840,180)">
            <rect x="-12" y="-12" width="144" height="144" rx="26" className="node-outline" stroke="url(#grad-stroke)" fill="none" strokeWidth="2" filter="url(#glow-outline)" />
            <g className="node-body">
              <rect width="120" height="120" rx="20" className="node-rect" />
              <g className="node-icon" transform="translate(60,46) scale(0.78)">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6c0-1.1-.9-2-2-2zm0 14H5V9h14v9z" transform="translate(-12,-12)" />
              </g>
              <text x="60" y="82" textAnchor="middle" className="node-text">
                <tspan x="60" dy="-6">Meeting</tspan>
                <tspan x="60" dy="20">Booked</tspan>
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}