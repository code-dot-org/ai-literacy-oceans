/** All 24 supported locales (23 EU + English fallback) with native display names. */
export const SUPPORTED_LOCALES: Record<string, string> = {
  en: 'English',
  bg: 'Български',
  hr: 'Hrvatski',
  cs: 'Čeština',
  da: 'Dansk',
  nl: 'Nederlands',
  et: 'Eesti',
  fi: 'Suomi',
  fr: 'Français',
  de: 'Deutsch',
  el: 'Ελληνικά',
  hu: 'Magyar',
  ga: 'Gaeilge',
  it: 'Italiano',
  lv: 'Latviešu',
  lt: 'Lietuvių',
  mt: 'Malti',
  pl: 'Polski',
  pt: 'Português',
  ro: 'Română',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  es: 'Español',
  sv: 'Svenska',
};

// 23 non-English official EU languages; English is the fallback.
const EU_LOCALES = new Set([
  'bg', 'hr', 'cs', 'da', 'nl', 'et', 'fi', 'fr',
  'de', 'el', 'hu', 'ga', 'it', 'lv', 'lt', 'mt',
  'pl', 'pt', 'ro', 'sk', 'sl', 'es', 'sv',
]);

// Explicit overrides for regional variants or tags that don't follow simple base-tag matching.
// pt-BR → 'en' because the committed translations target EU Portuguese.
const EXPLICIT_MAP: Record<string, string> = {
  'pt-br': 'en',
};

/**
 * Map navigator.language to the nearest supported EU locale, or 'en'.
 */
export function detectLocale(): string {
  const raw = (navigator.language || 'en').toLowerCase();
  if (EXPLICIT_MAP[raw]) return EXPLICIT_MAP[raw];
  if (EU_LOCALES.has(raw)) return raw;
  const base = raw.split('-')[0];
  if (EU_LOCALES.has(base)) return base;
  return 'en';
}

/**
 * Load committed locale strings. Returns undefined for 'en' (use package defaults).
 */
export async function loadStrings(
  locale: string,
): Promise<Record<string, string> | undefined> {
  if (locale === 'en') return undefined;
  const mod = await import(`../i18n/${locale}.json`);
  return mod.default as Record<string, string>;
}
