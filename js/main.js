/* ════════════════════════════════════════════════════════════
   IQBAL HOSSAIN PORTFOLIO — CINEMATIC EDITION
   ════════════════════════════════════════════════════════════ */
'use strict';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ══════════════════════════════════════════════
   1.  CINEMATIC SPLASH SCREEN
══════════════════════════════════════════════ */
function initSplash() {
  const splash     = qs('#splash');
  const portal     = qs('#splashPortal');
  const fill       = qs('#splashFill');
  const wrapper    = qs('#siteWrapper');
  if (!splash) return;

  document.body.classList.add('splash-active');

  /* Mini particle canvas on splash */
  const sc  = qs('#splashCanvas');
  const sctx = sc.getContext('2d');
  let sw, sh, sParticles = [];
  function resizeSplash() {
    sw = sc.width  = window.innerWidth;
    sh = sc.height = window.innerHeight;
    sParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * sw, y: Math.random() * sh,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.8 + .4,
      c: ['#00d4ff','#8b5cf6','#e040fb','#f59e0b'][Math.floor(Math.random()*4)],
      a: Math.random() * .5 + .1,
    }));
  }
  resizeSplash();
  window.addEventListener('resize', resizeSplash, { passive: true });

  let splashRAF;
  function tickSplash() {
    splashRAF = requestAnimationFrame(tickSplash);
    sctx.clearRect(0, 0, sw, sh);
    sParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = sw; if (p.x > sw) p.x = 0;
      if (p.y < 0) p.y = sh; if (p.y > sh) p.y = 0;
      sctx.beginPath();
      sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      sctx.fillStyle = p.c + Math.floor(p.a * 255).toString(16).padStart(2, '0');
      sctx.fill();
    });
  }
  tickSplash();

  /* Animate progress bar, then trigger expand */
  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 14 + 4;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      if (fill) fill.style.width = '100%';
      setTimeout(expandSplash, 380);
    }
    if (fill) fill.style.width = pct + '%';
  }, 55);

  function expandSplash() {
    /* Fade the veil (photo → bg) for seamless blend */
    const veil = qs('#splashVeil');
    if (veil) { veil.style.transition = 'opacity 0.5s'; veil.style.opacity = '1'; }

    splash.classList.add('splash--expanding');

    /* Fade in site wrapper slightly before splash fades */
    setTimeout(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transition = 'opacity 0.6s ease';
    }, 500);

    setTimeout(() => {
      cancelAnimationFrame(splashRAF);
      splash.classList.add('splash--done');
      document.body.classList.remove('splash-active');
      setTimeout(() => { if (splash.parentNode) splash.remove(); }, 400);
      initAllModules();
    }, 1100);
  }
}

/* ══════════════════════════════════════════════
   2. THREE.JS DEPTH BACKGROUND
══════════════════════════════════════════════ */
function initThreeBackground() {
  if (typeof THREE === 'undefined') return;

  const canvas = qs('#threeCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 80;

  /* Particle field */
  const COUNT    = window.innerWidth < 768 ? 800 : 1800;
  const geom     = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const sizes     = new Float32Array(COUNT);
  const palette   = [
    new THREE.Color('#00d4ff'),
    new THREE.Color('#8b5cf6'),
    new THREE.Color('#e040fb'),
    new THREE.Color('#f59e0b'),
    new THREE.Color('#10b981'),
  ];
  for (let i = 0; i < COUNT; i++) {
    positions[i*3]   = (Math.random() - .5) * 200;
    positions[i*3+1] = (Math.random() - .5) * 200;
    positions[i*3+2] = (Math.random() - .5) * 160;
    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i*3]   = col.r;
    colors[i*3+1] = col.g;
    colors[i*3+2] = col.b;
    sizes[i] = Math.random() * 1.8 + 0.5;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
  geom.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

  const mat = new THREE.PointsMaterial({
    size: 1.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const points = new THREE.Points(geom, mat);
  scene.add(points);

  /* Floating wireframe spheres for depth */
  function addWireSphere(radius, color, x, y, z) {
    const sg = new THREE.SphereGeometry(radius, 12, 8);
    const sm = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.06 });
    const mesh = new THREE.Mesh(sg, sm);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }
  const sphere1 = addWireSphere(30, 0x00d4ff,  45, -15, -30);
  const sphere2 = addWireSphere(22, 0x8b5cf6, -40,  20, -50);
  const sphere3 = addWireSphere(18, 0xe040fb,   5,  35, -20);

  /* Mouse parallax */
  let mx = 0, my = 0, targetX = 0, targetY = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
  }, { passive: true });

  /* Scroll depth parallax */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  let frame = 0;
  function tick() {
    frame++;
    requestAnimationFrame(tick);

    targetX = lerp(targetX, mx, 0.04);
    targetY = lerp(targetY, my, 0.04);

    points.rotation.y  = frame * 0.00025 + targetX * 0.12;
    points.rotation.x  = frame * 0.00015 + targetY * 0.08;
    sphere1.rotation.y = frame * 0.004;
    sphere1.rotation.x = frame * 0.003;
    sphere2.rotation.y = -frame * 0.003;
    sphere2.rotation.z = frame * 0.002;
    sphere3.rotation.x = frame * 0.0025;
    sphere3.rotation.y = frame * 0.005;

    /* Scroll: move particles deeper */
    camera.position.z = 80 - scrollY * 0.03;
    camera.position.y =  scrollY * 0.015;

    renderer.render(scene, camera);
  }
  tick();
}

