import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { SPRITES } from './SPRITES';

type SpriteName = keyof typeof SPRITES;
// Helper for random selection
const SPRITE_KEYS = Object.keys(SPRITES) as SpriteName[];

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

    return (
        <div className="w-full h-[100dvh] flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            {/* Top Bar - adjusted for single row and padding */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-700 bg-zinc-900 shrink-0 whitespace-nowrap">
                <h1 className="text-base font-bold tracking-wider text-zinc-100 uppercase">Daily Rogue</h1>
                <div className="text-xs text-zinc-400">Sunday February 15th 2026</div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative h-full">
                {/* Top Half - Split into Left (30%) and Right */}
                <section className="h-[40%] flex bg-zinc-900/50 relative">
                    {/* Left Section */}
                    <div className="w-[30%] border-r border-zinc-800 flex items-center justify-center">
                        {/* Placeholder or future content */}
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 flex items-center justify-center gap-12 relative">
                        <Sprite name="Creature_Ghost_U" scale={4} />
                        <Sprite name="Creature_Bat_U" scale={4} />
                    </div>

                    {/* Subtle grid pattern for texture */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                </section>

                {/* Divider */}
                <div className="h-1 bg-zinc-700 w-full shrink-0 z-10" />

                {/* Bottom Half - Larger (60%) */}
                <section className="h-[60%] flex flex-col items-center justify-start bg-zinc-950 px-6 py-8 relative gap-4">

                    {/* Kept Sprites Row - Centered between top line and grid */}
                    <div className="w-full flex justify-center items-center shrink-0 mb-2">
                        {/* Use fixed width container to prevent layout shifts */}
                        <div className="flex gap-2 w-[328px] justify-start h-12 items-center">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="shrink-0 w-12 h-12 flex items-center justify-center">
                                    {keptSprites[i] && (
                                        <Sprite name={keptSprites[i]} scale={3} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Centered Wrapper for Grid and Buttons - Ensures same height */}
                    <div className="relative grid grid-cols-[max-content_max-content] gap-x-4 gap-y-2 h-min z-10">
                        {/* Grid Section */}
                        <motion.div
                            key={spinKey}
                            className="grid grid-cols-4 grid-rows-3 gap-2 place-items-center"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            <AnimatePresence mode='popLayout'>
                                {gridSprites.map((item, index) => (
                                    <motion.div
                                        key={item?.id ?? `empty-${index}`} // Use stable ID for reordering animation
                                        layout
                                        variants={itemVariants}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    >
                                        {item ? (
                                            <Sprite
                                                name={item.name}
                                                scale={3}
                                                onClick={() => handleSpriteClick(item)}
                                                className={selectedSprite === item.name ? "brightness-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "hover:brightness-110 transition-all active:scale-95"}
                                            />
                                        ) : (
                                            <div style={{ width: 48, height: 48 }} />
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Controls Section - Right Side */}
                        <div className="flex flex-col gap-2 w-24 h-full col-start-2 row-start-1">
                            <button
                                onClick={handleSpin}
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg flex flex-col items-center justify-center transition-all active:bg-zinc-700 active:scale-95 shadow-lg group"
                            >
                                <span className="text-4xl mb-1 text-indigo-400">↻</span>
                                <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Spin</span>
                            </button>
                            <button
                                onClick={handleVary}
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg flex flex-col items-center justify-center transition-all active:bg-zinc-700 active:scale-95 shadow-lg group"
                            >
                                <span className="text-4xl mb-1 text-emerald-400">⤮</span>
                                <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Vary</span>
                            </button>
                        </div>

                        {/* Name Display - Directly under Grid */}
                        <div className="w-full text-center h-6 flex items-center justify-center pointer-events-none col-start-1 row-start-2">
                            <AnimatePresence mode="wait">
                                {selectedSprite && (
                                    <motion.div
                                        key="name"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="text-sm font-medium tracking-widest text-zinc-400 uppercase"
                                    >
                                        {selectedSprite.replace(/_/g, ' ')}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </section>
            </main>
        </div>
    );
}
