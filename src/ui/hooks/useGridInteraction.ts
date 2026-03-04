import { useState } from 'react';
import { useGameStore, selectShuffleCost } from '@/store/gameStore';
import { findMatchingIndices, getCoordinates, getIndex } from '@/lib/utils';
import { GAME_CONSTANTS, ALL_SCROLL_COLORS, SYMBOL_CATEGORIES } from '@/lib/constants';
import type { GridSymbol, SymbolName, KeptSymbol } from '@/types/game';

interface ScrollFlowCallbacks {
    openScrollModal: (scrolls: SymbolName[], target: SymbolName, symbolId: string) => void;
}

interface GoldCostPopup {
    id: string;
    index: number;
    amount: number;
}

export function useGridInteraction(scrollFlow: ScrollFlowCallbacks) {
    const {
        grid: gridSymbols,
        keptScrolls,
        levelUpPerks,

        spinBoard,
        payForShuffle,
        applySwaps,
        slideRogue,
        equipSymbol,
        removeGridSymbol,
    } = useGameStore();

    const shuffleCost = useGameStore(selectShuffleCost);

    const [spinKey, setSpinKey] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectedEquippedSymbol, setSelectedEquippedSymbol] = useState<GridSymbol | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [glowingIndices, setGlowingIndices] = useState<number[]>([]);
    const [activeRogueIndex, setActiveRogueIndex] = useState<number | null>(null);
    const [slidesCount, setSlidesCount] = useState(0);
    const [goldCostPopups, setGoldCostPopups] = useState<GoldCostPopup[]>([]);

    const matchingIndices = findMatchingIndices(gridSymbols);

    const showGoldCostPopup = (index: number, amount: number) => {
        const id = crypto.randomUUID();
        setGoldCostPopups(prev => [...prev, { id, index, amount }]);
        setTimeout(() => {
            setGoldCostPopups(prev => prev.filter(popup => popup.id !== id));
        }, 700);
    };

    const resetSelection = () => {
        setSelectedIndex(null);
        setSelectedEquippedSymbol(null);
        setGlowingIndices([]);
        setActiveRogueIndex(null);
    };

    const resetInteractionState = () => {
        resetSelection();
        setSlidesCount(0);
        setIsAnimating(false);
        setIsSpinning(false);
        setIsShuffling(false);
        setGoldCostPopups([]);
    };

    const handleSpin = () => {
        if (isAnimating) return;
        const gold = useGameStore.getState().gold;
        if (gold < GAME_CONSTANTS.SPIN_COST) return;
        spinBoard();
        setSpinKey(prev => prev + 1);
        resetSelection();
        setSlidesCount(0);
        // IsShaking was used for older animation logic
        setIsAnimating(true);
        setIsSpinning(true);
        setTimeout(() => { setIsAnimating(false); setIsSpinning(false); }, 1200);
    };

    const handleShuffle = async () => {
        if (isAnimating) return;
        const state = useGameStore.getState();
        const gold = state.gold;

        // Prevent action if not enough gold (pre-check via cost logic)
        const cost = selectShuffleCost(state);
        if (gold < cost) return;

        const success = payForShuffle();
        if (!success) return;

        resetSelection();
        setSlidesCount(0);
        setIsAnimating(true);
        setIsShuffling(true);

        const currentGrid = useGameStore.getState().grid;
        // Only shuffle indices that currently contain a symbol
        const filledIndices = currentGrid.map((symbol, i) => symbol !== null ? i : -1).filter(i => i !== -1);

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
            await new Promise(r => setTimeout(r, 160)); // Tuned visual baseline syncs better without interrupting framer's internal tween state
        }

        setIsShuffling(false);
        setIsAnimating(false);
    };

    const handleKeptSymbolClick = (e: React.MouseEvent, symbol: KeptSymbol) => {
        e.stopPropagation();
        setSelectedEquippedSymbol({ id: `equipped-${symbol.name}`, name: symbol.name, isBoosted: symbol.isBoosted } as GridSymbol);
        setSelectedIndex(null);
    };

    const handleSymbolClick = (symbol: GridSymbol, index: number) => {
        if (isAnimating) return;
        const isBoosted = matchingIndices.has(index);

        // Rogue slide target
        if (glowingIndices.includes(index) && activeRogueIndex !== null) {
            const character = gridSymbols[activeRogueIndex];
            if (character && character.name === 'hood') {
                const spentGold = slideRogue(activeRogueIndex, index, isBoosted);
                if (spentGold !== null && spentGold > 0) {
                    showGoldCostPopup(index, spentGold);
                }
                resetSelection();
                setSlidesCount(prev => prev + 1);
                return;
            }
        }

        // Rogue selection
        if (symbol.name === 'hood') {
            const hasNatureScroll = keptScrolls.includes('nature-scroll');
            const isLevel3 = levelUpPerks.length >= 2;
            const maxSlides = (hasNatureScroll && isLevel3) ? 2 : 1;
            if (slidesCount >= maxSlides) return;
            const { row, col } = getCoordinates(index);
            const targets: number[] = [];
            if (col > 0) targets.push(getIndex(row, col - 1));
            if (col < 3) targets.push(getIndex(row, col + 1));
            if (row > 0) targets.push(getIndex(row - 1, col));
            if (row < 2) targets.push(getIndex(row + 1, col));
            setGlowingIndices(targets);
            setActiveRogueIndex(index);
            setSelectedIndex(index);
            return;
        }

        // Double-tap
        if (selectedIndex === index) {
            if (activeRogueIndex !== null) resetSelection();

            if (symbol.name === 'key') { resetSelection(); return; }

            if (symbol.name === 'scroll-unfurled') {
                const available = ALL_SCROLL_COLORS.filter(c => !keptScrolls.includes(c));
                if (available.length > 0) {
                    resetSelection();
                    const shuffled = [...available].sort(() => Math.random() - 0.5);
                    const target = shuffled[Math.floor(Math.random() * shuffled.length)];
                    scrollFlow.openScrollModal(shuffled, target, symbol.id);
                } else {
                    removeGridSymbol(symbol.id);
                    resetSelection();
                }
                return;
            }

            const category = SYMBOL_CATEGORIES[symbol.name as SymbolName];
            if (category === 'Nature' || category === 'Treasure') { resetSelection(); return; }

            const spentGold = equipSymbol(symbol, isBoosted);
            if (spentGold !== null && spentGold > 0) {
                showGoldCostPopup(index, spentGold);
            }
            resetSelection();
        } else {
            setSelectedIndex(index);
            setSelectedEquippedSymbol(null);
            setGlowingIndices([]);
            setActiveRogueIndex(null);
        }
    };

    return {
        gridSymbols,
        spinKey,
        matchingIndices,
        glowingIndices,
        activeRogueIndex,
        selectedIndex,
        selectedEquippedSymbol,
        isAnimating,
        isSpinning,
        isShuffling,
        hasSlid: slidesCount > 0,
        goldCostPopups,
        shuffleCost,
        resetSelection,
        resetInteractionState,
        handleSpin,
        handleShuffle,
        handleSymbolClick,
        handleKeptSymbolClick,
        setSpinKey,
    };
}
