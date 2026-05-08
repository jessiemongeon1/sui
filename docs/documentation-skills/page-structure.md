# Canonical page structure

Every example app page has these sections in this exact order. Do not reorder, skip, or invent new top-level sections.

## 1. Frontmatter

```yaml
---
title: Page Title In Title Case
description: One sentence, plain text, no markdown links. What the example does and what the reader learns.
keywords: [example, keyword-one, keyword-two]
example_id: kebab-case-slug
last_verified: YYYY-MM-DD
repo: https://github.com/ORG/REPO
path: /PATH_WITHIN_REPO
concepts:
  - concept_one
  - concept_two
---
```

**Rules:**
- `title` is title case. Do not capitalize short prepositions (a, an, and, but, for, in, or, to, with) unless first/last word.
- `description` is plain text. NO markdown links. NO special characters. This value renders as a meta tag and as card text in DocCardList.
- `keywords` always starts with `example`.
- `example_id` is kebab-case, globally unique.
- `concepts` lists the Sui concepts the example teaches, as snake_case identifiers.

## 2. Intro paragraph (no heading)

2-3 sentences. What the example is, what it demonstrates, and where the source code lives. Link key Sui concepts to their docs page on first mention. End with identifying the source repo.

Example:
```
This example demonstrates how to integrate [zkLogin](/sui-stack/zklogin-integration/zklogin) into a React application so users can authenticate with familiar OAuth providers (Google, Apple) and interact with the Sui blockchain without managing private keys.
```

## 3. When to use this pattern

```markdown
## When to use this pattern

Use this pattern when you need to:

- Use case one.
- Use case two.
- Use case three.
```

3-5 bullets. Help the reader decide if this example is relevant. Full sentences, end with periods.

## 4. What you learn

```markdown
## What you learn

This example teaches:

- **Concept one:** One-line definition that explains the concept in the context of this example.
- **Concept two:** Definition.
- **Concept three:** Definition.
```

3-6 items. Bold term with colon. Each item should name the concept, then explain what it does in this example specifically.

## 5. Architecture

```markdown
## Architecture

The example has N components/actors. DESCRIBE_THEM. The diagram below traces 1 INTERACTION_TYPE.

\`\`\`mermaid
sequenceDiagram
  participant User
  participant Frontend as React frontend
  participant Wallet
  participant Package as Move package

  User->>Frontend: Action
  Frontend->>Wallet: Sign and execute
  Wallet->>Package: Execute function
  Package-->>Frontend: Result
\`\`\`

The following steps walk through the flow:

1. Step one.
2. Step two.
3. Step three.
```

Always include at least 1 mermaid diagram. Prefer sequence diagrams for multi-step flows. Always introduce the diagram with a sentence above it and walk through the flow in a numbered list below it.

The site has a global mermaid theme in docusaurus.config.js. Do not add per-page mermaid frontmatter or init directives.

## 6. How TECHNOLOGY works (optional)

Include only when the example uses external infrastructure (Walrus, Seal, Nautilus/TEE, Enoki, a sponsor backend, a custom indexer). 1-3 paragraphs. Explain only what the example touches. Link to authoritative docs for depth. Delete this section entirely if there is no external infrastructure.

## 7. Prerequisites

```jsx
## Prerequisites

<Tabs className="tabsHeadingCentered--small">
<TabItem value="prereq" label="Prerequisites">
- [x] [Install the latest version of Sui](/getting-started/onboarding/sui-install).

- [x] [Configure the Sui client](/getting-started/onboarding/configure-sui-client).

- [x] [Create a Sui address](/getting-started/onboarding/get-address).

- [x] [Get SUI Testnet tokens](/getting-started/onboarding/get-coins).

- [x] Download and install an IDE. The following are recommended, as they offer Move extensions:

    - [VSCode](https://code.visualstudio.com/), corresponding [Move extension](https://marketplace.visualstudio.com/items?itemName=mysten.move)

    - [Emacs](https://www.gnu.org/software/emacs/), corresponding [Move extension](https://github.com/amnn/move-mode)

    - [Vim](https://www.vim.org/download.php), corresponding [Move extension](https://github.com/yanganto/move.vim)

    - [Zed](https://zed.dev/), corresponding [Move extension](https://github.com/Tzal3x/move-zed-extension)

        Alternatively, you can use the [Move web IDE](https://www.playmove.dev/), which does not require a download. It does not support all functions necessary for this guide, however.

- [x] [Download and install Git](https://git-scm.com/downloads).

- [x] [Node.js](https://nodejs.org/) 18 or later

</TabItem>
</Tabs>
```

**Rules:**
- Every bullet MUST have an inline link to the install/setup page.
- Standard links: Node.js -> https://nodejs.org/, Rust -> https://rustup.rs/, Git -> https://git-scm.com/downloads, Slush Wallet -> https://slush.app/, Google OAuth -> https://console.cloud.google.com/, Enoki -> https://portal.enoki.mystenlabs.com/
- Add example-specific prereqs after the standard ones (wallet, API keys, Enoki app, etc.).
- Fragment items (no periods) for prerequisites.

## 8. Setup

```markdown
## Setup

Follow these steps to set up the example locally.

##### Step 1: Clone the repo

\`\`\`bash
$ git clone -b BRANCH https://github.com/ORG/REPO.git
$ cd REPO/PATH
\`\`\`

##### Step 2: Install dependencies / Build

\`\`\`bash
$ pnpm install
\`\`\`
```

Use H5 (`#####`) for step headings. Number steps sequentially. Every step must have body text or a code block (no stacked headings). Console commands use `$` prefix. Placeholders use UPPERCASE_WITH_UNDERSCORES.

## 9. Run the example

```markdown
## Run the example

Start the frontend:

\`\`\`bash
$ pnpm dev
\`\`\`

Open \`http://localhost:PORT\` in a browser. DESCRIBE_WHAT_THE_READER_SEES. DESCRIBE_HOW_TO_VERIFY.
```

## 10. Key code highlights

```markdown
## Key code highlights

The following snippets are the parts of the code worth reading carefully.

### Descriptive heading in sentence case

One sentence introducing what this code does and why it matters.

<ImportContent source="PATH/TO/FILE" mode="code" org="ORG" repo="REPO" branch="BRANCH" fun="FUNCTION_NAME" />

One to two sentences explaining the key details. Name the parameters, object types, and any non-obvious behavior.
```

**Rules:**
- 3-6 highlights per page.
- NEVER use `ref=`. Always use `branch=` for the git branch.
- Always introduce the ImportContent with a sentence above it.
- Always explain the code with a sentence below it.
- Use `fun` for functions, `struct` for structs, `variable` for variables, `module` for modules, `component` for React components.
- Use sentence case for highlight headings.

## 11. Common modifications

```markdown
## Common modifications

- **Modification name:** One sentence explaining how to implement it.
- **Another modification:** Explanation.
```

3-5 bullets. Bold label with colon. Each names a specific change a builder might want and briefly explains how.

## 12. Troubleshooting

```markdown
## Troubleshooting

### Error or symptom in sentence case

**Symptom:** What the user sees.

**Cause:** Why it happens.

**Fix:** How to resolve it.
```

**Rules:**
- Use backticks for error messages in headings: `` ### Transaction fails with `InvalidSignature` ``
- Never use quotation marks in headings.
- Use active voice in Cause/Fix.
- 3-5 entries per page. Pick errors that are specific to this example.