/* ══════════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════════ */
function initCursor() {
  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;
  if (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function moveCursor() {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(moveCursor);
  }
  moveCursor();

  const hoverEls = 'a, button, .magnetic, .service-card, .portfolio-item, .filter-btn, .testi-nav-btn';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ══════════════════════════════════════════════
   4. NAVIGATION
══════════════════════════════════════════════ */
function initNav() {
  const nav    = qs('#navbar');
  const burger = qs('#navBurger');
  const links  = qs('#navLinks');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger?.addEventListener('click', () => {
    const open = !links.classList.contains('open');
    links.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  links?.querySelectorAll('.nav__link').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ══════════════════════════════════════════════
   5. HERO ENTRANCE (GSAP-powered)
══════════════════════════════════════════════ */
function initHeroEntrance() {
  const tag   = qs('#heroTag');
  const title = qsa('#heroTitle .hero__title-line');
  const roles = qs('#heroRoles');
  const sub   = qs('#heroSub');
  const acts  = qs('#heroActions');
  const cue   = qs('#heroScrollCue');
  const b1    = qs('#heroBadge1');
  const b2    = qs('#heroBadge2');
  const b3    = qs('#heroBadge3');

  if (typeof gsap === 'undefined') {
    /* Fallback: CSS class-based */
    const els = [tag, ...title, roles, sub, acts, cue, b1, b2, b3];
    els.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => el.classList.add('is-visible'), i * 120 + 100);
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl
    .fromTo(tag,    { opacity:0, y: 22 }, { opacity:1, y: 0, duration:.7 }, .1)
    .fromTo(title[0], { opacity:0, y:90 }, { opacity:1, y:0, duration:1.1 }, .25)
    .fromTo(title[1], { opacity:0, y:90 }, { opacity:1, y:0, duration:1.1 }, .4)
    .fromTo(roles,  { opacity:0, y: 20 }, { opacity:1, y: 0, duration:.7 }, .65)
    .fromTo(sub,    { opacity:0, y: 20 }, { opacity:1, y: 0, duration:.7 }, .75)
    .fromTo(acts,   { opacity:0, y: 20 }, { opacity:1, y: 0, duration:.7 }, .85)
    .fromTo(cue,    { opacity:0 }, { opacity:1, duration:.7 }, 1.1)
    .fromTo([b1,b2,b3], { opacity:0, y:18, scale:.94 }, { opacity:1, y:0, scale:1, duration:.6, stagger:.15 }, .9);
}

/* ══════════════════════════════════════════════
   6. GSAP SCROLL ANIMATIONS (depth + parallax)
══════════════════════════════════════════════ */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Section reveals */
  qsa('.reveal-up, .reveal-left, .reveal-right, .reveal-fade').forEach(el => {
    const dir = el.classList.contains('reveal-left')  ? { x: -55 } :
                el.classList.contains('reveal-right') ? { x:  55 } :
                el.classList.contains('reveal-fade')  ? {}         : { y: 55 };
    const delay = parseFloat(el.style.getPropertyValue('--delay') || '0') * 0.13;
    gsap.fromTo(el, { opacity:0, ...dir },
      { opacity:1, x:0, y:0, duration:.9,
        ease:'power3.out', delay,
        scrollTrigger: { trigger: el, start:'top 88%', once: true }
      }
    );
  });

  /* HERO parallax on scroll */
  gsap.to('#heroTitle', {
    y: -60, ease:'none',
    scrollTrigger: { trigger:'#hero', start:'top top', end:'bottom top', scrub: 1 }
  });
  gsap.to('.hero__depth-back', {
    y: 40, ease:'none',
    scrollTrigger: { trigger:'#hero', start:'top top', end:'bottom top', scrub: 1.5 }
  });
  gsap.to('#heroSub', {
    y: -30, opacity:.2, ease:'none',
    scrollTrigger: { trigger:'#hero', start:'top top', end:'60% top', scrub: 1 }
  });

  /* Service cards 3-D tilt-entrance */
  qsa('.service-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity:0, y:80, rotateX:12, transformPerspective:800 },
      { opacity:1, y:0,  rotateX:0, duration:1, ease:'power3.out', delay: i * 0.15,
        scrollTrigger: { trigger: card, start:'top 86%', once: true }
      }
    );
  });

  /* Stats cinematic count + reveal */
  qsa('.stat-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity:0, y:40, scale:.94 },
      { opacity:1, y:0,  scale:1, duration:.8, ease:'back.out(1.5)', delay: i * 0.12,
        scrollTrigger: { trigger: item, start:'top 88%', once: true }
      }
    );
  });

  /* Portfolio grid stagger */
  qsa('.portfolio-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity:0, y:50, scale:.96 },
      { opacity:1, y:0, scale:1, duration:.85, ease:'power3.out', delay: i * 0.07,
        scrollTrigger: { trigger: '#portfolioGrid', start:'top 86%', once: true }
      }
    );
  });

  /* Process steps slide */
  qsa('.process-step').forEach((step, i) => {
    gsap.fromTo(step,
      { opacity:0, y:50, rotateY: i % 2 === 0 ? -8 : 8 },
      { opacity:1, y:0, rotateY:0, duration:1, ease:'power3.out',
        scrollTrigger: { trigger: step, start:'top 88%', once: true }
      }
    );
  });

  /* Testimonial cards */
  gsap.fromTo('.testi-card',
    { opacity:0, x:60 },
    { opacity:1, x:0, duration:.8, ease:'power3.out', stagger:.15,
      scrollTrigger: { trigger:'#testimonials', start:'top 80%', once: true }
    }
  );
}

