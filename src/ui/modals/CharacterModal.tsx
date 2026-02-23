import { useGameStore } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/lib/constants';
import { Modal } from '../shared/Modal';



interface CharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CharacterModal({ isOpen, onClose }: CharacterModalProps) {
    const { moves, levelUpPerks, applyLevelUp } = useGameStore();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Character Lvl ${1 + levelUpPerks.length}`} position="top">
            <div className="border border-zinc-800/50 bg-zinc-950/50 rounded flex flex-col p-4 text-zinc-600 text-sm font-mono overflow-y-auto h-full">
                {moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED && (
                    <div className="flex flex-col gap-3 w-full">
                        <h3 className="text-green-500 font-bold uppercase tracking-widest text-center mb-2">LEVEL UP! Make a choice:</h3>
                        {levelUpPerks.length === 0 ? (
                            <>
                                <button onClick={() => applyLevelUp('full_heal_max_hp')} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded font-bold uppercase tracking-wider text-xs border border-zinc-600 transition-colors">
                                    Full heal and +10 Max HP
                                </button>
                                <button onClick={() => applyLevelUp('nature_2x_exp')} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-3 rounded font-bold uppercase tracking-wider text-xs border border-zinc-600 transition-colors">
                                    All Nature symbols give 2x EXP
                                </button>
                            </>
                        ) : (
                            <button onClick={() => applyLevelUp('full_heal')} className="bg-green-950/20 hover:bg-green-900/30 text-green-500 p-3 rounded font-bold uppercase tracking-wider text-xs border border-green-900/40 transition-colors">
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
                                    - {perk === 'full_heal_max_hp' ? 'Full heal & +10 Max HP' : perk === 'nature_2x_exp' ? 'All Nature symbols give 2x EXP' : 'Full Heal'}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
