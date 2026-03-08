import type { LevelUpPerk } from '@/types/levelUp';

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
    "bell": "bell",

    // Armor
    "shield": "shield",
    "knight-helmet": "knight-helmet",

    // Magic
    "crystal-wand": "crystal-wand",
    "fairy-wand": "fairy-wand",

    // Treasure
    "gold-bar": "gold-bar",
    "gem-pendant": "gem-pendant",

    // Special
    "key": "key",
    "scroll-unfurled": "scroll-unfurled",
    "food-scroll": "scroll-unfurled",
    "armor-scroll": "scroll-unfurled",
    "magic-scroll": "scroll-unfurled",
    "weapon-scroll": "scroll-unfurled",
    "special-scroll": "scroll-unfurled",
    "nature-scroll": "scroll-unfurled",

    // Conjure Magic
    "two-hearts": "two-hearts",
    "sapphire": "sapphire",
    "lightning-trio": "lightning-trio",
} as const;

type SymbolName = keyof typeof SYMBOL_MAP;

export const CATEGORY_ACCENT_HEX: Record<string, string> = {
    Hero: "#7e22ce",
    Enemy: "#e11d48",
    Food: "#ef4444",
    Nature: "#22c55e",
    Weapon: "#f97316",
    Armor: "#3b82f6",
    Magic: "#ec4899",
    Treasure: "#eab308",
    Special: "#92400e",
};

export const CATEGORY_TEXT_THEME: Record<string, string> = {
    Hero: "text-violet-500",
    Enemy: "text-rose-500",
    Food: "text-red-500",
    Nature: "text-green-500",
    Weapon: "text-orange-500",
    Armor: "text-blue-500",
    Magic: "text-pink-500",
    Treasure: "text-yellow-500",
    Special: "text-[#92400e]",
};

export const SYMBOL_KEYS: SymbolName[] = [
    // Food
    "apple", "crab-claw", "brandy-bottle",
    // Nature
    "clover", "pine-tree", "dead-tree",
    // Weapon
    "axe", "relic-blade", "crossbow", "daggers", "bell",
    // Armor
    "shield", "knight-helmet",
    // Magic
    "crystal-wand", "fairy-wand",
    // Treasure
    "gold-bar", "gem-pendant",
    // Special
    "key", "scroll-unfurled",
];

