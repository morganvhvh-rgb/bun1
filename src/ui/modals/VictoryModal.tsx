import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VictoryModalProps {
    isOpen: boolean;
    onReset: () => void;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
}

const COLORS = ['#f59e0b', '#ec4899', '#8b5cf6', '#22d3ee', '#34d399', '#f97316', '#e8d4b8'];

function spawnParticle(width: number): Particle {
    return {
        x: Math.random() * width,
        y: -10 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 1.5 + Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
    };
}

function ConfettiCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const spawnedRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();

        const MAX_SPAWN = 180;
        const SPAWN_RATE = 4; // particles per frame for first burst

        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn confetti burst
            if (spawnedRef.current < MAX_SPAWN) {
                const toAdd = Math.min(SPAWN_RATE, MAX_SPAWN - spawnedRef.current);
                for (let i = 0; i < toAdd; i++) {
                    particlesRef.current.push(spawnParticle(canvas.width));
                }
                spawnedRef.current += toAdd;
            }

            particlesRef.current = particlesRef.current.filter(p => p.opacity > 0.01);

            for (const p of particlesRef.current) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.04; // gravity
                p.rotation += p.rotationSpeed;
                if (p.y > canvas.height * 0.75) {
                    p.opacity -= 0.015;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            particlesRef.current = [];
            spawnedRef.current = 0;
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}

export function VictoryModal({ isOpen, onReset }: VictoryModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="victory-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 pointer-events-auto"
                >
                    <ConfettiCanvas />

                    <div className="bg-black border border-zinc-900 flex flex-col p-5 w-full max-w-sm relative z-10">
                        <div className="flex flex-col items-center gap-4 py-6">
                            <span className="text-[11px] font-bold tracking-[0.35em] uppercase text-amber-400/70">
                                All Battles Cleared
                            </span>
                            <h2 className="text-4xl font-black tracking-widest uppercase text-[#e8d4b8]">
                                VICTORY
                            </h2>
                        </div>

                        <button
                            onClick={onReset}
                            className="mt-6 py-3 px-6 w-full font-bold uppercase tracking-widest text-sm border transition-colors bg-black text-[#e8d4b8] border-zinc-800 hover:bg-zinc-900"
                        >
                            Play Again
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
