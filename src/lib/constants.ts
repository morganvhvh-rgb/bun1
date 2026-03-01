export const SYMBOL_MAP = {
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
    "crab-claw": "crab-claw",
    "brandy-bottle": "brandy-bottle",

    // Nature
    "clover": "clover",
    "pine-tree": "pine-tree",
    "dead-tree": "dead-tree",

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
    "item-scroll": "scroll-unfurled",
    "food-scroll": "scroll-unfurled",
    "armor-scroll": "scroll-unfurled",
    "magic-scroll": "scroll-unfurled",
    "weapon-scroll": "scroll-unfurled",
    "music-scroll": "scroll-unfurled",
    "special-scroll": "scroll-unfurled",
    "nature-scroll": "scroll-unfurled",
    "book": "book",
    "spades-card": "spades-card",

    // Music
    "bell": "bell",
    "ocarina": "ocarina",

    // Conjure Magic
    "two-hearts": "two-hearts",
    "sapphire": "sapphire",
    "lightning-trio": "lightning-trio",
} as const;

type SymbolName = keyof typeof SYMBOL_MAP;

export const SYMBOL_KEYS: SymbolName[] = [
    // Food
    "apple", "crab-claw", "brandy-bottle",
    // Nature
    "clover", "pine-tree", "dead-tree",
    // Weapon
    "axe", "relic-blade", "crossbow", "daggers",
    // Armor
    "shield", "knight-helmet",
    // Magic
    "crystal-wand", "fairy-wand",
    // Treasure
    "gold-bar", "gem-pendant",
    // Special
    "key", "scroll-unfurled", "book", "spades-card",
    // Music
    "bell", "ocarina",
];

export const SYMBOL_THEME: Record<SymbolName, string> = {
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
    "crab-claw": "#ef4444",
    "brandy-bottle": "#ef4444",

    // Nature (Green)
    "clover": "#22c55e",
    "pine-tree": "#22c55e",
    "dead-tree": "#22c55e",

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
    "item-scroll": "#d4d4d8", // zinc-300
    "food-scroll": "#b91c1c", // red-700
    "armor-scroll": "#1d4ed8", // blue-700
    "magic-scroll": "#be185d", // pink-700
    "weapon-scroll": "#475569", // slate-600
    "music-scroll": "#c2410c", // orange-700
    "special-scroll": "#713f12", // yellow-900 (dark brown)
    "nature-scroll": "#15803d", // green-700

    // Item (White)
    "book": "#ffffff",
    "spades-card": "#ffffff",

    // Music (Orange)
    "bell": "#f97316",
    "ocarina": "#f97316",

    // Conjure Magic
    "two-hearts": "#ec4899",
    "sapphire": "#3b82f6",
    "lightning-trio": "#eab308",
};

export const SYMBOL_STATS: Partial<Record<SymbolName, string>> = {
    "hood": "Hero",
    "wyvern": "Enemy",
    "octopus": "Enemy",
    "monster-skull": "Enemy",
    "snail": "Enemy",
    "hydra": "Enemy",
    "spider-face": "Enemy",
    "eye-monster": "Enemy",

    "apple": "Heal 10 HP",
    "crab-claw": "+3 Max HP +1 EXP",
    "brandy-bottle": "-10 HP & +5 Max HP",

    "clover": "+2 EXP +2 Magic",
    "pine-tree": "+4 EXP",
    "dead-tree": "-3 EXP +5 Magic",

    "axe": "+3 ATK +2 Gear",
    "relic-blade": "+1 ATK +1 Gear",
    "crossbow": "+1 ATK +4 Gear",
    "daggers": "+1 ATK +1 Gear",

    "shield": "+5 Gear",
    "knight-helmet": "+2 Gear",

    "crystal-wand": "+5 Magic",
    "fairy-wand": "+3 Magic",

    "gold-bar": "+16 gold",
    "gem-pendant": "+8 Gold +2 Gear",

    "key": "unlock symbol inventory",
    "scroll-unfurled": "???",
    "item-scroll": "???",
    "food-scroll": "???",
    "armor-scroll": "???",
    "magic-scroll": "???",
    "weapon-scroll": "equipping weapon symbols costs 0 gold",
    "music-scroll": "if 2 music symbols are equipped, earn 1 gold per attack",
    "special-scroll": "???",
    "nature-scroll": "???",
    "book": "Conjure Magic x2",
    "spades-card": "",

    "bell": "-1 ATK",
    "ocarina": "-1 ATK",
};

export const SYMBOL_CATEGORIES: Record<SymbolName, string> = {
    "hood": "Hero",
    "wyvern": "Enemy",
    "octopus": "Enemy",
    "monster-skull": "Enemy",
    "snail": "Enemy",
    "hydra": "Enemy",
    "spider-face": "Enemy",
    "eye-monster": "Enemy",

    "apple": "Food",
    "crab-claw": "Food",
    "brandy-bottle": "Food",

    "clover": "Nature",
    "pine-tree": "Nature",
    "dead-tree": "Nature",

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
    "item-scroll": "Special",
    "food-scroll": "Special",
    "armor-scroll": "Special",
    "magic-scroll": "Special",
    "weapon-scroll": "Special",
    "music-scroll": "Special",
    "special-scroll": "Special",
    "nature-scroll": "Special",
    "book": "Item",
    "spades-card": "Item",

    "bell": "Music",
    "ocarina": "Music",

    // Conjure Magic
    "two-hearts": "Magic",
    "sapphire": "Magic",
    "lightning-trio": "Magic",
};

