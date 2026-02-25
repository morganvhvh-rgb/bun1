import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectHasTwoFairyWands } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { ICON_THEME, GAME_CONSTANTS } from '@/lib/constants';
import { enemyIconVariants, hpVariants } from '../animations';
import type { IconName } from '@/types/game';

interface EnemyColumnProps {
    name: IconName;
    hp: number;
    maxHp: number;
    atk: number;
    lvl: number;
    type: string;
    isVisible: boolean;
    animStatus: 'idle' | 'attack' | 'hurt';
}

function EnemyCard({ name, hp, maxHp, atk, lvl, type, isVisible, animStatus }: EnemyColumnProps) {
    if (!isVisible) return null;
    const hasType = type.trim() !== '' && type !== '---';

    return (
        <motion.div
            layout
            className="w-full flex items-center justify-between p-2 mt-2 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden shrink-0"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            {/* Background Icon fade */}
            <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none scale-150 rotate-12">
                <Icon name={name} scale={3} tintColor="#fff" />
            </div>

            {/* Avatar block */}
            <div className="relative shrink-0 flex flex-col items-center ml-1">
                <motion.div animate={animStatus} variants={enemyIconVariants} initial="idle" className="relative z-10 p-2 sm:p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                    <Icon name={name} scale={2} tintColor={ICON_THEME[name]} />
                </motion.div>
                {hasType && (
                    <span className="absolute -bottom-2 bg-zinc-800 border border-zinc-700 text-[8px] font-black uppercase text-zinc-300 px-1.5 py-0.5 rounded-full z-20 shadow-lg tracking-widest leading-none">
                        {type}
                    </span>
                )}
            </div>

            {/* Stats block */}
            <div className="flex-1 flex flex-col justify-center ml-3 min-w-0 z-10 relative">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-zinc-200 uppercase tracking-widest truncate max-w-[80px]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        {name.replace('-', ' ')}
                    </span>
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-950/40 border border-blue-500/20 px-1 py-0.5 rounded leading-none shrink-0 tracking-widest">
                        LVL {lvl}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-1 w-full">
                    {/* HP Section */}
                    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                        <div className="h-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden drop-shadow-sm">
                            <motion.div
                                className="h-full bg-gradient-to-r from-red-600 to-orange-400"
                                animate={{ width: `${(hp / maxHp) * 100}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-0.5 w-full">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">HP</span>
                            <motion.span animate={animStatus === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[9px] font-bold text-red-400 tracking-wider">
                                {hp}/{maxHp}
                            </motion.span>
                        </div>
                    </div>
                </div>

                <div className="absolute right-0 bottom-[-2px] text-[10px] font-bold text-orange-400 flex items-center gap-1 drop-shadow-md bg-orange-950/80 border border-orange-500/30 px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm">
                    <i className="ra ra-sword text-[10px]" /> {atk}
                </div>
            </div>
        </motion.div>
    );
}

interface EnemyPanelProps {
    enemy1Anim: 'idle' | 'attack' | 'hurt';
    enemy2Anim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    isPostBattleScreen: boolean;
    onEngage: () => void;
}

export function EnemyPanel({ enemy1Anim, enemy2Anim, isBattleRunning, isPostBattleScreen, onEngage }: EnemyPanelProps) {
    const { enemy1, enemy2, battleCount, playerHp, conjureMagicUsed } = useGameStore();
    const hasTwoFairyWands = useGameStore(selectHasTwoFairyWands);
    const canConjureMagic = hasTwoFairyWands && !conjureMagicUsed;
    const isDisabled = playerHp === 0 || battleCount > GAME_CONSTANTS.MAX_BATTLES;
    const showBattleState = isBattleRunning || isDisabled;

    return (
        <div className="flex-1 flex flex-col relative min-h-0 w-full p-2 sm:p-3 items-center justify-between z-10 border-l border-white/5">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-bl from-red-950/20 to-transparent pointer-events-none" />

            {/* Enemies list */}
            <div className="w-full flex-1 flex flex-col justify-start items-center gap-1 overflow-hidden">
                {isPostBattleScreen ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-zinc-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold border border-zinc-700/50 bg-zinc-900/50 px-3 py-1.5 rounded-lg backdrop-blur shadow-lg">
                            Battle Cleared
                        </motion.div>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {enemy1.isVisible && <EnemyCard key="e1" {...enemy1} animStatus={enemy1Anim} />}
                        {enemy2.isVisible && <EnemyCard key="e2" {...enemy2} animStatus={enemy2Anim} />}
                    </AnimatePresence>
                )}
            </div>

            {/* Engage Button */}
            <div className="w-full shrink-0 flex justify-center pb-1 pt-3 max-w-[12rem]">
                <button
                    onClick={onEngage}
                    disabled={(!canConjureMagic && isDisabled) || (isBattleRunning && !isPostBattleScreen)}
                    className={cn(
                        "relative w-full rounded-xl overflow-hidden shadow-lg transition-transform active:scale-95 touch-manipulation z-20",
                        isPostBattleScreen ? "bg-zinc-800 text-zinc-300 border border-zinc-600/50 hover:bg-zinc-700"
                            : showBattleState ? "bg-red-950 border border-red-900/50 cursor-not-allowed opacity-50 grayscale"
                                : canConjureMagic ? "bg-zinc-950 border border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]"
                                    : "bg-red-950/80 border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
                    )}
                    style={{ height: 'var(--slider-h)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Animated glossy sweep effect */}
                    {!(isPostBattleScreen || showBattleState) && (
                        <motion.div
                            className="absolute top-0 bottom-0 left-[-100%] w-[50%] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none skew-x-[-20deg]"
                            animate={{ left: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                        />
                    )}

                    <div className="relative z-10 w-full h-full flex items-center justify-center tracking-[0.2em] font-black uppercase text-[11px] sm:text-xs drop-shadow-md">
                        {isPostBattleScreen ? "NEXT ROUND"
                            : showBattleState ? <span className="text-red-500">{battleCount === 4 || battleCount === 8 ? 'BOSS BATTLE' : battleCount > 8 ? 'VICTORY' : `BATTLE ${battleCount}`}</span>
                                : canConjureMagic ? <span className="text-pink-300 flex items-center gap-1"><Icon name="fairy-wand" scale={1.2} tintColor="#fff" /> CONJURE</span>
                                    : <span className="text-red-300 flex items-center gap-1"><i className="ra ra-sword text-sm" /> ENGAGE</span>}
                    </div>
                </button>
            </div>
        </div>
    );
}
