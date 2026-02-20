# DRogue Architecture & Agent Workflow

Welcome, AI Agent. This project has graduated from its prototype phase into a structured, scalable application. We are committed to a clean architecture using React, Zustand, and TypeScript. 

Your fundamental goal is to maintain clean code and adhere to the established architecture, so that the AI coding ecosystem around this project remains efficient and confusion-free.

## 1. PROJECT STRUCTURE
We enforce a strict separation of concerns to keep the codebase maintainable:

* **`src/types/`** (e.g., `game.ts`): **TypeScript Definitions**. The source of truth for all game data structures and interfaces.
* **`src/lib/`** (e.g., `constants.ts`, `utils.ts`): **Constants & Helpers**. All magic numbers, balancing variables, grid configurations, and pure helper functions (like `cn()`) live here.
* **`src/store/`** (e.g., `gameStore.ts`): **State Management**. All game logic, state mutations, and the core "engine" are centralized in Zustand.
* **`src/ui/`**: **Visual Components**. React components should be purely presentational ("dumb"). They read state and dispatch actions, but never compute complex game logic.

## 2. THE AGENT WORKFLOW (CRITICAL)
Whenever you are adding, modifying, or removing a feature, you must follow this sequence to maintain system integrity:

1. **Update Types**: Start in `src/types/` to define the shape of your new data.
2. **Set Constants**: Place any new configuration values, defaults, or magic numbers in `src/lib/constants.ts`. Do not hardcode numbers in components or the store.
3. **Implement Logic**: Add your state variables and mutation functions into `src/store/gameStore.ts`. Ensure clean, side-effect-free updates (we use Zustand + Immer).
4. **Wire the UI**: Finally, build or update components side in `src/ui/`, connecting them to the store values and actions you just created.

## 3. UI & COMPONENT PRINCIPLES
* **The Slot Pattern**: UI components must remain completely decoupled from the underlying math.
  * *Bad:* `<Enemy />` calculates its own health based on incoming damage props.
  * *Good:* `<Enemy health={store.enemyHealth} onHit={() => store.processAttack()} />`
* **Styling**: Always use the `cn(...)` utility (`clsx` + `tailwind-merge`) for conditional classes. Never use template literals for dynamic class combinations.
* **Mobile-First**: The game mimics a native app. Keep viewport constraints (`dvh`) and gesture lockdowns (`touch-action: manipulation`, `user-select: none`) intact for all interactive UI layers.

## 4. ANIMATION STRATEGY
* **Framer Motion**: Use exclusively for high-level UI transitions (Menus, Modals, Toasts).
* **GSAP / CSS**: Use for high-frequency Game Loop updates, particle effects, or rapid sequencing to prevent React render saturation.

## 5. CODE HYGIENE
Keep files well-scoped and clean up after yourself. If an idea or feature is discarded, fully purge its types, constants, state logic, and UI components to prevent technical debt. Keep things predictable for the next agent that reads this.