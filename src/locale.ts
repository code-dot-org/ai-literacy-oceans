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

// Plural categories English doesn't define. The lab compiles every catalog
// with the English locale (we don't pass textToSpeechLocale — see App.tsx, so
// the guide "typing" sound plays in all locales), and its ICU compiler THROWS
// on plural branches outside English's set rather than ignoring them. Stripping
// these lets non-English catalogs compile; English rules then pick one/other.
// Today only fishshort/fishlong-pond-init1 carry extra categories.
const UNSUPPORTED_PLURAL_KEYS = new Set(['zero', 'two', 'few', 'many']);

/** Reads a brace-balanced `{...}` span starting at `start` (which must be `{`). */
function readBraced(s: string, start: number): [string, number] {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}' && --depth === 0) return [s.slice(start, i + 1), i + 1];
  }
  return [s.slice(start), s.length];
}

/** Drops `zero/two/few/many` branches from any ICU plural/selectordinal blocks. */
export function stripUnsupportedPlurals(msg: string): string {
  if (!msg.includes('plural') && !msg.includes('selectordinal')) return msg;
  let out = '';
  for (let i = 0; i < msg.length; ) {
    if (msg[i] !== '{') {
      out += msg[i++];
      continue;
    }
    const [block, end] = readBraced(msg, i);
    i = end;
    const header = block
      .slice(1, -1)
      .match(/^\s*([^,\s]+)\s*,\s*(plural|selectordinal)\s*,\s*/);
    if (!header) {
      out += block; // a plain placeholder like {word} — leave it alone
      continue;
    }
    const branches = block.slice(1 + header[0].length, -1);
    let kept = '';
    for (let k = 0; k < branches.length; ) {
      const brace = branches.indexOf('{', k);
      if (brace === -1) break;
      const selector = branches.slice(k, brace).trim();
      const [body, bodyEnd] = readBraced(branches, brace);
      if (!UNSUPPORTED_PLURAL_KEYS.has(selector)) {
        kept += `${kept ? ' ' : ''}${selector} ${stripUnsupportedPlurals(body)}`;
      }
      k = bodyEnd;
    }
    out += `{${header[1]}, ${header[2]}, ${kept}}`;
  }
  return out;
}

/**
 * Load committed locale strings. Returns undefined for 'en' (use package defaults).
 */
export async function loadStrings(
  locale: string,
): Promise<Record<string, string> | undefined> {
  if (locale === 'en') return undefined;
  const mod = await import(`../i18n/${locale}.json`);
  const raw = mod.default as Record<string, string>;
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, stripUnsupportedPlurals(v)]),
  );
}
