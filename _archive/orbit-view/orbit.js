// List / Orbit view switch (?view=orbit keeps the choice in the URL)
document.querySelectorAll("[data-view-switch]").forEach((bar) => {
  const buttons = [...bar.querySelectorAll("[data-view-value]")];
  const views = document.querySelectorAll("[data-view]");

  const apply = (value) => {
    if (!buttons.some((b) => b.dataset.viewValue === value)) value = "list";
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.viewValue === value)));
    views.forEach((view) => (view.hidden = view.dataset.view !== value));
    const url = new URL(location.href);
    if (value === "list") url.searchParams.delete("view");
    else url.searchParams.set("view", value);
    history.replaceState(history.state, "", url);
    document.dispatchEvent(new CustomEvent("viewchange", { detail: value }));
  };

  bar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-value]");
    if (button) apply(button.dataset.viewValue);
  });

  apply(new URLSearchParams(location.search).get("view") || "list");
});

// Orbit view: project thumbnails on tilted rings that slowly rotate; drag to spin
const orbit = document.querySelector("[data-orbit]");

if (orbit) {
  const caption = document.querySelector("[data-orbit-caption]");
  const hint = caption.innerHTML;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let items = [];
  let angle = 0;
  let velocity = 0;
  let drag = null;
  let moved = false;
  let hovered = null;
  let raf = 0;

  // Ring radii as a share of the stage (outermost last); outer rings hold more items
  const RX = [0.13, 0.235, 0.34, 0.45];
  const RY = [0.12, 0.215, 0.31, 0.41];

  // Spread the visible items over up to four rings, filling from the outside in
  const layout = () => {
    items = [...orbit.querySelectorAll(".orbit__item:not([hidden])")];
    const rings = Math.min(RX.length, Math.max(1, Math.ceil(items.length / 14)));
    const used = RX.slice(RX.length - rings).map((_, k) => RX.length - rings + k);
    const total = used.reduce((sum, r) => sum + RX[r], 0);
    let i = 0;
    used.forEach((ring, k) => {
      const count = k === used.length - 1 ? items.length - i : Math.round((items.length * RX[ring]) / total);
      for (let n = 0; n < count; n++, i++) {
        items[i].dataset.ring = ring;
        items[i].dataset.phase = (n / count) * Math.PI * 2 + ring * 0.7;
      }
    });
  };

  const render = () => {
    const { width, height } = orbit.getBoundingClientRect();
    items.forEach((item) => {
      const ring = Number(item.dataset.ring);
      const dir = ring % 2 ? -1 : 1;
      const a = Number(item.dataset.phase) + angle * dir * (1 - ring * 0.12);
      const depth = (Math.sin(a) + 1) / 2; // 0 = back, 1 = front
      const scale = 0.65 + depth * 0.4;
      item.style.transform = `translate(-50%, -50%) translate(${Math.cos(a) * width * RX[ring]}px, ${Math.sin(a) * height * RY[ring]}px) scale(${scale})`;
      item.style.zIndex = Math.round(depth * 100);
      item.style.opacity = hovered && hovered !== item ? 0.3 : 0.5 + depth * 0.5;
    });
  };

  const tick = () => {
    if (!drag) {
      velocity *= 0.95;
      const drift = still || hovered ? 0 : 0.0012;
      angle += drift + velocity;
    }
    render();
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    cancelAnimationFrame(raf);
    if (orbit.closest("[hidden]")) return;
    // Thumbnails load only once the orbit is shown, so the list view stays light
    orbit.querySelectorAll("img[data-src]").forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
    layout();
    raf = requestAnimationFrame(tick);
  };

  orbit.addEventListener("pointerdown", (event) => {
    drag = { x: event.clientX, angle, last: event.clientX };
    moved = false;
    orbit.setPointerCapture(event.pointerId);
  });
  orbit.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 4) moved = true;
    velocity = (event.clientX - drag.last) * 0.0004;
    drag.last = event.clientX;
    angle = drag.angle + dx * 0.004;
  });
  const end = () => (drag = null);
  orbit.addEventListener("pointerup", end);
  orbit.addEventListener("pointercancel", end);
  // A drag is not a click: don't open the project after spinning
  orbit.addEventListener("click", (event) => {
    if (moved) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  orbit.addEventListener("pointerover", (event) => {
    const item = event.target.closest(".orbit__item");
    if (!item || item === hovered) return;
    hovered = item;
    caption.textContent = "";
    caption.append(Object.assign(document.createElement("strong"), { textContent: item.dataset.title }), ` ${item.dataset.meta}`);
  });
  orbit.addEventListener("pointerleave", () => {
    hovered = null;
    caption.innerHTML = hint;
  });

  document.addEventListener("viewchange", start);
  document.addEventListener("filterchange", start);
  start();
}
