# Strip Invisible Characters (VS Code)

Highlights invisible Unicode in the editor and removes it on demand.

Zero-width spaces, non-breaking spaces, soft hyphens, byte order marks, and bidirectional controls survive copy-paste and break code, JSON, CSV, and search. This extension flags them as diagnostics and cleans the active document in one command.

## Features

- Warning squiggles on every invisible character, with its code point
- **Strip Invisible: Clean Document** — removes zero-width/bidi controls, normalizes unusual spaces, and converts smart quotes, dashes, ellipsis, and full-width punctuation
- **Strip Invisible: Show Findings** — lists line/column and code point for the active file
- Runs locally; no network requests

## Commands

| Command | Action |
|---|---|
| `Strip Invisible: Clean Document` | Clean the active document |
| `Strip Invisible: Show Findings` | List invisible characters in the active document |

## Development

```bash
cd tools/vscode-strip-invisible
npm install -g @vscode/vsce
vsce package          # produces strip-invisible-vscode-0.1.0.vsix
code --install-extension strip-invisible-vscode-0.1.0.vsix
```

## Publishing

1. Create a publisher at <https://marketplace.visualstudio.com/manage> (the `publisher` field is `rephrasr`)
2. Create an Azure DevOps personal access token with **Marketplace → Manage** scope
3. Publish:

```bash
vsce login rephrasr
vsce publish
```

## Related

- CLI: [strip-invisible](https://www.npmjs.com/package/strip-invisible)
- Web tools: <https://aiwatermarkremovers.com/text-integrity-checker> · <https://aiwatermarkremovers.com/code-cleaner>

## License

MIT
