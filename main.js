/* ==========================================================================
   GURU HR Landing — behavior (vanilla JS, no dependencies)
   - Animated network graph in the hero (canvas), repelled by the cursor
   - Scroll-reveal fade/slide via IntersectionObserver
   - Process connecting line draw-in
   - Hero progress counter (0 → 72%)
   - FAQ accordion with accessible aria + smooth height
   - Sticky header shown on scroll
   All motion honors prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. Network graph -------------------------------------------------- */
  function startGraph(canvas) {
    if (!canvas || reduceMotion) return;
    var parent = canvas.parentElement;
    var ctx = canvas.getContext("2d");
    var w, h, dpr, nodes, maxDist;
    var mouse = { x: -9999, y: -9999 };
    var repelRadius = 100;
    var N = 34;
    var raf;

    function size() {
      var rect = parent.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      w = rect.width; h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxDist = Math.min(w, h) * 0.22;
    }

    function build() {
      nodes = [];
      for (var i = 0; i < N; i++) {
        var accent = Math.random() < 0.16;
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: accent ? 3.2 : 1.8,
          accent: accent
        });
      }
    }

    parent.addEventListener("mousemove", function (e) {
      var r = parent.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    parent.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });

    function tick() {
      ctx.clearRect(0, 0, w, h);
      var i, j, n;
      for (i = 0; i < N; i++) {
        n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        var dx = n.x - mouse.x, dy = n.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < repelRadius && d > 0.01) {
          var force = (repelRadius - d) / repelRadius * 1.4;
          n.x += (dx / d) * force;
          n.y += (dy / d) * force;
        }
      }
      for (i = 0; i < N; i++) {
        for (j = i + 1; j < N; j++) {
          var a = nodes[i], b = nodes[j];
          var ddx = a.x - b.x, ddy = a.y - b.y;
          var dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < maxDist) {
            var alpha = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = (a.accent || b.accent)
              ? "rgba(230,0,103," + alpha + ")"
              : "rgba(148,163,184," + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (i = 0; i < N; i++) {
        n = nodes[i];
        ctx.beginPath();
        ctx.fillStyle = n.accent ? "#e60067" : "rgba(203,213,225,0.7)";
        ctx.shadowBlur = n.accent ? 8 : 0;
        ctx.shadowColor = "#e60067";
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    }

    size();
    build();
    tick();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { size(); build(); }, 200);
    });
  }

  /* ---- 2. Scroll reveal -------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- 3. Process line draw ---------------------------------------------- */
  function initLine() {
    var line = document.getElementById("processLine");
    if (!line) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      line.style.transform = "scaleX(1)";
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.transform = "scaleX(1)";
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    io.observe(line);
  }

  /* ---- 4. Progress counter ----------------------------------------------- */
  function initProgress() {
    var counter = document.getElementById("progressValue");
    var bar = document.getElementById("progressBar");
    if (!counter || !bar) return;
    var target = 72;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counter.textContent = target + "%";
      bar.style.width = target + "%";
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        bar.style.width = target + "%";
        var cur = 0;
        (function step() {
          cur += Math.ceil(target / 24);
          if (cur >= target) { counter.textContent = target + "%"; return; }
          counter.textContent = cur + "%";
          requestAnimationFrame(step);
        })();
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    io.observe(counter);
  }

  /* ---- 5. FAQ accordion -------------------------------------------------- */
  function initFaq() {
    var buttons = document.querySelectorAll(".faq__q");
    buttons.forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      // sync initial visual state with the markup's aria-expanded
      if (btn.getAttribute("aria-expanded") === "true" && panel) {
        panel.classList.add("is-open");
      }
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.classList.toggle("is-open", !open);
      });
    });
  }

  /* ---- 6. Sticky header -------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-visible", window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- 7. Contact form --------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var status = document.getElementById("contactStatus");
    if (!form || !status) return;

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.classList.remove("is-success", "is-error");
      if (kind) status.classList.add(kind);
    }

    // clear the invalid highlight as soon as the user edits a field
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field) field.classList.remove("is-invalid");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot — bots tick this hidden box; humans never see it
      // (use form.elements: HTMLFormElement.name is a built-in prop, not the control)
      var els = form.elements;
      if (els.botcheck && els.botcheck.checked) return;

      // validate
      var nameEl = els.namedItem("name");
      var emailEl = els.namedItem("email");
      var messageEl = els.namedItem("message");
      var checks = [
        { el: nameEl, ok: nameEl.value.trim().length > 0 },
        { el: emailEl, ok: emailRe.test(emailEl.value.trim()) },
        { el: messageEl, ok: messageEl.value.trim().length > 0 }
      ];
      var firstBad = null;
      checks.forEach(function (c) {
        var field = c.el.closest(".field");
        if (!c.ok) {
          if (field) field.classList.add("is-invalid");
          if (!firstBad) firstBad = c.el;
        }
      });
      if (firstBad) {
        setStatus("Revisa los campos marcados antes de enviar.", "is-error");
        firstBad.focus();
        return;
      }

      // submit to Web3Forms
      var btn = form.querySelector(".contact-form__submit");
      var originalText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
      setStatus("Enviando…", null);

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) { return res.json().catch(function () { return {}; }); })
        .then(function (data) {
          if (data && data.success) {
            setStatus("¡Gracias! Te contactaremos en menos de 24 horas.", "is-success");
            form.reset();
          } else {
            setStatus("No se pudo enviar. Intenta de nuevo en unos minutos.", "is-error");
          }
        })
        .catch(function () {
          setStatus("Problema de conexión. Revisa tu red e intenta de nuevo.", "is-error");
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
        });
    });
  }

  /* ---- init -------------------------------------------------------------- */
  function init() {
    startGraph(document.getElementById("heroCanvas"));
    initReveal();
    initLine();
    initProgress();
    initFaq();
    initHeader();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
