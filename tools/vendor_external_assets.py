#!/usr/bin/env python3
from __future__ import annotations

import html
import hashlib
import os
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlparse
from urllib.error import HTTPError, URLError


BASE_DIR = Path(
    "/Users/michael.dolejs/Library/CloudStorage/Dropbox/MICHAELDOLEJSCOM/WEB/WEB-2026"
)
VENDOR_DIR = BASE_DIR / "_vendor"
TARGET_FILES = [
    BASE_DIR / "index.html",
    BASE_DIR / "projects" / "index.html",
    BASE_DIR / "about" / "index.html",
    BASE_DIR / "wallpapers" / "index.html",
    BASE_DIR / "404" / "index.html",
    BASE_DIR / "404.html",
]

URL_PATTERN = re.compile(r"https://[^\s\"'`(),<>]+")
VENDOR_HOSTS = {
    "framerusercontent.com",
    "cdn.commoninja.com",
}
TEXT_EXTENSIONS = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".mjs",
    ".svg",
    ".txt",
    ".xml",
}
EDITOR_INIT_URL = "https://framer.com/edit/init.mjs"


def should_vendor(url: str) -> bool:
    parsed = urlparse(html.unescape(url))
    return parsed.netloc in VENDOR_HOSTS


def local_path_for(url: str) -> Path:
    parsed = urlparse(html.unescape(url))
    relative = Path(parsed.netloc) / parsed.path.lstrip("/")
    if not relative.suffix:
        relative = relative / "index"
    if parsed.query:
        stem = relative.stem
        suffix = relative.suffix
        digest = hashlib.sha1(parsed.query.encode("utf-8")).hexdigest()[:10]
        relative = relative.with_name(f"{stem}-{digest}{suffix}")
    return VENDOR_DIR / relative


def download(url: str, destination: Path) -> None:
    resolved_url = html.unescape(url)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        return
    request = urllib.request.Request(
        resolved_url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36"
            )
        },
    )
    try:
        with urllib.request.urlopen(request) as response:
            destination.write_bytes(response.read())
    except (HTTPError, URLError) as exc:
        print(f"Skipping {resolved_url}: {exc}")


def text_files_to_rewrite() -> list[Path]:
    vendor_files = [
        path
        for path in VENDOR_DIR.rglob("*")
        if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS
    ]
    return TARGET_FILES + vendor_files


def rewrite_html(file_path: Path, url_map: dict[str, Path]) -> None:
    original = file_path.read_text()
    rewritten = original

    # Editor preload is only useful inside Framer.
    rewritten = rewritten.replace(
        '<script>try{if(localStorage.get("__framer_force_showing_editorbar_since")){const n=document.createElement("link");n.rel = "modulepreload";n.href="https://framer.com/edit/init.mjs";document.head.appendChild(n)}}catch(e){}</script>\n',
        "",
    )
    rewritten = re.sub(
        r'<script[^>]+src="https://events\.framer\.com/script\?v=2"[^>]*></script>',
        "",
        rewritten,
    )

    for url, local_file in url_map.items():
        if url not in rewritten:
            continue
        href = os.path.relpath(local_file, start=file_path.parent).replace(os.sep, "/")
        rewritten = rewritten.replace(url, href)

    file_path.write_text(rewritten)


def postprocess_runtime() -> None:
    stub = (
        "export function createEditorBar(){\n"
        "  return function EditorBar(){\n"
        "    return null;\n"
        "  };\n"
        "}\n"
    )

    for script_main in VENDOR_DIR.rglob("script_main*.mjs"):
        content = script_main.read_text()
        if EDITOR_INIT_URL not in content:
            continue
        content = content.replace(EDITOR_INIT_URL, "./editor-init.local.mjs")
        script_main.write_text(content)
        (script_main.parent / "editor-init.local.mjs").write_text(stub)

    vendored_editor_init = VENDOR_DIR / "framer.com" / "edit" / "init.mjs"
    if vendored_editor_init.exists():
        vendored_editor_init.write_text(stub)

    events_dir = VENDOR_DIR / "events.framer.com" / "script"
    if events_dir.exists():
        for script in events_dir.glob("*"):
            if script.is_file():
                script.write_text("// telemetry removed during static export\n")


def main() -> None:
    url_map: dict[str, Path] = {}
    processed: set[str] = set()

    while True:
        discovered_urls: set[str] = set()
        for file_path in text_files_to_rewrite():
            discovered_urls.update(URL_PATTERN.findall(file_path.read_text()))

        vendored = sorted(url for url in discovered_urls if should_vendor(url))
        pending = [url for url in vendored if url not in processed]
        if not pending:
            break

        for url in pending:
            local_file = local_path_for(url)
            download(url, local_file)
            url_map[url] = local_file
            processed.add(url)

        for file_path in text_files_to_rewrite():
            rewrite_html(file_path, url_map)

    postprocess_runtime()
    print(f"Vendored {len(url_map)} assets into {VENDOR_DIR}")


if __name__ == "__main__":
    main()
