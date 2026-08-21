import { useEffect } from 'react';
import { CMSContent, loadCMS, loadPublishedCMS } from '../data/cms';

type SEOPage = 'homepage' | 'daycare' | 'eduhub' | 'blog';

export function useSEO(page: SEOPage, overrides?: { title?: string; description?: string; ogImage?: string }, cmsProp?: CMSContent) {
  useEffect(() => {
    const apply = (cms: CMSContent) => {
      const seo = cms.seo;
      const titleMap: Record<SEOPage, string> = {
        homepage: seo.homepageTitle,
        daycare: seo.daycareTitle,
        eduhub: seo.eduhubTitle,
        blog: seo.blogTitle,
      };
      const descMap: Record<SEOPage, string> = {
        homepage: seo.homepageDescription,
        daycare: seo.daycareDescription,
        eduhub: seo.eduhubDescription,
        blog: seo.blogDescription,
      };
      const title = overrides?.title || titleMap[page] || 'Early Years Company';
      const description = overrides?.description || descMap[page] || '';
      const ogImage = overrides?.ogImage || seo.defaultOGImage || '';
      document.title = title;
      setMeta('description', description);
      setMeta('og:title', title, true);
      setMeta('og:description', description, true);
      if (ogImage) setMeta('og:image', ogImage, true);
    };

    if (cmsProp) { apply(cmsProp); return; }
    apply(loadCMS());
    loadPublishedCMS().then(apply).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, overrides?.title, overrides?.description, overrides?.ogImage, cmsProp]);
}

function setMeta(name: string, content: string, property = false) {
  if (!content) return;
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}
