# ARKLINE Developments — Decking Quote Quiz Funnel

A mobile-first, one-question-per-screen quiz funnel that collects free decking quote enquiries for **ARKLINE Developments** (Stourbridge and surrounding areas). Built with React 19, Vite 8, Tailwind CSS 4 and a small Express API.

> For architecture, design tokens, analytics hooks and hosting notes, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Motion, Lucide icons
- **Build tool:** Vite 8
- **Backend:** Express 4 (served via `tsx` in development), with Vite running in middleware mode

## Requirements

- **Node.js 20.19+ or 22.12+** (Vite 8 does not run on older versions)
- npm

If you use nvm:

```bash
nvm install 22
nvm use 22
```

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

The app runs at **http://localhost:3000** (override with the `PORT` env variable).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express server with Vite dev middleware (HMR) |
| `npm run build` | Builds the production frontend into `dist/` |
| `npm start` | Runs the server (set `NODE_ENV=production` to serve `dist/`) |
| `npm run preview` | Previews the Vite production build |
| `npm run lint` | Type-checks with `tsc --noEmit` |
| `npm run clean` | Removes `dist/` and `server.js` |

## Environment Variables

See [.env.example](./.env.example).

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini API key (only needed if Gemini features are used) |
| `APP_URL` | URL where the app is hosted |
| `PORT` | Optional. Server port, defaults to `3000` |
| `DISABLE_HMR` | Optional. Set to `true` to disable Vite HMR |

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/quote-request` | Submits a quote enquiry (validated, honeypot-protected, rate-limited) |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/quote-submissions` | Lists submissions held in memory (testing/admin) |

**Quote request fields:** `gardenOption`, `postcode`, `timeframe`, `callTime`, `fullName`, `phone`, `honeypot`, `utm`, `pageUrl`.

> [!WARNING]
> Submissions are stored **in memory only** and are lost on restart. `/api/quote-submissions` is unauthenticated and exposes customer details. Connect a persistent store (CRM, Zapier, database) and protect or remove this route before going live.

## Project Structure

```
├── server.ts          # Express API + Vite middleware / static hosting
├── index.html         # App entry HTML
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/    # Quiz UI components
│   ├── config/        # Central quiz config (deckingQuoteConfig.ts)
│   ├── types/
│   └── utils/         # Measurement / analytics hooks
└── DEPLOYMENT.md      # Architecture & hosting guide
```

## Production

```bash
npm run build
NODE_ENV=production npm start
```

## Troubleshooting

- **`styleText` is not exported from `node:util`:** your Node version is too old. Switch to Node 22 (`nvm use 22`).
- **`Cannot find native binding` (rolldown):** delete `node_modules` and `package-lock.json`, then run `npm install` again.
- **`ERESOLVE` esbuild conflict:** Vite 8 needs `esbuild` `^0.27` or `^0.28`; this project uses `^0.28.0`.
