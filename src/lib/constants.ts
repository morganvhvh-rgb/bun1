export const ICON_MAP = {
    // Character
    "hood": "hood",
    // Enemies
    "wyvern": "wyvern",
    "octopus": "octopus",
    "monster-skull": "monster-skull",
    "snail": "snail",
    "hydra": "hydra",
    "spider-face": "spider-face",
    "eye-monster": "eye-monster",

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

export const ICON_KEYS: IconName[] = [
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
    // Special
    "key", "scroll-unfurled", "book",
    // Music
    "bell", "ocarina",
];

export const ICON_THEME: Record<IconName, string> = {
    "hood": "#7e22ce",   // Darker Purple (Hero)
    "wyvern": "#15803d",   // Dark Green (Enemy)
    "octopus": "#f9a8d4", // Light Pink (Enemy)
    "monster-skull": "#ef4444", // Red (Enemy)
    "snail": "#eab308", // Yellow (Enemy)
    "hydra": "#d4af37", // Gold (Enemy)
    "spider-face": "#581c87", // Dark Purple (Enemy)
    "eye-monster": "#84cc16", // Lime Green (Enemy)

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

    // Special (Brown)
    "key": "#a16207",
    "scroll-unfurled": "#a16207",
    "book": "#a16207",

    // Music (Orange)
    "bell": "#f97316",
    "ocarina": "#f97316",
};

export const ICON_STATS: Partial<Record<IconName, string>> = {
    "hood": "Hero",
    "wyvern": "Enemy",
    "octopus": "Enemy",
    "monster-skull": "Enemy",
    "snail": "Enemy",
    "hydra": "Enemy",
    "spider-face": "Enemy",
    "eye-monster": "Enemy",

    "apple": "Heal 6 HP",
    "meat": "Heal 10 HP",
    "crab-claw": "+1 Max HP",
    "brandy-bottle": "-50% HP & +4 Max HP",

    "clover": "+1 EXP +1 Magic",
    "pine-tree": "+1 EXP",
    "zigzag-leaf": "-3 EXP +5 Magic",

    "axe": "+2 ATK +1 Gear",
    "relic-blade": "+1 ATK +1 Gear",
    "crossbow": "+1 ATK +1 Gear",
    "daggers": "+1 ATK +1 Gear",

    "shield": "+2 Gear",
    "knight-helmet": "+2 Gear",

    "crystal-wand": "+5 Magic",
    "fairy-wand": "+5 Magic",

    "gold-bar": "+10 gold",
    "gem-pendant": "+10 Gold",

    "key": "unlock symbol inventory",
    "scroll-unfurled": "???",
    "book": "???",

    "bell": "-1 ATK",
    "ocarina": "-1 ATK",
};

export const ICON_CATEGORIES: Record<IconName, string> = {
    "hood": "Hero",
    "wyvern": "Enemy",
    "octopus": "Enemy",
    "monster-skull": "Enemy",
    "snail": "Enemy",
    "hydra": "Enemy",
    "spider-face": "Enemy",
    "eye-monster": "Enemy",

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

    "key": "Special",
    "scroll-unfurled": "Special",
    "book": "Item",

    "bell": "Music",
    "ocarina": "Music",
};

export const ICON_EXTRA_EFFECTS: Partial<Record<IconName, string>> = {
    "daggers": "first attack happens 3 times / doesnt stack",
    "relic-blade": "increase attack by current experience / doesnt stack",
    "shield": "first enemy attack applies to gear instead of hp / doesnt stack",
    "knight-helmet": "if gear >3, all enemy attacks reduced by 1 / stacks",
};
