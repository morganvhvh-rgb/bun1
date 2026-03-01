import type { Variants } from 'framer-motion';

/** HP text flash — shared between hero and enemy stat panels */
export const hpVariants: Variants = {
    idle: { color: '#d4d4d8', scale: 1 },
    hurt: { color: '#ef4444', scale: [1, 1.5, 1], transition: { duration: 0.25 } }
};

/** Player character icon — lunges right on attack */
export const playerIconVariants: Variants = {
    idle: { scale: 1, x: 0, y: 0, filter: "brightness(1)" },
    attack: { scale: 1.3, x: 20, y: -10, transition: { duration: 0.15, ease: "easeOut" } },
    hurt: { x: [-2, 2, -2, 2, 0], scale: [1, 0.95, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"], transition: { duration: 0.25 } }
};

/** Enemy icon — lunges left on attack */
export const enemyIconVariants: Variants = {
    idle: { scale: 1, x: 0, y: 0, filter: "brightness(1)" },
    attack: { scale: 1.3, x: -20, y: 10, transition: { duration: 0.15, ease: "easeOut" } },
    hurt: { x: [-2, 2, -2, 2, 0], scale: [1, 0.95, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"], transition: { duration: 0.25 } }
};
