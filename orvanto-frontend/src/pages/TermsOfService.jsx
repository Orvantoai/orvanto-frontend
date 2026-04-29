// Navbar moved to App.jsx (rendered globally)
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function TermsOfService() {
  const lastUpdated = "Last updated: April 2025 | Sanfy Consultancy Services Pvt. Ltd.";

  // Sidebar sections — mirrors ApiDocs h3 group + a link pattern
  const sections = [
    { group: "Overview",   items: [{ id: "welcome",        label: "Introduction"           }] },
    { group: "Subscription", items: [
      { id: "1-the-service",          label: "The Service"         },
      { id: "2-free-trial",           label: "Free Trial"          },
      { id: "3-payment-terms",        label: "Payment Terms"       },
    ]},
    { group: "Guarantees & Policy", items: [
      { id: "4-the-3-meeting-guarantee", label: "3-Meeting Guarantee" },
      { id: "5-cancellation-policy",     label: "Cancellation"        },
      { id: "6-acceptable-use",          label: "Acceptable Use"      },
    ]},
    { group: "Legal", items: [
      { id: "7-data-and-privacy",       label: "Data & Privacy"     },
      { id: "8-intellectual-property",  label: "Intellectual Property" },
      { id: "9-limitation-of-liability",label: "Liability"          },
      { id: "10-service-availability",  label: "Availability"       },
      { id: "11-governing-law",         label: "Governing Law"      },
      { id: "12-changes-to-terms",      label: "Changes to Terms"   },
      { id: "13-contact",               label: "Contact"            },
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

  // Staggered reveal — same logic as ApiDocs
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

        {/* ── SIDEBAR ── exact same structure as ApiDocs */}
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
  <h1 id="welcome">Terms of <span style="background:linear-gradient(90deg,#ff95b4,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent">Services</span></h1>
  <span class="version-badge">April 2025 — Sanfy Consultancy Services Pvt. Ltd.</span>

  <div class="highlight-box" style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:10px;padding:18px 22px;margin:24px 0">
    <p>By signing up for Orvanto AI, you agree to these terms. Please read them carefully. If you have questions, contact us at <a href="mailto:support@orvantoai.com">support@orvantoai.com</a> before purchasing.</p>
  </div>

  <h2 id="1-the-service">1. The Service</h2>
  <p>Orvanto AI is a B2B sales automation platform operated by Sanfy Consultancy Services Pvt. Ltd. ("we", "us", "our"), registered in Varanasi, Uttar Pradesh, India. The platform provides automated lead generation, multi-channel outreach (email, SMS, WhatsApp, voice, LinkedIn), reply handling, and meeting booking services.</p>
  <p>We act as a data processor on your behalf when conducting outreach to prospects. You are the data controller responsible for ensuring your use of the platform complies with applicable laws in your jurisdiction.</p>

  <h2 id="2-free-trial">2. Free Trial</h2>
  <p>New clients receive a 7-day free trial. No payment is charged until Day 8. During the trial period:</p>
  <ul>
    <li>Email warmup begins immediately (14-day warmup period)</li>
    <li>ICP setup, lead research, and campaign configuration are completed</li>
    <li>Outreach begins once warmup is complete and DNS is verified</li>
    <li>You may cancel before Day 8 at no charge</li>
  </ul>

  <h2 id="3-payment-terms">3. Payment Terms</h2>
  <p>Subscription fees are charged monthly in advance, processed via Skydo. Prices are listed in USD. By providing payment details, you authorise us to charge your card on the same calendar date each month.</p>
  <ul>
    <li><strong>Starter — $497/mo:</strong> 1 inbox, 50 leads/day, email only</li>
    <li><strong>Growth — $797/mo:</strong> 3 inboxes, 100 leads/day, email + SMS + WhatsApp</li>
    <li><strong>Pro — $1,497/mo:</strong> 5 inboxes, 200 leads/day, all channels + voice AI</li>
  </ul>
  <p>All fees are exclusive of applicable taxes. Indian clients are subject to 18% GST. International clients are not charged Indian GST.</p>

  <h2 id="4-the-3-meeting-guarantee">4. The 3-Meeting Guarantee</h2>
  <p>If you do not receive at least 3 qualified meetings booked within the first 30 days of outreach going live (not from trial start), your second month is completely free. "Outreach going live" means the date your first outreach email was sent by the platform.</p>
  <p>To qualify for the guarantee:</p>
  <ul>
    <li>You must have completed DNS verification within 5 business days of receiving the DNS setup email</li>
    <li>Your Cal.com calendar link must have been provided and must have been accepting bookings throughout the period</li>
    <li>Your ICP criteria must have been completed accurately and in good faith</li>
    <li>You must not have paused outreach for more than 3 consecutive days during the period</li>
  </ul>
  <p>The guarantee applies to the second subscription month only and cannot be applied as a cash refund.</p>

  <h2 id="5-cancellation-policy">5. Cancellation Policy</h2>
  <p>You may cancel your subscription at any time via email to <a href="mailto:support@orvantoai.com">support@orvantoai.com</a> or through the client portal. Cancellation takes effect at the end of the current billing period. No partial refunds are issued for unused days within a billing period.</p>
  <p>Upon cancellation:</p>
  <ul>
    <li>All active outreach campaigns are stopped immediately</li>
    <li>Your data is retained for 90 days, then permanently deleted</li>
    <li>You can request immediate deletion at any time via <a href="/data-deletion">our deletion form</a></li>
  </ul>

  <h2 id="6-acceptable-use">6. Acceptable Use</h2>
  <p>You agree not to use Orvanto AI to:</p>
  <ul>
    <li>Contact individuals who have previously opted out of communications from your business</li>
    <li>Send spam, deceptive, or misleading content</li>
    <li>Target consumers (B2C) — this platform is for business-to-business outreach only</li>
    <li>Violate any applicable laws including CAN-SPAM, GDPR, CASL, or local equivalents</li>
    <li>Impersonate another company or individual</li>
    <li>Attempt to reverse engineer, scrape, or copy our platform</li>
  </ul>
  <p>We reserve the right to terminate your account without notice if you violate these terms.</p>

  <h2 id="7-data-and-privacy">7. Data and Privacy</h2>
  <p>Your use of the platform is also governed by our <a href="/policy">Privacy Policy</a>. We process your data and prospect data in accordance with that policy. You warrant that you have a legitimate basis for contacting the prospects you target.</p>

  <h2 id="8-intellectual-property">8. Intellectual Property</h2>
  <p>All platform code, AI models, content templates, and processes are the intellectual property of Sanfy Consultancy Services Pvt. Ltd. You retain ownership of your business data, client data, and any content you create within the platform.</p>

  <h2 id="9-limitation-of-liability">9. Limitation of Liability</h2>
  <p>To the maximum extent permitted by law, our total liability to you for any claim arising from or related to these terms or the service shall not exceed the total fees paid by you in the 3 months preceding the claim.</p>
  <p>We are not liable for: indirect, incidental, or consequential damages; loss of revenue or profits; failure of third-party services (Apollo, Instantly, OpenAI, Twilio, etc.); or email deliverability outcomes which depend on factors outside our control including recipient mail server policies.</p>

  <h2 id="10-service-availability">10. Service Availability</h2>
  <p>We target 99.5% uptime for all automation workflows. Scheduled maintenance windows are communicated at least 24 hours in advance. We are not liable for downtime caused by third-party service providers (Railway, Supabase, etc.).</p>

  <h2 id="11-governing-law">11. Governing Law</h2>
  <p>These terms are governed by the laws of India. Disputes shall first be attempted to be resolved by good-faith negotiation. Failing that, disputes shall be subject to arbitration in Varanasi, Uttar Pradesh, India under the Arbitration and Conciliation Act, 1996.</p>
  <p>For clients based in the UK or EU, mandatory consumer protection rights under local law are not affected by this clause.</p>

  <h2 id="12-changes-to-terms">12. Changes to Terms</h2>
  <p>We may update these terms from time to time. Material changes will be notified by email at least 14 days in advance. Continued use after that date constitutes acceptance of the new terms.</p>

  <h2 id="13-contact">13. Contact</h2>
  <p>Sanfy Consultancy Services Pvt. Ltd.<br/>Varanasi, Uttar Pradesh, India<br/><a href="mailto:support@orvantoai.com">support@orvantoai.com</a></p>
` }} />

      </div>
      <Footer />

      {/* Scoped sidebar spacing for Terms page */}
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