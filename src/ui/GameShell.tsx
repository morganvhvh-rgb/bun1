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
import { TutorialModal } from './modals/TutorialModal';
import { useBattleSequence } from './hooks/useBattleSequence';
import { useGridInteraction } from './hooks/useGridInteraction';
import { useScrollFlow } from './hooks/useScrollFlow';
import type { GridSymbol } from '@/types/game';

export function GameShell() {
    const { resetGame, gold, applyConjureMagic, playerHp, conjureMagicUsed, levelUpPerks, keptScrolls, unlockedSlots, hasSeenTutorial, setHasSeenTutorial } = useGameStore();
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
        if (isBattleRunning) return;
        resetGame();
        resetBattleSequence();
        grid.resetInteractionState();
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
        <div className="w-full h-full flex flex-col tracking-wide text-[#e8d4b8] overflow-hidden font-sans">
            {/* ─── Amber streak background accent ─── */}
            <svg
                className="bg-amber-streak"
                viewBox="0 0 100 180"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <defs>
                    {/* Wide blur for the outer halo */}
                    <filter id="streak-halo" x="-500%" y="-5%" width="1100%" height="110%">
                        <feGaussianBlur stdDeviation="11 0" />
                    </filter>
                    {/* Softer blur for the core — still concentrated but not razor-thin */}
                    <filter id="streak-core" x="-200%" y="-2%" width="500%" height="104%">
                        <feGaussianBlur stdDeviation="3.5 0" />
                    </filter>
                </defs>

                {/*
                  * S-curve path running top → bottom.
                  * Starts at ~x=48 (just left of center),
                  * bows right to ~x=57 at quarter-height,
                  * crosses back through center at half,
                  * bows left to ~x=43 at three-quarters,
                  * ends at ~x=52 at the bottom.
                  * This reads as a single graceful curve, not a zigzag.
                  */}

                {/* Outer diffuse halo — wide stroke, heavy blur, low opacity */}
                <path
                    d="M 48,-5 C 57,35 57,80 50,90 C 43,100 43,140 52,185"
                    stroke="rgba(170,70,5,0.22)"
                    strokeWidth="14"
                    fill="none"
                    filter="url(#streak-halo)"
                />

                {/* Inner core — visible but softened, deep burnt amber */}
                <path
                    d="M 48,-5 C 57,35 57,80 50,90 C 43,100 43,140 52,185"
                    stroke="rgba(195,90,8,0.50)"
                    strokeWidth="3"
                    fill="none"
                    filter="url(#streak-core)"
                />
            </svg>
            {/* ─── Header ─── */}
            <header className="flex items-center border-b border-white/5 shrink-0 whitespace-nowrap z-20" style={{ height: 'var(--header-h-compact)', padding: '0 var(--header-pad-x)' }}>
                <div className="w-full flex items-center justify-between" style={{ gap: 'var(--header-meta-gap)' }}>
                    <h1 className="text-sm font-bold tracking-widest uppercase leading-none" style={{ color: '#e8d4b8' }}>Daily Rogue</h1>
                    <time className="font-normal uppercase tracking-widest leading-none shrink-0 text-[#e8d4b8]" style={{ fontSize: 'var(--text-xs)' }}>
                        {todayLabel}
                    </time>
                </div>
            </header>

            {/* ─── Main ─── */}
            <main className="flex-1 min-h-0 flex flex-col relative">

                {/* Battle / Stats banner */}
                <section className="flex justify-center relative overflow-visible min-h-0 z-20" style={{ flex: 2 }}>
                    <div className="flex w-full h-full relative z-10" style={{ maxWidth: 'calc(var(--cell) * 5 + var(--gap) * 4)', gap: 'var(--gap)' }}>
                        <HeroPanel
                            playerAnim={playerAnim}
                            isBattleRunning={isBattleRunning}
                            onCharacterClick={() => !isBattleRunning && setIsCharacterModalOpen(true)}
                        />
                        <EnemyPanel
                            enemy1Anim={enemy1Anim}
                            enemy2Anim={enemy2Anim}
                            isBattleRunning={isBattleRunning}
                            isPostBattleScreen={isPostBattleScreen}
                            isAnimating={grid.isAnimating}
                            onEngage={handleEngage}
                        />
                    </div>
                </section>

                {/* Board / Inventory / Controls */}
                <section className="min-h-0 flex flex-col items-center justify-start relative overflow-visible z-10" style={{ flex: 3.3, padding: 'var(--gap) 0' }}>
                    <Inventory onKeptSymbolClick={(e, symbol) => { if (!isBattleRunning) grid.handleKeptSymbolClick(e, symbol); }} />

                    <div className="flex items-start justify-center flex-1 min-h-0 w-full" style={{ gap: 'var(--gap)', padding: '0 var(--gap)' }}>
                        <div className="min-w-0">
                            <GridBoard
                                gridSymbols={grid.gridSymbols}
                                spinKey={grid.spinKey}
                                matchingIndices={grid.matchingIndices}
                                goldCostPopups={grid.goldCostPopups}
                                glowingIndices={grid.glowingIndices}
                                activeRogueIndex={grid.activeRogueIndex}
                                selectedIndex={grid.selectedIndex}
                                selectedEquippedSymbol={grid.selectedEquippedSymbol}
                                isSpinning={grid.isSpinning}
                                onSymbolClick={(symbol, index) => { if (!isBattleRunning) grid.handleSymbolClick(symbol, index); }}
                                onEmptyGlowClick={(index) => { if (!isBattleRunning && grid.activeRogueIndex !== null) grid.handleSymbolClick({ id: 'empty', name: 'hood' } as GridSymbol, index); }}
                                levelUpPerks={levelUpPerks}
                                hasSpecialScroll={keptScrolls.includes('special-scroll')}
                                areAllSlotsUnlocked={unlockedSlots[3] && unlockedSlots[4] && unlockedSlots[5]}
                            />
                        </div>
                        <Controls
                            shuffleCost={grid.shuffleCost}
                            isAnimating={grid.isAnimating || isBattleRunning}
                            onSpin={grid.handleSpin}
                            onShuffle={grid.handleShuffle}
                            onScrollsOpen={() => scrollFlow.setIsScrollWindowOpen(true)}
                            onCoffeeOpen={() => setIsCoffeeOpen(true)}
                            onReset={handleReset}
                        />
                    </div>

                </section>
            </main>

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
            <TutorialModal isOpen={!hasSeenTutorial} onClose={() => setHasSeenTutorial(true)} />
        </div >
    );
}
