import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Shuffle, Sparkles } from 'lucide-react';

import { SPRITES } from './SPRITES';

type SpriteName = keyof typeof SPRITES;
// Helper for random selection
const SPRITE_KEYS = (Object.keys(SPRITES) as SpriteName[]).filter(key => !key.startsWith('Creature_'));

interface SpriteProps {
    name: SpriteName;
    className?: string;
    scale?: number;
    onClick?: () => void;
}

function Sprite({ name, className, scale = 4, onClick }: SpriteProps) {
    const sprite = SPRITES[name];
    if (!sprite) return null;
    const { x, y, w, h } = sprite;

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
                    width: '512px', // Total width of the sprite sheet
                    height: '256px', // Total height of the sprite sheet
                    imageRendering: 'pixelated', // Ensure crisp pixels
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

    const handleSpin = () => {
        setGridSprites(generateRandomSprites());
        setSpinKey(prev => prev + 1);
        setSelectedSprite(null);
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
    };

    const handleSpriteClick = (item: GridItem) => {
        if (selectedSprite === item.name) {
            // "Keep" the sprite - replace with null to maintain grid structure
            if (keptSprites.length >= 6) return;
            setGridSprites(prev => prev.map(s => s?.id === item.id ? null : s));
            setKeptSprites(prev => [...prev, item.name]);
            setSelectedSprite(null);
        } else {
            // Select the sprite
            setSelectedSprite(item.name);
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
                <div className="text-xs text-zinc-400">Sunday February 15th 2026</div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative h-full">
                {/* Top Half */}
                <section className="h-[40%] flex bg-zinc-900/50 relative">
                    {/* Left Section */}
                    <div className="w-[30%] border-r border-zinc-800 flex items-center justify-center">
                        {/* Placeholder */}
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 flex items-center justify-center gap-12 relative">
                        <Sprite name="Creature_Ghost_U" scale={4} />
                        <Sprite name="Creature_Bat_U" scale={4} />
                    </div>

                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                </section>

                {/* Divider */}
                <div className="h-1 bg-zinc-700 w-full shrink-0 z-10" />

                {/* Bottom Half */}
                <section className="h-[60%] flex flex-col items-center justify-start bg-zinc-950 relative py-8">

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
                    {/* Main Layout: Grid + Buttons Centered */}
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
                                            className="w-12 h-12 flex items-center justify-center" // Enforce cell size
                                        >
                                            {item ? (
                                                <Sprite
                                                    name={item.name}
                                                    scale={3}
                                                    onClick={() => handleSpriteClick(item)}
                                                    className={selectedSprite === item.name ? "brightness-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "hover:brightness-110 transition-all active:scale-95"}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 border border-zinc-900/50 rounded-sm" />
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
                            {/* Row 1: Spin */}
                            <motion.button
                                onClick={handleSpin}
                                whileTap={{ scale: 0.95 }}
                                className={controlButtonClass}
                                title="Spin"
                            >
                                <RotateCw size={20} className="text-blue-500" />
                            </motion.button>

                            {/* Row 2: Vary */}
                            <motion.button
                                onClick={handleVary}
                                whileTap={{ scale: 0.95 }}
                                className={controlButtonClass}
                                title="Shuffle"
                            >
                                <Shuffle size={20} className="text-green-500" />
                            </motion.button>

                            {/* Row 3: Fate */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className={controlButtonClass}
                                title="Fate"
                            >
                                <Sparkles size={20} className="text-yellow-500" />
                            </motion.button>
                        </div>

                    </div>

                    {/* Context Info Overlay - REMOVED (now integrated above) */}
                    <div className="hidden" />

                    <div className="absolute bottom-6 right-6">
                        <Sprite name="Human_Pirate_F" scale={4} />
                    </div>

                </section>
            </main>
        </div>
    );
}
