import { useState } from 'react';
import { motion } from 'framer-motion';
import { WAVE_REWARD_OPTIONS } from '@/lib/constants';
import { useGameStore } from '@/store/gameStore';
import type { NextRunReward } from '@/types/progression';

interface WaveRewardModalProps {
    waveNumber: 1 | 2;
    onContinue: () => void;
}

export function WaveRewardModal({ waveNumber, onContinue }: WaveRewardModalProps) {
    const queueNextRunBonus = useGameStore((state) => state.queueNextRunBonus);
    const [selectedReward, setSelectedReward] = useState<NextRunReward | null>(null);

    const waveLabel = waveNumber === 1 ? 'first' : 'second';

    const handleSelect = (reward: NextRunReward) => {
        if (selectedReward) return;
        queueNextRunBonus(reward);
        setSelectedReward(reward);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 pointer-events-auto"
        >
            <div className="bg-black border border-zinc-900 flex flex-col p-5 w-full max-w-md">
                <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold tracking-[0.35em] uppercase text-emerald-400/70">
                        Wave Cleared
                    </span>
                    <h2 className="text-2xl font-black tracking-[0.18em] uppercase text-[#e8d4b8]">
                        The {waveLabel} wave has been defeated
                    </h2>
                    <p className="text-sm text-zinc-300">
                        Choose your reward. Your next run will also start with this benefit.
                    </p>
                </div>

                <div className="mt-6 grid gap-3">
                    {Object.entries(WAVE_REWARD_OPTIONS).map(([reward, option]) => {
                        const isSelected = selectedReward === reward;
                        const isLocked = selectedReward !== null && !isSelected;

                        return (
                            <button
                                key={reward}
                                type="button"
                                onClick={() => handleSelect(reward as NextRunReward)}
                                disabled={isLocked || isSelected}
                                className={[
                                    'w-full border px-4 py-4 text-left transition-colors',
                                    isSelected
                                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100'
                                        : 'border-zinc-800 bg-zinc-950 text-[#e8d4b8] hover:bg-zinc-900',
                                    isLocked ? 'opacity-50 cursor-not-allowed' : '',
                                ].join(' ')}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-bold uppercase tracking-[0.15em]">
                                        {option.label}
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                                        {isSelected ? 'Selected' : 'Choose'}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    {option.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={onContinue}
                    disabled={selectedReward === null}
                    className="mt-6 py-3 px-6 w-full font-bold uppercase tracking-widest text-sm border transition-colors bg-black text-[#e8d4b8] border-zinc-800 enabled:hover:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-900 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </motion.div>
    );
}