/* ══════════════════════════════════════════════
   7. MAGNETIC BUTTONS
══════════════════════════════════════════════ */
function initMagnetic() {
  qsa('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}

/* ══════════════════════════════════════════════
   8. 3D CARD TILT
══════════════════════════════════════════════ */
function initTiltCards() {
  qsa('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - .5;
      const ny = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-ny * 14}deg) rotateY(${nx * 14}deg) translateZ(12px) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });
}

/* ══════════════════════════════════════════════
   9. HERO ROLES ROTATION
══════════════════════════════════════════════ */
function initHeroRoles() {
  const roles = qsa('.hero__role');
  if (!roles.length) return;
  let idx = 0;
  setInterval(() => {
    roles[idx].classList.remove('active');
    idx = (idx + 1) % roles.length;
    roles[idx].classList.add('active');
  }, 2800);
}

/* ══════════════════════════════════════════════
   10. SCROLL REVEAL (CSS fallback)
══════════════════════════════════════════════ */
function initScrollReveal() {
  if (typeof ScrollTrigger !== 'undefined') return; /* GSAP handles it */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  qsa('.reveal-up, .reveal-left, .reveal-right, .reveal-fade').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════
   11. SKILL BARS
══════════════════════════════════════════════ */
function initSkillBars() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const fill = e.target;
      const w = fill.dataset.width;
      setTimeout(() => { fill.style.width = w + '%'; }, 200);
      io.unobserve(fill);
    });
  }, { threshold: 0.3 });
  qsa('.skill-fill').forEach(f => io.observe(f));
}

