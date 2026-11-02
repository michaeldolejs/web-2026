# Jak spravovat web (Pages CMS + Cloudflare)

Princip: obsah = soubory v GitHub repu `michaeldolejs/web-2026`. Každá změna na GitHubu → Cloudflare sám postaví a nasadí web (~1 min). Pages CMS je jen hezký editor nad těmi soubory.

## Jednorázové nastavení (asi 10 minut)

### 1. Push na GitHub
GitHub Desktop → repo `web-2026` → **Push origin**. (Commit „Add Astro site and Pages CMS config“ je připravený.)

### 2. Cloudflare Worker napojený na GitHub (hotovo)
Web běží jako Cloudflare **Worker** `web-2026` (osobní účet michael.dolejs@me.com) → https://web-2026.michael-dolejs.workers.dev

- Nastavení: repo `michaeldolejs/web-2026`, Path `astro`, build `npm run build`, deploy `npx wrangler deploy`.
- Konfigurace Workeru je v `astro/wrangler.jsonc` (statický web ze složky `dist`).
- Při spuštění na michaeldolejs.com: Worker → **Domains** → přidat doménu a smazat `astro/public/_headers` (noindex).

### 3. Pages CMS
1. Otevři **app.pagescms.org** → **Sign in with GitHub**.
2. Nainstaluj Pages CMS GitHub app jen pro repo `web-2026`.
3. Vyber repo `web-2026`, branch `main`. Vlevo uvidíš sekce.

## Běžná práce

| Chci… | Kde v CMS |
|---|---|
| přidat projekt do seznamu | **Projects (list)** → Add item (nahoru = výš na webu) |
| hover náhled u projektu | v projektu pole **Hover thumbnail** |
| case study (popup) | **Case studies** → Add entry; slug (název souboru) vznikne z titulku |
| projekt do slideru nahoře | **Projects (featured images)** — `Case study slug` = popup |
| archiv / unselected | **Unselected (archive)** |
| CV, fotky na About | **About — CV**, **About — gallery** |
| e-mail, menu, sociální sítě | **Site** |

**Save** = commit na GitHub = za ~1 min na webu (průběh v Cloudflare → Worker web-2026 → Deployments).

### Tipy
- Obrázky na web zmenšit předem (max ~2400 px, JPG/WebP do ~500 kB). Videa ideálně do ~20 MB (limit Cloudflare je 25 MB na soubor).
- Obrázky case study patří do `img/case-studies/<slug>/`, videa do `video/case-studies/`.
- Featured a galerie potřebují `width`/`height` v px (kvůli rozložení stránky) — stačí z Info ve Finderu.
- Kategorie filtru se odhadují z tagů; pole „Filter categories“ jen pokud chceš vynutit jinou.
- Když build selže, web zůstane na poslední funkční verzi — chyba je v Cloudflare → Deployments → log.

## Úpravy bez CMS
Klidně dál edituj soubory v `astro/` přímo v Dropboxu → GitHub Desktop → Commit + Push. Deploy proběhne sám.
Pozor: před úpravami v Dropboxu dej **Pull**, ať máš i změny udělané v CMS.
