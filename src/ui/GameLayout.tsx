import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore, selectTotalAttack, selectShuffleCost, selectHasTwoFairyWands } from '@/store/gameStore';
import { HeroStatsPanel } from './HeroStatsPanel';
import { EnemyBattleHUD } from './EnemyBattleHUD';
import { GridBoard } from './GridBoard';
import { InventorySlot } from './InventorySlot';
import { ControlButtons } from './ControlButtons';
import { ConjureMagicModal } from './ConjureMagicModal';
import { ScrollWindowModal } from './ScrollWindowModal';
import { ScrollTypeModal } from './ScrollTypeModal';
import { CharacterModal } from './CharacterModal';
import { useBattleSequence } from './hooks/useBattleSequence';
import { GAME_CONSTANTS, ALL_SCROLL_COLORS, ICON_CATEGORIES } from '@/lib/constants';
import { findMatchingIndices, getCoordinates, getIndex } from '@/lib/utils';
import type { GridItem, IconName, KeptIcon } from '@/types/game';

const INVENTORY_SECTIONS: { id: 0 | 1 | 2; label: string; slots: [number, number] }[] = [
    { id: 0, label: "Food/Item", slots: [0, 1] },
    { id: 1, label: "Armor/Magic", slots: [2, 3] },
    { id: 2, label: "Weapon/Music", slots: [4, 5] },
];

