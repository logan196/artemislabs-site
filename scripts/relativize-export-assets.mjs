// Next's relative assetPrefix ("./") is correct for the site root, and wrong
// one directory down: /delivered/index.html would request /delivered/_next,
// which does not exist, so the page renders as unstyled HTML.
// Rewrite exported HTML and flight files so each directory points at the
// shared /_next folder with the right number of "../" segments. This keeps
// the export working both at a domain root and under a project subpath.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve("out");

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else if (entry.name.endsWith(".html") || entry.name.endsWith(".txt")) acc.push(full);
  }
  return acc;
}

const files = await walk(out);
let rewritten = 0;
for (const file of files) {
  const text = await readFile(file, "utf8");
  if (!text.includes("./_next/")) continue;
  const relDir = path.relative(out, path.dirname(file));
  const depth = relDir === "" ? 0 : relDir.split(path.sep).length;
  if (depth === 0) continue;
  const prefix = "../".repeat(depth);
  const next = text.replaceAll("./_next/", `${prefix}_next/`);
  if (next === text) continue;
  await writeFile(file, next);
  rewritten += 1;
  console.log(`relativize ${path.relative(out, file)} -> ${prefix}_next/`);
}
console.log(`relativized ${rewritten} export files`);
