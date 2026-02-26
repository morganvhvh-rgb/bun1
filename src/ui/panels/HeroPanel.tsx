import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectTotalAttack } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { hpVariants, playerIconVariants } from '../animations';

interface HeroPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    onCharacterClick: () => void;
    onReset: () => void;
}

function StatBadge({ label, value, colorClass }: { label: string, value: string | number, colorClass: string, flash?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-0.5 px-1 rounded-none border border-zinc-600 min-w-[3.25rem]">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-0">{label}</span>
            <span className={cn("text-xs sm:text-sm font-bold leading-none", colorClass)}>
                {value}
            </span>
        </div>
    );
}

export function HeroPanel({ playerAnim, isBattleRunning, onCharacterClick, onReset }: HeroPanelProps) {
    const { playerHp, playerMaxHp, playerMagic, playerGear, gold, moves } = useGameStore();
    const playerBaseAtk = useGameStore(selectTotalAttack);

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

    return (
        <div className="flex-1 flex flex-col relative min-h-0 w-full max-w-[50%] p-2 pt-10 sm:p-3 sm:pt-10 items-center justify-center gap-3 z-20">
            {/* Reset Button */}
            <button
                onPointerDown={startResetHold}
                onPointerUp={clearResetHold}
                onPointerLeave={clearResetHold}
                onPointerCancel={clearResetHold}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute top-2 left-2 px-2 py-1 border border-zinc-600 text-[8px] uppercase tracking-widest touch-none select-none z-20"
            >
                <div
                    className="absolute inset-0 bg-white origin-left"
                    style={{ transform: `scaleX(${resetProgress})`, transition: resetProgress === 0 ? 'transform 0.1s' : 'none' }}
                />
                <span className={cn("relative z-10 font-bold", resetProgress > 0.5 ? 'text-black' : 'text-white')}>Hold Reset</span>
            </button>

            {/* Avatar Section */}
            <div className="relative flex flex-col items-center shrink-0 z-20">
                <div className="relative z-10 p-2 sm:p-2.5 border border-zinc-600 bg-black">
                    <motion.div
                        animate={playerAnim}
                        variants={playerIconVariants}
                        initial="idle"
                        className="relative z-20"
                    >
                        <Icon
                            name="hood"
                            scale={3}
                            tintColor="#c084fc"
                            className={cn('cursor-pointer hover:opacity-80 active:opacity-50', isBattleRunning && 'pointer-events-none')}
                            onClick={onCharacterClick}
                        />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {moves >= 10 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: -10 }}
                            className="absolute -bottom-2 -right-2 text-black font-bold text-sm z-20 flex items-center justify-center w-6 h-6 bg-white border border-black"
                        >
                            <i className="ra ra-muscle-up" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* HP Bar */}
            <div className="w-full max-w-[8rem] flex flex-col items-center shrink-0">
                <div className="flex justify-between items-center w-full px-1.5 py-0.5 mb-1 border border-zinc-600">
                    <span className="text-[10px] font-bold tracking-wider">HP</span>
                    <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[10px] font-bold text-red-500 tracking-wider">
                        {playerHp} / {playerMaxHp}
                    </motion.span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 w-full shrink-0 max-w-[8rem] mx-auto">
                <StatBadge label="ATK" value={playerBaseAtk} colorClass="text-orange-500" />
                <StatBadge label="MGC" value={playerMagic} colorClass="text-pink-500" />
                <StatBadge label="DEF" value={playerGear} colorClass="text-blue-500" />
                <StatBadge label="GLD" value={gold} colorClass="text-yellow-500" />
            </div>
        </div>
    );
}