export const SYMBOL_THEME: Record<SymbolName, string> = {
    "hood": CATEGORY_ACCENT_HEX.Hero,
    "wyvern": "#15803d",   // Dark Green (Enemy)
    "octopus": "#f9a8d4", // Light Pink (Enemy)
    "monster-skull": "#ef4444", // Red (Enemy)
    "snail": "#eab308", // Yellow (Enemy)
    "hydra": "#d4af37", // Gold (Enemy)
    "spider-face": "#581c87", // Dark Purple (Enemy)
    "eye-monster": "#84cc16", // Lime Green (Enemy)

    // Food (Red)
    "apple": CATEGORY_ACCENT_HEX.Food,
    "crab-claw": CATEGORY_ACCENT_HEX.Food,
    "brandy-bottle": CATEGORY_ACCENT_HEX.Food,

    // Nature (Green)
    "clover": CATEGORY_ACCENT_HEX.Nature,
    "pine-tree": CATEGORY_ACCENT_HEX.Nature,
    "dead-tree": CATEGORY_ACCENT_HEX.Nature,

    // Weapon (Orange)
    "axe": CATEGORY_ACCENT_HEX.Weapon,
    "relic-blade": CATEGORY_ACCENT_HEX.Weapon,
    "crossbow": CATEGORY_ACCENT_HEX.Weapon,
    "daggers": CATEGORY_ACCENT_HEX.Weapon,
    "bell": CATEGORY_ACCENT_HEX.Weapon,

    // Armor (Blue)
    "shield": CATEGORY_ACCENT_HEX.Armor,
    "knight-helmet": CATEGORY_ACCENT_HEX.Armor,

    // Magic (Pink)
    "crystal-wand": CATEGORY_ACCENT_HEX.Magic,
    "fairy-wand": CATEGORY_ACCENT_HEX.Magic,

    // Treasure (Yellow)
    "gold-bar": CATEGORY_ACCENT_HEX.Treasure,
    "gem-pendant": CATEGORY_ACCENT_HEX.Treasure,

    // Special and Scrolls
    "key": CATEGORY_ACCENT_HEX.Special,
    "scroll-unfurled": CATEGORY_ACCENT_HEX.Special,
    "food-scroll": CATEGORY_ACCENT_HEX.Food,
    "armor-scroll": CATEGORY_ACCENT_HEX.Armor,
    "magic-scroll": CATEGORY_ACCENT_HEX.Magic,
    "weapon-scroll": CATEGORY_ACCENT_HEX.Weapon,
    "special-scroll": CATEGORY_ACCENT_HEX.Special,
    "nature-scroll": CATEGORY_ACCENT_HEX.Nature,

    // Conjure Magic
    "two-hearts": CATEGORY_ACCENT_HEX.Magic,
    "sapphire": CATEGORY_ACCENT_HEX.Armor,
    "lightning-trio": CATEGORY_ACCENT_HEX.Treasure,
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

    "apple": "Heal 15 HP",
    "crab-claw": "+3 Max HP +1 EXP",
    "brandy-bottle": "-10 HP & +5 Max HP",

    "clover": "+2 EXP +2 Magic",
    "pine-tree": "+4 EXP",
    "dead-tree": "-3 EXP +5 Magic",

    "axe": "+3 ATK +2 Gear",
    "relic-blade": "+1 ATK +1 Gear",
    "crossbow": "+1 ATK +4 Gear",
    "daggers": "+1 ATK +1 Gear",
    "bell": "-2 ATK",

    "shield": "+7 Gear",
    "knight-helmet": "+2 Gear",

    "crystal-wand": "+3 Magic",
    "fairy-wand": "+6 Magic",

    "gold-bar": "+16 Gold",
    "gem-pendant": "+8 Gold +2 Gear",

    "key": "unlock symbol inventory",
    "scroll-unfurled": "???",
    "food-scroll": "all food effects happen twice",
    "armor-scroll": "+2 Max HP for every 5 Gear",
    "magic-scroll": "next fatal strike will miss, damage added to Magic (one-time)",
    "weapon-scroll": "equipping weapon symbols costs 0 Gold",
    "special-scroll": "if all inventory slots are unlocked, keys are as valuable as Gold bars",
    "nature-scroll": "if Rogue is LVL 3+, Rogue can slide twice per spin",

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
    "bell": "Weapon",

    "shield": "Armor",
    "knight-helmet": "Armor",

    "crystal-wand": "Magic",
    "fairy-wand": "Magic",

    "gold-bar": "Treasure",
    "gem-pendant": "Treasure",

    "key": "Special",
    "scroll-unfurled": "Special",
    "food-scroll": "Special",
    "armor-scroll": "Special",
    "magic-scroll": "Special",
    "weapon-scroll": "Special",
    "special-scroll": "Special",
    "nature-scroll": "Special",
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
        className: "text-violet-500 border-violet-500/40 bg-violet-500/15",
    },
    Enemy: {
        className: "text-rose-500 border-rose-500/40 bg-rose-500/15",
    },
    Food: {
        className: "text-red-500 border-red-500/40 bg-red-500/15",
    },
    Nature: {
        className: "text-green-500 border-green-500/40 bg-green-500/15",
    },
    Weapon: {
        className: "text-orange-500 border-orange-500/40 bg-orange-500/15",
    },
    Armor: {
        className: "text-blue-500 border-blue-500/40 bg-blue-500/15",
    },
    Magic: {
        className: "text-pink-500 border-pink-500/40 bg-pink-500/15",
    },
    Treasure: {
        className: "text-yellow-500 border-yellow-500/40 bg-yellow-500/15",
    },
    Special: {
        className: "text-[#92400e] border-[#92400e]/40 bg-[#92400e]/15",
    },
};

export const SYMBOL_EXTRA_EFFECTS: Partial<Record<SymbolName, string>> = {
    "apple": "also heal when symbol is removed",
    "crab-claw": "on equip, deal 1 damage to a random enemy",
    "brandy-bottle": "if LVL 3+, gain an extra +1 Max HP",
    "daggers": "first attack happens 3 times",
    "relic-blade": "increase attack by current experience",
    "shield": "enemy attacks apply to gear instead of hp",
    "knight-helmet": "if gear >3, all enemy attacks reduced by 1 / stacks",
    "crossbow": "+10 atk against flying enemies / stacks",
    "fairy-wand": "if 2 wands equipped, conjure magic before battle",
    "crystal-wand": "increase attack by current magic",
    "axe": "attack twice per turn if no other weapon symbols equipped",
    "bell": "every attack also deals 1 damage to future enemies",
    "armor-scroll": "+2 max HP for every 5 GEAR",
    "food-scroll": "all food effects happen twice",
    "magic-scroll": "next fatal strike will miss, damage added to magic (one-time)",
    "weapon-scroll": "equipping weapon symbols costs 0 gold",
    "special-scroll": "if all inventory slots are unlocked, keys are now as valuable as gold bars",
    "nature-scroll": "if Rogue is LVL 3+, Rogue can slide twice per spin",
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
    LEVEL_UP_MAX_HP_BONUS: 10,
    LEVEL_UP_GOLD_REWARD: 40,
};

