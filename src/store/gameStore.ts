import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GridItem, IconName } from '@/types/game';
import { ICON_KEYS, ICON_CATEGORIES } from '@/lib/constants';

interface GameState {
    // Grid State
    grid: (GridItem | null)[];
    keptIcons: (IconName | null)[];
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

    enemy1: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number };
    enemy2: { name: IconName; hp: number; maxHp: number; atk: number; isVisible: boolean; lvl: number };

    // Actions
    spinBoard: () => void;
    shuffleBoard: () => void;
    moveCharacter: (fromIndex: number, toIndex: number) => void;
    keepItem: (item: GridItem) => void;
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
            playerHp: 50,
            playerMaxHp: 50,
            playerBaseAtk: 5,

            enemy1: { name: 'wyvern', hp: 10, maxHp: 10, atk: 5, isVisible: true, lvl: 1 },
            enemy2: { name: 'octopus', hp: 10, maxHp: 10, atk: 5, isVisible: true, lvl: 1 },

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

            moveCharacter: (fromIndex, toIndex) => set((state) => {
                const character = state.grid[fromIndex];
                if (!character || character.name !== "hood") return;

                const getCoordinates = (index: number) => ({ row: Math.floor(index / 4), col: index % 4 });
                const getIndex = (row: number, col: number) => row * 4 + col;

                const pCoords = getCoordinates(fromIndex);
                const tCoords = getCoordinates(toIndex);

                const targetHasKey = state.grid[toIndex]?.name === 'key';

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

            keepItem: (item) => set((state) => {
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
                        state.keptIcons[emptySlotIndex] = item.name;
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
                    state.playerHp = Math.max(0, state.playerHp - amount);
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
                state.enemy1 = { name: 'monster-skull', hp: 10, maxHp: 10, atk: 5, isVisible: true, lvl: 1 };
                state.enemy2 = { name: 'snail', hp: 10, maxHp: 10, atk: 5, isVisible: true, lvl: 1 };
            }),

            resetGame: () => set((state) => {
                state.grid = generateRandomIcons();
                state.keptIcons = [null, null, null, null, null, null];
                state.keptScrolls = [];
                state.unlockedSections = { 0: false, 1: false, 2: false };
                state.isUnlockingMode = false;
                state.gold = 100;
                state.moves = 0;
                state.playerHp = 50;
                state.playerMaxHp = 50;
                state.playerBaseAtk = 5;
                state.enemy1 = { name: 'wyvern', hp: 10, maxHp: 10, atk: 5, isVisible: true, lvl: 1 };
                state.enemy2 = { name: 'octopus', hp: 10, maxHp: 10, atk: 5, isVisible: true, lvl: 1 };
            }),

        })),
        {
            name: 'daily-rogue-storage',
            version: 1,
        }
    )
);
