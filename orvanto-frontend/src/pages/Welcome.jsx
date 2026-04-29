// Navbar moved to App.jsx (rendered globally)
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Welcome() {
  const [mounted, setMounted] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [finished, setFinished] = useState(false);
  const full = 'Welcome to Orvanto AI';

  // timing (ms) — keep these in sync with CSS `--char-delay` and `--char-duration`
  const startDelay = 450;
  const charDelayMs = 60;
  const charDurationMs = 280;
  const postDelayMs = 2000; // extra pause after typing finishes before redirect
  const totalMs = startDelay + full.length * charDelayMs + charDurationMs + postDelayMs;

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReveal(true);
      setFinished(true);
      try { sessionStorage.setItem('orvanto:welcomeShown', '1'); } catch (e) {}
      const tNav = setTimeout(() => navigate('/', { replace: true }), postDelayMs);
      return () => clearTimeout(tNav);
    }

    try { sessionStorage.setItem('orvanto:welcomeShown', '1'); } catch (e) {}
    const t1 = setTimeout(() => setReveal(true), startDelay);
    const exitAnimMs = 0; // match CSS --page-enter-duration
    const t2 = setTimeout(() => {
      setFinished(true);
      // start exit animation
      const el = document.getElementById('page-transition') || document.getElementById('root');
      if (el) el.classList.add('page-exit');
      setTimeout(() => navigate('/', { replace: true }), exitAnimMs);
    }, totalMs);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [startDelay, totalMs, navigate]);

  return (
    <div>
      {/* navbar rendered globally in App.jsx */}

      <section className={`welcome-hero hero ${mounted ? 'animate' : ''}`}>
        <div className="welcome-blobs" aria-hidden="true">
          <div className="welcome-blob blob-1" />
          <div className="welcome-blob blob-2" />
          <div className="welcome-blob blob-3" />
        </div>

        <div className="welcome-inner">
          <div className={`logo-rotator ${reveal ? 'spin' : ''}`} aria-hidden>
            <div
              className={`logo-frame ${reveal ? 'revealed' : ''}`}
              style={{ ['--logo-in-duration']: '1200ms', ['--logo-delay']: `${startDelay}ms`, ['--sheen-duration']: '1200ms' }}
            >
              <img src="/favicon.svg" alt="Orvanto logo" className="welcome-logo" />
              <div className="logo-sheen" aria-hidden />
            </div>
          </div>

          <h1 className="welcome-headline" aria-live="polite">
            <span className={`typing ${finished ? 'finished' : ''}`}>
              {full.split('').map((ch, idx) => (
                <span
                  key={idx}
                  className={`char ${reveal ? 'show' : ''}`}
                  style={{ ['--i']: idx }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              ))}
              <span className="caret" aria-hidden>▌</span>
            </span>
          </h1>

          <div className="welcome-ctas">
            <Link to="/signup" className="btn-primary">Start Free Trial — Get 3 Meetings</Link>
            <a href="/#how-it-works" className="btn-ghost">See how it works</a>
          </div>
        </div>
      </section>

      {/* <footer style={{ padding: 10, textAlign: 'center', color: 'var(--muted)' }}>
        © 2026 Orvanto AI · <a href="/policy" style={{ color: 'var(--muted)' }}>Privacy</a> · <a href="/terms-of-service" style={{ color: 'var(--muted)' }}>Terms</a>
      </footer> */}
    </div>
  );
}
