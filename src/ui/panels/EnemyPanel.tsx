import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGameStore, selectHasTwoFairyWands } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { StatLine } from '../shared/StatLine';
import { ICON_THEME, GAME_CONSTANTS } from '@/lib/constants';
import { enemyIconVariants } from '../animations';
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

const ENEMY_ICON_FRAME_STYLE = {
    width: 'var(--enemy-icon-frame-size)',
    height: 'var(--enemy-icon-frame-size)',
};

const ENEMY_STATS_COLUMN_STYLE = {
    width: 'var(--enemy-stat-col-width)',
    maxWidth: 'var(--enemy-stat-col-max-w)',
};

const ENEMY_STACK_COLUMN_STYLE = {
    maxWidth: 'var(--enemy-stack-max-w)',
};

function EnemyColumn({ name, hp, maxHp, atk, lvl, type, isVisible, animStatus }: EnemyColumnProps) {
    if (!isVisible) return null;
    const hasType = type.trim() !== '' && type !== '---';

    return (
        <motion.div
            className="h-full w-full px-1 flex flex-col items-center justify-center min-h-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
            <div
                className="relative shrink-0 mt-0.5 flex items-end justify-center"
                style={ENEMY_ICON_FRAME_STYLE}
            >
                <motion.div
                    animate={animStatus}
                    variants={enemyIconVariants}
                    initial="idle"
                    className="z-10 relative flex items-center justify-center"
                    style={ENEMY_ICON_FRAME_STYLE}
                >
                    <Icon name={name} scale={4} tintColor={ICON_THEME[name]} />
                </motion.div>
                {hasType && (
                    <span
                        className="absolute text-zinc-300 uppercase leading-none whitespace-nowrap pointer-events-none"
                        style={{
                            left: 'calc(100% + var(--enemy-type-offset-x))',
                            bottom: 'var(--enemy-type-offset-y)',
                            fontSize: 'var(--text-xs)',
                            letterSpacing: '0.06em',
                        }}
                    >
                        {type}
                    </span>
                )}
            </div>
            <div
                className="mt-1 flex flex-col w-full text-zinc-500 uppercase font-medium justify-center"
                style={{ fontSize: 'var(--text-sm)', letterSpacing: '0.08em', gap: 'var(--enemy-stat-row-gap)' }}
            >
                <div className="mx-auto" style={ENEMY_STATS_COLUMN_STYLE}>
                    <StatLine label="HP" value={`${hp}/${maxHp}`} flash={animStatus === 'hurt'} />
                </div>
                <div className="mx-auto flex items-center justify-center" style={{ ...ENEMY_STATS_COLUMN_STYLE, gap: '0.8rem' }}>
                    <div className="flex items-center" style={{ gap: '0.35em' }}>
                        <span>ATK</span>
                        <span className="text-zinc-300">{atk}</span>
                    </div>
                    <div className="flex items-center" style={{ gap: '0.35em' }}>
                        <span>LVL</span>
                        <span className="text-zinc-300">{lvl}</span>
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
            <div className="flex-1 flex items-stretch justify-center min-h-0 pb-1">
                {isPostBattleScreen ? (
                    <div className="w-full flex items-center justify-center text-zinc-300 uppercase tracking-[0.15em] font-semibold text-center px-4">
                        placeholder text
                    </div>
                ) : (
                    <div className="flex flex-col w-full min-h-0 items-center justify-center" style={{ gap: 'var(--gap)' }}>
                        <div className="flex-1 min-h-0 w-full" style={ENEMY_STACK_COLUMN_STYLE}>
                            <AnimatePresence mode="wait">{enemy1.isVisible && <EnemyColumn {...enemy1} animStatus={enemy1Anim} />}</AnimatePresence>
                        </div>
                        <div className="flex-1 min-h-0 w-full" style={ENEMY_STACK_COLUMN_STYLE}>
                            <AnimatePresence mode="wait">{enemy2.isVisible && <EnemyColumn {...enemy2} animStatus={enemy2Anim} />}</AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* Slide-to-engage */}
            <div className="shrink-0 flex justify-center w-full">
                <div
                    ref={containerRef}
                    className={cn(
                        'relative overflow-hidden w-full rounded-md shadow-inner flex items-center transition-all duration-300',
                        isPostBattleScreen ? 'bg-zinc-900 border border-zinc-700'
                            : showBattleState ? 'bg-red-950/80 border border-red-900 pointer-events-none'
                            : canConjureMagic ? 'bg-zinc-900 border border-pink-800/50'
                                : 'bg-zinc-900 border border-zinc-700',
                        isDisabled && 'opacity-50 grayscale'
                    )}
                    style={{ height: 'var(--slider-h)', maxWidth: 'var(--enemy-slider-max-w)' }}
                >
                    {isPostBattleScreen && (
                        <button
                            type="button"
                            onClick={onEngage}
                            className="absolute inset-0 flex items-center justify-center uppercase tracking-[0.2em] font-semibold text-zinc-200 hover:text-white transition-colors"
                            style={{ fontSize: 'var(--text-xs)' }}
                        >
                            EXIT
                        </button>
                    )}

                    <AnimatePresence mode="popLayout">
                        {isPostBattleScreen ? null : showBattleState ? (
                            <motion.span key="battle-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center text-red-500 tracking-[0.35em] font-black uppercase pointer-events-none select-none drop-shadow-md"
                                style={{ fontSize: 'var(--text-sm)' }}
                            >
                                {battleCount === 4 || battleCount === 8 ? 'BOSS BATTLE' : battleCount > 8 ? 'VICTORY' : `BATTLE ${battleCount}`}
                            </motion.span>
                        ) : (
                            <motion.div key="begin-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none select-none"
                            >
                                <span className="tracking-[0.15em] font-semibold uppercase leading-tight text-right w-full text-zinc-500" style={{ fontSize: 'var(--text-xs)' }}>
                                    {canConjureMagic ? 'CONJURE MAGIC' : 'START BATTLE'}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isPostBattleScreen && !showBattleState && (
                        <motion.div className={cn('absolute left-0 top-0 bottom-0 pointer-events-none', canConjureMagic ? 'bg-pink-500/20' : 'bg-red-500/20')} style={{ width: x }} />
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
                                'border flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10 transition-colors shrink-0 touch-none rounded-sm',
                                canConjureMagic ? 'bg-pink-600 border-pink-500 hover:bg-pink-500' : 'bg-red-600 border-red-500 hover:bg-red-500'
                            )}
                        >
                            {canConjureMagic ? (
                                <Icon name="fairy-wand" scale={1.5} tintColor="#fff" className="pointer-events-none" />
                            ) : (
                                <i className="ra ra-sword text-lg text-white pointer-events-none" />
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
