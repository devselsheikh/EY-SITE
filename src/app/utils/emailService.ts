// Form submission service
// Flow: always insert into Supabase submissions table first.
// If a webhook endpoint is configured in Form Settings, POST there too.
// Web3Forms is no longer used — all delivery is via webhook or Supabase-only.

export const DAYCARE_RECIPIENT_EMAIL = 'info@theearlyyearscompany.com';
export const EDUHUB_RECIPIENT_EMAIL = 'eduhub@theearlyyearscompany.com';
export const GENERAL_RECIPIENT_EMAIL = 'info@theearlyyearscompany.com';

export interface EmailParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * POST form data to a webhook endpoint.
 * Returns success:true if the server responds 2xx.
 */
export async function postToWebhook(
  endpoint: string,
  data: EmailParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) return { success: true };
    return { success: false, error: `Webhook returned ${response.status}` };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/** Fallback: open the user's email client */
export function createMailtoLink(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}

// Legacy stubs — kept so existing imports don't break; they now no-op
export async function sendDaycareViaWeb3Forms(
  _data: EmailParams
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Web3Forms removed — use Supabase + webhook flow' };
}

export async function sendEduHubViaWeb3Forms(
  _data: EmailParams
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Web3Forms removed — use Supabase + webhook flow' };
}

export async function sendGeneralViaWeb3Forms(
  _data: EmailParams
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Web3Forms removed — use Supabase + webhook flow' };
}
