import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectTotalAttack } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { hpVariants } from '../animations';
import { playerIconVariants } from '../animations';

interface HeroPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    onCharacterClick: () => void;
    onReset: () => void;
}

function HeroStatRow({ label, value, color, flash, valueColor }: { label: string, value: string | number, color: string, flash?: boolean, valueColor?: string }) {
    return (
        <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] tracking-widest">
            <span className={cn("font-semibold opacity-80", color)}>{label}</span>
            {flash !== undefined ? (
                <motion.span animate={flash ? 'hurt' : 'idle'} variants={hpVariants} className={cn("font-bold whitespace-nowrap", valueColor || "text-zinc-100")}>
                    {value}
                </motion.span>
            ) : (
                <span className={cn("font-bold whitespace-nowrap", valueColor || "text-zinc-100")}>{value}</span>
            )}
        </div>
    );
}

export function HeroPanel({ playerAnim, isBattleRunning, onCharacterClick, onReset }: HeroPanelProps) {
    const { playerHp, playerMaxHp, playerMagic, playerGear, gold, moves } = useGameStore();
    const playerBaseAtk = useGameStore(selectTotalAttack);

    const RESET_HOLD_MS = 1000;
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
        <div
            className="border-r border-zinc-800 flex flex-col items-center justify-between shrink-0 h-full bg-zinc-950/40 relative min-h-0"
            style={{ width: 'clamp(7rem, 28vw, 9.5rem)', padding: 'var(--gap)' }}
        >
            {/* Hero Icon */}
            <div className="relative flex shrink-0 mt-1 mb-0.5">
                <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="z-10 relative">
                    <Icon
                        name="hood"
                        scale={3}
                        tintColor="#9333ea"
                        className={cn('cursor-pointer hover:brightness-110 transition-all active:scale-95 drop-shadow-lg', isBattleRunning && 'pointer-events-none')}
                        onClick={onCharacterClick}
                    />
                </motion.div>
                <AnimatePresence>
                    {moves >= 10 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -bottom-1 -right-2 text-red-500 font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-20 leading-none flex items-center justify-center p-0.5 bg-zinc-900 rounded-full border border-red-900"
                        >
                            <i className="ra ra-muscle-up" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Stats */}
            <div
                className="grid w-full flex-1 min-h-0 my-0.5 items-center px-0.5 max-w-[8rem]"
                style={{ gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}
            >
                <HeroStatRow label="HP" value={`${playerHp} / ${playerMaxHp}`} flash={playerAnim === 'hurt'} color="text-red-400" />
                <HeroStatRow label="ATK" value={playerBaseAtk} color="text-orange-400" />
                <HeroStatRow label="MGC" value={playerMagic} color="text-pink-400" />
                <HeroStatRow label="DEF" value={playerGear} color="text-blue-400" />
                <HeroStatRow label="EXP" value={moves} color="text-emerald-400" />
                <HeroStatRow label="GLD" value={gold} color="text-yellow-400" valueColor="text-yellow-400" />
            </div>

            {/* Reset button */}
            <div className="w-full shrink-0">
                <button
                    onPointerDown={startResetHold}
                    onPointerUp={clearResetHold}
                    onPointerLeave={clearResetHold}
                    onPointerCancel={clearResetHold}
                    onContextMenu={(e) => e.preventDefault()}
                    className="relative w-full bg-red-950/30 text-red-500/80 rounded uppercase tracking-[0.15em] font-semibold border border-red-950 hover:bg-red-950/50 hover:text-red-400 hover:border-red-900 transition-colors overflow-hidden select-none touch-none cursor-pointer active:border-red-800 inline-flex items-center justify-center leading-none whitespace-nowrap mt-1"
                    style={{ height: 'var(--slider-h)', fontSize: '9px' }}
                >
                    <div
                        className="absolute inset-0 bg-red-700/60 origin-left pointer-events-none"
                        style={{ transform: `scaleX(${resetProgress})`, transition: resetProgress === 0 ? 'transform 0.15s ease-out' : 'none' }}
                    />
                    <span className="relative z-10">RESET</span>
                </button>
            </div>
        </div>
    );
}
