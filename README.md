# The Ultimate Book Tracker

Your personal Netflix for books — a beautiful, private, offline digital library and reading journal.

[![Deploy to GitHub Pages](https://github.com/muhammadabd778899-glitch/ultimate-book-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/muhammadabd778899-glitch/ultimate-book-tracker/actions/workflows/deploy.yml)

**Live demo:** https://muhammadabd778899-glitch.github.io/ultimate-book-tracker/

---

## Overview

The Ultimate Book Tracker is a premium, Netflix-inspired personal digital library and reading journal. It helps readers organize their books, manage reading plans, track progress, record reviews and quotes, explore reading history, and celebrate reading achievements — all entirely offline and private.

Data is stored locally in your browser via IndexedDB. Nothing is uploaded to a server, and no account is required.

## Features

- **Home / Discover** — Cinematic hero section, personalized shelves (Continue Reading, Recently Added, Favorites, Highest Rated, etc.), quick stats, and quick actions.
- **My Library** — Cover grid, compact list, and book-spine views with search, filters, sorting, and bulk operations.
- **Add / Edit Book** — Polished book entry form with validation, cover upload, author management, and duplicate-safe editing.
- **Book Detail** — Immersive editorial layout with Overview, Reading Progress, Journal, Quotes, Notes, Reviews, and Reading History tabs.
- **Reading Tracker** — Move books between statuses (Want to Read → Currently Reading → Finished / On Hold / Did Not Finish).
- **Reading Timer & Sessions** — Start, pause, resume, and finish reading sessions; manual session entry.
- **TBR / Reading Queue** — Prioritized to-be-read list with a random next-read selector.
- **Wishlist** — Track books you want to buy, with estimated cost and purchase status.
- **Series Tracker** — Manage series, reading order, owned/read volumes, and completion percentage.
- **Bookshelves & Collections** — Custom shelves with cover-based and spine styles, colors, and icons.
- **Reading Journal** — Reviews, reflections, quotes, and notes.
- **Reading Goals & Challenges** — Annual and custom goals with progress tracking and achievements.
- **Smart Reading Calendar** — Monthly view of reading sessions, start/finish dates, and streaks.
- **Statistics & Analytics** — Real charts (Recharts) for books per month, pages, genre breakdown, rating distribution, status breakdown, and more.
- **Year in Books** — Beautiful annual recap with milestones, book of the year, and print support.
- **Settings** — Appearance, data management (export/import backup, CSV), storage usage, and privacy info.
- **Offline-First (PWA)** — Service worker caches the app shell and assets; works fully offline after the first visit.
- **Import / Export** — Versioned JSON backups with restore (replace or merge), CSV import/export.

## Technology Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router** (client-side routing)
- **Dexie.js** (IndexedDB abstraction)
- **Recharts** (analytics charts)
- **Lucide React** (icons)
- **React Hot Toast** (notifications)
- **Vitest** + **React Testing Library** (tests)
- **Vite PWA** (service worker & manifest)
- **GitHub Pages** + **GitHub Actions** (deployment)

## Local Development

```bash
# Clone the repository
git clone https://github.com/muhammadabd778899-glitch/ultimate-book-tracker.git
cd ultimate-book-tracker

# Install dependencies
npm install

# Start the dev server (serves at http://localhost:5173)
npm run dev

# Build for production (GitHub Pages subpath /ultimate-book-tracker/)
npm run build

# Preview the production build locally
npm run preview

# Run tests
npm test
```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_BASE_PATH` | `/ultimate-book-tracker/` | Base path for asset loading (set automatically in production). |

## GitHub Pages Deployment

The application is deployed automatically to GitHub Pages via GitHub Actions on every push to `main`.

1. Push to `main` triggers the build and deploy workflow.
2. The workflow builds the Vite production bundle (base path `/ultimate-book-tracker/`).
3. The `dist` folder is uploaded as a Pages artifact and deployed.
4. The published URL: `https://muhammadabd778899-glitch.github.io/ultimate-book-tracker/`

### Manual deployment steps (if automation is unavailable)

```bash
npm install
npm run build
# The deployable site is in ./dist
# Publish the contents of ./dist to your GitHub Pages branch
```

### GitHub Pages configuration

- Source: GitHub Actions (via `actions/deploy-pages`)
- Base path: `/ultimate-book-tracker/` (configured in `vite.config.ts`)
- SPA routing: `public/_redirects` and `public/404.html` handle nested-route refreshes.

## Offline Usage

1. Open the site online at least once (to cache the app shell and assets via the service worker).
2. After the service worker activates, you can use the app fully offline: add books, upload covers, log reading sessions, save reviews, view statistics, and export backups.
3. All data persists in IndexedDB across reloads.

> Browser storage can be cleared by you or the browser. Export regular backups from **Settings → Data Management**.

## Data Backup

- **Export backup:** Settings → Data Management → Export Backup (downloads a versioned JSON file including books, covers, reviews, quotes, sessions, shelves, goals, and preferences).
- **Import backup:** Choose a previously exported JSON file to restore (replace or merge modes).
- **CSV:** Import/export book lists with flexible column mapping.

## Sample (Demo) Data

On first run, you can choose to explore a curated demo library of ~40 fictional books with original cover artwork, ratings, reviews, quotes, series, shelves, and goals. Demo data is removable and never mixed with your personal records.

## Project Structure

```
ultimate-book-tracker/
├── public/                # Static assets (icons, 404.html, _redirects)
├── src/
│   ├── db.ts              # Dexie IndexedDB schema & migrations
│   ├── seed.ts            # Demo data + original SVG cover art
│   ├── lib/utils.ts       # cn() helper
│   ├── utils/             # date, cover, export utilities
│   ├── components/ui/     # Reusable UI primitives
│   ├── components/layout/ # Navbar
│   ├── features/          # Pages (home, library, books, reading, ...)
│   ├── hooks/             # (reactive data hooks)
│   └── main.tsx / App.tsx # Entry & routing
├── tests/                 # Vitest + React Testing Library tests
├── .github/workflows/     # CI/CD deployment
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Known Limitations

- Data is stored in browser IndexedDB/localStorage; clearing site data will erase your library unless you have a backup. Export backups regularly.
- Browser storage quotas apply (typically hundreds of MB); very large cover collections may approach limits.
- Cover images are stored as data URLs in IndexedDB (no remote image hosting).
- GitHub Pages static hosting means no backend; all features are client-side.

## License

MIT
