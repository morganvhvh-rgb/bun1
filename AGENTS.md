# Project Agent Notes

- `SKILL.md` is the canonical project workflow and architecture guidance for this repository.
- Read `SKILL.md` before implementing any code changes.
- Use Bun as the default package manager/runtime for this repository.
- Before claiming Bun is missing, verify with:
  - `Get-Command bun`
  - `bun --version`
- Prefer `bun install`, `bun run <script>`, and `bunx`.
- Do not suggest npm/yarn/pnpm unless the user explicitly asks.
