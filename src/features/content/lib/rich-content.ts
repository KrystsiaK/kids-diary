import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "a",
  "article",
  "blockquote",
  "br",
  "code",
  "dd",
  "details",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "img",
  "li",
  "main",
  "mark",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "small",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];

const allowedAttributes: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": ["aria-label", "aria-labelledby", "class", "data-*", "id", "role"],
  a: ["href", "name", "target", "rel"],
  code: ["class"],
  img: ["alt", "height", "src", "title", "width"],
};

const allowedClasses: sanitizeHtml.IOptions["allowedClasses"] = {
  "*": [/^[a-z0-9_-]+$/i],
};

const allowedSchemes = ["http", "https", "mailto", "tel"];

export function sanitizeRichHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedClasses,
    allowedSchemes,
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  }).trim();
}

export function stripDocumentShell(html: string) {
  return html
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<html\b[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<body\b[^>]*>/gi, "")
    .replace(/<\/body>/gi, "");
}

export function prepareRichHtml(html: string) {
  return sanitizeRichHtml(stripDocumentShell(html));
}
