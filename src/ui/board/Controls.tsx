import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { GAME_CONSTANTS } from '@/lib/constants';

interface ControlsProps {
    shuffleCost: number;
    isAnimating: boolean;
    onSpin: () => void;
    onShuffle: () => void;
    onScrollsOpen: () => void;
    onCoffeeOpen: () => void;
    onReset: () => void;
}

export function Controls({ shuffleCost, isAnimating, onSpin, onShuffle, onScrollsOpen, onCoffeeOpen, onReset }: ControlsProps) {
    const { gold, keptScrolls } = useGameStore();

    const RESET_HOLD_MS = 800;
    const [resetProgress, setResetProgress] = useState(0);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resetStartRef = useRef<number>(0);
    const resetRafRef = useRef<number>(0);
    const resetBlockedRef = useRef(isAnimating);

    const clearResetHold = useCallback(() => {
        if (resetTimerRef.current) { clearTimeout(resetTimerRef.current); resetTimerRef.current = null; }
        if (resetRafRef.current) { cancelAnimationFrame(resetRafRef.current); resetRafRef.current = 0; }
        setResetProgress(0);
    }, []);

    const [costPopups, setCostPopups] = useState<{ id: string, type: 'spin' | 'shuffle', amount: number }[]>([]);

    const handleSpin = useCallback(() => {
        const id = Math.random().toString();
        setCostPopups(prev => [...prev, { id, type: 'spin', amount: GAME_CONSTANTS.SPIN_COST }]);
        setTimeout(() => setCostPopups(prev => prev.filter(p => p.id !== id)), 1000);
        onSpin();
    }, [onSpin]);

    const handleShuffle = useCallback(() => {
        const id = Math.random().toString();
        setCostPopups(prev => [...prev, { id, type: 'shuffle', amount: shuffleCost }]);
        setTimeout(() => setCostPopups(prev => prev.filter(p => p.id !== id)), 1000);
        onShuffle();
    }, [shuffleCost, onShuffle]);

    useEffect(() => {
        resetBlockedRef.current = isAnimating;
    }, [isAnimating]);

    const startResetHold = useCallback(() => {
        if (resetBlockedRef.current) return;
        resetStartRef.current = Date.now();
        setResetProgress(0);

        const tick = () => {
            if (resetBlockedRef.current) {
                clearResetHold();
                return;
            }
            const elapsed = Date.now() - resetStartRef.current;
            const pct = Math.min(elapsed / RESET_HOLD_MS, 1);
            setResetProgress(pct);
            if (pct < 1) resetRafRef.current = requestAnimationFrame(tick);
        };
        tick();

        resetTimerRef.current = setTimeout(() => {
            if (resetBlockedRef.current) {
                clearResetHold();
                return;
            }
            setResetProgress(1);
            onReset();
            clearResetHold();
        }, RESET_HOLD_MS);
    }, [onReset, clearResetHold]);

    const btnStyle: React.CSSProperties = { width: 'var(--cell)', height: 'var(--cell)' };
    const btnClass = 'relative surface-panel flex items-center justify-center focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden hover:bg-zinc-800 active:scale-95 transition-all !rounded-full';

    return (
        <div className="relative flex flex-col" style={{ gap: 'var(--gap)' }}>
            {/* Spin Button */}
            <div className="relative" style={btnStyle}>
                <motion.button onClick={handleSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating} className={btnClass} style={{ width: '100%', height: '100%' }} title="Spin">
                    <i className="ra ra-cycle" style={{ fontSize: 'calc(var(--cell) * 0.55)', color: '#e8d4b8' }} />
                </motion.button>
                <AnimatePresence>
                    {costPopups.filter(p => p.type === 'spin').map(popup => (
                        <motion.div
                            key={popup.id}
                            initial={{ opacity: 0, y: 6, scale: 0.84 }}
                            animate={{ opacity: [0, 1, 1, 0], y: [6, -8, -20, -30], scale: [0.84, 1.08, 1.03, 0.98] }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="absolute z-40 pointer-events-none select-none font-bold tracking-widest text-yellow-300"
                            style={{
                                right: 'calc(100% + 12px)',
                                top: '25%',
                                textShadow: '0 1px 0 #000, 0 0 8px rgba(234, 179, 8, 0.45)',
                                fontSize: 'var(--text-base)',
                            }}
                        >
                            -{popup.amount}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Shuffle Button */}
            <div className="relative" style={btnStyle}>
                <motion.button onClick={handleShuffle} disabled={gold < shuffleCost || isAnimating} className={btnClass} style={{ width: '100%', height: '100%' }} title="Shuffle">
                    <i className="ra ra-perspective-dice-random" style={{ fontSize: 'calc(var(--cell) * 0.55)', color: '#e8d4b8' }} />
                </motion.button>
                <AnimatePresence>
                    {costPopups.filter(p => p.type === 'shuffle').map(popup => (
                        <motion.div
                            key={popup.id}
                            initial={{ opacity: 0, y: 6, scale: 0.84 }}
                            animate={{ opacity: [0, 1, 1, 0], y: [6, -8, -20, -30], scale: [0.84, 1.08, 1.03, 0.98] }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="absolute z-40 pointer-events-none select-none font-bold tracking-widest text-yellow-300"
                            style={{
                                right: 'calc(100% + 12px)',
                                top: '25%',
                                textShadow: '0 1px 0 #000, 0 0 8px rgba(234, 179, 8, 0.45)',
                                fontSize: 'var(--text-base)',
                            }}
                        >
                            -{popup.amount}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <motion.button type="button" onClick={onScrollsOpen} disabled={isAnimating} className={cn(btnClass)} style={btnStyle} title="Scrolls">
                <Icon name="scroll-unfurled" scale={1.8} tintColor="#e8d4b8" />
                <div className="absolute inset-0 text-black font-bold font-mono flex items-center justify-center pointer-events-none" style={{ fontSize: 'var(--text-base)' }}>
                    {keptScrolls.length}
                </div>
            </motion.button>

            {/* Coffee Button */}
            <button
                type="button"
                onClick={onCoffeeOpen}
                disabled={isAnimating}
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center focus:outline-none surface-panel hover:bg-zinc-800 active:scale-95 transition-all !rounded-full border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:bg-zinc-900"
                style={{
                    top: 'var(--coffee-btn-offset)',
                    width: 'var(--coffee-btn-size)',
                    height: 'var(--coffee-btn-size)'
                }}
                title="Coffee"
                aria-label="Open coffee popup"
            >
                <i className="ra ra-coffee-mug" style={{ fontSize: 'var(--coffee-icon-size)', color: '#e8d4b8' }} />
            </button>

            {/* Reset Button */}
            <button
                disabled={isAnimating}
                onPointerDown={startResetHold}
                onPointerUp={clearResetHold}
                onPointerLeave={clearResetHold}
                onPointerCancel={clearResetHold}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center focus:outline-none surface-panel touch-none select-none overflow-hidden !rounded-full border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                    top: 'calc(var(--coffee-btn-offset) + var(--coffee-btn-size) + var(--gap))',
                    width: 'var(--coffee-btn-size)',
                    height: 'var(--coffee-btn-size)'
                }}
                title="Hold to Reset"
                aria-label="Hold to reset game"
            >
                <div
                    className="absolute inset-x-0 bottom-0 bg-white origin-bottom z-0"
                    style={{ height: `${resetProgress * 100}%`, transition: resetProgress === 0 ? 'height 0.1s' : 'none' }}
                />
                <span className={cn("relative z-10 text-[9px] font-bold uppercase tracking-widest leading-none", resetProgress > 0.5 ? 'text-black' : 'text-[#e8d4b8]')}>
                    Reset
                </span>
            </button>
        </div>
    );
}
