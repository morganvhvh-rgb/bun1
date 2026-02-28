
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectTotalAttack } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { ICON_THEME } from '@/lib/constants';
import { hpVariants, playerIconVariants } from '../animations';

interface HeroPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    onCharacterClick: () => void;
}


export function HeroPanel({ playerAnim, isBattleRunning, onCharacterClick }: HeroPanelProps) {
    const { playerHp, playerMaxHp, playerMagic, playerGear, gold, moves } = useGameStore();
    const playerBaseAtk = useGameStore(selectTotalAttack);

    return (
        <div className="flex-1 flex flex-col relative min-h-0 w-full max-w-[50%] pb-2 pr-1.5 pl-0 pt-10 sm:pb-3 sm:pr-2 sm:pl-0 sm:pt-10 items-center justify-between z-20">
            {/* Avatar Section */}
            <div className="w-full flex-1 flex flex-col justify-center items-center overflow-visible z-20 py-1">
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
                                scale={3.5}
                                tintColor={ICON_THEME['hood']}
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
            </div>

            {/* Unified Stats Grid */}
            <div className="flex flex-col gap-1.5 w-full shrink-0 mx-auto pb-1 pt-3">
                {/* Row 1: HP & LVL */}
                <div className="flex justify-between items-center w-full px-2 py-0.5 border border-zinc-800">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500">HP</span>
                        <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[11px] sm:text-[12px] font-bold text-red-500 tracking-wider">
                            {playerHp} / {playerMaxHp}
                        </motion.span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500">LVL</span>
                        <span className="text-[11px] sm:text-[12px] font-bold text-green-500 tracking-wider">
                            {moves}
                        </span>
                    </div>
                </div>

                {/* Row 2: ATK, MGC, GER */}
                <div className="flex items-center justify-between w-full px-2 py-0.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-zinc-500">ATK</span>
                        <span className="text-sm sm:text-base font-bold leading-none text-orange-500">
                            {playerBaseAtk}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-zinc-500">MGC</span>
                        <span className="text-sm sm:text-base font-bold leading-none text-pink-500">
                            {playerMagic}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-zinc-500">GER</span>
                        <span className="text-sm sm:text-base font-bold leading-none text-blue-500">
                            {playerGear}
                        </span>
                    </div>
                </div>

                {/* Row 3: GOLD */}
                <div className="flex items-center justify-center w-full h-[46px] sm:h-[50px] px-2 py-1 border border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <span className="text-sm sm:text-base font-bold tracking-widest text-zinc-500">GOLD</span>
                        <span className="text-xl sm:text-2xl font-bold text-yellow-500 tracking-wider">
                            {gold}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
