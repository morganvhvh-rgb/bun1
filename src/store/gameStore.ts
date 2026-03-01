import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GridItem, IconName, KeptIcon } from '@/types/game';
import { ICON_KEYS, ICON_CATEGORIES, GAME_CONSTANTS, INITIAL_ENEMIES } from '@/lib/constants';
import { getCoordinates, getIndex } from '@/lib/utils';

interface GameState {
    // Grid State
    grid: (GridItem | null)[];
    keptIcons: (KeptIcon | null)[];
    keptScrolls: IconName[];
    unlockedSlots: { 3: boolean; 4: boolean; 5: boolean };

    // Progression
    levelUpPerks: string[];
    hasSeenTutorial: boolean;

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
    itemScrollClaimed: boolean;
    magicScrollUsed: boolean;
    battleCount: number;
    globalEnemyHpDebuff: number;

    enemy1: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number; type: string };
    enemy2: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number; type: string };

    // Actions
    spinBoard: () => void;
    payForShuffle: () => boolean;
    applySwaps: (swaps: [number, number][]) => void;
    moveCharacter: (fromIndex: number, toIndex: number, isBoosted?: boolean) => void;
    keepItem: (item: GridItem, isBoosted?: boolean) => void;
    removeGridItem: (id: string) => void;
    addKeptScroll: (name: IconName) => void;
    spendGold: (amount: number) => void;
    resetBattleTarget: () => void;
    resetGame: () => void;
    incrementEnemyDebuff: (amount: number) => void;
    setHasSeenTutorial: (value: boolean) => void;

    // Battle updates
    applyBattleDamage: (target: 'player' | 'enemy1' | 'enemy2', amount: number) => void;
    setEnemyVisibility: (target: 'enemy1' | 'enemy2', isVisible: boolean) => void;
    applyLevelUp: (perk: "full_heal_max_hp" | "nature_2x_exp" | "full_heal") => void;
    applyConjureMagic: (result: 'two-hearts' | 'sapphire' | 'lightning-trio') => void;
    healPlayer: (amount: number) => void;
}

const generateRandomIcons = (): GridItem[] => {
    const totalSlots = 12;
    const characterIndex = Math.floor(Math.random() * totalSlots);

    return Array.from({ length: totalSlots }, (_, index) => {
        if (index === characterIndex) {
            return {
                id: crypto.randomUUID(),
                name: "hood" as IconName
            };
        }
        const randomIndex = Math.floor(Math.random() * ICON_KEYS.length);
        const name = ICON_KEYS[randomIndex];
        return {
            id: crypto.randomUUID(),
            name: name
        };
    });
};

const calculateTotalMaxHp = (state: { playerMaxHp: number; keptScrolls: IconName[]; playerGear: number }) => {
    let bonus = 0;
    if (state.keptScrolls.includes('armor-scroll')) {
        bonus = Math.floor(state.playerGear / 5) * 2;
    }
    return state.playerMaxHp + bonus;
};

