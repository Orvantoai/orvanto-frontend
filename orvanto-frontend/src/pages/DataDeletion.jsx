// import { useState } from 'react';
// // Navbar moved to App.jsx (rendered globally)
// import Footer from '../components/Footer';

// export default function DataDeletion() {
//   const [formData, setFormData] = useState({
//     name: '', email: '', type: '', notes: ''
//   });
//   const [successRef, setSuccessRef] = useState(null);

//   const submitDeletion = async () => {
//     if (!formData.name || !formData.email || !formData.type) {
//       alert('Please fill in name, email, and request type.');
//       return;
//     }

//     const ref = 'DEL-' + Date.now().toString(36).toUpperCase();

//     try {
//       await fetch('https://primary-production-809296.up.railway.app/webhook/wf-support', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: formData.name, 
//           email: formData.email,
//           issue_type: 'Data Deletion / GDPR',
//           description: 'Type: ' + formData.type + '\nRef: ' + ref + '\nNotes: ' + (formData.notes || 'none'),
//           urgency: 'normal',
//           reference: ref
//         })
//       });
//     } catch(e) {}

//     setSuccessRef(ref);
//   };

//   return (
//     <>
//       {/* navbar rendered globally in App.jsx */}
//       <div className="legal-container blog-content">
//         <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Data Deletion Request</h1>
//         <p className="sub" style={{ color: 'var(--muted)', marginBottom: '40px', fontSize: '1rem' }}>
//           Submit this form to request deletion of your personal data from our systems. We process all requests within 30 days in accordance with GDPR Article 17.
//         </p>

//         {!successRef ? (
//           <div className="form-card">
//             <div className="field">
//               <label style={{ display: 'block', fontWeight: 600, fontSize: '.88rem', marginBottom: '8px' }}>Full Name</label>
//               <input type="text" placeholder="Your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text)', padding: '13px 16px', borderRadius: '10px', fontSize: '.95rem', outline: 'none' }} />
//             </div>
//             <div className="field" style={{ marginTop: '24px' }}>
//               <label style={{ display: 'block', fontWeight: 600, fontSize: '.88rem', marginBottom: '8px' }}>Email Address</label>
//               <input type="email" placeholder="The email address associated with your data" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text)', padding: '13px 16px', borderRadius: '10px', fontSize: '.95rem', outline: 'none' }} />
//             </div>
//             <div className="field" style={{ marginTop: '24px' }}>
//               <label style={{ display: 'block', fontWeight: 600, fontSize: '.88rem', marginBottom: '8px' }}>Request Type</label>
//               <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '13px 16px', borderRadius: '10px', fontSize: '.95rem', outline: 'none' }}>
//                 <option value="">Select request type</option>
//                 <option value="full_deletion">Full account deletion (client)</option>
//                 <option value="prospect_removal">Remove me as a prospect / lead</option>
//                 <option value="data_export">Export my data (GDPR right of portability)</option>
//                 <option value="data_access">Access what data you hold about me</option>
//                 <option value="correction">Correct inaccurate data</option>
//               </select>
//             </div>
//             <div className="field" style={{ marginTop: '24px' }}>
//               <label style={{ display: 'block', fontWeight: 600, fontSize: '.88rem', marginBottom: '8px' }}>Additional Information (optional)</label>
//               <textarea placeholder="Any additional context that will help us process your request..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text)', padding: '13px 16px', borderRadius: '10px', fontSize: '.95rem', outline: 'none', minHeight: '100px', resize: 'vertical' }}></textarea>
//             </div>
//             <button className="btn-submit" onClick={submitDeletion} style={{ marginTop: '16px' }}>Submit Request →</button>
//             <div className="gdpr-note">
//               🔒 Under GDPR, you have the right to erasure (Article 17). We will confirm receipt within 48 hours and process your request within 30 days. If we cannot fulfill your request (e.g., due to legal obligations), we will explain why in writing.
//             </div>
//           </div>
//         ) : (
//           <div className="success show" style={{ textAlign: 'center', padding: '48px 0' }}>
//             <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📩</div>
//             <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Request received.</h2>
//             <p style={{ color: 'var(--muted)' }}>
//               We'll confirm receipt within 48 hours and complete your request within 30 days.<br/>
//               Reference: <strong style={{ color: 'var(--purple)' }}>{successRef}</strong>
//             </p>
//           </div>
//         )}
//       </div>
//       <Footer />
//     </>
//   );
// }
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';

