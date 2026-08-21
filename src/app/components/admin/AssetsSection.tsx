// ─────────────────────────────────────────────────────────────────────────────
// Image Replacement Guide — CMS admin reference for all public site images.
//
// Public images are embedded in the Figma Make project via localImageRegistry.ts.
// To replace an image:
//   1. Open the Figma Make project.
//   2. Attach the replacement image in the Make conversation.
//   3. Update the relevant entry in src/app/data/localImageRegistry.ts.
//   4. Publish the Figma Make site update.
//
// This panel shows every image asset key, its current source, usage locations,
// recommended dimensions, alt text, and focal-point guidance.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { LOCAL_IMAGE_REGISTRY, RegistryEntry } from '../../data/localImageRegistry';
import { AssetCategory, ASSET_MANIFEST } from '../../data/assetManifest';

// ─── Category display helpers ─────────────────────────────────────────────────

const CATEGORY_LABELS: Record<AssetCategory | string, string> = {
  'daycare-hero':         'Daycare — Hero & Sections',
  'daycare-about':        'Daycare — About',
  'daycare-educators':    'Daycare — Educators',
  'daycare-testimonials': 'Daycare — Testimonials',
  'daycare-gallery':      'Daycare — Gallery',
  'eduhub-hero':          'EduHub — Hero & Sections',
  'eduhub-about':         'EduHub — About & Programs',
  'eduhub-alumni':        'EduHub — Alumni',
  'brand':                'Brand Assets',
};

// ─── Image entry card ─────────────────────────────────────────────────────────

function ImageCard({ assetKey, entry }: { assetKey: string; entry: RegistryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isExternal = entry.desktop.startsWith('http');

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {!imgError ? (
            <img
              src={entry.desktop}
              alt={entry.alt}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-1">No preview</div>
          )}
        </div>

        {/* Key + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{assetKey}</code>
            {entry.embedded ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Embedded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> Manual upload required
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.alt}</p>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Preview */}
          <div className="rounded-xl overflow-hidden bg-gray-100 max-h-64 flex items-center justify-center">
            {!imgError ? (
              <img
                src={entry.desktop}
                alt={entry.alt}
                className="max-w-full max-h-64 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="py-8 text-sm text-gray-400 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Image not available for preview
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-semibold text-gray-600 mb-1">Alt text</p>
              <p className="text-gray-800">{entry.alt}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-1">Focal point</p>
              <p className="text-gray-800">{Math.round(entry.focalX * 100)}% left, {Math.round(entry.focalY * 100)}% top</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-1">Desktop dimensions</p>
              <p className="text-gray-800">{entry.desktopDimensions}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-1">Mobile dimensions</p>
              <p className="text-gray-800">{entry.mobileDimensions}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-semibold text-gray-600 mb-1">Usage locations</p>
              <ul className="space-y-0.5">
                {entry.usageLocations.map(loc => (
                  <li key={loc} className="text-gray-700 font-mono">{loc}</li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2">
              <p className="font-semibold text-gray-600 mb-1">Current source</p>
              <p className={`font-mono break-all ${isExternal ? 'text-amber-700' : 'text-green-700'}`}>
                {isExternal ? `External URL (not embedded): ${entry.desktop}` : 'Local embedded file'}
              </p>
            </div>
          </div>

          {/* Replacement instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> How to replace this image</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
              <li>Open the Figma Make project.</li>
              <li>Attach the replacement image in the Make conversation.</li>
              <li>
                Update the <code className="bg-blue-100 px-1 rounded">'{assetKey}'</code> entry in{' '}
                <code className="bg-blue-100 px-1 rounded">src/app/data/localImageRegistry.ts</code> — set{' '}
                <code className="bg-blue-100 px-1 rounded">desktop</code> to the imported file, adjust{' '}
                <code className="bg-blue-100 px-1 rounded">alt</code> and focal point as needed, set{' '}
                <code className="bg-blue-100 px-1 rounded">embedded: true</code>.
              </li>
              <li>Publish the Figma Make site update.</li>
            </ol>
            <p className="text-blue-600 text-[10px] mt-1">
              Changing one registry entry updates every location listed above after publishing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AssetsSection() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'embedded' | 'pending'>('all');

  // Build list of entries with category from assetManifest
  const entries = Object.entries(LOCAL_IMAGE_REGISTRY).map(([key, entry]) => ({
    key,
    entry,
    category: ASSET_MANIFEST[key]?.category ?? 'brand',
    name: ASSET_MANIFEST[key]?.name ?? key,
  }));

  const filtered = entries.filter(({ key, entry, category }) => {
    const matchesSearch = !search ||
      key.toLowerCase().includes(search.toLowerCase()) ||
      entry.alt.toLowerCase().includes(search.toLowerCase()) ||
      entry.usageLocations.some(l => l.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'embedded' && entry.embedded) ||
      (statusFilter === 'pending' && !entry.embedded);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const embeddedCount = entries.filter(e => e.entry.embedded).length;
  const pendingCount = entries.length - embeddedCount;

  // Group by category
  const categories = Array.from(new Set(filtered.map(e => e.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Image Replacement Guide</h2>
        <p className="text-sm text-gray-500 mt-1">
          All public images are embedded in the Figma Make project. Replace them by updating{' '}
          <code className="bg-gray-100 px-1 rounded">localImageRegistry.ts</code> and republishing.
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total images</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{embeddedCount}</p>
          <p className="text-xs text-green-600 mt-0.5">Embedded</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600 mt-0.5">Upload required</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <p className="font-semibold mb-1">How image replacement works</p>
        <p className="text-blue-700 text-xs leading-relaxed">
          To replace an image, open the Figma Make project, select the image in the relevant preview
          or attach the replacement image in the Make conversation, update the shared local image
          registry, verify all usage locations, and publish an update.
          Public images do not depend on Supabase — blocking Supabase does not affect them.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by key, alt text, or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <option key={cat} value={cat}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'embedded' | 'pending')}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="embedded">Embedded only</option>
          <option value="pending">Upload required</option>
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No images match your filters.</p>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const group = filtered.filter(e => e.category === category);
            return (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {CATEGORY_LABELS[category] ?? category}
                </h3>
                <div className="space-y-2">
                  {group.map(({ key, entry }) => (
                    <ImageCard key={key} assetKey={key} entry={entry} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
