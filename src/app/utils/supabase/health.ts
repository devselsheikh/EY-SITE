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
    const request = Promise.all([
      supabase.from('cms_published').select('id', { head: true, count: 'exact' }),
      supabase.from('profiles').select('id', { head: true, count: 'exact' }),
      supabase.from('children').select('id', { head: true, count: 'exact' }),
      supabase.from('family_updates').select('id', { head: true, count: 'exact' }),
    ]);
    const results = await Promise.race([request, timeout]);
    const failure = results.find(result => result.error)?.error;
    if (failure) throw failure;
    return { state: 'online', message: 'Cloud authentication, content, profiles, and child-management records are reachable.', checkedAt: new Date().toISOString() };
  } catch (error) {
    return {
      state: 'degraded',
      message: `Cloud services need attention. Local content and device-saved workflows remain active. ${error instanceof Error ? error.message : String(error)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}
