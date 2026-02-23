import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import type { IconName } from '@/types/game';
import { ICON_THEME } from '@/lib/constants';

interface ConjureMagicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResult: (winner: 'two-hearts' | 'sapphire' | 'lightning-trio') => void;
}

const CONJURE_ICONS: { name: IconName; ring: number; angle: number }[] = [
    { name: 'two-hearts', ring: 0, angle: 0 },    // inner ring
    { name: 'sapphire', ring: 1, angle: 0 },       // middle ring
    { name: 'lightning-trio', ring: 2, angle: 0 },  // outer ring
];

const RING_RADII = [50, 85, 120]; // px from center for each ring
const SPIN_DURATION = 5000; // ms before winner is chosen
const RING_TILT_START = 0; // starting tilt degrees (perfectly flat)
const RING_TILT_END = 180; // ending tilt degrees (full 180° flip)
const SPARKLE_COUNT = 18; // number of random sparkle particles
const CONJURE_PINK = '#ec4899'; // uniform icon color during conjure spin

const EFFECT_LABELS: Record<string, string> = {
    'two-hearts': 'Magic heals HP',
    'sapphire': 'Magic converts to Gold',
    'lightning-trio': 'Magic damages enemies',
};

/** Generate stable sparkle positions for one session */
function generateSparkles(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,     // % position
        top: Math.random() * 100,      // % position
        size: 1 + Math.random() * 2,   // 1–3px
        delay: Math.random() * 3,      // 0–3s stagger
        duration: 0.6 + Math.random() * 1.2, // 0.6–1.8s cycle
    }));
}

