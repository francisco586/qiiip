/* HONE — scrollytelling engine */
(function () {
  "use strict";

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky nav + progress bar ---------- */
  var nav = document.getElementById("nav");
  var progressBar = document.getElementById("progressBar");
  function pageProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    return max > 0 ? clamp(h.scrollTop / max, 0, 1) : 0;
  }
  function onScrollUI() {
    if (window.scrollY > 60) nav.classList.add("scrolled"); else nav.classList.remove("scrolled");
    if (progressBar) progressBar.style.transform = "scaleX(" + pageProgress() + ")";
  }
  window.addEventListener("scroll", onScrollUI, { passive: true });
  onScrollUI();

  /* ---------- scrollytelling hero: scrub video + beats ---------- */
  var scrolly = document.querySelector(".scrolly");
  var video = document.getElementById("scrollyVideo");
  var beats = [].slice.call(document.querySelectorAll(".beat"));
  var hint = document.getElementById("scrollHint");

  // when each beat is visible, expressed as [start, end] of hero progress (0..1)
  var ranges = [[0.00, 0.26], [0.30, 0.50], [0.54, 0.72], [0.76, 1.00]];

  var duration = 0;
  var targetTime = 0;
  var canScrub = !reduce;
  var seeking = false;
  var pending = null;

  function heroProgress() {
    if (!scrolly) return 0;
    var rect = scrolly.getBoundingClientRect();
    var total = scrolly.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
  }

  function paintBeats(p) {
    for (var i = 0; i < beats.length; i++) {
      var r = ranges[i] || [1, 1];
      var o = 0, ty = 44;
      if (p >= r[0] && p <= r[1]) {
        var span = (r[1] - r[0]) || 1;
        var local = (p - r[0]) / span;             // 0..1 within this beat
        var fade = 0.22;                            // fade portion
        o = clamp(Math.min(local / fade, (1 - local) / fade, 1), 0, 1);
        ty = (1 - o) * 44;
      }
      beats[i].style.opacity = o;
      beats[i].style.transform = "translateY(-46%) translateY(" + ty + "px)";
      beats[i].classList.toggle("is-on", o > 0.5);
    }
  }

  // Seek one frame at a time, always chasing the latest target (no thrash).
  function requestSeek(t) {
    if (!canScrub || !duration) return;
    if (seeking) { pending = t; return; }
    if (Math.abs(t - currentVideoTime()) < 0.03) return;
    seeking = true;
    try { video.currentTime = t; } catch (e) { seeking = false; }
  }
  function currentVideoTime() { return video ? video.currentTime : 0; }

  function onScrollHero() {
    var p = heroProgress();
    if (canScrub && duration) { targetTime = p * (duration - 0.06); requestSeek(targetTime); }
    paintBeats(p);
    if (hint) hint.style.opacity = p > 0.04 ? "0" : "1";
  }

  if (video) {
    // Priming: a muted play()->pause() unlocks smooth seeking across browsers.
    function primeAndPause() {
      video.muted = true;
      var pr = video.play();
      if (pr && pr.then) pr.then(function () { try { video.pause(); } catch (e) {} })
                           .catch(function () { try { video.pause(); } catch (e) {} });
      else { try { video.pause(); } catch (e) {} }
    }

    video.addEventListener("loadedmetadata", function () {
      duration = video.duration || 0;
      primeAndPause();
      onScrollHero();
    });
    if (video.readyState >= 1) { duration = video.duration || 0; primeAndPause(); onScrollHero(); }

    // When a seek finishes, chase the most recent target if it moved on.
    video.addEventListener("seeked", function () {
      seeking = false;
      if (pending != null) { var t = pending; pending = null; requestSeek(t); }
    });

    // Re-prime on first user interaction (covers stricter mobile policies)
    function reprime() { primeAndPause(); }
    window.addEventListener("touchstart", reprime, { once: true, passive: true });
    window.addEventListener("click", reprime, { once: true });
  } else {
    canScrub = false;
  }

  if (scrolly) {
    window.addEventListener("scroll", onScrollHero, { passive: true });
    window.addEventListener("resize", onScrollHero);
    onScrollHero();
  }

  /* ---------- collection: horizontal pin scroll ---------- */
  var hscroll = document.querySelector(".hscroll");
  var htrack = document.getElementById("htrack");
  function onScrollH() {
    if (!hscroll || !htrack || reduce) return;
    var rect = hscroll.getBoundingClientRect();
    var total = hscroll.offsetHeight - window.innerHeight;
    var p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    var dist = htrack.scrollWidth - window.innerWidth;
    if (dist > 0) htrack.style.transform = "translateX(" + -(p * dist) + "px)";
  }
  if (hscroll && !reduce) {
    window.addEventListener("scroll", onScrollH, { passive: true });
    window.addEventListener("resize", onScrollH);
    onScrollH();
  }

  /* ---------- reveal-on-scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.18 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- nav burger ---------- */
  var burger = document.getElementById("burger");
  if (burger) burger.addEventListener("click", function () {
    document.getElementById("collection").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- add-to-cart micro feedback ---------- */
  document.querySelectorAll(".card__add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var original = btn.textContent;
      btn.textContent = "Added ✓"; btn.style.background = "#9A5B12"; btn.style.color = "#fff";
      setTimeout(function () { btn.textContent = original; btn.style.background = ""; btn.style.color = ""; }, 1400);
    });
  });
})();
