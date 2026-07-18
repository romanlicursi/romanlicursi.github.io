# AGENTS.md

Static portfolio site, no build step (`index.html`, `styles.css`, `main.js`).
Deploys via GitHub Pages from `main` (live ~30s after push). Vercel is NOT connected.

## Workflow rules

- **Always preview in the browser after making site updates.** Serve the repo locally
  (e.g. `python3 -m http.server <port>` from the repo root) and `open http://localhost:<port>`
  so the user can review. Do this without being asked, right after edits are done.
- **Never use em dashes** in site copy or any content written for the user. Rewrite with
  commas, periods, colons, or parentheses instead.
- If you touch `styles.css` or `main.js`, bump the cache-bust `?v=` query strings in `index.html`.
- Keep the hero bio short and hard-wrapped (it currently uses a `<br>`); long hero text runs
  under the portrait photo. Don't let hero text go full-width.
- Don't add sections that duplicate existing ones (a tools/stack strip was added 2026-07-18
  and removed the same day for duplicating the Skills section).
- Positioning claims: evals are the proven claim; revenue framing is "ultimately in revenue".
  Don't overstate revenue proof.
- New sections: class `reveal`, but no `id` unless a matching nav link is added
  (`main.js` tracks `main section[id]`).

## Access

- Work GitHub account `roman-licursi` was invited with **write** access on 2026-07-18
  (pending acceptance at https://github.com/romanlicursi/romanlicursi.github.io/invitations).
  Personal account `romanlicursi` is admin. Deploy = push to `main`; no Vercel involvement.

## Where we left off (2026-07-18)

- Shipped and live (commit `8105730`): positioning statement section after the marquee;
  featured evals case-study card "Proving a Production Answer Engine Works" (Together AI);
  "How I know it works" (`.project-proof`) blocks on all 5 project cards; skills tags
  (Context Engineering, Error Analysis / LLM-as-Judge, Agent Observability); marquee terms.
- Hero bio: "I build production AI agents and revenue systems for GTM teams,<br>and I can
  prove they work with evals." Sub-line: "...prove they work through evals and ultimately
  in revenue." Both are approved copy; don't regress them.
- Next step (pending): run the work-machine prompt at
  `~/Projects/together-ai-portfolio-prompt.md` (not in this repo) from the Together AI
  computer to enrich the Together AI experience bullets and the evals card with verified,
  non-confidential detail.
- Future/out of scope so far: PodBot eval harness spec; evals coursework (Anthropic prompt
  evaluations course, Hamel evals FAQ).
