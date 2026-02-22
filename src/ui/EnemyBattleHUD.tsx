import { motion, AnimatePresence, type Variants, useMotionValue, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { ICON_THEME } from '@/lib/constants';
import type { IconName } from '@/types/game';

interface EnemyProps {
    name: IconName;
    hp: number;
    maxHp: number;
    atk: number;
    lvl: number;
    isVisible: boolean;
    animStatus: 'idle' | 'attack' | 'hurt';
}

interface EnemyBattleHUDProps {
    enemy1: EnemyProps;
    enemy2: EnemyProps;
    isBattleRunning: boolean;
    battleCount: number;
    isDisabled?: boolean;
    onEngage: () => void;
}

const enemyIconVariants: Variants = {
    idle: { scale: 1, x: 0, y: 0 },
    attack: { scale: 1.3, x: -20, y: 10, transition: { duration: 0.2, ease: "easeOut" } },
    hurt: { x: [-5, 5, -5, 5, 0], scale: [1, 0.9, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"], transition: { duration: 0.4 } }
};

const hpVariants: Variants = {
    idle: { color: '#d4d4d8', scale: 1 },
    hurt: { color: '#ef4444', scale: [1, 1.5, 1], transition: { duration: 0.4 } }
};

function EnemyDisplay({ enemy }: { enemy: EnemyProps }) {
    if (!enemy.isVisible) return null;
    return (
        <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
        >
            <motion.div animate={enemy.animStatus} variants={enemyIconVariants} initial="idle" className="z-10 relative">
                <Icon name={enemy.name} scale={4} tintColor={ICON_THEME[enemy.name]} />
            </motion.div>
            <div className="flex flex-col w-24 sm:w-28 px-1 text-xs tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium gap-1.5">
                <div className="flex justify-between items-center"><span>Lvl</span> <span className="text-zinc-300">{enemy.lvl}</span></div>
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
            </div>
        </motion.div>
    );
}

export function EnemyBattleHUD({ enemy1, enemy2, isBattleRunning, battleCount, isDisabled, onEngage }: EnemyBattleHUDProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const x = useMotionValue(0);

    useEffect(() => {
        if (!isBattleRunning) {
            x.set(0);
        }
    }, [isBattleRunning, battleCount, x]);

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

    const knobWidth = 48; // h-12 w-12 is 48px
    const maxDrag = Math.max(0, sliderWidth - knobWidth);
    const showBattleState = isBattleRunning || isDisabled;

    return (
        <div className="flex-1 flex items-start justify-center gap-3 sm:gap-6 md:gap-12 relative pt-4 px-2 sm:px-3 md:px-0">
            <div className="w-24 sm:w-28 flex flex-col items-center">
                <AnimatePresence>
                    {enemy1.isVisible && <EnemyDisplay enemy={enemy1} />}
                </AnimatePresence>
            </div>
            <div className="w-24 sm:w-28 flex flex-col items-center">
                <AnimatePresence>
                    {enemy2.isVisible && <EnemyDisplay enemy={enemy2} />}
                </AnimatePresence>
            </div>

            {/* Action Button */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
                <div
                    ref={containerRef}
                    className={cn(
                        "relative overflow-hidden w-full max-w-xs h-12 rounded-md shadow-inner flex items-center transition-all duration-300",
                        showBattleState
                            ? "bg-red-950/80 border border-red-900 pointer-events-none"
                            : "bg-zinc-900 border border-zinc-700",
                        isDisabled && "opacity-50 grayscale"
                    )}
                >
                    <AnimatePresence mode="popLayout">
                        {showBattleState ? (
                            <motion.span
                                key="battle-text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center text-red-500 text-sm tracking-[0.35em] font-black uppercase pointer-events-none select-none drop-shadow-md"
                            >
                                {battleCount === 4 ? "BOSS BATTLE" : battleCount > 4 ? "VICTORY" : `BATTLE ${battleCount}`}
                            </motion.span>
                        ) : (
                            <motion.div
                                key="begin-text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none select-none"
                            >
                                <span className="text-zinc-500 text-xs tracking-[0.2em] font-semibold uppercase leading-tight text-right w-full">START BATTLE</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!showBattleState && (
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-red-500/20 pointer-events-none"
                            style={{ width: x }}
                        />
                    )}

                    {!showBattleState && (
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: maxDrag }}
                            dragElastic={0}
                            style={{ x }}
                            onDragEnd={(_e, info) => {
                                if (info.offset.x >= maxDrag - 20) {
                                    onEngage();
                                } else {
                                    animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
                                }
                            }}
                            className="w-12 h-12 bg-red-600 border border-red-500 flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10 hover:bg-red-500 transition-colors shrink-0 touch-none rounded-sm"
                        >
                            <i className="ra ra-sword text-xl text-white pointer-events-none" />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
