# AGENTS.md

Static portfolio site, no build step (`index.html`, `styles.css`, `aurora.css`, `main.js`).
Deploys via GitHub Pages from `main` (live ~30s after push). Vercel is NOT connected.

## Design (since 2026-10-04)

- The look is the **Aurora theme layer** in `aurora.css`, loaded after `styles.css` and overriding it.
  `styles.css` still holds the layout and the older "Instrument" design underneath; removing the
  `aurora.css` link in `index.html` restores that look.
- What Aurora does: three curtains of blue light sway behind the hero (the three `<span>`s inside
  `.atmosphere`), the lit rim of a planet rises under the hero (`.hero::before`), cards light their
  border under the cursor (uses the `--mx` / `--my` that `main.js` already sets), and featured cards
  carry a travelling beam on the top edge.
- One accent, cobalt `#84b4ff`. `--green` is set to the same value, so do not reintroduce a second accent.
- Display type is **Newsreader** (self-hosted, OFL, `assets/fonts/`); body is Mona Sans. Anthropic Serif
  was previewed and liked but is Anthropic's proprietary typeface, so it must not be committed here.
- The hero is one centered stack: status pill, round portrait, name, cycling role line, role caption,
  bio, buttons. `.hero-main` and `.hero-aside` use `display: contents` so the children can be ordered.
- A full-width project card uses the class `card--wide`.

## Workflow rules

- **Always preview in the browser after making site updates.** Serve the repo locally
  (e.g. `python3 -m http.server <port>` from the repo root) and `open http://localhost:<port>`
  so the user can review. Do this without being asked, right after edits are done.
- **Never use em dashes** in site copy or any content written for the user. Rewrite with
  commas, periods, colons, or parentheses instead.
- If you touch `styles.css`, `aurora.css`, or `main.js`, bump that file's cache-bust `?v=` query string in `index.html`.
- Keep the hero bio to one short sentence. The hero is a centered stack and a long bio pushes the
  buttons below the fold.
- Don't add sections that duplicate existing ones (a tools/stack strip was added 2026-07-18
  and removed the same day for duplicating the Skills section).
- Positioning: evals are one proof point, not the page's organizing idea. Keep them where they are
  literally true (the GTM Agent card, the Together AI bullets, the skills list). The proof block on
  every project card is labeled "How it's verified", because most of those proofs are tests or checks,
  not evals. Don't overstate revenue proof.
- Every work claim must match the verified resume files (the dated resumes and `writing-context.md`
  in `~/os/resume/`). Copy their wording; never upgrade it ("supporting" stays "supporting").
- This repo is public, and so is this file. Keep job-search strategy, application data, and anything
  unverified out of it. The private playbook (taste, positioning evidence, process, tooling) is
  `~/os/career/portfolio/PLAYBOOK.md`.
- New sections: class `reveal`, but no `id` unless a matching nav link is added
  (`main.js` tracks `main section[id]`).

## Access

- Work GitHub account `roman-licursi` was invited with **write** access on 2026-07-18
  (pending acceptance at https://github.com/romanlicursi/romanlicursi.github.io/invitations).
  Personal account `romanlicursi` is admin. Deploy = push to `main`; no Vercel involvement.

## Where we left off (2026-10-04, role-fit pass)

- Reworked the copy for the roles Roman applies to most: the status line names those lanes; the
  positioning sub-line says how he works with sales, finance and legal and names three builds; the
  headline stats are 26x, the 36% undercount fix, and +7.5pp; the Together AI bullets follow the
  resume plus the evaluation harness and the stakeholder demo app from `writing-context.md`; the GTM
  Agent card leads with what the agent does; the Clay card is restored; education shows
  "Expected Dec 2026"; the title is "GTM Systems Intern".
- Considered and rejected: a keyword-only "Solutions and delivery" skills group (low signal), and
  copying the resume bullets word for word (the page should add depth the resume lacks).
- Project blocks (`.projects-grid`, `.projects-featured`) are separate grids; `aurora.css` gives
  neighbors a 20px gap.

## Where we left off (2026-10-04)

- Shipped the Aurora theme (above) and synced the page with the 2026-09-30 resume in `~/os/resume/`:
  four more Together AI bullets (ABM app, dashboards and MQL model, Ironclad CLM, Revenue Cloud CPQ),
  CAUHEC now ends Aug 2026 with "targeting sub-5% bounce", Roger ends Apr 2026, a Claude Code in Action
  certificate, an Ironclad CLM skill tag, DECA in the leadership line, and a new
  "Autonomous Job Discovery System" project card. The Resume button now serves the 2026-09-30 PDF
  under the same file name.
- Removed at Roman's request: the Clay Campus Ambassador experience entry and the
  "B.S. Computer Science, UW-Madison" line under the portrait.
- The three open questions from this pass (title wording, the retired Clay card, the missing
  graduation date) were settled in the role-fit pass above.

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
