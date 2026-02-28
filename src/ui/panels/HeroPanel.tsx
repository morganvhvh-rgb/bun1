
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
        <div className="flex-1 flex flex-col relative overflow-visible w-full h-full py-2 sm:py-3 z-20">
            {/* Profile Card Main Area */}
            <div className="w-full flex-1 flex flex-col surface-panel overflow-hidden z-20 min-h-0 mb-2 sm:mb-3">

                {/* Header: Avatar + Title */}
                <div className="flex items-center gap-2.5 p-2 sm:p-2.5 border-b border-white/5 bg-black/20 shrink-0">
                    <div className="relative shrink-0 flex items-center justify-center">
                        <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="relative z-20 drop-shadow-md">
                            <Icon name="hood" scale={2.5} tintColor={ICON_THEME['hood']} className={cn('cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200', isBattleRunning && 'pointer-events-none')} onClick={onCharacterClick} />
                        </motion.div>
                        <AnimatePresence>
                            {moves >= 10 && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0, opacity: 0, y: -10 }}
                                    className="absolute -bottom-2 -right-2 text-black font-bold text-xs z-30 flex items-center justify-center w-5 h-5 bg-white border border-black rounded-full"
                                >
                                    <i className="ra ra-muscle-up" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col min-w-0 justify-center">
                        <span className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest leading-none truncate text-white">HERO</span>
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-none text-emerald-400 mt-1.5">LVL {moves}</span>
                    </div>
                </div>

                {/* Stats List */}
                <div className="flex-1 flex flex-col py-1 px-2.5 sm:px-3 overflow-y-auto bg-black/10 min-h-0 justify-center" style={{ fontFamily: 'var(--font-mono)' }}>
                    <div className="flex justify-between items-center py-1 sm:py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>HP</span>
                        <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[12px] sm:text-[13px] font-bold text-red-400 tracking-wider">
                            {playerHp} / {playerMaxHp}
                        </motion.span>
                    </div>
                    <div className="flex justify-between items-center py-1 sm:py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>ATK</span>
                        <span className="text-[13px] sm:text-[14px] font-bold text-orange-400">{playerBaseAtk}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 sm:py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>MGC</span>
                        <span className="text-[13px] sm:text-[14px] font-bold text-pink-400">{playerMagic}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 sm:py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>GER</span>
                        <span className="text-[13px] sm:text-[14px] font-bold text-blue-400">{playerGear}</span>
                    </div>
                </div>
            </div>

            {/* GOLD Button */}
            <div className="flex items-center justify-center w-full h-[46px] sm:h-[50px] px-2 py-1 surface-panel shrink-0 relative overflow-hidden group mt-auto rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2.5 z-10" style={{ fontFamily: 'var(--font-mono)' }}>
                    <span className="text-[13px] sm:text-[14px] font-bold tracking-widest text-zinc-400 uppercase mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>GOLD</span>
                    <span className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-wider">
                        {gold}
                    </span>
                </div>
            </div>
        </div>
    );
}
