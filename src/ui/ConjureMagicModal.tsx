import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './Icon';
import type { IconName } from '@/types/game';

interface ConjureMagicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResult: (winner: 'two-hearts' | 'sapphire' | 'lightning-trio') => void;
}

const CONJURE_ICONS: IconName[] = ['two-hearts', 'sapphire', 'lightning-trio'];

const REVEAL_DELAY = 2500;   // ms before symbols start fading
const FADE_DURATION = 400;   // ms for all 3 to fade out
const SPARKLE_COUNT = 14;
const COLOR_CYCLE_SPEED = 0.6; // seconds per full color cycle

const EFFECT_LABELS: Record<string, string> = {
    'two-hearts': 'Apply current magic to HP',
    'sapphire': 'Apply current magic to Gold',
    'lightning-trio': 'Apply current magic to enemies',
};

/** Colors the symbols pulse through during the waiting phase */
const PULSE_COLORS = ['#ec4899', '#a855f7', '#2dd4bf', '#3b82f6', '#ffffff'];

/** Generate sparkle positions for one session */
function generateSparkles(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        top: 5 + Math.random() * 90,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 1.5,
        duration: 0.4 + Math.random() * 0.8,
    }));
}

export function ConjureMagicModal({ isOpen, onClose, onResult }: ConjureMagicModalProps) {
    const [phase, setPhase] = useState<'waiting' | 'fading' | 'revealed'>('waiting');
    const [winnerIndex, setWinnerIndex] = useState<number>(0);
    const [sessionKey, setSessionKey] = useState(0);

    const sparkles = useMemo(() => generateSparkles(SPARKLE_COUNT), [sessionKey]);

    const startSession = useCallback(() => {
        setPhase('waiting');
        setWinnerIndex(Math.floor(Math.random() * CONJURE_ICONS.length));
        setSessionKey(prev => prev + 1);
    }, []);

    // Start session when opened
    useEffect(() => {
        if (isOpen) {
            startSession();
        }
    }, [isOpen, startSession]);

    // After REVEAL_DELAY, fade out all 3, then reveal winner
    useEffect(() => {
        if (!isOpen || phase !== 'waiting') return;
        const timer = setTimeout(() => {
            setPhase('fading');
        }, REVEAL_DELAY);
        return () => clearTimeout(timer);
    }, [isOpen, phase, sessionKey]);

    // After fade completes, show the winner
    useEffect(() => {
        if (!isOpen || phase !== 'fading') return;
        const timer = setTimeout(() => {
            setPhase('revealed');
            onResult(CONJURE_ICONS[winnerIndex] as 'two-hearts' | 'sapphire' | 'lightning-trio');
        }, FADE_DURATION);
        return () => clearTimeout(timer);
    }, [isOpen, phase, winnerIndex, onResult]);

    if (!isOpen) return null;

    const winnerName = CONJURE_ICONS[winnerIndex];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={phase === 'revealed' ? onClose : undefined}
                className="fixed inset-0 bg-black/70 z-[60]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none">
                <div className="bg-zinc-900 border border-pink-800/50 rounded-2xl shadow-[0_0_60px_rgba(236,72,153,0.15)] flex flex-col p-6 w-full max-w-sm pointer-events-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-pink-400 font-bold uppercase tracking-widest leading-none text-sm">Conjure Magic</h2>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest"
                        >
                            Close
                        </button>
                    </div>

                    {/* Symbol display area — fixed height */}
                    <div
                        className="border border-zinc-800/50 bg-zinc-950/50 rounded flex items-center justify-center relative overflow-hidden"
                        style={{ height: 160 }}
                    >
                        {/* White sparkles during waiting phase */}
                        {phase === 'waiting' && sparkles.map(s => (
                            <div
                                key={`sparkle-${s.id}`}
                                className="absolute rounded-full bg-white pointer-events-none"
                                style={{
                                    width: s.size,
                                    height: s.size,
                                    left: `${s.left}%`,
                                    top: `${s.top}%`,
                                    opacity: 0,
                                    animation: `conjure-sparkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                                }}
                            />
                        ))}

                        <AnimatePresence mode="wait">
                            {/* Waiting / Fading: show all 3 side by side */}
                            {(phase === 'waiting' || phase === 'fading') && (
                                <motion.div
                                    key="symbols-row"
                                    className="flex items-center gap-8"
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: phase === 'fading' ? 0 : 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: FADE_DURATION / 1000, ease: 'easeOut' }}
                                >
                                    {CONJURE_ICONS.map((iconName, i) => (
                                        <div
                                            key={iconName}
                                            className="flex items-center justify-center"
                                            style={{
                                                animation: phase === 'waiting'
                                                    ? `conjure-color-pulse ${COLOR_CYCLE_SPEED}s linear infinite ${i * 0.1}s`
                                                    : undefined,
                                            }}
                                        >
                                            <Icon name={iconName} scale={4} />
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Revealed: winner centered */}
                            {phase === 'revealed' && (
                                <motion.div
                                    key="winner"
                                    className="flex items-center justify-center"
                                    initial={{ opacity: 0, scale: 1.5 }}
                                    animate={{ opacity: 1, scale: 2.5 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                >
                                    <Icon name={winnerName} scale={2} tintColor="#ec4899" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Winner label — fixed height container so modal doesn't resize */}
                    <div className="mt-4 text-center flex flex-col gap-1" style={{ minHeight: 36 }}>
                        <AnimatePresence>
                            {phase === 'revealed' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                    className="flex flex-col gap-1"
                                >
                                    <span className="text-zinc-300 text-xs uppercase tracking-[0.2em] font-bold">
                                        {winnerName.replace(/-/g, ' ')}
                                    </span>
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest">
                                        {EFFECT_LABELS[winnerName]}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes conjure-color-pulse {
                    0%   { color: ${PULSE_COLORS[0]}; }
                    20%  { color: ${PULSE_COLORS[1]}; }
                    40%  { color: ${PULSE_COLORS[2]}; }
                    60%  { color: ${PULSE_COLORS[3]}; }
                    80%  { color: ${PULSE_COLORS[4]}; }
                    100% { color: ${PULSE_COLORS[0]}; }
                }
                @keyframes conjure-sparkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 0.85; transform: scale(1); }
                }
            `}</style>
        </>
    );
}
