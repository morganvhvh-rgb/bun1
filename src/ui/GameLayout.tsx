import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectTotalAttack, selectHasDaggers, selectCrossbowCount, selectShuffleCost, selectHasTwoFairyWands } from '@/store/gameStore';
import { Icon } from './Icon';
import { HeroStatsPanel } from './HeroStatsPanel';
import { EnemyBattleHUD } from './EnemyBattleHUD';
import { GridBoard } from './GridBoard';
import { ConjureMagicModal } from './ConjureMagicModal';
import { ScrollWindowModal } from './ScrollWindowModal';
import { ScrollTypeModal } from './ScrollTypeModal';
import { CharacterModal } from './CharacterModal';
import { ICON_THEME, ICON_CATEGORIES, GAME_CONSTANTS, ALL_SCROLL_COLORS } from '@/lib/constants';
import { findMatchingIndices, getCoordinates, getIndex } from '@/lib/utils';
import type { GridItem, IconName, KeptIcon } from '@/types/game';

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
        applyBattleDamage,
        setEnemyVisibility,
        resetBattleTarget,
        resetGame,
        applyLevelUp,
        unlockSection,
        spendGold,
        battleCount,
        conjureMagicUsed,
        applyConjureMagic
    } = useGameStore();

    const totalAttack = useGameStore(selectTotalAttack);
    const hasDaggers = useGameStore(selectHasDaggers);
    const crossbowCount = useGameStore(selectCrossbowCount);
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

    // Battle Animation States
    const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hurt'>('idle');
    const [enemy1Anim, setEnemy1Anim] = useState<'idle' | 'attack' | 'hurt'>('idle');
    const [enemy2Anim, setEnemy2Anim] = useState<'idle' | 'attack' | 'hurt'>('idle');
    const [isBattleRunning, setIsBattleRunning] = useState(false);
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

    // Local refs to sync async loop with zustand state
    const playerHpRef = useRef(playerHp);
    const enemy1HpRef = useRef(enemy1.hp);
    const enemy2HpRef = useRef(enemy2.hp);

    useEffect(() => {
        playerHpRef.current = playerHp;
        enemy1HpRef.current = enemy1.hp;
        enemy2HpRef.current = enemy2.hp;
    }, [playerHp, enemy1.hp, enemy2.hp]);

    useEffect(() => {
        playerHpRef.current = playerHp;
        enemy1HpRef.current = enemy1.hp;
        enemy2HpRef.current = enemy2.hp;
    }, [playerHp, enemy1.hp, enemy2.hp]);

    const handleBattleSequence = async () => {
        if (isBattleRunning) return;
        setIsBattleRunning(true);

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        const pAtk = totalAttack;
        const e1AtkVal = enemy1.atk;
        const e2AtkVal = enemy2.atk;

        if (playerHpRef.current === 0) {
            setIsBattleRunning(false);
            return;
        }

        // Handle enemies already killed (e.g. by conjure magic lightning-trio)
        if (enemy1HpRef.current === 0 && enemy2HpRef.current === 0) {
            await delay(200);
            if (enemy1.isVisible) setEnemyVisibility('enemy1', false);
            if (enemy2.isVisible) setEnemyVisibility('enemy2', false);
            await delay(600);
            resetBattleTarget();
            setIsBattleRunning(false);
            return;
        }

        // Fade out any individually pre-killed enemies before battle starts
        if (enemy1HpRef.current === 0 && enemy1.isVisible) {
            setEnemyVisibility('enemy1', false);
            await delay(300);
        }
        if (enemy2HpRef.current === 0 && enemy2.isVisible) {
            setEnemyVisibility('enemy2', false);
            await delay(300);
        }

        let isFirstAttack = true;

        while (playerHpRef.current > 0 && (enemy1HpRef.current > 0 || enemy2HpRef.current > 0)) {
            const attackLoops = (isFirstAttack && hasDaggers) ? 3 : 1;
            isFirstAttack = false;

            for (let i = 0; i < attackLoops; i++) {
                if (enemy1HpRef.current === 0 && enemy2HpRef.current === 0) break;

                setPlayerAnim('attack');
                await delay(120);
                setPlayerAnim('idle');

                const target = enemy1HpRef.current > 0 ? 1 : 2;
                if (target === 1) {
                    const bonusAtk = enemy1.type.includes('flying') ? (crossbowCount * 10) : 0;
                    applyBattleDamage('enemy1', pAtk + bonusAtk);
                    setEnemy1Anim('hurt');
                    await delay(250);
                    setEnemy1Anim('idle');
                    if (enemy1HpRef.current === 0) {
                        await delay(20);
                        setEnemyVisibility('enemy1', false);
                    }
                } else {
                    const bonusAtk = enemy2.type.includes('flying') ? (crossbowCount * 10) : 0;
                    applyBattleDamage('enemy2', pAtk + bonusAtk);
                    setEnemy2Anim('hurt');
                    await delay(250);
                    setEnemy2Anim('idle');
                    if (enemy2HpRef.current === 0) {
                        await delay(20);
                        setEnemyVisibility('enemy2', false);
                    }
                }

                if (i < attackLoops - 1) {
                    await delay(120);
                }
            }

            if (enemy1HpRef.current === 0 && enemy2HpRef.current === 0) break;

            await delay(120);

            if (enemy1HpRef.current > 0) {
                setEnemy1Anim('attack');
                await delay(120);
                setEnemy1Anim('idle');

                applyBattleDamage('player', e1AtkVal);
                setPlayerAnim('hurt');
                await delay(250);
                setPlayerAnim('idle');
            }

            if (playerHpRef.current === 0) break;
            await delay(120);

            if (enemy2HpRef.current > 0) {
                setEnemy2Anim('attack');
                await delay(120);
                setEnemy2Anim('idle');

                applyBattleDamage('player', e2AtkVal);
                setPlayerAnim('hurt');
                await delay(250);
                setPlayerAnim('idle');
            }

            if (playerHpRef.current === 0) break;

            await delay(120);
        }

        if (enemy1HpRef.current === 0 && enemy2HpRef.current === 0) {
            setTimeout(() => {
                resetBattleTarget();
                setIsBattleRunning(false);
            }, 600);
            return;
        }

        setIsBattleRunning(false);
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



    const controlButtonClass = "bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md grid place-items-center focus:outline-none transition-colors w-14 h-14 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            <header className="h-12 flex items-center justify-between px-4 border-b border-zinc-700 bg-zinc-900 shrink-0 whitespace-nowrap">
                <h1 className="text-base font-bold tracking-wider text-zinc-100 uppercase">Daily Rogue</h1>
                <div className="text-xs text-zinc-400">Sunday, February 15th</div>
            </header>

            <main className="flex-1 min-h-0 flex flex-col relative">
                <section className="h-[clamp(13.5rem,38%,21rem)] flex bg-zinc-900/50 relative overflow-hidden">

                    <HeroStatsPanel
                        playerAnim={playerAnim}
                        playerHp={playerHp}
                        playerMaxHp={playerMaxHp}
                        playerBaseAtk={totalAttack}
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
                                handleBattleSequence();
                            }
                        }}
                    />

                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                </section>

                <div className="h-px bg-zinc-700 w-full shrink-0 z-10" />

                <section className="flex-1 min-h-0 flex flex-col items-center justify-start bg-zinc-950 relative py-1">
                    <div className="flex flex-col items-center justify-start w-full h-full scale-[0.95] origin-top">

                        {/* Kept Icons Row */}
                        <div className="w-full flex justify-center items-center shrink-0 mb-3">
                            <div className="flex gap-2 min-h-[3.5rem] items-center justify-center">
                                {/* Food / Item */}
                                <div
                                    className="flex gap-2 items-center justify-start w-[6.5rem] h-12 relative"
                                    onClick={() => handleInventoryClick(0)}
                                >
                                    {!unlockedSections[0] ? (
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 mt-0.5 rounded transition-colors ${isUnlockingMode ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`} style={{ pointerEvents: isUnlockingMode ? 'auto' : 'none' }}>
                                            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap leading-none">Food/Item</span>
                                            {isUnlockingMode ? (
                                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest whitespace-nowrap leading-none animate-pulse">UNLOCK?</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-red-900/80 uppercase tracking-widest whitespace-nowrap leading-none">LOCKED</span>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {!keptIcons[0] && !keptIcons[1] && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5 mt-0.5">
                                                    <span className="text-xs font-bold text-zinc-700/50 uppercase tracking-widest whitespace-nowrap leading-none">Food/Item</span>
                                                </div>
                                            )}
                                            {keptIcons[0] && <div className="shrink-0 w-12 h-12 flex items-center justify-center relative cursor-pointer" onClick={(e) => handleKeptIconClick(e, keptIcons[0]!)}><span className="absolute top-1 left-1.5 text-white text-base font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{keptIcons[0].battleCount}</span><Icon name={keptIcons[0].name} scale={3} tintColor={ICON_THEME[keptIcons[0].name as IconName]} /></div>}
                                            {keptIcons[1] && <div className="shrink-0 w-12 h-12 flex items-center justify-center relative cursor-pointer" onClick={(e) => handleKeptIconClick(e, keptIcons[1]!)}><span className="absolute top-1 left-1.5 text-white text-base font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{keptIcons[1].battleCount}</span><Icon name={keptIcons[1].name} scale={3} tintColor={ICON_THEME[keptIcons[1].name as IconName]} /></div>}
                                        </>
                                    )}
                                </div>
                                <div className="w-px h-6 bg-zinc-800 shrink-0 mx-1" />
                                {/* Armor / Magic */}
                                <div
                                    className="flex gap-2 items-center justify-start w-[6.5rem] h-12 relative"
                                    onClick={() => handleInventoryClick(1)}
                                >
                                    {!unlockedSections[1] ? (
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 mt-0.5 rounded transition-colors ${isUnlockingMode ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`} style={{ pointerEvents: isUnlockingMode ? 'auto' : 'none' }}>
                                            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap leading-none">Armor/Magic</span>
                                            {isUnlockingMode ? (
                                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest whitespace-nowrap leading-none animate-pulse">UNLOCK?</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-red-900/80 uppercase tracking-widest whitespace-nowrap leading-none">LOCKED</span>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {!keptIcons[2] && !keptIcons[3] && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5 mt-0.5">
                                                    <span className="text-xs font-bold text-zinc-700/50 uppercase tracking-widest whitespace-nowrap leading-none">Armor/Magic</span>
                                                </div>
                                            )}
                                            {keptIcons[2] && <div className="shrink-0 w-12 h-12 flex items-center justify-center relative cursor-pointer" onClick={(e) => handleKeptIconClick(e, keptIcons[2]!)}><span className="absolute top-1 left-1.5 text-white text-base font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{keptIcons[2].battleCount}</span><Icon name={keptIcons[2].name} scale={3} tintColor={ICON_THEME[keptIcons[2].name as IconName]} /></div>}
                                            {keptIcons[3] && <div className="shrink-0 w-12 h-12 flex items-center justify-center relative cursor-pointer" onClick={(e) => handleKeptIconClick(e, keptIcons[3]!)}><span className="absolute top-1 left-1.5 text-white text-base font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{keptIcons[3].battleCount}</span><Icon name={keptIcons[3].name} scale={3} tintColor={ICON_THEME[keptIcons[3].name as IconName]} /></div>}
                                        </>
                                    )}
                                </div>
                                <div className="w-px h-6 bg-zinc-800 shrink-0 mx-1" />
                                {/* Weapon / Music */}
                                <div
                                    className="flex gap-2 items-center justify-start w-[6.5rem] h-12 relative"
                                    onClick={() => handleInventoryClick(2)}
                                >
                                    {!unlockedSections[2] ? (
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 mt-0.5 rounded transition-colors ${isUnlockingMode ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`} style={{ pointerEvents: isUnlockingMode ? 'auto' : 'none' }}>
                                            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap leading-none">Weapon/Music</span>
                                            {isUnlockingMode ? (
                                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest whitespace-nowrap leading-none animate-pulse">UNLOCK?</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-red-900/80 uppercase tracking-widest whitespace-nowrap leading-none">LOCKED</span>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {!keptIcons[4] && !keptIcons[5] && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5 mt-0.5">
                                                    <span className="text-xs font-bold text-zinc-700/50 uppercase tracking-widest whitespace-nowrap leading-none">Weapon/Music</span>
                                                </div>
                                            )}
                                            {keptIcons[4] && <div className="shrink-0 w-12 h-12 flex items-center justify-center relative cursor-pointer" onClick={(e) => handleKeptIconClick(e, keptIcons[4]!)}><span className="absolute top-1 left-1.5 text-white text-base font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{keptIcons[4].battleCount}</span><Icon name={keptIcons[4].name} scale={3} tintColor={ICON_THEME[keptIcons[4].name as IconName]} /></div>}
                                            {keptIcons[5] && <div className="shrink-0 w-12 h-12 flex items-center justify-center relative cursor-pointer" onClick={(e) => handleKeptIconClick(e, keptIcons[5]!)}><span className="absolute top-1 left-1.5 text-white text-base font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{keptIcons[5].battleCount}</span><Icon name={keptIcons[5].name} scale={3} tintColor={ICON_THEME[keptIcons[5].name as IconName]} /></div>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-start justify-center gap-4 w-full max-w-2xl px-4 flex-1 min-h-0">
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

                            <div className="flex flex-col gap-3 ml-2">
                                <motion.button onClick={handleSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={controlButtonClass} title="Spin">
                                    <i className="ra ra-cycle text-zinc-400" style={{ fontSize: 32 }} />
                                </motion.button>
                                <motion.button onClick={handleVary} disabled={gold < shuffleCost || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={controlButtonClass} title="Shuffle">
                                    <i className="ra ra-perspective-dice-random text-zinc-400" style={{ fontSize: 32 }} />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={() => setIsScrollWindowOpen(true)}
                                    whileTap={{ scale: 0.95 }}
                                    className={`${controlButtonClass} relative`}
                                    title="Scrolls"
                                >
                                    <Icon name="scroll-unfurled" scale={2} tintColor="#a1a1aa" />
                                    <div className="absolute inset-0 text-white text-base font-black leading-none flex items-center justify-center pointer-events-none">
                                        {keptScrolls.length}
                                    </div>
                                </motion.button>
                            </div>
                        </div>
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
