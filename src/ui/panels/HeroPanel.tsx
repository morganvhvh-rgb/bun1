
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectTotalAttack, selectTotalMaxHp } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME, GAME_CONSTANTS } from '@/lib/constants';
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
            <div className="w-full flex-1 flex flex-col surface-panel overflow-visible z-20 min-h-0 mb-2 sm:mb-3 p-3 relative">

                {/* Header: Name & Level */}
                <div className="flex items-baseline justify-center gap-2 z-10 w-full shrink-0">
                    <span className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest leading-none text-slate-100 drop-shadow-md">ROGUE</span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-none text-emerald-400 drop-shadow-md">LVL {playerLvl}</span>
                </div>

                {/* Middle: Avatar (Center) */}
                <div className="flex w-full items-center justify-center flex-1 relative z-10 min-h-0 py-1 sm:py-2 px-2 sm:px-4">
                    {/* Center: Big Avatar */}
                    <div className="flex justify-center items-center pointer-events-none z-0">
                        <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] pointer-events-auto scale-[0.70] sm:scale-85">
                            <AnimatePresence>
                                {isLevelUpReady && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className="absolute -bottom-1 -right-1 z-30 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full border-2 border-zinc-900 shadow-lg"
                                    >
                                        <i className="ra ra-muscle-up text-white text-[12px] leading-none" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <Icon name="hood" scale={5.5} tintColor={SYMBOL_THEME['hood']} className={cn('cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200', isBattleRunning && 'pointer-events-none')} onClick={onCharacterClick} />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom: Stats, HP, and EXP Rows */}
                <div className="flex flex-col gap-2.5 w-full mt-auto z-10 shrink-0">
                    {/* Stats Row */}
                    <div className="flex items-center justify-between w-full px-2 sm:px-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase leading-none">ATK</span>
                            <span className="text-[13px] sm:text-[15px] font-bold text-orange-400 leading-none font-mono tracking-wider">{playerBaseAtk}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase leading-none">MGC</span>
                            <span className="text-[13px] sm:text-[15px] font-bold text-pink-400 leading-none font-mono tracking-wider">{playerMagic}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase leading-none">GER</span>
                            <span className="text-[13px] sm:text-[15px] font-bold text-blue-400 leading-none font-mono tracking-wider">{playerGear}</span>
                        </div>
                    </div>

                    {/* HP Bar */}
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase leading-none w-6 shrink-0 text-left pl-1">HP</span>
                        <div className="flex-1 h-1.5 sm:h-2 bar-track overflow-hidden relative">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-red-500 rounded-[3px]"
                                initial={{ width: `${Math.max(0, Math.min(100, (playerHp / playerTotalMaxHp) * 100))}%` }}
                                animate={{ width: `${Math.max(0, Math.min(100, (playerHp / playerTotalMaxHp) * 100))}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>
                        <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[12px] sm:text-[14px] font-bold text-red-500 leading-none font-mono tracking-wider shrink-0 w-8 sm:w-12">
                            {playerHp}<span className="text-[10px] sm:text-[12px] text-red-500/60">/{playerTotalMaxHp}</span>
                        </motion.span>
                    </div>

                    {/* EXP Bar */}
                    <div className="flex items-center gap-2 w-full mb-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase leading-none w-6 shrink-0 text-left pl-1">EXP</span>
                        <div className="flex-1 h-1.5 sm:h-2 bar-track overflow-hidden relative">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-green-500 rounded-[3px]"
                                initial={{ width: `${Math.max(0, Math.min(100, (moves / GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED) * 100))}%` }}
                                animate={{ width: `${Math.max(0, Math.min(100, (moves / GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED) * 100))}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>
                        <span className="text-[12px] sm:text-[14px] font-bold text-green-500 leading-none font-mono tracking-wider shrink-0 w-8 sm:w-12">
                            {moves}<span className="text-[10px] sm:text-[12px] text-green-500/60">/{GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED}</span>
                        </span>
                    </div>
                </div>

            </div>

            {/* GOLD Button */}
            <div className="flex items-center justify-center w-full h-[46px] sm:h-[50px] px-2 py-1 surface-panel border-slate-300/30 shrink-0 relative overflow-hidden group mt-auto !rounded-lg">
                <div className="flex items-center gap-2.5 z-10 font-mono">
                    <span className="text-[13px] sm:text-[14px] font-bold tracking-widest text-slate-300 uppercase mt-0.5 font-sans">GOLD</span>
                    <span className="text-xl sm:text-2xl font-bold text-amber-300 tracking-wider">
                        {gold}
                    </span>
                </div>
            </div>
        </div>
    );
}
