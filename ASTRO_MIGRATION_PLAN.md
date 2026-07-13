# QualiMeal — Migration Plan: Static HTML (custom include-compiler) → Astro

## Context for the agent

Repo: `khoinguyen0811/Qualimeal`

Current architecture:
- Root-level `*.html` files (`index.html`, `about.html`, etc.) are **generated output**, produced by `node build.js` from `src/*.html`.
- `build.js` is a hand-written "compiler": it scans `src/*.html` for `<!-- INCLUDE path -->` comments and inline-replaces them with the contents of `src/components/*.html`.
- Every file in `src/*.html` (11 pages) repeats the **entire `<head>` block** (meta tags, Tailwind CDN script, Tailwind config script, Google Fonts, `colors.css`/`styles.css` links) verbatim — this is the main pain point to fix.
- Styling: Tailwind loaded via CDN (`<script src="cdn.tailwindcss.com">`) with an inline `tailwind.config` per page, plus `colors.css` (CSS custom properties) and `styles.css`.
- `app.js` contains hardcoded mock data (`CERTIFICATE_DB`, `SEARCH_ARTICLES`) plus UI interactivity (accordions, modals, nav, search, certificate lookup form).
- `assets/` (41MB) has unoptimized images, including one 26MB JPG, plus a PDF and an XLSX file.
- Target deploy: Plesk shared hosting — **static output only**, no Node runtime needed at request time.

Full current page → component mapping (source of truth, use this exactly when migrating):

| Page (`src/*.html`) | Components included (in order) |
|---|---|
| `index.html` | header, hero, about, interactive_accordion, services, rd, applications, blog, contact, footer, modals |
| `about.html` | header, about, interactive_accordion, footer, modals |
| `applications.html` | header, applications, footer, modals |
| `blog.html` | header, blog, footer, modals |
| `complaints.html` | header, footer, modals (content is inline in the page itself, no dedicated component) |
| `contact.html` | header, contact, footer, modals |
| `privacy.html` | header, footer, modals (content inline) |
| `rd.html` | header, rd, footer, modals |
| `regulations.html` | header, footer, modals (content inline) |
| `services.html` | header, services, footer, modals |
| `terms.html` | header, footer, modals (content inline) |

Every page also has some page-specific inline markup outside the includes (e.g. `about.html` has a page-title banner + an "acknowledgement" section between includes) — **preserve this content**, don't drop it during migration, just relocate it into the new page file.

---

## Goal

Rebuild the site in Astro so that:
1. There is exactly **one** `<head>`/layout definition, parameterized per page (title, meta description, meta keywords, `data-page` attribute, OG image if added later).
2. Existing `components/*.html` become Astro components (`.astro`), reused as-is in structure.
3. Tailwind is compiled at build time (no CDN script in production output).
4. Output is 100% static HTML/CSS/JS in `dist/`, deployable to Plesk via plain file upload — no Node process required at runtime.
5. Mock data (`CERTIFICATE_DB`, `SEARCH_ARTICLES`) is extracted to JSON, imported by the interactivity script — no behavior change, just relocated.
6. All images are optimized/converted before or during build.

---

## Step-by-step tasks

