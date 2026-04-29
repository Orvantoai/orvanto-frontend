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
      `}</style>
    </>
  );
}