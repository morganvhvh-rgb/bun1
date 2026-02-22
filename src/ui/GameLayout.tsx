import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectTotalAttack, selectHasDaggers, selectCrossbowCount, selectShuffleCost } from '@/store/gameStore';
import { Icon } from './Icon';
import { HeroStatsPanel } from './HeroStatsPanel';
import { EnemyBattleHUD } from './EnemyBattleHUD';
import { GridBoard } from './GridBoard';
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
        battleCount
    } = useGameStore();

    const totalAttack = useGameStore(selectTotalAttack);
    const hasDaggers = useGameStore(selectHasDaggers);
    const crossbowCount = useGameStore(selectCrossbowCount);
    const shuffleCost = useGameStore(selectShuffleCost);

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

    const [selectedEquippedItem, setSelectedEquippedItem] = useState<GridItem | null>(null);

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

        if (playerHpRef.current === 0 || (enemy1HpRef.current === 0 && enemy2HpRef.current === 0)) {
            setIsBattleRunning(false);
            return;
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



    const controlButtonClass = "bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md grid place-items-center focus:outline-none transition-colors w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="w-full h-[100dvh] flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-700 bg-zinc-900 shrink-0 whitespace-nowrap">
                <h1 className="text-base font-bold tracking-wider text-zinc-100 uppercase">Daily Rogue</h1>
                <div className="text-xs text-zinc-400">Sunday, February 15th</div>
            </header>

            <main className="flex-1 flex flex-col relative h-full">
                <section className="h-[40%] flex bg-zinc-900/50 relative">

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
                            setSpinKey(prev => prev + 1);
                        }}
                    />

                    <EnemyBattleHUD
                        enemy1={{ ...enemy1, animStatus: enemy1Anim }}
                        enemy2={{ ...enemy2, animStatus: enemy2Anim }}
                        isBattleRunning={isBattleRunning}
                        battleCount={battleCount}
                        isDisabled={playerHp === 0 || battleCount > GAME_CONSTANTS.MAX_BATTLES}
                        onEngage={() => {
                            if (playerHp > 0 && (enemy1.hp > 0 || enemy2.hp > 0)) {
                                handleBattleSequence();
                            }
                        }}
                    />

                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                </section>

                <div className="h-1 bg-zinc-700 w-full shrink-0 z-10" />

                <section className="h-[60%] flex flex-col items-center justify-start bg-zinc-950 relative py-2 overflow-hidden">
                    <div className="flex flex-col items-center justify-start w-full h-full scale-[0.95] origin-top">

                        {/* Kept Icons Row */}
                        <div className="w-full flex justify-center items-center shrink-0 mb-6">
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

                        <div className="flex flex-row items-start justify-center gap-6 w-full max-w-2xl px-4 flex-1">
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

                            <div className="flex flex-col gap-3 mt-[1.875rem]">
                                <motion.button onClick={handleSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={controlButtonClass} title="Spin">
                                    <i className="ra ra-cycle text-zinc-400" style={{ fontSize: 20 }} />
                                </motion.button>
                                <motion.button onClick={handleVary} disabled={gold < shuffleCost || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={controlButtonClass} title="Shuffle">
                                    <i className="ra ra-perspective-dice-random text-zinc-400" style={{ fontSize: 20 }} />
                                </motion.button>
                            </div>
                        </div>

                        <div className="h-6 mt-2 flex items-center justify-center pointer-events-none w-full max-w-xl px-4">
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 z-50 flex items-center gap-2 text-zinc-500 opacity-70">
                        <i className="ra ra-coffee-mug text-lg" />
                        <span className="text-[10px] uppercase tracking-widest font-medium">Buy me a coffee</span>
                    </div>

                    <div className="absolute bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 pointer-events-none">
                        <div className="pointer-events-auto">
                            <Icon name="scroll-unfurled" scale={4} tintColor="#a16207" className="cursor-pointer hover:scale-105 transition-transform relative" onClick={() => setIsScrollWindowOpen(true)} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-10 leading-none mt-1">
                            {keptScrolls.length}
                        </div>
                    </div>

                    {/* Scroll Window Modal */}
                    <AnimatePresence>
                        {isScrollWindowOpen && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScrollWindowOpen(false)} className="fixed inset-0 bg-black/50 z-[60]" />
                                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 h-[50dvh] bg-zinc-900 border-t border-zinc-700 rounded-t-3xl shadow-2xl z-[70] flex flex-col p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-zinc-100 font-bold uppercase tracking-widest">Scroll Content</h2>
                                        <button onClick={() => setIsScrollWindowOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest">Close</button>
                                    </div>
                                    <div className="flex-1 border border-zinc-800/50 bg-zinc-950/50 rounded p-4 text-zinc-600 text-sm font-mono space-y-2 overflow-y-auto">
                                        {keptScrolls.length > 0 ? (
                                            keptScrolls.map((scrollName, i) => (
                                                <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/30 px-2 transition-colors rounded-lg">
                                                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                                        <Icon name={scrollName} scale={2} tintColor={ICON_THEME[scrollName]} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="text-zinc-300 font-bold uppercase text-xs tracking-wider">
                                                            {scrollName.replace('scroll-', '')} Scroll
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500">
                                                            Does X to Y twice
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="opacity-50 text-center mt-4 pt-4">No scrolls collected</div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Scroll Type Popup Modal */}
                    <AnimatePresence>
                        {isScrollTypePopupOpen && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-6" onClick={handleCloseScrollPopup}>
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col p-6 relative overflow-hidden w-full max-w-sm min-h-[380px]" onClick={e => e.stopPropagation()}>

                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-zinc-100 font-bold uppercase tracking-widest leading-none">SCROLL TYPE</h2>
                                            <button onClick={handleCloseScrollPopup} className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest">Close</button>
                                        </div>

                                        <div className="flex justify-center mb-6">
                                            {scrollStage === 'initial' ? (
                                                <button onClick={handleBuyScroll} disabled={gold < GAME_CONSTANTS.SCROLL_COST} className={`py-3 px-6 w-full rounded font-bold uppercase tracking-widest text-sm transition-colors border ${gold >= GAME_CONSTANTS.SCROLL_COST ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-500 border-yellow-900/50' : 'bg-red-950/20 text-red-500/50 border-red-900/30 cursor-not-allowed'}`}>
                                                    Buy Scroll {gold < GAME_CONSTANTS.SCROLL_COST ? `(Need ${GAME_CONSTANTS.SCROLL_COST}g)` : `(${GAME_CONSTANTS.SCROLL_COST}g)`}
                                                </button>
                                            ) : (
                                                <div className="py-3 px-6 w-full text-center rounded font-bold uppercase tracking-widest text-sm bg-zinc-800 text-zinc-500 border border-zinc-700 opacity-50">
                                                    Unlocking...
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-h-[12rem] border border-zinc-800/50 bg-zinc-950/50 rounded flex flex-col items-center justify-center relative overflow-hidden shadow-inner p-4">
                                            <div className="relative flex w-full h-full items-center justify-center">
                                                {availableScrolls.map((color, i) => {
                                                    const isRevealed = revealedScrollColor === color;

                                                    const spacing = 40;
                                                    const xPos = (i - (availableScrolls.length - 1) / 2) * spacing;

                                                    const yPos = (isRevealed && (scrollStage === 'lifting' || scrollStage === 'faded')) ? -25 : 10;
                                                    const opacity = (!isRevealed && scrollStage === 'faded') ? 0 : 1;

                                                    return (
                                                        <motion.div
                                                            key={color}
                                                            className="absolute"
                                                            initial={{ x: xPos, y: 10, opacity: 1 }}
                                                            animate={{
                                                                y: yPos,
                                                                x: xPos,
                                                                opacity: opacity,
                                                                zIndex: isRevealed ? 50 : i
                                                            }}
                                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                                        >
                                                            <Icon name={color} scale={5} tintColor={ICON_THEME[color]} />
                                                        </motion.div>
                                                    );
                                                })}

                                            </div>

                                            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
                                                <AnimatePresence>
                                                    {scrollStage === 'faded' && revealedScrollColor && (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-sm text-zinc-100 font-black uppercase tracking-[0.2em] leading-none text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                                            {revealedScrollColor.replace('scroll-', '')}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                    </motion.div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Character Modal */}
                    <AnimatePresence>
                        {isCharacterModalOpen && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCharacterModalOpen(false)} className="fixed inset-0 bg-black/50 z-[60]" />
                                <motion.div initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 left-0 right-0 h-[50dvh] bg-zinc-900 border-b border-zinc-700 rounded-b-3xl shadow-2xl z-[70] flex flex-col p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-zinc-100 font-bold uppercase tracking-widest">
                                            Character <span className="text-zinc-500 ml-2">Lvl {1 + levelUpPerks.length}</span>
                                        </h2>
                                        <button onClick={() => setIsCharacterModalOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest">Close</button>
                                    </div>
                                    <div className="flex-1 border border-zinc-800/50 bg-zinc-950/50 rounded flex flex-col p-4 text-zinc-600 text-sm font-mono overflow-y-auto">
                                        {moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED && (
                                            <div className="flex flex-col gap-3 w-full">
                                                <h3 className="text-green-500 font-bold uppercase tracking-widest text-center mb-2">LEVEL UP! Make a choice:</h3>
                                                {levelUpPerks.length === 0 ? (
                                                    <>
                                                        <button onClick={() => applyLevelUp("full_heal_max_hp")} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded font-bold uppercase tracking-wider text-xs border border-zinc-600 transition-colors">
                                                            Full heal and +10 Max HP
                                                        </button>
                                                        <button onClick={() => applyLevelUp("nature_2x_exp")} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded font-bold uppercase tracking-wider text-xs border border-zinc-600 transition-colors">
                                                            All Nature symbols give 2x EXP
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => applyLevelUp("full_heal")} className="bg-green-950/20 hover:bg-green-900/30 text-green-500 p-3 rounded font-bold uppercase tracking-wider text-xs border border-green-900/40 transition-colors">
                                                        Full Heal
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {levelUpPerks.length > 0 && (
                                            <div className="mt-8 pt-4 border-t border-zinc-800/50 flex flex-col gap-2 w-full shrink-0">
                                                <h3 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Applied Level Ups</h3>
                                                <div className="flex flex-col gap-1">
                                                    {levelUpPerks.map((perk, i) => (
                                                        <div key={i} className="text-xs text-zinc-400 font-mono">
                                                            - {perk === "full_heal_max_hp" ? "Full heal & +10 Max HP" : perk === "nature_2x_exp" ? "All Nature symbols give 2x EXP" : "Full Heal"}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </section>
            </main>
        </div >
    );
}
