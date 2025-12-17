# Stash Reels

A front-end only Stash view that turns markers into a vertically scrolling, Instagram-style reels feed. The UI loads your markers through the Stash GraphQL endpoint, auto-plays each marker as it snaps into view, and progressively loads more entries as you near the end of the list.

## Features

- Full screen scroll container with scroll snap so one marker fills the viewport at a time
- Auto-play/pause logic based on intersection with the viewport, with optional global mute toggle
- Fetches markers directly from the Stash GraphQL API at `/graphql` (change `REELS_CONFIG` in `src/App.tsx` if you need a different server)
- Preloads additional batches when you scroll near the end of the feed and provides quick refresh/reset controls
- Glowing overlay that surfaces marker metadata (primary tag, timestamp, performers, studio, tags, scene shortcut)

## Getting started

```bash
npm install
npm run dev
```

The UI runs on Vite. `npm run dev` starts the dev server on the default Vite port (usually `5173`). When you are ready to ship the plugin, build the static assets and serve the `dist/` directory via any HTTP server that Stash can reach:

```bash
npm run build
```

## Connecting to Stash

1. Deploy the bundled assets (for example, host `dist/` on the same domain as Stash or on a reverse-proxied subdomain).
2. In Stash, add a plugin page that points to the hosted URL.
3. Make sure the host serving the plugin can see Stash at `/graphql` (same origin or via a reverse proxy). If the API lives elsewhere, update `REELS_CONFIG` in `src/App.tsx` before building.

> **Tip:** If your plugin page is hosted on the same origin as Stash the credentials are automatically included when hitting `/graphql`. When serving from another origin, expose the GraphQL endpoint via a reverse proxy that forwards cookies and adds the required CORS headers, or provide an API key so the plugin can authenticate without cookies.

## Customising the feed

`REELS_CONFIG` in `src/App.tsx` holds the paging, sorting, tag and performer filters shipped with this build. Adjust those values (or surface a UI) if you want to tweak the feed composition. For local development the Vite dev server proxies `/graphql` to `http://192.168.1.11:9777/graphql` (see `vite.config.ts`). Update `STASH_HOST` there if your instance runs elsewhere.

## Surfacing the reels view as a Stash tab

Stash loads front-end plugins by reading a `.yml` manifest with the structure described in the [official plugin manual](https://docs.stashapp.cc/in-app-manual/plugins/#creating-plugins). This repo ships a drop-in plugin modeled after the [stashgifs](https://github.com/evolite/stashgifs) reference:

- `plugin/stash-reels.yml` – manifest that exposes the bundled assets and JavaScript helper.
- `plugin/stash-reels.mjs` – lightweight script that appends a **Reels** button to the main navigation row (next to Scenes/Markers/etc) and links it to the packaged UI.
- `plugin/assets/app/` – output directory for the Vite build (populated via `npm run build`).

To update/install:

1. Run `npm run build` so `plugin/assets/app` is refreshed with the latest bundle.
2. Copy the entire `plugin/` directory (or create a symlink) into your Stash `plugins` folder.
3. Reload Stash. A **Reels** icon now appears in the top navigation—clicking it opens the reels interface served directly from `/plugin/stash-reels/assets/app/` on the same origin, so GraphQL calls continue to work without extra configuration.

## Development notes

- `src/api/stash.ts` contains the GraphQL query and helpers for mapping marker media URLs.
- `src/hooks/useMarkerFeed.ts` manages paging, caching, and exposes `loadMore`/`refresh` actions used by the `ReelFeed` component.
- `src/components/ReelCard.tsx` handles scroll snap activation, playback, and metadata overlay rendering.
- Styling lives in `src/App.css`; it uses CSS scroll snap and glassmorphism overlays for the reels layout.

If you need additional filters (studios, performers, marker titles, etc.) extend the form in `src/App.tsx` and update the filter object passed into `fetchMarkers`.
