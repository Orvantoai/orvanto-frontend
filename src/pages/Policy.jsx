// Navbar moved to App.jsx (rendered globally)
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";

export default function Policy() {
  const lastUpdated = "Last updated: April 2025 | Sanfy Consultancy Services Pvt. Ltd.";

  // Sidebar sections — same grouped h3 + a pattern as TermsOfService / ApiDocs
  const sections = [
    {
      group: "Overview", items: [
        { id: "welcome", label: "Introduction" },
        { id: "1-who-we-are", label: "Who We Are" },
      ]
    },
    {
      group: "Data Handling", items: [
        { id: "2-data-we-collect", label: "Data We Collect" },
        { id: "3-how-we-use-your-data", label: "How We Use Data" },
        { id: "4-compliance-gdpr--can-spam", label: "Compliance" },
        { id: "5-data-sharing", label: "Data Sharing" },
        { id: "6-data-retention", label: "Data Retention" },
      ]
    },
    {
      group: "Your Rights & Security", items: [
        { id: "7-your-rights", label: "Your Rights" },
        { id: "8-security", label: "Security" },
        { id: "9-cookies", label: "Cookies" },
      ]
    },
    {
      group: "Support", items: [
        { id: "10-contact", label: "Contact" },
      ]
    },
  ];

  const allItems = sections.flatMap(s => s.items);

  const [active, setActive] = useState(allItems[0]?.id ?? "welcome");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarSections = useMemo(() => sections, []);

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
      <div className="policy-page layout tos-sidebar-scope">

        <button
          className="policy-sidebar-toggle"
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-expanded={sidebarOpen}
          aria-controls="policy-sidebar"
        >
          Contents
        </button>

        <div
          className={`policy-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* ── SIDEBAR ── exact same structure as TermsOfService / ApiDocs */}
        <aside id="policy-sidebar" className={`api-sidebar policy-sidebar ${sidebarOpen ? "open" : ""}`}>
          <button
            className="policy-sidebar-close"
            type="button"
            onClick={() => setSidebarOpen(false)}
          >
            Close ✕
          </button>

          {sidebarSections.map(section => (
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
        <main className="api-content policy-content" dangerouslySetInnerHTML={{
          __html: `
  <h1 id="welcome">Privacy <span style="background:linear-gradient(90deg,#ff95b4,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent">Policy</span></h1>
  <span class="version-badge">April 2025 — Sanfy Consultancy Services Pvt. Ltd.</span>

  <h2 id="1-who-we-are">1. Who We Are</h2>
  <p>Orvanto AI is a service operated by Sanfy Consultancy Services Pvt. Ltd., registered in Varanasi, Uttar Pradesh, India. We provide B2B sales automation services to businesses worldwide. Our registered address is Varanasi, Uttar Pradesh, India. You can contact us at <a href="mailto:support@orvantoai.com">support@orvantoai.com</a>.</p>

  <h2 id="2-data-we-collect">2. Data We Collect</h2>
  <p>We collect the following categories of data:</p>
  <ul>
    <li><strong>Client data:</strong> Company name, contact name, work email, phone number, website, business information, payment details</li>
    <li><strong>Prospect data (Leads):</strong> Names, emails, job titles, LinkedIn URLs, phone numbers</li>
    <li><strong>Usage data:</strong> Dashboard activity, feature usage, login times</li>
    <li><strong>Communication data:</strong> Email content, replies, SMS</li>
    <li><strong>Performance data:</strong> API usage, campaign analytics</li>
  </ul>

  <h2 id="3-how-we-use-your-data">3. How We Use Your Data</h2>
  <ul>
    <li>Deliver automation services</li>
    <li>Run outreach campaigns</li>
    <li>Generate AI content</li>
    <li>Process payments</li>
    <li>Send reports</li>
    <li>Improve platform</li>
  </ul>

  <h2 id="4-compliance-gdpr--can-spam">4. Compliance (GDPR / CAN-SPAM)</h2>
  <p>We comply with global data regulations and provide opt-out options in all communications.</p>

  <h2 id="5-data-sharing">5. Data Sharing</h2>
  <p>We share data with tools like Apollo, Instantly, OpenAI, Twilio, Supabase, etc. We do not sell data.</p>

  <h2 id="6-data-retention">6. Data Retention</h2>
  <ul>
    <li>Client data: duration of subscription</li>
    <li>Post cancellation: 90 days</li>
    <li>Leads: 24 months</li>
  </ul>

  <h2 id="7-your-rights">7. Your Rights</h2>
  <ul>
    <li>Access</li>
    <li>Correction</li>
    <li>Deletion</li>
    <li>Export</li>
  </ul>

  <h2 id="8-security">8. Security</h2>
  <p>We use encryption, access control, and secure infrastructure.</p>

  <h2 id="9-cookies">9. Cookies</h2>
  <p>We use essential + analytics cookies.</p>

  <h2 id="10-contact">10. Contact</h2>
  <p>Sanfy Consultancy Services Pvt. Ltd.<br/>Varanasi, Uttar Pradesh, India<br/><a href="mailto:support@orvantoai.com">support@orvantoai.com</a></p>
` }} />

      </div>
      <Footer />

      {/* Scoped sidebar spacing — same as TermsOfService */}
      <style>{`
        .policy-page {
          position: relative;
        }
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
        .policy-sidebar-toggle,
        .policy-sidebar-close {
          display: none;
        }
        ul{
          list-style:circle;
          margin:24px 5px;
          padding-left:35px;}
/* Desktop Layout Fix */
.layout {
  display: flex;
  align-items: flex-start;
  gap: 20px; /* or 20px if you want spacing */
}

/* Sidebar fixed width */
.api-sidebar {
  width: 260px;
  min-width: 260px;
  position: sticky;
  top: 104px; /* matches navbar offset */
  height: calc(100vh - 104px);
  overflow-y: auto;
}

/* Main content should take remaining space */
.api-content {
  flex: 1;
  max-width: 100%;
}
  .api-content {
  padding-left: 40px;
}
        @media (max-width: 900px) {
          .policy-page.layout {
            display: block;
            padding: 104px 16px 24px;
          }

          .policy-sidebar-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            
            z-index: 30;
            margin: 0 0 14px;
            margin-top:30px;
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

          .policy-sidebar-overlay {
            position: fixed;
            margin-top:30px;
            inset: 0;
            background: rgba(0,0,0,0.45);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
            z-index: 1190;
          }

          .policy-sidebar-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }

          .policy-sidebar {
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

          .policy-sidebar.open {
            transform: translateX(0);
          }

          .policy-sidebar-close {
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

          .policy-sidebar h3 {
            font-size: 0.62rem !important;
            margin-top: 18px !important;
            margin-bottom: 8px !important;
            letter-spacing: 0.14em !important;
          }

          .policy-sidebar a {
            padding: 7px 10px !important;
            font-size: 0.72rem !important;
            border-radius: 8px !important;
          }

          .policy-content {
            padding: 22px 14px !important;
            border-radius: 18px;
            box-shadow: none;
            margin-top: 0;
          }

          .policy-content h1 {
            font-size: clamp(1.8rem, 6vw, 2.4rem) !important;
            line-height: 1.1 !important;
          }

          .policy-content .version-badge {
            font-size: 0.72rem !important;
            padding: 6px 10px !important;
          }

          .policy-content h2 {
            font-size: 1.12rem !important;
            margin: 26px 0 8px !important;
          }

          .policy-content h3 {
            font-size: 0.95rem !important;
            margin: 18px 0 6px !important;
          }

          .policy-content p,
          .policy-content li {
            font-size: 0.83rem !important;
            line-height: 1.65 !important;
          }

          .policy-content ul {
            padding-left: 20px !important;
            margin: 18px 0 !important;
          }

          .policy-content table {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            font-size: 0.76rem !important;
          }

          .policy-content pre {
            padding: 14px !important;
            font-size: 0.72rem !important;
            border-radius: 10px !important;
          }

          .policy-content .highlight-box,
          .policy-content .endpoint-bar {
            padding: 14px 14px !important;
            border-radius: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .policy-sidebar-toggle {
            top: 96px;
            margin-bottom: 12px;
          }

          .policy-page.layout {
            padding: 96px 12px 20px;
          }

          .policy-sidebar {
            top: 96px;
            height: calc(100vh - 96px);
            width: min(90vw, 320px);
            padding: 24px 14px 20px !important;
            margin-top: 12px;
          }

          .policy-sidebar h3 {
            font-size: 0.58rem !important;
          }

          .policy-sidebar a {
            font-size: 0.68rem !important;
            padding: 6px 10px !important;
          }

          .policy-content {
            padding: 18px 12px !important;
          }

          .policy-content h1 {
            font-size: 1.65rem !important;
          }

          .policy-content h2 {
            font-size: 1.05rem !important;
          }

          .policy-content p,
          .policy-content li {
            font-size: 0.8rem !important;
          }

          .policy-content ul {
            padding-left: 18px !important;
            margin: 16px 0 !important;
          }

          .policy-content table {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </>
  );
}