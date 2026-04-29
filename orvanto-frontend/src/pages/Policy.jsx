// Navbar moved to App.jsx (rendered globally)
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function Policy() {
  const lastUpdated = "Last updated: April 2025 | Sanfy Consultancy Services Pvt. Ltd.";

  // Sidebar sections — same grouped h3 + a pattern as TermsOfService / ApiDocs
  const sections = [
    { group: "Overview", items: [
      { id: "welcome",                      label: "Introduction"     },
      { id: "1-who-we-are",                 label: "Who We Are"       },
    ]},
    { group: "Data Handling", items: [
      { id: "2-data-we-collect",            label: "Data We Collect"  },
      { id: "3-how-we-use-your-data",       label: "How We Use Data"  },
      { id: "4-compliance-gdpr--can-spam",   label: "Compliance"       },
      { id: "5-data-sharing",               label: "Data Sharing"     },
      { id: "6-data-retention",             label: "Data Retention"   },
    ]},
    { group: "Your Rights & Security", items: [
      { id: "7-your-rights",               label: "Your Rights"      },
      { id: "8-security",                  label: "Security"         },
      { id: "9-cookies",                   label: "Cookies"          },
    ]},
    { group: "Support", items: [
      { id: "10-contact",                  label: "Contact"          },
    ]},
  ];

  const allItems = sections.flatMap(s => s.items);

  const [active, setActive] = useState(allItems[0]?.id ?? "welcome");

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
  };

  return (
    <>
      {/* navbar rendered globally in App.jsx */}
      <div className="layout tos-sidebar-scope">

        {/* ── SIDEBAR ── exact same structure as TermsOfService / ApiDocs */}
        <aside className="api-sidebar">
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
          ul{
          list-style:circle;
          margin:24px 5px;
          padding-left:35px;}
      `}</style>
    </>
  );
}