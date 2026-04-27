/* ════════════════════════════════════════════════════════════
   IQBAL HOSSAIN PORTFOLIO — MAIN JAVASCRIPT
   ════════════════════════════════════════════════════════════ */

'use strict';

/* Stop browsers from restoring an old scroll position on reload. */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

/* ═══ UTILITY ═══ */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ═══════════════════════════════════════
   1. PRELOADER
═══════════════════════════════════════ */
function initPreloader() {
  const preloader = qs('#preloader');
  const pct       = qs('#loadPercent');
  if (!preloader) return;

  document.body.classList.add('loading');

  let count = 0;
  const interval = setInterval(() => {
    count += Math.random() * 12 + 3;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);
      setTimeout(dismissPreloader, 400);
    }
    if (pct) pct.textContent = Math.floor(count);
  }, 60);

  function dismissPreloader() {
    preloader.classList.add('exit');
    document.body.classList.remove('loading');
    preloader.addEventListener('animationend', () => {
      preloader.remove();
      initAllModules();
    }, { once: true });
  }
}

/* ═══════════════════════════════════════
   2. HERO PARTICLE CANVAS (WebGL-style 3D)
═══════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = qs('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: 0, y: 0 }, frame = 0;

  const PALETTE = ['#00d4ff', '#8b5cf6', '#f59e0b', '#10b981', '#ff3d5a'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    const count = Math.floor((W * H) / 8000);
    particles = Array.from({ length: count }, () => makeParticle());
  }

  function makeParticle(fromBottom = false) {
    return {
      x:     Math.random() * W,
      y:     fromBottom ? H + 10 : Math.random() * H,
      z:     Math.random() * 0.8 + 0.2,       // depth 0.2–1
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    -(Math.random() * 0.4 + 0.1),
      r:     Math.random() * 2.5 + 0.5,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      alpha: Math.random() * 0.6 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  /* Lines between near particles */
  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const alpha = (1 - d / maxDist) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* Radial glow rings */
  function drawOrbs() {
    const orbs = [
      { x: W * 0.8, y: H * 0.2, r: 220, color: '#8b5cf6' },
      { x: W * 0.1, y: H * 0.7, r: 160, color: '#00d4ff' },
      { x: W * 0.5, y: H * 0.9, r: 130, color: '#f59e0b' },
    ];
    orbs.forEach(o => {
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grad.addColorStop(0, o.color + '18');
      grad.addColorStop(1, o.color + '00');
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });
  }

  function tick() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    /* Dark gradient base */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#04030a');
    bg.addColorStop(1, '#08061a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawOrbs();
    drawConnections();

    /* Mouse influence */
    const mx = mouse.x, my = mouse.y;

    particles.forEach(p => {
      p.pulse += 0.02;
      p.x  += p.vx + (mx - W / 2) * 0.00008 * p.z;
      p.y  += p.vy;

      /* Wrap */
      if (p.y < -10) { Object.assign(p, makeParticle(true)); p.y = H + 10; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      const size  = p.r * p.z * (1 + 0.15 * Math.sin(p.pulse));
      const alpha = p.alpha * p.z;

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  resize();
  tick();
}

/* ═══════════════════════════════════════
   3. CUSTOM CURSOR
═══════════════════════════════════════ */
function initCursor() {
  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring || window.innerWidth < 768 || window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function animateCursor() {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* Hover state */
  const hoverEls = 'a, button, .magnetic, .service-card, .portfolio-item, .filter-btn, .testi-nav-btn';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ═══════════════════════════════════════
   4. MAGNETIC BUTTONS
═══════════════════════════════════════ */
function initMagnetic() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  qsa('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ═══════════════════════════════════════
   5. NAVBAR SCROLL EFFECT
═══════════════════════════════════════ */
function initNavbar() {
  const nav = qs('#navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Burger */
  const burger = qs('#navBurger');
  const links  = qs('#navLinks');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
    /* Close on link click */
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ═══════════════════════════════════════
   6. SCROLL REVEAL
═══════════════════════════════════════ */
function initScrollReveal() {
  const els = qsa('.reveal-up, .reveal-left, .reveal-right, .reveal-fade');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════
   7. SKILL BARS
═══════════════════════════════════════ */
function initSkillBars() {
  const fills = qsa('.skill-fill');
  if (!fills.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.dataset.width || '0';
        e.target.style.width = w + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(f => io.observe(f));
}

/* ═══════════════════════════════════════
   8. STAT COUNTER
═══════════════════════════════════════ */
function initCounters() {
  const nums = qsa('.stat-num');
  if (!nums.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const start  = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}

/* ═══════════════════════════════════════
   9. HERO ROLE ROTATOR
═══════════════════════════════════════ */
function initRoleRotator() {
  const roles = qsa('.hero__role');
  if (!roles.length) return;

  let idx = 0;
  setInterval(() => {
    roles[idx].classList.remove('active');
    idx = (idx + 1) % roles.length;
    roles[idx].classList.add('active');
  }, 2400);
}

/* ═══════════════════════════════════════
   10. PORTFOLIO FILTER
═══════════════════════════════════════ */
function initPortfolioFilter() {
  const btns  = qsa('.filter-btn');
  const items = qsa('.portfolio-item');
  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !show);
        item.style.opacity = '0';
        if (show) {
          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.4s ease';
            item.style.opacity    = '1';
          });
        }
      });
    });
  });
}

/* ═══════════════════════════════════════
   11. TESTIMONIALS CAROUSEL
═══════════════════════════════════════ */
function initTestimonials() {
  const track = qs('#testiTrack');
  const prev  = qs('#testiPrev');
  const next  = qs('#testiNext');
  const dotsW = qs('#testiDots');
  if (!track) return;

  const cards   = qsa('.testi-card', track);
  const section = track.closest('.testimonials') || track;
  if (!cards.length) return;

  let current   = 0;
  let autoplay  = null;
  let isVisible = false;
  let isHovered = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Build dots */
  if (dotsW) {
    dotsW.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(i, { smooth: true, preservePageScroll: true });
        resetAuto();
      });
      dotsW.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsW) return;
    qsa('.testi-dot', dotsW).forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function preservePageScroll(callback) {
    const x = window.scrollX;
    const y = window.scrollY;
    callback();

    /* Some browsers try to bring a horizontal scroll-snap carousel into view.
       Restore the page position so autoplay never pulls the user down to this section. */
    requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - y) > 2 || Math.abs(window.scrollX - x) > 2) {
        window.scrollTo(x, y);
      }
    });
  }

  function goTo(idx, options = {}) {
    current = (idx + cards.length) % cards.length;
    const card = cards[current];
    const left = Math.max(0, card.offsetLeft - track.offsetLeft);
    const behavior = options.smooth && !reduceMotion ? 'smooth' : 'auto';

    const moveTrackOnly = () => {
      track.scrollTop = 0;
      if (typeof track.scrollTo === 'function') {
        track.scrollTo({ left, top: 0, behavior });
      } else {
        track.scrollLeft = left;
      }
    };

    options.preservePageScroll ? preservePageScroll(moveTrackOnly) : moveTrackOnly();
    updateDots();
  }

  function stopAuto() {
    if (!autoplay) return;
    clearInterval(autoplay);
    autoplay = null;
  }

  function startAuto() {
    /* Autoplay intentionally disabled: automatic carousel scrolling was causing browsers
       to pull the page down to the testimonials section on some devices. */
    return;
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

  prev && prev.addEventListener('click', () => {
    goTo(current - 1, { smooth: true, preservePageScroll: true });
    resetAuto();
  });

  next && next.addEventListener('click', () => {
    goTo(current + 1, { smooth: true, preservePageScroll: true });
    resetAuto();
  });

  /* Start autoplay only when the testimonial section is actually visible.
     This removes the page-jump-to-What Clients Say problem. */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      isVisible ? startAuto() : stopAuto();
    }, { threshold: [0, 0.15, 0.35] });
    io.observe(section);
  } else {
    isVisible = true;
    startAuto();
  }

  track.addEventListener('mouseenter', () => { isHovered = true; stopAuto(); });
  track.addEventListener('mouseleave', () => { isHovered = false; startAuto(); });
  track.addEventListener('focusin', stopAuto);
  track.addEventListener('focusout', startAuto);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAuto() : startAuto();
  });

  /* Touch/swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      dx > 0
        ? goTo(current - 1, { smooth: true, preservePageScroll: true })
        : goTo(current + 1, { smooth: true, preservePageScroll: true });
      resetAuto();
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════
   12. CONTACT FORM (mailto fallback)
═══════════════════════════════════════ */
function initContactForm() {
  const form    = qs('#contactForm');
  const success = qs('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('#cf-name').value.trim();
    const email   = form.querySelector('#cf-email').value.trim();
    const service = form.querySelector('#cf-service').value;
    const msg     = form.querySelector('#cf-message').value.trim();

    if (!name || !email || !service || !msg) {
      shakeForm(form); return;
    }

    /* mailto fallback */
    const body    = `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${msg}`;
    const mailto  = `mailto:hello@theiqbal.com?subject=Project Inquiry — ${service}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    /* Show success */
    setTimeout(() => {
      form.style.display = 'none';
      success.hidden = false;
    }, 600);
  });

  function shakeForm(el) {
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => el.style.animation = '', { once: true });
  }
}

/* ═══════════════════════════════════════
   13. FOOTER YEAR
═══════════════════════════════════════ */
function initFooterYear() {
  const el = qs('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════
   14. 3D CARD TILT (service cards)
═══════════════════════════════════════ */
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const selector = '.service-card, .portfolio-item__inner, .process-step, .testi-card, .contact-form, .stat-card, .contact-channel, .about__image-wrap';
  const cards = qsa(selector);
  if (!cards.length) return;

  const supportsHover = !window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!supportsHover) return;

  cards.forEach(card => {
    const strength = card.classList.contains('contact-channel') ? 5 : card.classList.contains('portfolio-item__inner') ? 10 : 7;
    const lift = card.classList.contains('portfolio-item__inner') ? 12 : 6;
    let raf = null;
    let state = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };

    const apply = () => {
      raf = null;
      card.style.transform = `perspective(1200px) translate3d(${state.tx}px, ${state.ty}px, 0) rotateX(${state.rx}deg) rotateY(${state.ry}deg) scale(${state.scale})`;
    };
    const requestApply = () => { if (!raf) raf = requestAnimationFrame(apply); };

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      state.ry = (px - 0.5) * strength;
      state.rx = (0.5 - py) * strength;
      state.tx = (px - 0.5) * 8;
      state.ty = (py - 0.5) * 4 - lift;
      state.scale = 1.012;
      requestApply();
    });

    card.addEventListener('mouseleave', () => {
      state = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };
      requestApply();
    });
  });
}

/* ═══════════════════════════════════════
   15. CINEMATIC CANVAS BACKGROUND
═══════════════════════════════════════ */
function initCinematicCanvas() {
  const canvas = qs('#cinematicCanvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let W = 0, H = 0, DPR = 1;
  let frame = 0;
  let scrollTarget = window.scrollY || 0;
  let scrollY = scrollTarget;
  let pointerTarget = { x: 0, y: 0 };
  let pointer = { x: 0, y: 0 };
  let stars = [];
  let streams = [];
  const palette = ['#00d4ff', '#8b5cf6', '#f59e0b', '#10b981', '#ff3d5a'];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildScene();
  }

  function buildScene() {
    const starCount = Math.max(80, Math.min(190, Math.floor((W * H) / 10500)));
    stars = Array.from({ length: starCount }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 0.9 + 0.1,
      r: Math.random() * 1.7 + 0.25,
      hue: palette[i % palette.length],
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18
    }));

    streams = Array.from({ length: 9 }, (_, i) => ({
      x: (i / 8) * W + (Math.random() - 0.5) * 80,
      y: Math.random() * H,
      z: Math.random() * 0.6 + 0.25,
      speed: Math.random() * 0.9 + 0.35,
      color: i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#8b5cf6' : '#10b981',
      length: Math.random() * 180 + 120
    }));
  }

  function drawDepthGrid() {
    const horizon = H * 0.62 + Math.sin(frame * 0.01) * 10;
    const offset = (scrollY * 0.15 + frame * 0.7) % 70;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = 'rgba(0,212,255,0.55)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const x = W * (0.5 + (t - 0.5) * 1.7);
      ctx.beginPath();
      ctx.moveTo(W * 0.5 + pointer.x * 24, horizon);
      ctx.lineTo(x + pointer.x * 40, H + 80);
      ctx.stroke();
    }

    for (let y = horizon + offset; y < H + 80; y += 70) {
      const depth = (y - horizon) / (H - horizon + 1);
      ctx.globalAlpha = 0.05 + depth * 0.16;
      ctx.beginPath();
      ctx.moveTo(-80, y);
      ctx.lineTo(W + 80, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawExpertiseNodes() {
    const zones = [
      { x: W * 0.18, y: H * 0.28, color: '#8b5cf6', sides: 3 },
      { x: W * 0.78, y: H * 0.34, color: '#00d4ff', sides: 5 },
      { x: W * 0.58, y: H * 0.72, color: '#f59e0b', sides: 6 }
    ];
    zones.forEach((z, idx) => {
      const pulse = 0.5 + Math.sin(frame * 0.018 + idx) * 0.5;
      const px = z.x + pointer.x * (22 + idx * 10) - scrollY * 0.01 * (idx - 1);
      const py = z.y + pointer.y * (18 + idx * 8) + Math.sin(frame * 0.01 + idx) * 8;
      ctx.save();
      ctx.globalAlpha = 0.16 + pulse * 0.08;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 160 + pulse * 40);
      g.addColorStop(0, z.color + '55');
      g.addColorStop(1, z.color + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 190 + pulse * 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < z.sides; i++) {
        const a = (Math.PI * 2 * i) / z.sides + frame * 0.004 * (idx + 1);
        const rr = 40 + pulse * 10;
        const xx = px + Math.cos(a) * rr;
        const yy = py + Math.sin(a) * rr;
        i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawStreams() {
    ctx.save();
    streams.forEach(s => {
      s.y -= s.speed + scrollY * 0.0006 * s.z;
      s.x += Math.sin(frame * 0.006 + s.z * 7) * 0.25;
      if (s.y < -s.length) {
        s.y = H + Math.random() * 220;
        s.x = Math.random() * W;
      }
      const x = s.x + pointer.x * 38 * s.z;
      const y = s.y + pointer.y * 24 * s.z;
      const grad = ctx.createLinearGradient(x, y, x, y + s.length);
      grad.addColorStop(0, s.color + '00');
      grad.addColorStop(0.42, s.color + '55');
      grad.addColorStop(1, s.color + '00');
      ctx.globalAlpha = 0.25 * s.z;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.1 + s.z * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 30 * s.z, y + s.length * 0.28, x - 26 * s.z, y + s.length * 0.65, x, y + s.length);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawStars() {
    for (let i = 0; i < stars.length; i++) {
      const p = stars[i];
      p.phase += 0.018;
      p.x += p.vx + pointer.x * 0.02 * p.z;
      p.y += p.vy - scrollY * 0.00028 * p.z;
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;
      const alpha = (0.18 + Math.sin(p.phase) * 0.08) * p.z;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.arc(p.x + pointer.x * 52 * p.z, p.y + pointer.y * 36 * p.z, p.r * p.z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function animate() {
    frame++;
    scrollY = lerp(scrollY, scrollTarget, 0.07);
    pointer.x = lerp(pointer.x, pointerTarget.x, 0.055);
    pointer.y = lerp(pointer.y, pointerTarget.y, 0.055);

    ctx.clearRect(0, 0, W, H);
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, 'rgba(4,3,10,0.22)');
    base.addColorStop(0.42, 'rgba(5,7,22,0.10)');
    base.addColorStop(1, 'rgba(4,3,10,0.28)');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    drawExpertiseNodes();
    drawDepthGrid();
    drawStreams();
    drawStars();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', () => { scrollTarget = window.scrollY || 0; }, { passive: true });
  window.addEventListener('mousemove', e => {
    pointerTarget.x = (e.clientX / Math.max(W, 1) - 0.5) * 2;
    pointerTarget.y = (e.clientY / Math.max(H, 1) - 0.5) * 2;
  }, { passive: true });

  resize();
  animate();
}

/* ═══════════════════════════════════════
   16. IMMERSIVE SCROLL SCENE
═══════════════════════════════════════ */
function initImmersiveScene() {
  const scene = qs('#siteScene');
  if (!scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = qsa('.scene-layer', scene);
  const grid = qs('.scene-grid', scene);
  const sections = qsa('.section, .stats, .footer');
  const touchOnly = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let scrollTarget = window.scrollY || 0;
  let scrollY = scrollTarget;
  let scrollTimer = null;

  const updateSections = () => {
    const vh = window.innerHeight || 1;
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const centered = (rect.top + rect.height / 2 - vh / 2) / vh;
      section.style.setProperty('--section-shift', `${(-centered * 54).toFixed(2)}px`);
      section.style.setProperty('--section-glow', `${(0.15 + progress * 0.24).toFixed(3)}`);
    });
  };

  const onPointerMove = e => {
    if (touchOnly) return;
    pointerTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  const onScroll = () => {
    scrollTarget = window.scrollY || 0;
    document.body.classList.add('is-scrolling');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => document.body.classList.remove('is-scrolling'), 160);
    updateSections();
  };

  const animate = () => {
    pointerX = lerp(pointerX, pointerTargetX, 0.06);
    pointerY = lerp(pointerY, pointerTargetY, 0.06);
    scrollY = lerp(scrollY, scrollTarget, 0.08);

    scene.style.setProperty('--scene-x', `${(pointerX * 18).toFixed(2)}px`);
    scene.style.setProperty('--scene-y', `${(pointerY * 14 - scrollY * 0.012).toFixed(2)}px`);

    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth || '0.1');
      const tx = pointerX * depth * 100;
      const ty = pointerY * depth * 72 - scrollY * depth * 0.07;
      const rot = pointerX * depth * 14;
      layer.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    });

    if (grid) {
      const gy = scrollY * -0.052;
      const gx = pointerX * 30;
      const gr = pointerX * 2.8;
      grid.style.transform = `perspective(1200px) rotateX(78deg) translate3d(${gx.toFixed(2)}px, ${gy.toFixed(2)}px, 0) rotateZ(${gr.toFixed(2)}deg)`;
    }

    requestAnimationFrame(animate);
  };

  updateSections();
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateSections, { passive: true });
  requestAnimationFrame(animate);
}

/* ═══════════════════════════════════════
   17. STATS PARTICLES BG

═══════════════════════════════════════ */
function initStatsParticles() {
  const wrap = qs('#statsParticles');
  if (!wrap) return;

  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('span');
    const s   = Math.random() * 4 + 1;
    Object.assign(dot.style, {
      position:        'absolute',
      width:           s + 'px',
      height:          s + 'px',
      borderRadius:    '50%',
      background:      Math.random() > 0.5 ? '#00d4ff' : '#8b5cf6',
      opacity:         (Math.random() * 0.3 + 0.05).toFixed(2),
      left:            Math.random() * 100 + '%',
      top:             Math.random() * 100 + '%',
      animation:       `floatDot ${(Math.random() * 6 + 4).toFixed(1)}s ease-in-out ${(Math.random() * 4).toFixed(1)}s infinite alternate`,
      pointerEvents:   'none',
    });
    wrap.appendChild(dot);
  }

  /* Inject keyframes */
  if (!qs('#statsDotKF')) {
    const style = document.createElement('style');
    style.id = 'statsDotKF';
    style.textContent = `
      @keyframes floatDot {
        from { transform: translateY(0) scale(1); }
        to   { transform: translateY(-20px) scale(1.5); }
      }
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%      { transform: translateX(-8px); }
        40%      { transform: translateX(8px); }
        60%      { transform: translateX(-5px); }
        80%      { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ═══════════════════════════════════════
   18. SMOOTH SCROLL
═══════════════════════════════════════ */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ═══════════════════════════════════════
   19. PARALLAX (hero text)
═══════════════════════════════════════ */
function initParallax() {
  const hero = qs('.hero__content');
  if (!hero || window.matchMedia('(max-width: 900px)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    hero.style.transform = `translateY(${y * 0.25}px)`;
    hero.style.opacity   = Math.max(0, 1 - y / 500);
  }, { passive: true });
}

/* ═══════════════════════════════════════
   INIT ALL MODULES (after preloader)
═══════════════════════════════════════ */
function initAllModules() {
  initHeroCanvas();
  initCursor();
  initMagnetic();
  initNavbar();
  initScrollReveal();
  initSkillBars();
  initCounters();
  initRoleRotator();
  initPortfolioFilter();
  initTestimonials();
  initContactForm();
  initFooterYear();
  initCardTilt();
  initCinematicCanvas();
  initImmersiveScene();
  initStatsParticles();
  initSmoothScroll();
  initParallax();
}

/* Keep the landing page at the top on normal loads.
   Fixes accidental reload/bookmark jumps to the testimonials section. */
function lockInitialScrollPosition() {
  const hash = window.location.hash;
  const shouldStartAtTop = !hash || hash === '#testimonials';
  if (!shouldStartAtTop) return;

  if (hash === '#testimonials' && history.replaceState) {
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }

  let frames = 0;
  const keepTop = () => {
    window.scrollTo(0, 0);
    if (++frames < 12) requestAnimationFrame(keepTop);
  };

  window.scrollTo(0, 0);
  requestAnimationFrame(keepTop);
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', () => {
  lockInitialScrollPosition();
  initPreloader();
});
