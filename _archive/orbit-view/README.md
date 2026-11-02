# Orbit view (removed 2026-10-28)

Alternative "Orbit" view for the Projects page in `astro/`: project thumbnails on four tilted
rings that slowly rotate, drag to spin, hover shows title, click opens the project.
Removed because it wasn't useful; kept here in case we want it back.

To restore in `astro/`:
1. `projects.astro.html` → replace the `.filter` + `.project-list` block in `src/pages/projects.astro`
   (needs `categoriesFor` imported, which the page already does).
2. `orbit.js` → paste into `src/scripts/main.js` before "Project list hover preview".
   Also change the filter script to handle several lists and fire an event:
   - `const list = document.querySelector(...)` → `const lists = document.querySelectorAll("[data-filter-list]")`
   - loop over `lists`, then `document.dispatchEvent(new CustomEvent("filterchange"));`
3. `orbit.css` → paste into `src/styles/main.css`.

Known issue: 70 thumbnails (~11 MB incl. large GIFs) load at once when Orbit opens.
