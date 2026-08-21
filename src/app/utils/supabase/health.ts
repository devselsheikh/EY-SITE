import { supabase, supabaseConfigured } from './client';

export type BackendState = 'local' | 'checking' | 'online' | 'degraded';

export interface BackendHealth {
  state: BackendState;
  message: string;
  checkedAt: string;
}

export function localBackendHealth(): BackendHealth {
  return {
    state: 'local',
    message: 'Local mode — public pages and local image slots are available. Cloud workflows are disabled.',
    checkedAt: new Date().toISOString(),
  };
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  if (!supabaseConfigured) return localBackendHealth();

  try {
    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Health check timed out')), 5_000);
    });
    const request = supabase.from('cms_published').select('id').limit(1);
    const result = await Promise.race([request, timeout]);
    if (result.error) throw result.error;
    return { state: 'online', message: 'Cloud services are online.', checkedAt: new Date().toISOString() };
  } catch (error) {
    return {
      state: 'degraded',
      message: `Cloud services are unavailable. Local content remains active. ${error instanceof Error ? error.message : String(error)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}

