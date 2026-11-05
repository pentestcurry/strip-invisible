# Submission kit

Text to reuse when publishing or asking for a listing. Adapt to each destination's rules; do not paste the same text across communities.

## One-line description

> `strip-invisible` — a zero-dependency Node CLI that finds and removes invisible Unicode (zero-width, bidi controls, BOM, soft hyphens, unusual spaces) and, optionally, smart quotes and dashes that break code.

## Short description (160 characters)

> Find and remove invisible Unicode — zero-width characters, bidi controls, BOM, non-breaking spaces — from code and data. Zero dependencies. Node 18+.

## Awesome-list pull request

**Title:** `Add strip-invisible`

**Body:**

```markdown
## What

[strip-invisible](https://github.com/pentestcurry/strip-invisible) — a zero-dependency Node CLI that finds and removes invisible Unicode (zero-width characters, bidi controls, BOM, soft hyphens, unusual spaces) and, optionally, syntax-breaking typography (smart quotes, dashes, full-width punctuation).

## Why it fits here

<One sentence tying it to this list's section, for example: "It belongs under Command-line utilities because it runs as a single `npx strip-invisible` command with no install and no dependencies.">

## Checklist

- [x] Node 18+, zero dependencies
- [x] Tests and CI (`node test.mjs`, GitHub Actions)
- [x] MIT license
- [x] Added to the correct section, in the position the contributing guide asks for
```

### Where to propose

Verify the section exists before submitting; these lists change. Good fits:

- **awesome-nodejs** — the section covering text processing or command-line utilities
- **awesome-cli-apps** — the utilities section
- Any curated list explicitly about Unicode, text processing, or developer hygiene

Read each repository's `contributing.md` first. Many require alphabetical placement, a specific link format, or an existing issue before a PR.

## Community post (only where self-promotion is allowed)

**Title:** `strip-invisible – find hidden Unicode in code and data`

**Body:**

```text
I kept hitting "invalid character U+00A0" and JSON errors caused by curly quotes that came from copying code out of a browser. Most editors hide them, so I wrote a small CLI that lists every invisible code point with its line and column and can clean it.

  npx strip-invisible --check --typographic script.py
  npx strip-invisible --write data.csv

It has no dependencies, runs on Node 18+, and never sends anything anywhere. Source and limitations: https://github.com/pentestcurry/strip-invisible

It reports variation selectors and mixed-script confusables but does not remove them automatically, because they can be legitimate in emoji and multilingual text.
```

Post this only in a community whose rules allow project sharing, at most once per community, and answer questions honestly. Do not imply it removes watermarks or defeats detectors.

## Directory / product listing blurb

> strip-invisible is a local, zero-dependency command-line tool that finds and removes invisible Unicode characters — zero-width spaces, bidi controls, byte order marks, soft hyphens, and non-breaking spaces — from text, code, and data files. It reports each finding by code point with line and column, can normalize smart quotes and dashes that break code, and exits non-zero in CI when anything is found.

## Order of operations

1. Make the GitHub repository public.
2. Publish to npm (`npm publish --access public`).
3. Confirm the npm page renders and `npx strip-invisible --version` works.
4. Open one pull request to one list — not several at once.
5. Only post to a community where sharing is allowed, and reply to every comment.
