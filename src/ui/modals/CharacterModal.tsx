import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { GAME_CONSTANTS, LEVEL_UP_PERK_META, ONE_TIME_LEVEL_UP_PERKS } from '@/lib/constants';
import type { LevelUpPerk } from '@/types/levelUp';
import { Modal } from '../shared/Modal';

interface CharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CharacterModal({ isOpen, onClose }: CharacterModalProps) {
    const { moves, levelUpPerks, applyLevelUp } = useGameStore();

    const canLevelUp = moves >= GAME_CONSTANTS.LEVEL_UP_MOVES_REQUIRED;
    const isFirstLevelUp = levelUpPerks.length === 0;
    const availableOneTimePerks = ONE_TIME_LEVEL_UP_PERKS.filter(perk => !levelUpPerks.includes(perk));
    const availableChoices: LevelUpPerk[] = isFirstLevelUp
        ? availableOneTimePerks
        : [...availableOneTimePerks, 'full_heal'];

    const handlePick = (perk: LevelUpPerk) => {
        applyLevelUp(perk);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Character Lvl ${1 + levelUpPerks.length}`} position="top">
            <div className="border border-zinc-800 bg-black flex flex-col p-4 text-[#e8d4b8] text-sm overflow-y-auto touch-pan-y h-full">
                {canLevelUp && (
                    <div className="flex flex-col gap-3 w-full">
                        <h3 className="text-[#e8d4b8] font-bold uppercase tracking-widest text-center mb-2">LEVEL UP! Make a choice:</h3>
                        {availableChoices.map(perk => {
                            const perkMeta = LEVEL_UP_PERK_META[perk];

                            return (
                                <button
                                    key={perk}
                                    onClick={() => handlePick(perk)}
                                    className={cn(
                                        'w-full p-3 font-bold uppercase tracking-wider text-xs border text-left transition-colors focus-visible:outline-none focus-visible:ring-2',
                                        perkMeta.buttonClassName,
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span>{perkMeta.label}</span>
                                        {perkMeta.isOneTime && (
                                            <span className="shrink-0 text-[9px] tracking-[0.25em] opacity-70">
                                                ONE TIME
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {levelUpPerks.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-col gap-2 w-full shrink-0">
                        <h3 className="text-[#e8d4b8] uppercase tracking-widest text-[10px] font-bold">Applied Level Ups</h3>
                        <div className="flex flex-col gap-1">
                            {levelUpPerks.map((perk, i) => (
                                <div key={i} className="text-xs text-[#e8d4b8]">
                                    - {LEVEL_UP_PERK_META[perk]?.label ?? perk}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
