const I18N_ELEMENT_PATTERN =
  /<([a-z][\w:-]*)([^>]*)\sdata-i18n\s*=\s*(["'])([^"']+)\3([^>]*)>([\s\S]*?)<\/\1>/gi;

function decodeBasicEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function extractWrappedText(innerHtml: string) {
  const match = innerHtml.match(/\{([\s\S]*?)\}/);
  if (!match) return null;

  return decodeBasicEntities(match[1].replace(/<[^>]*>/g, "").trim());
}

export function extractExperimentI18nDictionary(html: string) {
  const dictionary: Record<string, string> = {};

  for (const match of html.matchAll(I18N_ELEMENT_PATTERN)) {
    const key = match[4]?.trim();
    const text = extractWrappedText(match[6] ?? "");

    if (key && text) {
      dictionary[key] = text;
    }
  }

  return dictionary;
}

export function hasExperimentI18nMarkers(html: string) {
  return Object.keys(extractExperimentI18nDictionary(html)).length > 0;
}

export function applyExperimentI18nDictionary(
  html: string,
  dictionary: Record<string, string>,
) {
  return html.replace(
    I18N_ELEMENT_PATTERN,
    (fullMatch, tagName: string, beforeAttrs: string, quote: string, key: string, afterAttrs: string, innerHtml: string) => {
      const translated = dictionary[key];

      if (typeof translated !== "string" || !translated.trim()) {
        return fullMatch;
      }

      const nextInnerHtml = /\{([\s\S]*?)\}/.test(innerHtml)
        ? innerHtml.replace(/\{([\s\S]*?)\}/, escapeHtml(translated.trim()))
        : escapeHtml(translated.trim());

      return `<${tagName}${beforeAttrs} data-i18n=${quote}${key}${quote}${afterAttrs}>${nextInnerHtml}</${tagName}>`;
    },
  );
}

export function unwrapExperimentI18nBraces(html: string) {
  return html.replace(
    I18N_ELEMENT_PATTERN,
    (fullMatch, tagName: string, beforeAttrs: string, quote: string, key: string, afterAttrs: string, innerHtml: string) => {
      const text = extractWrappedText(innerHtml);

      if (!text) {
        return fullMatch;
      }

      return `<${tagName}${beforeAttrs} data-i18n=${quote}${key}${quote}${afterAttrs}>${escapeHtml(text)}</${tagName}>`;
    },
  );
}
