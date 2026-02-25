import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
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

function EnemyColumn({ name, hp, maxHp, atk, lvl, type, isVisible, animStatus }: EnemyColumnProps) {
    if (!isVisible) return null;
    const hasType = type.trim() !== '' && type !== '---';

    return (
        <motion.div
            className="w-full flex items-center justify-between px-2 py-1.5 bg-zinc-950/60 rounded-lg border border-zinc-800/80 shrink-0 shadow-lg min-h-0"
            initial={{ opacity: 1, scale: 0.95 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Left side: Icon + Type */}
            <div className="flex flex-col items-center justify-center shrink-0 w-12 sm:w-14">
                <motion.div
                    animate={animStatus}
                    variants={enemyIconVariants}
                    initial="idle"
                    className="relative flex items-center justify-center h-8 sm:h-10"
                >
                    <Icon name={name} scale={2.2} tintColor={ICON_THEME[name]} />
                </motion.div>
                {hasType && (
                    <span className="text-zinc-500 uppercase tracking-widest leading-none mt-1 sm:mt-1.5 text-[8px] sm:text-[9px] text-center font-bold">
                        {type}
                    </span>
                )}
            </div>

            {/* Right side: Stats */}
            <div className="flex flex-col flex-1 pl-2 justify-center min-w-0">
                <div className="text-zinc-300 capitalize mb-0.5 border-b border-zinc-800/50 pb-0.5 shrink-0" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                    <span className="font-semibold whitespace-nowrap block truncate">{name.replace('-', ' ')}</span>
                </div>

                <div className="flex items-center justify-between w-full text-[9px] sm:text-[10px] tracking-widest mb-0.5 shrink-0">
                    <span className="font-semibold text-zinc-500">HP</span>
                    <motion.span animate={animStatus === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="font-bold text-red-400 whitespace-nowrap">
                        {hp} / {maxHp}
                    </motion.span>
                </div>

                <div className="flex items-center justify-between w-full text-[9px] sm:text-[10px] tracking-widest mb-0.5 shrink-0">
                    <span className="font-semibold text-zinc-500">ATK</span>
                    <span className="font-bold text-orange-400 whitespace-nowrap">{atk}</span>
                </div>

                <div className="flex items-center justify-between w-full text-[9px] sm:text-[10px] tracking-widest shrink-0">
                    <span className="font-semibold text-zinc-500">LVL</span>
                    <span className="font-bold text-blue-400 whitespace-nowrap">{lvl}</span>
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
    sliderResetKey: number;
    onEngage: () => void;
}

export function EnemyPanel({ enemy1Anim, enemy2Anim, isBattleRunning, isPostBattleScreen, sliderResetKey, onEngage }: EnemyPanelProps) {
    const { enemy1, enemy2, battleCount, playerHp, conjureMagicUsed } = useGameStore();
    const hasTwoFairyWands = useGameStore(selectHasTwoFairyWands);
    const canConjureMagic = hasTwoFairyWands && !conjureMagicUsed;
    const isDisabled = playerHp === 0 || battleCount > GAME_CONSTANTS.MAX_BATTLES;

    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const x = useMotionValue(0);

    useEffect(() => { x.set(0); }, [isBattleRunning, battleCount, sliderResetKey, x]);

    useEffect(() => {
        if (containerRef.current) setSliderWidth(containerRef.current.offsetWidth);
        const onResize = () => { if (containerRef.current) setSliderWidth(containerRef.current.offsetWidth); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const knobSize = 44;
    const maxDrag = Math.max(0, sliderWidth - knobSize);
    const showBattleState = isBattleRunning || isDisabled;

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0" style={{ padding: 'var(--gap)' }}>
            {/* Enemy stack */}
            <div className="flex-1 flex items-stretch justify-center min-h-0 pb-1.5 mt-0.5">
                {isPostBattleScreen ? (
                    <div className="w-full flex items-center justify-center text-zinc-300 uppercase tracking-[0.15em] font-semibold text-center px-4">
                        placeholder text
                    </div>
                ) : (
                    <div className="w-full flex flex-col justify-center gap-1.5 px-1 max-w-[14rem] mx-auto h-full min-h-0">
                        <AnimatePresence mode="wait">
                            {enemy1.isVisible && <EnemyColumn key="e1" {...enemy1} animStatus={enemy1Anim} />}
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                            {enemy2.isVisible && <EnemyColumn key="e2" {...enemy2} animStatus={enemy2Anim} />}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Slide-to-engage */}
            <div className="shrink-0 flex justify-center w-full">
                <div
                    ref={containerRef}
                    className={cn(
                        'relative overflow-hidden w-full rounded-lg shadow-inner flex items-center transition-all duration-300',
                        isPostBattleScreen ? 'bg-zinc-950/80 border border-zinc-700/80'
                            : showBattleState ? 'bg-red-950/40 border border-red-900/50 pointer-events-none'
                                : canConjureMagic ? 'bg-zinc-950 border border-pink-800/50'
                                    : 'bg-zinc-950 border border-zinc-700/80',
                        isDisabled && 'opacity-50 grayscale'
                    )}
                    style={{ height: 'var(--slider-h)', maxWidth: 'var(--enemy-slider-max-w)' }}
                >
                    {isPostBattleScreen && (
                        <button
                            type="button"
                            onClick={onEngage}
                            className="absolute inset-0 flex items-center justify-center uppercase tracking-[0.2em] font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                            style={{ fontSize: 'var(--text-xs)' }}
                        >
                            EXIT
                        </button>
                    )}

                    <AnimatePresence mode="popLayout">
                        {isPostBattleScreen ? null : showBattleState ? (
                            <motion.span key="battle-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center text-red-400 tracking-[0.35em] font-black uppercase pointer-events-none select-none drop-shadow-md"
                                style={{ fontSize: 'var(--text-sm)' }}
                            >
                                {battleCount === 4 || battleCount === 8 ? 'BOSS BATTLE' : battleCount > 8 ? 'VICTORY' : `BATTLE ${battleCount}`}
                            </motion.span>
                        ) : (
                            <motion.div key="begin-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-end pr-5 pointer-events-none select-none"
                            >
                                <span className="tracking-[0.15em] font-bold uppercase leading-tight text-right w-full text-zinc-400 drop-shadow-lg" style={{ fontSize: 'var(--text-xs)' }}>
                                    {canConjureMagic ? 'CONJURE MAGIC' : 'START BATTLE'}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isPostBattleScreen && !showBattleState && (
                        <motion.div className={cn('absolute left-0 top-0 bottom-0 pointer-events-none', canConjureMagic ? 'bg-pink-500/20' : 'bg-red-600/10')} style={{ width: x }} />
                    )}

                    {!isPostBattleScreen && !showBattleState && (
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: maxDrag }}
                            dragElastic={0}
                            style={{ x, width: knobSize, height: '100%' }}
                            onDragEnd={(_e, info) => {
                                if (info.offset.x >= maxDrag - 20) onEngage();
                                animate(x, 0, { type: 'spring', stiffness: 400, damping: 25 });
                            }}
                            className={cn(
                                'flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10 transition-colors shrink-0 touch-none rounded-md m-0.5 shadow-md',
                                canConjureMagic ? 'bg-pink-600 border border-pink-400 hover:bg-pink-500' : 'bg-red-700/90 border border-red-500 hover:bg-red-600',
                                'h-[calc(100%-4px)]'
                            )}
                        >
                            {canConjureMagic ? (
                                <Icon name="fairy-wand" scale={1.5} tintColor="#fff" className="pointer-events-none" />
                            ) : (
                                <i className="ra ra-sword text-lg text-red-100 pointer-events-none drop-shadow" />
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
