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
    const hasType = type && type.trim() !== '' && type !== '---';

    return (
        <motion.div
            className="absolute inset-0 w-full h-full flex flex-col justify-between z-10 overflow-hidden surface-panel p-2 sm:p-3"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            {/* Top row: Avatar + Info */}
            <div className="flex-1 flex items-center min-h-0 min-w-0 w-full gap-2 sm:gap-3">
                {/* Left: Avatar */}
                <div className="shrink-0 flex items-center justify-center scale-[0.85] sm:scale-100 origin-center pl-1 sm:pl-2">
                    <motion.div animate={animStatus} variants={enemyIconVariants} initial="idle" className="relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] pointer-events-auto">
                        <Icon name={name} scale={3.2} tintColor={ICON_THEME[name]} />
                    </motion.div>
                </div>

                {/* Right: Info */}
                <div className="flex-1 flex flex-col min-w-0 justify-center h-full pt-0.5">
                    <div className="text-[12px] sm:text-[14px] font-bold uppercase leading-tight text-white drop-shadow-md truncate w-full">
                        {name.replace('-', ' ')}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 min-w-0 w-full">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-400 shrink-0">
                            LVL {lvl}
                        </span>
                        {hasType && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 truncate min-w-0">
                                {type}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom row: HP & ATK */}
            <div className="flex shrink-0 items-end justify-between w-full mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-white/5">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">HP</span>
                    <motion.span animate={animStatus === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[12px] sm:text-[14px] font-mono tracking-wider font-bold text-red-400 leading-none">
                        {hp}<span className="text-[10px] sm:text-[11px] text-red-400/60">/{maxHp}</span>
                    </motion.span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">ATK</span>
                    <span className="text-[12px] sm:text-[14px] font-mono tracking-wider font-bold text-orange-400 leading-none">{atk}</span>
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
    isAnimating: boolean;
    onEngage: () => void;
}

export function EnemyPanel({ enemy1Anim, enemy2Anim, isBattleRunning, isPostBattleScreen, isAnimating, onEngage }: EnemyPanelProps) {
    const { enemy1, enemy2, battleCount, playerHp, conjureMagicUsed } = useGameStore();
    const hasTwoFairyWands = useGameStore(selectHasTwoFairyWands);
    const canConjureMagic = hasTwoFairyWands && !conjureMagicUsed;
    const isDisabled = playerHp === 0 || battleCount > GAME_CONSTANTS.MAX_BATTLES;
    const showBattleState = isBattleRunning || isDisabled;

    return (
        <div className="flex-1 flex flex-col relative overflow-visible w-full h-full py-2 sm:py-3 z-10">
            {/* Enemies list */}
            <div className="w-full flex-1 flex flex-col justify-center items-center overflow-visible min-h-0 gap-2 sm:gap-3 mb-2 sm:mb-3">
                {isPostBattleScreen ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold px-3 py-1.5 surface-panel">
                            Battle Cleared
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

            {/* Engage Button */}
            <button
                onClick={onEngage}
                disabled={(!canConjureMagic && isDisabled) || (isBattleRunning && !isPostBattleScreen) || isAnimating}
                className={cn(
                    "relative w-full h-[46px] sm:h-[50px] shrink-0 mt-auto overflow-hidden active:opacity-50 touch-manipulation z-20 font-bold tracking-[0.1em] rounded-2xl",
                    isPostBattleScreen ? "bg-zinc-100 text-black shadow-none border border-transparent"
                        : showBattleState ? "bg-zinc-800/20 text-zinc-500 cursor-not-allowed border border-white/5"
                            : canConjureMagic ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}
            >
                <div className="relative z-10 w-full h-full flex items-center justify-center tracking-[0.2em] font-bold uppercase text-xs sm:text-sm">
                    {isPostBattleScreen ? "NEXT ROUND"
                        : showBattleState ? <span className="text-red-500 text-[11px] sm:text-xs">{battleCount === 4 || battleCount === 8 ? 'BOSS BATTLE' : battleCount > 8 ? 'VICTORY' : `BATTLE ${battleCount}`}</span>
                            : canConjureMagic ? <span className="text-pink-400 flex items-center gap-1 text-[11px] sm:text-xs"><Icon name="fairy-wand" scale={1.2} tintColor="#f472b6" /> CONJURE</span>
                                : <span className="text-red-400">ENGAGE</span>}
                </div>
            </button>
        </div>
    );
}
