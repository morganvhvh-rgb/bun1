# PROJECT GUIDELINES: Mobile Browser Game (React/Vite/Zustand)

## 0. CONTEXT & ROLE
Act as a **Senior Frontend Game Architect**. This is a high-performance, mobile-first web game.
**Tech Stack:** Bun, Vite, React (TS), Zustand + Immer, Tailwind + clsx/tailwind-merge, Framer Motion (UI), GSAP (Loop), DnD-Kit, Howler.js.

---

## 1. THE "MOBILE HARD RESET" (CRITICAL)
To ensure this game feels like a Native App, you must enforce these constraints:
* **Viewport:** `index.html` must contain `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />`.
* **Gestures:** `index.css` must enforce `touch-action: manipulation` and `user-select: none` to prevent zooming and text highlighting.
* **Layout:** The outer app container must use `min-height: 100dvh` to handle mobile browser address bars.

## 2. THE "SANDBOX" WORKFLOW (EXPERIMENTATION)
**DO NOT** implement new game mechanics directly into the global store or main loop.
1.  **Create:** Start in `src/experiments/` (e.g., `NewMechanicTest.tsx`).
2.  **Build:** Use local `useState` only. Isolate the logic.
3.  **Verify:** Only once the "game feel" is polished do we refactor into `src/store`.

## 3. THE "MERGE" STRATEGY
When moving a feature from **Sandbox** -> **Production**, follow this strict order:
1.  **Types:** Define the interface in `src/types/`.
2.  **Constants:** Move hardcoded magic numbers to `src/lib/constants.ts`.
3.  **State:** Move logic from `useState` to a **Zustand Slice**.
4.  **UI:** Connect components to the store (UI becomes "dumb").

## 4. COMPONENT ARCHITECTURE (THE SLOT PATTERN)
UI Components (Grid, Card, Reel) must be **Visual Only**.
* **BAD:** `<Card />` calculates its own damage or internal state.
* **GOOD:** `<Card isDamaged={true} onClick={emitEvent} />`.
* *Why:* We must be able to swap the visual layer (Symbols -> Cards) without breaking the math.

## 5. STATE MANAGEMENT
* **Store:** Use `Zustand` with `Immer` middleware for nested updates.
* **Persistence:** Use `persist` middleware. **IMPORTANT:** Increment the `version` number in the persist config whenever the data shape changes to prevent white-screen crashes on reload.

## 6. STYLING & CONFLICTS
* **Utility:** Always use the `cn(...)` utility (clsx + tailwind-merge).
* **Rule:** Never use template literals for classNames involving conditionals.
    * *Bad:* `` `p-4 ${isActive ? 'bg-red' : 'bg-blue'}` ``
    * *Good:* `cn('p-4', isActive ? 'bg-red' : 'bg-blue')`

## 7. ANIMATION SEPARATION
* **Framer Motion:** Use strictly for UI (Modals, Toasts, Menu Transitions).
* **GSAP:** Use strictly for the **Game Loop** and high-frequency updates (Sequencers, Timelines, Particle effects).

## 8. FILE STRUCTURE & IMPORTS
* **Aliases:** ALWAYS use `@/` for imports (e.g., `import { useStore } from '@/store'`).
* **Separation:**
    * `src/game/`: Core logic, math, engines.
    * `src/ui/`: HUD, Settings, Buttons.
    * `src/experiments/`: Temporary sandboxes for new features.

## 9. AUDIO (HOWLER.JS)
* Initialize audio globally but muted/paused.
* Unlock the `AudioContext` on the **first user interaction** (click/tap) to comply with browser autoplay policies.