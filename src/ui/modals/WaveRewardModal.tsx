import { useState } from 'react';
import { motion } from 'framer-motion';
import { WAVE_REWARD_OPTIONS } from '@/lib/constants';
import { useGameStore } from '@/store/gameStore';
import type { NextRunReward } from '@/types/progression';

interface WaveRewardModalProps {
    onContinue: () => void;
}

export function WaveRewardModal({ onContinue }: WaveRewardModalProps) {
    const addNextRunBonus = useGameStore((state) => state.addNextRunBonus);
    const [selectedReward, setSelectedReward] = useState<NextRunReward | null>(null);

    const handleSelect = (reward: NextRunReward) => {
        setSelectedReward(reward);
    };

    const handleContinue = () => {
        if (!selectedReward) return;
        addNextRunBonus(selectedReward);
        onContinue();
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
                    <p className="text-sm text-zinc-300">
                        Choose your reward.
                    </p>
                </div>

                <div className="mt-6 grid gap-3">
                    {Object.entries(WAVE_REWARD_OPTIONS).map(([reward, option]) => {
                        const isSelected = selectedReward === reward;

                        return (
                            <button
                                key={reward}
                                type="button"
                                onClick={() => handleSelect(reward as NextRunReward)}
                                aria-pressed={isSelected}
                                className={[
                                    'w-full min-h-[92px] border border-zinc-800 px-4 py-4 text-left transition-colors',
                                    isSelected
                                        ? 'bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-500/50'
                                        : 'bg-zinc-950 text-[#e8d4b8] hover:bg-zinc-900',
                                ].join(' ')}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-bold uppercase tracking-[0.15em]">
                                        {option.label}
                                    </span>
                                    <span className={[
                                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                        isSelected
                                            ? 'border-emerald-300 bg-emerald-300'
                                            : 'border-zinc-600 bg-transparent',
                                    ].join(' ')}>
                                        <span className={[
                                            'h-2 w-2 rounded-full transition-colors',
                                            isSelected ? 'bg-black' : 'bg-transparent',
                                        ].join(' ')} />
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
                    onClick={handleContinue}
                    disabled={selectedReward === null}
                    className="mt-6 py-3 px-6 w-full font-bold uppercase tracking-widest text-sm border transition-colors bg-black text-[#e8d4b8] border-zinc-800 enabled:hover:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-900 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </motion.div>
    );
}
