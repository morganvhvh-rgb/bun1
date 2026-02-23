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
        <div
            className="border-r border-zinc-800 flex flex-col items-center justify-between shrink-0 h-full"
            style={{
                width: 'clamp(6.5rem, calc(var(--cell) * 2.2), 9rem)',
                padding: 'var(--gap)',
            }}
        >
            {/* Hero Icon */}
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

            {/* Stat lines — flex-1 so they stretch to fill middle space */}
            <div
                className="flex flex-col w-full text-zinc-500 uppercase font-medium flex-1 justify-evenly"
                style={{
                    fontSize: 'clamp(10px, 2.8vw, 13px)',
                    letterSpacing: '0.08em',
                    padding: '0 2px',
                }}
            >
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
                <div className="flex justify-between items-center whitespace-nowrap"><span>ATK</span> <span className="text-zinc-300">{playerBaseAtk}</span></div>
                <div className="flex justify-between items-center"><span>Magic</span> <span className="text-zinc-300">{playerMagic}</span></div>
                <div className="flex justify-between items-center"><span>Gear</span> <span className="text-zinc-300">{playerGear}</span></div>
                <div className="flex justify-between items-center"><span>EXP</span> <span className="text-zinc-300">{moves}</span></div>
                <div className="flex justify-between items-center relative text-yellow-500">
                    <span>Gold</span>
                    <span>{gold}</span>
                </div>
            </div>

            {/* Reset button */}
            <button
                onPointerDown={startResetHold}
                onPointerUp={clearResetHold}
                onPointerLeave={clearResetHold}
                onPointerCancel={clearResetHold}
                onContextMenu={(e) => e.preventDefault()}
                className="relative w-full bg-red-950/30 text-zinc-400 rounded uppercase tracking-[0.15em] font-medium border border-zinc-600 transition-colors overflow-hidden select-none touch-none cursor-pointer active:border-zinc-500 inline-flex items-center justify-center leading-none whitespace-nowrap shrink-0"
                style={{ height: 'clamp(1.5rem, 4dvh, 2rem)', fontSize: 'clamp(8px, 2.2vw, 11px)' }}

            >
                <div
                    className="absolute inset-0 bg-red-600/70 origin-left pointer-events-none"
                    style={{
                        transform: `scaleX(${resetProgress})`,
                        transition: resetProgress === 0 ? 'transform 0.15s ease-out' : 'none'
                    }}
                />
                <span className="relative z-10">HOLD - RESET</span>
            </button>
        </div>
    );
}
