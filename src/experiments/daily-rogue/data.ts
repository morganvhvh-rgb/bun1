export const ICON_MAP = {
    // Character
    "Hooded": "hood",
    // Enemies (Display Only)
    "Goblin": "monster-skull",
    "Skeleton": "skull",
    // Pool Items
    "Lute": "ocarina",
    "Flute": "horn-call",
    "Lyre": "bell",
    "Sword": "sword",
    "Axe": "axe",
    "Dagger": "plain-dagger",
    "Staff": "crystal-wand",
    "Wand": "fairy-wand",
    "Meat": "meat",
    "Cheese": "cheese",
    "Grapes": "apple",
    "Chicken": "chicken-leg",
    "Shield": "shield",
    "Armor": "vest",
    "Helmet": "helmet",
    "Gauntlet": "hand",
    "Coins": "gold-bar",
    "Crown": "crown",
    // Nature (Green/Growth)
    "Pine": "pine-tree",
    "Mushroom": "super-mushroom",
    "Zigzag": "zigzag-leaf",
    "Trap": "bear-trap",
    "Scroll": "scroll-unfurled",
} as const;

export type IconName = keyof typeof ICON_MAP;

export const SPRITE_KEYS: IconName[] = [
    // 3 Instruments
    "Lute", "Flute", "Lyre",
    // 3 Weapons
    "Sword", "Axe", "Dagger",
    // 2 Magic Staffs
    "Staff", "Wand",
    // 4 Food
    "Meat", "Cheese", "Grapes", "Chicken",
    // 4 Armor
    "Shield", "Armor", "Helmet", "Gauntlet",
    // 2 Treasure
    "Coins", "Crown",
    // 3 Nature
    "Pine", "Mushroom", "Zigzag",
    // 1 Trap
    "Trap",
    // 1 Special
    "Scroll"
];

export const SPRITE_THEME: Record<IconName, string> = {
    "Hooded": "#a855f7",   // Purple (Hero)
    "Goblin": "#84cc16",   // Lime (Enemy)
    "Skeleton": "#e4e4e7", // Bone White (Enemy)

    // Instruments (Amber/Bardic)
    "Lute": "#f59e0b",
    "Flute": "#f59e0b",
    "Lyre": "#f59e0b",

    // Weapons (Slate/Steel)
    "Sword": "#94a3b8",
    "Axe": "#94a3b8",
    "Dagger": "#94a3b8",

    // Magic (Violet/Arcane)
    "Staff": "#c084fc",
    "Wand": "#c084fc",

    // Food (Rose/Vitality)
    "Meat": "#fb7185",
    "Cheese": "#fb7185",
    "Grapes": "#fb7185",
    "Chicken": "#fb7185",

    // Armor (Zinc/Metal)
    "Shield": "#52525b",
    "Armor": "#52525b",
    "Helmet": "#52525b",
    "Gauntlet": "#52525b",

    // Treasure (Yellow/Gold)
    "Coins": "#facc15",
    "Crown": "#facc15",

    // Nature (Green/Growth)
    "Pine": "#4ade80",
    "Mushroom": "#4ade80",
    "Zigzag": "#4ade80",

    // Trap (Red/Danger)
    "Trap": "#ef4444",

    // Special
    "Scroll": "#d4b483",   // Parchment
};

export const SPRITE_STATS: Partial<Record<IconName, string>> = {
    "Hooded": "Hero",
    "Goblin": "Enemy",
    "Skeleton": "Enemy",
    "Lute": "+1 Bard logic",
    "Flute": "Charm",
    "Lyre": "Inspire",
    "Sword": "+1 Attack",
    "Axe": "+2 Attack",
    "Dagger": "Fast Atk",
    "Staff": "+1 Magic",
    "Wand": "Cast",
    "Meat": "+10 HP",
    "Cheese": "+5 HP",
    "Grapes": "+2 HP",
    "Chicken": "+8 HP",
    "Shield": "+1 Defense",
    "Armor": "+2 Defense",
    "Helmet": "Headgear",
    "Gauntlet": "Hands",
    "Coins": "+10 Gold",
    "Crown": "Victory",
    "Pine": "Woods",
    "Mushroom": "Food?",
    "Zigzag": "Nature",
    "Trap": "Danger",
    "Scroll": "Mystery",
};

export const SPRITE_CATEGORIES: Record<IconName, string> = {
    "Hooded": "Hero",
    "Goblin": "Enemy",
    "Skeleton": "Enemy",
    "Lute": "Instrument",
    "Flute": "Instrument",
    "Lyre": "Instrument",
    "Sword": "Weapon",
    "Axe": "Weapon",
    "Dagger": "Weapon",
    "Staff": "Magic",
    "Wand": "Magic",
    "Meat": "Food",
    "Cheese": "Food",
    "Grapes": "Food",
    "Chicken": "Food",
    "Shield": "Armor",
    "Armor": "Armor",
    "Helmet": "Armor",
    "Gauntlet": "Armor",
    "Coins": "Treasure",
    "Crown": "Treasure",
    "Pine": "Nature",
    "Mushroom": "Nature",
    "Zigzag": "Nature",
    "Trap": "Hazard",
    "Scroll": "Special",
};

export interface GridItem {
    id: string;
    name: IconName;
}
