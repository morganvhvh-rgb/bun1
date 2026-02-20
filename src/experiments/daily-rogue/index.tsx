import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { ICON_KEYS, ICON_THEME, ICON_STATS, ICON_CATEGORIES, type GridItem, type IconName } from './data';

export default function DailyRogueUI() {
    const [gridIcons, setGridIcons] = useState<(GridItem | null)[]>(() => generateRandomIcons());
    const [spinKey, setSpinKey] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [keptIcons, setKeptIcons] = useState<IconName[]>([]);
    const [keptScrolls, setKeptScrolls] = useState<IconName[]>([]);
    const [gold, setGold] = useState(100);
    const [moves, setMoves] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Battle Animation States
    const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hurt'>('idle');
    const [enemy1Anim, setEnemy1Anim] = useState<'idle' | 'attack' | 'hurt'>('idle');
    const [enemy2Anim, setEnemy2Anim] = useState<'idle' | 'attack' | 'hurt'>('idle');
    const [isBattleRunning, setIsBattleRunning] = useState(false);

    // Battle Stats
    const [playerHp, setPlayerHp] = useState(50);
    const [playerMaxHp] = useState(50);
    const [playerBaseAtk] = useState(5);

    const [enemy1Hp, setEnemy1Hp] = useState(10);
    const [enemy1MaxHp] = useState(10);
    const [enemy1Atk] = useState(5);

    const [enemy2Hp, setEnemy2Hp] = useState(10);
    const [enemy2MaxHp] = useState(10);
    const [enemy2Atk] = useState(5);

    const [engageProgress, setEngageProgress] = useState(0);
    const engageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (engageIntervalRef.current) clearInterval(engageIntervalRef.current);
        };
    }, []);

    const handleBattleSequence = async () => {
        if (isBattleRunning) return;
        setIsBattleRunning(true);

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        let pHP = playerHp;
        let e1HP = enemy1Hp;
        let e2HP = enemy2Hp;

        const pAtk = playerBaseAtk;
        const e1AtkVal = enemy1Atk;
        const e2AtkVal = enemy2Atk;

        if (pHP === 0 || (e1HP === 0 && e2HP === 0)) {
            setIsBattleRunning(false);
            return;
        }

        while (pHP > 0 && (e1HP > 0 || e2HP > 0)) {
            setPlayerAnim('attack');
            await delay(200);
            setPlayerAnim('idle');

            let target = e1HP > 0 ? 1 : 2;
            if (target === 1) {
                e1HP = Math.max(0, e1HP - pAtk);
                setEnemy1Hp(e1HP);
                setEnemy1Anim('hurt');
                await delay(400);
                setEnemy1Anim('idle');
            } else {
                e2HP = Math.max(0, e2HP - pAtk);
                setEnemy2Hp(e2HP);
                setEnemy2Anim('hurt');
                await delay(400);
                setEnemy2Anim('idle');
            }

            if (e1HP === 0 && e2HP === 0) break;

            await delay(200);

            if (e1HP > 0) {
                setEnemy1Anim('attack');
                await delay(200);
                setEnemy1Anim('idle');

                pHP = Math.max(0, pHP - e1AtkVal);
                setPlayerHp(pHP);
                setPlayerAnim('hurt');
                await delay(400);
                setPlayerAnim('idle');
            }

            if (pHP === 0) break;
            await delay(200);

            if (e2HP > 0) {
                setEnemy2Anim('attack');
                await delay(200);
                setEnemy2Anim('idle');

                pHP = Math.max(0, pHP - e2AtkVal);
                setPlayerHp(pHP);
                setPlayerAnim('hurt');
                await delay(400);
                setPlayerAnim('idle');
            }

            if (pHP === 0) break;

            await delay(200);
        }

        setIsBattleRunning(false);
    };

    const handlePointerDown = () => {
        if (playerHp === 0 || (enemy1Hp === 0 && enemy2Hp === 0) || isBattleRunning) return;
        setEngageProgress(0);

        let progress = 0;
        engageIntervalRef.current = setInterval(() => {
            progress += 5;
            if (progress >= 100) {
                clearInterval(engageIntervalRef.current!);
                engageIntervalRef.current = null;
                setEngageProgress(100);
                setTimeout(() => {
                    handleBattleSequence();
                    setEngageProgress(0);
                }, 50);
            } else {
                setEngageProgress(progress);
            }
        }, 50);
    };

    const handlePointerUpOrLeave = () => {
        if (engageIntervalRef.current) {
            clearInterval(engageIntervalRef.current);
            engageIntervalRef.current = null;
        }
        setEngageProgress(0);
    };

    // Hooded Logic State
    const [glowingIndices, setGlowingIndices] = useState<number[]>([]);
    const [activeHoodedIndex, setActiveHoodedIndex] = useState<number | null>(null);
    const [hasMoved, setHasMoved] = useState(false);
    const [isScrollWindowOpen, setIsScrollWindowOpen] = useState(false);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

    function generateRandomIcons(): GridItem[] {
        const totalSlots = 12;
        const characterIndex = Math.floor(Math.random() * totalSlots);

        return Array.from({ length: totalSlots }, (_, index) => {
            if (index === characterIndex) {
                return {
                    id: crypto.randomUUID(),
                    name: "hood"
                };
            }

            const randomIndex = Math.floor(Math.random() * ICON_KEYS.length);
            const name = ICON_KEYS[randomIndex];

            return {
                id: crypto.randomUUID(),
                name: name
            };
        });
    }



    const resetSelection = () => {
        setSelectedIndex(null);
        setGlowingIndices([]);
        setActiveHoodedIndex(null);
    };

    const handleSpin = () => {
        if (gold < 1) return;
        setGold(g => g - 1);
        setGridIcons(generateRandomIcons());
        setSpinKey(prev => prev + 1);
        resetSelection();
        setHasMoved(false);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
    };

    const handleVary = () => {
        if (gold < 1) return;
        setGold(g => g - 1);
        setGridIcons(prev => {
            const newArr = [...prev];
            // Fisher-Yates shuffle
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        });
        resetSelection();
        setHasMoved(false);
        setIsShaking(true);
        setIsAnimating(true);
        setTimeout(() => {
            setIsShaking(false);
            setIsAnimating(false);
        }, 400);
    };


    const getCoordinates = (index: number) => ({ row: Math.floor(index / 4), col: index % 4 });
    const getIndex = (row: number, col: number) => row * 4 + col;

    const handleIconClick = (item: GridItem, index: number) => {
        if (isAnimating) return;

        // If clicking a glowing target (Movement)
        if (glowingIndices.includes(index) && activeHoodedIndex !== null) {
            const character = gridIcons[activeHoodedIndex];
            // Verify we are moving a hooded figure
            if (character && character.name === "hood") {
                setGridIcons(prev => {
                    const next = [...prev];
                    const pCoords = getCoordinates(activeHoodedIndex);
                    const tCoords = getCoordinates(index);

                    // Clear path
                    if (pCoords.row === tCoords.row) { // Horizontal
                        const min = Math.min(pCoords.col, tCoords.col);
                        const max = Math.max(pCoords.col, tCoords.col);
                        for (let c = min; c <= max; c++) next[getIndex(pCoords.row, c)] = null;
                    } else { // Vertical
                        const min = Math.min(pCoords.row, tCoords.row);
                        const max = Math.max(pCoords.row, tCoords.row);
                        for (let r = min; r <= max; r++) next[getIndex(r, pCoords.col)] = null;
                    }

                    // Place Character at target (reusing ID)
                    next[index] = { ...character };
                    return next;
                });

                resetSelection();
                setHasMoved(true);
                setMoves(m => m + 1);
                return;
            }
        }

        // Handle Hooded Figure Selection
        if (item.name === "hood") {
            if (hasMoved) return; // Prevent selection if already moved
            const { row, col } = getCoordinates(index);
            const targets: number[] = [];

            // 4 Directions: Neighbors
            if (col > 0) targets.push(getIndex(row, col - 1)); // Left
            if (col < 3) targets.push(getIndex(row, col + 1)); // Right
            if (row > 0) targets.push(getIndex(row - 1, col)); // Up
            if (row < 2) targets.push(getIndex(row + 1, col)); // Down

            setGlowingIndices(targets);
            setActiveHoodedIndex(index);
            setSelectedIndex(index);
            return;
        }

        // Default behavior (Select/Keep) for non-Hooded
        if (selectedIndex === index) {
            if (activeHoodedIndex !== null) {
                // If we had a character selected and clicked another same-named item
                resetSelection();
            }

            if (item.name === 'scroll-unfurled') {
                if (keptScrolls.length >= 6) return;
                setGridIcons(prev => prev.map(s => s?.id === item.id ? null : s));
                setKeptScrolls(prev => [...prev, item.name]);
                resetSelection();
                return;
            }

            if (keptIcons.length >= 6) return;
            setGridIcons(prev => prev.map(s => s?.id === item.id ? null : s));
            setKeptIcons(prev => [...prev, item.name]);
            resetSelection();
        } else {
            setSelectedIndex(index);
            setGlowingIndices([]);
            setActiveHoodedIndex(null);
        }
    };

    const findMatchingIndices = () => {
        const matches = new Set<number>();
        const visited = new Set<number>();

        for (let i = 0; i < gridIcons.length; i++) {
            if (visited.has(i) || !gridIcons[i]) continue;

            const name = gridIcons[i]!.name;
            const group = [i];
            const queue = [i];
            visited.add(i);

            while (queue.length > 0) {
                const current = queue.shift()!;
                const { row, col } = getCoordinates(current);

                // Check 4 adjacent neighbors (no diagonals)
                const neighbors = [
                    { r: row - 1, c: col },
                    { r: row + 1, c: col },
                    { r: row, c: col - 1 },
                    { r: row, c: col + 1 }
                ];

                for (const n of neighbors) {
                    if (n.r >= 0 && n.r < 3 && n.c >= 0 && n.c < 4) {
                        const nIdx = getIndex(n.r, n.c);
                        if (!visited.has(nIdx) && gridIcons[nIdx]?.name === name) {
                            visited.add(nIdx);
                            group.push(nIdx);
                            queue.push(nIdx);
                        }
                    }
                }
            }

            if (group.length >= 3) {
                group.forEach(idx => matches.add(idx));
            }
        }
        return matches;
    };

    const matchingIndices = findMatchingIndices();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.5, rotate: -180 },
        show: { opacity: 1, scale: 1, rotate: 0 },
        shake: {
            opacity: 1,
            scale: 1,
            rotate: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.4 }
        }
    };

    const playerIconVariants: Variants = {
        idle: { scale: 1, x: 0, y: 0 },
        attack: { scale: 1.3, x: 20, y: -10, transition: { duration: 0.2, ease: "easeOut" } },
        hurt: { x: [-5, 5, -5, 5, 0], scale: [1, 0.9, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"], transition: { duration: 0.4 } }
    };

    const enemyIconVariants: Variants = {
        idle: { scale: 1, x: 0, y: 0 },
        attack: { scale: 1.3, x: -20, y: 10, transition: { duration: 0.2, ease: "easeOut" } },
        hurt: { x: [-5, 5, -5, 5, 0], scale: [1, 0.9, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"], transition: { duration: 0.4 } }
    };

    const hpVariants: Variants = {
        idle: { color: '#d4d4d8', scale: 1 },
        hurt: { color: '#ef4444', scale: [1, 1.5, 1], transition: { duration: 0.4 } }
    };

    const controlButtonClass =
        "bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md grid place-items-center focus:outline-none transition-colors w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="w-full h-[100dvh] flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            {/* Top Bar */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-700 bg-zinc-900 shrink-0 whitespace-nowrap">
                <h1 className="text-base font-bold tracking-wider text-zinc-100 uppercase">Daily Rogue</h1>
                <div className="text-xs text-zinc-400">Sunday, February 15th</div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative h-full">
                {/* Top Half */}
                <section className="h-[40%] flex bg-zinc-900/50 relative">
                    {/* Left Section */}
                    <div className="w-[7.5rem] sm:w-[8.5rem] md:w-[30%] border-r border-zinc-800 flex flex-col items-center justify-start gap-2 pt-4 shrink-0">
                        <div className="relative flex">
                            <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="z-10 relative">
                                <Icon
                                    name="hood"
                                    scale={4}
                                    tintColor="#7e22ce"
                                    className={cn("cursor-pointer hover:brightness-110 transition-all active:scale-95", isBattleRunning && "pointer-events-none")}
                                    onClick={() => !isBattleRunning && setIsCharacterModalOpen(true)}
                                />
                            </motion.div>
                            <div className="absolute bottom-0 -right-2 text-white font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-20 leading-none">
                                {moves}
                            </div>
                        </div>
                        <div className="flex flex-col w-full px-1.5 sm:px-2 text-xs tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium gap-1.5">
                            <div className="flex justify-between items-center">
                                <span>HP</span>
                                <motion.span
                                    animate={playerAnim === 'hurt' ? "hurt" : "idle"}
                                    variants={hpVariants}
                                    className="text-zinc-300 inline-block origin-right"
                                >
                                    {playerHp}/{playerMaxHp}
                                </motion.span>
                            </div>
                            <div className="flex justify-between items-center"><span>Magic</span> <span className="text-zinc-300">7</span></div>
                            <div className="flex justify-between items-center whitespace-nowrap"><span>Base Atk</span> <span className="text-zinc-300">{playerBaseAtk}</span></div>
                            <div className="flex justify-between items-center"><span>Gear</span> <span className="text-zinc-300">4</span></div>
                            <div className="flex justify-between items-center"><span>Gold</span> <span className="text-zinc-300">{gold}</span></div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 flex items-start justify-center gap-3 sm:gap-6 md:gap-12 relative pt-4 px-2 sm:px-3 md:px-0">
                        <div className="flex flex-col items-center gap-2">
                            <motion.div animate={enemy1Anim} variants={enemyIconVariants} initial="idle" className="z-10 relative">
                                <Icon name="wyvern" scale={4} tintColor="#15803d" />
                            </motion.div>
                            <div className="flex flex-col w-24 sm:w-28 px-1 text-xs tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium gap-1.5">
                                <div className="flex justify-between items-center"><span>Lvl</span> <span className="text-zinc-300">1</span></div>
                                <div className="flex justify-between items-center">
                                    <span>HP</span>
                                    <motion.span
                                        animate={enemy1Anim === 'hurt' ? "hurt" : "idle"}
                                        variants={hpVariants}
                                        className="text-zinc-300 inline-block origin-right"
                                    >
                                        {enemy1Hp}/{enemy1MaxHp}
                                    </motion.span>
                                </div>
                                <div className="flex justify-between items-center"><span>Atk</span> <span className="text-zinc-300">{enemy1Atk}</span></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <motion.div animate={enemy2Anim} variants={enemyIconVariants} initial="idle" className="z-10 relative">
                                <Icon name="octopus" scale={4} tintColor="#f9a8d4" />
                            </motion.div>
                            <div className="flex flex-col w-24 sm:w-28 px-1 text-xs tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium gap-1.5">
                                <div className="flex justify-between items-center"><span>Lvl</span> <span className="text-zinc-300">1</span></div>
                                <div className="flex justify-between items-center">
                                    <span>HP</span>
                                    <motion.span
                                        animate={enemy2Anim === 'hurt' ? "hurt" : "idle"}
                                        variants={hpVariants}
                                        className="text-zinc-300 inline-block origin-right"
                                    >
                                        {enemy2Hp}/{enemy2MaxHp}
                                    </motion.span>
                                </div>
                                <div className="flex justify-between items-center"><span>Atk</span> <span className="text-zinc-300">{enemy2Atk}</span></div>
                            </div>
                        </div>

                        {/* New Action Buttons */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onPointerDown={handlePointerDown}
                                onPointerUp={handlePointerUpOrLeave}
                                onPointerLeave={handlePointerUpOrLeave}
                                disabled={isBattleRunning}
                                className={cn(
                                    "relative overflow-hidden w-full max-w-xs h-12 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md focus:outline-none transition-colors text-zinc-300 text-sm tracking-[0.35em] font-semibold uppercase flex items-center justify-center text-center leading-none whitespace-nowrap select-none touch-none",
                                    isBattleRunning && "opacity-50 cursor-not-allowed pointer-events-none"
                                )}
                                title="Attack"
                            >
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-red-900/50 transition-all duration-75 ease-linear pointer-events-none"
                                    style={{ width: `${engageProgress}%` }}
                                />
                                <span className="relative z-10">ENGAGE</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                </section>

                {/* Divider */}
                <div className="h-1 bg-zinc-700 w-full shrink-0 z-10" />

                {/* Bottom Half */}
                <section className="h-[60%] flex flex-col items-center justify-start bg-zinc-950 relative py-2 overflow-hidden">
                    <div className="flex flex-col items-center justify-start w-full h-full scale-[0.95] origin-top">

                        {/* Kept Icons Row */}
                        <div className="w-full flex justify-center items-center shrink-0 mb-6">
                            <div className="flex gap-2 min-h-[3.5rem] items-center">
                                {keptIcons.length > 0 ? keptIcons.map((name, i) => (
                                    <div key={i} className="shrink-0 w-12 h-12 flex items-center justify-center">
                                        <Icon name={name} scale={3} tintColor={ICON_THEME[name]} />
                                    </div>
                                )) : <div className="text-zinc-800 text-xs tracking-widest uppercase">No items kept</div>}
                            </div>
                        </div>

                        {/* Main Layout: Spacer - Grid - Buttons */}
                        <div className="flex flex-row items-start justify-center gap-6 w-full max-w-2xl px-4 flex-1">

                            {/* Center Column: Grid + Text */}
                            <div className="flex flex-col items-center gap-2">
                                <motion.div
                                    key={spinKey}
                                    className="grid grid-cols-4 grid-rows-3 gap-3"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                >
                                    <AnimatePresence mode='popLayout'>
                                        {gridIcons.map((item, index) => {
                                            const isMatching = matchingIndices.has(index);
                                            const isTarget = glowingIndices.includes(index) && activeHoodedIndex !== null;

                                            let arrowRotation = 0;
                                            if (isTarget) {
                                                const { row: startRow, col: startCol } = getCoordinates(activeHoodedIndex!);
                                                const { row: targetRow, col: targetCol } = getCoordinates(index);

                                                if (targetRow < startRow) arrowRotation = 0; // Up
                                                else if (targetRow > startRow) arrowRotation = 180; // Down
                                                else if (targetCol < startCol) arrowRotation = 270; // Left
                                                else if (targetCol > startCol) arrowRotation = 90; // Right
                                            }

                                            return (
                                                <motion.div
                                                    key={item?.id ?? `empty-${index}`}
                                                    layout
                                                    variants={itemVariants}
                                                    animate={isShaking ? "shake" : undefined}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    className={cn(
                                                        "w-14 h-14 flex items-center justify-center relative rounded-md ring-1 ring-inset transition-shadow",
                                                        // Matching (3+ adjacent) Glow - Strong Pink
                                                        (!glowingIndices.includes(index) && isMatching) ? "ring-pink-500" :
                                                            // Selected state
                                                            (selectedIndex === index && !glowingIndices.includes(index)) ? "ring-white" : "ring-transparent"
                                                    )}
                                                >
                                                    {isTarget && (
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                                                            style={{ transform: `rotate(${arrowRotation}deg)` }}
                                                        >
                                                            <svg
                                                                width="32"
                                                                height="32"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="#ffffff"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]"
                                                            >
                                                                <path d="M12 19V5" />
                                                                <path d="M5 12l7-7 7 7" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    {item ? (
                                                        <Icon
                                                            name={item.name}
                                                            scale={3}
                                                            tintColor={ICON_THEME[item.name]}
                                                            onClick={() => handleIconClick(item, index)}
                                                            className={cn(
                                                                "hover:brightness-110 transition-all active:scale-95",
                                                                // Active hooded distinct style
                                                                (activeHoodedIndex === index && item.name === 'hood') && "brightness-125"
                                                            )}
                                                        />
                                                    ) : (
                                                        glowingIndices.includes(index) ? (
                                                            <div
                                                                onClick={() => {
                                                                    // Handle click on empty glowing cell
                                                                    if (activeHoodedIndex !== null) handleIconClick({ id: 'empty', name: 'hood' } as any, index);
                                                                }}
                                                                className="w-14 h-14 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14" />
                                                        )
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Info Text */}
                                <div className="h-20 flex items-start justify-center text-center">
                                    {selectedIndex !== null && gridIcons[selectedIndex] ? (
                                        <div
                                            className="flex flex-col items-center justify-start gap-1"
                                        >
                                            <div className="text-sm font-medium tracking-widest text-zinc-400 uppercase">
                                                <span className="text-zinc-200">{gridIcons[selectedIndex]!.name.replace(/_/g, ' ')}</span>
                                                <span className="text-zinc-600 mx-2">-</span>
                                                <span className="text-zinc-500">{ICON_CATEGORIES[gridIcons[selectedIndex]!.name]}</span>
                                            </div>
                                            <div className="text-xs font-medium tracking-wider text-green-400/80 uppercase">
                                                {ICON_STATS[gridIcons[selectedIndex]!.name] || "???"}
                                            </div>
                                            <div className="text-xs font-medium tracking-wider uppercase text-zinc-500">
                                                Adds X to Y
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="text-xs text-zinc-600 uppercase tracking-widest mt-1"
                                        >
                                            Select an icon
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Section: Buttons - Aligned with Grid Rows */}
                            <div className="flex flex-col gap-3 mt-[1.875rem]"> {/* Gap matches grid gap-3 */}
                                <motion.button
                                    onClick={handleSpin}
                                    disabled={gold < 1 || isAnimating}
                                    whileTap={{ scale: 0.95 }}
                                    className={controlButtonClass}
                                    title="Spin"
                                >
                                    <i className="ra ra-cycle text-zinc-400" style={{ fontSize: 20 }} />
                                </motion.button>

                                <motion.button
                                    onClick={handleVary}
                                    disabled={gold < 1 || isAnimating}
                                    whileTap={{ scale: 0.95 }}
                                    className={controlButtonClass}
                                    title="Shuffle"
                                >
                                    <i className="ra ra-perspective-dice-random text-zinc-400" style={{ fontSize: 20 }} />
                                </motion.button>


                            </div>

                        </div>
                    </div>

                    {/* Donation Placeholder */}
                    <div className="absolute bottom-6 left-6 z-50 flex items-center gap-2 text-zinc-500 opacity-70">
                        <i className="ra ra-coffee-mug text-lg" />
                        <span className="text-[10px] uppercase tracking-widest font-medium">Buy me a coffee</span>
                    </div>

                    <div className="absolute bottom-6 right-6 z-50">
                        <Icon
                            name="scroll-unfurled"
                            scale={4}
                            tintColor="#a16207"
                            className="cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setIsScrollWindowOpen(true)}
                        />
                        <div className="absolute bottom-0 -left-1 text-white font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-10 leading-none">
                            {keptScrolls.length}
                        </div>
                    </div>

                    {/* Scroll Window Modal */}
                    <AnimatePresence>
                        {isScrollWindowOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsScrollWindowOpen(false)}
                                    className="fixed inset-0 bg-black/50 z-[60]"
                                />
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed bottom-0 left-0 right-0 h-[50dvh] bg-zinc-900 border-t border-zinc-700 rounded-t-3xl shadow-2xl z-[70] flex flex-col p-6"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-zinc-100 font-bold uppercase tracking-widest">Scroll Content</h2>
                                        <button
                                            onClick={() => setIsScrollWindowOpen(false)}
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <div className="flex-1 border border-zinc-800/50 bg-zinc-950/50 rounded p-4 text-zinc-600 text-sm font-mono space-y-2 overflow-y-auto">
                                        {keptScrolls.length > 0 ? (
                                            keptScrolls.map((_, i) => (
                                                <div key={i} className="text-zinc-400">
                                                    Scroll {i + 1} - Does X to Y twice
                                                </div>
                                            ))
                                        ) : (
                                            <div className="opacity-50">No scrolls collected</div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Character Modal */}
                    <AnimatePresence>
                        {isCharacterModalOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsCharacterModalOpen(false)}
                                    className="fixed inset-0 bg-black/50 z-[60]"
                                />
                                <motion.div
                                    initial={{ y: "-100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "-100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed top-0 left-0 right-0 h-[50dvh] bg-zinc-900 border-b border-zinc-700 rounded-b-3xl shadow-2xl z-[70] flex flex-col p-6"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-zinc-100 font-bold uppercase tracking-widest">Character</h2>
                                        <button
                                            onClick={() => setIsCharacterModalOpen(false)}
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <div className="flex-1 border border-zinc-800/50 bg-zinc-950/50 rounded p-4 text-zinc-600 text-sm font-mono flex items-center justify-center">
                                        <div className="opacity-50">Content Coming Soon</div>
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
