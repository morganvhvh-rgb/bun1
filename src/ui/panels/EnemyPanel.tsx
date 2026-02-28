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
            className="absolute inset-0 w-full h-full flex flex-col z-10 overflow-hidden surface-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-0" />

            {/* Header: Avatar + Title */}
            <div className="flex items-center gap-2.5 p-1.5 sm:p-2 border-b border-white/5 bg-black/20 shrink-0 z-10">
                <div className="relative shrink-0 flex items-center justify-center w-8 h-8">
                    <motion.div animate={animStatus} variants={enemyIconVariants} initial="idle" className="relative z-20 drop-shadow-md">
                        <Icon name={name} scale={2.0} tintColor={ICON_THEME[name]} />
                    </motion.div>
                </div>
                <div className="flex flex-col min-w-0 justify-center">
                    <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest leading-none truncate w-full text-zinc-100" title={name.replace('-', ' ')}>
                        {name.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none text-emerald-400 shrink-0">LVL {lvl}</span>
                        {hasType && (
                            <>
                                <span className="text-[9px] text-zinc-600 shrink-0 mb-0.5">•</span>
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none text-zinc-400 truncate">{type}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats List */}
            <div className="flex-1 flex flex-col py-1 px-2.5 sm:px-3 justify-center z-10 min-h-0 bg-black/10" style={{ fontFamily: 'var(--font-mono)' }}>
                <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-white/5 last:border-0">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>HP</span>
                    <motion.span animate={animStatus === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[11px] sm:text-[12px] font-bold text-red-400 tracking-wider">
                        {hp} / {maxHp}
                    </motion.span>
                </div>
                <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-white/5 last:border-0">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>ATK</span>
                    <span className="text-[12px] sm:text-[13px] font-bold text-orange-400">{atk}</span>
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
                        <div className="w-full h-[86px] sm:h-[96px] shrink-0 relative flex z-10">
                            <AnimatePresence>
                                {enemy1.isVisible && <EnemyCard key="e1" {...enemy1} animStatus={enemy1Anim} />}
                            </AnimatePresence>
                        </div>
                        <div className="w-full h-[86px] sm:h-[96px] shrink-0 relative flex z-10">
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
                disabled={(!canConjureMagic && isDisabled) || (isBattleRunning && !isPostBattleScreen)}
                className={cn(
                    "relative w-full h-[46px] sm:h-[50px] shrink-0 mt-auto overflow-hidden active:opacity-50 touch-manipulation z-20 rounded-xl font-bold tracking-[0.1em]",
                    isPostBattleScreen ? "bg-white text-black shadow-md border-b-2 border-zinc-200"
                        : showBattleState ? "bg-zinc-800/40 text-zinc-500 cursor-not-allowed border border-white/5"
                            : canConjureMagic ? "bg-zinc-900 border border-white/10 shadow-[0_2px_8px_rgba(244,114,182,0.15)]"
                                : "bg-red-950 text-red-100 border border-red-900/50 shadow-sm border-b-2 border-b-red-950/80"
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