### 1. Scaffold Astro project
- `npm create astro@latest` in a new working branch, choose "empty" template, TypeScript optional/strict-off is fine (this is a marketing site, not app logic).
- Add Tailwind: `npx astro add tailwind` (this replaces the CDN script + inline config with a real `tailwind.config.mjs` + PostCSS build).
- Port the `tailwind.config` `extend.colors` / `extend.fontFamily` block (currently duplicated in every page's `<script>`) into `tailwind.config.mjs` **once**.
- Move `colors.css` custom properties and `styles.css` custom classes (scrollbar, glassmorphism, etc.) into `src/styles/global.css`, imported once in the base layout.

### 2. Build the single base layout
- Create `src/layouts/BaseLayout.astro` containing everything currently duplicated across `src/*.html`'s `<head>`:
  - meta charset/viewport
  - `<title>` and `<meta name="description">` / `<meta name="keywords">` as **props** (`title`, `description`, `keywords`)
  - Google Fonts preconnect + link
  - `global.css` import
  - `<script src="/app.js" defer>` → will become a proper Astro/JS import (see step 5)
  - `<body data-page={page}>` where `page` is also a prop, wrapping a `<slot />`
- Every page's `<head>` content is currently byte-for-byte identical except `<title>`, `<meta description>`, `<meta keywords>`, and `data-page` — verify this assumption against each `src/*.html` before deleting duplication, in case one page has a stray extra tag.

### 3. Convert components
For each file in `src/components/`, create the Astro equivalent, same content, same class names (Tailwind utility classes carry over unchanged since it's still Tailwind):
- `header.html` → `src/components/Header.astro`
- `hero.html` → `src/components/Hero.astro`
- `footer.html` → `src/components/Footer.astro`
- `modals.html` → `src/components/Modals.astro`
- `about.html` → `src/components/About.astro`
- `applications.html` → `src/components/Applications.astro`
- `blog.html` → `src/components/Blog.astro`
- `contact.html` → `src/components/Contact.astro`
- `interactive_accordion.html` → `src/components/InteractiveAccordion.astro`
- `rd.html` → `src/components/Rd.astro`
- `services.html` → `src/components/Services.astro`

No logic changes needed at this stage — this is a structural port, not a redesign.

### 4. Build the pages
For each of the 11 pages, create `src/pages/<name>.astro` using `BaseLayout` + the component mapping table above, e.g.:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import About from '../components/About.astro';
import InteractiveAccordion from '../components/InteractiveAccordion.astro';
import Footer from '../components/Footer.astro';
import Modals from '../components/Modals.astro';
---
<BaseLayout
  title="Giới Thiệu Về Chúng Tôi - QualiMeal"
  description="Tìm hiểu về QualiMeal - ..."
  keywords="Giới thiệu QualiMeal, ..."
  page="about"
>
  <Header />
  <!-- page-title banner + any other inline markup unique to this page, copied as-is -->
  <About />
  <InteractiveAccordion />
  <!-- "Lời Tri Ân" section, copied as-is -->
  <Footer />
  <Modals />
</BaseLayout>
```

- `index.html` → `src/pages/index.astro` (11 includes — largest page, do this one last after the pattern is validated on a simpler page).
- `complaints.html`, `privacy.html`, `regulations.html`, `terms.html` have no dedicated component — copy their inline body content directly into the corresponding `.astro` page file between `Header`/`Footer`.

Do pages in this order (simple → complex) to catch mistakes early: `terms` → `privacy` → `regulations` → `complaints` → `contact` → `applications` → `blog` → `services` → `rd` → `about` → `index`.

### 5. Migrate `app.js`
- Extract `CERTIFICATE_DB` and `SEARCH_ARTICLES` out of `app.js` into `src/data/certificates.json` and `src/data/articles.json`.
- Keep the rest of `app.js` (interactivity: nav toggle, accordion, modals, certificate lookup, search) as a plain script, imported in `BaseLayout.astro` via `<script src="../scripts/app.js"></script>` (Astro will bundle/hash it automatically), updated to `fetch`/`import` the JSON instead of using the inline constants.
- Do not rewrite the interactivity logic itself — only change how it sources its data. Preserve exact current UX behavior.

### 6. Assets
- Move `assets/` images into `src/assets/` where they're referenced by Astro components (enables Astro's built-in image optimization), or `public/assets/` if you want to keep them as flat untouched static files — prefer `src/assets/` + Astro's `<Image />` component for anything above ~200KB.
- **Priority fix:** `assets/banners/Qualimeal - Poster KV 120x120.jpg` is 26MB. Resize/compress to a web-appropriate size (target under 500KB, convert to WebP with JPG fallback if used as a visible banner) before or during migration — do not carry the 26MB file into the new repo history if avoidable.
- Convert `banner1.jpg`–`banner10.jpg` and other page banners to WebP (`.jpg` fallback optional via `<picture>` if broad compatibility matters).
- `assets/1b7d324d8ea3131eb03483e29a50e73a.pdf` and `assets/cfaff76db589b7b129be507eff5e0870.xlsx`: keep as downloadable static files in `public/`, no processing needed — but rename to something descriptive (their current names are opaque hashes) if referenced in UI copy/links.

### 7. Build & deploy config
- `package.json` scripts: `astro dev`, `astro build` (outputs to `dist/`), remove old `build`/`watch` scripts that call `build.js`; delete `build.js` once Astro build is verified to produce equivalent output.
- Add `.gitignore` entries: `dist/`, `.astro/`, `node_modules/`.
- `dist/` is what gets uploaded to Plesk (via Git deploy hook or manual FTP/rsync) — no Node process needs to run on the Plesk server itself since output is static.
- Do a full visual diff between old generated root `*.html` pages and new `astro build` output for every one of the 11 pages before considering migration done (screenshot compare or manual pass on desktop + mobile viewport).

### 8. Cleanup
- Remove old root-level generated `*.html` files, old `src/*.html`, `build.js`, `colors.css`/`styles.css` (now inside `src/styles/`) once Astro output is verified.
- Update `README`/`walkthrough.md` to describe the new Astro workflow (`npm run dev`, `npm run build`) instead of the old include-compiler.

---

## Non-goals (do not do this in the same pass)

- No visual/design changes — this is a structural migration only, pixel-for-pixel same output.
- No real backend/API for certificate lookup yet — stays as static JSON-driven mock, just relocated.
- No TypeScript conversion of `app.js` unless trivial.
- No CMS integration.

## Definition of done

- `npm run build` produces a `dist/` folder that, page-by-page, renders identically (visually and functionally: nav, accordion, modals, certificate lookup, search) to the current production site.
- Zero occurrences of `cdn.tailwindcss.com` in build output.
- No single image asset over ~500KB in `dist/`.
- `<head>` markup exists in exactly one source file (`BaseLayout.astro`).
