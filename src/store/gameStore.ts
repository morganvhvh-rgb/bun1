import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GridItem, IconName, KeptIcon } from '@/types/game';
import { ICON_KEYS, ICON_CATEGORIES } from '@/lib/constants';

interface GameState {
    // Grid State
    grid: (GridItem | null)[];
    keptIcons: (KeptIcon | null)[];
    keptScrolls: IconName[];
    unlockedSections: { 0: boolean; 1: boolean; 2: boolean };
    isUnlockingMode: boolean;

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

    enemy1: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number };
    enemy2: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number };

    // Actions
    spinBoard: () => void;
    shuffleBoard: () => void;
    moveCharacter: (fromIndex: number, toIndex: number, isBoosted?: boolean) => void;
    keepItem: (item: GridItem, isBoosted?: boolean) => void;
    keepScroll: (item: GridItem) => void;
    unlockSection: (sectionId: 0 | 1 | 2) => void;
    resetBattleTarget: () => void;
    resetGame: () => void;

    // Battle updates
    applyBattleDamage: (target: 'player' | 'enemy1' | 'enemy2', amount: number) => void;
    setEnemyVisibility: (target: 'enemy1' | 'enemy2', isVisible: boolean) => void;
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

            gold: 100,
            moves: 0,

            // Battle Stats
            playerHp: 60,
            playerMaxHp: 60,
            playerBaseAtk: 8,
            playerMagic: 0,
            playerGear: 0,
            isFirstEnemyAttack: true,

            enemy1: { name: 'wyvern', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 },
            enemy2: { name: 'octopus', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 },

            spinBoard: () => set((state) => {
                if (state.gold < 1) return;
                state.gold -= 1;
                state.grid = generateRandomIcons();
            }),

            shuffleBoard: () => set((state) => {
                if (state.gold < 1) return;
                state.gold -= 1;
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

                const getCoordinates = (index: number) => ({ row: Math.floor(index / 4), col: index % 4 });
                const getIndex = (row: number, col: number) => row * 4 + col;

                const pCoords = getCoordinates(fromIndex);
                const tCoords = getCoordinates(toIndex);

                const targetItem = state.grid[toIndex];
                const targetHasKey = targetItem?.name === 'key';

                if (targetItem) {
                    const category = ICON_CATEGORIES[targetItem.name];
                    if (category === 'Treasure' || category === 'Nature') {
                        switch (targetItem.name) {
                            case 'clover': state.moves += (isBoosted ? 2 : 1); state.playerMagic += (isBoosted ? 2 : 1); break;
                            case 'pine-tree': state.moves += (isBoosted ? 2 : 1); break;
                            case 'zigzag-leaf': state.moves -= 3; state.playerMagic += (isBoosted ? 10 : 5); break;
                            case 'gold-bar':
                            case 'gem-pendant': state.gold += (isBoosted ? 20 : 10); break;
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
                        state.grid = state.grid.map(s => s?.id === item.id ? null : s);
                        state.keptIcons[emptySlotIndex] = { name: item.name, battleCount: 3 };

                        switch (item.name) {
                            case 'apple': state.playerHp = Math.min(state.playerMaxHp, state.playerHp + (isBoosted ? 12 : 6)); break;
                            case 'meat': state.playerHp = Math.min(state.playerMaxHp, state.playerHp + (isBoosted ? 20 : 10)); break;
                            case 'crab-claw': state.playerMaxHp += (isBoosted ? 2 : 1); state.playerHp += (isBoosted ? 2 : 1); break;
                            case 'brandy-bottle': state.playerHp = Math.max(1, Math.floor(state.playerHp / 2)); state.playerMaxHp += (isBoosted ? 8 : 4); state.playerHp += (isBoosted ? 8 : 4); break;
                            case 'axe': state.playerBaseAtk += (isBoosted ? 4 : 2); state.playerGear += (isBoosted ? 2 : 1); break;
                            case 'relic-blade':
                            case 'crossbow':
                            case 'daggers': state.playerBaseAtk += (isBoosted ? 2 : 1); state.playerGear += (isBoosted ? 2 : 1); break;
                            case 'shield':
                            case 'knight-helmet': state.playerGear += (isBoosted ? 4 : 2); break;
                            case 'crystal-wand':
                            case 'fairy-wand': state.playerMagic += (isBoosted ? 10 : 5); break;
                            case 'bell':
                            case 'ocarina': state.playerBaseAtk = Math.max(0, state.playerBaseAtk - 1); break;
                        }
                    }
                }
            }),

            keepScroll: (item) => set((state) => {
                if (state.keptScrolls.length >= 6) return;
                state.grid = state.grid.map(s => s?.id === item.id ? null : s);
                state.keptScrolls.push(item.name);
            }),

            unlockSection: (sectionId) => set((state) => {
                if (state.isUnlockingMode && !state.unlockedSections[sectionId]) {
                    state.unlockedSections[sectionId] = true;
                    state.isUnlockingMode = false;
                }
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

            resetBattleTarget: () => set((state) => {
                for (let i = 0; i < state.keptIcons.length; i++) {
                    const icon = state.keptIcons[i];
                    if (icon !== null) {
                        icon.battleCount -= 1;
                        if (icon.battleCount <= 0) {
                            state.keptIcons[i] = null;
                        }
                    }
                }

                state.isFirstEnemyAttack = true;

                if (state.enemy1.name === 'wyvern') {
                    state.enemy1 = { name: 'monster-skull', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
                    state.enemy2 = { name: 'snail', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
                } else if (state.enemy1.name === 'monster-skull') {
                    state.enemy1 = { name: 'hydra', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
                    state.enemy2 = { name: 'spider-face', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
                } else {
                    state.enemy1 = { name: 'wyvern', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
                    state.enemy2 = { name: 'octopus', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
                }
            }),

            resetGame: () => set((state) => {
                state.grid = generateRandomIcons();
                state.keptIcons = [null, null, null, null, null, null];
                state.keptScrolls = [];
                state.unlockedSections = { 0: false, 1: false, 2: false };
                state.isUnlockingMode = false;
                state.gold = 100;
                state.moves = 0;
                state.playerHp = 60;
                state.playerMaxHp = 60;
                state.playerBaseAtk = 8;
                state.playerMagic = 0;
                state.playerGear = 0;
                state.isFirstEnemyAttack = true;
                state.enemy1 = { name: 'wyvern', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
                state.enemy2 = { name: 'octopus', hp: 35, maxHp: 35, atk: 7, isVisible: true, lvl: 1 };
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
