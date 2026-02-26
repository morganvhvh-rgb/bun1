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
    unlockedSections: { 0: boolean; 1: boolean; 2: boolean };
    isUnlockingMode: boolean;

    // Progression
    levelUpPerks: string[];

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
    battleCount: number;

    enemy1: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number; type: string };
    enemy2: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number; type: string };

    // Actions
    spinBoard: () => void;
    shuffleBoard: () => void;
    moveCharacter: (fromIndex: number, toIndex: number, isBoosted?: boolean) => void;
    keepItem: (item: GridItem, isBoosted?: boolean) => void;
    removeGridItem: (id: string) => void;
    addKeptScroll: (name: IconName) => void;
    unlockSection: (sectionId: 0 | 1 | 2) => void;
    spendGold: (amount: number) => void;
    resetBattleTarget: () => void;
    resetGame: () => void;

    // Battle updates
    applyBattleDamage: (target: 'player' | 'enemy1' | 'enemy2', amount: number) => void;
    setEnemyVisibility: (target: 'enemy1' | 'enemy2', isVisible: boolean) => void;
    applyLevelUp: (perk: "full_heal_max_hp" | "nature_2x_exp" | "full_heal") => void;
    applyConjureMagic: (result: 'two-hearts' | 'sapphire' | 'lightning-trio') => void;
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

