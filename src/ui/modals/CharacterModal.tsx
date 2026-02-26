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
            <div className="border border-zinc-800 bg-black flex flex-col p-4 text-white text-sm font-mono overflow-y-auto touch-pan-y h-full">
                {moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED && (
                    <div className="flex flex-col gap-3 w-full">
                        <h3 className="text-white font-bold uppercase tracking-widest text-center mb-2">LEVEL UP! Make a choice:</h3>
                        {levelUpPerks.length === 0 ? (
                            <>
                                <button onClick={() => applyLevelUp('full_heal_max_hp')} className="bg-black text-white p-3 font-bold uppercase tracking-wider text-xs border border-zinc-800">
                                    Full heal and +10 Max HP
                                </button>
                                <button onClick={() => applyLevelUp('nature_2x_exp')} className="bg-black text-white p-3 font-bold uppercase tracking-wider text-xs border border-zinc-800">
                                    All Nature symbols give 2x EXP
                                </button>
                            </>
                        ) : (
                            <button onClick={() => applyLevelUp('full_heal')} className="bg-black text-white p-3 font-bold uppercase tracking-wider text-xs border border-zinc-800">
                                Full Heal
                            </button>
                        )}
                    </div>
                )}

                {levelUpPerks.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-col gap-2 w-full shrink-0">
                        <h3 className="text-white uppercase tracking-widest text-[10px] font-bold">Applied Level Ups</h3>
                        <div className="flex flex-col gap-1">
                            {levelUpPerks.map((perk, i) => (
                                <div key={i} className="text-xs text-white font-mono">
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
