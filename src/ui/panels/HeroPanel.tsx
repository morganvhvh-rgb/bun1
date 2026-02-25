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

function StatBadge({ label, value, colorClass, bgClass, borderClass, flash }: { label: string, value: string | number, colorClass: string, bgClass: string, borderClass: string, flash?: boolean }) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-1 px-1.5 rounded-lg border backdrop-blur-sm min-w-[3rem]", bgClass, borderClass)}>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">{label}</span>
            <motion.span animate={flash ? 'hurt' : 'idle'} variants={hpVariants} className={cn("text-[11px] sm:text-xs font-black leading-none", colorClass)}>
                {value}
            </motion.span>
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
        <div className="flex-1 flex flex-col relative min-h-0 w-full max-w-[50%] p-2 sm:p-3 items-center justify-around z-10">
            {/* Reset Button */}
            <button
                onPointerDown={startResetHold}
                onPointerUp={clearResetHold}
                onPointerLeave={clearResetHold}
                onPointerCancel={clearResetHold}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute top-2 left-2 px-2 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20 text-[8px] uppercase tracking-widest overflow-hidden touch-none select-none z-20"
            >
                <div
                    className="absolute inset-0 bg-red-500/30 origin-left"
                    style={{ transform: `scaleX(${resetProgress})`, transition: resetProgress === 0 ? 'transform 0.1s' : 'none' }}
                />
                <span className="relative z-10 font-bold">Hold Reset</span>
            </button>

            {/* Avatar Section */}
            <div className="relative flex flex-col items-center mt-3 shrink-0">
                <div className="absolute inset-0 bg-purple-600/20 blur-2xl rounded-full scale-150 pointer-events-none" />
                <motion.div
                    animate={playerAnim}
                    variants={playerIconVariants}
                    initial="idle"
                    className="relative z-10 p-2 sm:p-2.5 bg-zinc-950/80 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-white/5 backdrop-blur-md"
                >
                    <Icon
                        name="hood"
                        scale={3}
                        tintColor="#c084fc"
                        className={cn('cursor-pointer hover:brightness-125 transition-all active:scale-95 drop-shadow-[0_0_10px_rgba(192,132,252,0.4)]', isBattleRunning && 'pointer-events-none')}
                        onClick={onCharacterClick}
                    />
                </motion.div>

                <AnimatePresence>
                    {moves >= 10 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: -10 }}
                            className="absolute -bottom-2 -right-2 text-white font-black text-sm drop-shadow-lg pointer-events-none z-20 flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-2 border-zinc-900 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                        >
                            <i className="ra ra-muscle-up" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* HP Bar */}
            <div className="w-full max-w-[8rem] mt-3 flex flex-col items-center shrink-0">
                <div className="flex justify-between w-full px-1 mb-1">
                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider">HP</span>
                    <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[9px] font-black text-red-400 tracking-wider">
                        {playerHp} / {playerMaxHp}
                    </motion.span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 border border-zinc-800 overflow-hidden relative shadow-inner">
                    <motion.div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-600 to-red-400"
                        animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 mt-3 w-full shrink-0 max-w-[8rem] mx-auto">
                <StatBadge label="ATK" value={playerBaseAtk} colorClass="text-orange-400" bgClass="bg-orange-950/30" borderClass="border-orange-500/20" />
                <StatBadge label="MGC" value={playerMagic} colorClass="text-pink-400" bgClass="bg-pink-950/30" borderClass="border-pink-500/20" />
                <StatBadge label="DEF" value={playerGear} colorClass="text-blue-400" bgClass="bg-blue-950/30" borderClass="border-blue-500/20" />
                <StatBadge label="GLD" value={gold} colorClass="text-yellow-400" bgClass="bg-yellow-950/30" borderClass="border-yellow-500/20" />
            </div>
        </div>
    );
}