export const useGameStore = create<GameState>()(
    persist(
        immer((set) => ({
            grid: generateRandomIcons(),
            keptIcons: [null, null, null, null, null, null],
            keptScrolls: [],
            unlockedSlots: { 3: false, 4: false, 5: false },
            levelUpPerks: [],
            hasSeenTutorial: false,

            gold: GAME_CONSTANTS.INITIAL_GOLD,
            moves: GAME_CONSTANTS.INITIAL_MOVES,

            // Battle Stats
            playerHp: GAME_CONSTANTS.INITIAL_PLAYER_HP,
            playerMaxHp: GAME_CONSTANTS.INITIAL_PLAYER_HP,
            playerBaseAtk: GAME_CONSTANTS.INITIAL_PLAYER_ATK,
            playerMagic: GAME_CONSTANTS.INITIAL_PLAYER_MAGIC,
            playerGear: GAME_CONSTANTS.INITIAL_PLAYER_GEAR,
            isFirstEnemyAttack: true,
            conjureMagicUsed: false,
            itemScrollClaimed: false,
            magicScrollUsed: false,
            battleCount: 1,
            globalEnemyHpDebuff: 0,

            enemy1: { ...INITIAL_ENEMIES.wyvern },
            enemy2: { ...INITIAL_ENEMIES.octopus },

            spinBoard: () => set((state) => {
                if (state.gold < GAME_CONSTANTS.SPIN_COST) return;
                state.gold -= GAME_CONSTANTS.SPIN_COST;
                state.grid = generateRandomIcons();
            }),

            payForShuffle: () => {
                let success = false;
                set((state) => {
                    const hasSpadesCard = state.keptIcons.some(item => item?.name === 'spades-card');
                    const cost = (hasSpadesCard && state.moves < 3) ? 1 : GAME_CONSTANTS.SHUFFLE_COST;

                    if (state.gold >= cost) {
                        state.gold -= cost;
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

            moveCharacter: (fromIndex, toIndex, isBoosted = false) => set((state) => {
                const character = state.grid[fromIndex];
                if (!character || character.name !== "hood") return;

                if (state.gold < GAME_CONSTANTS.MOVE_COST) return;
                state.gold -= GAME_CONSTANTS.MOVE_COST;

                const pCoords = getCoordinates(fromIndex);
                const tCoords = getCoordinates(toIndex);

                const targetItem = state.grid[toIndex];
                const targetHasKey = targetItem?.name === 'key';

                if (targetItem) {
                    const category = ICON_CATEGORIES[targetItem.name];
                    const expMultiplier = state.levelUpPerks.includes("nature_2x_exp") ? 2 : 1;
                    if (category === 'Treasure' || category === 'Nature') {
                        switch (targetItem.name) {
                            case 'clover': state.moves += ((isBoosted ? 4 : 2) * expMultiplier); state.playerMagic += (isBoosted ? 4 : 2); break;
                            case 'pine-tree': state.moves += ((isBoosted ? 8 : 4) * expMultiplier); break;
                            case 'dead-tree': state.moves += (-3 * expMultiplier); state.playerMagic += (isBoosted ? 10 : 5); break;
                            case 'gold-bar': state.gold += (isBoosted ? 32 : 16); break;
                            case 'gem-pendant': state.gold += (isBoosted ? 16 : 8); state.playerGear += (isBoosted ? 4 : 2); break;
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
                    if (!state.unlockedSlots[3]) state.unlockedSlots[3] = true;
                    else if (!state.unlockedSlots[4]) state.unlockedSlots[4] = true;
                    else if (!state.unlockedSlots[5]) state.unlockedSlots[5] = true;
                    else if (state.keptScrolls.includes('special-scroll')) {
                        state.gold += (isBoosted ? 32 : 16);
                    }
                }
            }),

            keepItem: (item, isBoosted = false) => set((state) => {
                if (item.name === 'key') return;

                const category = ICON_CATEGORIES[item.name];
                const keepCost = (category === 'Weapon' && state.keptScrolls.includes('weapon-scroll')) ? 0 : GAME_CONSTANTS.KEEP_ITEM_COST;

                if (state.gold < keepCost) return;
                const sameCategoryCount = state.keptIcons.filter(
                    icon => icon && ICON_CATEGORIES[icon.name] === category
                ).length;

                if (sameCategoryCount >= 2) return;

                const availableSlots = [0, 1, 2];
                if (state.unlockedSlots[3]) availableSlots.push(3);
                if (state.unlockedSlots[4]) availableSlots.push(4);
                if (state.unlockedSlots[5]) availableSlots.push(5);

                const emptySlotIndex = availableSlots.find(slot => state.keptIcons[slot] === null);
                if (emptySlotIndex !== undefined) {
                    state.gold -= keepCost;
                    state.grid = state.grid.map(s => s?.id === item.id ? null : s);
                    state.keptIcons[emptySlotIndex] = { name: item.name, battleCount: 2, isBoosted };

                    const foodMultiplier = state.keptScrolls.includes('food-scroll') && ICON_CATEGORIES[item.name as IconName] === 'Food' ? 2 : 1;

                    switch (item.name) {
                        case 'apple': state.playerHp = Math.min(calculateTotalMaxHp(state), state.playerHp + (isBoosted ? 20 : 10) * foodMultiplier); break;
                        case 'crab-claw':
                            state.playerMaxHp += (isBoosted ? 6 : 3) * foodMultiplier;
                            state.moves += (isBoosted ? 2 : 1) * foodMultiplier;
                            break;
                        case 'brandy-bottle':
                            for (let i = 0; i < foodMultiplier; i++) {
                                state.playerHp = Math.max(0, state.playerHp - (isBoosted ? 20 : 10));
                                state.playerMaxHp += (isBoosted ? 10 : 5);
                            }
                            break;
                        case 'relic-blade':
                        case 'daggers': state.playerBaseAtk += (isBoosted ? 2 : 1); state.playerGear += (isBoosted ? 2 : 1); break;
                        case 'crossbow': state.playerBaseAtk += (isBoosted ? 2 : 1); state.playerGear += (isBoosted ? 8 : 4); break;
                        case 'shield': state.playerGear += (isBoosted ? 10 : 5); break;
                        case 'knight-helmet': state.playerGear += (isBoosted ? 4 : 2); break;
                        case 'crystal-wand':
                            state.playerMagic += (isBoosted ? 10 : 5); break;
                        case 'fairy-wand': state.playerMagic += (isBoosted ? 6 : 3); break;
                        case 'bell':
                        case 'ocarina': state.playerBaseAtk = Math.max(0, state.playerBaseAtk - 1); break;
                    }

                    if (state.keptScrolls.includes('item-scroll') && !state.itemScrollClaimed) {
                        const itemCount = state.keptIcons.filter(i => i && ICON_CATEGORIES[i.name] === 'Item').length;
                        if (itemCount >= 2) {
                            state.gold += 80;
                            state.itemScrollClaimed = true;
                        }
                    }
                }
            }),

            removeGridItem: (id) => set((state) => {
                state.grid = state.grid.map(s => s?.id === id ? null : s);
            }),

            addKeptScroll: (name) => set((state) => {
                if (state.keptScrolls.length < GAME_CONSTANTS.MAX_KEPT_SCROLLS) {
                    state.keptScrolls.push(name);

                    if (name === 'item-scroll' && !state.itemScrollClaimed) {
                        const itemCount = state.keptIcons.filter(i => i && ICON_CATEGORIES[i.name] === 'Item').length;
                        if (itemCount >= 2) {
                            state.gold += 80;
                            state.itemScrollClaimed = true;
                        }
                    }
                }
            }),

            spendGold: (amount) => set((state) => {
                state.gold = Math.max(0, state.gold - amount);
            }),

            applyBattleDamage: (target, amount) => set((state) => {
                if (target === 'player') {
                    let finalDamage = amount;

                    if (state.playerGear > 3) {
                        const helmetCount = state.keptIcons.filter(item => item?.name === 'knight-helmet').length;
                        finalDamage = Math.max(0, finalDamage - helmetCount);
                    }

                    if (state.isFirstEnemyAttack) {
                        const hasShield = state.keptIcons.some(item => item?.name === 'shield');
                        if (hasShield) {
                            state.playerGear = Math.max(0, state.playerGear - finalDamage);
                            finalDamage = 0;
                        }
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
                state.moves -= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED;

                if (perk === "full_heal_max_hp") {
                    state.playerMaxHp += 10;
                    state.playerHp = calculateTotalMaxHp(state);
                    state.levelUpPerks.push(perk);
                } else if (perk === "nature_2x_exp") {
                    state.levelUpPerks.push(perk);
                } else if (perk === "full_heal") {
                    state.playerHp = calculateTotalMaxHp(state);
                    state.levelUpPerks.push(perk);
                }
            }),

            resetBattleTarget: () => set((state) => {
                if (state.battleCount >= GAME_CONSTANTS.MAX_BATTLES) {
                    state.battleCount = GAME_CONSTANTS.MAX_BATTLES + 1;
                    return;
                }

                for (let i = 0; i < state.keptIcons.length; i++) {
                    const icon = state.keptIcons[i];
                    if (icon !== null) {
                        icon.battleCount -= 1;
                        if (icon.battleCount <= 0) {
                            if (icon.name === 'apple') {
                                const foodMultiplier = state.keptScrolls.includes('food-scroll') ? 2 : 1;
                                state.playerHp = Math.min(calculateTotalMaxHp(state), state.playerHp + (icon.isBoosted ? 20 : 10) * foodMultiplier);
                            }
                            state.keptIcons[i] = null;
                        }
                    }
                }

                state.isFirstEnemyAttack = true;
                state.conjureMagicUsed = false;

                if (state.battleCount === 4) {
                    state.enemy1 = { ...INITIAL_ENEMIES.wyvern, hp: Math.max(1, 50 - state.globalEnemyHpDebuff), maxHp: Math.max(1, 50 - state.globalEnemyHpDebuff), atk: 11, lvl: 2 };
                    state.enemy2 = { ...INITIAL_ENEMIES.octopus, hp: Math.max(1, 50 - state.globalEnemyHpDebuff), maxHp: Math.max(1, 50 - state.globalEnemyHpDebuff), atk: 11, lvl: 2 };
                } else if (state.enemy1.name === 'wyvern') {
                    const isLvl2 = state.enemy1.lvl === 2;
                    const baseHp1 = isLvl2 ? 50 : INITIAL_ENEMIES['monster-skull'].hp;
                    const baseHp2 = isLvl2 ? 50 : INITIAL_ENEMIES.snail.hp;
                    state.enemy1 = { ...INITIAL_ENEMIES['monster-skull'], hp: Math.max(1, baseHp1 - state.globalEnemyHpDebuff), maxHp: Math.max(1, baseHp1 - state.globalEnemyHpDebuff), atk: isLvl2 ? 11 : INITIAL_ENEMIES['monster-skull'].atk, lvl: isLvl2 ? 2 : 1 };
                    state.enemy2 = { ...INITIAL_ENEMIES.snail, hp: Math.max(1, baseHp2 - state.globalEnemyHpDebuff), maxHp: Math.max(1, baseHp2 - state.globalEnemyHpDebuff), atk: isLvl2 ? 11 : INITIAL_ENEMIES.snail.atk, lvl: isLvl2 ? 2 : 1 };
                } else if (state.enemy1.name === 'monster-skull') {
                    const isLvl2 = state.enemy1.lvl === 2;
                    const baseHp1 = isLvl2 ? 50 : INITIAL_ENEMIES.hydra.hp;
                    const baseHp2 = isLvl2 ? 50 : INITIAL_ENEMIES['spider-face'].hp;
                    state.enemy1 = { ...INITIAL_ENEMIES.hydra, hp: Math.max(1, baseHp1 - state.globalEnemyHpDebuff), maxHp: Math.max(1, baseHp1 - state.globalEnemyHpDebuff), atk: isLvl2 ? 11 : INITIAL_ENEMIES.hydra.atk, lvl: isLvl2 ? 2 : 1 };
                    state.enemy2 = { ...INITIAL_ENEMIES['spider-face'], hp: Math.max(1, baseHp2 - state.globalEnemyHpDebuff), maxHp: Math.max(1, baseHp2 - state.globalEnemyHpDebuff), atk: isLvl2 ? 11 : INITIAL_ENEMIES['spider-face'].atk, lvl: isLvl2 ? 2 : 1 };
                } else if (state.enemy1.name === 'hydra') {
                    const isLvl2 = state.enemy1.lvl === 2;
                    const baseHp1 = isLvl2 ? 150 : INITIAL_ENEMIES['eye-monster'].hp;
                    state.enemy1 = { ...INITIAL_ENEMIES['eye-monster'], hp: Math.max(1, baseHp1 - state.globalEnemyHpDebuff), maxHp: Math.max(1, baseHp1 - state.globalEnemyHpDebuff), atk: isLvl2 ? 33 : INITIAL_ENEMIES['eye-monster'].atk, lvl: isLvl2 ? 2 : 1 };
                    state.enemy2 = { ...INITIAL_ENEMIES.octopus, hp: 0, maxHp: 0, atk: 0, isVisible: false, lvl: isLvl2 ? 2 : 1 };
                }

                state.battleCount += 1;
            }),

            resetGame: () => set((state) => {
                state.grid = generateRandomIcons();
                state.keptIcons = [null, null, null, null, null, null];
                state.keptScrolls = [];
                state.unlockedSlots = { 3: false, 4: false, 5: false };
                state.levelUpPerks = [];
                state.hasSeenTutorial = false;
                state.gold = GAME_CONSTANTS.INITIAL_GOLD;
                state.moves = GAME_CONSTANTS.INITIAL_MOVES;
                state.playerHp = GAME_CONSTANTS.INITIAL_PLAYER_HP;
                state.playerMaxHp = GAME_CONSTANTS.INITIAL_PLAYER_HP;
                state.playerBaseAtk = GAME_CONSTANTS.INITIAL_PLAYER_ATK;
                state.playerMagic = GAME_CONSTANTS.INITIAL_PLAYER_MAGIC;
                state.playerGear = GAME_CONSTANTS.INITIAL_PLAYER_GEAR;
                state.isFirstEnemyAttack = true;
                state.conjureMagicUsed = false;
                state.itemScrollClaimed = false;
                state.magicScrollUsed = false;
                state.battleCount = 1;
                state.globalEnemyHpDebuff = 0;
                state.enemy1 = { ...INITIAL_ENEMIES.wyvern };
                state.enemy2 = { ...INITIAL_ENEMIES.octopus };
            }),

            applyConjureMagic: (result) => set((state) => {
                if (state.conjureMagicUsed) return;
                const hasBook = state.keptIcons.some(item => item?.name === 'book');
                const multiplier = hasBook ? 2 : 1;
                const magic = state.playerMagic * multiplier;
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

            healPlayer: (amount) => set((state) => {
                state.playerHp = Math.min(calculateTotalMaxHp(state), state.playerHp + amount);
            }),

            setHasSeenTutorial: (value) => set((state) => {
                state.hasSeenTutorial = value;
            }),

        })),
        {
            name: 'daily-rogue-storage',
            version: 1,
        }
    )
);

export const selectTotalAttack = (state: GameState) => {
    const hasCrystalWand = state.keptIcons.some(item => item?.name === 'crystal-wand');
    const magicBonus = hasCrystalWand ? state.playerMagic : 0;
    const relicBladeBonus = state.keptIcons.some(item => item?.name === 'relic-blade') ? state.moves : 0;
    return state.playerBaseAtk + magicBonus + relicBladeBonus;
};

export const selectTotalMaxHp = (state: GameState) => calculateTotalMaxHp(state);

export const selectHasDaggers = (state: GameState) =>
    state.keptIcons.some(item => item?.name === 'daggers');

export const selectCrossbowCount = (state: GameState) =>
    state.keptIcons.filter(item => item?.name === 'crossbow').length;

export const selectShuffleCost = (state: GameState) => {
    const hasSpadesCard = state.keptIcons.some(item => item?.name === 'spades-card');
    return (hasSpadesCard && state.moves < 3) ? 1 : GAME_CONSTANTS.SHUFFLE_COST;
};

export const selectHasTwoFairyWands = (state: GameState) =>
    state.keptIcons.filter(item => item?.name === 'fairy-wand').length >= 2;

export const selectAxeActive = (state: GameState) => {
    const hasAxe = state.keptIcons.some(item => item?.name === 'axe');
    if (!hasAxe) return false;
    const hasOtherWeapon = state.keptIcons.some(item => item && item.name !== 'axe' && ICON_CATEGORIES[item.name] === 'Weapon');
    return !hasOtherWeapon;
};

export const selectBellCount = (state: GameState) =>
    state.keptIcons.filter(item => item?.name === 'bell').length;

export const selectHasOcarina = (state: GameState) =>
    state.keptIcons.some(item => item?.name === 'ocarina');
