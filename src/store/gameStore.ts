import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GridSymbol, SymbolName, KeptSymbol } from '@/types/game';
import type { LevelUpPerk } from '@/types/levelUp';
import type { NextRunReward, NextRunBonuses } from '@/types/progression';
import { SYMBOL_KEYS, SYMBOL_CATEGORIES, GAME_CONSTANTS, BATTLE_ROUNDS, ALL_SCROLL_COLORS, ALL_LEVEL_UP_PERKS } from '@/lib/constants';
import { getCompletedRunBattleCount, getNextBattleRound } from '@/lib/battleProgression';
import { createEmptyNextRunBonuses, getRunStartStats, addNextRunReward, applyBonusesToCurrentRun, getRewardBonuses } from '@/lib/runBonuses';
import { getRunResetContext } from '@/lib/runReset';
import { getCoordinates, getIndex } from '@/lib/utils';

interface GameState {
    // Grid State
    grid: (GridSymbol | null)[];
    keptSymbols: (KeptSymbol | null)[];
    keptScrolls: SymbolName[];
    unlockedSlots: { 3: boolean; 4: boolean; 5: boolean };

    // Progression
    levelUpPerks: LevelUpPerk[];
    hasSeenTutorial: boolean;
    pendingNextRunBonuses: NextRunBonuses;

    // Stats & Resources
    gold: number;
    moves: number;

    // Battle State
    playerHp: number;
    playerMaxHp: number;
    playerBaseAtk: number;
    playerMagic: number;
    playerGear: number;
    isFirstEnemyAttack: boolean;
    conjureMagicUsed: boolean;
    magicScrollUsed: boolean;
    battleCount: number;
    globalEnemyHpDebuff: number;

    enemy1: { name: SymbolName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number; type: string };
    enemy2: { name: SymbolName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number; type: string };

    // Actions
    spinBoard: () => void;
    payForShuffle: () => boolean;
    applySwaps: (swaps: [number, number][]) => void;
    slideRogue: (fromIndex: number, toIndex: number, isBoosted?: boolean) => SlideResult | null;
    equipSymbol: (symbol: GridSymbol, isBoosted?: boolean) => number | null;
    removeGridSymbol: (id: string) => void;
    addKeptScroll: (name: SymbolName) => void;
    spendGold: (amount: number) => void;
    resetBattleTarget: () => void;
    restartRun: () => NextRunBonuses;
    hardResetGame: () => void;
    incrementEnemyDebuff: (amount: number) => void;
    setHasSeenTutorial: (value: boolean) => void;
    claimWaveReward: (reward: NextRunReward) => void;

    // Battle updates
    applyBattleDamage: (target: 'player' | 'enemy1' | 'enemy2', amount: number) => void;
    setEnemyVisibility: (target: 'enemy1' | 'enemy2', isVisible: boolean) => void;
    applyLevelUp: (perk: LevelUpPerk) => void;
    applyConjureMagic: (result: 'two-hearts' | 'sapphire' | 'lightning-trio') => void;
}

export interface SlideEffect {
    stat: 'Gold' | 'EXP' | 'Magic' | 'Gear' | 'Slot';
    amount: number;
}

export interface SlideResult {
    goldCost: number;
    effects: SlideEffect[];
}

const VALID_SCROLL_NAMES = new Set<string>(ALL_SCROLL_COLORS);
const INITIAL_KEPT_SYMBOLS: (KeptSymbol | null)[] = [null, null, null, null, null, null];

const getRandomBoardSymbol = (): SymbolName => {
    const randomIndex = Math.floor(Math.random() * SYMBOL_KEYS.length);
    return SYMBOL_KEYS[randomIndex];
};

const isSymbolName = (value: unknown): value is SymbolName =>
    typeof value === 'string' && value in SYMBOL_CATEGORIES;

const isLevelUpPerk = (value: unknown): value is LevelUpPerk =>
    typeof value === 'string' && ALL_LEVEL_UP_PERKS.includes(value as LevelUpPerk);

