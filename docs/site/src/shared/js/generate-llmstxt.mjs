// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import fs from "fs";
import path from "path";

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    flags[args[i].slice(2)] = args[i + 1];
    i++;
  } else {
    positional.push(args[i]);
  }
}

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const markdownDir = path.resolve(positional[0] ?? path.join(scriptDir, "../../static/markdown"));
const baseUrl      = flags["base-url"]    ?? "";
const outputFile   = flags["output"]      ?? path.join(scriptDir, "../../static/llms.txt");
const siteDesc     = flags["description"] ?? "";
const sitemapSource = flags["sitemap"]    ?? "";
const buildDir      = flags["build-dir"]  ?? "";

// ── Priority sections ─────────────────────────────────────────────────────────
const PINNED_SECTIONS = ["Move", "Sui Developer Skills"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) results.push(full);
  }
  return results;
}

function wrapLine(line, indentSpaces = 0) {
  if (line.length <= 100) return [line];
  const indent = " ".repeat(indentSpaces);
  const words = line.trimStart().split(" ");
  const lines = [];
  let current = indent;

  for (const word of words) {
    if (current.length + word.length + 1 > 100 && current.trim().length > 0) {
      lines.push(current.trimEnd());
      current = indent + "    " + word + " ";
    } else {
      current += word + " ";
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines;
}

function joinUrl(base, p) {
  if (!base) return "/" + p.replace(/^\//, "");
  return base.replace(/\/$/, "") + "/" + p.replace(/^\//, "");
}

// ── Sorting helpers ──────────────────────────────────────────────────────────

function sortPages(pages) {
  return pages.sort((a, b) => {
    const depthA = a.url.split("/").length;
    const depthB = b.url.split("/").length;

    if (depthA !== depthB) return depthA - depthB;
    return a.url.localeCompare(b.url);
  });
}

function getSortedSections(grouped) {
  const sections = Object.keys(grouped);

  return [
    ...PINNED_SECTIONS.filter(s => sections.includes(s)),
    ...sections
      .filter(s => !PINNED_SECTIONS.includes(s))
      .sort((a, b) => a.localeCompare(b))
  ];
}

// ── Static skills loader ─────────────────────────────────────────────────────

function collectStaticSkills(baseDir) {
  const skills = [];
  const skillDirs = [
    { name: "Sui Move", dir: path.join(baseDir, "sui-move") },
    { name: "Sui Frontend", dir: path.join(baseDir, "sui-frontend") },
    { name: "Sui App Development", dir: path.join(baseDir, "sui-app") },
  ];

  for (const { name, dir } of skillDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = walk(dir);

    for (const file of files) {
      const title = path.basename(file, path.extname(file))
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

      const rel = path.relative(baseDir, file).replace(/\\/g, "/");
      const url = joinUrl("", rel.replace(/\.mdx?$/, ""));

      skills.push({
        section: "Sui Developer Skills",
        subsection: name,
        title,
        url: url.endsWith("/") ? url : url + ".md",
        description: ""
      });
    }
  }

  return skills;
}

// ── Load markdown pages (simplified existing logic preserved) ────────────────

if (!fs.existsSync(markdownDir)) {
  console.error(`Directory not found: ${markdownDir}`);
  process.exit(1);
}

const files = walk(markdownDir);
const pages = [];

for (const file of files) {
  const rel = path.relative(markdownDir, file).replace(/\\/g, "/");
  const url = joinUrl(baseUrl, rel.replace(/\.mdx?$/, ""));
  const section = rel.split("/")[0] || "General";

  const title = path.basename(file, path.extname(file))
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  pages.push({ title, url: url + ".md", section });
}

// ── Collect static skills ────────────────────────────────────────────────────

const staticSkills = collectStaticSkills(path.join(scriptDir, "../../static"));

// ── Group pages ──────────────────────────────────────────────────────────────

const grouped = {};

// Inject Move section
grouped["Move"] = [
  {
    title: "Move Language Reference",
    url: "https://move-book.com/llms.txt",
    description: "Authoritative Move language reference and best practices."
  }
];

// Inject skills
if (staticSkills.length > 0) {
  grouped["Sui Developer Skills"] = staticSkills;
}

// Normal pages
for (const page of pages) {
  if (!grouped[page.section]) grouped[page.section] = [];
  grouped[page.section].push(page);
}

// ── Build llms.txt ───────────────────────────────────────────────────────────

const TARGET_CHARS = 100_000;
const sectionOrder = getSortedSections(grouped);

function buildOutput(includeDescriptions = true, trimRatio = 1) {
  const lines = [];

  lines.push("# Documentation", "");

  for (const section of sectionOrder) {
    lines.push(`## ${section}`, "");

    const sectionPages = sortPages(grouped[section]);

    let keep;
    if (PINNED_SECTIONS.includes(section)) {
      keep = sectionPages.length;
    } else {
      keep = Math.max(1, Math.floor(sectionPages.length * trimRatio));
    }

    for (const { title, url, description, subsection } of sectionPages.slice(0, keep)) {
      if (subsection) lines.push(`### ${subsection}`, "");

      lines.push(...wrapLine(`- [${title}](${url})`, 0));

      if (includeDescriptions && description) {
        lines.push(...wrapLine(`    Description: ${description}`, 4));
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

// Pass 1
let output = buildOutput(true, 1);

// Pass 2
if (output.length > TARGET_CHARS) {
  output = buildOutput(false, 1);
}

// Pass 3 (trim non-pinned)
if (output.length > TARGET_CHARS) {
  const ratio = TARGET_CHARS / output.length;
  output = buildOutput(false, ratio);
}

// Hard cap
if (output.length > TARGET_CHARS) {
  output = output.slice(0, TARGET_CHARS);
}

// ── Write file ───────────────────────────────────────────────────────────────

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output, "utf8");

console.log(`✓ Generated ${outputFile} (${output.length.toLocaleString()} chars)`);
