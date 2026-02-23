import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { ICON_THEME } from '@/lib/constants';
import { enemyIconVariants, hpVariants } from './animations';
import type { IconName } from '@/types/game';

interface EnemyProps {
    name: IconName;
    hp: number;
    maxHp: number;
    atk: number;
    lvl: number;
    type: string;
    isVisible: boolean;
    animStatus: 'idle' | 'attack' | 'hurt';
}

interface EnemyBattleHUDProps {
    enemy1: EnemyProps;
    enemy2: EnemyProps;
    isBattleRunning: boolean;
    battleCount: number;
    isDisabled?: boolean;
    canConjureMagic?: boolean;
    sliderResetKey?: number;
    onEngage: () => void;
}

/** Each enemy column mirrors the hero panel layout:
 *  icon pinned at top, stats flex-grow with justify-evenly to align
 *  with the hero's stat rows, bottom space left for the shared slider. */
function EnemyColumn({ enemy }: { enemy: EnemyProps }) {
    if (!enemy.isVisible) return null;
    return (
        <motion.div
            className="flex flex-col items-center h-full"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
            {/* Icon — pinned at top, same position as hero icon */}
            <div className="shrink-0">
                <motion.div animate={enemy.animStatus} variants={enemyIconVariants} initial="idle" className="z-10 relative">
                    <Icon name={enemy.name} scale={4} tintColor={ICON_THEME[enemy.name]} />
                </motion.div>
            </div>

            {/* Stats — justify-evenly with 2 invisible spacers to match hero's 6 rows */}
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
                        animate={enemy.animStatus === 'hurt' ? "hurt" : "idle"}
                        variants={hpVariants}
                        className="text-zinc-300 inline-block origin-right"
                    >
                        {enemy.hp}/{enemy.maxHp}
                    </motion.span>
                </div>
                <div className="flex justify-between items-center"><span>ATK</span> <span className="text-zinc-300">{enemy.atk}</span></div>
                <div className="flex justify-between items-center"><span>LVL</span> <span className="text-zinc-300">{enemy.lvl}</span></div>
                <div className="flex justify-between items-center"><span>Type</span> <span className="text-zinc-300">{enemy.type}</span></div>
                {/* Invisible spacers — match hero panel's 6 rows so justify-evenly aligns */}
                <div aria-hidden className="invisible"><span>&nbsp;</span></div>
                <div aria-hidden className="invisible"><span>&nbsp;</span></div>
            </div>
        </motion.div>
    );
}

export function EnemyBattleHUD({ enemy1, enemy2, isBattleRunning, battleCount, isDisabled, canConjureMagic, sliderResetKey, onEngage }: EnemyBattleHUDProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const x = useMotionValue(0);

    useEffect(() => {
        x.set(0);
    }, [isBattleRunning, battleCount, sliderResetKey, x]);

    useEffect(() => {
        if (containerRef.current) {
            setSliderWidth(containerRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (containerRef.current) {
                setSliderWidth(containerRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const knobSize = 44;
    const maxDrag = Math.max(0, sliderWidth - knobSize);
    const showBattleState = isBattleRunning || isDisabled;

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0" style={{ padding: 'var(--gap)' }}>
            {/* Enemy columns — flex-1 fills the space above the slider */}
            <div className="flex-1 flex items-stretch justify-center min-h-0"
                style={{ gap: 'clamp(6px, 3vw, 1.5rem)' }}
            >
                <div className="flex flex-col items-center min-w-0"
                    style={{ width: 'clamp(5.5rem, 34%, 8rem)' }}
                >
                    <AnimatePresence>
                        {enemy1.isVisible && <EnemyColumn enemy={enemy1} />}
                    </AnimatePresence>
                </div>
                <div className="flex flex-col items-center min-w-0"
                    style={{ width: 'clamp(5rem, 30%, 7rem)' }}
                >
                    <AnimatePresence>
                        {enemy2.isVisible && <EnemyColumn enemy={enemy2} />}
                    </AnimatePresence>
                </div>
            </div>

            {/* Slide-to-engage — same height as hero Reset button */}
            <div className="shrink-0 flex justify-center w-full">
                <div
                    ref={containerRef}
                    className={cn(
                        "relative overflow-hidden w-full rounded-md shadow-inner flex items-center transition-all duration-300",
                        showBattleState
                            ? "bg-red-950/80 border border-red-900 pointer-events-none"
                            : canConjureMagic
                                ? "bg-zinc-900 border border-pink-800/50"
                                : "bg-zinc-900 border border-zinc-700",
                        isDisabled && "opacity-50 grayscale"
                    )}
                    style={{
                        height: 'clamp(1.5rem, 4dvh, 2rem)',
                        maxWidth: '18rem',
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {showBattleState ? (
                            <motion.span
                                key="battle-text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center text-red-500 tracking-[0.35em] font-black uppercase pointer-events-none select-none drop-shadow-md"
                                style={{ fontSize: 'clamp(10px, 2.5vw, 13px)' }}
                            >
                                {battleCount === 4 || battleCount === 8 ? "BOSS BATTLE" : battleCount > 8 ? "VICTORY" : `BATTLE ${battleCount}`}
                            </motion.span>
                        ) : (
                            <motion.div
                                key="begin-text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none select-none"
                            >
                                <span className={cn("tracking-[0.15em] font-semibold uppercase leading-tight text-right w-full text-zinc-500")}
                                    style={{ fontSize: 'clamp(8px, 2.2vw, 11px)' }}
                                >
                                    {canConjureMagic ? "CONJURE MAGIC" : "START BATTLE"}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!showBattleState && (
                        <motion.div
                            className={cn("absolute left-0 top-0 bottom-0 pointer-events-none", canConjureMagic ? "bg-pink-500/20" : "bg-red-500/20")}
                            style={{ width: x }}
                        />
                    )}

                    {!showBattleState && (
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: maxDrag }}
                            dragElastic={0}
                            style={{ x, width: knobSize, height: '100%' }}
                            onDragEnd={(_e, info) => {
                                if (info.offset.x >= maxDrag - 20) {
                                    onEngage();
                                }
                                animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
                            }}
                            className={cn(
                                "border flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10 transition-colors shrink-0 touch-none rounded-sm",
                                canConjureMagic
                                    ? "bg-pink-600 border-pink-500 hover:bg-pink-500"
                                    : "bg-red-600 border-red-500 hover:bg-red-500"
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
