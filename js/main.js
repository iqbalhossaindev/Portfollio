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
    if (cards.length < 2 || autoplay || isHovered || !isVisible || document.hidden || reduceMotion) return;
    autoplay = setInterval(() => {
      goTo(current + 1, { smooth: false, preservePageScroll: true });
    }, 4500);
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
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  qsa('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const rx = ((e.clientY - cy) / (r.height / 2)) * -6;
      const ry = ((e.clientX - cx) / (r.width  / 2)) *  6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ═══════════════════════════════════════
   15. STATS PARTICLES BG
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
   16. SMOOTH SCROLL
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
   17. PARALLAX (hero text)
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
