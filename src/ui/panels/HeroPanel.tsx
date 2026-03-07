
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore, selectTotalAttack, selectTotalMaxHp } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME, GAME_CONSTANTS, CATEGORY_TEXT_THEME } from '@/lib/constants';
import { hpVariants, playerIconVariants } from '../animations';

interface HeroPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    isBattleRunning: boolean;
    onCharacterClick: () => void;
}


export function HeroPanel({ playerAnim, isBattleRunning, onCharacterClick }: HeroPanelProps) {
    const { playerHp, playerMagic, playerGear, gold, moves, levelUpPerks } = useGameStore();
    const playerTotalAtk = useGameStore(selectTotalAttack);
    const playerTotalMaxHp = useGameStore(selectTotalMaxHp);

    const playerLvl = 1 + levelUpPerks.length;
    const isLevelUpReady = moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED;

    return (
        <div className="flex-1 min-w-0 flex flex-col relative overflow-visible w-full h-full py-2 z-20">
            {/* Profile Card Main Area */}
            <div className="w-full flex-1 flex flex-col surface-panel overflow-visible z-20 min-h-0 mb-2 p-3 relative">

                {/* Header: Name & Level */}
                <div className="flex items-baseline justify-center gap-2 z-10 w-full shrink-0">
                    <span className="text-[13px] font-bold uppercase tracking-widest leading-none text-[#e8d4b8] drop-shadow-md">ROGUE</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-green-500 drop-shadow-md">LVL {playerLvl}</span>
                </div>

                {/* Middle: Avatar (Center) */}
                <div className="flex w-full items-center justify-center flex-1 relative z-10 min-h-0 py-1 px-2">
                    {/* Center: Big Avatar */}
                    <div className="flex justify-center items-center pointer-events-none z-0">
                        <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] pointer-events-auto scale-[0.70]">
                            <AnimatePresence>
                                {isLevelUpReady && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className="absolute -bottom-1 -right-1 z-30 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full border-2 border-zinc-900 shadow-lg"
                                    >
                                        <i className="ra ra-muscle-up text-[#e8d4b8] text-[12px] leading-none" />
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
                    <div className="flex items-center justify-between w-full px-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">ATK</span>
                            <span className={cn("text-[13px] font-bold leading-none font-mono tracking-wider", CATEGORY_TEXT_THEME.Weapon)} style={{ fontVariantNumeric: 'tabular-nums' }}>{playerTotalAtk}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">Magic</span>
                            <span className={cn("text-[13px] font-bold leading-none font-mono tracking-wider", CATEGORY_TEXT_THEME.Magic)} style={{ fontVariantNumeric: 'tabular-nums' }}>{playerMagic}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none">Gear</span>
                            <span className={cn("text-[13px] font-bold leading-none font-mono tracking-wider", CATEGORY_TEXT_THEME.Armor)} style={{ fontVariantNumeric: 'tabular-nums' }}>{playerGear}</span>
                        </div>
                    </div>

                    {/* HP Bar */}
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none w-6 shrink-0 text-left pl-1">HP</span>
                        <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-red-500 rounded-full"
                                initial={{ width: `${Math.max(0, Math.min(100, (playerHp / playerTotalMaxHp) * 100))}%` }}
                                animate={{ width: `${Math.max(0, Math.min(100, (playerHp / playerTotalMaxHp) * 100))}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>
                        <motion.span animate={playerAnim === 'hurt' ? 'hurt' : 'idle'} variants={hpVariants} className="text-[12px] font-bold text-red-500 leading-none font-mono tracking-wider shrink-0 w-8">
                            {playerHp}<span className="text-[10px] text-red-500/60">/{playerTotalMaxHp}</span>
                        </motion.span>
                    </div>

                    {/* EXP Bar */}
                    <div className="flex items-center gap-2 w-full mb-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none w-6 shrink-0 text-left pl-1">EXP</span>
                        <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-green-500 rounded-full"
                                initial={{ width: `${Math.max(0, Math.min(100, (moves / GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED) * 100))}%` }}
                                animate={{ width: `${Math.max(0, Math.min(100, (moves / GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED) * 100))}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>
                        <span className={cn("text-[12px] font-bold leading-none font-mono tracking-wider shrink-0 w-8", CATEGORY_TEXT_THEME.Nature)}>
                            {moves}<span className="text-[10px] text-green-500/60">/{GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED}</span>
                        </span>
                    </div>
                </div>

            </div>

            {/* GOLD Button */}
            <div className="flex items-center justify-center w-full h-[46px] px-2 py-1 surface-panel shrink-0 relative overflow-hidden group mt-auto !rounded-2xl">
                <div className="flex items-center gap-2.5 z-10 font-mono">
                    <span className="text-[13px] font-bold tracking-widest text-zinc-400 uppercase mt-0.5 font-sans">GOLD</span>
                    <span className={cn("text-xl font-bold tracking-wider", CATEGORY_TEXT_THEME.Treasure)}>
                        {gold}
                    </span>
                </div>
            </div>
        </div>
    );
}
