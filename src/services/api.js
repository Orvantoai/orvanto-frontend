export const BASE_URL = import.meta.env.VITE_N8N_BASE_URL || "https://primary-production-809296.up.railway.app/webhook";

/**
 * Generic wrapper for n8n webhooks to keep the exact same URL and payload structures
 */
export const callWebhook = async (endpoint, data) => {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error(`Webhook ${endpoint} failed with status ${res.status}`);
  }

  // Not all webhooks return JSON, some might be empty
  try {
    return await res.json();
  } catch (e) {
    return { ok: true };
  }
};

// ── Public / Marketing Webhooks ──────────────────────────────────────────────
export const submitOnboarding  = (data) => callWebhook('wf01-client-onboarding', data);
export const submitContact     = (data) => callWebhook('wf-support', data);
export const submitUnsubscribe = (data) => callWebhook('wf-unsubscribe', data);

// ── Dashboard / Client Portal Webhooks ───────────────────────────────────────
// Replace these with the exact path names from your n8n Webhook nodes.
export const triggerLeadGen = (data) => callWebhook('wf-lead-gen', data);
export const triggerOutreach = (data) => callWebhook('wf-outreach', data);
export const triggerFollowUp = (data) => callWebhook('wf-follow-up', data);
export const bookMeeting = (data) => callWebhook('wf-book-meeting', data);
export const updatePipeline = (data) => callWebhook('wf-pipeline-update', data);
export const generateReport = (data) => callWebhook('wf-generate-report', data);
