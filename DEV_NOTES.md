# DRogue Architecture & Agent Workflow

Welcome, AI Agent. This project has graduated from its prototype phase into a structured, scalable application. We are committed to a clean architecture using React, Zustand, and TypeScript. 

Your fundamental goal is to maintain clean code and adhere to the established architecture, so that the AI coding ecosystem around this project remains efficient and confusion-free.

## 1. PROJECT STRUCTURE
We enforce a strict separation of concerns to keep the codebase maintainable:

* **`src/types/`** (e.g., `game.ts`): **TypeScript Definitions**. The source of truth for all game data structures and interfaces.
* **`src/lib/`** (e.g., `constants.ts`, `utils.ts`): **Constants & Helpers**. All magic numbers, balancing variables, grid configurations, and pure helper functions (like `cn()`) live here.
* **`src/store/`** (e.g., `gameStore.ts`): **State Management**. All game logic, state mutations, and the core "engine" are centralized in Zustand.
* **`src/ui/`**: **Visual Components**. Organized into sub-directories:
  * **`shared/`** — Reusable primitives (`Icon`, `Modal`, `StatLine`)
  * **`panels/`** — Top-half panels (`HeroPanel`, `EnemyPanel`)
  * **`board/`** — Bottom-half components (`GridBoard`, `Inventory`, `Controls`)
  * **`modals/`** — Popup/modal components (`CharacterModal`, `ScrollBuyModal`, `ScrollsModal`, `ConjureModal`)
  * **`hooks/`** — UI-local custom hooks (`useBattleSequence`, `useGridInteraction`, `useScrollFlow`)
  * **`GameShell.tsx`** — Thin orchestrator that composes panels, board, modals, and hooks
  * **`animations.ts`** — Framer Motion variant definitions

## 2. THE AGENT WORKFLOW (CRITICAL)
Whenever you are adding, modifying, or removing a feature, you must follow this sequence to maintain system integrity:

1. **Update Types**: Start in `src/types/` to define the shape of your new data.
2. **Set Constants**: Place any new configuration values, defaults, or magic numbers in `src/lib/constants.ts`. Do not hardcode numbers in components or the store.
3. **Implement Logic**: Add your state variables and mutation functions into `src/store/gameStore.ts`. Ensure clean, side-effect-free updates (we use Zustand + Immer).
4. **Wire the UI**: Finally, build or update components in the appropriate `src/ui/` subdirectory, connecting them to the store values and actions you just created.

## 3. UI & COMPONENT PRINCIPLES
* **Direct Store Reads**: Components read state directly from `useGameStore()` selectors instead of receiving 15+ props drilled from a parent. This keeps components self-contained and easy for agents to understand in isolation.
* **Decomposed State**: UI-local state lives in dedicated hooks (`useGridInteraction`, `useScrollFlow`) rather than concentrated in one file. `GameShell.tsx` only holds modal open/close state.
* **Shared Modal Pattern**: All modals extend `shared/Modal.tsx` which provides consistent overlay, enter/exit animation, and close behavior in three positions (`center`, `top`, `bottom`).
* **Design Tokens**: All responsive sizing flows from CSS custom properties in `index.css` (`--cell`, `--cell-sm`, `--gap`, `--text-xs`, etc.). Components reference these via `var()` — never use inline `clamp()`.
* **CSS Grid Layout**: The root `#root` element uses a CSS Grid (`grid-template-rows: var(--header-h) 2fr 3fr`) to define the header / battle / board layout.
* **Strict Flex Boundaries**: Because `#root` CSS Grid divides the screen rigidly, internal flex components (like Panels) MUST respect dynamic vertical bounds on small screens. Use `flex-1`, `overflow-hidden`, and `min-h-0` aggressively on flex children to prevent them from blowing out their grid row boundaries. Avoid large hardcoded minimum heights or huge structural paddings that force overflow.
* **Anchor Bottom UI**: Statically sized elements at the bottom of dynamic panels (like the Engage Button or Gold Counter) should use `mt-auto` and `shrink-0` to guarantee they anchor safely to the bottom boundary without clipping.
* **Styling**: Always use the `cn(...)` utility (`clsx` + `tailwind-merge`) for conditional classes. Never use template literals for dynamic class combinations.
* **Mobile-First**: The game mimics a native app. Keep viewport constraints (`dvh`) and gesture lockdowns (`touch-action: manipulation`, `user-select: none`) intact for all interactive UI layers.

## 4. ANIMATION STRATEGY
* **Framer Motion**: Use exclusively for high-level UI transitions (Menus, Modals, Toasts).
* **GSAP / CSS**: Use for high-frequency Game Loop updates, particle effects, or rapid sequencing to prevent React render saturation.

## 5. CODE HYGIENE
Keep files well-scoped and clean up after yourself. If an idea or feature is discarded, fully purge its types, constants, state logic, and UI components to prevent technical debt. Keep things predictable for the next agent that reads this.