const sanitizePersistedGrid = (value: unknown) => {
    if (!Array.isArray(value) || value.length !== 12) {
        return { grid: generateRandomSymbols(), hadInvalidContent: true };
    }

    let hasHood = false;
    let hadInvalidContent = false;

    const grid = value.map((entry) => {
        if (entry === null) return null;
        if (!entry || typeof entry !== 'object') {
            hadInvalidContent = true;
            return { id: crypto.randomUUID(), name: getRandomBoardSymbol() };
        }

        const symbol = entry as Record<string, unknown>;
        const rawName = symbol.name;
        const id = typeof symbol.id === 'string' ? symbol.id : crypto.randomUUID();
        const isBoosted = symbol.isBoosted === true ? true : undefined;

        if (rawName === 'hood') {
            hasHood = true;
            return { id, name: 'hood' as SymbolName, isBoosted };
        }

        if (!isSymbolName(rawName)) {
            hadInvalidContent = true;
            return { id, name: getRandomBoardSymbol(), isBoosted };
        }

        return { id, name: rawName as SymbolName, isBoosted };
    });

    if (!hasHood) {
        return { grid: generateRandomSymbols(), hadInvalidContent: true };
    }

    return { grid, hadInvalidContent };
};

const sanitizePersistedKeptSymbols = (value: unknown) => {
    if (!Array.isArray(value)) {
        return { keptSymbols: [...INITIAL_KEPT_SYMBOLS], hadInvalidContent: true };
    }

    let hadInvalidContent = false;
    const keptSymbols = INITIAL_KEPT_SYMBOLS.map((_, index) => {
        const entry = value[index];
        if (entry === null || entry === undefined) return null;
        if (!entry || typeof entry !== 'object') {
            hadInvalidContent = true;
            return null;
        }

        const keptSymbol = entry as Record<string, unknown>;
        const rawName = keptSymbol.name;

        if (!isSymbolName(rawName)) {
            hadInvalidContent = true;
            return null;
        }

        const battleCount = typeof keptSymbol.battleCount === 'number'
            ? Math.max(1, Math.floor(keptSymbol.battleCount))
            : 2;

        return {
            name: rawName,
            battleCount,
            isBoosted: keptSymbol.isBoosted === true ? true : undefined,
        };
    });

    return { keptSymbols, hadInvalidContent };
};

const sanitizePersistedKeptScrolls = (value: unknown) => {
    if (!Array.isArray(value)) {
        return { keptScrolls: [] as SymbolName[], hadInvalidContent: true };
    }

    let hadInvalidContent = false;
    const keptScrolls = Array.from(new Set(
        value.flatMap((entry): SymbolName[] => {
            if (!isSymbolName(entry) || !VALID_SCROLL_NAMES.has(entry)) {
                hadInvalidContent = true;
                return [];
            }
            return [entry];
        })
    )).slice(0, GAME_CONSTANTS.MAX_KEPT_SCROLLS);

    return { keptScrolls, hadInvalidContent };
};

const sanitizePersistedNextRunBonuses = (value: unknown): NextRunBonuses => {
    const bonuses = value as Partial<NextRunBonuses> | undefined;

    return {
        hp: typeof bonuses?.hp === 'number' ? bonuses.hp : 0,
        atk: typeof bonuses?.atk === 'number' ? bonuses.atk : 0,
        gold: typeof bonuses?.gold === 'number' ? bonuses.gold : 0,
    };
};

const generateRandomSymbols = (): GridSymbol[] => {
    const totalSlots = 12;
    const characterIndex = Math.floor(Math.random() * totalSlots);

    return Array.from({ length: totalSlots }, (_, index) => {
        if (index === characterIndex) {
            return {
                id: crypto.randomUUID(),
                name: "hood" as SymbolName
            };
        }
        return {
            id: crypto.randomUUID(),
            name: getRandomBoardSymbol()
        };
    });
};

