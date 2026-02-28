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
            className="w-full h-[96px] sm:h-[106px] p-2 sm:p-2.5 border border-zinc-800 relative shrink-0 bg-black flex z-10"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            {/* Avatar block */}
            <div className="relative shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 z-20">
                <motion.div animate={animStatus} variants={enemyIconVariants} initial="idle" className="relative z-20">
                    <Icon name={name} scale={3.0} tintColor={ICON_THEME[name]} />
                </motion.div>
                {hasType && (
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-zinc-400 mt-1.5 text-center w-full">
                        {type}
                    </span>
                )}
            </div>

            {/* Stats block */}
            <div className="flex-1 flex flex-col justify-between gap-1 ml-1 min-w-0 z-10 pl-1 sm:pl-2">
                <div className="flex items-start justify-between gap-1 w-full min-h-0">
                    <span 
                        className="text-sm sm:text-[15px] font-bold uppercase tracking-widest leading-[1.15] line-clamp-2"
                        title={name.replace('-', ' ')}
                    >
                        {name.replace('-', ' ')}
                    </span>
                </div>

                <div className="flex flex-col gap-1 sm:gap-1.5 w-full shrink-0">
                    <div className="flex justify-between items-center text-[11px] sm:text-[12px] font-bold tracking-wider leading-none">
                        <span className="text-zinc-500 uppercase">HP</span>
                        <motion.span animate={animStatus === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-red-500">
                            {hp} / {maxHp}
                        </motion.span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] sm:text-[12px] font-bold tracking-wider leading-none">
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500 uppercase">ATK</span>
                            <span className="text-orange-500">{atk}</span>
                        </div>
                        <span className="text-green-500 font-bold tracking-widest shrink-0 whitespace-nowrap">
                            LVL {lvl}
                        </span>
                    </div>
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
        <div className="flex-1 flex flex-col relative min-h-0 w-full py-2 pl-1.5 pr-0 sm:py-3 sm:pl-2 sm:pr-0 items-center justify-between z-10 border-l border-zinc-800 bg-black">
            {/* Enemies list */}
            <div className="w-full flex-1 flex flex-col justify-center items-center overflow-visible py-1 min-h-0">
                {isPostBattleScreen ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold border border-zinc-800 px-3 py-1.5 bg-black">
                            Battle Cleared
                        </motion.div>
                    </div>
                ) : (
                    <>
                        <div className="w-full flex-1 flex items-end justify-center min-h-0 pb-1 z-20">
                            <AnimatePresence>
                                {enemy1.isVisible && <EnemyCard key="e1" {...enemy1} animStatus={enemy1Anim} />}
                            </AnimatePresence>
                        </div>
                        <div className="w-full flex-1 flex items-start justify-center min-h-0 pt-1 z-10">
                            <AnimatePresence>
                                {enemy2.isVisible && <EnemyCard key="e2" {...enemy2} animStatus={enemy2Anim} />}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>

            {/* Engage Button */}
            <div className="w-full shrink-0 flex justify-center pb-1 pt-3">
                <button
                    onClick={onEngage}
                    disabled={(!canConjureMagic && isDisabled) || (isBattleRunning && !isPostBattleScreen)}
                    className={cn(
                        "relative w-full h-[46px] sm:h-[50px] overflow-hidden active:opacity-50 touch-manipulation z-20 border border-zinc-800",
                        isPostBattleScreen ? "bg-white text-black"
                            : showBattleState ? "bg-black opacity-50 cursor-not-allowed"
                                : canConjureMagic ? "bg-black"
                                    : "bg-black text-white"
                    )}
                >
                    <div className="relative z-10 w-full h-full flex items-center justify-center tracking-[0.2em] font-bold uppercase text-[11px] sm:text-xs">
                        {isPostBattleScreen ? "NEXT ROUND"
                            : showBattleState ? <span className="text-red-500">{battleCount === 4 || battleCount === 8 ? 'BOSS BATTLE' : battleCount > 8 ? 'VICTORY' : `BATTLE ${battleCount}`}</span>
                                : canConjureMagic ? <span className="text-pink-400 flex items-center gap-1"><Icon name="fairy-wand" scale={1.2} tintColor="#f472b6" /> CONJURE</span>
                                    : <span className="text-red-500 flex items-center gap-1"><i className="ra ra-sword text-sm" /> ENGAGE</span>}
                    </div>
                </button>
            </div>
        </div>
    );
}
