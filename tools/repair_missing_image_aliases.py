#!/usr/bin/env python3
from __future__ import annotations

import os
import re
import shutil
import urllib.request
from collections import defaultdict
from pathlib import Path
from urllib.error import HTTPError, URLError


BASE_DIR = Path(
    "/Users/michael.dolejs/Library/CloudStorage/Dropbox/MICHAELDOLEJSCOM/WEB/WEB-2026"
)
HTML_FILES = [
    BASE_DIR / "index.html",
    BASE_DIR / "projects" / "index.html",
    BASE_DIR / "about" / "index.html",
    BASE_DIR / "wallpapers" / "index.html",
    BASE_DIR / "404" / "index.html",
    BASE_DIR / "404.html",
]
REF_PATTERN = re.compile(r"_vendor/[^\"'\) >]+(?:png|jpg|jpeg|svg|webp|gif)")
HASHED_NAME = re.compile(r"^(?P<base>.+)-(?P<hash>[a-f0-9]{10})(?P<ext>\.[^.]+)$")
ORIGIN_URL = "https://framerusercontent.com/images/{base}{ext}"


def asset_key(path: Path) -> tuple[str, str] | None:
    match = HASHED_NAME.match(path.name)
    if not match:
        return path.stem, path.suffix
    return match.group("base"), match.group("ext")


def download_origin(base: str, ext: str) -> Path | None:
    destination = BASE_DIR / "_vendor" / "framerusercontent.com" / "images" / f"{base}{ext}"
    if destination.exists():
        return destination

    url = ORIGIN_URL.format(base=base, ext=ext)
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36"
            )
        },
    )
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(request) as response:
            destination.write_bytes(response.read())
        return destination
    except (HTTPError, URLError):
        return None


def main() -> None:
    missing: list[Path] = []
    for html_file in HTML_FILES:
        refs = set(REF_PATTERN.findall(html_file.read_text()))
        for ref in refs:
            target = BASE_DIR / ref
            if not target.exists():
                missing.append(target)

    available_by_key: dict[tuple[str, str], list[Path]] = defaultdict(list)
    for path in (BASE_DIR / "_vendor" / "framerusercontent.com" / "images").glob("*"):
        if not path.is_file():
            continue
        key = asset_key(path)
        if key:
            available_by_key[key].append(path)

    for candidates in available_by_key.values():
        candidates.sort()

    missing_by_key: dict[tuple[str, str], list[Path]] = defaultdict(list)
    for path in missing:
        key = asset_key(path)
        if key:
            missing_by_key[key].append(path)

    created = 0
    unresolved: list[str] = []

    for key, targets in missing_by_key.items():
        sources = available_by_key.get(key, [])
        if not sources:
            downloaded = download_origin(*key)
            if downloaded:
                sources = [downloaded]
                available_by_key[key] = sources
        if not sources:
            unresolved.extend(str(t) for t in targets)
            continue

        targets.sort()
        for index, target in enumerate(targets):
            source = sources[min(index, len(sources) - 1)]
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists():
                continue
            try:
                os.link(source, target)
            except OSError:
                shutil.copy2(source, target)
            created += 1

    print(f"Created {created} image aliases")
    if unresolved:
        print("Unresolved:")
        for item in unresolved[:50]:
            print(item)


if __name__ == "__main__":
    main()
