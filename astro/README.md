# michaeldolejs.com — Astro

Astro version of the hand-written site in `../_archive/html-site`. Same HTML, CSS and JS; header, footer and repeated blocks are components and lists live in JSON.

## Edit content

- `src/data/projects.json` — finished projects (`title`, `tags`, `meta`, optional `href`; without `href` the row is not a link)
- `src/data/featured.json` — featured projects slider (images in `public/assets/img/projects/`)
- `src/data/cv.json` — About page CV groups
- `src/data/gallery.json` — About page photo slider
- `src/data/site.json` — e-mail, header links, "Other places you can find me at"
- Page texts — `src/pages/*.astro`

## Structure

- `src/layouts/Base.astro` — `<head>`, meta tags, nav, footer
- `src/components/` — Nav, Footer, PageHead, SocialLinks, Contact, Email, Slider, ProjectRow
- `src/styles/main.css` — tokens + all styles (copied from `../_archive/html-site/assets/css/main.css`)
- `src/scripts/main.js` — mobile menu, showreel autoplay, text roll, slider
- `public/assets/` — fonts, images, video, favicon

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

`node_modules/`, `dist/` and `.astro/` are marked as ignored by Dropbox (`xattr -w com.dropbox.ignored 1 <dir>`). If you recreate them, mark them again.

## Deployment

Vercel: Root Directory `WEB-2026/astro`, framework preset Astro (build `npm run build`, output `dist`).

## Case studies (project overlays)

Every featured project on `/projects` opens an overlay. Its content lives in
`src/content/case-studies/<slug>.md` (slug = `slug` in `src/data/featured.json`;
rows in `src/data/projects.json` with `"caseStudy": "<slug>"` open the same overlay).

```md
---
title: "Biano visual identity"
meta: "Freelance (2023)"
tags: "Logotype, Visual identity"
link: "https://…"                # optional button at the bottom
linkLabel: "See full project on Behance"
cover: "/assets/img/projects/biano.jpg"
credits:
  - { label: "Designers", value: "Michael Dolejš, Karla Gondeková" }
  - { label: "Collaboration", value: "Karla Gondeková", href: "https://…" }
media:                           # first item full width, the rest in 2 columns; .mp4 = video
  - /assets/img/case-studies/biano/01.jpg
---
Text of the case study in Markdown.
```

Only `title` is required. Without text the overlay shows the tags; without `media` it shows the cover.
Put images in `public/assets/img/case-studies/<slug>/`. Deep link: `/projects#<slug>`.

## Project list: filter & hover preview

- Filter categories are derived from each row's `tags`/`meta` in `src/lib/categories.ts`
  (Identity, Websites & digital, Apps & UI, Print & other, School & internships).
  Override per project with `"categories": ["identity", "web"]` in `src/data/projects.json`.
  The choice is kept in the URL: `/projects?filter=identity`.
- Hover preview image = `"thumb"` in `src/data/projects.json` (files in `public/assets/img/thumbs/`,
  sources in `MICHAELDOLEJSCOM/WORK/THUMBNAILS`). Rows without `thumb` show no preview.
- Case study texts marked `<!-- DRAFT … -->` were written from public sources — review them.
