> **Archived 2026-10-28.** The live code is in `WEB-2026/astro/`. Kept for reference only — do not edit.

# michaeldolejs.com — hand-written rebuild

Clean static HTML/CSS/JS version of the site, without the Framer runtime.
The Framer export in `../framer-export/` stays as a backup and reference.

## Structure

- `index.html` — homepage (done)
- `projects/index.html` — projects: featured slider + list of 82 projects (done; edit rows directly in the HTML)
- `about/index.html` — bio, photo gallery, CV, Spotify playlist, links (done)
- `wallpapers/index.html` — wallpapers composition (done)
- `404.html` — not-found page, served automatically by Vercel (done)
- `assets/css/main.css` — tokens (colors, type scale, spacing) + all styles
- `assets/js/main.js` — mobile menu, showreel autoplay on view, link hover roll
- `assets/fonts/` — Saans Regular / Medium
- `assets/img/`, `assets/video/` — media copied from `../framer-export/_vendor` / Framer CDN (`assets/img/projects/` = featured slides)

## To do

- Deploy to Vercel and switch the domain from Framer

## Local preview

```bash
python3 -m http.server 4173
```

## Deployment

Vercel: set the project Root Directory to `WEB-2026/site`, static, no build step.
