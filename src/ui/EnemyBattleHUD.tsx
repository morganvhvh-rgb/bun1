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

function EnemyDisplay({ enemy }: { enemy: EnemyProps }) {
    if (!enemy.isVisible) return null;
    return (
        <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            style={{ gap: 'var(--gap)' }}
        >
            <motion.div animate={enemy.animStatus} variants={enemyIconVariants} initial="idle" className="z-10 relative">
                <Icon name={enemy.name} scale={3.5} tintColor={ICON_THEME[enemy.name]} />
            </motion.div>
            <div
                className="flex flex-col w-full text-zinc-500 uppercase font-medium"
                style={{
                    fontSize: 'clamp(9px, 2.4vw, 11px)',
                    letterSpacing: '0.06em',
                    gap: 'clamp(2px, 0.5vw, 5px)',
                    padding: '0 2px',
                    width: 'clamp(5rem, calc(var(--cell) * 1.8), 7rem)',
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
                <div className="flex justify-between items-center"><span>Atk</span> <span className="text-zinc-300">{enemy.atk}</span></div>
                <div className="flex justify-between items-center"><span>Lvl</span> <span className="text-zinc-300">{enemy.lvl}</span></div>
                <div className="flex justify-between items-center"><span>Type</span> <span className="text-zinc-300">{enemy.type}</span></div>
            </div>
        </motion.div>
    );
}

export function EnemyBattleHUD({ enemy1, enemy2, isBattleRunning, battleCount, isDisabled, canConjureMagic, sliderResetKey, onEngage }: EnemyBattleHUDProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const x = useMotionValue(0);

    // Reset slider on battle state change OR external reset key
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
        <div
            className="flex-1 flex items-start justify-center relative"
            style={{
                gap: 'clamp(8px, 3vw, 2rem)',
                paddingTop: 'var(--gap)',
                paddingLeft: 'var(--gap)',
                paddingRight: 'var(--gap)',
            }}
        >
            {/* Enemy columns */}
            <div className="flex flex-col items-center" style={{ width: 'clamp(5rem, calc(var(--cell) * 1.8), 7rem)' }}>
                <AnimatePresence>
                    {enemy1.isVisible && <EnemyDisplay enemy={enemy1} />}
                </AnimatePresence>
            </div>
            <div className="flex flex-col items-center" style={{ width: 'clamp(5rem, calc(var(--cell) * 1.8), 7rem)' }}>
                <AnimatePresence>
                    {enemy2.isVisible && <EnemyDisplay enemy={enemy2} />}
                </AnimatePresence>
            </div>

            {/* Slide-to-engage button */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-full flex justify-center"
                style={{
                    bottom: 'var(--gap)',
                    padding: `0 var(--gap)`,
                }}
            >
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
                        height: 'clamp(2.5rem, 6dvh, 3rem)',
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
                                style={{ fontSize: 'clamp(11px, 2.8vw, 14px)' }}
                            >
                                {battleCount === 4 || battleCount === 8 ? "BOSS BATTLE" : battleCount > 8 ? "VICTORY" : `BATTLE ${battleCount}`}
                            </motion.span>
                        ) : (
                            <motion.div
                                key="begin-text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-end pr-5 pointer-events-none select-none"
                            >
                                <span className={cn("tracking-[0.15em] font-semibold uppercase leading-tight text-right w-full text-zinc-500")}
                                    style={{ fontSize: 'clamp(9px, 2.4vw, 12px)' }}
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
                            style={{ x, width: knobSize, height: knobSize }}
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
