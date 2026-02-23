import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { playerIconVariants, hpVariants } from './animations';

interface HeroStatsPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    playerHp: number;
    playerMaxHp: number;
    playerBaseAtk: number;
    playerMagic: number;
    playerGear: number;
    gold: number;
    moves: number;
    isBattleRunning: boolean;
    onCharacterClick: () => void;
    onReset: () => void;
}



export function HeroStatsPanel({
    playerAnim,
    playerHp,
    playerMaxHp,
    playerBaseAtk,
    playerMagic,
    playerGear,
    gold,
    moves,
    isBattleRunning,
    onCharacterClick,
    onReset
}: HeroStatsPanelProps) {
    const RESET_HOLD_MS = 1000;
    const [resetProgress, setResetProgress] = useState(0);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resetStartRef = useRef<number>(0);
    const resetRafRef = useRef<number>(0);

    const clearResetHold = useCallback(() => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
        if (resetRafRef.current) {
            cancelAnimationFrame(resetRafRef.current);
            resetRafRef.current = 0;
        }
        setResetProgress(0);
    }, []);

    const tickProgress = useCallback(() => {
        const elapsed = Date.now() - resetStartRef.current;
        const pct = Math.min(elapsed / RESET_HOLD_MS, 1);
        setResetProgress(pct);
        if (pct < 1) {
            resetRafRef.current = requestAnimationFrame(tickProgress);
        }
    }, []);

    const startResetHold = useCallback(() => {
        resetStartRef.current = Date.now();
        setResetProgress(0);
        tickProgress();
        resetTimerRef.current = setTimeout(() => {
            setResetProgress(1);
            onReset();
            clearResetHold();
        }, RESET_HOLD_MS);
    }, [onReset, tickProgress, clearResetHold]);


    return (
        <div className="w-[7.25rem] min-w-[7.25rem] sm:w-[8.5rem] md:w-[30%] border-r border-zinc-800 flex flex-col items-center justify-start gap-2 pt-3 sm:pt-4 shrink-0">
            <div className="relative flex shrink-0">
                <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="z-10 relative">
                    <Icon
                        name="hood"
                        scale={4}
                        tintColor="#7e22ce"
                        className={cn("cursor-pointer hover:brightness-110 transition-all active:scale-95", isBattleRunning && "pointer-events-none")}
                        onClick={onCharacterClick}
                    />
                </motion.div>
                {moves >= 10 && (
                    <div className="absolute bottom-0 -right-2 text-red-500 font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-20 leading-none flex items-center justify-center">
                        <i className="ra ra-muscle-up" />
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full px-1.5 sm:px-2 text-xs tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium gap-1.5 shrink-0">
                <div className="flex justify-between items-center">
                    <span>HP</span>
                    <motion.span
                        animate={playerAnim === 'hurt' ? "hurt" : "idle"}
                        variants={hpVariants}
                        className="text-zinc-300 inline-block origin-right"
                    >
                        {playerHp}/{playerMaxHp}
                    </motion.span>
                </div>
                <div className="flex justify-between items-center whitespace-nowrap"><span>Attack</span> <span className="text-zinc-300">{playerBaseAtk}</span></div>
                <div className="flex justify-between items-center"><span>Magic</span> <span className="text-zinc-300">{playerMagic}</span></div>
                <div className="flex justify-between items-center"><span>Gear</span> <span className="text-zinc-300">{playerGear}</span></div>
                <div className="flex justify-between items-center"><span>Experience</span> <span className="text-zinc-300">{moves}</span></div>
                <div className="flex justify-between items-center relative text-yellow-500">
                    <span>Gold</span>
                    <span>{gold}</span>
                </div>
            </div>
            <button
                onPointerDown={startResetHold}
                onPointerUp={clearResetHold}
                onPointerLeave={clearResetHold}
                onPointerCancel={clearResetHold}
                onContextMenu={(e) => e.preventDefault()}
                className="relative w-full mt-auto mb-2 min-h-8 py-1.5 px-2 bg-red-950/30 text-zinc-400 rounded text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-widest font-bold border border-zinc-600 transition-colors mx-1 sm:mx-2 max-w-[calc(100%-8px)] sm:max-w-[calc(100%-16px)] overflow-hidden select-none touch-none cursor-pointer active:border-zinc-500 inline-flex items-center justify-center leading-none whitespace-nowrap shrink-0"
            >
                <div
                    className="absolute inset-0 bg-red-600/70 origin-left pointer-events-none"
                    style={{
                        transform: `scaleX(${resetProgress})`,
                        transition: resetProgress === 0 ? 'transform 0.15s ease-out' : 'none'
                    }}
                />
                <span className="relative z-10">Reset</span>
            </button>
        </div>
    );
}
