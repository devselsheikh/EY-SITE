// ─────────────────────────────────────────────────────────────────────────────
// PopupSection — CMS admin panel for managing site-wide announcement popups.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Check, X, Loader2, Bell, BellOff, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface SitePopupRow {
  id: string;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  badge_text: string | null;
  pages: 'all' | 'daycare' | 'eduhub';
  delay_seconds: number;
  show_once: boolean;
  enabled: boolean;
  bg_color: string | null;
  created_at: string;
}

const BLANK: Omit<SitePopupRow, 'id' | 'created_at'> = {
  title: '',
  body: '',
  cta_label: '',
  cta_url: '',
  badge_text: '',
  pages: 'all',
  delay_seconds: 3,
  show_once: true,
  enabled: false,
  bg_color: 'from-peach-400 to-coral-500',
};

const BG_OPTIONS = [
  { label: 'Peach → Coral', value: 'from-peach-400 to-coral-500' },
  { label: 'Blue → Indigo', value: 'from-blue-500 to-indigo-600' },
  { label: 'Emerald → Teal', value: 'from-emerald-400 to-teal-500' },
  { label: 'Violet → Purple', value: 'from-violet-500 to-purple-600' },
  { label: 'Amber → Orange', value: 'from-amber-400 to-orange-500' },
];

export function PopupSection() {
  const [popups, setPopups] = useState<SitePopupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // id or 'new'
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('site_popups')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setPopups((data ?? []) as SitePopupRow[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(BLANK); setEditing('new'); setSaveMsg(null); };
  const openEdit = (p: SitePopupRow) => {
    setForm({ ...p });
    setEditing(p.id);
    setSaveMsg(null);
  };
  const cancelEdit = () => { setEditing(null); setSaveMsg(null); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setSaveMsg('Title and body are required.');
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      cta_label: form.cta_label?.trim() || null,
      cta_url: form.cta_url?.trim() || null,
      badge_text: form.badge_text?.trim() || null,
      pages: form.pages,
      delay_seconds: form.delay_seconds,
      show_once: form.show_once,
      enabled: form.enabled,
      bg_color: form.bg_color,
    };

    if (editing === 'new') {
      const { error: err } = await supabase.from('site_popups').insert(payload);
      if (err) { setSaveMsg(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('site_popups').update(payload).eq('id', editing);
      if (err) { setSaveMsg(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setSaveMsg('Saved successfully.');
    setEditing(null);
    load();
  };

  const handleToggle = async (p: SitePopupRow) => {
    await supabase.from('site_popups').update({ enabled: !p.enabled }).eq('id', p.id);
    setPopups(prev => prev.map(x => x.id === p.id ? { ...x, enabled: !x.enabled } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this popup?')) return;
    setDeleting(id);
    await supabase.from('site_popups').delete().eq('id', id);
    setDeleting(null);
    load();
  };

  const f = (field: keyof typeof form, val: unknown) => setForm(prev => ({ ...prev, [field]: val }));

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 py-8">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading popups…
    </div>
  );

  if (error) return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 inline mr-1" /> {error}
      <p className="text-xs mt-1">If this table does not exist, see the setup instructions below.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Announcement Popups</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Create popups that appear on public pages. Enable/disable without deleting.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-peach-400 to-coral-500 text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> New Popup
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="border border-blue-200 rounded-2xl bg-blue-50 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">{editing === 'new' ? 'New Popup' : 'Edit Popup'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
              <input value={form.title} onChange={e => f('title', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Welcome back to a new term!" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Body *</label>
              <textarea value={form.body} onChange={e => f('body', e.target.value)} rows={4}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Message text shown to visitors. Use line breaks for paragraphs." />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Badge label (optional)</label>
              <input value={form.badge_text ?? ''} onChange={e => f('badge_text', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="📣 Announcement" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Header colour</label>
              <select value={form.bg_color ?? ''} onChange={e => f('bg_color', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CTA button label</label>
              <input value={form.cta_label ?? ''} onChange={e => f('cta_label', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Learn more" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CTA URL</label>
              <input value={form.cta_url ?? ''} onChange={e => f('cta_url', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="/daycare/contact or https://…" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Show on pages</label>
              <select value={form.pages} onChange={e => f('pages', e.target.value as 'all' | 'daycare' | 'eduhub')}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="all">All pages</option>
                <option value="daycare">Daycare only</option>
                <option value="eduhub">EduHub only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Delay before showing (seconds)</label>
              <input type="number" min={0} max={30} value={form.delay_seconds}
                onChange={e => f('delay_seconds', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.show_once} onChange={e => f('show_once', e.target.checked)}
                  className="w-4 h-4 rounded accent-coral-500" />
                Show once per session
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => f('enabled', e.target.checked)}
                  className="w-4 h-4 rounded accent-coral-500" />
                Enabled
              </label>
            </div>
          </div>

          {saveMsg && (
            <p className={`text-xs ${saveMsg.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {saveMsg}
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save Popup'}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Popup list */}
      {popups.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No popups yet. Create one to announce events, enrolment periods, or news.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {popups.map(p => (
            <div key={p.id} className={`border rounded-2xl p-4 bg-white ${p.enabled ? 'border-green-200' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.enabled ? '● Live' : '○ Disabled'}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-full capitalize">{p.pages}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.body}</p>
                  {p.cta_label && <p className="text-[10px] text-blue-600 mt-0.5">CTA: {p.cta_label} → {p.cta_url}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleToggle(p)} title={p.enabled ? 'Disable' : 'Enable'}
                    className={`p-2 rounded-xl transition-colors ${p.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    {p.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(p)} title="Edit"
                    className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                    title="Delete" className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
                    {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DB setup instructions */}
      <div className="border border-dashed border-gray-300 rounded-2xl p-5 bg-gray-50 space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Database Setup (run once)</h3>
        <p className="text-xs text-gray-500">
          If popups aren't loading, the Supabase table may not exist. Run this SQL in your Supabase SQL editor:
        </p>
        <pre className="bg-gray-900 text-green-300 text-[11px] rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre">{`create table if not exists site_popups (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  cta_label   text,
  cta_url     text,
  badge_text  text,
  pages       text not null default 'all'
              check (pages in ('all','daycare','eduhub')),
  delay_seconds int not null default 3,
  show_once   boolean not null default true,
  enabled     boolean not null default false,
  bg_color    text,
  created_at  timestamptz not null default now()
);

-- Allow public read of enabled popups
alter table site_popups enable row level security;

create policy "Public can read enabled popups"
  on site_popups for select
  using (enabled = true);

create policy "Admins can manage popups"
  on site_popups for all
  using (auth.role() = 'authenticated');`}</pre>
      </div>
    </div>
  );
}
