/* HONE — interactions */
(function () {
  "use strict";

  // Sticky nav background on scroll
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal-on-scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Mobile burger -> smooth scroll to collection (lightweight)
  const burger = document.getElementById("burger");
  if (burger) {
    burger.addEventListener("click", () => {
      document.getElementById("collection")
        .scrollIntoView({ behavior: "smooth" });
    });
  }

  // Add-to-cart micro feedback
  document.querySelectorAll(".card__add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const original = btn.textContent;
      btn.textContent = "Added ✓";
      btn.style.background = "#9A5B12";
      btn.style.color = "#fff";
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = "";
        btn.style.color = "";
      }, 1400);
    });
  });

  // Gentle parallax on hero clouds
  const clouds = document.querySelectorAll(".cloud");
  if (clouds.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        clouds.forEach((c, i) => {
          c.style.transform = `translateY(${y * (0.04 + i * 0.02)}px)`;
        });
      },
      { passive: true }
    );
  }
})();
