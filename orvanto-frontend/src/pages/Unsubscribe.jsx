import { useState } from 'react';
import Footer from '../components/Footer';

export default function Unsubscribe() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  const submitUnsub = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg(true);
      return;
    }
    setErrorMsg(false);

    try {
      await fetch('https://primary-production-809296.up.railway.app/webhook/wf-unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'unsubscribe_page',
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {}

    setIsSuccess(true);
  };

  return (
    <>
      {/* BACKGROUND VIDEO */}
      <div className="video-bg">
        <video autoPlay loop muted playsInline>
          <source src="/wavevdo.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      {/* CONTENT */}
      <div className="unsub-wrapper">
        <div className="unsub-card mt-16">
          {!isSuccess && (<a href="/" className="logo text-center block mb-4 logo-wrap">
  <img 
    src="/unsub.png"
    alt="Orvanto AI"
    className="logo-img"
  />
</a>)}

          {!isSuccess ? (
            <div id="form-section">
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
                Unsubscribe
              </h1>

              <p style={{ color: 'var(--muted)', marginBottom: '32px', fontSize: '.95rem', lineHeight: 1.6 }}>
                Enter your email address below to permanently opt out of all outreach from Orvanto AI clients.
              </p>

              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', marginBottom: '8px', color: 'var(--muted)' }}>
                  Your email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    background: 'var(--dark)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '13px 16px',
                    borderRadius: '10px'
                  }}
                />
              </div>

              <button className="btn-submit" onClick={submitUnsub}>
                Unsubscribe Me →
              </button>

              {errorMsg && (
                <p style={{ color: '#ef4444', fontSize: '.8rem', marginTop: '12px' }}>
                  Please enter a valid email address.
                </p>
              )}

              <p style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '16px' }}>
                By submitting, your email will be added to suppression list across all channels.
              </p>
            </div>
          ) : (
            <div className="success show">
  <div className="success-icon">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M7 12l3 3 7-7" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="#a855f7"/>
          <stop offset="1" stopColor="#6366f1"/>
        </linearGradient>
      </defs>
    </svg>
  </div>

  <h2 className="success-title">You've been unsubscribed</h2>

  <p className="success-text">
    The email address <strong>{email}</strong> has been removed from our mailing list.
    <br /><br />
    Please allow up to 28 days for this change to take full effect across all systems.
  </p>

  <p className="success-sub">
    If this was not requested, contact <a href="mailto:support@orvantoai.com">support@orvantoai.com</a>
  </p>

  <a href="/" className="portal-btn">
    Go to Orvanto AI Portal →
  </a>
</div>
          )}
        </div>
      </div>

      <Footer />

      {/* STYLES */}
      <style>{`

        .video-bg video {
          width: 100%;
          height: 100%;
          padding: 0px;
          filter: brightness(0.7) blur(1px);
        }
          .video-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  overflow: hidden;
}

        .video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,10,15,0.7), rgba(10,10,15,0.95));
          z-index: 1;
        }

        .unsub-wrapper {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 24px;
        }

        .unsub-card {
          background: rgba(17,17,24,0.6);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px;
          max-width: 460px;
          width: 100%;
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-submit:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* LOGO WRAPPER */
.logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* LOGO IMAGE */
.logo-img {
  height: 154px; /* increased size */
  
  transition: all 0.35s ease;
  
  /* subtle glow */
  filter: drop-shadow(0 0 8px rgba(168,85,247,0.35))
          drop-shadow(0 0 18px rgba(99,102,241,0.25));
}

/* HOVER ANIMATION */
.logo-wrap:hover .logo-img {
  transform: scale(1.08) translateY(-2px);

  /* stronger glow on hover */
  filter: drop-shadow(0 0 12px rgba(168,85,247,0.6))
          drop-shadow(0 0 28px rgba(99,102,241,0.5));
}

/* OPTIONAL: subtle floating animation (premium feel) */
@keyframes floatLogo {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0px); }
}

.logo-img {
  animation: floatLogo 4s ease-in-out infinite;
}
  /* SUCCESS BLOCK */
.success {
  text-align: center;
}

.success-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

/* TITLE */
.success-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 14px;
}

/* MAIN TEXT */
.success-text {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 18px;
}

/* SUBTEXT */
.success-sub {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 28px;
}

/* BUTTON */
.portal-btn {
  display: inline-block;
  padding: 14px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.portal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168,85,247,0.3);
}

@media (max-width: 900px) {
  .unsub-wrapper {
    padding: 20px;
    min-height: calc(100vh - 80px);
    padding-top: 120px;
    margin-top: 40px;
  }

  .unsub-card {
    max-width: 420px;
    padding: 32px 28px;
    border-radius: 16px;
  }

  .logo-img {
    height: 120px !important;
  }

  #form-section h1 {
    font-size: 1.5rem !important;
    margin-bottom: 10px !important;
  }

  #form-section p {
    font-size: 0.88rem !important;
    margin-bottom: 24px !important;
    line-height: 1.5 !important;
  }

  label {
    font-size: 0.8rem !important;
    margin-bottom: 6px !important;
  }

  input {
    padding: 11px 14px !important;
    font-size: 0.85rem !important;
  }

  .btn-submit {
    padding: 12px !important;
    font-size: 0.9rem !important;
  }

  .success-icon {
    margin-bottom: 16px;
  }

  .success-icon svg {
    width: 56px !important;
    height: 56px !important;
  }

  .success-title {
    font-size: 1.4rem !important;
    margin-bottom: 12px !important;
  }

  .success-text {
    font-size: 0.88rem !important;
    margin-bottom: 14px !important;
    line-height: 1.6 !important;
  }

  .success-sub {
    font-size: 0.78rem !important;
    margin-bottom: 22px !important;
  }

  .portal-btn {
    padding: 12px 18px !important;
    font-size: 0.88rem !important;
  }
}

@media (max-width: 480px) {
  .unsub-wrapper {
    padding: 16px;
    min-height: calc(100vh - 60px);
    padding-top: 100px;
  }

  .unsub-card {
    max-width: 100%;
    padding: 24px 20px;
    border-radius: 14px;
    margin-top: 8px;
  }

  .logo-img {
    height: 100px !important;
  }

  #form-section h1 {
    font-size: 1.3rem !important;
    margin-bottom: 8px !important;
    font-weight: 700 !important;
  }

  #form-section p {
    font-size: 0.8rem !important;
    margin-bottom: 20px !important;
    line-height: 1.5 !important;
  }

  label {
    font-size: 0.75rem !important;
    margin-bottom: 5px !important;
  }

  input {
    padding: 10px 12px !important;
    font-size: 0.8rem !important;
  }

  .btn-submit {
    padding: 11px !important;
    font-size: 0.85rem !important;
  }

  .success-icon {
    margin-bottom: 14px;
  }

  .success-icon svg {
    width: 48px !important;
    height: 48px !important;
  }

  .success-title {
    font-size: 1.2rem !important;
    margin-bottom: 10px !important;
    font-weight: 700 !important;
  }

  .success-text {
    font-size: 0.8rem !important;
    margin-bottom: 12px !important;
    line-height: 1.55 !important;
  }

  .success-sub {
    font-size: 0.75rem !important;
    margin-bottom: 18px !important;
  }

  .portal-btn {
    padding: 10px 16px !important;
    font-size: 0.8rem !important;
  }
}
      `}</style>
    </>
  );
}