export const useGameStore = create<GameState>()(
    persist(
        immer((set) => ({
            grid: generateRandomIcons(),
            keptIcons: [null, null, null, null, null, null],
            keptScrolls: [],
            unlockedSections: { 0: false, 1: false, 2: false },
            isUnlockingMode: false,
            levelUpPerks: [],

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
            battleCount: 1,

            enemy1: { ...INITIAL_ENEMIES.wyvern },
            enemy2: { ...INITIAL_ENEMIES.octopus },

            spinBoard: () => set((state) => {
                if (state.gold < GAME_CONSTANTS.SPIN_COST) return;
                state.gold -= GAME_CONSTANTS.SPIN_COST;
                state.grid = generateRandomIcons();
            }),

            shuffleBoard: () => set((state) => {
                const hasSpadesCard = state.keptIcons.some(item => item?.name === 'spades-card');
                const cost = (hasSpadesCard && state.moves < 3) ? 1 : GAME_CONSTANTS.SHUFFLE_COST;

                if (state.gold < cost) return;
                state.gold -= cost;
                const newArr = [...state.grid];
                for (let i = newArr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
                }
                state.grid = newArr;
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
                            case 'clover': state.moves += ((isBoosted ? 2 : 1) * expMultiplier); state.playerMagic += (isBoosted ? 2 : 1); break;
                            case 'pine-tree': state.moves += ((isBoosted ? 2 : 1) * expMultiplier); break;
                            case 'zigzag-leaf': state.moves += (-3 * expMultiplier); state.playerMagic += (isBoosted ? 10 : 5); break;
                            case 'gold-bar': state.gold += (isBoosted ? 28 : 14); break;
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
                state.moves += 1;

                if (targetHasKey) {
                    if (!state.unlockedSections[0] || !state.unlockedSections[1] || !state.unlockedSections[2]) {
                        state.isUnlockingMode = true;
                    }
                }
            }),

            keepItem: (item, isBoosted = false) => set((state) => {
                if (item.name === 'key') return;
                if (state.gold < GAME_CONSTANTS.KEEP_ITEM_COST) return;

                const category = ICON_CATEGORIES[item.name];
                let targetSlots: number[] = [];

                if (category === 'Food' || category === 'Item') {
                    if (!state.unlockedSections[0]) return;
                    targetSlots = [0, 1];
                }
                else if (category === 'Armor' || category === 'Magic') {
                    if (!state.unlockedSections[1]) return;
                    targetSlots = [2, 3];
                }
                else if (category === 'Weapon' || category === 'Music') {
                    if (!state.unlockedSections[2]) return;
                    targetSlots = [4, 5];
                }

                if (targetSlots.length > 0) {
                    const emptySlotIndex = targetSlots.find(slot => state.keptIcons[slot] === null);
                    if (emptySlotIndex !== undefined) {
                        state.gold -= GAME_CONSTANTS.KEEP_ITEM_COST;
                        state.grid = state.grid.map(s => s?.id === item.id ? null : s);
                        state.keptIcons[emptySlotIndex] = { name: item.name, battleCount: 2, isBoosted };

                        switch (item.name) {
                            case 'apple': state.playerHp = Math.min(state.playerMaxHp, state.playerHp + (isBoosted ? 12 : 6)); break;
                            case 'meat': state.playerHp = Math.min(state.playerMaxHp, state.playerHp + (isBoosted ? 20 : 10)); break;
                            case 'crab-claw': state.playerMaxHp += (isBoosted ? 2 : 1); break;
                            case 'brandy-bottle': state.playerHp = Math.max(1, Math.floor(state.playerHp * 0.75)); state.playerMaxHp += (isBoosted ? 8 : 4); state.playerHp += (isBoosted ? 8 : 4); break;
                            case 'axe': state.playerBaseAtk += (isBoosted ? 6 : 3); state.playerGear += (isBoosted ? 4 : 2); break;
                            case 'relic-blade':
                            case 'daggers': state.playerBaseAtk += (isBoosted ? 2 : 1); state.playerGear += (isBoosted ? 2 : 1); break;
                            case 'crossbow': state.playerBaseAtk += (isBoosted ? 2 : 1); state.playerGear += (isBoosted ? 8 : 4); break;
                            case 'shield': state.playerGear += (isBoosted ? 10 : 5); break;
                            case 'knight-helmet': state.playerGear += (isBoosted ? 4 : 2); break;
                            case 'crystal-wand':
                            case 'fairy-wand': state.playerMagic += (isBoosted ? 10 : 5); break;
                            case 'bell':
                            case 'ocarina': state.playerBaseAtk = Math.max(0, state.playerBaseAtk - 1); break;
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
                }
            }),

            unlockSection: (sectionId) => set((state) => {
                if (state.isUnlockingMode && !state.unlockedSections[sectionId]) {
                    state.unlockedSections[sectionId] = true;
                    state.isUnlockingMode = false;
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

                    state.isFirstEnemyAttack = false;
                    state.playerHp = Math.max(0, state.playerHp - finalDamage);
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
                    state.playerHp = state.playerMaxHp;
                    state.levelUpPerks.push(perk);
                } else if (perk === "nature_2x_exp") {
                    state.levelUpPerks.push(perk);
                } else if (perk === "full_heal") {
                    state.playerHp = state.playerMaxHp;
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
                                state.playerHp = Math.min(state.playerMaxHp, state.playerHp + (icon.isBoosted ? 12 : 6));
                            }
                            state.keptIcons[i] = null;
                        }
                    }
                }

                state.isFirstEnemyAttack = true;
                state.conjureMagicUsed = false;

                if (state.battleCount === 4) {
                    state.enemy1 = { ...INITIAL_ENEMIES.wyvern, hp: 50, maxHp: 50, atk: 11, lvl: 2 };
                    state.enemy2 = { ...INITIAL_ENEMIES.octopus, hp: 50, maxHp: 50, atk: 11, lvl: 2 };
                } else if (state.enemy1.name === 'wyvern') {
                    const isLvl2 = state.enemy1.lvl === 2;
                    state.enemy1 = { ...INITIAL_ENEMIES['monster-skull'], hp: isLvl2 ? 50 : INITIAL_ENEMIES['monster-skull'].hp, maxHp: isLvl2 ? 50 : INITIAL_ENEMIES['monster-skull'].maxHp, atk: isLvl2 ? 11 : INITIAL_ENEMIES['monster-skull'].atk, lvl: isLvl2 ? 2 : 1 };
                    state.enemy2 = { ...INITIAL_ENEMIES.snail, hp: isLvl2 ? 50 : INITIAL_ENEMIES.snail.hp, maxHp: isLvl2 ? 50 : INITIAL_ENEMIES.snail.maxHp, atk: isLvl2 ? 11 : INITIAL_ENEMIES.snail.atk, lvl: isLvl2 ? 2 : 1 };
                } else if (state.enemy1.name === 'monster-skull') {
                    const isLvl2 = state.enemy1.lvl === 2;
                    state.enemy1 = { ...INITIAL_ENEMIES.hydra, hp: isLvl2 ? 50 : INITIAL_ENEMIES.hydra.hp, maxHp: isLvl2 ? 50 : INITIAL_ENEMIES.hydra.maxHp, atk: isLvl2 ? 11 : INITIAL_ENEMIES.hydra.atk, lvl: isLvl2 ? 2 : 1 };
                    state.enemy2 = { ...INITIAL_ENEMIES['spider-face'], hp: isLvl2 ? 50 : INITIAL_ENEMIES['spider-face'].hp, maxHp: isLvl2 ? 50 : INITIAL_ENEMIES['spider-face'].maxHp, atk: isLvl2 ? 11 : INITIAL_ENEMIES['spider-face'].atk, lvl: isLvl2 ? 2 : 1 };
                } else if (state.enemy1.name === 'hydra') {
                    const isLvl2 = state.enemy1.lvl === 2;
                    state.enemy1 = { ...INITIAL_ENEMIES['eye-monster'], hp: isLvl2 ? 150 : INITIAL_ENEMIES['eye-monster'].hp, maxHp: isLvl2 ? 150 : INITIAL_ENEMIES['eye-monster'].maxHp, atk: isLvl2 ? 33 : INITIAL_ENEMIES['eye-monster'].atk, lvl: isLvl2 ? 2 : 1 };
                    state.enemy2 = { ...INITIAL_ENEMIES.octopus, hp: 0, maxHp: 0, atk: 0, isVisible: false, lvl: isLvl2 ? 2 : 1 };
                }

                state.battleCount += 1;
            }),

            resetGame: () => set((state) => {
                state.grid = generateRandomIcons();
                state.keptIcons = [null, null, null, null, null, null];
                state.keptScrolls = [];
                state.unlockedSections = { 0: false, 1: false, 2: false };
                state.isUnlockingMode = false;
                state.levelUpPerks = [];
                state.gold = GAME_CONSTANTS.INITIAL_GOLD;
                state.moves = GAME_CONSTANTS.INITIAL_MOVES;
                state.playerHp = GAME_CONSTANTS.INITIAL_PLAYER_HP;
                state.playerMaxHp = GAME_CONSTANTS.INITIAL_PLAYER_HP;
                state.playerBaseAtk = GAME_CONSTANTS.INITIAL_PLAYER_ATK;
                state.playerMagic = GAME_CONSTANTS.INITIAL_PLAYER_MAGIC;
                state.playerGear = GAME_CONSTANTS.INITIAL_PLAYER_GEAR;
                state.isFirstEnemyAttack = true;
                state.conjureMagicUsed = false;
                state.battleCount = 1;
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
                        state.playerHp = Math.min(state.playerMaxHp, state.playerHp + magic);
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

        })),
        {
            name: 'daily-rogue-storage',
            version: 1,
        }
    )
);

export const selectTotalAttack = (state: GameState) =>
    state.playerBaseAtk + (state.keptIcons.some(item => item?.name === 'relic-blade') ? state.moves : 0);

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
