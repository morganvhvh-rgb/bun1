
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
        <div className="flex-1 flex flex-col relative overflow-hidden w-full max-w-[50%] h-full py-2 pr-1.5 pl-0 sm:py-3 sm:pr-2 sm:pl-0 items-center justify-between z-20">
            {/* Avatar Section */}
            <div className="w-full flex-1 flex flex-col justify-center items-center overflow-visible z-20 py-1 min-h-0">
                <div className="relative flex flex-col items-center shrink-0 z-20">
                    <div className="relative z-10 p-2 sm:p-2.5 surface-panel shadow-lg border-white/10">
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
            <div className="flex flex-col gap-1.5 w-full max-w-[96%] shrink-0 mx-auto mt-auto pb-1 pt-2 sm:pt-3">
                {/* Row 1: HP & LVL */}
                <div className="flex justify-between items-center w-full px-2.5 py-1 surface-panel">
                    <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)' }}>
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>HP</span>
                        <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[12px] sm:text-[13px] font-bold text-red-400 tracking-wider">
                            {playerHp} / {playerMaxHp}
                        </motion.span>
                    </div>
                    <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)' }}>
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>LVL</span>
                        <span className="text-[12px] sm:text-[13px] font-bold text-emerald-400 tracking-wider">
                            {moves}
                        </span>
                    </div>
                </div>

                {/* Row 2: ATK, MGC, GER */}
                <div className="flex items-center justify-between w-full px-2.5 py-1 surface-panel" style={{ fontFamily: 'var(--font-mono)' }}>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-zinc-500 mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>ATK</span>
                        <span className="text-[15px] sm:text-base font-bold leading-none text-orange-400">
                            {playerBaseAtk}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-zinc-500 mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>MGC</span>
                        <span className="text-[15px] sm:text-base font-bold leading-none text-pink-400">
                            {playerMagic}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-zinc-500 mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>GER</span>
                        <span className="text-[15px] sm:text-base font-bold leading-none text-blue-400">
                            {playerGear}
                        </span>
                    </div>
                </div>

                {/* Row 3: GOLD */}
                <div className="flex items-center justify-center w-full h-[46px] sm:h-[50px] px-2 py-1 surface-panel relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-2.5 z-10" style={{ fontFamily: 'var(--font-mono)' }}>
                        <span className="text-[13px] sm:text-[14px] font-bold tracking-widest text-zinc-400 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>GOLD</span>
                        <span className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-wider">
                            {gold}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
