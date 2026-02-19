import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sprite } from './Sprite';
import { SPRITE_KEYS, SPRITE_THEME, SPRITE_STATS, SPRITE_CATEGORIES, type GridItem, type IconName } from './data';

export default function DailyRogueUI() {
    const [gridSprites, setGridSprites] = useState<(GridItem | null)[]>(() => generateRandomSprites());
    const [spinKey, setSpinKey] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [keptSprites, setKeptSprites] = useState<IconName[]>([]);
    const [keptScrolls, setKeptScrolls] = useState<IconName[]>([]);
    const [gold, setGold] = useState(100);

    // Hooded Logic State
    const [glowingIndices, setGlowingIndices] = useState<number[]>([]);
    const [activeHoodedIndex, setActiveHoodedIndex] = useState<number | null>(null);
    const [hasMoved, setHasMoved] = useState(false);
    const [isScrollWindowOpen, setIsScrollWindowOpen] = useState(false);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

    function generateRandomSprites(): GridItem[] {
        const totalSlots = 12;
        const characterIndex = Math.floor(Math.random() * totalSlots);

        return Array.from({ length: totalSlots }, (_, index) => {
            if (index === characterIndex) {
                return {
                    id: crypto.randomUUID(),
                    name: "Hooded"
                };
            }

            const randomIndex = Math.floor(Math.random() * SPRITE_KEYS.length);
            const name = SPRITE_KEYS[randomIndex];

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
        setGridSprites(generateRandomSprites());
        setSpinKey(prev => prev + 1);
        resetSelection();
        setHasMoved(false);
    };

    const handleVary = () => {
        if (gold < 1) return;
        setGold(g => g - 1);
        setGridSprites(prev => {
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
    };


    const getCoordinates = (index: number) => ({ row: Math.floor(index / 4), col: index % 4 });
    const getIndex = (row: number, col: number) => row * 4 + col;

    const handleSpriteClick = (item: GridItem, index: number) => {
        // If clicking a glowing target (Movement)
        if (glowingIndices.includes(index) && activeHoodedIndex !== null) {
            const character = gridSprites[activeHoodedIndex];
            // Verify we are moving a hooded figure
            if (character && character.name === "Hooded") {
                setGridSprites(prev => {
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
                return;
            }
        }

        // Handle Hooded Figure Selection
        if (item.name === "Hooded") {
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
                setGridSprites(prev => prev.map(s => s?.id === item.id ? null : s));
                setKeptScrolls(prev => [...prev, item.name]);
                resetSelection();
                return;
            }

            if (keptSprites.length >= 6) return;
            setGridSprites(prev => prev.map(s => s?.id === item.id ? null : s));
            setKeptSprites(prev => [...prev, item.name]);
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

        for (let i = 0; i < gridSprites.length; i++) {
            if (visited.has(i) || !gridSprites[i]) continue;

            const name = gridSprites[i]!.name;
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
                        if (!visited.has(nIdx) && gridSprites[nIdx]?.name === name) {
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
        hidden: { opacity: 0, scale: 0.5 },
        show: { opacity: 1, scale: 1 }
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
                        <Sprite
                            name="Hooded"
                            scale={4}
                            tintColor="#a855f7"
                            className="cursor-pointer hover:brightness-110 transition-all active:scale-95"
                            onClick={() => setIsCharacterModalOpen(true)}
                        />
                        <div className="flex flex-col w-full px-1.5 sm:px-2 text-[10px] sm:text-[11px] tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium">
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>HP</span> <span className="text-zinc-300">50</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Magic</span> <span className="text-zinc-300">7</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50 whitespace-nowrap"><span>Base Atk</span> <span className="text-zinc-300">3</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Gear</span> <span className="text-zinc-300">4</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Gold</span> <span className="text-zinc-300">{gold}</span></div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 flex items-start justify-center gap-3 sm:gap-6 md:gap-12 relative pt-4 px-2 sm:px-3 md:px-0">
                        <div className="flex flex-col items-center gap-2">
                            <Sprite name="Goblin" scale={4} tintColor="#4ade80" />
                            <div className="flex flex-col w-20 sm:w-24 px-1 text-[10px] sm:text-[11px] tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium">
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Lvl</span> <span className="text-zinc-300">1</span></div>
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>HP</span> <span className="text-zinc-300">10</span></div>
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Atk</span> <span className="text-zinc-300">5</span></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Sprite name="Skeleton" scale={4} tintColor="#e4e4e7" />
                            <div className="flex flex-col w-20 sm:w-24 px-1 text-[10px] sm:text-[11px] tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium">
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Lvl</span> <span className="text-zinc-300">1</span></div>
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>HP</span> <span className="text-zinc-300">10</span></div>
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Atk</span> <span className="text-zinc-300">5</span></div>
                            </div>
                        </div>

                        {/* New Action Buttons */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="w-full max-w-xs h-12 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md focus:outline-none transition-colors text-zinc-300 text-sm tracking-[0.35em] font-semibold uppercase flex items-center justify-center text-center leading-none whitespace-nowrap"
                                title="Attack"
                            >
                                ENGAGE
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

                        {/* Kept Sprites Row */}
                        <div className="w-full flex justify-center items-center shrink-0 mb-6">
                            <div className="flex gap-2 min-h-[3.5rem] items-center">
                                {keptSprites.length > 0 ? keptSprites.map((name, i) => (
                                    <div key={i} className="shrink-0 w-12 h-12 flex items-center justify-center">
                                        <Sprite name={name} scale={3} />
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
                                        {gridSprites.map((item, index) => {
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
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    className={cn(
                                                        "w-12 h-12 flex items-center justify-center relative",
                                                        // Matching (3+ adjacent) Glow - Strong Pink
                                                        (!glowingIndices.includes(index) && isMatching) && "drop-shadow-[0_0_15px_rgba(255,20,147,1)] brightness-125"
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
                                                        <Sprite
                                                            name={item.name}
                                                            scale={3}
                                                            tintColor={SPRITE_THEME[item.name]}
                                                            onClick={() => handleSpriteClick(item, index)}
                                                            className={cn(
                                                                selectedIndex === index && !glowingIndices.includes(index) ? "brightness-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "hover:brightness-110 transition-all active:scale-95",
                                                                // Active hooded distinct style
                                                                (activeHoodedIndex === index && item.name === 'Hooded') && "brightness-125"
                                                            )}
                                                        />
                                                    ) : (
                                                        glowingIndices.includes(index) ? (
                                                            <div
                                                                onClick={() => {
                                                                    // Handle click on empty glowing cell
                                                                    if (activeHoodedIndex !== null) handleSpriteClick({ id: 'empty', name: 'Hooded' } as any, index);
                                                                }}
                                                                className="w-12 h-12 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12" />
                                                        )
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Info Text */}
                                <div className="h-20 flex items-start justify-center text-center">
                                    {selectedIndex !== null && gridSprites[selectedIndex] ? (
                                        <div
                                            className="flex flex-col items-center justify-start gap-1"
                                        >
                                            <div className="text-sm font-medium tracking-widest text-zinc-400 uppercase">
                                                <span className="text-zinc-200">{gridSprites[selectedIndex]!.name.replace(/_/g, ' ')}</span>
                                                <span className="text-zinc-600 mx-2">-</span>
                                                <span className="text-zinc-500">{SPRITE_CATEGORIES[gridSprites[selectedIndex]!.name]}</span>
                                            </div>
                                            <div className="text-xs font-medium tracking-wider text-green-400/80 uppercase">
                                                {SPRITE_STATS[gridSprites[selectedIndex]!.name] || "???"}
                                            </div>
                                            <div className="text-xs font-medium tracking-wider uppercase text-zinc-500">
                                                Adds X to Y
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="text-xs text-zinc-600 uppercase tracking-widest mt-1"
                                        >
                                            Select a sprite
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Section: Buttons - Aligned with Grid Rows */}
                            <div className="flex flex-col gap-3 mt-[1.875rem]"> {/* Gap matches grid gap-3 */}
                                <motion.button
                                    onClick={handleSpin}
                                    disabled={gold < 1}
                                    whileTap={{ scale: 0.95 }}
                                    className={controlButtonClass}
                                    title="Spin"
                                >
                                    <i className="ra ra-cycle text-zinc-400" style={{ fontSize: 20 }} />
                                </motion.button>

                                <motion.button
                                    onClick={handleVary}
                                    disabled={gold < 1}
                                    whileTap={{ scale: 0.95 }}
                                    className={controlButtonClass}
                                    title="Shuffle"
                                >
                                    <i className="ra ra-perspective-dice-random text-zinc-400" style={{ fontSize: 20 }} />
                                </motion.button>


                            </div>

                        </div>
                    </div>

                    <div className="hidden" />

                    <div className="absolute bottom-6 right-6 z-50">
                        <Sprite
                            name="scroll-unfurled"
                            scale={4}
                            tintColor="#a16207"
                            className="cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setIsScrollWindowOpen(true)}
                        />
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