export function ConjureMagicModal({ isOpen, onClose, onResult }: ConjureMagicModalProps) {
    const [phase, setPhase] = useState<'spinning' | 'revealing'>('spinning');
    const [winnerIndex, setWinnerIndex] = useState<number>(0);
    // Track a unique key so re-opening restarts the animation
    const [sessionKey, setSessionKey] = useState(0);

    // Regenerate sparkle positions each session so they feel random
    const sparkles = useMemo(() => generateSparkles(SPARKLE_COUNT), [sessionKey]);

    const startSession = useCallback(() => {
        setPhase('spinning');
        setWinnerIndex(Math.floor(Math.random() * CONJURE_ICONS.length));
        setSessionKey(prev => prev + 1);
    }, []);

    // Start spinning when opened
    useEffect(() => {
        if (isOpen) {
            startSession();
        }
    }, [isOpen, startSession]);

    useEffect(() => {
        if (!isOpen || phase !== 'spinning') return;
        const timer = setTimeout(() => {
            setPhase('revealing');
            const winner = CONJURE_ICONS[winnerIndex];
            onResult(winner.name as 'two-hearts' | 'sapphire' | 'lightning-trio');
        }, SPIN_DURATION);
        return () => clearTimeout(timer);
    }, [isOpen, phase, sessionKey, winnerIndex, onResult]);

    if (!isOpen) return null;

    const winner = CONJURE_ICONS[winnerIndex];

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={phase === 'revealing' ? onClose : undefined}
                className="fixed inset-0 bg-black/70 z-[60]"
            />
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none"
            >
                <div className="bg-zinc-900 border border-pink-800/50 rounded-2xl shadow-[0_0_60px_rgba(236,72,153,0.15)] flex flex-col p-6 w-full max-w-sm pointer-events-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-pink-400 font-bold uppercase tracking-widest leading-none text-sm">Conjure Magic</h2>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest"
                        >
                            Close
                        </button>
                    </div>
                    <div className="border border-zinc-800/50 bg-zinc-950/50 rounded flex items-center justify-center relative overflow-hidden" style={{ height: 300 }}>
                        {/* Tilted 3D perspective wrapper — rings appear closer at bottom, farther at top */}
                        <div
                            style={{
                                perspective: 500,
                                perspectiveOrigin: '50% 40%',
                            }}
                        >
                            {/* Radial rings visualization — tilt ramps up over spin duration */}
                            <div
                                className="relative"
                                style={{
                                    width: 260,
                                    height: 260,
                                    transformStyle: 'preserve-3d',
                                    animation: phase === 'spinning'
                                        ? `conjure-tilt-ramp ${SPIN_DURATION}ms ease-in forwards`
                                        : undefined,
                                    transform: phase === 'revealing'
                                        ? `rotateX(${RING_TILT_END}deg)`
                                        : undefined,
                                }}
                                key={sessionKey}
                            >

                                {/* Ring circles (visual guides) */}
                                {RING_RADII.map((r, i) => (
                                    <div
                                        key={`ring-${i}`}
                                        className="absolute rounded-full border border-pink-900/20"
                                        style={{
                                            width: r * 2,
                                            height: r * 2,
                                            left: '50%',
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            opacity: phase === 'revealing' ? 0 : 1,
                                            transition: 'opacity 0.6s ease-out',
                                        }}
                                    />
                                ))}

                                {/* Center fairy-wand */}
                                <motion.div
                                    className="absolute"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    animate={phase === 'revealing' ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Icon name="fairy-wand" scale={2} tintColor="#ec4899" />
                                </motion.div>

                                {/* Orbiting icons */}
                                {CONJURE_ICONS.map((icon, i) => {
                                    const isWinner = i === winnerIndex;
                                    const radius = RING_RADII[icon.ring];

                                    // Each icon spins at a different speed
                                    const spinDurations = [2.5, 3.5, 4.5];
                                    const spinDuration = spinDurations[icon.ring];

                                    if (phase === 'revealing') {
                                        if (isWinner) {
                                            return (
                                                <motion.div
                                                    key={`icon-${i}`}
                                                    className="absolute z-20"
                                                    style={{
                                                        left: '50%',
                                                        top: '50%',
                                                    }}
                                                    initial={false}
                                                    animate={{
                                                        x: '-50%',
                                                        y: '-50%',
                                                        scale: 2.5,
                                                    }}
                                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                                >
                                                    <Icon name={icon.name} scale={2} tintColor={ICON_THEME[icon.name]} />
                                                </motion.div>
                                            );
                                        } else {
                                            return (
                                                <motion.div
                                                    key={`icon-${i}`}
                                                    className="absolute"
                                                    style={{
                                                        left: '50%',
                                                        top: '50%',
                                                    }}
                                                    animate={{ opacity: 0, scale: 0.3 }}
                                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                                >
                                                    <Icon name={icon.name} scale={2} tintColor={ICON_THEME[icon.name]} />
                                                </motion.div>
                                            );
                                        }
                                    }

                                    // Spinning phase: each icon orbits on its ring with CSS animation
                                    return (
                                        <div
                                            key={`icon-${i}`}
                                            className="absolute"
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                width: 0,
                                                height: 0,
                                                animation: `conjure-spin-${i % 2 === 0 ? 'cw' : 'ccw'} ${spinDuration}s linear infinite`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    transform: `translateX(${radius}px) translateX(-50%) translateY(-50%)`,
                                                }}
                                            >
                                                <Icon name={icon.name} scale={2} tintColor={CONJURE_PINK} />
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* White pixel sparkles — randomized twinkle particles */}
                                {phase === 'spinning' && sparkles.map(s => (
                                    <div
                                        key={`sparkle-${s.id}`}
                                        className="absolute rounded-full bg-white pointer-events-none"
                                        style={{
                                            width: s.size,
                                            height: s.size,
                                            left: `${s.left}%`,
                                            top: `${s.top}%`,
                                            opacity: 0,
                                            animation: `sparkle-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Winner label */}
                    <AnimatePresence>
                        {phase === 'revealing' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="mt-4 text-center flex flex-col gap-1"
                            >
                                <span className="text-zinc-300 text-xs uppercase tracking-[0.2em] font-bold">
                                    {winner.name.replace(/-/g, ' ')}
                                </span>
                                <span className="text-zinc-500 text-[10px] uppercase tracking-widest">
                                    {EFFECT_LABELS[winner.name]}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Keyframe animations for orbiting, tilt ramp, + sparkles */}
            <style>{`
                @keyframes conjure-spin-cw {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes conjure-spin-ccw {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes conjure-tilt-ramp {
                    from { transform: rotateX(${RING_TILT_START}deg); }
                    to   { transform: rotateX(${RING_TILT_END}deg); }
                }
                @keyframes sparkle-twinkle {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.9; }
                }
            `}</style>
        </>
    );
}