const calculateTotalMaxHp = (state: { playerMaxHp: number; keptScrolls: SymbolName[]; playerGear: number }) => {
    let bonus = 0;
    if (state.keptScrolls.includes('armor-scroll')) {
        bonus = Math.floor(state.playerGear / 5) * 2;
    }
    return state.playerMaxHp + bonus;
};

const clampExperience = (value: number) =>
    Math.max(0, Math.min(GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED, value));

const addExperience = (state: { moves: number }, amount: number) => {
    state.moves = clampExperience(state.moves + amount);
};

const getDamageableEnemyTargets = (state: Pick<GameState, 'enemy1' | 'enemy2'>) => {
    const targets: Array<'enemy1' | 'enemy2'> = [];
    if (state.enemy1.isVisible && state.enemy1.hp > 0) targets.push('enemy1');
    if (state.enemy2.isVisible && state.enemy2.hp > 0) targets.push('enemy2');
    return targets;
};

const damageRandomEnemy = (state: Pick<GameState, 'enemy1' | 'enemy2'>, amount: number) => {
    const targets = getDamageableEnemyTargets(state);
    if (targets.length === 0) return;

    const target = targets[Math.floor(Math.random() * targets.length)];
    if (target === 'enemy1') {
        state.enemy1.hp = Math.max(0, state.enemy1.hp - amount);
        return;
    }

    state.enemy2.hp = Math.max(0, state.enemy2.hp - amount);
};

// Builds a full enemy state object from a BATTLE_ROUNDS entry.
const makeEnemy = (e: { name: SymbolName; hp: number; atk: number; lvl: number; type: string }, debuff = 0) => ({
    name: e.name,
    hp: Math.max(1, e.hp - debuff),
    maxHp: e.hp,
    atk: e.atk,
    lvl: e.lvl,
    type: e.type,
    isVisible: true as const,
});

const initialRunStartStats = getRunStartStats(createEmptyNextRunBonuses());

const resetRunState = (
    state: GameState,
    bonuses: NextRunBonuses,
    { hasSeenTutorial = false }: { hasSeenTutorial?: boolean } = {},
) => {
    const startingStats = getRunStartStats(bonuses);

    state.grid = generateRandomSymbols();
    state.keptSymbols = [...INITIAL_KEPT_SYMBOLS];
    state.keptScrolls = [];
    state.unlockedSlots = { 3: false, 4: false, 5: false };
    state.levelUpPerks = [];
    state.hasSeenTutorial = hasSeenTutorial;
    state.gold = startingStats.gold;
    state.moves = GAME_CONSTANTS.INITIAL_MOVES;
    state.playerHp = startingStats.playerHp;
    state.playerMaxHp = startingStats.playerMaxHp;
    state.playerBaseAtk = startingStats.playerBaseAtk;
    state.playerMagic = GAME_CONSTANTS.INITIAL_PLAYER_MAGIC;
    state.playerGear = GAME_CONSTANTS.INITIAL_PLAYER_GEAR;
    state.isFirstEnemyAttack = true;
    state.conjureMagicUsed = false;
    state.magicScrollUsed = false;
    state.battleCount = 1;
    state.globalEnemyHpDebuff = 0;
    state.enemy1 = makeEnemy(BATTLE_ROUNDS[0].e1);
    state.enemy2 = makeEnemy(BATTLE_ROUNDS[0].e2!);
};

