# Contributing

Thanks for taking a look. This project stays deliberately small and dependency-free.

## Development

```bash
git clone https://github.com/pentestcurry/strip-invisible.git
cd strip-invisible
node test.mjs
```

There is no build step and no install step. The library and CLI are plain ES modules on Node 18+.

## Pull requests

- Keep the dependency list empty.
- Add a test in `test.mjs` for any new character range or flag.
- Run `node --check index.mjs && node --check cli.mjs && node test.mjs`.
- Describe the character or code point in the PR, with its hex value.

## Reporting a character that is not detected

Open an issue with:

- the code point (for example `U+2062`),
- what it breaks (parser, import, search, display),
- a minimal reproduction string.
