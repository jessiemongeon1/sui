"""
Docs Style Guide Audit

Reads changed .mdx files from a PR, sends each to Claude for review against
the Sui Documentation Style Guide skill, and generates a PR review comment
with findings and inline suggestions.
"""

import json
import os
import re
import sys
from pathlib import Path

import anthropic

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ANTHROPIC_API_KEY = os.environ["OPENAI_API_KEY"]
CHANGED_FILES = os.environ.get("CHANGED_FILES", "")
REPO_ROOT = os.environ.get("GITHUB_WORKSPACE", ".")

# Path to the style guide skill file (relative to repo root)
SKILL_PATH = os.path.join(REPO_ROOT, "docs", "sui-documentation-style-guide.skill")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# ---------------------------------------------------------------------------
# Load the style guide skill
# ---------------------------------------------------------------------------


def load_style_guide() -> str:
    """Load the style guide skill file content, stripping frontmatter."""
    with open(SKILL_PATH) as f:
        content = f.read()

    # Strip YAML frontmatter (between --- delimiters)
    if content.startswith("---"):
        end = content.find("---", 3)
        if end != -1:
            content = content[end + 3:].strip()

    return content


# ---------------------------------------------------------------------------
# Audit logic
# ---------------------------------------------------------------------------

AUDIT_SYSTEM = """You are a documentation style guide auditor for the Sui blockchain project.

You will be given the content of a documentation file (.mdx) and the Sui Documentation Style Guide.

Your job is to audit the file against the style guide and report ALL violations. Every rule in the style guide is mandatory — there are no optional rules.

**Critical: Never suggest changes to code, code blocks, inline code, or anything inside backticks. Leave all code as-is. Only audit prose, headings, frontmatter, and formatting.**

For each violation found, report:
1. The line number (or approximate location)
2. The rule being violated (brief reference to the style guide section)
3. The current text
4. The suggested fix

Output format — return a JSON object:
{
  "file": "path/to/file.mdx",
  "summary": "Brief summary of findings",
  "violations": [
    {"line": 10, "rule": "Rule name", "current": "current text", "suggested": "fixed text"}
  ]
}

If the file has no violations, return:
{"file": "path/to/file.mdx", "summary": "No violations found", "violations": []}

Return ONLY valid JSON, no markdown fencing.
"""


def audit_file(file_path: str, style_guide: str) -> dict:
    """Audit a single file against the style guide."""
    abs_path = os.path.join(REPO_ROOT, file_path)
    if not os.path.exists(abs_path):
        return {
            "file": file_path,
            "summary": "File not found",
            "violations": [],
        }

    with open(abs_path) as f:
        content = f.read()

    # Skip very large files (over 60k chars)
    if len(content) > 60000:
        content = content[:60000] + "\n\n[... truncated for length ...]"

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        system=AUDIT_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": (
                    f"## Style Guide\n\n{style_guide}\n\n"
                    f"## File to Audit: `{file_path}`\n\n{content}"
                ),
            }
        ],
    )

    response_text = message.content[0].text.strip()
    if response_text.startswith("```"):
        response_text = re.sub(r"^```(?:json)?\n?", "", response_text)
        response_text = re.sub(r"\n?```$", "", response_text)

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        return {
            "file": file_path,
            "summary": "Failed to parse audit response",
            "violations": [],
            "_raw": response_text,
        }


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------


def generate_review_comment(results: list[dict]) -> str:
    """Generate a markdown PR review comment from audit results."""
    marker = "<!-- style-guide-audit -->"

    total_violations = sum(len(r.get("violations", [])) for r in results)

    if total_violations == 0:
        return f"{marker}\n## Style Guide Audit\n\nAll {len(results)} file(s) pass the style guide audit."

    lines = [
        marker,
        "## Style Guide Audit",
        "",
        f"Audited **{len(results)}** file(s) against the "
        f"[Sui Documentation Style Guide](https://docs.sui.io/references/contribute/style-guide).",
        "",
        f"**{total_violations}** violation(s) found. All must be fixed before merge.",
        "",
    ]

    for result in results:
        file_path = result.get("file", "unknown")
        violations = result.get("violations", [])

        if not violations:
            continue

        lines.append(f"### `{file_path}` ({len(violations)} violation(s))")
        lines.append("")
        if result.get("summary"):
            lines.append(f"_{result['summary']}_")
            lines.append("")

        for item in violations:
            lines.append(f"- **Line {item.get('line', '?')}** — {item.get('rule', '')}")
            lines.append(f"  - Current: `{item.get('current', '')[:150]}`")
            lines.append(f"  - Fix: `{item.get('suggested', '')[:150]}`")
        lines.append("")

    lines.append("---")
    lines.append("_Automated audit using the Sui Documentation Style Guide._")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    print("=== Docs Style Guide Audit ===")

    # Load style guide
    print(f"Loading style guide from: {SKILL_PATH}")
    if not os.path.exists(SKILL_PATH):
        print(f"ERROR: Style guide skill file not found at {SKILL_PATH}")
        sys.exit(1)

    style_guide = load_style_guide()
    print(f"Style guide loaded ({len(style_guide)} chars)")

    # Read changed files
    if not CHANGED_FILES or not os.path.exists(CHANGED_FILES):
        print("No changed files to audit")
        return

    with open(CHANGED_FILES) as f:
        files = [line.strip() for line in f if line.strip() and line.strip().endswith(".mdx")]

    if not files:
        print("No .mdx files to audit")
        return

    print(f"\nAuditing {len(files)} file(s):")
    for f in files:
        print(f"  - {f}")

    # Audit each file
    results = []
    for file_path in files:
        print(f"\nAuditing: {file_path}")
        result = audit_file(file_path, style_guide)
        results.append(result)

        count = len(result.get("violations", []))
        print(f"  {count} violation(s)")

    # Generate review comment
    review = generate_review_comment(results)

    # Write to file for the workflow to post
    output_path = "/tmp/audit_review.md"
    with open(output_path, "w") as f:
        f.write(review)
    print(f"\nReview written to {output_path}")

    # Summary
    total = sum(len(r.get("violations", [])) for r in results)
    print(f"\nTotal: {total} violation(s)")

    if total > 0:
        print(f"\nFailing: {total} style guide violation(s) must be fixed")
        sys.exit(1)


if __name__ == "__main__":
    main()
