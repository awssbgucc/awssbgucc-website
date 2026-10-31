# AWS SBG UCC website: starter pack

Specs and assets for Claude Code to build the group website and admin dashboard.

## How to use

1. Create an empty repo and copy everything in this folder into it.
2. Fill in what you can from the "Open questions" list in `tasks/todo.md`.
3. Open Claude Code in the repo and paste the Phase 0 prompt from `BUILD_PROMPT.md`.
4. Review the plan it writes to `tasks/todo.md`, answer its questions, then run one phase at a time.

## What is here

| Path | Purpose |
|---|---|
| `CLAUDE.md` | Rules Claude Code reads every session: stack, writing rules, workflow |
| `BUILD_PROMPT.md` | Seven phases, each with its own prompt and done criteria |
| `docs/DESIGN.md` | Tokens, type, components, pixel map spec |
| `docs/CONTENT.md` | All v1 copy and seed data |
| `docs/ADMIN.md` | Dashboard scope, Prisma schema, auth, uploads |
| `docs/COMPLIANCE.md` | AWS brand and trademark rules for the site |
| `assets/pixel-map/` | Ghana pixel grid with Cape Coast marked, plus target previews |
| `assets/pixel-art/` | UCC crest and SBG chip pixel grids, plus previews |
| `scripts/check-copy.mjs` | Fails on em dashes, en dashes, emojis and banned phrases |
| `scripts/generate-pixel-map.mjs` | Rebuilds the Ghana grid at another density |
| `scripts/pixelate-image.py` | Turns any image into a pixel grid, for future pixel art |
| `tasks/` | Plan and lessons files |
