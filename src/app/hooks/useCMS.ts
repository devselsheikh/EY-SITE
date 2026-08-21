import { useState, useEffect } from 'react';
import { CMSContent, loadCMS, loadPublishedCMS } from '../data/cms';

// Module-level cache so all components share one fetch
let _cache: CMSContent | null = null;
let _promise: Promise<CMSContent> | null = null;
const _listeners: Array<(cms: CMSContent) => void> = [];

function fetchAndBroadcast(): Promise<CMSContent> {
  if (_cache) return Promise.resolve(_cache);
  if (!_promise) {
    _promise = loadPublishedCMS().then(cms => {
      _cache = cms;
      _listeners.forEach(fn => fn(cms));
      return cms;
    }).catch(() => {
      const fallback = loadCMS();
      _cache = fallback;
      return fallback;
    });
  }
  return _promise;
}

export function invalidateCMSCache() {
  _cache = null;
  _promise = null;
}

export function useCMS(): CMSContent {
  const [cms, setCMS] = useState<CMSContent>(() => _cache ?? loadCMS());

  useEffect(() => {
    if (_cache) {
      setCMS(_cache);
      return;
    }
    _listeners.push(setCMS);
    fetchAndBroadcast();
    return () => {
      const idx = _listeners.indexOf(setCMS);
      if (idx !== -1) _listeners.splice(idx, 1);
    };
  }, []);

  return cms;
}
