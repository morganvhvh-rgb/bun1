import { useGameStore } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/lib/constants';
import { Modal } from '../shared/Modal';

interface CharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PERK_LABELS: Record<string, string> = {
    full_heal_max_hp: 'Full heal and +10 Max HP',
    nature_2x_exp: 'All Nature symbols give 2x EXP',
    full_heal: 'Full Heal',
};

const ALL_FIRST_PERKS = ['full_heal_max_hp', 'nature_2x_exp'] as const;

export function CharacterModal({ isOpen, onClose }: CharacterModalProps) {
    const { moves, levelUpPerks, rejectedLevelUpPerk, applyLevelUp, setRejectedLevelUpPerk } = useGameStore();

    const canLevelUp = moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED;

    /** The two choices shown at first level-up (level 1 → 2) */
    const isFirstLevelUp = levelUpPerks.length === 0;

    /**
     * At subsequent level-ups, offer:
     *   - The perk the player *didn't* pick last time (if any)
     *   - Full Heal
     */
    const subsequentChoices: string[] = [];
    if (!isFirstLevelUp) {
        if (rejectedLevelUpPerk) subsequentChoices.push(rejectedLevelUpPerk);
        subsequentChoices.push('full_heal');
    }

    const handlePick = (perk: 'full_heal_max_hp' | 'nature_2x_exp' | 'full_heal') => {
        if (isFirstLevelUp) {
            // Track which of the two was NOT picked
            const rejected = ALL_FIRST_PERKS.find(p => p !== perk) ?? null;
            setRejectedLevelUpPerk(rejected);
        } else {
            // Once the rejected perk is finally used at a later level-up, clear it
            if (perk === rejectedLevelUpPerk) {
                setRejectedLevelUpPerk(null);
            }
        }
        applyLevelUp(perk);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Character Lvl ${1 + levelUpPerks.length}`} position="top">
            <div className="border border-zinc-800 bg-black flex flex-col p-4 text-[#e8d4b8] text-sm overflow-y-auto touch-pan-y h-full">
                {canLevelUp && (
                    <div className="flex flex-col gap-3 w-full">
                        <h3 className="text-[#e8d4b8] font-bold uppercase tracking-widest text-center mb-2">LEVEL UP! Make a choice:</h3>
                        {isFirstLevelUp ? (
                            <>
                                <button onClick={() => handlePick('full_heal_max_hp')} className="bg-black text-[#e8d4b8] p-3 font-bold uppercase tracking-wider text-xs border border-zinc-800">
                                    Full heal and +10 Max HP
                                </button>
                                <button onClick={() => handlePick('nature_2x_exp')} className="bg-black text-[#e8d4b8] p-3 font-bold uppercase tracking-wider text-xs border border-zinc-800">
                                    All Nature symbols give 2x EXP
                                </button>
                            </>
                        ) : (
                            subsequentChoices.map(perk => (
                                <button
                                    key={perk}
                                    onClick={() => handlePick(perk as 'full_heal_max_hp' | 'nature_2x_exp' | 'full_heal')}
                                    className="bg-black text-[#e8d4b8] p-3 font-bold uppercase tracking-wider text-xs border border-zinc-800"
                                >
                                    {PERK_LABELS[perk] ?? perk}
                                </button>
                            ))
                        )}
                    </div>
                )}

                {levelUpPerks.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-col gap-2 w-full shrink-0">
                        <h3 className="text-[#e8d4b8] uppercase tracking-widest text-[10px] font-bold">Applied Level Ups</h3>
                        <div className="flex flex-col gap-1">
                            {levelUpPerks.map((perk, i) => (
                                <div key={i} className="text-xs text-[#e8d4b8]">
                                    - {PERK_LABELS[perk] ?? perk}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
