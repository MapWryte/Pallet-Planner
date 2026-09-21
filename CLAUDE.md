# Pallet Layer Planner

Single-file HTML app — rectangle & circle packing calculator for boxes and
rolls, stacked layer by layer on a pallet, with baseboards/caps, corner
fillets, alignment, and a breakpoint/"magic numbers" sweep solver. All logic
is client-side JS embedded directly in `index.html`. No build step, no
bundler, no server-side code.

## Repo layout

```
index.html               — the entire app (HTML + CSS + JS, one file)
playwright.config.js     — Playwright config, loads index.html via file://
tests/helpers.js         — gotoApp() navigation helper
tests/pallet-planner.spec.js — the test suite
package.json / package-lock.json
.gitignore                — excludes node_modules/, test-results/, playwright-report/, desktop.ini
```

## Testing — a Playwright harness already exists here

**Do not scaffold a new test setup from scratch.** `playwright.config.js` and
`tests/` are already committed. Read `tests/pallet-planner.spec.js` before
writing new tests, both to match its style and to avoid duplicating existing
coverage.

Setup (only needed once per machine):
```powershell
npm install
npx playwright install chromium
```

Run tests:
```powershell
npx playwright test
```

The app is loaded via `file://` (see `tests/helpers.js` — `gotoApp()`), not a
dev server, since it's a single static file with no relative asset fetches.

## App internals worth knowing before editing or testing

- **State object** (`state` in the top-level IIFE): `pallet` (length/width/
  maxHeight, defaults 48/40/60), `layers[]` (seeded with two layers on load:
  a roll layer and a box layer), `selectedId`, `view` (`single`/`all`/
  `unique`), `sweepDim`, `solveDim`, `magicMode`, `editorTab`.
- **numField()** binds pallet/dimension `<input>` fields without ever
  rewriting the DOM node mid-keystroke (this is deliberate — it's what makes
  decimal entry work, e.g. typing a trailing "."). Values only normalize/
  clamp on `blur`, falling back to the last valid value if the typed value
  doesn't parse or is below the field's configured `min`. Each field has its
  own `dp` (decimal places) and `min` passed at bind time — check
  `bindPalletInputs()` for the pallet fields' exact options before writing a
  test that asserts a specific formatted value.
- **Packing math is a heuristic, not an exhaustive solver** — `packBoxAuto`
  tries a fixed set of grid/hybrid orientations and keeps the best count
  found; true optimal irregular rectangle packing is NP-hard. Don't "fix" a
  suboptimal-looking count without checking whether it's actually within the
  heuristic's known behavior.
- **Layer rows**: `#layerList .layer-row`, with `.active` marking the
  selected layer and `.nm` holding the display name.
- **View tabs**: `.view-tabs button[data-view="single|all|unique"]`, active
  tab marked with `.on`.

## Conventions

- Don't rename working variables or introduce new ones unprompted — match
  existing naming/structure when editing `index.html`.
- Keep test selectors matched to the actual DOM (`#palletLength`,
  `#btnAddLayer`, `.layer-row`, etc.) rather than inventing new hooks — the
  app wasn't built with test IDs in mind, so tests target real production
  selectors.
