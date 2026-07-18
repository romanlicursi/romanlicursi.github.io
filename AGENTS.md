# AGENTS.md

Static portfolio site, no build step (`index.html`, `styles.css`, `main.js`).
Deploys via GitHub Pages from `main`.

## Workflow rules

- **Always preview in the browser after making site updates.** Serve the repo locally
  (e.g. `python3 -m http.server <port>` from the repo root) and `open http://localhost:<port>`
  so the user can review. Do this without being asked, right after edits are done.
- **Never use em dashes** in site copy or any content written for the user. Rewrite with
  commas, periods, colons, or parentheses instead.
- If you touch `styles.css` or `main.js`, bump the cache-bust `?v=` query strings in `index.html`.
