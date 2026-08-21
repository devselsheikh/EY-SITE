import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { loadCloudWorkspace, saveCloudAttendance, saveCloudConsent, saveCloudMessage, saveCloudUpdate } from './workspaceCloud';

export type AttendanceState = 'present' | 'absent' | 'pending';

export interface ChildRecord {
  id: string;
  name: string;
  room: string;
  age: string;
  keyPerson: string;
  guardian: string;
  attendance: AttendanceState;
  arrival?: string;
  allergies: string[];
}

export interface FamilyUpdate {
  id: string;
  childId: string;
  author: string;
  body: string;
  createdAt: string;
  kind: 'learning' | 'care' | 'notice';
}

export interface FamilyMessage {
  id: string;
  childId: string;
  sender: 'family' | 'team';
  body: string;
  createdAt: string;
  read: boolean;
}

export interface WorkspaceData {
  children: ChildRecord[];
  updates: FamilyUpdate[];
  messages: FamilyMessage[];
  consents: Record<string, boolean>;
  savedAt: string;
}

const STORAGE_KEY = 'early-years.workspace.v1';

const seedData: WorkspaceData = {
  children: [
    { id: 'child-amira', name: 'Amira Hassan', room: 'Sunflowers', age: '3 years, 8 months', keyPerson: 'Sarah Al-Masri', guardian: 'Mariam Hassan', attendance: 'present', arrival: '8:14 AM', allergies: ['Peanuts'] },
    { id: 'child-youssef', name: 'Youssef Karim', room: 'Sunflowers', age: '4 years, 1 month', keyPerson: 'Sarah Al-Masri', guardian: 'Karim Ali', attendance: 'pending', allergies: [] },
    { id: 'child-lina', name: 'Lina Mostafa', room: 'Butterflies', age: '2 years, 11 months', keyPerson: 'Nadia Hassan', guardian: 'Noha Ibrahim', attendance: 'absent', allergies: ['Dairy'] },
  ],
  updates: [
    { id: 'update-1', childId: 'child-amira', author: 'Sarah Al-Masri', body: 'Amira confidently counted eight shells during today’s sensory activity.', createdAt: new Date(Date.now() - 55 * 60_000).toISOString(), kind: 'learning' },
    { id: 'update-2', childId: 'child-amira', author: 'Early Years team', body: 'Lunch completed. Amira enjoyed the vegetable pasta and fruit.', createdAt: new Date(Date.now() - 25 * 60_000).toISOString(), kind: 'care' },
  ],
  messages: [
    { id: 'message-1', childId: 'child-amira', sender: 'family', body: 'Amira slept well and is excited for music time today.', createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(), read: true },
  ],
  consents: { photos: true, localTrips: true, emergencyCare: true },
  savedAt: new Date().toISOString(),
};
const emptyCloudData = (): WorkspaceData => ({ children: [], updates: [], messages: [], consents: { photos: false, localTrips: false, emergencyCare: false }, savedAt: new Date().toISOString() });

function readStore(): WorkspaceData {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? { ...seedData, ...JSON.parse(value) } : seedData;
  } catch {
    return seedData;
  }
}

export function useWorkspaceStore({ cloud = false, userId = '' }: { cloud?: boolean; userId?: string } = {}) {
  const [data, setData] = useState<WorkspaceData>(() => cloud ? emptyCloudData() : readStore());
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(cloud);

  useEffect(() => {
    if (!cloud || !userId) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    loadCloudWorkspace(supabase, userId).then(value => { if (active) setData(value); }).catch(() => { if (active) setNotice('Cloud records could not be loaded. No records were changed; please retry shortly.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [cloud, userId]);

  useEffect(() => {
    if (cloud) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setNotice('Changes are available for this session, but this browser could not save them locally.');
    }
  }, [cloud, data]);

  const updateAttendance = useCallback((childId: string, attendance: AttendanceState) => {
    const apply = () => setData(current => ({
      ...current,
      children: current.children.map(child => child.id === childId ? {
        ...child,
        attendance,
        arrival: attendance === 'present' ? new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : undefined,
      } : child),
      savedAt: new Date().toISOString(),
    }));
    if (cloud && userId) { void saveCloudAttendance(supabase, userId, childId, attendance).then(() => { apply(); setNotice('Attendance saved securely.'); }).catch(() => setNotice('Attendance was not changed because the cloud could not be reached. Please retry.')); return; }
    apply(); setNotice('Attendance saved on this device.');
  }, [cloud, userId]);

  const addUpdate = useCallback((childId: string, body: string, kind: FamilyUpdate['kind'] = 'learning') => {
    const cleanBody = body.trim();
    if (!cleanBody) return;
    const apply = () => setData(current => ({ ...current, updates: [{ id: crypto.randomUUID(), childId, author: 'Early Years team', body: cleanBody, kind, createdAt: new Date().toISOString() }, ...current.updates], savedAt: new Date().toISOString() }));
    if (cloud && userId) { void saveCloudUpdate(supabase, userId, childId, cleanBody).then(() => { apply(); setNotice('Family update published securely.'); }).catch(() => setNotice('The update was not published. Please copy it and retry.')); return; }
    apply(); setNotice('Family update saved on this device.');
  }, [cloud, userId]);

  const sendMessage = useCallback((childId: string, body: string, sender: FamilyMessage['sender']) => {
    const cleanBody = body.trim();
    if (!cleanBody) return;
    const apply = () => setData(current => ({ ...current, messages: [...current.messages, { id: crypto.randomUUID(), childId, body: cleanBody, sender, createdAt: new Date().toISOString(), read: false }], savedAt: new Date().toISOString() }));
    if (cloud && userId) { void saveCloudMessage(supabase, userId, childId, cleanBody).then(() => { apply(); setNotice('Message sent securely.'); }).catch(() => setNotice('The message was not sent. Please copy it and retry.')); return; }
    apply(); setNotice('Message saved on this device.');
  }, [cloud, userId]);

  const setConsent = useCallback((childId: string, key: string, value: boolean) => {
    const apply = () => setData(current => ({ ...current, consents: { ...current.consents, [key]: value }, savedAt: new Date().toISOString() }));
    if (cloud && userId) { void saveCloudConsent(supabase, userId, childId, key, value).then(() => { apply(); setNotice('Permission preference saved securely.'); }).catch(() => setNotice('The permission preference was not changed. Please retry.')); return; }
    apply(); setNotice('Permission preference saved on this device.');
  }, [cloud, userId]);

  return { data, loading, notice, setNotice, updateAttendance, addUpdate, sendMessage, setConsent };
}
