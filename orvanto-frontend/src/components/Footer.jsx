import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">Orvanto AI</div>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.7, maxWidth: 300 }}>
              The world's most complete done-for-you B2B sales infrastructure. Find leads, send outreach, book meetings — entirely on autopilot.
            </p>
            <p style={{ color: 'var(--subtle)', fontSize: '.75rem', marginTop: 16 }}>
              Sanfy Consultancy Services Pvt. Ltd.<br />
            </p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="/#features">Features</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#how-it-works">How it works</a>
            <Link to="/api-docs">API Docs</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <a href="/blog/post-1">Blog</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link to="/policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/refund">Refund Policy</Link>
            <Link to="/unsubscribe">Unsubscribe</Link>
            <Link to="/data-deletion">Data Deletion</Link>
          </div>
          <div className="footer-col">
            <h4>Dev Preview</h4>
            <Link to="/dashboard?client=orvanto_self">Dashboard</Link>
            <Link to="/portal?client=orvanto_self">Portal</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Orvanto AI / Sanfy Consultancy Services Pvt. Ltd. All rights reserved.</p>
          <p style={{ color: 'var(--subtle)' }}>support@orvantoai.com</p>
        </div>
      </div>
    </footer>
  );
}
