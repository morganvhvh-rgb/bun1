
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectTotalAttack, selectTotalMaxHp } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { ICON_THEME, GAME_CONSTANTS } from '@/lib/constants';
import { hpVariants, playerIconVariants } from '../animations';

interface HeroPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    onCharacterClick: () => void;
}


export function HeroPanel({ playerAnim, isBattleRunning, onCharacterClick }: HeroPanelProps) {
    const { playerHp, playerMagic, playerGear, gold, moves, levelUpPerks } = useGameStore();
    const playerBaseAtk = useGameStore(selectTotalAttack);
    const playerTotalMaxHp = useGameStore(selectTotalMaxHp);

    const playerLvl = 1 + levelUpPerks.length;
    const isLevelUpReady = moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED;

    return (
        <div className="flex-1 flex flex-col relative overflow-visible w-full h-full py-2 sm:py-3 z-20">
            {/* Profile Card Main Area */}
            <div className="w-full flex-1 flex flex-col surface-panel overflow-visible z-20 min-h-0 mb-2 sm:mb-3 p-2 sm:p-3 relative justify-between">

                {/* Header: Title */}
                <div className="flex justify-between items-start z-10 relative pointer-events-none">
                    <div className="flex flex-col">
                        <span className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest leading-none text-white drop-shadow-md">HERO</span>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-none text-emerald-400 drop-shadow-md">LVL {playerLvl}</span>
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-none text-teal-400 drop-shadow-md">EXP {moves}/{GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED}</span>
                        </div>
                    </div>
                </div>

                {/* Big Avatar Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pt-2 pb-10 lg:pt-0 pointer-events-none">
                    <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] pointer-events-auto scale-[0.70] sm:scale-85">
                        <AnimatePresence>
                            {isLevelUpReady && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="absolute -top-3 -right-3 z-30 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full border-2 border-zinc-900 shadow-lg"
                                >
                                    <i className="ra ra-muscle-up text-white text-[12px] leading-none" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Icon name="hood" scale={5.5} tintColor={ICON_THEME['hood']} className={cn('cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200', isBattleRunning && 'pointer-events-none')} onClick={onCharacterClick} />
                    </motion.div>
                </div>

                {/* Compact Stats */}
                <div className="flex flex-col gap-1 w-full p-1.5 sm:p-2 z-10 relative">
                    {/* HP Bar */}
                    <div className="flex items-center gap-1.5 w-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase leading-none w-4 shrink-0">HP</span>
                        <div className="flex-1 h-2 sm:h-2.5 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-red-500 rounded-full"
                                initial={{ width: `${Math.max(0, Math.min(100, (playerHp / playerTotalMaxHp) * 100))}%` }}
                                animate={{ width: `${Math.max(0, Math.min(100, (playerHp / playerTotalMaxHp) * 100))}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>
                        <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[12px] sm:text-[14px] font-bold text-red-400 leading-none font-mono tracking-wider shrink-0 text-right min-w-[3rem]">
                            {playerHp}<span className="text-[9px] sm:text-[10px] text-red-400/50">/{playerTotalMaxHp}</span>
                        </motion.span>
                    </div>

                    {/* Other Stats Grid */}
                    <div className="grid grid-cols-3 gap-1 w-full mt-0.5">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase leading-none mb-1">ATK</span>
                            <span className="text-[12px] sm:text-[14px] font-bold text-orange-400 leading-none font-mono tracking-wider">{playerBaseAtk}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase leading-none mb-1">MGC</span>
                            <span className="text-[12px] sm:text-[14px] font-bold text-pink-400 leading-none font-mono tracking-wider">{playerMagic}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase leading-none mb-1">GER</span>
                            <span className="text-[12px] sm:text-[14px] font-bold text-blue-400 leading-none font-mono tracking-wider">{playerGear}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GOLD Button */}
            <div className="flex items-center justify-center w-full h-[46px] sm:h-[50px] px-2 py-1 surface-panel shrink-0 relative overflow-hidden group mt-auto !rounded-2xl">
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
