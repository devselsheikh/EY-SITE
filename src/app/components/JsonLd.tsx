import { useEffect } from 'react';

type JsonLdData = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const json = JSON.stringify(Array.isArray(data) ? data : data);
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = json;
    script.id = 'json-ld-' + Math.random().toString(36).slice(2, 8);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [json]);
  return null;
}

export function organizationSchema({
  name,
  url,
  logo,
  phone,
  email,
  address,
  sameAs,
}: {
  name: string;
  url: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: { street?: string; city?: string; country?: string };
  sameAs?: string[];
}): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo ? { logo } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(address ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street ?? 'AUC New Cairo Campus',
        addressLocality: address.city ?? 'New Cairo',
        addressCountry: address.country ?? 'EG',
      },
    } : {}),
    ...(sameAs?.length ? { sameAs } : {}),
  };
}

export function childCareSchema({
  name,
  url,
  phone,
  email,
  description,
  address,
  openingHours,
  priceRange,
}: {
  name: string;
  url: string;
  phone?: string;
  email?: string;
  description?: string;
  address?: { street?: string; city?: string; country?: string };
  openingHours?: string;
  priceRange?: string;
}): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'ChildCare',
    name,
    url,
    ...(description ? { description } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(openingHours ? { openingHours } : {}),
    ...(priceRange ? { priceRange } : {}),
    ...(address ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street ?? 'AUC New Cairo Campus',
        addressLocality: address.city ?? 'New Cairo',
        addressCountry: address.country ?? 'EG',
      },
    } : {}),
  };
}

export function educationalOrgSchema({
  name,
  url,
  phone,
  email,
  description,
  address,
}: {
  name: string;
  url: string;
  phone?: string;
  email?: string;
  description?: string;
  address?: { street?: string; city?: string; country?: string };
}): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name,
    url,
    ...(description ? { description } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(address ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street ?? 'AUC New Cairo Campus',
        addressLocality: address.city ?? 'New Cairo',
        addressCountry: address.country ?? 'EG',
      },
    } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema({
  title,
  description,
  url,
  publishDate,
  author,
  image,
  publisherName,
  publisherLogo,
}: {
  title: string;
  description: string;
  url: string;
  publishDate: string;
  author?: string;
  image?: string;
  publisherName?: string;
  publisherLogo?: string;
}): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished: publishDate,
    ...(author ? { author: { '@type': 'Person', name: author } } : {}),
    ...(image ? { image } : {}),
    ...(publisherName ? {
      publisher: {
        '@type': 'Organization',
        name: publisherName,
        ...(publisherLogo ? { logo: { '@type': 'ImageObject', url: publisherLogo } } : {}),
      },
    } : {}),
  };
}