export function GameLayout() {
    const {
        grid: gridIcons,
        keptIcons,
        keptScrolls,
        gold,
        moves,
        playerHp,
        playerMaxHp,
        playerMagic,
        playerGear,
        enemy1,
        enemy2,
        unlockedSections,
        isUnlockingMode,
        levelUpPerks,
        spinBoard,
        shuffleBoard,
        moveCharacter,
        keepItem,
        removeGridItem,
        addKeptScroll,
        resetGame,
        applyLevelUp,
        unlockSection,
        spendGold,
        battleCount,
        conjureMagicUsed,
        applyConjureMagic
    } = useGameStore();

    const { playerAnim, enemy1Anim, enemy2Anim, isBattleRunning, runBattle } = useBattleSequence();
    const shuffleCost = useGameStore(selectShuffleCost);
    const hasTwoFairyWands = useGameStore(selectHasTwoFairyWands);
    const canConjureMagic = hasTwoFairyWands && !conjureMagicUsed;

    const handleInventoryClick = (sectionId: 0 | 1 | 2) => {
        if (isUnlockingMode && !unlockedSections[sectionId]) {
            unlockSection(sectionId);
        }
    };

    const [spinKey, setSpinKey] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [sliderResetKey, setSliderResetKey] = useState(0);
    const [selectedEquippedItem, setSelectedEquippedItem] = useState<GridItem | null>(null);

    // Conjure Magic Popup
    const [isConjureMagicOpen, setIsConjureMagicOpen] = useState(false);

    // Scroll Popup States
    const [isScrollTypePopupOpen, setIsScrollTypePopupOpen] = useState(false);
    const [scrollStage, setScrollStage] = useState<'initial' | 'lifting' | 'faded'>('initial');
    const [availableScrolls, setAvailableScrolls] = useState<IconName[]>([]);
    const [revealedScrollColor, setRevealedScrollColor] = useState<IconName | null>(null);
    const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

    const handleBuyScroll = () => {
        if (gold < GAME_CONSTANTS.SCROLL_COST || !pendingScrollId || scrollStage !== 'initial') return;
        spendGold(GAME_CONSTANTS.SCROLL_COST);
        const savedId = pendingScrollId;
        setPendingScrollId(null);
        setScrollStage('lifting');

        setTimeout(() => {
            setScrollStage('faded');
            if (revealedScrollColor) addKeptScroll(revealedScrollColor);
            removeGridItem(savedId);

            setTimeout(() => {
                setIsScrollTypePopupOpen(false);
            }, 2000);
        }, 500);
    };

    const handleCloseScrollPopup = () => {
        if (scrollStage !== 'initial') return;
        setIsScrollTypePopupOpen(false);
        setPendingScrollId(null);
    };

    const handleKeptIconClick = (e: React.MouseEvent, icon: KeptIcon) => {
        e.stopPropagation();
        setSelectedEquippedItem({ id: `equipped-${icon.name}`, name: icon.name } as GridItem);
        setSelectedIndex(null);
    };

    // Hooded Logic State
    const [glowingIndices, setGlowingIndices] = useState<number[]>([]);
    const [activeHoodedIndex, setActiveHoodedIndex] = useState<number | null>(null);
    const [hasMoved, setHasMoved] = useState(false);
    const [isScrollWindowOpen, setIsScrollWindowOpen] = useState(false);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

    const resetSelection = () => {
        setSelectedIndex(null);
        setSelectedEquippedItem(null);
        setGlowingIndices([]);
        setActiveHoodedIndex(null);
    };

    const handleSpin = () => {
        if (gold < GAME_CONSTANTS.SPIN_COST || isUnlockingMode) return;
        spinBoard();
        setSpinKey(prev => prev + 1);
        resetSelection();
        setHasMoved(false);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
    };

    const handleVary = () => {
        if (gold < shuffleCost || isUnlockingMode) return;
        shuffleBoard();
        resetSelection();
        setHasMoved(false);
        setIsShaking(true);
        setIsAnimating(true);
        setTimeout(() => {
            setIsShaking(false);
            setIsAnimating(false);
        }, 400);
    };

    const handleIconClick = (item: GridItem, index: number) => {
        if (isAnimating || isUnlockingMode) return;

        const isBoosted = findMatchingIndices(gridIcons).has(index);

        if (glowingIndices.includes(index) && activeHoodedIndex !== null) {
            const character = gridIcons[activeHoodedIndex];
            if (character && character.name === "hood") {
                moveCharacter(activeHoodedIndex, index, isBoosted);
                resetSelection();
                setHasMoved(true);
                return;
            }
        }

        if (item.name === "hood") {
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

        if (selectedIndex === index) {
            if (activeHoodedIndex !== null) {
                resetSelection();
            }

            if (item.name === 'key') {
                resetSelection();
                return;
            }

            if (item.name === 'scroll-unfurled') {
                const available = ALL_SCROLL_COLORS.filter(c => !keptScrolls.includes(c));

                if (available.length > 0) {
                    resetSelection();

                    const shuffledAvailable = [...available].sort(() => Math.random() - 0.5);
                    const targetColor = shuffledAvailable[Math.floor(Math.random() * shuffledAvailable.length)];

                    setIsScrollTypePopupOpen(true);
                    setScrollStage('initial');
                    setAvailableScrolls(shuffledAvailable);
                    setRevealedScrollColor(targetColor);
                    setPendingScrollId(item.id);
                } else {
                    removeGridItem(item.id);
                    resetSelection();
                }
                return;
            }

            const category = ICON_CATEGORIES[item.name as IconName];
            if (category === 'Nature' || category === 'Treasure') {
                resetSelection();
                return;
            }

            keepItem(item, isBoosted);
            resetSelection();
        } else {
            setSelectedIndex(index);
            setSelectedEquippedItem(null);
            setGlowingIndices([]);
            setActiveHoodedIndex(null);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            {/* ─── Header bar ─── */}
            <header
                className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 shrink-0 whitespace-nowrap"
                style={{ height: 'clamp(2.25rem, 6dvh, 3rem)', padding: '0 var(--gap)' }}
            >
                <h1 className="text-sm font-bold tracking-wider text-zinc-100 uppercase leading-none">Daily Rogue</h1>
                <div className="text-[11px] text-zinc-400 leading-none">Sunday, February 15th</div>
            </header>

            {/* ─── Main area ─── */}
            <main className="flex-1 min-h-0 flex flex-col relative">

                {/* ═══ TOP: Battle / Stats banner ═══ */}
                <section
                    className="flex bg-zinc-900/50 relative overflow-hidden min-h-0"
                    style={{ flex: 2 }}
                >
                    <HeroStatsPanel
                        playerAnim={playerAnim}
                        playerHp={playerHp}
                        playerMaxHp={playerMaxHp}
                        playerBaseAtk={useGameStore(selectTotalAttack)}
                        playerMagic={playerMagic}
                        playerGear={playerGear}
                        gold={gold}
                        moves={moves}
                        isBattleRunning={isBattleRunning}
                        onCharacterClick={() => !isBattleRunning && setIsCharacterModalOpen(true)}
                        onReset={() => {
                            resetGame();
                            resetSelection();
                            setSliderResetKey(prev => prev + 1);
                            setSpinKey(prev => prev + 1);
                        }}
                    />

                    <EnemyBattleHUD
                        enemy1={{ ...enemy1, animStatus: enemy1Anim }}
                        enemy2={{ ...enemy2, animStatus: enemy2Anim }}
                        isBattleRunning={isBattleRunning}
                        battleCount={battleCount}
                        isDisabled={playerHp === 0 || battleCount > GAME_CONSTANTS.MAX_BATTLES}
                        canConjureMagic={canConjureMagic}
                        sliderResetKey={sliderResetKey}
                        onEngage={() => {
                            if (canConjureMagic) {
                                setIsConjureMagicOpen(true);
                            } else if (playerHp > 0) {
                                runBattle();
                            }
                        }}
                    />

                    {/* Dot overlay */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                </section>

                <div className="h-px bg-zinc-700 w-full shrink-0 z-10" />

                {/* ═══ BOTTOM: Grid / Inventory / Controls ═══ */}
                <section className="min-h-0 flex flex-col items-center justify-evenly bg-zinc-950 relative overflow-hidden"
                    style={{ flex: 3, padding: `var(--gap) 0` }}
                >
                    {/* Kept Icons Row */}
                    <div className="w-full flex justify-center items-center shrink-0"
                        style={{ marginBottom: 'var(--gap)' }}
                    >
                        <div className="flex items-center justify-center" style={{ gap: 'var(--gap)' }}>
                            {INVENTORY_SECTIONS.map((section, i) => (
                                <div key={section.id} className="contents">
                                    {i > 0 && <div className="bg-zinc-800 shrink-0" style={{ width: 1, height: 'var(--cell-sm)', margin: '0 2px' }} />}
                                    <InventorySlot
                                        label={section.label}
                                        slotIndices={section.slots}
                                        keptIcons={keptIcons}
                                        isUnlocked={unlockedSections[section.id]}
                                        isUnlockingMode={isUnlockingMode}
                                        onUnlock={() => handleInventoryClick(section.id)}
                                        onKeptIconClick={handleKeptIconClick}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid + Controls row */}
                    <div className="flex items-start justify-center flex-1 min-h-0 w-full"
                        style={{ gap: 'var(--gap)', padding: `0 var(--gap)` }}
                    >
                        <div className="min-w-0">
                            <GridBoard
                                gridIcons={gridIcons}
                                spinKey={spinKey}
                                matchingIndices={findMatchingIndices(gridIcons)}
                                glowingIndices={glowingIndices}
                                activeHoodedIndex={activeHoodedIndex}
                                selectedIndex={selectedIndex}
                                selectedEquippedItem={selectedEquippedItem}
                                isShaking={isShaking}
                                onIconClick={handleIconClick}
                                onEmptyGlowClick={(index) => { if (activeHoodedIndex !== null) handleIconClick({ id: 'empty', name: 'hood' } as GridItem, index); }}
                                levelUpPerks={levelUpPerks}
                            />
                        </div>

                        <ControlButtons
                            gold={gold}
                            shuffleCost={shuffleCost}
                            isAnimating={isAnimating}
                            isUnlockingMode={isUnlockingMode}
                            keptScrollsCount={keptScrolls.length}
                            onSpin={handleSpin}
                            onVary={handleVary}
                            onScrollsOpen={() => setIsScrollWindowOpen(true)}
                        />
                    </div>

                    <ScrollWindowModal
                        isOpen={isScrollWindowOpen}
                        keptScrolls={keptScrolls}
                        onClose={() => setIsScrollWindowOpen(false)}
                    />

                    <ScrollTypeModal
                        isOpen={isScrollTypePopupOpen}
                        onClose={handleCloseScrollPopup}
                        onBuyScroll={handleBuyScroll}
                        scrollStage={scrollStage}
                        availableScrolls={availableScrolls}
                        revealedScrollColor={revealedScrollColor}
                        gold={gold}
                        scrollCost={GAME_CONSTANTS.SCROLL_COST}
                    />

                    {/* Conjure Magic Modal */}
                    <AnimatePresence>
                        {isConjureMagicOpen && (
                            <ConjureMagicModal
                                isOpen={isConjureMagicOpen}
                                onClose={() => setIsConjureMagicOpen(false)}
                                onResult={(winner) => {
                                    applyConjureMagic(winner);
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <CharacterModal
                        isOpen={isCharacterModalOpen}
                        onClose={() => setIsCharacterModalOpen(false)}
                        moves={moves}
                        levelUpPerks={levelUpPerks}
                        onApplyLevelUp={applyLevelUp}
                    />
                </section>
            </main>

        </div >
    );
}
