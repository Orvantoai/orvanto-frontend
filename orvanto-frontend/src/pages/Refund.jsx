// Navbar moved to App.jsx (rendered globally)
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function RefundPolicy() {
  const lastUpdated = "Last updated: April 2025 | Sanfy Consultancy Services Pvt. Ltd.";

  // Sidebar sections — same grouped h3 + a pattern as TermsOfService / ApiDocs
  const sections = [
    { group: "Overview",   items: [{ id: "welcome",  label: "Our Guarantee" }] },
    { group: "Policy",     items: [
      { id: "1-free-trial--days-17",                label: "Free Trial"           },
      { id: "2-after-day-8--standard-policy",       label: "After Day 8"          },
      { id: "3-the-3-meeting-guarantee-in-detail",  label: "3-Meeting Guarantee"  },
    ]},
    { group: "Cancellation", items: [
      { id: "4-what-happens-when-you-cancel",       label: "When You Cancel"      },
      { id: "5-exceptional-circumstances",          label: "Exceptions"           },
    ]},
    { group: "Support", items: [
      { id: "6-contact",                            label: "Contact"              },
    ]},
  ];

  const allItems = sections.flatMap(s => s.items);

  const [active, setActive] = useState(allItems[0]?.id ?? "welcome");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll spy
  useEffect(() => {
    const ids = allItems.map(i => i.id);
    if (!ids.length) return;
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= window.innerHeight * 0.22) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Staggered reveal — same logic as TermsOfService / ApiDocs
  useEffect(() => {
    const t = setTimeout(() => {
      const navItems = Array.from(document.querySelectorAll(".api-sidebar a"));
      navItems.forEach((el, idx) => {
        el.style.setProperty("--i", idx);
        el.classList.add("reveal-nav");
      });

      const contentEl = document.querySelector(".api-content");
      if (contentEl) {
        const nodes = [];
        Array.from(contentEl.children).forEach(child => {
          nodes.push(child);
          const tag = child.tagName.toLowerCase();
          if (tag === "ul" || tag === "ol") {
            Array.from(child.children).forEach(li => nodes.push(li));
          }
        });
        nodes.forEach((el, idx) => {
          el.style.setProperty("--i", idx + navItems.length);
          el.classList.add("reveal-item");
        });
      }
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
    setSidebarOpen(false);
  };

  return (
    <>
      {/* navbar rendered globally in App.jsx */}
      <div className="layout tos-sidebar-scope">

        <button
          className="refund-sidebar-toggle"
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-expanded={sidebarOpen}
          aria-controls="refund-sidebar"
        >
          Contents
        </button>

        <div
          className={`refund-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* ── SIDEBAR ── exact same structure as TermsOfService / ApiDocs */}
        <aside id="refund-sidebar" className={`api-sidebar refund-sidebar ${sidebarOpen ? "open" : ""}`}>
          <button
            className="refund-sidebar-close"
            type="button"
            onClick={() => setSidebarOpen(false)}
          >
            Close ✕
          </button>
          {sections.map(section => (
            <div key={section.group}>
              <h3>{section.group}</h3>
              {section.items.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={active === item.id ? "active" : ""}
                  onClick={e => handleNavClick(e, item.id)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="api-content" dangerouslySetInnerHTML={{ __html: `
  <h1 id="welcome">Refund <span style="background:linear-gradient(90deg,#ff95b4,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent">Policy</span></h1>
  <span class="version-badge">April 2025 — Sanfy Consultancy Services Pvt. Ltd.</span>

  <div class="highlight-box" style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:10px;padding:10px 22px;margin:24px 0">
    <h3 style="margin-bottom:8px">Our Guarantee</h3>
    <p>3 qualified meetings in 30 days of outreach — or your <strong>second month is completely free.</strong><br>No questions asked. No hoops to jump through.</p>
  </div>

  <h2 id="1-free-trial--days-17">1. Free Trial — Days 1–7</h2>
  <p>Your first 7 days are completely free. No payment is taken until Day 8. During this period we set up your ICP, begin email warmup, and prepare your outreach system. You can cancel at any time before Day 8 with zero charge.</p>

  <h2 id="2-after-day-8--standard-policy">2. After Day 8 — Standard Policy</h2>
  <p>Once your subscription begins on Day 8, we do not offer refunds for the current billing period. This is because significant work has already been performed on your account — warmup infrastructure, lead research, campaign configuration, and AI personalisation setup.</p>
  <p>You may cancel at any time and your account remains active until the end of the paid period.</p>

  <h2 id="3-the-3-meeting-guarantee-in-detail">3. The 3-Meeting Guarantee in Detail</h2>
  <p>If you do not receive at least 3 qualified meetings within 30 days of your outreach going live (first email sent), your second subscription month is billed at £0/$0.</p>
  <p>To claim the guarantee:</p>
  <ul>
    <li>Email <a href="mailto:support@orvantoai.com">support@orvantoai.com</a> after Day 30 with "Guarantee Claim" in the subject</li>
    <li>We verify the meeting count in our system</li>
    <li>If fewer than 3 meetings, Month 2 is automatically waived — no charge</li>
  </ul>
  <p><strong>Conditions that must be met:</strong></p>
  <ul>
    <li>DNS verification was completed within 5 business days</li>
    <li>Your Cal.com link was live and accepting bookings</li>
    <li>Outreach was not paused for more than 3 consecutive days</li>
    <li>ICP was completed accurately</li>
  </ul>

  <h2 id="4-what-happens-when-you-cancel">4. What Happens When You Cancel</h2>

  <div class="timeline">
    <div class="tl-item">
      <div class="tl-dot">1</div>
      <div class="tl-content">
        <h4>Cancellation Confirmed</h4>
        <p>All outreach stops immediately. You receive a confirmation email.</p>
      </div>
    </div>
    <div class="tl-item">
      <div class="tl-dot">2</div>
      <div class="tl-content">
        <h4>Access Until Period End</h4>
        <p>Dashboard access remains active until the end of billing period.</p>
      </div>
    </div>
    <div class="tl-item">
      <div class="tl-dot">3</div>
      <div class="tl-content">
        <h4>Data Retention (90 Days)</h4>
        <p>Your data is stored for 90 days.</p>
      </div>
    </div>
    <div class="tl-item">
      <div class="tl-dot">4</div>
      <div class="tl-content">
        <h4>Permanent Deletion</h4>
        <p>All data is deleted after 90 days. You can request earlier deletion.</p>
      </div>
    </div>
  </div>

  <h2 id="5-exceptional-circumstances">5. Exceptional Circumstances</h2>
  <p>We review refund requests case-by-case for genuine issues like prolonged outages.</p>

  <h2 id="6-contact">6. Contact</h2>
  <p>Sanfy Consultancy Services Pvt. Ltd.<br/>Varanasi, Uttar Pradesh, India<br/><a href="mailto:support@orvantoai.com">support@orvantoai.com</a></p>
` }} />

      </div>
      <Footer />

      {/* Scoped sidebar spacing + timeline styles */}
      <style>{`
        .tos-sidebar-scope .api-sidebar {
          padding: 40px 28px;
        }
        .tos-sidebar-scope .api-sidebar h3 {
          margin-top: 28px;
          margin-bottom: 14px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .tos-sidebar-scope .api-sidebar h3:first-child {
          margin-top: 0;
        }
        .tos-sidebar-scope .api-sidebar a {
          padding: 10px 16px;
          margin-bottom: 4px;
        }
        .tos-sidebar-scope .api-sidebar > div {
          margin-bottom: 8px;
        }
        .refund-sidebar-toggle,
        .refund-sidebar-close {
          display: none;
        }

        /* Timeline styles */
        .timeline{display:flex;flex-direction:column;margin:24px 0}
        .tl-item{display:flex;gap:20px;padding-bottom:24px;position:relative}
        .tl-item:not(:last-child)::before{
          content:'';position:absolute;left:15px;top:32px;bottom:0;width:2px;background:rgba(255,255,255,0.06)
        }
        .tl-dot{
          width:32px;height:32px;border-radius:50%;flex-shrink:0;
          border:2px solid #a855f7;
          display:flex;align-items:center;justify-content:center;
          font-size:.75rem;font-weight:800;color:#a855f7
        }
        .tl-content h4{font-weight:700;margin-bottom:4px;color:#fff}
        .tl-content p{font-size:.88rem;color:rgba(255,255,255,0.7)}
        ul{
          list-style:circle;
          margin:24px 5px;
          padding-left:35px;}

        @media (max-width: 900px) {
          .layout {
            display: block;
            padding: 104px 16px 24px;
          }

          .refund-sidebar-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            z-index: 30;
            margin: 0 0 14px;
            margin-top: 30px;
            padding: 10px 16px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(17,17,24,0.88);
            color: var(--text);
            font-size: 0.52rem;
            font-weight: 700;
            backdrop-filter: blur(18px);
            box-shadow: 0 16px 32px rgba(2,6,23,0.35);
          }

          .refund-sidebar-overlay {
            position: fixed;
            margin-top: 30px;
            inset: 0;
            background: rgba(0,0,0,0.45);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
            z-index: 1190;
          }

          .refund-sidebar-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }

          .refund-sidebar {
            position: fixed;
            top: 104px;
            left: 0;
            width: min(88vw, 340px);
            height: calc(100vh - 104px);
            transform: translateX(-100%);
            transition: transform 0.24s cubic-bezier(.2,.9,.2,1);
            z-index: 1200;
            border-right: 1px solid rgba(255,255,255,0.06);
            border-radius: 0 18px 18px 0;
            background: linear-gradient(180deg, rgba(17,17,24,0.98), rgba(10,10,15,0.96));
            box-shadow: 0 28px 80px rgba(2,6,23,0.6);
            padding: 24px 18px 24px !important;
            margin-top: 12px;
            overflow-y: auto;
          }

          .refund-sidebar.open {
            transform: translateX(0);
          }

          .refund-sidebar-close {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            padding: 8px 12px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(255,255,255,0.03);
            color: var(--text);
            font-size: 0.72rem;
            font-weight: 700;
            width: 100%;
          }

          .refund-sidebar h3 {
            font-size: 0.62rem !important;
            margin-top: 18px !important;
            margin-bottom: 8px !important;
            letter-spacing: 0.14em !important;
          }

          .refund-sidebar a {
            padding: 7px 10px !important;
            font-size: 0.72rem !important;
            border-radius: 8px !important;
          }

          .api-content {
            padding: 22px 14px !important;
            border-radius: 18px;
            box-shadow: none;
            margin-top: 0;
          }

          .api-content h1 {
            font-size: clamp(1.8rem, 6vw, 2.4rem) !important;
            line-height: 1.1 !important;
          }

          .api-content .version-badge {
            font-size: 0.72rem !important;
            padding: 6px 10px !important;
          }

          .api-content h2 {
            font-size: 1.12rem !important;
            margin: 26px 0 8px !important;
          }

          .api-content h3 {
            font-size: 0.95rem !important;
            margin: 18px 0 6px !important;
          }

          .api-content h4 {
            font-size: 0.88rem !important;
            margin: 12px 0 4px !important;
          }

          .api-content p,
          .api-content li {
            font-size: 0.83rem !important;
            line-height: 1.65 !important;
          }

          .api-content ul {
            padding-left: 20px !important;
            margin: 18px 0 !important;
          }

          .api-content .highlight-box {
            padding: 14px 14px !important;
            border-radius: 12px !important;
          }

          .timeline {
            margin: 20px 0 !important;
          }

          .tl-item {
            gap: 16px !important;
            padding-bottom: 20px !important;
          }

          .tl-dot {
            width: 28px !important;
            height: 28px !important;
            font-size: 0.65rem !important;
          }

          .tl-content h4 {
            font-size: 0.8rem !important;
            margin-bottom: 3px !important;
          }

          .tl-content p {
            font-size: 0.75rem !important;
          }

          .api-content table {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            font-size: 0.76rem !important;
          }

          .api-content pre {
            padding: 14px !important;
            font-size: 0.72rem !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .refund-sidebar-toggle {
            top: 96px;
            margin-bottom: 12px;
          }

          .layout {
            padding: 96px 12px 20px;
          }

          .refund-sidebar {
            top: 96px;
            height: calc(100vh - 96px);
            width: min(90vw, 320px);
            padding: 24px 14px 20px !important;
            margin-top: 12px;
          }

          .refund-sidebar h3 {
            font-size: 0.58rem !important;
          }

          .refund-sidebar a {
            font-size: 0.68rem !important;
            padding: 6px 10px !important;
          }

          .api-content {
            padding: 18px 12px !important;
          }

          .api-content h1 {
            font-size: 1.65rem !important;
          }

          .api-content h2 {
            font-size: 1.05rem !important;
          }

          .api-content h3 {
            font-size: 0.88rem !important;
          }

          .api-content h4 {
            font-size: 0.8rem !important;
          }

          .api-content p,
          .api-content li {
            font-size: 0.8rem !important;
          }

          .api-content ul {
            padding-left: 18px !important;
            margin: 16px 0 !important;
          }

          .api-content .highlight-box {
            padding: 12px 12px !important;
            font-size: 0.75rem !important;
          }

          .timeline {
            margin: 16px 0 !important;
          }

          .tl-item {
            gap: 14px !important;
            padding-bottom: 18px !important;
          }

          .tl-dot {
            width: 24px !important;
            height: 24px !important;
            font-size: 0.6rem !important;
          }

          .tl-content h4 {
            font-size: 0.75rem !important;
            margin-bottom: 2px !important;
          }

          .tl-content p {
            font-size: 0.7rem !important;
          }

          .api-content table {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </>
  );
}