export const useGameStore = create<GameState>()(
    persist(
        immer((set) => ({
            grid: generateRandomSymbols(),
            keptSymbols: [null, null, null, null, null, null],
            keptScrolls: [],
            unlockedSlots: { 3: false, 4: false, 5: false },
            levelUpPerks: [],
            hasSeenTutorial: false,
            pendingNextRunBonuses: createEmptyNextRunBonuses(),

            gold: initialRunStartStats.gold,
            moves: GAME_CONSTANTS.INITIAL_MOVES,

            // Battle Stats
            playerHp: initialRunStartStats.playerHp,
            playerMaxHp: initialRunStartStats.playerMaxHp,
            playerBaseAtk: initialRunStartStats.playerBaseAtk,
            playerMagic: GAME_CONSTANTS.INITIAL_PLAYER_MAGIC,
            playerGear: GAME_CONSTANTS.INITIAL_PLAYER_GEAR,
            isFirstEnemyAttack: true,
            conjureMagicUsed: false,
            magicScrollUsed: false,
            battleCount: 1,
            globalEnemyHpDebuff: 0,

            enemy1: makeEnemy(BATTLE_ROUNDS[0].e1),
            enemy2: makeEnemy(BATTLE_ROUNDS[0].e2!),

            spinBoard: () => set((state) => {
                if (state.gold < GAME_CONSTANTS.SPIN_COST) return;
                state.gold -= GAME_CONSTANTS.SPIN_COST;
                state.grid = generateRandomSymbols();
            }),

            payForShuffle: () => {
                let success = false;
                set((state) => {
                    if (state.gold >= GAME_CONSTANTS.SHUFFLE_COST) {
                        state.gold -= GAME_CONSTANTS.SHUFFLE_COST;
                        success = true;
                    }
                });
                return success;
            },

            applySwaps: (swaps) => set((state) => {
                for (const [i, j] of swaps) {
                    const temp = state.grid[i];
                    state.grid[i] = state.grid[j];
                    state.grid[j] = temp;
                }
            }),

            slideRogue: (fromIndex, toIndex, isBoosted = false) => {
                let result: SlideResult | null = null;

                set((state) => {
                    const character = state.grid[fromIndex];
                    if (!character || character.name !== "hood") return;

                    if (state.gold < GAME_CONSTANTS.MOVE_COST) return;
                    state.gold -= GAME_CONSTANTS.MOVE_COST;

                    const effects: SlideEffect[] = [];

                    const pCoords = getCoordinates(fromIndex);
                    const tCoords = getCoordinates(toIndex);

                    const targetSymbol = state.grid[toIndex];
                    const targetHasKey = targetSymbol?.name === 'key';

                    if (targetSymbol) {
                        const category = SYMBOL_CATEGORIES[targetSymbol.name];
                        const expMultiplier = state.levelUpPerks.includes("nature_2x_exp") ? 2 : 1;
                        if (category === 'Treasure' || category === 'Nature') {
                            switch (targetSymbol.name) {
                                case 'clover': {
                                    const exp = (isBoosted ? 4 : 2) * expMultiplier;
                                    const magic = isBoosted ? 4 : 2;
                                    addExperience(state, exp);
                                    state.playerMagic += magic;
                                    effects.push({ stat: 'EXP', amount: exp }, { stat: 'Magic', amount: magic });
                                    break;
                                }
                                case 'pine-tree': {
                                    const exp = (isBoosted ? 8 : 4) * expMultiplier;
                                    addExperience(state, exp);
                                    effects.push({ stat: 'EXP', amount: exp });
                                    break;
                                }
                                case 'dead-tree': {
                                    const exp = -3 * expMultiplier;
                                    const magic = isBoosted ? 10 : 5;
                                    addExperience(state, exp);
                                    state.playerMagic += magic;
                                    effects.push({ stat: 'EXP', amount: exp }, { stat: 'Magic', amount: magic });
                                    break;
                                }
                                case 'gold-bar': {
                                    const gold = isBoosted ? 32 : 16;
                                    state.gold += gold;
                                    effects.push({ stat: 'Gold', amount: gold });
                                    break;
                                }
                                case 'gem-pendant': {
                                    const gold = isBoosted ? 16 : 8;
                                    const gear = isBoosted ? 4 : 2;
                                    state.gold += gold; state.playerGear += gear;
                                    effects.push({ stat: 'Gold', amount: gold }, { stat: 'Gear', amount: gear });
                                    break;
                                }
                            }
                        }
                    }

                    // Clear path logically
                    if (pCoords.row === tCoords.row) { // Horizontal
                        const min = Math.min(pCoords.col, tCoords.col);
                        const max = Math.max(pCoords.col, tCoords.col);
                        for (let c = min; c <= max; c++) state.grid[getIndex(pCoords.row, c)] = null;
                    } else { // Vertical
                        const min = Math.min(pCoords.row, tCoords.row);
                        const max = Math.max(pCoords.row, tCoords.row);
                        for (let r = min; r <= max; r++) state.grid[getIndex(r, pCoords.col)] = null;
                    }

                    state.grid[toIndex] = { ...character };

                    if (targetHasKey) {
                        if (!state.unlockedSlots[3]) { state.unlockedSlots[3] = true; effects.push({ stat: 'Slot', amount: 1 }); }
                        else if (!state.unlockedSlots[4]) { state.unlockedSlots[4] = true; effects.push({ stat: 'Slot', amount: 1 }); }
                        else if (!state.unlockedSlots[5]) { state.unlockedSlots[5] = true; effects.push({ stat: 'Slot', amount: 1 }); }
                        else if (state.keptScrolls.includes('special-scroll')) {
                            const gold = isBoosted ? 32 : 16;
                            state.gold += gold;
                            effects.push({ stat: 'Gold', amount: gold });
                        }
                    }

                    result = { goldCost: GAME_CONSTANTS.MOVE_COST, effects };
                });

                return result;
            },

            equipSymbol: (symbol, isBoosted = false) => {
                let spentGold: number | null = null;

                set((state) => {
                    if (symbol.name === 'key') return;

                    const category = SYMBOL_CATEGORIES[symbol.name];
                    const keepCost = (category === 'Weapon' && state.keptScrolls.includes('weapon-scroll')) ? 0 : GAME_CONSTANTS.EQUIP_SYMBOL_COST;

                    if (state.gold < keepCost) return;
                    const sameCategoryCount = state.keptSymbols.filter(
                        keptSymbol => keptSymbol && SYMBOL_CATEGORIES[keptSymbol.name] === category
                    ).length;

                    if (sameCategoryCount >= 2) return;

                    const availableSlots = [0, 1, 2];
                    if (state.unlockedSlots[3]) availableSlots.push(3);
                    if (state.unlockedSlots[4]) availableSlots.push(4);
                    if (state.unlockedSlots[5]) availableSlots.push(5);

                    const emptySlotIndex = availableSlots.find(slot => state.keptSymbols[slot] === null);
                    if (emptySlotIndex !== undefined) {
                        state.gold -= keepCost;
                        spentGold = keepCost;
                        state.grid = state.grid.map(s => s?.id === symbol.id ? null : s);
                        state.keptSymbols[emptySlotIndex] = { name: symbol.name, battleCount: 2, isBoosted };

                        const foodMultiplier = state.keptScrolls.includes('food-scroll') && SYMBOL_CATEGORIES[symbol.name as SymbolName] === 'Food' ? 2 : 1;

                        switch (symbol.name) {
                            case 'apple': state.playerHp = Math.min(calculateTotalMaxHp(state), state.playerHp + (isBoosted ? 30 : 15) * foodMultiplier); break;
                            case 'crab-claw':
                                state.playerMaxHp += (isBoosted ? 6 : 3) * foodMultiplier;
                                addExperience(state, (isBoosted ? 2 : 1) * foodMultiplier);
                                for (let i = 0; i < foodMultiplier; i++) {
                                    damageRandomEnemy(state, 1);
                                }
                                break;
                            case 'brandy-bottle':
                                for (let i = 0; i < foodMultiplier; i++) {
                                    state.playerHp = Math.max(0, state.playerHp - (isBoosted ? 20 : 10));
                                    const bonusMaxHp = (isBoosted ? 10 : 5) + (state.levelUpPerks.length >= 2 ? (isBoosted ? 2 : 1) : 0);
                                    state.playerMaxHp += bonusMaxHp;
                                }
                                break;
                            case 'axe':
                                state.playerBaseAtk += (isBoosted ? 6 : 3);
                                state.playerGear += (isBoosted ? 4 : 2);
                                break;
                            case 'relic-blade':
                            case 'daggers': state.playerBaseAtk += (isBoosted ? 2 : 1); state.playerGear += (isBoosted ? 2 : 1); break;
                            case 'crossbow': state.playerBaseAtk += (isBoosted ? 2 : 1); state.playerGear += (isBoosted ? 8 : 4); break;
                            case 'shield': state.playerGear += (isBoosted ? 14 : 7); break;
                            case 'knight-helmet': state.playerGear += (isBoosted ? 4 : 2); break;
                            case 'crystal-wand':
                                state.playerMagic += (isBoosted ? 6 : 3); break;
                            case 'fairy-wand': state.playerMagic += (isBoosted ? 12 : 6); break;
                            case 'bell': state.playerBaseAtk = Math.max(0, state.playerBaseAtk - (isBoosted ? 4 : 2)); break;
                        }
                    }
                });

                return spentGold;
            },

            removeGridSymbol: (id) => set((state) => {
                state.grid = state.grid.map(s => s?.id === id ? null : s);
            }),

            addKeptScroll: (name) => set((state) => {
                if (state.keptScrolls.length < GAME_CONSTANTS.MAX_KEPT_SCROLLS) {
                    state.keptScrolls.push(name);
                }
            }),

            spendGold: (amount) => set((state) => {
                state.gold = Math.max(0, state.gold - amount);
            }),

            applyBattleDamage: (target, amount) => set((state) => {
                if (target === 'player') {
                    let finalDamage = amount;

                    if (state.playerGear > 3) {
                        const helmetCount = state.keptSymbols.filter(symbol => symbol?.name === 'knight-helmet').length;
                        finalDamage = Math.max(0, finalDamage - helmetCount);
                    }

                    const hasShield = state.keptSymbols.some(symbol => symbol?.name === 'shield');
                    if (hasShield && state.playerGear > 0 && finalDamage > 0) {
                        const absorbedDamage = Math.min(state.playerGear, finalDamage);
                        state.playerGear -= absorbedDamage;
                        finalDamage -= absorbedDamage;
                    }

                    if (state.playerHp - finalDamage <= 0 && state.keptScrolls.includes('magic-scroll') && !state.magicScrollUsed) {
                        state.playerMagic += amount;
                        finalDamage = 0;
                        state.magicScrollUsed = true;
                    }

                    state.isFirstEnemyAttack = false;
                    state.playerHp = Math.max(0, state.playerHp - finalDamage);
                    state.playerHp = Math.min(state.playerHp, calculateTotalMaxHp(state));
                } else if (target === 'enemy1') {
                    state.enemy1.hp = Math.max(0, state.enemy1.hp - amount);
                } else if (target === 'enemy2') {
                    state.enemy2.hp = Math.max(0, state.enemy2.hp - amount);
                }
            }),

            setEnemyVisibility: (target, isVisible) => set((state) => {
                if (target === 'enemy1') {
                    state.enemy1.isVisible = isVisible;
                } else if (target === 'enemy2') {
                    state.enemy2.isVisible = isVisible;
                }
            }),

            applyLevelUp: (perk) => set((state) => {
                if (state.moves < GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED) return;
                if (perk !== 'full_heal' && state.levelUpPerks.includes(perk)) return;

                state.moves = GAME_CONSTANTS.INITIAL_MOVES;

                if (perk === "full_heal_max_hp") {
                    state.playerMaxHp += GAME_CONSTANTS.LEVEL_UP_MAX_HP_BONUS;
                    state.playerHp = calculateTotalMaxHp(state);
                    state.levelUpPerks.push(perk);
                } else if (perk === "nature_2x_exp") {
                    state.levelUpPerks.push(perk);
                } else if (perk === "gain_40_gold") {
                    state.gold += GAME_CONSTANTS.LEVEL_UP_GOLD_REWARD;
                    state.levelUpPerks.push(perk);
                } else if (perk === "full_heal") {
                    state.playerHp = calculateTotalMaxHp(state);
                    state.levelUpPerks.push(perk);
                }
            }),

            resetBattleTarget: () => set((state) => {
                const round = getNextBattleRound(state.battleCount, BATTLE_ROUNDS);
                if (!round) {
                    state.battleCount = getCompletedRunBattleCount(GAME_CONSTANTS.MAX_BATTLES);
                    return;
                }

                for (let i = 0; i < state.keptSymbols.length; i++) {
                    const keptSymbol = state.keptSymbols[i];
                    if (keptSymbol !== null) {
                        keptSymbol.battleCount -= 1;
                        if (keptSymbol.battleCount <= 0) {
                            if (keptSymbol.name === 'apple') {
                                const foodMultiplier = state.keptScrolls.includes('food-scroll') ? 2 : 1;
                                state.playerHp = Math.min(calculateTotalMaxHp(state), state.playerHp + (keptSymbol.isBoosted ? 30 : 15) * foodMultiplier);
                            }
                            state.keptSymbols[i] = null;
                        }
                    }
                }

                state.isFirstEnemyAttack = true;
                state.conjureMagicUsed = false;

                const d = state.globalEnemyHpDebuff;
                state.enemy1 = makeEnemy(round.e1, d);
                state.enemy2 = round.e2
                    ? makeEnemy(round.e2, d)
                    : { name: 'octopus', hp: 0, maxHp: 0, atk: 0, lvl: round.e1.lvl, type: '---', isVisible: false };

                state.battleCount += 1;
            }),

            restartRun: () => {
                let startingBonuses = createEmptyNextRunBonuses();
                set((state) => {
                    const resetContext = getRunResetContext(state.pendingNextRunBonuses, state.hasSeenTutorial, 'retry');
                    startingBonuses = resetContext.bonusesToApply;
                    resetRunState(state, resetContext.bonusesToApply, { hasSeenTutorial: resetContext.hasSeenTutorial });
                    state.pendingNextRunBonuses = resetContext.remainingBonuses;
                });
                return startingBonuses;
            },

            hardResetGame: () => set((state) => {
                const resetContext = getRunResetContext(state.pendingNextRunBonuses, state.hasSeenTutorial, 'hard-reset');
                resetRunState(state, resetContext.bonusesToApply, { hasSeenTutorial: resetContext.hasSeenTutorial });
                state.pendingNextRunBonuses = resetContext.remainingBonuses;
            }),

            applyConjureMagic: (result) => set((state) => {
                if (state.conjureMagicUsed) return;
                const magic = state.playerMagic;
                switch (result) {
                    case 'two-hearts':
                        state.playerHp = Math.min(calculateTotalMaxHp(state), state.playerHp + magic);
                        break;
                    case 'sapphire':
                        state.gold += magic;
                        break;
                    case 'lightning-trio':
                        state.enemy1.hp = Math.max(0, state.enemy1.hp - magic);
                        if (state.enemy2.isVisible) {
                            state.enemy2.hp = Math.max(0, state.enemy2.hp - magic);
                        }
                        break;
                }
                state.conjureMagicUsed = true;
            }),

            incrementEnemyDebuff: (amount) => set((state) => {
                state.globalEnemyHpDebuff += amount;
            }),

            setHasSeenTutorial: (value) => set((state) => {
                state.hasSeenTutorial = value;
            }),

            claimWaveReward: (reward) => set((state) => {
                const rewardBonuses = getRewardBonuses(reward);
                applyBonusesToCurrentRun(state, rewardBonuses);
                state.pendingNextRunBonuses = addNextRunReward(state.pendingNextRunBonuses, reward);
            }),

        })),
        {
            name: 'daily-rogue-storage',
            version: 8,
            migrate: (persistedState: unknown, version) => {
                if (!persistedState || typeof persistedState !== 'object') {
                    return persistedState as GameState;
                }

                const state = persistedState as Record<string, unknown>;

                // v1 → v2: rename keptIcons to keptSymbols
                if (version < 2) {
                    if (!state.keptSymbols && Array.isArray(state.keptIcons)) {
                        state.keptSymbols = state.keptIcons;
                    }
                }

                if (version < 4) {
                    const { grid, hadInvalidContent: gridHadInvalidContent } = sanitizePersistedGrid(state.grid);
                    const { keptSymbols, hadInvalidContent: keptSymbolsHadInvalidContent } = sanitizePersistedKeptSymbols(state.keptSymbols);
                    const { keptScrolls, hadInvalidContent: keptScrollsHadInvalidContent } = sanitizePersistedKeptScrolls(state.keptScrolls);
                    const shouldResetRun = gridHadInvalidContent || keptSymbolsHadInvalidContent || keptScrollsHadInvalidContent;

                    if (shouldResetRun) {
                        resetRunState(state as unknown as GameState, createEmptyNextRunBonuses());
                    } else {
                        state.grid = grid;
                        state.keptSymbols = keptSymbols;
                        state.keptScrolls = keptScrolls;
                    }

                    const activeKeptScrolls = state.keptScrolls as SymbolName[];

                    if (typeof state.playerHp === 'number' && typeof state.playerMaxHp === 'number' && typeof state.playerGear === 'number') {
                        state.playerHp = Math.min(
                            state.playerHp,
                            calculateTotalMaxHp({
                                playerMaxHp: state.playerMaxHp,
                                keptScrolls: activeKeptScrolls,
                                playerGear: state.playerGear,
                            })
                        );
                    }
                }

                if (version < 5) {
                    state.moves = typeof state.moves === 'number'
                        ? clampExperience(state.moves)
                        : GAME_CONSTANTS.INITIAL_MOVES;

                    state.levelUpPerks = Array.isArray(state.levelUpPerks)
                        ? state.levelUpPerks.filter(isLevelUpPerk)
                        : [];
                }

                if (version < 6) {
                    state.pendingNextRunBonuses = createEmptyNextRunBonuses();
                } else if (version < 8) {
                    state.pendingNextRunBonuses = sanitizePersistedNextRunBonuses(
                        state.savedNextRunBonuses ?? state.queuedNextRunBonuses
                    );
                    delete state.savedNextRunBonuses;
                    delete state.queuedNextRunBonuses;
                } else {
                    state.pendingNextRunBonuses = sanitizePersistedNextRunBonuses(state.pendingNextRunBonuses);
                }

                return state as unknown as GameState;
            },
        }
    )
);

