# Ingloo

Webpack-built static front-end (HTML, SCSS, vanilla JS). The checked-in variant lives under `src/US/`.

## Requirements

- Node.js 18+ (LTS recommended)
- npm 9+

## Setup

```bash
npm install
```

## Commands

| Command   | Description |
|-----------|-------------|
| `npm run dev` | Dev server with HMR at [http://localhost:9000](http://localhost:9000) |
| `npm run build` | Production build to `dist/` (inlined JS/CSS in HTML) |

The default project root is `src/US`. To build another folder that follows the same layout (`index.js`, `index.html`, `assets/`, `styles/`, `js/`), pass a webpack location:

```bash
npx webpack --mode production --env location=src/YOUR_VARIANT
```

## Deploy notes

`src/US/index.html` contains tracker placeholders such as `{trackingdomain}` and `{click.id}`. Replace or inject these in your hosting or CI pipeline so `fetch` and redirects target your real endpoints.

## Repo layout

- `src/US/` — US market source (`index.html`, `index.js`, `js/`, `styles/`, `assets/`)
- `webpack.config.js` — entry, copy, and production inline/minify behavior
- `dist/` — build output (ignored in git; regenerate with `npm run build`)
