# Kishankumar Patel: Developer Portfolio

The site has a Three.js hero, a draggable 3D skill sphere, a 3D globe, and 3D flip and tilt cards. A small Node.js API serves the content and handles the contact form.

| Part | Stack |
|---|---|
| **`client/`** | React 18, Vite, TypeScript, Tailwind CSS (design tokens), React Router, Framer Motion, Three.js via `@react-three/fiber` |
| **`server/`** | Node.js 22, Express, SQLite (built-in `node:sqlite`), zod, nodemailer, Swagger UI, `node:test` |
| **CI/CD** | GitHub Actions: test, build, deploy to GitHub Pages |

---

## Contents

- [Features](#features)
- [Site sections](#site-sections)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [API reference](#api-reference)
- [Editing content](#editing-content)
- [Design system](#design-system)
- [Accessibility and performance](#accessibility-and-performance)
- [Deployment](#deployment)
- [TODO](#todo)

---

## Features

### 3D and interaction

| Feature | Where | Details |
|---|---|---|
| **3D hero scene** | Hero | A faceted glowing core, wireframe shell, orbit rings, floating shards that move away from the cursor, and a particle field. The camera follows the mouse, and the core moves and spins as you scroll. Colors follow the active theme. |
| **3D skill sphere** | Skills | Skills arranged on a rotating sphere using CSS 3D transforms. Drag it with mouse or touch and it keeps some momentum. Clicking a category chip highlights that category's skills on the sphere and in its card. |
| **3D globe** | Contact | A wireframe, dotted Earth with a lit route from **Gujarat, India** to **Windsor, Canada**. The route follows the real great-circle path over the Arctic. Drag to spin it. |
| **3D flip certificate cards** | Education | Each card tilts toward the cursor with a glare. **Preview** flips it to show a certificate face, and **View** opens the original PDF. |
| **3D tilt cards** | Projects, About, Experience, Skills, Education, Contact | Cards tilt toward the pointer with a moving glare, and their content lifts in depth on hover. |
| **Project filters and modal** | Projects | Filters for Backend, Web, Data & ML, Systems and Testing, with animated reflow and a details modal for each project. |
| **Typing tagline** | Hero | Cycles through four focus areas. |
| **Scroll reveal** | All sections | Content fades and lifts in as it enters the viewport, using CSS transitions. |
| **Dark/light theme** | Navbar | Follows the system preference, and a manual choice is saved in `localStorage`. The 3D scenes recolor to match. |
| **Active-section navbar** | Navbar | Smooth scrolling. The current section is highlighted. Below 768px it becomes a hamburger menu. |
| **Contact form** | Contact | Live validation, loading, success and error states, a hidden honeypot field for spam, and a mailto fallback. |

### Resilience

- **Works without the API.** If `VITE_API_BASE_URL` is empty or the API can't be reached within 4 seconds, the site uses the content bundled in `client/src/data/content.json`.
- **Works without WebGL.** The hero falls back to an animated 2D CSS background, and the globe shows a static placeholder.
- **3D loads lazily.** Three.js (about 220 KB gzipped) loads only after the first scroll, tap or mouse movement, and the globe loads only when Contact comes near the screen. Scenes stop rendering while they're off-screen.

---

## Site sections

| Section | Content |
|---|---|
| **Hero** | Name, location, typing tagline, summary, calls to action |
| **About** | Background and quick facts: Windsor, 2+ years of .NET, MAC UWindsor '26, backend & data |
| **Experience** | UI/UX Designer at Ottawa Infotainment (2026); .NET Software Developer at Suryajit Publication (2023–2024) |
| **Projects** | Online Banking System, Enterprise Data Analytics Pipeline, SocketFS, Globe Trekker, Diabetes Prediction, Selenium Automation |
| **Skills** | 3D sphere plus 10 category cards: languages, frameworks, backend, databases, data, testing, systems, cloud, tools, practices |
| **Education** | Master of Applied Computing (University of Windsor); B.E. Computer Engineering (GTU) |
| **Certifications** | Six LinkedIn Learning certificates with PDFs: Microsoft Azure, Hadoop, Unix, Regular Expressions, Professional Speaking, Selenium |
| **Resume** | PDF download |
| **Contact** | 3D globe, email, location, contact form |
| **404** | Custom not-found page |

---

## Project structure

```
kishan-portfolio/
├── .github/workflows/deploy-client.yml   CI: API tests → build → GitHub Pages
├── client/
│   ├── public/
│   │   ├── certificates/*.pdf            certificate PDFs
│   │   ├── favicon.svg, og-image.png, robots.txt
│   ├── scripts/spa-404.mjs               copies index.html → 404.html for Pages
│   └── src/
│       ├── api/            typed API client with static fallback, shared types
│       ├── components/     Navbar, Tilt, SkillSphere, ContactGlobe, ProjectCard/Modal,
│       │   └── certificates/   CertificateCard (flip), CertificateFace, CertificateViewer
│       ├── data/           content.json (API mirror), content.ts (profile, education, certs)
│       ├── hooks/          useApi, useInView, useActiveSection, useTypewriter, useMediaQuery
│       ├── pages/          Home, NotFound
│       ├── sections/       Hero, About, Experience, Projects, Skills, Education, Contact
│       ├── styles/         tokens.css (design tokens), globals.css
│       ├── theme/          ThemeProvider (saved + system theme)
│       └── three/          HeroScene, GlobeScene, HeroBackground, Fallback2D, utils
└── server/
    ├── src/
    │   ├── app.js          Express app: routes, CORS, rate limit, ProblemDetails errors
    │   ├── config.js       environment-based configuration
    │   ├── data/           content.js (seed data), db.js (SQLite migrations + seed)
    │   ├── services/       portfolio, contact, email (SMTP)
    │   ├── validation/     zod contact schema + sanitizer
    │   └── openapi.js      OpenAPI 3 spec for Swagger UI
    └── test/               validation, contact service, API, content-sync tests
```

---

## Run locally

**Requirements:** Node.js **22.13 or newer**, which is needed for the built-in `node:sqlite`.

```bash
# 1. API → http://localhost:5080  (Swagger UI: /api/docs)
cd server
npm install
cp .env.example .env         # optional: add SMTP settings so contact messages are emailed
npm run dev

# 2. Site → http://localhost:5173  (in a second terminal)
cd client
npm install
cp .env.example .env.local   # points the site at the local API
npm run dev
```

| Command | Where | What it does |
|---|---|---|
| `npm test` | `server/` | Runs all 20 API tests |
| `npm run typecheck` | `client/` | TypeScript check |
| `npm run build` | `client/` | Production build to `client/dist/` |
| `npm run preview` | `client/` | Serves the production build |

### Environment variables

**Client** (`client/.env.local`)

| Variable | Example | Purpose |
|---|---|---|
| `VITE_WEB3FORMS_KEY` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | **Recommended for GitHub Pages.** Delivers contact messages directly to `patelkishan6214@gmail.com` with zero backend server needed. Get a free key at [web3forms.com](https://web3forms.com). |
| `VITE_API_BASE_URL` | `http://localhost:5080` | API origin, without a trailing slash. Leave empty for static-only mode. |
| `VITE_CONTACT_ENDPOINT` | `https://formspree.io/f/xyz` | Optional custom form endpoint (e.g. Formspree). |
| `VITE_BASE` | `/kishan-portfolio/` | Base path. Set automatically in CI for GitHub Pages. |

**Server** (`server/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5080` | HTTP port |
| `DB_PATH` | `./data/portfolio.db` | SQLite file |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `TRUST_PROXY` | `false` | Set to `true` behind Render or Azure so rate limiting sees real client IPs |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP host for Gmail |
| `SMTP_PORT` | `465` | SMTP port (465 SSL, or 587 TLS) |
| `SMTP_USER` | `patelkishan6214@gmail.com` | Gmail address |
| `SMTP_PASS` | none | **16-character Google App Password** (from Google Account → Security → 2-Step Verification → App passwords) |
| `SMTP_FROM` | `"Kishankumar Patel Portfolio" <patelkishan6214@gmail.com>` | Sender header |
| `CONTACT_TO` | `patelkishan6214@gmail.com` | Destination inbox for contact messages |

Secrets go in environment variables or the git-ignored `.env`. Never commit them.

---

## API reference

Base path: `/api`. Errors are RFC 7807 `application/problem+json` responses.

| Method | Route | Response |
|---|---|---|
| `GET` | `/health` | `200 { status, db }` |
| `GET` | `/projects?tag=` | `200 Project[]`. Tags: `backend`, `web`, `data-ml`, `systems`, `testing`. An unknown tag returns `400`. |
| `GET` | `/projects/{id}` | `200 Project` or `404` |
| `GET` | `/skills` | `200 { category, items[] }[]` |
| `GET` | `/experience` | `200 Experience[]` |
| `POST` | `/contact` | `202 { id, delivered }`, `400` with field errors, or `429` when rate-limited |
| `GET` | `/docs` | Swagger UI. The raw spec is at `/openapi.json`. |

**Contact pipeline:** the input is validated with zod (name 2–100 characters, a valid email, message 10–2000 characters, empty honeypot), then sanitized by stripping HTML tags and control characters. It's saved to SQLite with a hashed IP, then emailed over SMTP. The message is stored before the email is sent, so an SMTP failure never loses it. Requests are limited to **5 per 10 minutes per IP**.

**Security:** CORS allows only the origins in configuration, request bodies are capped at 10 KB, `X-Content-Type-Options` and `Referrer-Policy` headers are set, and `X-Powered-By` is turned off.

---

## Editing content

| What | File |
|---|---|
| Projects, skills, experience | `server/src/data/content.js` **and** `client/src/data/content.json` |
| Profile, about text, education, certifications, nav | `client/src/data/content.ts` |
| Certificate PDFs | `client/public/certificates/` |
| Colors, spacing, radii, shadows, type scale | `client/src/styles/tokens.css` |

The two content files must match. `server/test/content-sync.test.js` fails if they drift apart. To regenerate the JSON from the server file:

```bash
node --input-type=module -e "import * as c from './server/src/data/content.js'; import {writeFileSync} from 'node:fs'; writeFileSync('client/src/data/content.json', JSON.stringify({tags:c.TAGS,projects:c.projects,skills:c.skills,experience:c.experience},null,2)+'\n')"
```

---

## Design system

All design values are CSS custom properties in `tokens.css`, mapped into Tailwind.

| Token group | Values |
|---|---|
| **Accent** | Teal: `#0f766e` (light), `#2dd4bf` (dark). Both meet WCAG AA contrast. |
| **Spacing** | 8px scale (4px half step): 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 128 |
| **Radii** | 6 / 12 / 20px |
| **Type** | Space Grotesk (headings), Inter (body, line-height 1.6). Font sizes scale fluidly with `clamp()`, and headings are also capped by viewport height for landscape phones. |
| **Shadows** | sm / md / lg, tuned per theme |

---

## Accessibility and performance

**Accessibility**
- Semantic landmarks, a skip link, and visible focus rings.
- Native `<dialog>` for modals, which traps focus, closes on Esc and returns focus to the opener.
- Flip cards make the hidden face `inert`, so keyboard and screen-reader users only reach the visible side.
- Touch targets are at least 44px. Form errors are tied to their fields with `aria-describedby`, and filter state uses `aria-pressed`.
- `prefers-reduced-motion` turns off animation, tilt, auto-rotation and typing.

**Responsive layout** has been checked at 320, 360, 375, 414, 600, 768, 820, 912, 1024, 1280, 1440 and 1920px, plus a 740×360 landscape phone. None of these widths scroll horizontally.

**Lighthouse** (local production build):

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 84–85 | 100 | 100 | 100 |

Mobile performance is below the 90 target, mostly due to JavaScript start-up under Lighthouse's simulated slow CPU. Scores on that machine varied by up to ±10 points between runs.

---

## Deployment

### Site → GitHub Pages

1. Push the repo to GitHub.
2. Go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Optional: under **Settings → Secrets and variables → Actions → Variables**, add `VITE_API_BASE_URL`, for example `https://kishan-portfolio-api.onrender.com`.
4. Push to `main`. The workflow runs the API tests, builds with the correct base path (`/<repo>/`, or `/` for a `<user>.github.io` repo) and deploys. The custom 404 page also handles deep links.

### API → Render (free tier)

1. **New → Web Service**, then connect the repo.
2. Root directory: `server`. Build command: `npm ci`. Start command: `npm start`. Health check path: `/api/health`.
3. Environment: `NODE_VERSION=22`, `CORS_ORIGINS=https://<user>.github.io`, `TRUST_PROXY=true`, plus the SMTP variables. For Gmail, use `smtp.gmail.com:587` with an app password.

Render's free disk is temporary, so stored contact messages are lost on restart. They're still emailed if SMTP is set. Free instances sleep when idle, and the site shows its built-in content while the API wakes up.

### API → Azure App Service (alternative)

Create a Linux Web App with **Node 22 LTS**. Deploy `server/`, for example with `az webapp up --runtime "NODE:22-lts"`. Set the startup command to `npm start` and add the same environment variables plus `DB_PATH=/home/data/portfolio.db`, since `/home` persists on App Service.

---

## TODO

Information not available on the resume:

- [ ] **GitHub and LinkedIn URLs:** `profile.github` / `profile.linkedin` in `client/src/data/content.ts`. The icons appear once these are set.
- [ ] **Project repository links:** SocketFS, Globe Trekker, Online Banking, Selenium automation. Set `repoUrl` in both content files.
- [ ] **Resume PDF:** add `client/public/Kishankumar_Patel_Resume.pdf`. The download button already links to it.
- [ ] **Final site URL:** make `og:image` in `client/index.html` absolute and add `og:url` for link previews.
- [ ] **Certificate preview images:** the flip side currently shows a generated certificate face. It could be replaced with images rendered from the PDFs.

---

© Kishankumar Patel
