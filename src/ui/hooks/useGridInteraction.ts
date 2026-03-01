import { useState } from 'react';
import { useGameStore, selectShuffleCost } from '@/store/gameStore';
import { findMatchingIndices, getCoordinates, getIndex } from '@/lib/utils';
import { GAME_CONSTANTS, ALL_SCROLL_COLORS, ICON_CATEGORIES } from '@/lib/constants';
import type { GridItem, IconName, KeptIcon } from '@/types/game';

interface ScrollFlowCallbacks {
    openScrollModal: (scrolls: IconName[], target: IconName, itemId: string) => void;
}

export function useGridInteraction(scrollFlow: ScrollFlowCallbacks) {
    const {
        grid: gridIcons,
        keptScrolls,

        spinBoard,
        payForShuffle,
        applySwaps,
        moveCharacter,
        keepItem,
        removeGridItem,
    } = useGameStore();

    const shuffleCost = useGameStore(selectShuffleCost);

    const [spinKey, setSpinKey] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectedEquippedItem, setSelectedEquippedItem] = useState<GridItem | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [glowingIndices, setGlowingIndices] = useState<number[]>([]);
    const [activeHoodedIndex, setActiveHoodedIndex] = useState<number | null>(null);
    const [hasMoved, setHasMoved] = useState(false);

    const matchingIndices = findMatchingIndices(gridIcons);

    const resetSelection = () => {
        setSelectedIndex(null);
        setSelectedEquippedItem(null);
        setGlowingIndices([]);
        setActiveHoodedIndex(null);
    };

    const handleSpin = () => {
        if (isAnimating) return;
        const gold = useGameStore.getState().gold;
        if (gold < GAME_CONSTANTS.SPIN_COST) return;
        spinBoard();
        setSpinKey(prev => prev + 1);
        resetSelection();
        setHasMoved(false);
        // IsShaking was used for older animation logic
        setIsAnimating(true);
        setIsSpinning(true);
        setTimeout(() => { setIsAnimating(false); setIsSpinning(false); }, 1600);
    };

    const handleVary = async () => {
        if (isAnimating) return;
        const state = useGameStore.getState();
        const gold = state.gold;

        // Prevent action if not enough gold (pre-check via cost logic)
        const cost = (state.keptIcons.some(i => i?.name === 'spades-card') && state.moves < 3) ? 1 : GAME_CONSTANTS.SHUFFLE_COST;
        if (gold < cost) return;

        const success = payForShuffle();
        if (!success) return;

        resetSelection();
        setHasMoved(false);
        setIsAnimating(true);
        setIsShuffling(true);

        const currentGrid = useGameStore.getState().grid;
        // Only shuffle indices that currently contain an item
        const filledIndices = currentGrid.map((item, i) => item !== null ? i : -1).filter(i => i !== -1);

        // Generate Fisher-Yates swaps on the filled slots only
        const steps: [number, number][] = [];
        const shufflable = [...filledIndices];
        for (let i = shufflable.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (i !== j) {
                steps.push([shufflable[i], shufflable[j]]);
                const tmp = shufflable[i];
                shufflable[i] = shufflable[j];
                shufflable[j] = tmp;
            }
        }

        // Execute swaps in small aesthetic groups
        const groupSize = 2; // Swapping multiple pairs looks like a cool algorithm
        for (let g = 0; g < steps.length; g += groupSize) {
            const swaps = steps.slice(g, g + groupSize);
            applySwaps(swaps);
            await new Promise(r => setTimeout(r, 220)); // snappy visual pause
        }

        setIsShuffling(false);
        setIsAnimating(false);
    };

    const handleKeptIconClick = (e: React.MouseEvent, icon: KeptIcon) => {
        e.stopPropagation();
        setSelectedEquippedItem({ id: `equipped-${icon.name}`, name: icon.name, isBoosted: icon.isBoosted } as GridItem);
        setSelectedIndex(null);
    };

    const handleIconClick = (item: GridItem, index: number) => {
        if (isAnimating) return;
        const isBoosted = matchingIndices.has(index);

        // Hood movement target
        if (glowingIndices.includes(index) && activeHoodedIndex !== null) {
            const character = gridIcons[activeHoodedIndex];
            if (character && character.name === 'hood') {
                moveCharacter(activeHoodedIndex, index, isBoosted);
                resetSelection();
                setHasMoved(true);
                return;
            }
        }

        // Hood selection
        if (item.name === 'hood') {
            if (hasMoved) return;
            const { row, col } = getCoordinates(index);
            const targets: number[] = [];
            if (col > 0) targets.push(getIndex(row, col - 1));
            if (col < 3) targets.push(getIndex(row, col + 1));
            if (row > 0) targets.push(getIndex(row - 1, col));
            if (row < 2) targets.push(getIndex(row + 1, col));
            setGlowingIndices(targets);
            setActiveHoodedIndex(index);
            setSelectedIndex(index);
            return;
        }

        // Double-tap
        if (selectedIndex === index) {
            if (activeHoodedIndex !== null) resetSelection();

            if (item.name === 'key') { resetSelection(); return; }

            if (item.name === 'scroll-unfurled') {
                const available = ALL_SCROLL_COLORS.filter(c => !keptScrolls.includes(c));
                if (available.length > 0) {
                    resetSelection();
                    const shuffled = [...available].sort(() => Math.random() - 0.5);
                    const target = shuffled[Math.floor(Math.random() * shuffled.length)];
                    scrollFlow.openScrollModal(shuffled, target, item.id);
                } else {
                    removeGridItem(item.id);
                    resetSelection();
                }
                return;
            }

            const category = ICON_CATEGORIES[item.name as IconName];
            if (category === 'Nature' || category === 'Treasure') { resetSelection(); return; }

            keepItem(item, isBoosted);
            resetSelection();
        } else {
            setSelectedIndex(index);
            setSelectedEquippedItem(null);
            setGlowingIndices([]);
            setActiveHoodedIndex(null);
        }
    };

    return {
        gridIcons,
        spinKey,
        matchingIndices,
        glowingIndices,
        activeHoodedIndex,
        selectedIndex,
        selectedEquippedItem,
        isAnimating,
        isSpinning,
        isShuffling,
        hasMoved,
        shuffleCost,
        resetSelection,
        handleSpin,
        handleVary,
        handleIconClick,
        handleKeptIconClick,
        setSpinKey,
    };
}
