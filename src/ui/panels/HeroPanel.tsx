
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectTotalAttack } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { hpVariants, playerIconVariants } from '../animations';

interface HeroPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    onCharacterClick: () => void;
}

function StatBadge({ label, value, colorClass }: { label: string, value: string | number, colorClass: string, flash?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-0.5 px-1 border border-zinc-800 min-w-[3.25rem]">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-0">{label}</span>
            <span className={cn("text-xs sm:text-sm font-bold leading-none", colorClass)}>
                {value}
            </span>
        </div>
    );
}

export function HeroPanel({ playerAnim, isBattleRunning, onCharacterClick }: HeroPanelProps) {
    const { playerHp, playerMaxHp, playerMagic, playerGear, gold, moves } = useGameStore();
    const playerBaseAtk = useGameStore(selectTotalAttack);

    return (
        <div className="flex-1 flex flex-col relative min-h-0 w-full max-w-[50%] pb-2 pr-1.5 pl-0 pt-10 sm:pb-3 sm:pr-2 sm:pl-0 sm:pt-10 items-center justify-center gap-3 z-20">
            {/* Avatar Section */}
            <div className="relative flex flex-col items-center shrink-0 z-20">
                <div className="relative z-10 p-2 sm:p-2.5 border border-zinc-800 bg-black">
                    <motion.div
                        animate={playerAnim}
                        variants={playerIconVariants}
                        initial="idle"
                        className="relative z-20"
                    >
                        <Icon
                            name="hood"
                            scale={3}
                            tintColor="#c084fc"
                            className={cn('cursor-pointer hover:opacity-80 active:opacity-50', isBattleRunning && 'pointer-events-none')}
                            onClick={onCharacterClick}
                        />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {moves >= 10 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: -10 }}
                            className="absolute -bottom-2 -right-2 text-black font-bold text-sm z-20 flex items-center justify-center w-6 h-6 bg-white border border-black"
                        >
                            <i className="ra ra-muscle-up" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Unified 2x3 Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 w-full shrink-0 mx-auto mb-1">
                {/* Row 1 */}
                <div className="flex justify-between items-center w-full px-1.5 py-0.5 border border-zinc-800">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">HP</span>
                    <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[10px] sm:text-[11px] font-bold text-red-500 tracking-wider">
                        {playerHp} / {playerMaxHp}
                    </motion.span>
                </div>
                <div className="flex justify-between items-center w-full px-1.5 py-0.5 border border-zinc-800">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">LVL</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-green-500 tracking-wider">
                        {moves}
                    </span>
                </div>

                {/* Row 2 */}
                <StatBadge label="ATK" value={playerBaseAtk} colorClass="text-orange-500" />
                <StatBadge label="GER" value={playerGear} colorClass="text-blue-500" />

                {/* Row 3 */}
                <StatBadge label="MGC" value={playerMagic} colorClass="text-pink-500" />
                <StatBadge label="GLD" value={gold} colorClass="text-yellow-500" />
            </div>
        </div>
    );
}
