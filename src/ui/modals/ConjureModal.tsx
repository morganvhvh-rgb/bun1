import { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../shared/Icon';
import type { SymbolName } from '@/types/game';

interface ConjureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResult: (winner: 'two-hearts' | 'sapphire' | 'lightning-trio') => void;
}

const CONJURE_SYMBOLS: SymbolName[] = ['two-hearts', 'sapphire', 'lightning-trio'];
const REVEAL_DELAY = 2500;
const FADE_DURATION = 400;
const SPARKLE_COUNT = 40;
const COLOR_CYCLE_SPEED = 2.0;

const EFFECT_LABELS: Record<string, string> = {
    'two-hearts': 'Apply current magic to HP',
    'sapphire': 'Apply current magic to Gold',
    'lightning-trio': 'Apply current magic to enemies',
};

function generateSparkles(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        top: 5 + Math.random() * 90,
        size: 1.5 + Math.random() * 3.5,
        delay: Math.random() * 1.5,
        duration: 0.3 + Math.random() * 0.7,
    }));
}

export function ConjureModal({ isOpen, onClose, onResult }: ConjureModalProps) {
    const [phase, setPhase] = useState<'waiting' | 'fading' | 'revealed'>('waiting');
    const [winnerIndex, setWinnerIndex] = useState<number>(0);
    const [sessionKey, setSessionKey] = useState(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sparkles = useMemo(() => generateSparkles(SPARKLE_COUNT), [sessionKey]);

    const prevOpenRef = useRef(false);
    if (isOpen && !prevOpenRef.current) {
        // Reset session on open (synchronous, avoids setState-in-effect)
        setPhase('waiting');
        setWinnerIndex(Math.floor(Math.random() * CONJURE_SYMBOLS.length));
        setSessionKey(prev => prev + 1);
    }
    prevOpenRef.current = isOpen;

    useEffect(() => {
        if (!isOpen || phase !== 'waiting') return;
        const timer = setTimeout(() => setPhase('fading'), REVEAL_DELAY);
        return () => clearTimeout(timer);
    }, [isOpen, phase, sessionKey]);

    useEffect(() => {
        if (!isOpen || phase !== 'fading') return;
        const timer = setTimeout(() => {
            setPhase('revealed');
            onResult(CONJURE_SYMBOLS[winnerIndex] as 'two-hearts' | 'sapphire' | 'lightning-trio');
        }, FADE_DURATION);
        return () => clearTimeout(timer);
    }, [isOpen, phase, winnerIndex, onResult]);

    if (!isOpen) return null;
    const winnerName = CONJURE_SYMBOLS[winnerIndex];

    return (
        <>
            <div onClick={phase === 'revealed' ? onClose : undefined} className="fixed inset-0 bg-black/90 z-[60]" />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none">
                <div className="bg-black border border-zinc-800 flex flex-col p-5 w-full max-w-sm pointer-events-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[#f0e8d8] font-bold uppercase tracking-widest leading-none text-sm">Conjure Magic</h2>
                        <button onClick={onClose} className="text-[#f0e8d8] uppercase text-xs tracking-widest">Close</button>
                    </div>

                    <div className="border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden" style={{ height: 'min(160px, 22svh)' }}>
                        {(phase === 'waiting' || phase === 'revealed') && sparkles.map(s => (
                            <div key={`sparkle-${s.id}`} className="absolute rounded-full bg-white pointer-events-none" style={{
                                width: s.size, height: s.size, left: `${s.left}%`, top: `${s.top}%`, opacity: 0,
                                animation: `conjure-sparkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                            }} />
                        ))}

                        <AnimatePresence mode="wait">
                            {(phase === 'waiting' || phase === 'fading') && (
                                <motion.div key="symbols-row" className="flex items-center gap-8"
                                    initial={{ opacity: 1 }} animate={{ opacity: phase === 'fading' ? 0 : 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: FADE_DURATION / 1000, ease: 'easeOut' }}
                                >
                                    {CONJURE_SYMBOLS.map((symbolName, i) => (
                                        <div key={symbolName} className="flex items-center justify-center" style={{
                                            animation: phase === 'waiting' ? `conjure-color-pulse ${COLOR_CYCLE_SPEED}s linear infinite ${i * 0.1}s` : undefined,
                                        }}>
                                            <Icon name={symbolName} scale={4} />
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                            {phase === 'revealed' && (
                                <motion.div key="winner" className="flex items-center justify-center" initial={{ opacity: 0, scale: 1.5 }} animate={{ opacity: 1, scale: 2.5 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                                    <Icon name={winnerName} scale={2} tintColor="#ec4899" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-4 text-center flex flex-col gap-1" style={{ minHeight: 36 }}>
                        <AnimatePresence>
                            {phase === 'revealed' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="flex flex-col gap-1">
                                    <span className="text-[#f0e8d8] text-xs uppercase tracking-[0.2em] font-bold">{winnerName.replace(/-/g, ' ')}</span>
                                    <span className="text-[#f0e8d8] text-[10px] uppercase tracking-widest">{EFFECT_LABELS[winnerName]}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </>
    );
}
