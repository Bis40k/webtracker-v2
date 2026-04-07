# WebTracker (Clean V2)

WebTracker is a Vite + React + TypeScript app for beacon tracking dashboards, map view, history, and settings.

This V2 version is cleaned from Blink-specific integration and runs as a standalone frontend:
- local auth state in `localStorage`
- local beacon/history storage in `localStorage`
- local realtime event bus via `BroadcastChannel`

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- TanStack Router + React Query
- Leaflet (`react-leaflet`)

## Run Locally

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:3000`

## Scripts

```bash
npm run dev         # start local dev server
npm run build       # production build
npm run preview     # preview production build
npm run lint:types  # TypeScript check
```

## Notes

- The Netlify function `functions/gps-update.ts` is provider-neutral and currently returns a validated stub response.
- You can connect this function to any backend/database provider without changing the UI pages.
- CI runs on GitHub Actions for every push and pull request.