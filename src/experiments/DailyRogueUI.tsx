
import { cn } from '@/lib/utils';

// Sprite definitions from Scroll.atlas
const SPRITES = {
    Ghost: { x: 419, y: 230, w: 16, h: 16 },
    Bat: { x: 92, y: 20, w: 16, h: 16 },
} as const;

type SpriteName = keyof typeof SPRITES;

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
    return (
        <div className="w-full h-[100dvh] flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
            {/* Top Bar */}
            <header className="h-12 flex items-center justify-between px-4 border-b border-zinc-700 bg-zinc-900 shrink-0">
                <h1 className="text-lg font-bold tracking-wider text-zinc-100">Daily Rogue</h1>
                <div className="text-sm text-zinc-400">Sunday February 15th 2026</div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative">
                {/* Top Half */}
                <section className="flex-1 flex items-center justify-center gap-12 bg-zinc-900/50 relative">
                    <Sprite name="Ghost" scale={4} />
                    <Sprite name="Bat" scale={4} />

                    {/* Subtle grid pattern for texture */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                </section>

                {/* Divider */}
                <div className="h-2 bg-zinc-800 border-y border-zinc-700 w-full shrink-0" />

                {/* Bottom Half */}
                <section className="flex-1 bg-black flex items-center justify-center text-zinc-700">
                    {/* Empty for now, maybe a placeholder text or completely empty as requested */}
                    <span className="opacity-20 text-xs uppercase tracking-widest">Input Area</span>
                </section>
            </main>
        </div>
    );
}