/* ══════════════════════════════════════════════
   12. COUNTER ANIMATION
══════════════════════════════════════════════ */
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const dur    = 1800;
      const start  = performance.now();
      function step(now) {
        const t = clamp((now - start) / dur, 0, 1);
        const ease = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
        el.textContent = Math.round(ease * target) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  qsa('.stat-num[data-target]').forEach(n => io.observe(n));
}

/* ══════════════════════════════════════════════
   13. PORTFOLIO FILTER
══════════════════════════════════════════════ */
function initPortfolio() {
  const btns  = qsa('.filter-btn');
  const items = qsa('.portfolio-item');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      const f = btn.dataset.filter;
      items.forEach(item => {
        const show = f === 'all' || item.dataset.category === f;
        item.classList.toggle('filtered-out', !show);
      });
    });
  });
}

/* ══════════════════════════════════════════════
   14. TESTIMONIALS CAROUSEL
══════════════════════════════════════════════ */
function initTestimonials() {
  const track = qs('#testiTrack');
  const prev  = qs('#testiPrev');
  const next  = qs('#testiNext');
  const dotsC = qs('#testiDots');
  if (!track) return;

  const cards = qsa('.testi-card', track);
  let current = 0;
  let autoplay;
  const cardW = () => cards[0]?.offsetWidth + 32 || 452;

  /* Build dots */
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Review ${i+1}`);
    d.addEventListener('click', () => goTo(i));
    dotsC?.appendChild(d);
  });

  function goTo(n) {
    current = clamp(n, 0, cards.length - 1);
    const offset = current * cardW();
    track.style.transform = `translateX(-${offset}px)`;
    qsa('.testi-dot', dotsC).forEach((d, i) => d.classList.toggle('active', i === current));
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo((current + 1) % cards.length), 5000);
  }

  prev?.addEventListener('click', () => goTo((current - 1 + cards.length) % cards.length));
  next?.addEventListener('click', () => goTo((current + 1) % cards.length));
  window.addEventListener('resize', () => goTo(current), { passive: true });

  /* Drag */
  let dragStart = 0;
  track.addEventListener('mousedown',  e => { dragStart = e.clientX; });
  track.addEventListener('touchstart', e => { dragStart = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('mouseup',    e => {
    const d = dragStart - e.clientX;
    if (Math.abs(d) > 50) goTo(d > 0 ? current + 1 : current - 1);
  });
  track.addEventListener('touchend', e => {
    const d = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) goTo(d > 0 ? current + 1 : current - 1);
  });

  resetAuto();
}

/* ══════════════════════════════════════════════
   15. CONTACT FORM
══════════════════════════════════════════════ */
function initContactForm() {
  const form    = qs('#contactForm');
  const success = qs('#formSuccess');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const valid = [...form.querySelectorAll('[required]')].every(f => f.value.trim());
    if (!valid) { form.querySelectorAll('[required]').forEach(f => { if (!f.value.trim()) f.style.borderColor = '#ff3d5a'; }); return; }
    form.hidden   = true;
    success.hidden = false;
  });
  form.querySelectorAll('input, textarea, select').forEach(f => {
    f.addEventListener('input', () => { f.style.borderColor = ''; });
  });
}

/* ══════════════════════════════════════════════
   16. FOOTER YEAR
══════════════════════════════════════════════ */
function initFooterYear() {
  const el = qs('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════ */
function initAllModules() {
  initThreeBackground();
  initCursor();
  initNav();
  initHeroEntrance();
  initHeroRoles();
  initScrollReveal();
  initScrollAnimations();
  initMagnetic();
  initTiltCards();
  initSkillBars();
  initCounters();
  initPortfolio();
  initTestimonials();
  initContactForm();
  initFooterYear();
}

/* Wait for libraries via defer, then start splash */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSplash);
} else {
  /* Scripts deferred – wait a tick for THREE / GSAP */
  window.addEventListener('load', initSplash);
}
