# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm ci` — install dependencies
- `npm run dev` — start the Vite dev server
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build locally

There are no tests or linters configured.

## Architecture

Single-page animated landing site built with React 19, Vite, and framer-motion.

- `index.html` — entry point; loads the Manrope font from Google Fonts
- `src/main.jsx` — React root
- `src/App.jsx` — the whole page: a full-viewport hero for the "Forma Chair" furniture brand (nav, animated headline, lead + catalog button, floating product card) with framer-motion entrance animations and mouse parallax on the background
- `src/index.css` — all styles; CSS custom properties for the palette (dusty blue-grey background, lime accent) live in `:root`
- `src/assets/hero.png` — AI-generated hero/product photo, imported from `App.jsx` so Vite rewrites the URL

## Working with the user

- Always show the HTML/markup of any page changes directly in the chat response (the user wants to see the code, not just a description).

## Deployment

`.github/workflows/deploy.yml` builds with `vite build --base=/qiiip/` and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves at https://francisco586.github.io/qiiip/ (Pages source in repo settings: "Deploy from a branch" → `gh-pages`). It triggers on pushes to the branch named in its `on.push.branches` filter (plus manual `workflow_dispatch`), so update that filter when the deploy branch changes.
