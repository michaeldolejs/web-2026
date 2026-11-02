> **Archived 2026-10-28.** The live code is in `WEB-2026/astro/`. Kept for reference only — do not edit.

# michaeldolejs.com

Local static export of the current `michaeldolejs.com` site, prepared for deployment outside Framer.

## Included routes

- `/`
- `/projects`
- `/about`
- `/wallpapers`
- `/404`

## Current setup

- The published Framer pages were mirrored locally.
- Internal Framer-hosted assets and runtime files were vendored into `_vendor/`.
- Page HTML no longer points to external Framer runtime URLs.
- Framer telemetry and editor bootstrapping were disabled for this local copy.

## Important note

This preserves the existing look and behavior as closely as possible, but it is still a vendored export of the Framer-generated runtime, not yet a hand-written HTML/CSS/JS rebuild.

## Local preview

Any static file server will work, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

1. Push this folder to a Git repository.
2. Import the repository in Vercel.
3. Deploy it as a static site.
4. Point the domain after preview verification.

## Maintenance

- Vendor refresh script: [tools/vendor_external_assets.py](/Users/michael.dolejs/Library/CloudStorage/Dropbox/MICHAELDOLEJSCOM/WEB/WEB-2026/tools/vendor_external_assets.py:1)
