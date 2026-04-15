import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type RouteSeoConfig = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  type?: 'website' | 'article';
  schemaType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'SoftwareApplication';
};

const SITE_URL = (import.meta.env.VITE_SITE_URL?.trim() || 'https://traineros.org').replace(/\/+$/, '');
const SITE_NAME = 'TrainerOS';
const DEFAULT_IMAGE_URL = `${SITE_URL}/logo.jpeg`;
const DEFAULT_ROBOTS = 'index, follow';
const DEFAULT_SCHEMA_TYPE = 'WebPage';
const DEFAULT_TITLE = 'TrainerOS - Content & Client System pentru Antrenori Fitness';
const DEFAULT_DESCRIPTION =
  'TrainerOS este platforma pentru antrenori fitness care vor nișă clară, idei de content, review AI și mai mulți clienți din social media.';

const routeSeoConfig: Array<{
  match: (pathname: string) => boolean;
  config: RouteSeoConfig;
}> = [
  {
    match: (pathname) => pathname === '/',
    config: {
      title: DEFAULT_TITLE,
      description:
        'TrainerOS ajută antrenorii fitness să-și clarifice nișa, să creeze content mai rapid și să transforme postările în clienți.',
      canonicalPath: '/',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    match: (pathname) => pathname === '/features' || pathname === '/how-it-works',
    config: {
      title: 'Funcționalități TrainerOS pentru Antrenori Fitness',
      description:
        'Descoperă modulele TrainerOS: Niche Finder, Daily Idea, Content Review, Email Marketing și workflow-ul complet pentru marketing fitness.',
      canonicalPath: '/features',
      schemaType: 'CollectionPage',
    },
  },
  {
    match: (pathname) => pathname === '/pricing',
    config: {
      title: 'Prețuri TrainerOS - Planuri pentru Antrenori Fitness',
      description:
        'Vezi planurile TrainerOS, trial-ul gratuit și diferențele dintre membership-urile Pro și Max pentru antrenori fitness.',
      canonicalPath: '/pricing',
      schemaType: 'WebPage',
    },
  },
  {
    match: (pathname) => pathname === '/about',
    config: {
      title: 'Despre TrainerOS',
      description:
        'Află misiunea TrainerOS și cum construim un sistem de content care ajută antrenorii fitness să atragă clienți potriviți.',
      canonicalPath: '/about',
      schemaType: 'AboutPage',
    },
  },
  {
    match: (pathname) => pathname === '/contact',
    config: {
      title: 'Contact TrainerOS',
      description:
        'Contactează echipa TrainerOS pentru suport, parteneriate, întrebări comerciale sau solicitări legate de GDPR.',
      canonicalPath: '/contact',
      schemaType: 'ContactPage',
    },
  },
  {
    match: (pathname) => pathname === '/privacy',
    config: {
      title: 'Politica de Confidențialitate TrainerOS',
      description:
        'Citește politica de confidențialitate TrainerOS și află cum sunt colectate, procesate și protejate datele personale.',
      canonicalPath: '/privacy',
      schemaType: 'WebPage',
    },
  },
  {
    match: (pathname) => pathname === '/terms',
    config: {
      title: 'Termeni și Condiții TrainerOS',
      description:
        'Consultă termenii și condițiile TrainerOS pentru utilizarea platformei, plăți, abonamente și responsabilități.',
      canonicalPath: '/terms',
      schemaType: 'WebPage',
    },
  },
  {
    match: (pathname) => pathname === '/gdpr',
    config: {
      title: 'GDPR TrainerOS',
      description:
        'Vezi informațiile GDPR TrainerOS, bazele legale de procesare și drepturile utilizatorilor din UE și SEE.',
      canonicalPath: '/gdpr',
      schemaType: 'WebPage',
    },
  },
  {
    match: (pathname) => pathname === '/register',
    config: {
      title: 'Înregistrare TrainerOS - Începe Free Trial',
      description:
        'Creează-ți cont TrainerOS și începe trial-ul gratuit pentru a genera content mai clar și mai eficient pentru business-ul tău fitness.',
      canonicalPath: '/register',
      schemaType: 'WebPage',
    },
  },
  {
    match: (pathname) => pathname === '/login',
    config: {
      title: 'Login TrainerOS',
      description: 'Autentifică-te în contul tău TrainerOS.',
      canonicalPath: '/login',
      robots: 'noindex, nofollow',
      schemaType: 'WebPage',
    },
  },
  {
    match: (pathname) =>
      pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/activate-account',
    config: {
      title: 'Acces cont TrainerOS',
      description: 'Gestionează accesul în contul tău TrainerOS.',
      canonicalPath: '/login',
      robots: 'noindex, nofollow',
      schemaType: 'WebPage',
    },
  },
  {
    match: (pathname) =>
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/niche-') ||
      pathname.startsWith('/content-preferences') ||
      pathname.startsWith('/cum-vrei-sa-creezi-content') ||
      pathname.startsWith('/daily-idea') ||
      pathname.startsWith('/idea-') ||
      pathname.startsWith('/idea/') ||
      pathname.startsWith('/content-review') ||
      pathname.startsWith('/feedback/') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/chat') ||
      pathname.startsWith('/email') ||
      pathname.startsWith('/client-nutrition'),
    config: {
      title: 'TrainerOS App',
      description: 'Zona privată TrainerOS pentru clienți autentificați.',
      canonicalPath: '/',
      robots: 'noindex, nofollow',
      schemaType: 'WebPage',
    },
  },
];

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertJsonLd(id: string, data: object | object[]) {
  let script = document.head.querySelector<HTMLScriptElement>(`script[data-seo-schema="${id}"]`);

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoSchema = id;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

function buildStructuredData(config: RouteSeoConfig, canonicalUrl: string) {
  const primarySchemaType = config.schemaType || DEFAULT_SCHEMA_TYPE;

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'ro-RO',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_IMAGE_URL,
    email: 'business@traineros.org',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'business@traineros.org',
        availableLanguage: ['ro', 'en'],
      },
    ],
  };

  const pageSchema =
    primarySchemaType === 'SoftwareApplication'
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: canonicalUrl,
          image: DEFAULT_IMAGE_URL,
          description: config.description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            description: 'Free trial disponibil pentru utilizatorii noi.',
          },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
        }
      : {
          '@context': 'https://schema.org',
          '@type': primarySchemaType,
          name: config.title,
          url: canonicalUrl,
          description: config.description,
          isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
          },
        };

  return [websiteSchema, organizationSchema, pageSchema];
}

function getRouteSeo(pathname: string): RouteSeoConfig {
  return routeSeoConfig.find((route) => route.match(pathname))?.config || {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonicalPath: pathname || '/',
    robots: 'noindex, nofollow',
    schemaType: DEFAULT_SCHEMA_TYPE,
  };
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const config = getRouteSeo(pathname);
    const canonicalUrl = new URL(config.canonicalPath, SITE_URL).toString();
    const robots = config.robots || DEFAULT_ROBOTS;
    const ogType = config.type || 'website';
    const title = `${config.title} | ${SITE_NAME}`.includes(SITE_NAME) ? config.title : `${config.title} | ${SITE_NAME}`;

    document.documentElement.lang = 'ro';
    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description', content: config.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'ro_RO' });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: config.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE_URL });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: config.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE_URL });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    upsertJsonLd('primary', buildStructuredData(config, canonicalUrl));
  }, [pathname]);

  return null;
}
