# AGENTS.md

Persian-language interactive periodic table. Static site (no build, no package manager, no tests), served from `periodic.arash-hatami.ir` (see `CNAME`). See [README.md](README.md) for overview and structure.

## Run / preview

Open `index.html` directly, or `python3 -m http.server` in the repo root. No build or lint step.

## Layout

- `index.html`: small page shell. The table, legend and dialog are rendered by JS.
- `assets/js/data/elements.js`: **single source of truth** for all 118 elements. Edit data here, not in HTML.
- `assets/js/data/categories.js`: category keys + Persian labels. Colours live in `assets/css/tokens.css`.
- `assets/js/{utils,table,detail,app}.js`: plain scripts sharing the `window.PT` namespace (no ES modules, so `file://` keeps working). Load order in `index.html` matters.
- `assets/css/`: `tokens` (themes/colours) → `base` → `layout` → `table` → `detail`.
- `assets/icons/`, `assets/img/`, `assets/fonts/` (self-hosted Vazirmatn), `docs/` (screenshots, og image). Only `favicon.ico`, `CNAME` and `index.html` live at the root.

## Conventions and pitfalls

- Page is RTL/Persian (`<html lang="fa" dir="rtl">`), but the table grid is forced `dir="ltr"` so H stays top-left. Keep user-facing text in Persian; use `PT.toPersianDigits` for numbers.
- Grid position is derived from `group`/`period` (`PT.describe`); lanthanoids/actinoids have `group: null` and go to rows 9–10.
- `shells` in element data must sum to `number`.
- Sizes in `table.css` use container units (`cqw`) relative to `.periodic-table`; don't use `vw` inside cells.
- Theme: `data-theme` on `<html>` (set by `theme-init.js` / toggle) overrides `prefers-color-scheme`; any new colour token must be defined for both (the `:root:not([data-theme])` media block duplicates the light tokens).
- Use relative asset paths in `index.html`; absolute paths are only used inside the web manifest/browserconfig.
- Files use LF (`.gitattributes`), 2-space indentation.
