# Jak spravovat web (Pages CMS + Cloudflare)

Princip: obsah = soubory v GitHub repu `michaeldolejs/web-2026`. Každá změna na GitHubu → Cloudflare sám postaví a nasadí web (~1 min). Pages CMS je jen hezký editor nad těmi soubory.

## Jednorázové nastavení (asi 10 minut)

### 1. Push na GitHub
GitHub Desktop → repo `web-2026` → **Push origin**. (Commit „Add Astro site and Pages CMS config“ je připravený.)

### 2. Cloudflare Pages napojené na GitHub
Starý projekt `website-2026` byl nahraný ručně a na GitHub přepnout nejde → zakládáme nový.

1. dash.cloudflare.com (osobní účet michael.dolejs@me.com) → **Workers & Pages** → **Create** → záložka **Pages** → **Import an existing Git repository**.
2. Připojit GitHub, vybrat `michaeldolejs/web-2026`.
3. Nastavení buildu:
   - Production branch: `main`
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - **Root directory (advanced): `astro`**
4. **Save and Deploy**. Po buildu dostaneš adresu `*.pages.dev` → zkontrolovat.
5. Až bude vše OK: starý projekt `website-2026` smazat; při spuštění na michaeldolejs.com přidat doménu v **Custom domains** a smazat `astro/public/_headers` (noindex).

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

**Save** = commit na GitHub = za ~1 min na webu (průběh v Cloudflare → Deployments).

### Tipy
- Obrázky na web zmenšit předem (max ~2400 px, JPG/WebP do ~500 kB). Videa ideálně do ~20 MB (limit Cloudflare je 25 MB na soubor).
- Obrázky case study patří do `img/case-studies/<slug>/`, videa do `video/case-studies/`.
- Featured a galerie potřebují `width`/`height` v px (kvůli rozložení stránky) — stačí z Info ve Finderu.
- Kategorie filtru se odhadují z tagů; pole „Filter categories“ jen pokud chceš vynutit jinou.
- Když build selže, web zůstane na poslední funkční verzi — chyba je v Cloudflare → Deployments → log.

## Úpravy bez CMS
Klidně dál edituj soubory v `astro/` přímo v Dropboxu → GitHub Desktop → Commit + Push. Deploy proběhne sám.
Pozor: před úpravami v Dropboxu dej **Pull**, ať máš i změny udělané v CMS.