export const ALL_LEVEL_UP_PERKS: LevelUpPerk[] = [
    'full_heal_max_hp',
    'nature_2x_exp',
    'gain_40_gold',
    'full_heal',
];

export const ONE_TIME_LEVEL_UP_PERKS: Exclude<LevelUpPerk, 'full_heal'>[] = [
    'full_heal_max_hp',
    'nature_2x_exp',
    'gain_40_gold',
];

export const LEVEL_UP_PERK_META: Record<LevelUpPerk, { label: string; isOneTime: boolean; buttonClassName: string }> = {
    full_heal_max_hp: {
        label: `Full heal and +${GAME_CONSTANTS.LEVEL_UP_MAX_HP_BONUS} Max HP`,
        isOneTime: true,
        buttonClassName: 'border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20 focus-visible:ring-red-500/40',
    },
    nature_2x_exp: {
        label: 'All Nature symbols give 2x EXP',
        isOneTime: true,
        buttonClassName: 'border-green-500/40 bg-green-500/10 text-green-100 hover:bg-green-500/20 focus-visible:ring-green-500/40',
    },
    gain_40_gold: {
        label: `Gain ${GAME_CONSTANTS.LEVEL_UP_GOLD_REWARD} Gold`,
        isOneTime: true,
        buttonClassName: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-100 hover:bg-yellow-500/20 focus-visible:ring-yellow-500/40',
    },
    full_heal: {
        label: 'Full Heal',
        isOneTime: false,
        buttonClassName: 'border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20 focus-visible:ring-red-500/40',
    },
};

export const ALL_SCROLL_COLORS: SymbolName[] = [
    "food-scroll", "armor-scroll", "magic-scroll",
    "weapon-scroll", "special-scroll", "nature-scroll"
];

export interface BattleRoundEntry {
    name: SymbolName;
    hp: number;
    atk: number;
    lvl: number;
    type: string;
    special?: string; // reserved: e.g. 'self-heal', 'double-attack'
}

export interface BattleRound {
    e1: BattleRoundEntry;
    e2: BattleRoundEntry | null; // null = solo battle (second enemy hidden)
}

// Ordered by battle index (0 = battle 1). Tune HP/ATK here; add specials via the special field.
export const BATTLE_ROUNDS: BattleRound[] = [
    // ── Battle 1 ────────────────────────────────────────────────────────────
    {
        e1: { name: 'wyvern', hp: 40, atk: 8, lvl: 1, type: 'flying' },
        e2: { name: 'octopus', hp: 40, atk: 8, lvl: 1, type: '---' }
    },
    // ── Battle 2 ────────────────────────────────────────────────────────────
    {
        e1: { name: 'monster-skull', hp: 40, atk: 8, lvl: 1, type: 'evil' },
        e2: { name: 'snail', hp: 40, atk: 8, lvl: 1, type: '---' }
    },
    // ── Battle 3 ────────────────────────────────────────────────────────────
    {
        e1: { name: 'hydra', hp: 40, atk: 8, lvl: 1, type: '---' },
        e2: { name: 'spider-face', hp: 40, atk: 8, lvl: 1, type: '---' }
    },
    // ── Battle 4: Boss (solo) ────────────────────────────────────────────────
    {
        e1: { name: 'eye-monster', hp: 105, atk: 19, lvl: 1, type: 'flying / boss' },
        e2: null
    },
    // ── Battle 5 (LVL 2) ────────────────────────────────────────────────────
    {
        e1: { name: 'wyvern', hp: 60, atk: 13, lvl: 2, type: 'flying' },
        e2: { name: 'octopus', hp: 60, atk: 13, lvl: 2, type: '---' }
    },
    // ── Battle 6 (LVL 2) ────────────────────────────────────────────────────
    {
        e1: { name: 'monster-skull', hp: 60, atk: 13, lvl: 2, type: 'evil' },
        e2: { name: 'snail', hp: 60, atk: 13, lvl: 2, type: '---' }
    },
    // ── Battle 7 (LVL 2) ────────────────────────────────────────────────────
    {
        e1: { name: 'hydra', hp: 60, atk: 13, lvl: 2, type: '---' },
        e2: { name: 'spider-face', hp: 60, atk: 13, lvl: 2, type: '---' }
    },
    // ── Battle 8: Boss LVL 2 (solo) ─────────────────────────────────────────
    {
        e1: { name: 'eye-monster', hp: 160, atk: 35, lvl: 2, type: 'flying / boss' },
        e2: null
    },
];
