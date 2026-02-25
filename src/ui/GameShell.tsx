import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore, selectHasTwoFairyWands } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/lib/constants';
import { HeroPanel } from './panels/HeroPanel';
import { EnemyPanel } from './panels/EnemyPanel';
import { GridBoard } from './board/GridBoard';
import { Inventory } from './board/Inventory';
import { Controls } from './board/Controls';
import { CharacterModal } from './modals/CharacterModal';
import { ScrollsModal } from './modals/ScrollsModal';
import { ScrollBuyModal } from './modals/ScrollBuyModal';
import { ConjureModal } from './modals/ConjureModal';
import { CoffeeModal } from './modals/CoffeeModal';
import { useBattleSequence } from './hooks/useBattleSequence';
import { useGridInteraction } from './hooks/useGridInteraction';
import { useScrollFlow } from './hooks/useScrollFlow';
import type { GridItem } from '@/types/game';

export function GameShell() {
    const { resetGame, gold, applyConjureMagic, playerHp, conjureMagicUsed, levelUpPerks } = useGameStore();
    const hasTwoFairyWands = useGameStore(selectHasTwoFairyWands);
    const canConjureMagic = hasTwoFairyWands && !conjureMagicUsed;

    const {
        playerAnim,
        enemy1Anim,
        enemy2Anim,
        isBattleRunning,
        isPostBattleScreen,
        runBattle,
        exitPostBattle,
        resetBattleSequence,
    } = useBattleSequence();

    // Scroll flow
    const scrollFlow = useScrollFlow();

    // Grid interaction (connected to scroll flow)
    const grid = useGridInteraction({ openScrollModal: scrollFlow.openScrollModal });

    // Modal state
    const [isConjureMagicOpen, setIsConjureMagicOpen] = useState(false);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
    const todayLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    const handleReset = () => {
        resetGame();
        resetBattleSequence();
        grid.resetSelection();
        grid.setSpinKey(prev => prev + 1);
    };

    const handleEngage = () => {
        if (isPostBattleScreen) {
            exitPostBattle();
            return;
        }

        if (canConjureMagic) {
            setIsConjureMagicOpen(true);
        } else if (playerHp > 0) {
            runBattle();
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            {/* ─── Header ─── */}
            <header className="flex items-center border-b border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-indigo-950/20 to-zinc-950 shrink-0 whitespace-nowrap shadow-[inset_0_-1px_10px_rgba(0,0,0,0.5)] z-20" style={{ height: 'var(--header-h-compact)', padding: '0 var(--header-pad-x)' }}>
                <div className="w-full flex items-center justify-between" style={{ gap: 'var(--header-meta-gap)' }}>
                    <h1 className="text-sm font-black tracking-[0.2em] text-zinc-100 uppercase leading-none drop-shadow-md">Daily Rogue</h1>
                    <time className="text-zinc-400 font-semibold uppercase tracking-[0.14em] leading-none shrink-0 drop-shadow-sm" style={{ fontSize: 'var(--text-xs)' }}>
                        {todayLabel}
                    </time>
                </div>
            </header>

            {/* ─── Main ─── */}
            <main className="flex-1 min-h-0 flex flex-col relative">

                {/* Battle / Stats banner */}
                <section className="flex bg-zinc-950 relative overflow-hidden min-h-0 z-10" style={{ flex: 2, boxShadow: 'inset 0 -20px 40px -20px rgba(0,0,0,0.8)' }}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-zinc-950 to-zinc-950 pointer-events-none" />
                    <HeroPanel
                        playerAnim={playerAnim}
                        isBattleRunning={isBattleRunning}
                        onCharacterClick={() => !isBattleRunning && setIsCharacterModalOpen(true)}
                        onReset={handleReset}
                    />
                    <EnemyPanel
                        enemy1Anim={enemy1Anim}
                        enemy2Anim={enemy2Anim}
                        isBattleRunning={isBattleRunning}
                        isPostBattleScreen={isPostBattleScreen}
                        onEngage={handleEngage}
                    />
                </section>

                <div className="h-px bg-zinc-700 w-full shrink-0 z-10" />

                {/* Board / Inventory / Controls */}
                <section className="min-h-0 flex flex-col items-center justify-start bg-zinc-950 relative overflow-visible z-10" style={{ flex: 3.3, padding: 'var(--gap) 0', boxShadow: 'inset 0 20px 40px -20px rgba(0,0,0,0.8)' }}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />
                    <Inventory onKeptIconClick={grid.handleKeptIconClick} />

                    <div className="flex items-start justify-center flex-1 min-h-0 w-full" style={{ gap: 'var(--gap)', padding: '0 var(--gap)' }}>
                        <div className="min-w-0">
                            <GridBoard
                                gridIcons={grid.gridIcons}
                                spinKey={grid.spinKey}
                                matchingIndices={grid.matchingIndices}
                                glowingIndices={grid.glowingIndices}
                                activeHoodedIndex={grid.activeHoodedIndex}
                                selectedIndex={grid.selectedIndex}
                                selectedEquippedItem={grid.selectedEquippedItem}
                                isShaking={grid.isShaking}
                                onIconClick={grid.handleIconClick}
                                onEmptyGlowClick={(index) => { if (grid.activeHoodedIndex !== null) grid.handleIconClick({ id: 'empty', name: 'hood' } as GridItem, index); }}
                                levelUpPerks={levelUpPerks}
                            />
                        </div>
                        <Controls
                            shuffleCost={grid.shuffleCost}
                            isAnimating={grid.isAnimating}
                            onSpin={grid.handleSpin}
                            onVary={grid.handleVary}
                            onScrollsOpen={() => scrollFlow.setIsScrollWindowOpen(true)}
                            onCoffeeOpen={() => setIsCoffeeOpen(true)}
                        />
                    </div>

                    {/* Modals */}
                    <ScrollsModal isOpen={scrollFlow.isScrollWindowOpen} onClose={() => scrollFlow.setIsScrollWindowOpen(false)} />
                    <ScrollBuyModal
                        isOpen={scrollFlow.isScrollTypeOpen}
                        onClose={scrollFlow.handleCloseScrollPopup}
                        onBuyScroll={scrollFlow.handleBuyScroll}
                        scrollStage={scrollFlow.scrollStage}
                        availableScrolls={scrollFlow.availableScrolls}
                        revealedScrollColor={scrollFlow.revealedScrollColor}
                        gold={gold}
                        scrollCost={GAME_CONSTANTS.SCROLL_COST}
                    />
                    <AnimatePresence>
                        {isConjureMagicOpen && (
                            <ConjureModal
                                isOpen={isConjureMagicOpen}
                                onClose={() => setIsConjureMagicOpen(false)}
                                onResult={(winner) => applyConjureMagic(winner)}
                            />
                        )}
                    </AnimatePresence>
                    <CoffeeModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />
                    <CharacterModal isOpen={isCharacterModalOpen} onClose={() => setIsCharacterModalOpen(false)} />
                </section>
            </main>
        </div>
    );
}
