export const BASE_URL = "https://primary-production-809296.up.railway.app/webhook";

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

export const submitOnboarding = (data) => callWebhook('wf01-client-onboarding', data);
export const submitContact = (data) => callWebhook('wf-support', data);
export const submitUnsubscribe = (data) => callWebhook('wf-unsubscribe', data);
