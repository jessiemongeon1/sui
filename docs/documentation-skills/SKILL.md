---
name: example-app-docs
description: >
  Write documentation pages for Sui example apps. Use when the user provides a GitHub
  repo link and wants an MDX documentation page for an example app, tutorial, or demo.
  Triggers: "write a docs page for this repo", "document this example", "create an
  example page", "use the example template", converting a README into a docs page,
  or standardizing an existing example doc. Covers Move-only, frontend-only, end-to-end,
  indexer, CTF challenge, and SDK sample shapes. Enforces the canonical page structure,
  Sui style guide, and ImportContent usage for code highlights.
---

# Example App Documentation

This skill produces MDX documentation pages for runnable Sui example apps. Every page follows the same structure so readers, contributors, and AI agents find the same information in the same place.

The canonical examples live at:
  https://github.com/MystenLabs/sui/tree/main/docs/content/getting-started/examples

## Critical: Pair with the Sui documentation style guide

**Always load `sui-documentation-style-guide.md` (bundled in this skill directory) alongside the page structure reference.** That skill is the single source of truth for voice, capitalization, terminology, formatting, component usage, and all prose rules. This skill governs page structure and content specific to example app pages. If the two ever appear to conflict, the style guide skill wins on language and this skill wins on page structure.

Do not rely on the rules in this skill for general style guidance. Load the style guide skill and follow it for all prose decisions.

---

## Reference files

### sui-documentation-style-guide — Sui documentation style guide
**Path:** `sui-documentation-style-guide.md`
**Load when:** writing or reviewing any prose. Always load this file.
**Covers:** voice, tense, spelling, capitalization, terminology, word preferences, formatting, bold/italic rules, headings, lists, tables, code blocks, ImportContent attributes, procedures, prerequisites, links, alerts, images, frontmatter, accessibility.

### page-structure — Canonical page scaffold
**Path:** `page-structure.md`
**Load when:** writing a new example page from scratch, or checking whether an existing page has all required sections.
**Covers:** the exact section order, frontmatter schema, prerequisites block, ImportContent syntax, troubleshooting format, and common modifications format.

## Routing guide

| Task | Load |
|------|------|
| Write a new example page from a repo link | page-structure + `sui-documentation-style-guide.skill` |
| Review an existing example page for style | `sui-documentation-style-guide.skill` |
| Check page structure completeness | page-structure |
| Fix style violations in an example page | `sui-documentation-style-guide.skill` |
| Add a new section to an existing page | page-structure + `sui-documentation-style-guide.skill` |

## Skill content

### Workflow

When the user provides a GitHub repo link:

1. **Load the style guide.** Read `sui-documentation-style-guide.md` before writing any prose.
2. **Fetch the repo.** Clone or browse the repo to understand what the example does. Read the README, Move sources, TypeScript/frontend code, config files, and env examples.
3. **Classify the shape.** Determine which shape applies: `move-only`, `frontend-only`, `end-to-end`, `indexer`, `ctf-challenge`, `sdk-sample`, or `other`.
4. **Extract key artifacts.** Identify Move entry functions, structs with `key` ability, events, shared objects, TypeScript transaction builders, wallet hooks, query calls, infrastructure integration points (Walrus, Seal, Enoki, Nautilus), and env vars.
5. **Draft the page.** Follow the canonical page structure in `page-structure.md`. Fill every section. Do not skip sections.
6. **Apply the style guide.** Review all prose against `sui-documentation-style-guide.md` before delivering. This includes voice, tense, capitalization, terminology, formatting, lists, headings, code blocks, and diagrams.
7. **Write the file.** Save as `.mdx` in the appropriate location.

### Key concepts

- **ImportContent for code.** Never paste code inline. Use `<ImportContent source="PATH" mode="code" org="ORG" repo="REPO" branch="BRANCH" fun="FUNCTION" />` to pull code from GitHub. The `branch` attribute specifies the git branch (NOT `ref` — the style guide documents `ref` as valid, but React treats it as a reserved prop, which crashes the page with a "string refs" error in strict mode). Use `fun`, `struct`, `variable`, `module`, or `component` to target specific code blocks.
- **Frontmatter is plain text.** Never put markdown links in frontmatter fields (`title`, `description`, `keywords`). Docusaurus renders frontmatter as React props; markdown links cause "string refs" crashes.
- **Mermaid diagrams.** Every page includes at least 1 mermaid diagram (sequence diagram preferred for multi-step flows). The site has a global mermaid theme configured in docusaurus.config.js — do not add per-page mermaid config.
- **Prerequisites are standardized.** Use the exact Tabs/TabItem block with `[x]` checkbox items. Every bullet must have an inline link to the install/setup page. See page-structure.md for the canonical block.
- **Crosslinks on first mention.** When a Sui concept is first mentioned in body text (PTBs, shared objects, gRPC, zkLogin, and so on), link it to its docs page using a relative path like `/develop/transactions/ptbs/prog-txn-blocks`.
- **Bold term lists.** In "What you learn" and "Common modifications", format as `- **Term:** Definition.` with the bold on the label only. Links go in the definition text, not wrapping the bold label.

### Rules (example-page-specific)

These rules are specific to example app pages. For all general style rules (voice, tense, capitalization, terminology, formatting), defer to `sui-documentation-style-guide.md`.

1. **Never use `ref=` on ImportContent.** Use `branch=` instead. `ref` is a reserved React prop and crashes the page.
2. **Never put markdown links in frontmatter.** Description, title, and keywords must be plain strings.
3. **Every prerequisite bullet must have a link.** No unlinked prerequisites.
4. **Bold term lists in What you learn and Common modifications.** Format as `- **Term:** Definition.` Links go in the definition, not on the bold label.
5. **Troubleshooting format is fixed.** Each entry has an H3 heading, then `**Symptom:**`, `**Cause:**`, `**Fix:**` on separate lines.
6. **No Related links section.** Crosslinks go inline in the body text on first mention of a concept.
7. **Introduce every code block.** A sentence of context must appear above every `<ImportContent>` or fenced code block.
8. **Console commands use `$` prefix.** `$ sui move build`, not `sui move build`.
9. **Placeholders use UPPERCASE_WITH_UNDERSCORES.** `PACKAGE_ID`, `YOUR_API_KEY`.

### Common mistakes

- **Using `ref="solution"` on ImportContent.** This crashes the page with "Function components cannot have string refs". Always use `branch="solution"`.
- **Markdown links in frontmatter description.** Causes the same React string refs crash. Keep description as plain text.
- **Missing links on prerequisites.** Every prereq must link to an install page (Node.js to nodejs.org, Rust to rustup.rs, Slush to slush.app, Git to git-scm.com, and so on).
- **Unbolded common modifications.** Each bullet in Common modifications must use `- **Label:** Explanation.` format.
- **Links wrapping bold labels in term lists.** Write `- **Term:** [Link text](/path) rest of definition.` not `- **[Term](/path):** Definition.`
- **Passive voice in troubleshooting.** "The package was published on the wrong network" should be "You published the package on the wrong network".
- **Quotation marks in headings.** Use backticks for error messages in headings: `` ### Transaction fails with `InvalidSignature` ``, not `"InvalidSignature"`.
- **Stacked headings.** Every heading must have body text before the next heading or component.
- **Forgetting to load the style guide.** Always load `sui-documentation-style-guide.md` before writing prose. This skill only covers page structure and example-specific rules.
