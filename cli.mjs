#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { scan, clean, summarize } from "./index.mjs";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const HELP = `strip-invisible ${pkg.version}

Find and remove invisible Unicode characters from text, code, and data files.

Usage
  strip-invisible [options] [file ...]
  cat file.txt | strip-invisible [options]

Options
  -w, --write         Rewrite files in place
  -c, --check         Report findings and exit 1 if any are found
  -t, --typographic   Also convert smart quotes, dashes, ellipsis, full-width
  -j, --json          Print findings as JSON
  -q, --quiet         Suppress the per-file summary
  -h, --help          Show this help
  -v, --version       Show the version

Examples
  strip-invisible notes.txt
  strip-invisible --check --typographic script.py
  strip-invisible --write data.csv
  cat logs.txt | strip-invisible --json

Exit codes
  0  clean, or written successfully
  1  findings present with --check
  2  usage or read error
`;

function parseArgs(argv) {
  const options = {
    write: false,
    check: false,
    typographic: false,
    json: false,
    quiet: false,
    help: false,
    version: false,
    files: []
  };
  for (const arg of argv) {
    if (arg === "-w" || arg === "--write") options.write = true;
    else if (arg === "-c" || arg === "--check") options.check = true;
    else if (arg === "-t" || arg === "--typographic") options.typographic = true;
    else if (arg === "-j" || arg === "--json") options.json = true;
    else if (arg === "-q" || arg === "--quiet") options.quiet = true;
    else if (arg === "-h" || arg === "--help") options.help = true;
    else if (arg === "-v" || arg === "--version") options.version = true;
    else if (arg === "--") continue;
    else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else {
      options.files.push(arg);
    }
  }
  return options;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function report(file, rows) {
  const { total } = summarize(rows);
  console.error(
    `${file}: ${total} finding${total === 1 ? "" : "s"} in ${rows.length} code point${rows.length === 1 ? "" : "s"}`
  );
  for (const row of rows) {
    const name = row.name ? ` ${row.name}` : "";
    console.error(
      `  ${row.hex}${name} — ${row.label} ×${row.count} at line ${row.first.line}, column ${row.first.column}`
    );
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return 0;
  }
  if (options.version) {
    process.stdout.write(pkg.version + "\n");
    return 0;
  }

  const useStdin = options.files.length === 0 && !process.stdin.isTTY;
  if (options.files.length === 0 && !useStdin) {
    process.stderr.write(HELP);
    return 2;
  }
  if (options.write && useStdin) {
    console.error("--write needs a file path.");
    return 2;
  }
  if (!options.write && !options.check && !options.json && options.files.length > 1) {
    console.error("Multiple files need --write, --check, or --json.");
    return 2;
  }

  const results = [];
  let flagged = 0;

  if (useStdin) {
    const text = await readStdin();
    const rows = scan(text, { typographic: options.typographic });
    if (options.json) {
      results.push({
        file: "<stdin>",
        findings: rows,
        changed: clean(text, { typographic: options.typographic }) !== text
      });
    } else if (options.check) {
      report("<stdin>", rows);
    } else {
      process.stdout.write(clean(text, { typographic: options.typographic }));
    }
    if (rows.length) flagged += 1;
  } else {
    for (const file of options.files) {
      let text;
      try {
        text = await readFile(file, "utf8");
      } catch (error) {
        console.error(`Cannot read ${file}: ${error.message}`);
        return 2;
      }

      const rows = scan(text, { typographic: options.typographic });
      const cleaned = clean(text, { typographic: options.typographic });
      const changed = cleaned !== text;
      if (rows.length) flagged += 1;

      if (options.json) {
        results.push({ file, findings: rows, changed });
      } else if (options.check) {
        report(file, rows);
      } else if (options.write) {
        if (changed) {
          await writeFile(file, cleaned, "utf8");
          if (!options.quiet) console.error(`cleaned ${file}`);
        } else if (!options.quiet) {
          console.error(`already clean ${file}`);
        }
      } else {
        process.stdout.write(cleaned);
      }
    }
  }

  if (options.json) {
    const payload = results.length === 1 && useStdin ? results[0] : results;
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  }

  if (options.check && flagged) return 1;
  return 0;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 2;
  });
