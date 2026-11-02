// Mobile menu toggle
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav__toggle");

if (nav && toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "Close" : "Menu";
  });
}

// Play videos only while visible
const videos = document.querySelectorAll("video[data-autoplay]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.2 });

  videos.forEach((video) => observer.observe(video));
}

// Text roll: duplicate label for hover animation
document.querySelectorAll("[data-roll]").forEach((el) => {
  const text = el.textContent.trim();
  el.classList.add("roll");
  el.innerHTML = `<span>${text}</span><span aria-hidden="true">${text}</span>`;
});

// Featured slider: arrows + autoplay (paused on hover/touch)
document.querySelectorAll("[data-slider]").forEach((slider) => {
  const track = slider.querySelector(".slider__track");
  const step = () => track.firstElementChild.getBoundingClientRect().width + 16;
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

  const go = (dir) => {
    if (dir > 0 && atEnd()) track.scrollTo({ left: 0, behavior: "smooth" });
    else track.scrollBy({ left: dir * step(), behavior: "smooth" });
  };

  slider.querySelector(".slider__arrow--prev")?.addEventListener("click", () => go(-1));
  slider.querySelector(".slider__arrow--next")?.addEventListener("click", () => go(1));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let paused = false;
  slider.addEventListener("pointerenter", () => (paused = true));
  slider.addEventListener("pointerleave", () => (paused = false));
  track.addEventListener("touchstart", () => (paused = true), { passive: true });
  setInterval(() => !paused && !document.hidden && go(1), 2500);
});

// Case study overlays: <dialog id="slug">, opened from [data-case-open] and #slug in the URL
const caseDialogs = new Map(
  [...document.querySelectorAll("dialog.case")].map((dialog) => [dialog.id, dialog]),
);

if (caseDialogs.size) {
  const openCase = (id, { push = true } = {}) => {
    const dialog = caseDialogs.get(id);
    if (!dialog) return;
    caseDialogs.forEach((other) => other !== dialog && other.open && other.close());
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelectorAll("video[data-case-video]").forEach((video) => video.play().catch(() => {}));
    if (push && location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
  };

  const clearHash = () => {
    if (location.hash) history.pushState(null, "", location.pathname + location.search);
  };

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-case-open]");
    if (!opener) return;
    event.preventDefault();
    openCase(opener.dataset.caseOpen);
  });

  caseDialogs.forEach((dialog) => {
    dialog.querySelector("[data-case-close]")?.addEventListener("click", () => dialog.close());
    // Click on the backdrop area outside the content closes too
    dialog.addEventListener("click", (event) => event.target === dialog && dialog.close());
    dialog.addEventListener("close", () => {
      dialog.querySelectorAll("video").forEach((video) => video.pause());
      if (location.hash === `#${dialog.id}`) clearHash();
    });
  });

  const syncWithHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (caseDialogs.has(id)) openCase(id, { push: false });
    else caseDialogs.forEach((dialog) => dialog.open && dialog.close());
  };

  window.addEventListener("popstate", syncWithHash);
  syncWithHash();
}

// Project list filter (?filter=identity keeps the choice in the URL)
document.querySelectorAll("[data-filter]").forEach((bar) => {
  const list = document.querySelector("[data-filter-list]");
  const buttons = [...bar.querySelectorAll("[data-filter-value]")];

  const apply = (value) => {
    if (!buttons.some((b) => b.dataset.filterValue === value)) value = "all";
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filterValue === value)));
    list.querySelectorAll("li[data-cats]").forEach((li) => {
      li.hidden = value !== "all" && !li.dataset.cats.split(" ").includes(value);
    });
    const url = new URL(location.href);
    if (value === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", value);
    history.replaceState(history.state, "", url);
  };

  bar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-value]");
    if (button) apply(button.dataset.filterValue);
  });

  apply(new URLSearchParams(location.search).get("filter") || "all");
});

// Project list hover preview: the thumbnail follows the cursor (mouse only)
const preview = document.querySelector("[data-project-preview]");

if (preview && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let frame = 0;
  const move = (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      preview.style.transform = `translate(${event.clientX + 24}px, ${event.clientY - preview.offsetHeight / 2}px)`;
    });
  };

  document.querySelectorAll(".project[data-thumb]").forEach((row) => {
    row.addEventListener("mouseenter", (event) => {
      if (preview.getAttribute("src") !== row.dataset.thumb) preview.src = row.dataset.thumb;
      move(event);
      preview.classList.add("is-visible");
    });
    row.addEventListener("mousemove", move);
    row.addEventListener("mouseleave", () => preview.classList.remove("is-visible"));
  });
}

// Custom cursor: a green dot following the mouse (as on the Framer site)
const cursor = document.querySelector("[data-cursor]");

if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.documentElement.classList.add("has-cursor");
  let raf = 0;
  window.addEventListener("pointermove", (event) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      cursor.classList.toggle("is-visible", !document.querySelector("dialog[open]"));
    });
  });
  document.documentElement.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
}

// Stickers on the grid can be dragged anywhere and stay where dropped (as on Framer, from 810px up)
const canDrag = matchMedia("(min-width: 810px)");
let dragLayer = 1;

document.querySelectorAll("[data-drag]").forEach((el) => {
  let x = 0;
  let y = 0;

  el.addEventListener("pointerdown", (event) => {
    if (!canDrag.matches || event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX - x;
    const startY = event.clientY - y;
    el.setPointerCapture(event.pointerId);
    el.style.zIndex = ++dragLayer;

    const move = (moveEvent) => {
      x = moveEvent.clientX - startX;
      y = moveEvent.clientY - startY;
      el.style.translate = `${x}px ${y}px`;
    };
    const stop = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", stop);
      el.removeEventListener("pointercancel", stop);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointercancel", stop);
  });

  // Back to the layout position when the mobile layout takes over
  canDrag.addEventListener("change", () => {
    x = 0;
    y = 0;
    el.style.translate = "";
  });
});
