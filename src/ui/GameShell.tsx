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
import { useBattleSequence } from './hooks/useBattleSequence';
import { useGridInteraction } from './hooks/useGridInteraction';
import { useScrollFlow } from './hooks/useScrollFlow';
import type { GridItem } from '@/types/game';

export function GameShell() {
    const { resetGame, gold, applyConjureMagic, playerHp, conjureMagicUsed, levelUpPerks } = useGameStore();
    const hasTwoFairyWands = useGameStore(selectHasTwoFairyWands);
    const canConjureMagic = hasTwoFairyWands && !conjureMagicUsed;

    const { playerAnim, enemy1Anim, enemy2Anim, isBattleRunning, runBattle } = useBattleSequence();

    // Scroll flow
    const scrollFlow = useScrollFlow();

    // Grid interaction (connected to scroll flow)
    const grid = useGridInteraction({ openScrollModal: scrollFlow.openScrollModal });

    // Modal state
    const [isConjureMagicOpen, setIsConjureMagicOpen] = useState(false);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [sliderResetKey, setSliderResetKey] = useState(0);

    const handleReset = () => {
        resetGame();
        grid.resetSelection();
        setSliderResetKey(prev => prev + 1);
        grid.setSpinKey(prev => prev + 1);
    };

    const handleEngage = () => {
        if (canConjureMagic) {
            setIsConjureMagicOpen(true);
        } else if (playerHp > 0) {
            runBattle();
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            {/* ─── Header ─── */}
            <header className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 shrink-0 whitespace-nowrap" style={{ height: 'var(--header-h)', padding: '0 var(--gap)' }}>
                <h1 className="text-sm font-bold tracking-wider text-zinc-100 uppercase leading-none">Daily Rogue</h1>
                <div className="text-zinc-400 leading-none" style={{ fontSize: 'var(--text-xs)' }}>Sunday, February 15th</div>
            </header>

            {/* ─── Main ─── */}
            <main className="flex-1 min-h-0 flex flex-col relative">

                {/* Battle / Stats banner */}
                <section className="flex bg-zinc-900/50 relative overflow-hidden min-h-0" style={{ flex: 2.3 }}>
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
                        sliderResetKey={sliderResetKey}
                        onEngage={handleEngage}
                    />
                    {/* Dot overlay */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                </section>

                <div className="h-px bg-zinc-700 w-full shrink-0 z-10" />

                {/* Board / Inventory / Controls */}
                <section className="min-h-0 flex flex-col items-center justify-evenly bg-zinc-950 relative overflow-hidden" style={{ flex: 3, padding: 'var(--gap) 0' }}>
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
                    <CharacterModal isOpen={isCharacterModalOpen} onClose={() => setIsCharacterModalOpen(false)} />
                </section>
            </main>
        </div>
    );
}
