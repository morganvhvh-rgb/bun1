import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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

    const clearResetHold = useCallback(() => {
        if (resetTimerRef.current) { clearTimeout(resetTimerRef.current); resetTimerRef.current = null; }
        if (resetRafRef.current) { cancelAnimationFrame(resetRafRef.current); resetRafRef.current = 0; }
        setResetProgress(0);
    }, []);

    const startResetHold = useCallback(() => {
        resetStartRef.current = Date.now();
        setResetProgress(0);

        const tick = () => {
            const elapsed = Date.now() - resetStartRef.current;
            const pct = Math.min(elapsed / RESET_HOLD_MS, 1);
            setResetProgress(pct);
            if (pct < 1) resetRafRef.current = requestAnimationFrame(tick);
        };
        tick();

        resetTimerRef.current = setTimeout(() => {
            setResetProgress(1);
            onReset();
            clearResetHold();
        }, RESET_HOLD_MS);
    }, [onReset, clearResetHold]);

    const btnStyle: React.CSSProperties = { width: 'var(--cell)', height: 'var(--cell)' };
    const btnClass = 'relative surface-panel flex items-center justify-center focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden hover:bg-zinc-800/80 active:scale-95 transition-all !rounded-2xl';

    return (
        <div className="relative flex flex-col" style={{ gap: 'var(--gap)' }}>
            <motion.button onClick={onSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating} className={btnClass} style={btnStyle} title="Spin">
                <i className="ra ra-cycle text-white" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
            </motion.button>

            <motion.button onClick={onShuffle} disabled={gold < shuffleCost || isAnimating} className={btnClass} style={btnStyle} title="Shuffle">
                <i className="ra ra-perspective-dice-random text-white" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
            </motion.button>

            <motion.button type="button" onClick={onScrollsOpen} disabled={isAnimating} className={cn(btnClass)} style={btnStyle} title="Scrolls">
                <Icon name="scroll-unfurled" scale={1.8} tintColor="#fff" />
                <div className="absolute inset-0 text-black font-bold font-mono flex items-center justify-center pointer-events-none" style={{ fontSize: 'var(--text-base)' }}>
                    {keptScrolls.length}
                </div>
            </motion.button>

            {/* Coffee Button */}
            <button
                type="button"
                onClick={onCoffeeOpen}
                disabled={isAnimating}
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center focus:outline-none surface-panel hover:bg-zinc-800/80 active:scale-95 transition-all rounded-full border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:bg-zinc-900/50"
                style={{
                    top: 'var(--coffee-btn-offset)',
                    width: 'var(--coffee-btn-size)',
                    height: 'var(--coffee-btn-size)'
                }}
                title="Coffee"
                aria-label="Open coffee popup"
            >
                <i className="ra ra-coffee-mug text-white" style={{ fontSize: 'var(--coffee-icon-size)' }} />
            </button>

            {/* Reset Button */}
            <button
                disabled={isAnimating}
                onPointerDown={startResetHold}
                onPointerUp={clearResetHold}
                onPointerLeave={clearResetHold}
                onPointerCancel={clearResetHold}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center focus:outline-none surface-panel touch-none select-none overflow-hidden rounded-full border-white/10 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:opacity-40"
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
                <span className={cn("relative z-10 text-[9px] font-bold uppercase tracking-widest leading-none", resetProgress > 0.5 ? 'text-black' : 'text-zinc-500')}>
                    Reset
                </span>
            </button>
        </div>
    );
}
