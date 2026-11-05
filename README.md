# strip-invisible

[![npm version](https://img.shields.io/npm/v/strip-invisible.svg)](https://www.npmjs.com/package/strip-invisible)
[![ci](https://github.com/pentestcurry/strip-invisible/actions/workflows/ci.yml/badge.svg)](https://github.com/pentestcurry/strip-invisible/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/strip-invisible.svg)](LICENSE)

Find and remove invisible Unicode characters from text, code, and data files.

Zero-width spaces, non-breaking spaces, soft hyphens, byte order marks, and bidirectional controls survive copy-paste. They break identifiers, `JSON.parse`, CSV imports, search, and character counts — and they are invisible in most editors. `strip-invisible` finds them by code point and cleans them, with an optional pass for smart quotes and dashes that break code.

No network calls, no uploads. Runs locally on Node 18+.

## Install

```bash
npm install -g strip-invisible
```

Or run without installing:

```bash
npx strip-invisible notes.txt
```

## Usage

```bash
# Print cleaned text to stdout
strip-invisible notes.txt

# Rewrite files in place
strip-invisible --write data.csv script.py

# Report only; exit 1 if anything is found (good for CI)
strip-invisible --check --typographic src/*.js

# JSON findings
strip-invisible --json notes.txt

# Read from stdin
cat paste.txt | strip-invisible
```

Example `--check` output:

```
script.py: 2 findings in 2 code points
  U+00A0 NO-BREAK SPACE — Unusual space ×3 at line 12, column 8
  U+201C LEFT DOUBLE QUOTATION MARK — Smart double quote ×1 at line 14, column 20
```

### Options

| Flag | Meaning |
|---|---|
| `-w`, `--write` | Rewrite files in place |
| `-c`, `--check` | Report findings and exit 1 if any are found |
| `-t`, `--typographic` | Also convert smart quotes, dashes, ellipsis, and full-width punctuation |
| `-j`, `--json` | Print findings as JSON |
| `-q`, `--quiet` | Suppress the per-file summary |
| `-h`, `--help` | Show help |
| `-v`, `--version` | Show the version |

### Exit codes

- `0` — clean, or written successfully
- `1` — findings present with `--check`
- `2` — usage or read error

## What it handles

**Invisible by default:**

| Category | Code points | Action |
|---|---|---|
| Zero-width / invisible | U+200B–U+200D, U+2060, U+FEFF, U+00AD | Removed |
| Bidirectional controls | U+202A–U+202E, U+2066–U+2069 | Removed |
| Unusual spaces | U+00A0, U+1680, U+2000–U+200A, U+202F, U+205F, U+3000 | Normalized to a space |
| Variation selectors | U+FE00–U+FE0F, U+E0100–U+E01EF | Flagged only |
| Possible confusables | Greek, Cyrillic, full-width Latin | Flagged only |

**With `--typographic`:**

| Category | Code points | Action |
|---|---|---|
| Smart single quotes | U+2018–U+201B | `'` |
| Smart double quotes | U+201C–U+201F | `"` |
| Em / en dash | U+2013–U+2015, U+2212 | `-` |
| Non-breaking hyphen | U+2010, U+2011 | `-` |
| Ellipsis | U+2026 | `...` |
| Full-width punctuation | U+FF01–U+FF5E | ASCII equivalent |

Variation selectors and possible confusables are reported but never removed automatically, because they can be legitimate in emoji, multilingual text, and code.

## Programmatic API

```js
import { scan, clean, summarize } from "strip-invisible";

scan("a\u200Bb");
// [{ label: "Invisible / zero-width", codePoint: 8203, hex: "U+200B", count: 1, first: { line: 1, column: 2 }, ... }]

clean("a\u200Bb");
// "ab"

clean("\u201CHi\u201D", { typographic: true });
// "\"Hi\""

summarize(scan("a\u200Bb"));
// { total: 1, codePoints: 1 }
```

## Why these characters matter

- **Code:** `SyntaxError: invalid non-printable character U+00A0`, `Invalid or unexpected token`, and `Illegal character U+200B` are usually one of these characters.
- **Data:** a BOM or non-breaking space breaks header matching and numeric parsing in CSV and JSON.
- **Security:** bidirectional controls are the mechanism behind Trojan Source (CVE-2021-42574).
- **Search and counts:** invisible characters change string equality, sorting, and character limits.

A hidden character is a text-integrity problem. It does not identify who wrote a passage.

## Editor extension

A VS Code extension lives in [`vscode/`](vscode/) and flags invisible characters as diagnostics.

## Web version

The same checks run in your browser at <https://aiwatermarkremovers.com/text-integrity-checker> and <https://aiwatermarkremovers.com/code-cleaner>.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Run `node test.mjs` before opening a pull request.

## License

MIT
