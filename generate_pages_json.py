#!/usr/bin/env python3
import os
import json

# Collect all markdown files and map to expected HTML output paths.
# Exclude repository-only documentation files.
SKIP_FILES = {"README.md", "search.md"}

def parse_markdown(path):
    """Return (title, text) for the markdown file at *path*."""
    import re
    import markdown

    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    raw = raw.lstrip("\ufeff\n")

    body = raw
    title = None

    if raw.startswith("---"):
        # strip YAML front matter
        end = raw.find("\n---", 3)
        if end != -1:
            front = raw[3:end]
            body = raw[end + 4 :]
            m = re.search(r"^title:\s*(.*)$", front, re.MULTILINE)
            if m:
                title = m.group(1).strip()
                if len(title) >= 2 and title[0] == title[-1] and title[0] in "\"'":
                    title = title[1:-1].replace('\\"', '"').replace("\\'", "'")

    if title is None:
        m = re.search(r"^#\s*(.+)$", body, re.MULTILINE)
        if m:
            title = m.group(1).strip()
        else:
            title = os.path.splitext(os.path.basename(path))[0]

    html = markdown.markdown(body)
    text = re.sub("<[^>]+>", "", html)
    return title, text

def collect_pages(root="."):
    pages = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip hidden, Jekyll-specific, and dependency directories
        dirnames[:] = [
            d
            for d in dirnames
            if not d.startswith((".", "_")) and d not in ("vendor", "node_modules")
        ]
        for filename in filenames:
            if not filename.endswith(".md") or filename in SKIP_FILES:
                continue
            md_path = os.path.join(dirpath, filename)
            rel_md = os.path.relpath(md_path, root)
            html_path = os.path.splitext(rel_md)[0] + ".html"
            title, text = parse_markdown(md_path)
            pages.append(
                {
                    "url": html_path.replace(os.sep, "/"),
                    "title": title,
                    "content": text,
                }
            )
    pages.sort(key=lambda p: p["url"])
    return pages

def main():
    pages = collect_pages()
    with open("pages.json", "w", encoding="utf-8") as f:
        json.dump(pages, f, indent=2)

if __name__ == '__main__':
    main()
