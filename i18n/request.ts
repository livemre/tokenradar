import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'tr', 'es', 'pt', 'de', 'fr', 'ko', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Turkce',
  es: 'Espanol',
  pt: 'Portugues',
  de: 'Deutsch',
  fr: 'Francais',
  ko: '한국어',
  ja: '日本語',
  zh: '中文',
};

function getLocaleFromAcceptLanguage(acceptLanguage: string): Locale | null {
  const langs = acceptLanguage.split(',').map((l) => l.split(';')[0].trim().substring(0, 2).toLowerCase());
  for (const lang of langs) {
    if (locales.includes(lang as Locale)) return lang as Locale;
  }
  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  let locale: Locale = defaultLocale;

  // 1. Check cookie
  const cookieLocale = cookieStore.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else {
    // 2. Check Accept-Language header
    const acceptLanguage = headerStore.get('accept-language');
    if (acceptLanguage) {
      const detected = getLocaleFromAcceptLanguage(acceptLanguage);
      if (detected) locale = detected;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
