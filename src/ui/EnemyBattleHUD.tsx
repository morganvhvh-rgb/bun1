import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
    engageProgress: number;
    onEngagePointerDown: () => void;
    onEngagePointerUpOrLeave: () => void;
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

export function EnemyBattleHUD({ enemy1, enemy2, isBattleRunning, engageProgress, onEngagePointerDown, onEngagePointerUpOrLeave }: EnemyBattleHUDProps) {
    return (
        <div className="flex-1 flex items-start justify-center gap-3 sm:gap-6 md:gap-12 relative pt-4 px-2 sm:px-3 md:px-0">
            <AnimatePresence>
                {enemy1.isVisible && <EnemyDisplay enemy={enemy1} />}
            </AnimatePresence>
            <AnimatePresence>
                {enemy2.isVisible && <EnemyDisplay enemy={enemy2} />}
            </AnimatePresence>

            {/* Action Button */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onPointerDown={onEngagePointerDown}
                    onPointerUp={onEngagePointerUpOrLeave}
                    onPointerLeave={onEngagePointerUpOrLeave}
                    onPointerCancel={onEngagePointerUpOrLeave}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onTouchStart={(e) => e.preventDefault()}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                    disabled={isBattleRunning}
                    className={cn(
                        "relative overflow-hidden w-full max-w-xs h-12 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md focus:outline-none transition-colors text-zinc-300 text-sm tracking-[0.35em] font-semibold uppercase flex items-center justify-center text-center leading-none whitespace-nowrap select-none touch-none",
                        isBattleRunning && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                    title="Attack"
                >
                    <div
                        className="absolute left-0 top-0 bottom-0 bg-red-500 transition-all duration-75 ease-linear pointer-events-none"
                        style={{ width: `${engageProgress}%` }}
                    />
                    <span className="relative z-10">ENGAGE</span>
                </motion.button>
            </div>
        </div>
    );
}
