# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Selected direction

- The user selected the light “Atlas Observatory” concept (`source-option-1.png`) as the visual source of truth.
- Preserve its navy, cobalt, sea-glass, and ivory design language; the world map is the dominant surface.
- Optimize the full product for desktop, portrait/vertical screens, and touch-first mobile layouts.
- The data manager is a separate `/admin` route with a simple, case-sensitive initial password of `BOCI`.
- The design catalogue is sourced from the World Nuclear Association SMR Design Database and currently contains all 133 records from its 1 July 2026 update.
- Treat catalogue coordinates as developer-headquarters locations, never as reactor project sites; label them explicitly on the map and in design details.