type CategoryBadgeTheme = {
    label?: string;
    className: string;
};

export const CATEGORY_BADGE_THEME: Record<string, CategoryBadgeTheme> = {
    Hero: {
        label: "ROGUE",
        className: "text-violet-200 border-violet-300/35 bg-violet-500/15",
    },
    Enemy: {
        className: "text-rose-200 border-rose-300/35 bg-rose-500/12",
    },
    Food: {
        className: "text-red-200 border-red-300/35 bg-red-500/12",
    },
    Nature: {
        className: "text-emerald-200 border-emerald-300/35 bg-emerald-500/12",
    },
    Weapon: {
        className: "text-slate-200 border-slate-300/35 bg-slate-500/15",
    },
    Armor: {
        className: "text-sky-200 border-sky-300/35 bg-sky-500/12",
    },
    Magic: {
        className: "text-fuchsia-200 border-fuchsia-300/35 bg-fuchsia-500/12",
    },
    Treasure: {
        className: "text-amber-200 border-amber-300/35 bg-amber-500/12",
    },
    Special: {
        className: "text-yellow-100 border-yellow-300/35 bg-yellow-700/15",
    },
    Item: {
        className: "text-zinc-200 border-zinc-300/35 bg-zinc-500/12",
    },
    Music: {
        className: "text-orange-200 border-orange-300/35 bg-orange-500/12",
    },
};

export const SYMBOL_EXTRA_EFFECTS: Partial<Record<SymbolName, string>> = {
    "apple": "also heal when symbol is removed",
    "daggers": "first attack happens 3 times / doesnt stack",
    "relic-blade": "increase attack by current experience / doesnt stack",
    "shield": "first enemy attack applies to gear instead of hp / doesnt stack",
    "knight-helmet": "if gear >3, all enemy attacks reduced by 1 / stacks",
    "crossbow": "+10 atk against flying enemies / stacks",
    "spades-card": "[perspective-dice-random symbol] costs 1 if experience is <3",
    "fairy-wand": "if 2 wands equipped, conjure magic before battle",
    "book": "conjure magic effect applies twice",
    "crystal-wand": "increase attack by current magic / doesnt stack",
    "axe": "attack twice per turn if no other weapon symbols equipped / doesnt stack",
    "bell": "every attack reduces all future enemies HP by 1 / stacks",
    "ocarina": "attacks have a 15% chance to heal for same amount / doesnt stack",
    "armor-scroll": "+2 max HP for every 5 GEAR",
    "item-scroll": "if 2 item symbols are equipped, gain 80 gold (one-time)",
    "food-scroll": "all food effects happen twice",
    "magic-scroll": "next fatal strike will miss, damage added to magic (one-time)",
    "weapon-scroll": "equipping weapon symbols costs 0 gold",
    "music-scroll": "if 2 music symbols are equipped, earn 1 gold per attack",
    "special-scroll": "if all inventory slots are unlocked, keys are now as valuable as gold bars",
};

export const GAME_CONSTANTS = {
    INITIAL_PLAYER_HP: 60,
    INITIAL_PLAYER_ATK: 8,
    INITIAL_PLAYER_MAGIC: 0,
    INITIAL_PLAYER_GEAR: 0,
    INITIAL_GOLD: 200,
    INITIAL_MOVES: 0,
    SPIN_COST: 3,
    SHUFFLE_COST: 3,
    MOVE_COST: 3,
    EQUIP_SYMBOL_COST: 3,
    SCROLL_COST: 20,
    MAX_KEPT_SCROLLS: 6,
    MAX_BATTLES: 8,
    LEVEL_UP_MOVES_REQUIRED: 10,
};

export const ALL_SCROLL_COLORS: SymbolName[] = [
    "item-scroll", "food-scroll", "armor-scroll", "magic-scroll",
    "weapon-scroll", "music-scroll", "special-scroll", "nature-scroll"
];

export const INITIAL_ENEMIES = {
    wyvern: { name: 'wyvern' as SymbolName, hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1, type: 'flying' },
    octopus: { name: 'octopus' as SymbolName, hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1, type: '---' },
    'monster-skull': { name: 'monster-skull' as SymbolName, hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1, type: 'evil' },
    snail: { name: 'snail' as SymbolName, hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1, type: '---' },
    hydra: { name: 'hydra' as SymbolName, hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1, type: '---' },
    'spider-face': { name: 'spider-face' as SymbolName, hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1, type: '---' },
    'eye-monster': { name: 'eye-monster' as SymbolName, hp: 100, maxHp: 100, atk: 18, isVisible: true, lvl: 1, type: 'flying / boss' },
};
