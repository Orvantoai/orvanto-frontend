// Navbar moved to App.jsx (rendered globally)
import { useEffect } from "react";
import Footer from "../components/Footer";

export default function ApiDocs() {
  useEffect(() => {
    // staggered reveal for sidebar and content
    const t = setTimeout(() => {
      const navItems = Array.from(document.querySelectorAll('.api-sidebar a'));
      navItems.forEach((el, idx) => {
        el.style.setProperty('--i', idx);
        el.classList.add('reveal-nav');
      });

      const contentEl = document.querySelector('.api-content');
      if (contentEl) {
        const nodes = [];
        const children = Array.from(contentEl.children);
        children.forEach(child => {
          nodes.push(child);
          const tag = child.tagName.toLowerCase();
          if (tag === 'ul' || tag === 'ol') {
            Array.from(child.children).forEach(li => nodes.push(li));
          }
        });

        nodes.forEach((el, idx) => {
          el.style.setProperty('--i', idx + navItems.length);
          el.classList.add('reveal-item');
        });
      }
    }, 80);

    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {/* navbar rendered globally in App.jsx */}
      <div className="layout">
        <aside className="api-sidebar" dangerouslySetInnerHTML={{ __html: `
    <h3>Overview</h3>
    <a href="#intro" class="active">Introduction</a>
    <a href="#auth">Authentication</a>
    <a href="#base-url">Base URL</a>
    <h3>Webhooks</h3>
    <a href="#wf01">Client Onboarding</a>
    <a href="#wf-support">Support Tickets</a>
    <a href="#wf-unsubscribe">Unsubscribe</a>
    <a href="#wf16">Cal.com Meetings</a>
    <a href="#wf27">Cost Logging</a>
    <h3>Responses</h3>
    <a href="#errors">Error Codes</a>
    <a href="#limits">Rate Limits</a>
  ` }} />

        <main className="api-content" dangerouslySetInnerHTML={{ __html: `
    <h1 id="intro">API Reference</h1>
    <span class="version-badge">v2.0 — April 2025</span>

    <p>Orvanto AI exposes a set of webhook endpoints for integration with external systems. These endpoints power the automation workflows and can also be used for custom integrations.</p>
    <p>All endpoints are hosted on Railway and accept JSON payloads over HTTPS.</p>

    <h2 id="auth">Authentication</h2>
    <p>Webhook endpoints do not require authentication headers — they are secured by URL secrecy and rate limiting. Do not share your webhook URLs publicly.</p>
    <p>Supabase direct access requires your service role key, available in your Supabase dashboard under <strong>Settings → API</strong>.</p>

    <h2 id="base-url">Base URL</h2>
    <div class="endpoint-bar">https://primary-production-809296.up.railway.app</div>
    <p>All webhook paths are relative to this base URL.</p>

    <h2 id="wf01">POST /webhook/wf01-client-onboarding</h2>
    <p>Creates a new client account, triggers ICP generation, sets up Instantly campaign infrastructure, and sends welcome emails. Called by the signup form on Day 1.</p>

    <div class="endpoint-bar"><span class="method post">POST</span>/webhook/wf01-client-onboarding</div>

    <h3>Request Body</h3>
    <table>
      <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td>companyName</td><td>string</td><td><span class="required">required</span></td><td>Company name</td></tr>
        <tr><td>contactName</td><td>string</td><td><span class="required">required</span></td><td>Primary contact full name</td></tr>
        <tr><td>email</td><td>string</td><td><span class="required">required</span></td><td>Contact email address</td></tr>
        <tr><td>website</td><td>string</td><td><span class="required">required</span></td><td>Company website URL</td></tr>
        <tr><td>phone</td><td>string</td><td><span class="optional">optional</span></td><td>Phone number with country code</td></tr>
        <tr><td>targetJobTitles</td><td>string[]</td><td><span class="required">required</span></td><td>ICP job titles to target</td></tr>
        <tr><td>targetIndustries</td><td>string[]</td><td><span class="required">required</span></td><td>Target industries</td></tr>
        <tr><td>targetCompanySizes</td><td>string[]</td><td><span class="required">required</span></td><td>e.g. ["1-10","11-50","51-200"]</td></tr>
        <tr><td>targetGeographies</td><td>string[]</td><td><span class="required">required</span></td><td>Country codes or names</td></tr>
        <tr><td>valueProposition</td><td>string</td><td><span class="required">required</span></td><td>1-2 sentence value prop</td></tr>
        <tr><td>calLink</td><td>string</td><td><span class="required">required</span></td><td>Cal.com booking URL</td></tr>
        <tr><td>plan</td><td>string</td><td><span class="required">required</span></td><td>"starter" | "growth" | "pro"</td></tr>
      </tbody>
    </table>

    <h3>Example Request</h3>
    <pre>{
  "companyName": "Acme Corp",
  "contactName": "Jane Smith",
  "email": "jane@acmecorp.com",
  "website": "https://acmecorp.com",
  "targetJobTitles": ["Head of Sales", "VP Sales", "Sales Director"],
  "targetIndustries": ["SaaS", "Technology"],
  "targetCompanySizes": ["11-50", "51-200"],
  "targetGeographies": ["United Kingdom", "United States"],
  "valueProposition": "We help SaaS companies reduce churn by 40% in 90 days.",
  "calLink": "https://cal.com/jane-smith/30min",
  "plan": "growth"
}</pre>

    <h3>Response</h3>
    <pre>{
  "success": true,
  "clientId": "acme-corp-1234",
  "portalToken": "pt_xxxxxxxxxxxx",
  "dashboardUrl": "https://orvantoai.com/dashboard.html?client=acme-corp-1234",
  "portalUrl": "https://orvantoai.com/portal.html?token=pt_xxxxxxxxxxxx"
}</pre>

    <h2 id="wf-support">POST /webhook/wf-support</h2>
    <p>Creates a support ticket. Used by the contact form and data deletion form.</p>
    <div class="endpoint-bar"><span class="method post">POST</span>/webhook/wf-support</div>

    <h3>Request Body</h3>
    <table>
      <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td>name</td><td>string</td><td><span class="required">required</span></td><td>Requester name</td></tr>
        <tr><td>email</td><td>string</td><td><span class="required">required</span></td><td>Requester email</td></tr>
        <tr><td>client_id</td><td>string</td><td><span class="optional">optional</span></td><td>Client ID if existing client</td></tr>
        <tr><td>issue_type</td><td>string</td><td><span class="optional">optional</span></td><td>Category of issue</td></tr>
        <tr><td>description</td><td>string</td><td><span class="required">required</span></td><td>Issue description</td></tr>
        <tr><td>urgency</td><td>string</td><td><span class="optional">optional</span></td><td>"low" | "normal" | "urgent"</td></tr>
      </tbody>
    </table>

    <h2 id="wf-unsubscribe">POST /webhook/wf-unsubscribe</h2>
    <p>Adds an email to the global suppression list. All outreach to this address stops permanently.</p>
    <div class="endpoint-bar"><span class="method post">POST</span>/webhook/wf-unsubscribe</div>

    <h3>Request Body</h3>
    <table>
      <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td>email</td><td>string</td><td><span class="required">required</span></td><td>Email to suppress</td></tr>
        <tr><td>source</td><td>string</td><td><span class="optional">optional</span></td><td>e.g. "unsubscribe_page", "email_link"</td></tr>
        <tr><td>timestamp</td><td>string</td><td><span class="optional">optional</span></td><td>ISO 8601 timestamp</td></tr>
      </tbody>
    </table>

    <h2 id="wf16">POST /webhook/wf16-meeting</h2>
    <p>Cal.com sends booking events to this endpoint. Parses BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED, and MEETING_ENDED events.</p>
    <div class="endpoint-bar"><span class="method post">POST</span>/webhook/wf16-meeting</div>

    <h3>Expected Cal.com Payload Structure</h3>
    <pre>{
  "triggerEvent": "BOOKING_CREATED",
  "payload": {
    "uid": "booking-uid-here",
    "startTime": "2025-05-01T10:00:00Z",
    "endTime": "2025-05-01T10:30:00Z",
    "attendees": [
      {
        "email": "prospect@company.com",
        "name": "John Prospect",
        "timeZone": "Europe/London"
      }
    ],
    "organizer": {
      "email": "client@yourcompany.com",
      "name": "Client Name"
    },
    "title": "30 Minute Discovery Call",
    "description": "Meeting booked via Orvanto AI"
  }
}</pre>

    <h2 id="wf27">POST /webhook/wf27-cost</h2>
    <p>Internal cost logging endpoint. Called after every API operation (OpenAI, Apollo, Twilio, etc.) to track usage costs. Responds immediately — write is async.</p>
    <div class="endpoint-bar"><span class="method post">POST</span>/webhook/wf27-cost</div>

    <h3>Request Body</h3>
    <table>
      <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td>client_id</td><td>string</td><td><span class="required">required</span></td><td>Client identifier</td></tr>
        <tr><td>workflow</td><td>string</td><td><span class="required">required</span></td><td>Workflow name e.g. "WF-03"</td></tr>
        <tr><td>service</td><td>string</td><td><span class="required">required</span></td><td>"openai" | "apollo" | "twilio" | "instantly" | "vapi"</td></tr>
        <tr><td>cost_usd</td><td>number</td><td><span class="required">required</span></td><td>Cost in USD</td></tr>
        <tr><td>tokens_used</td><td>number</td><td><span class="optional">optional</span></td><td>Token count (OpenAI only)</td></tr>
        <tr><td>details</td><td>string</td><td><span class="optional">optional</span></td><td>Any additional context</td></tr>
      </tbody>
    </table>

    <h3>Response</h3>
    <pre>{ "ok": true }</pre>

    <h2 id="errors">Error Codes</h2>
    <table>
      <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
      <tbody>
        <tr><td>200</td><td>Success</td></tr>
        <tr><td>400</td><td>Bad request — missing required fields</td></tr>
        <tr><td>404</td><td>Webhook path not found</td></tr>
        <tr><td>500</td><td>Internal server error — retry after 30s</td></tr>
      </tbody>
    </table>

    <h2 id="limits">Rate Limits</h2>
    <p>Webhooks are rate limited to <strong>100 requests per minute</strong> per IP address. Exceeding this returns a <code>429 Too Many Requests</code> response. For high-volume integrations, contact <a href="mailto:support@orvantoai.com">support@orvantoai.com</a>.</p>
  ` }} />
      </div>
      <Footer />
      <style>{`
  ul {
    list-style: circle;
    margin: 24px 5px;
    padding-left: 35px;
  }
`}</style>
    </>
  );
}