import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/lib/constants';
import type { SymbolName } from '@/types/game';

export function useScrollFlow() {
    const { addKeptScroll, removeGridSymbol, spendGold } = useGameStore();

    const [isScrollTypeOpen, setIsScrollTypeOpen] = useState(false);
    const [scrollStage, setScrollStage] = useState<'initial' | 'lifting' | 'faded'>('initial');
    const [availableScrolls, setAvailableScrolls] = useState<SymbolName[]>([]);
    const [revealedScrollColor, setRevealedScrollColor] = useState<SymbolName | null>(null);
    const [pendingScrollSymbolId, setPendingScrollSymbolId] = useState<string | null>(null);
    const [isScrollWindowOpen, setIsScrollWindowOpen] = useState(false);

    const openScrollModal = (scrolls: SymbolName[], target: SymbolName, symbolId: string) => {
        setIsScrollTypeOpen(true);
        setScrollStage('initial');
        setAvailableScrolls(scrolls);
        setRevealedScrollColor(target);
        setPendingScrollSymbolId(symbolId);
    };

    const handleBuyScroll = () => {
        const gold = useGameStore.getState().gold;
        if (gold < GAME_CONSTANTS.SCROLL_COST || !pendingScrollSymbolId || scrollStage !== 'initial') return;

        spendGold(GAME_CONSTANTS.SCROLL_COST);
        const savedSymbolId = pendingScrollSymbolId;
        setPendingScrollSymbolId(null);
        setScrollStage('lifting');

        setTimeout(() => {
            setScrollStage('faded');
            if (revealedScrollColor) addKeptScroll(revealedScrollColor);
            removeGridSymbol(savedSymbolId);
            setTimeout(() => setIsScrollTypeOpen(false), 2000);
        }, 500);
    };

    const handleCloseScrollPopup = () => {
        if (scrollStage !== 'initial') return;
        setIsScrollTypeOpen(false);
        setPendingScrollSymbolId(null);
    };

    return {
        isScrollTypeOpen,
        scrollStage,
        availableScrolls,
        revealedScrollColor,
        isScrollWindowOpen,
        openScrollModal,
        handleBuyScroll,
        handleCloseScrollPopup,
        setIsScrollWindowOpen,
    };
}
