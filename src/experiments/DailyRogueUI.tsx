
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Extended Sprite definitions from Scroll.atlas
const SPRITES = {
    Ghost: { x: 419, y: 230, w: 16, h: 16 },
    Bat: { x: 92, y: 20, w: 16, h: 16 },
    Skeleton: { x: 182, y: 74, w: 16, h: 16 },
    Spider: { x: 419, y: 122, w: 16, h: 16 },
    Rat: { x: 401, y: 194, w: 16, h: 16 },
    Goblin: { x: 416, y: 86, w: 16, h: 16 },
    Cyclops: { x: 2, y: 74, w: 16, h: 16 },
    Dragon: { x: 128, y: 74, w: 16, h: 16 },
    Lion: { x: 200, y: 38, w: 16, h: 16 },
    Orc: { x: 365, y: 158, w: 16, h: 16 },
    Snake: { x: 20, y: 20, w: 16, h: 16 },
    Wolf: { x: 254, y: 14, w: 16, h: 16 },
    Knight: { x: 2, y: 38, w: 16, h: 16 },
    Archer: { x: 272, y: 50, w: 16, h: 16 },
    Lunatic: { x: 272, y: 14, w: 16, h: 16 },
    Necromancer: { x: 146, y: 20, w: 16, h: 16 },
} as const;

type SpriteName = keyof typeof SPRITES;
// Helper for random selection
const SPRITE_KEYS = Object.keys(SPRITES) as SpriteName[];

interface SpriteProps {
    name: SpriteName;
    className?: string;
    scale?: number;
}

function Sprite({ name, className, scale = 4 }: SpriteProps) {
    const { x, y, w, h } = SPRITES[name];

    return (
        <div
            className={cn("inline-block overflow-hidden relative", className)}
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

export default function DailyRogueUI() {
    const [gridSprites, setGridSprites] = useState<SpriteName[]>([]);

    useEffect(() => {
        // Generate 12 random sprites for the 4x3 grid
        // We use a simple loop. In a real game, this might come from seed.
        const randomSprites = Array.from({ length: 12 }, () => {
            const randomIndex = Math.floor(Math.random() * SPRITE_KEYS.length);
            return SPRITE_KEYS[randomIndex];
        });
        setGridSprites(randomSprites);
    }, []);

    return (
        <div className="w-full h-[100dvh] flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            {/* Top Bar - adjusted for single row and padding */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-700 bg-zinc-900 shrink-0 whitespace-nowrap">
                <h1 className="text-base font-bold tracking-wider text-zinc-100 uppercase">Daily Rogue</h1>
                <div className="text-xs text-zinc-400">Sunday February 15th 2026</div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative h-full">
                {/* Top Half - Smaller (40%) */}
                <section className="h-[40%] flex items-center justify-center gap-12 bg-zinc-900/50 relative">
                    <Sprite name="Ghost" scale={4} />
                    <Sprite name="Bat" scale={4} />

                    {/* Subtle grid pattern for texture */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                </section>

                {/* Divider - Visual only, the sizing is handled by flex/height on sections */}
                <div className="h-1 bg-zinc-700 w-full shrink-0 z-10" />

                {/* Bottom Half - Larger (60%) */}
                <section className="h-[60%] flex items-center justify-center bg-zinc-950 p-4">
                    <div className="grid grid-cols-4 grid-rows-3 gap-2 place-items-center">
                        {gridSprites.map((spriteName, index) => (
                            <div key={index} className="flex items-center justify-center bg-zinc-900/40 rounded-lg p-1 border border-zinc-800/50 w-16 h-16">
                                <Sprite name={spriteName} scale={3} />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
