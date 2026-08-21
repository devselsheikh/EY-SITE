import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Loader2, Clock, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicationRecord {
  id: string;
  status: 'pending' | 'in_progress' | 'succeeded' | 'failed' | 'rolled_back';
  started_at: string;
  completed_at: string | null;
  initiated_by: string | null;
  manifest_version: number | null;
  deployment_reference: string | null;
  error_message: string | null;
  rollback_of: string | null;
}

const STATUS_CONFIG: Record<PublicationRecord['status'], { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  pending:     { label: 'Pending', color: 'text-gray-500 bg-gray-100', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-600 bg-blue-100', icon: Loader2 },
  succeeded:   { label: 'Succeeded', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  failed:      { label: 'Failed', color: 'text-red-600 bg-red-100', icon: XCircle },
  rolled_back: { label: 'Rolled Back', color: 'text-amber-600 bg-amber-100', icon: RotateCcw },
};

// ─── Publication Row ──────────────────────────────────────────────────────────

function PublicationRow({ pub }: { pub: PublicationRecord }) {
  const cfg = STATUS_CONFIG[pub.status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-4 p-4 border rounded-xl bg-white">
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color} flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${pub.status === 'in_progress' ? 'animate-spin' : ''}`} />
        {cfg.label}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
          <span className="font-mono text-gray-400">{pub.id.slice(0, 8)}</span>
          {pub.manifest_version && <span>Manifest v{pub.manifest_version}</span>}
          {pub.initiated_by && <span>by {pub.initiated_by}</span>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Started: {new Date(pub.started_at).toLocaleString()}
          {pub.completed_at && ` · Completed: ${new Date(pub.completed_at).toLocaleString()}`}
        </p>
        {pub.deployment_reference && (
          <p className="text-xs font-mono text-blue-600 mt-1">{pub.deployment_reference}</p>
        )}
        {pub.error_message && (
          <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">{pub.error_message}</p>
        )}
        {pub.rollback_of && (
          <p className="text-xs text-amber-600 mt-1">Rollback of: {pub.rollback_of.slice(0, 8)}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main PublicationsSection ─────────────────────────────────────────────────

export function PublicationsSection() {
  const [publications, setPublications] = useState<PublicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (error || !data) {
        setUseLocalFallback(true);
      } else {
        setPublications(data as PublicationRecord[]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Publications</h2>
        <p className="text-sm text-gray-500 mt-1">
          History of all publication packages prepared and deployed.
        </p>
      </div>

      {/* Architecture note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">External deployment pipeline required</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              "Prepare Publication Package" saves content and asset metadata to Supabase. For changes to appear on the live website, a separate production build and deployment must be triggered via your hosting provider (Netlify / Vercel / AWS Amplify). Publications listed here reflect Supabase database state only — not deployment success.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Required to complete this section</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc ml-4">
              <li>Create the <code className="bg-blue-100 px-1 rounded font-mono">publications</code> table using the migration SQL</li>
              <li>Connect a deployment webhook in your hosting provider settings</li>
              <li>Configure a Supabase Edge Function to trigger builds and record deployment results</li>
              <li>Set <code className="bg-blue-100 px-1 rounded font-mono">DEPLOYMENT_WEBHOOK_URL</code> in Supabase Edge Function secrets (never in browser code)</li>
            </ul>
          </div>
        </div>
      </div>

      {useLocalFallback ? (
        <div className="py-12 text-center text-gray-400">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No publications table found</p>
          <p className="text-xs mt-1">Apply the database migration to enable publication tracking.</p>
        </div>
      ) : loading ? (
        <div className="py-12 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading publications…</p>
        </div>
      ) : publications.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No publications yet</p>
          <p className="text-xs mt-1">Publications will appear here after you prepare your first package.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publications.map(pub => <PublicationRow key={pub.id} pub={pub} />)}
        </div>
      )}
    </div>
  );
}
