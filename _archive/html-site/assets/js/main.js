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
