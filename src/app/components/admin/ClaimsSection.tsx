import { useState, useEffect } from 'react';
import { Shield, Check, X, AlertTriangle, ExternalLink, Plus, Trash2, Eye, EyeOff, Loader2, Info } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClaimRecord {
  id: string;
  claim_text: string;
  verified: boolean;
  evidence_url: string | null;
  evidence_date: string | null;
  internal_note: string | null;
  display: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

// Default claims from the spec — pre-populated if table is empty
const DEFAULT_CLAIMS: Omit<ClaimRecord, 'id' | 'created_at' | 'updated_at'>[] = [
  { claim_text: "Egypt's Most Trusted Nursery", verified: false, evidence_url: null, evidence_date: null, internal_note: 'Source and methodology required before display', display: false, category: 'daycare' },
  { claim_text: 'First CACHE-approved centre in Egypt', verified: false, evidence_url: null, evidence_date: null, internal_note: 'Verify with CACHE UK registry', display: false, category: 'eduhub' },
  { claim_text: 'First and only CACHE-approved centre in Egypt', verified: false, evidence_url: null, evidence_date: null, internal_note: 'Confirm "only" status is still current', display: false, category: 'eduhub' },
  { claim_text: '500+ graduates', verified: false, evidence_url: null, evidence_date: null, internal_note: 'Provide graduation records count', display: false, category: 'eduhub' },
  { claim_text: '98% parent satisfaction', verified: false, evidence_url: null, evidence_date: null, internal_note: 'Survey methodology, sample size, and date required', display: false, category: 'daycare' },
  { claim_text: '200+ surveyed families', verified: false, evidence_url: null, evidence_date: null, internal_note: 'Link to survey data', display: false, category: 'daycare' },
  { claim_text: '4.9/5 rating', verified: false, evidence_url: null, evidence_date: null, internal_note: 'Platform, review count, and date required', display: false, category: 'daycare' },
  { claim_text: '100% UK accredited', verified: false, evidence_url: null, evidence_date: null, internal_note: 'Define scope: which qualifications, which accrediting body', display: false, category: 'eduhub' },
];

const CATEGORY_LABELS: Record<string, string> = {
  daycare: 'Daycare',
  eduhub: 'EduHub',
  global: 'Global',
};

// ─── Claim Card ───────────────────────────────────────────────────────────────

function ClaimCard({ claim, onUpdate, onDelete }: { claim: ClaimRecord; onUpdate: (c: ClaimRecord) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(claim);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('cms_claims').upsert({ ...draft, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    setSaving(false);
    if (!error) { onUpdate(draft); setEditing(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this claim?')) return;
    await supabase.from('cms_claims').delete().eq('id', claim.id);
    onDelete(claim.id);
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${claim.verified ? 'border-green-200' : 'border-amber-200'}`}>
      {/* Header row */}
      <div className={`flex items-start gap-3 p-4 ${claim.verified ? 'bg-green-50' : 'bg-amber-50'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${claim.verified ? 'bg-green-500' : 'bg-amber-400'}`}>
          {claim.verified ? <Check className="w-3.5 h-3.5 text-white" /> : <X className="w-3.5 h-3.5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900">{claim.claim_text}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded bg-white border text-gray-600 capitalize">{CATEGORY_LABELS[claim.category] ?? claim.category}</span>
            {claim.verified ? (
              <span className="text-xs text-green-700 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span>
            ) : (
              <span className="text-xs text-amber-700 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Unverified — not displayed publicly</span>
            )}
            {claim.display ? (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1"><Eye className="w-3 h-3" /> Displayed</span>
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Hidden</span>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => setEditing(e => !e)} className="p-1.5 rounded hover:bg-white text-gray-500 text-xs">Edit</button>
          <button onClick={handleDelete} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Expanded editor */}
      {editing && (
        <div className="p-4 border-t space-y-3 bg-white">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Claim Text</label>
            <input
              type="text"
              value={draft.claim_text}
              onChange={e => setDraft(d => ({ ...d, claim_text: e.target.value }))}
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={draft.category}
                onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="daycare">Daycare</option>
                <option value="eduhub">EduHub</option>
                <option value="global">Global</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Evidence Date</label>
              <input
                type="date"
                value={draft.evidence_date ?? ''}
                onChange={e => setDraft(d => ({ ...d, evidence_date: e.target.value || null }))}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Evidence / Source URL</label>
            <input
              type="url"
              value={draft.evidence_url ?? ''}
              onChange={e => setDraft(d => ({ ...d, evidence_url: e.target.value || null }))}
              placeholder="https://…"
              className="w-full text-sm border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Internal Note</label>
            <textarea
              value={draft.internal_note ?? ''}
              onChange={e => setDraft(d => ({ ...d, internal_note: e.target.value || null }))}
              rows={2}
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.verified}
                onChange={e => setDraft(d => ({ ...d, verified: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.display}
                onChange={e => setDraft(d => ({ ...d, display: e.target.checked }))}
                disabled={!draft.verified}
                className="rounded"
              />
              <span className={`text-sm font-medium ${!draft.verified ? 'text-gray-400' : 'text-gray-700'}`}>
                Display publicly {!draft.verified && '(requires verification)'}
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
            <button onClick={() => { setDraft(claim); setEditing(false); }} className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50">Cancel</button>
            {claim.evidence_url && (
              <a href={claim.evidence_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50 ml-auto text-blue-600">
                <ExternalLink className="w-3.5 h-3.5" /> View Evidence
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ClaimsSection ───────────────────────────────────────────────────────

export function ClaimsSection() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('cms_claims').select('*').order('category').order('claim_text');
      if (error || !data) {
        // Table doesn't exist yet — use local state with defaults
        setUseLocalFallback(true);
        setClaims(DEFAULT_CLAIMS.map((c, i) => ({ ...c, id: `local-${i}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })));
      } else if (data.length === 0) {
        setClaims(DEFAULT_CLAIMS.map((c, i) => ({ ...c, id: `local-${i}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })));
        setUseLocalFallback(true);
      } else {
        setClaims(data as ClaimRecord[]);
      }
      setLoading(false);
    })();
  }, []);

  const unverifiedCount = claims.filter(c => !c.verified).length;
  const displayedUnverified = claims.filter(c => !c.verified && c.display).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Claims & Verification</h2>
        <p className="text-sm text-gray-500 mt-1">
          Every public claim requires evidence and explicit verification before it appears on the site.
        </p>
      </div>

      {useLocalFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Database table not yet created</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The <code className="font-mono bg-amber-100 px-1 rounded">cms_claims</code> table does not exist in Supabase. Create it using the migration in <code className="font-mono bg-amber-100 px-1 rounded">supabase/migrations/001_cms_hardening.sql</code>. Changes here are local only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-3 text-center">
          <p className="text-2xl font-bold text-gray-700">{claims.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Claims</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${unverifiedCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
          <p className={`text-2xl font-bold ${unverifiedCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{unverifiedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unverified</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${displayedUnverified > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
          <p className={`text-2xl font-bold ${displayedUnverified > 0 ? 'text-red-600' : 'text-green-600'}`}>{displayedUnverified}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unverified & Displayed</p>
        </div>
      </div>

      {displayedUnverified > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">
            {displayedUnverified} unverified claim{displayedUnverified > 1 ? 's are' : ' is'} set to display. Turn off display or add evidence and verify before publishing.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Claims marked as <strong>Verified + Display</strong> may appear on public pages. Unverified claims are never rendered publicly, regardless of the display toggle.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading claims…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onUpdate={updated => setClaims(prev => prev.map(c => c.id === updated.id ? updated : c))}
              onDelete={id => setClaims(prev => prev.filter(c => c.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
