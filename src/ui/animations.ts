import type { Variants } from 'framer-motion';

const defaultFilter = "drop-shadow(0px 8px 16px rgba(0,0,0,0.6)) brightness(1)";
const hurtFilter = "drop-shadow(0px 0px 25px rgba(220,38,38,0.9)) brightness(1.3) sepia(1) hue-rotate(-40deg) saturate(6)";

/** HP text flash — shared between hero and enemy stat panels */
export const hpVariants: Variants = {
    idle: { color: '#d4d4d8', scale: 1 },
    hurt: { color: '#ef4444', scale: [1, 1.5, 1], transition: { duration: 0.25 } }
};

/** Player character icon — lunges right on attack */
export const playerIconVariants: Variants = {
    idle: { scale: 1, x: 0, y: 0, filter: defaultFilter },
    attack: { scale: 1.15, x: 10, y: -5, filter: defaultFilter, transition: { duration: 0.15, ease: "easeOut" } },
    hurt: { x: [-4, 4, -4, 4, 0], scale: [1, 0.85, 1], filter: [defaultFilter, hurtFilter, defaultFilter], transition: { duration: 0.3 } }
};

/** Enemy icon — lunges left on attack */
export const enemyIconVariants: Variants = {
    idle: { scale: 1, x: 0, y: 0, filter: defaultFilter },
    attack: { scale: 1.15, x: -10, y: 5, filter: defaultFilter, transition: { duration: 0.15, ease: "easeOut" } },
    hurt: { x: [-4, 4, -4, 4, 0], scale: [1, 0.85, 1], filter: [defaultFilter, hurtFilter, defaultFilter], transition: { duration: 0.3 } }
};
