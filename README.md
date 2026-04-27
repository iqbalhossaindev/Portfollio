# Iqbal Hossain — Portfolio Website

> **3D Immersive Scroll-Based Portfolio** — Graphics Design · Digital Marketing · Cyber Security

[![Deploy Status](https://img.shields.io/badge/GitHub%20Pages-Ready-brightgreen)](#deploy-to-github-pages)

---

## ✨ Features

- **3D Particle Canvas** — Animated WebGL-style hero with depth, mouse parallax & glowing orbs
- **Cinematic Preloader** — Staggered letter reveal with progress bar
- **Custom Cursor** — Magnetic dot + ring that morphs on hover
- **Scroll Reveal Animations** — Direction-aware fade/slide-in on every section
- **3D Card Tilt** — Perspective tilt on service cards following mouse
- **Parallax Hero** — Content depth shift on scroll
- **Role Rotator** — Cycling specialization tags in the hero
- **Animated Skill Bars** — Triggered on viewport entry
- **Counter Animation** — Stats count up when visible
- **Portfolio Filter** — Category-based animated filtering
- **Testimonials Carousel** — Auto-play with touch/swipe + dot nav
- **Marquee Strip** — Infinite scrolling skills ticker
- **Magnetic Buttons** — Buttons follow cursor proximity
- **Contact Form** — Mailto fallback with success state
- **Fully Responsive** — Mobile-first, tested down to 320px
- **Full SEO Package** — Meta, OG, Twitter Card, Schema.org, Sitemap, robots.txt
- **Auto GitHub Pages Deploy** — Push to `main` → live site

---

## 📁 Project Structure

```
portfolio/
├── index.html              ← Main page (all sections)
├── iqbal.png               ← YOUR PHOTO (replace this!)
├── sitemap.xml             ← Auto SEO sitemap
├── robots.txt              ← Search crawler config
├── README.md
├── css/
│   └── style.css           ← All styles (3600+ lines)
├── js/
│   └── main.js             ← All interactions & 3D canvas
└── .github/
    └── workflows/
        └── deploy.yml      ← GitHub Pages auto-deploy
```

---

## 🚀 Deploy to GitHub Pages

### Step 1 — Replace Your Photo
- Put your actual photo at `iqbal.png` in the root folder
- Recommended: **600×700px** or similar portrait ratio, JPG/PNG

### Step 2 — Create a GitHub Repository
```bash
# Initialize git
git init
git add .
git commit -m "Initial portfolio deploy"

# Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo on GitHub
2. **Settings → Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow runs automatically on every push to `main`
5. Your site will be live at: `https://YOUR_USERNAME.github.io/portfolio/`

### Step 4 — Custom Domain (optional)
1. In **Settings → Pages → Custom domain**, enter `theiqbal.com`
2. Add these DNS records at your domain registrar:
   ```
   A     @    185.199.108.153
   A     @    185.199.109.153
   A     @    185.199.110.153
   A     @    185.199.111.153
   CNAME www  YOUR_USERNAME.github.io
   ```
3. Check **Enforce HTTPS**
4. Update `sitemap.xml` URLs if using a custom domain

---

## 🔧 Customization

### Update Contact Info
Search `index.html` for:
- `+15798995633` → your phone/WhatsApp
- `hello@theiqbal.com` → your email

### Update Portfolio Projects
In `index.html`, find `.portfolio-item` blocks and update:
- `<h3>` — project title
- `<p>` — project description
- `data-category` — `design` | `marketing` | `security`
- `.pf-bg-*` class → custom background gradient

### Change Colors
In `css/style.css`, edit the `:root` variables:
```css
--cyan:   #00d4ff;   /* primary accent */
--purple: #8b5cf6;   /* secondary accent */
--gold:   #f59e0b;   /* tertiary accent */
--bg:     #04030a;   /* background */
```

### Update Sitemap
After setting your live URL, update `sitemap.xml`:
```xml
<loc>https://YOUR-DOMAIN.com/</loc>
```

---

## 📦 Technologies

| Layer | Technology |
|---|---|
| Structure | HTML5 Semantic |
| Styling | CSS3 (Custom Properties, Grid, Flexbox, Animations) |
| Scripting | Vanilla JS ES6+ (no framework) |
| 3D Canvas | Native Canvas 2D API |
| SEO | Schema.org JSON-LD, Open Graph, Twitter Cards |
| CI/CD | GitHub Actions → GitHub Pages |

---

## 📋 SEO Checklist (already done)

- [x] Title, meta description, keywords
- [x] Open Graph (Facebook/LinkedIn)
- [x] Twitter Card
- [x] Schema.org Person + WebSite + ProfessionalService
- [x] Canonical URL
- [x] XML Sitemap
- [x] robots.txt
- [x] Semantic HTML (nav, main, section, article, footer)
- [x] ARIA labels throughout
- [x] Alt text on images
- [x] Lazy loading images
- [ ] Update domain in sitemap.xml after deploy

---

## 📝 License

© 2025 Iqbal Hossain. All rights reserved.
