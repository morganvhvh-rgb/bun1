import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectHasTwoFairyWands } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME, GAME_CONSTANTS, CATEGORY_TEXT_THEME } from '@/lib/constants';
import { isRunComplete } from '@/lib/battleProgression';
import { enemyIconVariants, hpVariants } from '../animations';
import type { SymbolName } from '@/types/game';

interface EnemyColumnProps {
    name: SymbolName;
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
    const hasType = type && type.trim() !== '' && type !== '---';

    return (
        <motion.div
            className="absolute inset-0 w-full h-full flex flex-col justify-between z-10 overflow-visible"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            {/* Top row: Stats + Avatar + Stats */}
            <div className="flex-1 flex items-center justify-between min-h-0 min-w-0 w-full px-1 gap-2">
                {/* Left: ATK Stat */}
                <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0 py-1 items-start">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">ATK</span>
                        <span className={cn("text-[13px] font-bold leading-none font-mono tracking-wider truncate", CATEGORY_TEXT_THEME.Weapon)} style={{ fontVariantNumeric: 'tabular-nums' }}>{atk}</span>
                    </div>
                </div>

                {/* Center: Avatar */}
                <div className="shrink-0 flex items-center justify-center scale-[0.9] origin-center w-[4rem]">
                    <motion.div animate={animStatus} variants={enemyIconVariants} initial="idle" className="relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] pointer-events-auto flex justify-center items-center">
                        <Icon name={name} scale={4.5} tintColor={SYMBOL_THEME[name]} />
                        {hasType && (
                            <span className="absolute z-10 text-[9px] font-bold text-[#e8d4b8] uppercase tracking-widest leading-none text-center drop-shadow-[0_2px_4px_rgba(0,0,0,1)] pointer-events-none" style={{ textShadow: '0 2px 4px rgba(0,0,0,1), 0 0 4px rgba(0,0,0,0.8)' }}>
                                {type}
                            </span>
                        )}
                    </motion.div>
                </div>

                {/* Right: LVL Stat */}
                <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0 py-1 items-end">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">LVL</span>
                        <span className={cn("text-[13px] font-bold leading-none font-mono tracking-wider truncate", CATEGORY_TEXT_THEME.Nature)} style={{ fontVariantNumeric: 'tabular-nums' }}>{lvl}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Section: HP Bar */}
            <div className="flex flex-col w-full mt-auto shrink-0 pb-1 pt-1">
                <div className="flex items-center gap-1.5 w-full px-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none w-4 shrink-0 text-left">HP</span>
                    <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-red-500 rounded-full"
                            initial={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%` }}
                            animate={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%` }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                        />
                    </div>
                    <motion.span animate={animStatus === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[11px] font-bold text-red-500 leading-none font-mono tracking-wider shrink-0 text-right min-w-[2.5rem]">
                        {hp}<span className="text-[9px] text-red-500/60">/{maxHp}</span>
                    </motion.span>
                </div>
            </div>
        </motion.div >
    );
}

interface EnemyPanelProps {
    enemy1Anim: 'idle' | 'attack' | 'hurt';
    enemy2Anim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    isPostBattleScreen: boolean;
    isAnimating: boolean;
    onEngage: () => void;
}

export function EnemyPanel({ enemy1Anim, enemy2Anim, isBattleRunning, isPostBattleScreen, isAnimating, onEngage }: EnemyPanelProps) {
    const { enemy1, enemy2, battleCount, playerHp, conjureMagicUsed } = useGameStore();
    const hasTwoFairyWands = useGameStore(selectHasTwoFairyWands);
    const canConjureMagic = hasTwoFairyWands && !conjureMagicUsed;
    const hasClearedRun = playerHp > 0 && isRunComplete(battleCount, GAME_CONSTANTS.MAX_BATTLES);
    const isDisabled = playerHp === 0 || hasClearedRun;
    const showBattleState = isBattleRunning || isDisabled;

    return (
        <div className="flex-1 min-w-0 flex flex-col relative overflow-visible w-full h-full py-2 z-10">
            {/* Enemies list */}
            <div className="w-full flex-1 flex flex-col surface-panel overflow-visible z-20 min-h-0 mb-2 p-3 relative">
                <div className="w-full flex-1 flex flex-col justify-center items-center overflow-visible min-h-0 gap-2">
                    {isPostBattleScreen ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 text-zinc-400">
                                Battle Cleared
                            </motion.div>
                        </div>
                    ) : hasClearedRun ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 text-emerald-400">
                                Run Cleared
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            <div className="w-full flex-1 shrink min-h-0 relative flex z-10">
                                <AnimatePresence>
                                    {enemy1.isVisible && <EnemyCard key="e1" {...enemy1} animStatus={enemy1Anim} />}
                                </AnimatePresence>
                            </div>
                            <div className="w-full flex-1 shrink min-h-0 relative flex z-10">
                                <AnimatePresence>
                                    {enemy2.isVisible && <EnemyCard key="e2" {...enemy2} animStatus={enemy2Anim} />}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Engage Button */}
            <button
                onClick={onEngage}
                disabled={(!canConjureMagic && isDisabled) || (isBattleRunning && !isPostBattleScreen) || isAnimating}
                className={cn(
                    "relative w-full h-[46px] shrink-0 mt-auto overflow-hidden active:opacity-50 touch-manipulation z-20 font-bold tracking-[0.1em] rounded-2xl",
                    isPostBattleScreen ? "bg-zinc-100 text-black shadow-none border border-transparent"
                        : showBattleState ? "bg-zinc-950 text-zinc-500 cursor-not-allowed border border-white/5"
                            : canConjureMagic ? "bg-pink-950 text-pink-400 border border-pink-500/30"
                                : "bg-red-950 text-red-400 border border-red-500/20"
                )}
            >
                <div className="relative z-10 w-full h-full flex items-center justify-center tracking-[0.2em] font-bold uppercase text-xs">
                    {isPostBattleScreen ? "NEXT ROUND"
                        : showBattleState ? <span className="text-red-500 text-[11px]">{hasClearedRun ? 'RUN CLEARED' : battleCount === 4 || battleCount === 8 ? 'BOSS BATTLE' : `BATTLE ${battleCount}`}</span>
                            : canConjureMagic ? <span className="text-pink-400 flex items-center gap-1 text-[11px]"><Icon name="fairy-wand" scale={1.2} tintColor="#f472b6" /> CONJURE</span>
                                : <span className="text-red-400">ENGAGE</span>}
                </div>
            </button>
        </div>
    );
}
