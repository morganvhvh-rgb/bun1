---
name: drogue-feature-workflow
description: Implement and modify Daily Rogue features in this repository using the established React + Zustand + TypeScript architecture. Use when changing gameplay logic, state shape, symbol/enemy balance, UI panels/board/modals/hooks, animations, or mobile layout behavior so changes stay consistent, performant, and easy for future agents to maintain.
---

# Daily Rogue Feature Workflow

Follow this workflow in order for all feature work and refactors.

## 1) Honor project structure

- Keep strict separation of concerns:
  - `src/types/`: source of truth for data shapes and interfaces.
  - `src/lib/`: constants and pure helpers.
  - `src/store/`: central gameplay/state engine (Zustand + Immer).
  - `src/ui/`: visual layer only (panels/board/modals/shared/hooks).
- Keep `src/ui/GameShell.tsx` thin. Compose sections and modal wiring there; avoid packing it with gameplay logic.

## 2) Apply architecture sequence

- Implement in this order:
  - Update types in `src/types/`
  - Add or adjust constants/config in `src/lib/constants.ts`
  - Implement state/actions/selectors in `src/store/gameStore.ts`
  - Wire UI in `src/ui/` (components, hooks, modals, panels, board)
- Avoid introducing gameplay constants directly in UI files.

## 3) Preserve state-management invariants

- Keep game logic centralized in Zustand store actions/selectors.
- Use side-effect-safe immutable updates through Immer patterns already used in the store.
- If persisted state shape changes:
  - Bump `persist.version` in `src/store/gameStore.ts`
  - Add/adjust `migrate` logic so old saves still load safely.

## 4) Keep symbol system consistent

- When adding/removing/changing symbols or scrolls, update all relevant constant maps/lists in `src/lib/constants.ts`:
  - `SYMBOL_MAP`
  - `SYMBOL_KEYS`
  - `SYMBOL_THEME`
  - `SYMBOL_STATS`
  - `SYMBOL_CATEGORIES`
  - `SYMBOL_EXTRA_EFFECTS`
- Ensure related gameplay logic in `gameStore` matches the constant updates.

## 5) Keep enemy progression consistent

- All battle rounds live in `BATTLE_ROUNDS` in `src/lib/constants.ts`.
- Each entry is `{ e1, e2 }` with explicit `name`, `hp`, `atk`, `lvl`, `type` per enemy.
- `e2: null` = solo boss battle (second enemy hidden).
- Use the global enemy bonus helper in `src/lib/constants.ts` for broad stat passes before editing rows individually.
- To tune stats: edit the row in `BATTLE_ROUNDS`. No store changes needed.
- To add a round: append a new entry. Update `GAME_CONSTANTS.MAX_BATTLES` to match.
- To add a special ability (e.g. self-heal, double-attack): set `special: 'self-heal'` on the entry, then handle it in `src/ui/hooks/useBattleSequence.ts`.
- The `makeEnemy` helper in `gameStore.ts` converts a `BattleRoundEntry` into a full store enemy object — do not duplicate this logic.
- When changing progression flow, review this checklist together:
  - `BATTLE_ROUNDS`
  - `GAME_CONSTANTS.MAX_BATTLES`
  - `WAVE_REWARD_BATTLES`
  - `src/lib/battleProgression.ts`
  - `resetBattleTarget()` and `resetGame()` in `src/store/gameStore.ts`
  - `persist.version` and `migrate` if progression state or rewards changed

## 6) UI and mobile constraints

- Keep `GameShell` as an orchestrator, not a logic dump.
- Prefer direct `useGameStore(...)` selectors in components over prop drilling.
- Use shared primitives in `src/ui/shared/` (especially `Modal`) for consistency.
- Use `cn(...)` for conditional classes.
- Preserve mobile-first constraints in `src/index.css` and layout:
  - viewport lock and touch settings
  - design tokens (`var(--...)`) for sizing
  - `min-h-0`, `overflow-hidden`, and `shrink-0` boundaries to prevent row overflow.
- Keep bottom-fixed controls anchored with `mt-auto` and `shrink-0` when needed.

## 7) Animation split

- Use Framer Motion for high-level UI transitions (modals, panel transitions, reveals).
- Use GSAP/CSS for high-frequency effects or rapid sequence animation where React re-renders would be expensive.

## 8) Code hygiene

- Remove dead code and stale fields when features are dropped.
- If a feature is discarded, clean its types, constants, store logic, and UI.

## 9) Validate before handoff

- For larger, more complex, or higher-risk changes, run:
  - `bun run test`
  - `bun run lint`
  - `bun run build`
- For small, low-risk changes (for example minor copy edits or narrowly scoped tweaks), this validation step can be skipped.
- In handoff, summarize:
  - files changed
  - gameplay behavior changes
  - migration impact (if any)
  - known risks or follow-up work.
