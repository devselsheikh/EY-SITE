import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppRole } from '../auth/roles';
import type { AttendanceState, WorkspaceData } from './workspaceStore';

const today = () => new Date().toISOString().slice(0, 10);
const profileName = (relation: unknown, fallback: string) => {
  const value = Array.isArray(relation) ? relation[0] : relation;
  return value && typeof value === 'object' && 'display_name' in value ? String(value.display_name || fallback) : fallback;
};
const profileRole = (relation: unknown) => {
  const value = Array.isArray(relation) ? relation[0] : relation;
  return value && typeof value === 'object' && 'role' in value ? String(value.role) : '';
};
const ageLabel = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return 'Age not recorded';
  const born = new Date(`${dateOfBirth}T00:00:00`), now = new Date();
  let months = (now.getFullYear() - born.getFullYear()) * 12 + now.getMonth() - born.getMonth();
  if (now.getDate() < born.getDate()) months -= 1;
  return months < 0 ? 'Age not recorded' : `${Math.floor(months / 12)} years, ${months % 12} months`;
};

export async function loadCloudWorkspace(client: SupabaseClient, userId: string): Promise<WorkspaceData> {
  const [{ data: children, error: childError }, { data: updates, error: updateError }, { data: messages, error: messageError }, { data: consents, error: consentError }] = await Promise.all([
    client.from('children').select('id, display_name, date_of_birth, room_name, key_person:profiles!children_key_person_id_fkey(display_name), child_guardians(relationship, guardian:profiles!child_guardians_guardian_id_fkey(display_name)), attendance_records(state, arrival_at, attendance_date)').eq('active', true).eq('attendance_records.attendance_date', today()),
    client.from('family_updates').select('id, child_id, kind, body, created_at, author:profiles!family_updates_author_id_fkey(display_name)').order('created_at', { ascending: false }).limit(200),
    client.from('family_messages').select('id, child_id, sender_id, body, read_at, created_at, sender:profiles!family_messages_sender_id_fkey(role)').order('created_at', { ascending: true }).limit(200),
    client.from('child_consents').select('child_id, consent_key, granted').eq('guardian_id', userId),
  ]);
  const error = childError || updateError || messageError || consentError;
  if (error) throw new Error(error.message);
  const consentMap: Record<string, boolean> = {};
  for (const item of consents ?? []) consentMap[String(item.consent_key)] = Boolean(item.granted);
  return {
    children: (children ?? []).map((child: any) => {
      const attendance = child.attendance_records?.[0];
      return { id: child.id, name: child.display_name, room: child.room_name || 'Room not assigned', age: ageLabel(child.date_of_birth), keyPerson: profileName(child.key_person, 'Not assigned'), guardian: profileName(child.child_guardians?.[0]?.guardian, 'Not linked'), attendance: (attendance?.state || 'pending') as AttendanceState, arrival: attendance?.arrival_at ? new Date(attendance.arrival_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : undefined, allergies: [] };
    }),
    updates: (updates ?? []).map((item: any) => ({ id: item.id, childId: item.child_id, author: profileName(item.author, 'Early Years team'), body: item.body, createdAt: item.created_at, kind: item.kind })),
    messages: (messages ?? []).map((item: any) => ({ id: item.id, childId: item.child_id, sender: (profileRole(item.sender) === 'parent' ? 'family' : 'team') as 'family' | 'team', body: item.body, createdAt: item.created_at, read: Boolean(item.read_at) })),
    consents: { photos: false, localTrips: false, emergencyCare: false, ...consentMap },
    savedAt: new Date().toISOString(),
  };
}

export async function saveCloudAttendance(client: SupabaseClient, userId: string, childId: string, state: AttendanceState) {
  const { error } = await client.from('attendance_records').upsert({ child_id: childId, attendance_date: today(), state, arrival_at: state === 'present' ? new Date().toISOString() : null, recorded_by: userId }, { onConflict: 'child_id,attendance_date' });
  if (error) throw new Error(error.message);
}
export async function saveCloudUpdate(client: SupabaseClient, userId: string, childId: string, body: string) {
  const { error } = await client.from('family_updates').insert({ child_id: childId, author_id: userId, kind: 'learning', body });
  if (error) throw new Error(error.message);
}
export async function saveCloudMessage(client: SupabaseClient, userId: string, childId: string, body: string) {
  const { error } = await client.from('family_messages').insert({ child_id: childId, sender_id: userId, body });
  if (error) throw new Error(error.message);
}
export async function saveCloudConsent(client: SupabaseClient, userId: string, childId: string, key: string, granted: boolean) {
  const { error } = await client.from('child_consents').upsert({ child_id: childId, guardian_id: userId, consent_key: key, granted, updated_at: new Date().toISOString() }, { onConflict: 'child_id,guardian_id,consent_key' });
  if (error) throw new Error(error.message);
}
