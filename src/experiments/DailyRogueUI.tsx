import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Shuffle, Link } from 'lucide-react';

import { SPRITES } from './SPRITES';

type SpriteName = keyof typeof SPRITES;
// Helper for random selection
const SPRITE_KEYS: SpriteName[] = [
    "Feature_Tree_Full",
    "Feature_Tree_Pine",
    "Feature_Waves",
    "Human_Pirate_F",
    "Item_Bomb",
    "Item_Book",
    "Item_Bow",
    "Item_Bread",
    "Item_Cheese",
    "Item_Chest_Ready",
    "Item_Cloak",
    "Item_Dagger",
    "Item_Gem",
    "Item_Hammer",
    "Item_Lute",
    "Item_Ring",
    "Item_Scroll",
    "Item_Shield_B",
    "Item_Vial"
];

interface SpriteProps {
    name: SpriteName;
    className?: string;
    scale?: number;
    onClick?: () => void;
    tintColor?: string;
}

function Sprite({ name, className, scale = 4, onClick, tintColor }: SpriteProps) {
    const sprite = SPRITES[name];
    if (!sprite) return null;
    const { x, y, w, h } = sprite;
    const sheetWidth = 512;
    const sheetHeight = 256;
    const tintFilterByColor: Record<string, string> = {
        '#f97316': 'invert(56%) sepia(88%) saturate(2565%) hue-rotate(353deg) brightness(101%) contrast(95%)',
        '#22c55e': 'invert(62%) sepia(63%) saturate(676%) hue-rotate(88deg) brightness(92%) contrast(90%)',
    };
    const tintFilter = tintColor ? tintFilterByColor[tintColor.toLowerCase()] : undefined;

    return (
        <div
            onClick={onClick}
            className={cn("inline-block overflow-hidden relative select-none", onClick && "cursor-pointer active:scale-95 transition-transform", className)}
            style={{
                width: w * scale,
                height: h * scale,
            }}
        >
            <div
                className="absolute top-0 left-0"
                style={{
                    backgroundImage: 'url(/Scroll.png)',
                    backgroundPosition: `-${x}px -${y}px`,
                    width: `${sheetWidth}px`,
                    height: `${sheetHeight}px`,
                    imageRendering: 'pixelated',
                    filter: tintFilter,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            />
        </div>
    );
}

interface GridItem {
    id: string;
    name: SpriteName;
}

export default function DailyRogueUI() {
    const [gridSprites, setGridSprites] = useState<(GridItem | null)[]>([]);
    const [spinKey, setSpinKey] = useState(0);
    const [selectedSprite, setSelectedSprite] = useState<SpriteName | null>(null);
    const [keptSprites, setKeptSprites] = useState<SpriteName[]>([]);

    // Pirate Logic State
    const [glowingIndices, setGlowingIndices] = useState<number[]>([]);
    const [activePirateIndex, setActivePirateIndex] = useState<number | null>(null);
    const [isScrollWindowOpen, setIsScrollWindowOpen] = useState(false);

    function generateRandomSprites(): GridItem[] {
        return Array.from({ length: 12 }, () => {
            const randomIndex = Math.floor(Math.random() * SPRITE_KEYS.length);
            return {
                id: crypto.randomUUID(),
                name: SPRITE_KEYS[randomIndex]
            };
        });
    }

    useEffect(() => {
        setGridSprites(generateRandomSprites());
    }, []);

    const resetSelection = () => {
        setSelectedSprite(null);
        setGlowingIndices([]);
        setActivePirateIndex(null);
    };

    const handleSpin = () => {
        setGridSprites(generateRandomSprites());
        setSpinKey(prev => prev + 1);
        resetSelection();
    };

    const handleVary = () => {
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
    };


    const getCoordinates = (index: number) => ({ row: Math.floor(index / 4), col: index % 4 });
    const getIndex = (row: number, col: number) => row * 4 + col;

    const handleSpriteClick = (item: GridItem, index: number) => {
        // If clicking a glowing target (Movement)
        if (glowingIndices.includes(index) && activePirateIndex !== null) {
            const pirate = gridSprites[activePirateIndex];
            // Verify we are moving a pirate
            if (pirate && pirate.name === "Human_Pirate_F") {
                setGridSprites(prev => {
                    const next = [...prev];
                    const pCoords = getCoordinates(activePirateIndex);
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

                    // Place Pirate at target (reusing ID to potentially keep identity, or new ID)
                    next[index] = { ...pirate };
                    return next;
                });

                resetSelection();
                return;
            }
        }

        // Handle Pirate Selection
        if (item.name === "Human_Pirate_F") {
            const { row, col } = getCoordinates(index);
            const targets: number[] = [];

            // Furthest in Row logic
            const rowIndices = [0, 1, 2, 3].map(c => getIndex(row, c)).filter(i => i !== index);
            rowIndices.sort((a, b) => Math.abs(a - index) - Math.abs(b - index));
            if (rowIndices.length > 0) targets.push(rowIndices[rowIndices.length - 1]);

            // Furthest in Col logic
            const colIndices = [0, 1, 2].map(r => getIndex(r, col)).filter(i => i !== index);
            colIndices.sort((a, b) => {
                const dA = Math.abs(Math.floor(a / 4) - row);
                const dB = Math.abs(Math.floor(b / 4) - row);
                return dA - dB;
            });
            if (colIndices.length > 0) targets.push(colIndices[colIndices.length - 1]);

            setGlowingIndices(targets);
            setActivePirateIndex(index);
            setSelectedSprite(item.name);
            return;
        }

        // Default behavior (Select/Keep) for non-Pirates
        if (selectedSprite === item.name) {
            if (activePirateIndex !== null) {
                // If we had a pirate selected and clicked another same-named item (unlikely since Pirate is unique usually, but possible)
                // Or if we clicked a non-glowing cell while pirate is active -> Reset
                resetSelection();
                // Optionally process the click as a new selection? 
                // For now, let's just reset to be safe or treat as standard toggle
            }

            if (keptSprites.length >= 6) return;
            setGridSprites(prev => prev.map(s => s?.id === item.id ? null : s));
            setKeptSprites(prev => [...prev, item.name]);
            resetSelection();
        } else {
            setSelectedSprite(item.name);
            setGlowingIndices([]);
            setActivePirateIndex(null);
        }
    };

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
        "bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md grid place-items-center focus:outline-none transition-colors w-12 h-12";

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
                        <Sprite name="Human_Pirate_F" scale={4} />
                        <div className="flex flex-col w-full px-1.5 sm:px-2 text-[10px] sm:text-[11px] tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium">
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>HP</span> <span className="text-zinc-300">50</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Magic</span> <span className="text-zinc-300">7</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50 whitespace-nowrap"><span>Base Atk</span> <span className="text-zinc-300">3</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Gear</span> <span className="text-zinc-300">4</span></div>
                            <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Trust</span> <span className="text-zinc-300">11</span></div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 flex items-start justify-center gap-3 sm:gap-6 md:gap-12 relative pt-4 px-2 sm:px-3 md:px-0">
                        <div className="flex flex-col items-center gap-2">
                            <Sprite name="Creature_Ifrit_U" scale={4} tintColor="#f97316" />
                            <div className="flex flex-col w-20 sm:w-24 px-1 text-[10px] sm:text-[11px] tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium">
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Lvl</span> <span className="text-zinc-300">1</span></div>
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>HP</span> <span className="text-zinc-300">10</span></div>
                                <div className="flex justify-between items-center h-8 border-b border-zinc-800/50"><span>Atk</span> <span className="text-zinc-300">5</span></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Sprite name="Creature_Snake_U" scale={4} tintColor="#22c55e" />
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
                                className="w-full max-w-xs h-12 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md focus:outline-none transition-colors text-zinc-300 text-sm tracking-[0.35em] font-semibold uppercase"
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
                                        {gridSprites.map((item, index) => (
                                            <motion.div
                                                key={item?.id ?? `empty-${index}`}
                                                layout
                                                variants={itemVariants}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                className={cn(
                                                    "w-12 h-12 flex items-center justify-center relative",
                                                    // Removed ring-2 ring-yellow-500, added strong glow
                                                    glowingIndices.includes(index) && "drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] brightness-125 z-10"
                                                )}
                                            >
                                                {item ? (
                                                    <Sprite
                                                        name={item.name}
                                                        scale={3}
                                                        onClick={() => handleSpriteClick(item, index)}
                                                        className={cn(
                                                            selectedSprite === item.name && !glowingIndices.includes(index) ? "brightness-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "hover:brightness-110 transition-all active:scale-95",
                                                            // Ensure target has strong glow if it's a valid move target
                                                            (glowingIndices.includes(index)) && "drop-shadow-[0_0_12px_rgba(255,215,0,1)] brightness-150",
                                                            // Active pirate distinct style
                                                            (activePirateIndex === index && item.name === 'Human_Pirate_F') && "brightness-125"
                                                        )}
                                                    />
                                                ) : (
                                                    glowingIndices.includes(index) ? (
                                                        <div
                                                            onClick={() => {
                                                                // Handle click on empty glowing cell
                                                                if (activePirateIndex !== null) handleSpriteClick({ id: 'empty', name: 'Human_Pirate_F' } as any, index);
                                                            }}
                                                            className="w-12 h-12 border border-yellow-500/50 rounded-sm bg-yellow-900/10 cursor-pointer"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 border border-zinc-900/50 rounded-sm" />
                                                    )
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Info Text */}
                                <div className="h-20 flex items-start justify-center text-center">
                                    <AnimatePresence mode="wait">
                                        {selectedSprite ? (
                                            <motion.div
                                                key="name"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="flex flex-col items-center justify-start gap-1"
                                            >
                                                <div className="text-sm font-medium tracking-widest text-zinc-400 uppercase">
                                                    {selectedSprite.replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-xs font-medium tracking-wider text-green-400/80 uppercase">
                                                    +3 Stat
                                                </div>
                                                <div className="text-xs font-medium tracking-wider uppercase text-zinc-500">
                                                    Adds X to Y
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs text-zinc-600 uppercase tracking-widest mt-1"
                                            >
                                                Select a sprite
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Right Section: Buttons - Aligned with Grid Rows */}
                            <div className="flex flex-col gap-3"> {/* Gap matches grid gap-3 */}
                                <motion.button
                                    onClick={handleSpin}
                                    whileTap={{ scale: 0.95 }}
                                    className={controlButtonClass}
                                    title="Spin"
                                >
                                    <RotateCw size={20} className="text-zinc-400" />
                                </motion.button>

                                <motion.button
                                    onClick={handleVary}
                                    whileTap={{ scale: 0.95 }}
                                    className={controlButtonClass}
                                    title="Shuffle"
                                >
                                    <Shuffle size={20} className="text-zinc-400" />
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className={controlButtonClass}
                                    title="Fate"
                                >
                                    <Link size={20} className="text-zinc-400" />
                                </motion.button>
                            </div>

                        </div>
                    </div>

                    <div className="hidden" />

                    <div className="absolute bottom-6 right-6 z-50">
                        <Sprite
                            name="Item_Scroll"
                            scale={4}
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
                                    className="absolute inset-0 bg-black/50 z-[60]"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="absolute inset-x-8 inset-y-24 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-[70] flex flex-col p-6"
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
                                    <div className="flex-1 border border-zinc-800/50 bg-zinc-950/50 rounded p-4 text-zinc-600 text-sm font-mono">
                                        {/* Blank for now */}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                </section>
            </main>
        </div>
    );
}