export const selectTotalAttack = (state: GameState) => {
    const hasCrystalWand = state.keptSymbols.some(symbol => symbol?.name === 'crystal-wand');
    const magicBonus = hasCrystalWand ? state.playerMagic : 0;
    const relicBladeBonus = state.keptSymbols.some(symbol => symbol?.name === 'relic-blade') ? state.moves : 0;
    return state.playerBaseAtk + magicBonus + relicBladeBonus;
};

export const selectTotalMaxHp = (state: GameState) => calculateTotalMaxHp(state);

export const selectHasDaggers = (state: GameState) =>
    state.keptSymbols.some(symbol => symbol?.name === 'daggers');

export const selectCrossbowCount = (state: GameState) =>
    state.keptSymbols.filter(symbol => symbol?.name === 'crossbow').length;

export const selectShuffleCost = (state: GameState) => {
    void state;
    return GAME_CONSTANTS.SHUFFLE_COST;
};

export const selectHasTwoFairyWands = (state: GameState) =>
    state.keptSymbols.filter(symbol => symbol?.name === 'fairy-wand').length >= 2;

export const selectAxeActive = (state: GameState) => {
    const hasAxe = state.keptSymbols.some(symbol => symbol?.name === 'axe');
    if (!hasAxe) return false;
    const hasOtherWeapon = state.keptSymbols.some(symbol => symbol && symbol.name !== 'axe' && SYMBOL_CATEGORIES[symbol.name] === 'Weapon');
    return !hasOtherWeapon;
};

export const selectBellCount = (state: GameState) => {
    const bells = state.keptSymbols.filter(symbol => symbol?.name === 'bell');
    if (bells.length === 0) return 0;
    return bells.some(b => b?.isBoosted) ? 2 : 1;
};
