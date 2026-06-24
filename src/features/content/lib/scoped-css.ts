const MAX_CUSTOM_CSS_LENGTH = 60_000;

const UNSAFE_CSS_PATTERNS = [
  /@import\b[^;]*(;|$)/gi,
  /@charset\b[^;]*(;|$)/gi,
  /@namespace\b[^;]*(;|$)/gi,
  /javascript\s*:/gi,
  /expression\s*\(/gi,
  /behavior\s*:/gi,
  /-moz-binding\s*:/gi,
  /<\/?style\b/gi,
  /<\/?script\b/gi,
];

function stripCssComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function stripUnsafeDeclarations(css: string) {
  return css
    .replace(/\bposition\s*:\s*fixed\s*;?/gi, "")
    .replace(/\bbehavior\s*:[^;}]*(;|})/gi, "$1")
    .replace(/\b-moz-binding\s*:[^;}]*(;|})/gi, "$1");
}

export function sanitizeCustomCss(css: string) {
  let safeCss = stripCssComments(css).slice(0, MAX_CUSTOM_CSS_LENGTH);

  for (const pattern of UNSAFE_CSS_PATTERNS) {
    safeCss = safeCss.replace(pattern, "");
  }

  return stripUnsafeDeclarations(safeCss).trim();
}

function splitSelectorList(selectors: string) {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  let quote: "\"" | "'" | null = null;

  for (const char of selectors) {
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth = Math.max(0, depth - 1);

    if (char === "," && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) result.push(current.trim());
  return result;
}

function scopeSingleSelector(selector: string, scopeSelector: string) {
  const trimmed = selector.trim();

  if (!trimmed || trimmed.startsWith(scopeSelector)) {
    return trimmed;
  }

  if (/^(html|body|:root)\b/i.test(trimmed)) {
    return trimmed.replace(/^(html|body|:root)\b/i, scopeSelector);
  }

  return `${scopeSelector} ${trimmed}`;
}

function scopeSelectors(selectors: string, scopeSelector: string) {
  return splitSelectorList(selectors)
    .map((selector) => scopeSingleSelector(selector, scopeSelector))
    .filter(Boolean)
    .join(", ");
}

function findMatchingBrace(css: string, openIndex: number) {
  let depth = 0;
  let quote: "\"" | "'" | null = null;

  for (let index = openIndex; index < css.length; index += 1) {
    const char = css[index];

    if (quote) {
      if (char === quote && css[index - 1] !== "\\") quote = null;
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function scopeCssRules(css: string, scopeSelector: string): string {
  let output = "";
  let cursor = 0;

  while (cursor < css.length) {
    const openIndex = css.indexOf("{", cursor);

    if (openIndex === -1) break;

    const selector = css.slice(cursor, openIndex).trim();
    const closeIndex = findMatchingBrace(css, openIndex);

    if (closeIndex === -1) break;

    const body = css.slice(openIndex + 1, closeIndex).trim();
    cursor = closeIndex + 1;

    if (!selector || !body) continue;

    if (selector.startsWith("@")) {
      if (/^@(media|supports|container|layer)\b/i.test(selector)) {
        const nested = scopeCssRules(body, scopeSelector);
        if (nested) output += `${selector}{${nested}}\n`;
      } else if (/^@keyframes\b/i.test(selector)) {
        output += `${selector}{${body}}\n`;
      }
      continue;
    }

    output += `${scopeSelectors(selector, scopeSelector)}{${body}}\n`;
  }

  return output.trim();
}

export function buildScopedCustomCss(css: string, scopeSelector: string) {
  const sanitized = sanitizeCustomCss(css);
  if (!sanitized) return "";

  return scopeCssRules(sanitized, scopeSelector);
}
