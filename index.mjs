export const RULES = [
  {
    key: "zero",
    label: "Invisible / zero-width",
    group: "invisible",
    action: "remove",
    re: /[\u200B-\u200D\u2060\uFEFF\u00AD]/gu,
    why: "Zero-width spaces, joiners, word joiners, BOM, and soft hyphens break identifiers, search, and imports."
  },
  {
    key: "bidi",
    label: "Bidirectional control",
    group: "invisible",
    action: "remove",
    re: /[\u202A-\u202E\u2066-\u2069]/gu,
    why: "Bidi controls can make code render differently from how it compiles (Trojan Source)."
  },
  {
    key: "variation",
    label: "Variation selector",
    group: "invisible",
    action: "flag",
    re: /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu,
    why: "Affects emoji and glyph presentation; may be legitimate, so it is flagged, not removed."
  },
  {
    key: "space",
    label: "Unusual space",
    group: "invisible",
    action: "space",
    re: /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/gu,
    why: "Non-breaking and typographic spaces break parsing, matching, and CSV/JSON import."
  },
  {
    key: "confusable",
    label: "Possible confusable",
    group: "invisible",
    action: "flag",
    re: /[\u0370-\u03FF\u0400-\u04FF\uFF21-\uFF5A]/gu,
    why: "Greek, Cyrillic, or full-width letters that look like Latin; review mixed-script identifiers."
  },
  {
    key: "quote-single",
    label: "Smart single quote",
    group: "typographic",
    action: "replace",
    replace: "'",
    re: /[\u2018\u2019\u201A\u201B]/gu,
    why: "Curly apostrophes break Python and JavaScript string delimiters."
  },
  {
    key: "quote-double",
    label: "Smart double quote",
    group: "typographic",
    action: "replace",
    replace: "\"",
    re: /[\u201C\u201D\u201E\u201F]/gu,
    why: "Curly double quotes break JSON and JavaScript strings."
  },
  {
    key: "dash",
    label: "Em / en dash",
    group: "typographic",
    action: "replace",
    replace: "-",
    re: /[\u2013\u2014\u2015\u2212]/gu,
    why: "Look-alike dashes fail as operators and in numeric ranges."
  },
  {
    key: "hyphen",
    label: "Non-breaking hyphen",
    group: "typographic",
    action: "replace",
    replace: "-",
    re: /[\u2010\u2011]/gu,
    why: "Looks like a hyphen but is a different character."
  },
  {
    key: "ellipsis",
    label: "Ellipsis",
    group: "typographic",
    action: "replace",
    replace: "...",
    re: /\u2026/gu,
    why: "Single glyph where code or data expects three periods."
  },
  {
    key: "fullwidth",
    label: "Full-width punctuation",
    group: "typographic",
    action: "fullwidth",
    re: /[\uFF01-\uFF5E]/gu,
    why: "Look-alike brackets, commas, and semicolons in CJK input."
  }
];

const NAMES = {
  0x200b: "ZERO WIDTH SPACE",
  0x200c: "ZERO WIDTH NON-JOINER",
  0x200d: "ZERO WIDTH JOINER",
  0x2060: "WORD JOINER",
  0xfeff: "ZERO WIDTH NO-BREAK SPACE",
  0x00ad: "SOFT HYPHEN",
  0x00a0: "NO-BREAK SPACE",
  0x1680: "OGHAM SPACE MARK",
  0x202f: "NARROW NO-BREAK SPACE",
  0x205f: "MEDIUM MATHEMATICAL SPACE",
  0x3000: "IDEOGRAPHIC SPACE",
  0x2018: "LEFT SINGLE QUOTATION MARK",
  0x2019: "RIGHT SINGLE QUOTATION MARK",
  0x201c: "LEFT DOUBLE QUOTATION MARK",
  0x201d: "RIGHT DOUBLE QUOTATION MARK",
  0x2013: "EN DASH",
  0x2014: "EM DASH",
  0x2026: "HORIZONTAL ELLIPSIS"
};

export function hex(codePoint) {
  return "U+" + codePoint.toString(16).toUpperCase().padStart(4, "0");
}

export function nameOf(codePoint) {
  return NAMES[codePoint] || "";
}

export function position(text, index) {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const column = index - before.lastIndexOf("\n");
  return { line, column };
}

function fresh(rule) {
  return new RegExp(rule.re.source, rule.re.flags);
}

export function scan(text, options = {}) {
  const includeTypographic = Boolean(options.typographic);
  const source = String(text ?? "");
  const rows = [];
  for (const rule of RULES) {
    if (!includeTypographic && rule.group === "typographic") continue;
    const pattern = fresh(rule);
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const codePoint = match[0].codePointAt(0);
      let row = rows.find((entry) => entry.codePoint === codePoint);
      if (!row) {
        row = {
          label: rule.label,
          group: rule.group,
          codePoint,
          hex: hex(codePoint),
          name: nameOf(codePoint),
          count: 0,
          first: position(source, match.index)
        };
        rows.push(row);
      }
      row.count += 1;
      if (match[0].length === 0) break;
    }
  }
  return rows;
}

export function clean(text, options = {}) {
  const includeTypographic = Boolean(options.typographic);
  let out = String(text ?? "");
  for (const rule of RULES) {
    if (!includeTypographic && rule.group === "typographic") continue;
    const pattern = fresh(rule);
    if (rule.action === "remove") out = out.replace(pattern, "");
    else if (rule.action === "space") out = out.replace(pattern, " ");
    else if (rule.action === "replace") out = out.replace(pattern, rule.replace);
    else if (rule.action === "fullwidth") {
      out = out.replace(pattern, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
    }
  }
  return out;
}

export function summarize(rows) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return { total, codePoints: rows.length };
}
