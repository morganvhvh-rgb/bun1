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
            className="w-full flex items-center justify-between p-2 mt-2 border border-zinc-600 relative shrink-0 bg-black"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            {/* Avatar block */}
            <div className="relative shrink-0 flex flex-col items-center ml-1">
                <motion.div animate={animStatus} variants={enemyIconVariants} initial="idle" className="relative z-10 p-2 sm:p-2.5 border border-zinc-600">
                    <Icon name={name} scale={2} tintColor={ICON_THEME[name]} />
                </motion.div>
                {hasType && (
                    <span className="absolute -bottom-2 bg-black border border-zinc-600 text-[8px] font-bold uppercase px-1.5 py-0.5 z-20 tracking-widest leading-none">
                        {type}
                    </span>
                )}
            </div>

            {/* Stats block */}
            <div className="flex-1 flex flex-col justify-center ml-3 min-w-0 z-10 relative">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest truncate max-w-[80px]">
                        {name.replace('-', ' ')}
                    </span>
                    <span className="text-[9px] font-bold border border-zinc-600 px-1 py-0.5 leading-none shrink-0 tracking-widest text-blue-500">
                        LVL {lvl}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-1 w-full">
                    {/* HP Section */}
                    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                        <div className="flex justify-between items-center mt-0.5 w-full border border-zinc-600 px-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider">HP</span>
                            <motion.span animate={animStatus === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[9px] font-bold tracking-wider text-red-500">
                                {hp}/{maxHp}
                            </motion.span>
                        </div>
                    </div>
                </div>

                <div className="absolute right-0 bottom-[-2px] text-[10px] font-bold flex items-center gap-1 border border-zinc-600 px-1.5 py-0.5 bg-black text-orange-500">
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
        <div className="flex-1 flex flex-col relative min-h-0 w-full p-2 sm:p-3 items-center justify-between z-10 border-l border-zinc-600 bg-black">
            {/* Enemies list */}
            <div className="w-full flex-1 flex flex-col justify-start items-center gap-1 overflow-hidden">
                {isPostBattleScreen ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold border border-zinc-600 px-3 py-1.5 bg-black">
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
                        "relative w-full overflow-hidden active:opacity-50 touch-manipulation z-20 border border-zinc-600",
                        isPostBattleScreen ? "bg-white text-black"
                            : showBattleState ? "bg-black opacity-50 cursor-not-allowed"
                                : canConjureMagic ? "bg-black"
                                    : "bg-black text-white"
                    )}
                    style={{ height: 'var(--slider-h)' }}
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