export default function DataDeletion() {
  const [formData, setFormData] = useState({
    name: '', email: '', type: '', notes: ''
  });
  const [successRef, setSuccessRef] = useState(null);

  const submitDeletion = async () => {
    if (!formData.name || !formData.email || !formData.type) {
      alert('Please fill in name, email, and request type.');
      return;
    }

    const ref = 'DEL-' + Date.now().toString(36).toUpperCase();

    try {
      await fetch('https://primary-production-809296.up.railway.app/webhook/wf-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          issue_type: 'Data Deletion / GDPR',
          description:
            'Type: ' +
            formData.type +
            '\nRef: ' +
            ref +
            '\nNotes: ' +
            (formData.notes || 'none'),
          urgency: 'normal',
          reference: ref
        })
      });
    } catch (e) {}

    setSuccessRef(ref);
  };

  useEffect(() => {
    // staggered reveal for data-deletion: set --i and add reveal-item classes
    const t = setTimeout(() => {
      const contentEl = document.querySelector('.unsub-card');
      if (!contentEl) return;

      const nodes = [];
      const children = Array.from(contentEl.children);
      children.forEach((child) => {
        nodes.push(child);
        const tag = child.tagName.toLowerCase();
        if (tag === 'ul' || tag === 'ol') {
          Array.from(child.children).forEach((li) => nodes.push(li));
        } else {
          Array.from(child.children).forEach((el) => {
            if (el.tagName.toLowerCase() !== 'style') nodes.push(el);
          });
        }
      });

      nodes.forEach((el, idx) => {
        el.style.setProperty('--i', idx);
        el.classList.add('reveal-item');
      });
    }, 60);

    return () => clearTimeout(t);
  }, []);

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

          {!successRef && (
            <a href="/" className="logo text-center block mb-4 logo-wrap">
              <img src="/del.png" alt="Orvanto AI" className="logo-img" />
            </a>
          )}

          {!successRef ? (
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
                Data Deletion Request
              </h1>

              <p style={{ color: 'var(--muted)', marginBottom: '28px', fontSize: '.95rem' }}>
                Submit this form to request deletion of your personal data. We process requests within 30 days under GDPR Article 17.
              </p>

              {/* NAME */}
              <div style={{ marginBottom: '18px' }}>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="input"
                />
              </div>

              {/* EMAIL */}
              <div style={{ marginBottom: '18px' }}>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your email"
                  className="input"
                />
              </div>

              {/* TYPE */}
              <div style={{ marginBottom: '18px' }}>
                <label className="label">Request Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  <option value="">Select request type</option>
                  <option value="full_deletion">Full account deletion</option>
                  <option value="prospect_removal">Remove me as a lead</option>
                  <option value="data_export">Export my data</option>
                  <option value="data_access">Access my data</option>
                  <option value="correction">Correct data</option>
                </select>
              </div>

              {/* NOTES */}
              <div style={{ marginBottom: '18px' }}>
                <label className="label">Additional Info</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional details..."
                  className="input"
                  style={{ minHeight: '90px' }}
                />
              </div>

              <button className="btn-submit" onClick={submitDeletion}>
                Submit Request →
              </button>

              <p style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '14px' }}>
                Under GDPR, you have the right to erasure (Article 17). We will confirm receipt within 48 hours and process your request within 30 days. If we cannot fulfill your request (e.g., due to legal obligations), we will explain why in writing.
              </p>
            </div>
          ) : (
            <div className="success show">
  <div className="success-icon">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="url(#grad2)" strokeWidth="2"/>
      <path d="M7 12l3 3 7-7" stroke="url(#grad2)" strokeWidth="2.5"/>
      <defs>
        <linearGradient id="grad2" x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="#a855f7"/>
          <stop offset="1" stopColor="#6366f1"/>
        </linearGradient>
      </defs>
    </svg>
  </div>

  <h2 className="success-title">Request received</h2>

  <p className="success-text">
    Your deletion request has been submitted successfully.
    <br /><br />
    Reference ID: <strong>{successRef}</strong>
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
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;

          padding-top: 100px;
          padding-bottom: 100px;
        }

        .unsub-card {
          background: rgba(17,17,24,0.85);
          backdrop-filter: blur(14px);
          border-radius: 20px;
          padding: 40px;
          max-width: 620px;
          width: 100%;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--dark);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

/* SAME LOOK FOR DROPDOWN */
select.input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
}

/* FOCUS STATE (important polish) */
.input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
}

       .label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 6px;
  color: var(--muted);
  text-align: left; /* important */
}
  .unsub-card {
  box-shadow:
    0 20px 60px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.04);
}

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          border-radius: 10px;
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
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

.success {
  text-align: center;
  padding: 30px 10px; /* FIX spacing */
}

/* TITLE */
.success-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 14px;
  color: #ffffff; /* FIX visibility */
}

/* TEXT */
.success-text {
  color: #cbd5f5; /* brighter than muted */
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 22px;
}

/* ICON */
.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
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
      `}</style>
    </>
  );
}