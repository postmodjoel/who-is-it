import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([
  ".git",
  ".claude",
  ".codex",
  ".pnpm-store",
  ".scratch",
  "Example",
  "habbo_audit_mapping_ready",
  "node_modules",
  "playwright-report",
  "test-results"
]);

function filesUnder(directory = root) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...filesUnder(absolute));
    else found.push(absolute);
  }
  return found;
}

const repositoryFiles = filesUnder();
const relative = (file) => path.relative(root, file).split(path.sep).join("/");

function localTarget(reference, baseUrl) {
  if (!reference
      || reference.startsWith("#")
      || reference.includes("${")
      || /^(?:data|https?|mailto|tel|javascript):/i.test(reference)) return null;
  const url = new URL(reference, baseUrl);
  if (url.origin !== "https://who.test") return null;
  const pathname = decodeURIComponent(url.pathname);
  const candidate = path.resolve(root, `.${pathname}`);
  if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== root) {
    throw new Error(`reference escapes repository root: ${reference}`);
  }
  return pathname.endsWith("/") ? path.join(candidate, "index.html") : candidate;
}

test("every local HTML asset and link resolves after the directory move", () => {
  const failures = [];
  const pages = repositoryFiles.filter((file) => file.endsWith(".html"));

  for (const page of pages) {
    const source = fs.readFileSync(page, "utf8");
    const pagePath = `/${relative(page)}`;
    const pageUrl = new URL(pagePath, "https://who.test");
    const baseMatch = source.match(/<base\s+[^>]*href=["']([^"']+)["']/i);
    const baseUrl = baseMatch ? new URL(baseMatch[1], pageUrl) : pageUrl;

    for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)) {
      const reference = match[1];
      const target = localTarget(reference, baseUrl);
      if (target && !fs.existsSync(target)) {
        failures.push(`${relative(page)} -> ${reference} (${relative(target)})`);
      }
    }
  }

  assert.deepEqual(failures, [], `broken HTML references:\n${failures.join("\n")}`);
});

test("every local CSS url resolves from its stylesheet", () => {
  const failures = [];
  const stylesheets = repositoryFiles.filter((file) => file.endsWith(".css"));

  for (const stylesheet of stylesheets) {
    const source = fs.readFileSync(stylesheet, "utf8");
    const stylesheetUrl = new URL(`/${relative(stylesheet)}`, "https://who.test");
    for (const match of source.matchAll(/\burl\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
      const reference = match[2];
      const target = localTarget(reference, stylesheetUrl);
      if (target && !fs.existsSync(target)) {
        failures.push(`${relative(stylesheet)} -> ${reference} (${relative(target)})`);
      }
    }
  }

  assert.deepEqual(failures, [], `broken CSS references:\n${failures.join("\n")}`);
});

test("every relative JavaScript module import resolves", () => {
  const failures = [];
  const scripts = repositoryFiles.filter((file) => /\.(?:js|mjs)$/.test(file));

  for (const script of scripts) {
    const source = fs.readFileSync(script, "utf8");
    const imports = [
      ...source.matchAll(/\bfrom\s+["'](\.[^"']+)["']/g),
      ...source.matchAll(/\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g)
    ];
    for (const match of imports) {
      const reference = match[1];
      const target = path.resolve(path.dirname(script), reference);
      if (!fs.existsSync(target)) {
        failures.push(`${relative(script)} -> ${reference} (${relative(target)})`);
      }
    }
  }

  assert.deepEqual(failures, [], `broken JavaScript imports:\n${failures.join("\n")}`);
});

test("every literal assets path resolves from the public root", () => {
  const failures = [];
  const sources = repositoryFiles.filter((file) => /\.(?:css|html|js|mjs)$/.test(file));

  for (const sourceFile of sources) {
    const source = fs.readFileSync(sourceFile, "utf8");
    for (const match of source.matchAll(/["'`](?:\.\.\/|\.\/|\/)?(assets\/[^"'`?#${}\s]*)/g)) {
      const reference = match[1];
      const target = path.join(root, reference);
      if (!fs.existsSync(target)) {
        failures.push(`${relative(sourceFile)} -> ${reference}`);
      }
    }
  }

  assert.deepEqual(failures, [], `broken literal assets paths:\n${failures.join("\n")}`);
});

test("all moved runtime entry points are loaded from src", () => {
  const oldRootFiles = [
    "app.js",
    "breeding.js",
    "clothing-profiles.js",
    "editor-shared.js",
    "face-generator.js",
    "faces-hair.js",
    "game-data.js",
    "groupthink-data.js",
    "groupthink-lab.js",
    "groupthink-rules.js",
    "groupthink.css",
    "groupthink.js",
    "habbo-assets.js",
    "habbo-avatars.js",
    "habbo-spares.js",
    "make-rules.js",
    "modes.js",
    "net.js",
    "opponent-sim.js",
    "sound.js",
    "studio-bakes-import.js",
    "styles.css",
    "who-did-you-make.css",
    "who-did-you-make.js"
  ];

  for (const file of oldRootFiles) {
    assert.equal(fs.existsSync(path.join(root, file)), false, `${file} unexpectedly returned to the repository root`);
  }
});
