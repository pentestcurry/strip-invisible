"use strict";

const vscode = require("vscode");

const INVISIBLE = [
  { label: "zero-width / invisible", re: /[\u200B-\u200D\u2060\uFEFF\u00AD]/gu, clean: "remove" },
  { label: "bidirectional control", re: /[\u202A-\u202E\u2066-\u2069]/gu, clean: "remove" },
  { label: "unusual space", re: /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/gu, clean: "space" }
];

const TYPOGRAPHIC = [
  { re: /[\u2018\u2019\u201A\u201B]/gu, to: "'" },
  { re: /[\u201C\u201D\u201E\u201F]/gu, to: "\"" },
  { re: /[\u2013\u2014\u2015\u2212]/gu, to: "-" },
  { re: /[\u2010\u2011]/gu, to: "-" },
  { re: /\u2026/gu, to: "..." }
];

function hex(codePoint) {
  return "U+" + codePoint.toString(16).toUpperCase().padStart(4, "0");
}

function scanDocument(document) {
  const text = document.getText();
  const items = [];
  for (const rule of INVISIBLE) {
    const pattern = new RegExp(rule.re.source, rule.re.flags);
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const position = document.positionAt(match.index);
      items.push({
        line: position.line + 1,
        column: position.character + 1,
        label: rule.label,
        hex: hex(match[0].codePointAt(0)),
        index: match.index,
        length: match[0].length
      });
      if (match[0].length === 0) break;
    }
  }
  return items;
}

function cleanText(text) {
  let out = text;
  for (const rule of INVISIBLE) {
    const pattern = new RegExp(rule.re.source, rule.re.flags);
    out = out.replace(pattern, rule.clean === "space" ? " " : "");
  }
  for (const rule of TYPOGRAPHIC) {
    const pattern = new RegExp(rule.re.source, rule.re.flags);
    out = out.replace(pattern, rule.to);
  }
  return out;
}

function refresh(document, collection) {
  if (!document) return;
  const diagnostics = scanDocument(document).map((item) => {
    const start = document.positionAt(item.index);
    const end = document.positionAt(item.index + item.length);
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(start, end),
      `${item.label} ${item.hex} — use "Strip Invisible: Clean Document" to remove it`,
      vscode.DiagnosticSeverity.Warning
    );
    diagnostic.source = "strip-invisible";
    diagnostic.code = "invisible-character";
    return diagnostic;
  });
  collection.set(document.uri, diagnostics);
}

function activate(context) {
  const collection = vscode.languages.createDiagnosticCollection("strip-invisible");
  context.subscriptions.push(collection);

  const refreshAll = () => {
    for (const document of vscode.workspace.textDocuments) refresh(document, collection);
  };

  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((document) => refresh(document, collection)));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => refresh(event.document, collection)));
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((document) => collection.delete(document.uri)));
  refreshAll();

  context.subscriptions.push(
    vscode.commands.registerCommand("stripInvisible.clean", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("Open a file first.");
        return;
      }
      const document = editor.document;
      const original = document.getText();
      const cleaned = cleanText(original);
      if (cleaned === original) {
        vscode.window.showInformationMessage("No invisible or typographic characters found.");
        return;
      }
      const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(original.length));
      const applied = await editor.edit((builder) => builder.replace(fullRange, cleaned));
      if (applied) {
        vscode.window.showInformationMessage("Removed invisible characters and normalized typography.");
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("stripInvisible.scan", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("Open a file first.");
        return;
      }
      const items = scanDocument(editor.document);
      if (!items.length) {
        vscode.window.showInformationMessage("No invisible characters found.");
        return;
      }
      const summary = items
        .slice(0, 20)
        .map((item) => `line ${item.line}, column ${item.column}: ${item.label} ${item.hex}`)
        .join("\n");
      const suffix = items.length > 20 ? `\n…and ${items.length - 20} more` : "";
      vscode.window.showInformationMessage(`${items.length} finding(s):\n${summary}${suffix}`, { modal: true });
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
