import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/lib/constants';
import type { IconName } from '@/types/game';

export function useScrollFlow() {
    const { addKeptScroll, removeGridItem, spendGold } = useGameStore();

    const [isScrollTypeOpen, setIsScrollTypeOpen] = useState(false);
    const [scrollStage, setScrollStage] = useState<'initial' | 'lifting' | 'faded'>('initial');
    const [availableScrolls, setAvailableScrolls] = useState<IconName[]>([]);
    const [revealedScrollColor, setRevealedScrollColor] = useState<IconName | null>(null);
    const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
    const [isScrollWindowOpen, setIsScrollWindowOpen] = useState(false);

    const openScrollModal = (scrolls: IconName[], target: IconName, itemId: string) => {
        setIsScrollTypeOpen(true);
        setScrollStage('initial');
        setAvailableScrolls(scrolls);
        setRevealedScrollColor(target);
        setPendingScrollId(itemId);
    };

    const handleBuyScroll = () => {
        const gold = useGameStore.getState().gold;
        if (gold < GAME_CONSTANTS.SCROLL_COST || !pendingScrollId || scrollStage !== 'initial') return;

        spendGold(GAME_CONSTANTS.SCROLL_COST);
        const savedId = pendingScrollId;
        setPendingScrollId(null);
        setScrollStage('lifting');

        setTimeout(() => {
            setScrollStage('faded');
            if (revealedScrollColor) addKeptScroll(revealedScrollColor);
            removeGridItem(savedId);
            setTimeout(() => setIsScrollTypeOpen(false), 2000);
        }, 500);
    };

    const handleCloseScrollPopup = () => {
        if (scrollStage !== 'initial') return;
        setIsScrollTypeOpen(false);
        setPendingScrollId(null);
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
