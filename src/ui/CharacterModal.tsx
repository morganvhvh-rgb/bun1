import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CONSTANTS } from '@/lib/constants';

type LevelUpChoice = "full_heal_max_hp" | "nature_2x_exp" | "full_heal";

interface CharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    moves: number;
    levelUpPerks: string[];
    onApplyLevelUp: (perk: LevelUpChoice) => void;
}

export function CharacterModal({
    isOpen,
    onClose,
    moves,
    levelUpPerks,
    onApplyLevelUp
}: CharacterModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[60]"
                    />
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 right-0 bg-zinc-900 border-b border-zinc-700 rounded-b-3xl shadow-2xl z-[70] flex flex-col p-6"
                        style={{ height: '50%' }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-zinc-100 font-bold uppercase tracking-widest">
                                Character <span className="text-zinc-500 ml-2">Lvl {1 + levelUpPerks.length}</span>
                            </h2>
                            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest">Close</button>
                        </div>
                        <div className="flex-1 border border-zinc-800/50 bg-zinc-950/50 rounded flex flex-col p-4 text-zinc-600 text-sm font-mono overflow-y-auto">
                            {moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED && (
                                <div className="flex flex-col gap-3 w-full">
                                    <h3 className="text-green-500 font-bold uppercase tracking-widest text-center mb-2">LEVEL UP! Make a choice:</h3>
                                    {levelUpPerks.length === 0 ? (
                                        <>
                                            <button onClick={() => onApplyLevelUp("full_heal_max_hp")} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded font-bold uppercase tracking-wider text-xs border border-zinc-600 transition-colors">
                                                Full heal and +10 Max HP
                                            </button>
                                            <button onClick={() => onApplyLevelUp("nature_2x_exp")} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded font-bold uppercase tracking-wider text-xs border border-zinc-600 transition-colors">
                                                All Nature symbols give 2x EXP
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => onApplyLevelUp("full_heal")} className="bg-green-950/20 hover:bg-green-900/30 text-green-500 p-3 rounded font-bold uppercase tracking-wider text-xs border border-green-900/40 transition-colors">
                                            Full Heal
                                        </button>
                                    )}
                                </div>
                            )}

                            {levelUpPerks.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-zinc-800/50 flex flex-col gap-2 w-full shrink-0">
                                    <h3 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Applied Level Ups</h3>
                                    <div className="flex flex-col gap-1">
                                        {levelUpPerks.map((perk, i) => (
                                            <div key={i} className="text-xs text-zinc-400 font-mono">
                                                - {perk === "full_heal_max_hp" ? "Full heal & +10 Max HP" : perk === "nature_2x_exp" ? "All Nature symbols give 2x EXP" : "Full Heal"}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
