export const ICON_MAP = {
    // Character
    "Hooded": "hood",
    // Enemies
    "Goblin": "monster-skull",
    "Skeleton": "skull",

    // Food
    "apple": "apple",
    "meat": "meat",
    "crab-claw": "crab-claw",
    "brandy-bottle": "brandy-bottle",

    // Nature
    "clover": "clover",
    "pine-tree": "pine-tree",
    "zigzag-leaf": "zigzag-leaf",

    // Weapon
    "axe": "axe",
    "relic-blade": "relic-blade",
    "crossbow": "crossbow",
    "daggers": "daggers",

    // Armor
    "shield": "shield",
    "knight-helmet": "knight-helmet",

    // Magic
    "crystal-wand": "crystal-wand",
    "fairy-wand": "fairy-wand",

    // Treasure
    "gold-bar": "gold-bar",
    "gem-pendant": "gem-pendant",

    // Item
    "key": "key",
    "scroll-unfurled": "scroll-unfurled",
    "book": "book",

    // Music
    "bell": "bell",
    "ocarina": "ocarina",
} as const;

export type IconName = keyof typeof ICON_MAP;

export const SPRITE_KEYS: IconName[] = [
    // Food
    "apple", "meat", "crab-claw", "brandy-bottle",
    // Nature
    "clover", "pine-tree", "zigzag-leaf",
    // Weapon
    "axe", "relic-blade", "crossbow", "daggers",
    // Armor
    "shield", "knight-helmet",
    // Magic
    "crystal-wand", "fairy-wand",
    // Treasure
    "gold-bar", "gem-pendant",
    // Item
    "key", "scroll-unfurled", "book",
    // Music
    "bell", "ocarina",
];

export const SPRITE_THEME: Record<IconName, string> = {
    "Hooded": "#a855f7",   // Purple (Hero)
    "Goblin": "#84cc16",   // Lime (Enemy)
    "Skeleton": "#e4e4e7", // Bone White (Enemy)

    // Food (Red)
    "apple": "#ef4444",
    "meat": "#ef4444",
    "crab-claw": "#ef4444",
    "brandy-bottle": "#ef4444",

    // Nature (Green)
    "clover": "#22c55e",
    "pine-tree": "#22c55e",
    "zigzag-leaf": "#22c55e",

    // Weapon (Gray)
    "axe": "#94a3b8",
    "relic-blade": "#94a3b8",
    "crossbow": "#94a3b8",
    "daggers": "#94a3b8",

    // Armor (Blue)
    "shield": "#3b82f6",
    "knight-helmet": "#3b82f6",

    // Magic (Pink)
    "crystal-wand": "#ec4899",
    "fairy-wand": "#ec4899",

    // Treasure (Yellow)
    "gold-bar": "#eab308",
    "gem-pendant": "#eab308",

    // Item (Brown)
    "key": "#a16207",
    "scroll-unfurled": "#a16207",
    "book": "#a16207",

    // Music (Orange)
    "bell": "#f97316",
    "ocarina": "#f97316",
};

export const SPRITE_STATS: Partial<Record<IconName, string>> = {
    "Hooded": "Hero",
    "Goblin": "Enemy",
    "Skeleton": "Enemy",

    "apple": "+Health",
    "meat": "+Health",
    "crab-claw": "+Health",
    "brandy-bottle": "+Mana",

    "clover": "Luck",
    "pine-tree": "Cover",
    "zigzag-leaf": "Hiding",

    "axe": "Cleave",
    "relic-blade": "Slash",
    "crossbow": "Pierce",
    "daggers": "Backstab",

    "shield": "Block",
    "knight-helmet": "Head",

    "crystal-wand": "Zap",
    "fairy-wand": "Charm",

    "gold-bar": "Wealth",
    "gem-pendant": "Shiny",

    "key": "Open",
    "scroll-unfurled": "Learn",
    "book": "Read",

    "bell": "Ring",
    "ocarina": "Tuut",
};

export const SPRITE_CATEGORIES: Record<IconName, string> = {
    "Hooded": "Hero",
    "Goblin": "Enemy",
    "Skeleton": "Enemy",

    "apple": "Food",
    "meat": "Food",
    "crab-claw": "Food",
    "brandy-bottle": "Food",

    "clover": "Nature",
    "pine-tree": "Nature",
    "zigzag-leaf": "Nature",

    "axe": "Weapon",
    "relic-blade": "Weapon",
    "crossbow": "Weapon",
    "daggers": "Weapon",

    "shield": "Armor",
    "knight-helmet": "Armor",

    "crystal-wand": "Magic",
    "fairy-wand": "Magic",

    "gold-bar": "Treasure",
    "gem-pendant": "Treasure",

    "key": "Item",
    "scroll-unfurled": "Item",
    "book": "Item",

    "bell": "Music",
    "ocarina": "Music",
};

export interface GridItem {
    id: string;
    name: IconName;
}
