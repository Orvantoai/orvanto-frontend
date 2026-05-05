import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide the global navigation bar entirely if we are currently immersed in the fullscreen video player menu
  if (location.pathname === '/tutorial') {
    return null;
  }

  const handleLogoClick = (e) => {
    // normalize current path
    const path = window.location.pathname || '/';
    e.preventDefault();
    if (path === '/' || path === '') {
      // already on home - scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // navigate to home
      navigate('/');
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={handleLogoClick}>
          <img src="/favicon.svg" alt="Orvanto logo" className="logo-mark" />
          <span className="logo-text">Orvanto AI</span>
        </Link>
        <div className="nav-links">
          <a href="/#how-it-works">How it works</a>
          <a href="/#features">Features</a>
          <a href="/#pricing">Pricing</a>
          <NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>About</NavLink>
          <NavLink to="/blog" className={({isActive}) => isActive ? 'active' : ''}>Blog</NavLink>
          <NavLink to="/contact" className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-muted hover:text-white transition-colors font-medium text-sm">Log In</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '10px 24px', fontSize: '.9rem' }}>
              Start Free Trial →
            </Link>
          </div>
        </div>
        <button
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
      <div className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`mobile-nav-drawer ${mobileOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="mobile-nav-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close mobile menu"
        >
          Close ✕
        </button>
        <a href="/#how-it-works">How it works</a>
        <a href="/#features">Features</a>
        <a href="/#pricing">Pricing</a>
        <NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>About</NavLink>
        <NavLink to="/blog" className={({isActive}) => isActive ? 'active' : ''}>Blog</NavLink>
        <NavLink to="/contact" className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink>
        <Link to="/login" className="text-muted text-center py-2 font-medium">Log In</Link>
        <Link to="/signup" className="btn-primary mobile-drawer-cta">
          Start Free Trial →
        </Link>
      </aside>
    </nav>
  );
}
