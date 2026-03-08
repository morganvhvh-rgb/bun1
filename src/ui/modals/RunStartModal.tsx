import { hasRunBonuses } from '@/lib/runBonuses';
import type { NextRunBonuses } from '@/types/progression';
import { Modal } from '../shared/Modal';

interface RunStartModalProps {
    isOpen: boolean;
    bonuses: NextRunBonuses;
    onClose: () => void;
}

export function RunStartModal({ isOpen, bonuses, onClose }: RunStartModalProps) {
    const bonusLines = [
        bonuses.hp > 0 ? `+${bonuses.hp} HP` : null,
        bonuses.atk > 0 ? `+${bonuses.atk} ATK` : null,
        bonuses.gold > 0 ? `+${bonuses.gold} Gold` : null,
    ].filter((value): value is string => value !== null);
    const hasBonuses = hasRunBonuses(bonuses);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Run Start"
            position="center"
            className="w-[92vw] max-w-md px-4 pt-4 pb-4 font-sans sm:px-5"
            closeOnOutsideClick={false}
            backdrop="light"
            showHeader={false}
        >
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Try Again</p>
                        <h2 className="text-xl font-semibold tracking-[0.2em] text-[#e8d4b8] sm:text-2xl">
                            {hasBonuses ? 'STARTING BONUSES' : 'FRESH START'}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:text-[#e8d4b8]"
                        aria-label="Close run start modal"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-zinc-300">
                    {hasBonuses ? (
                        <>
                            <p>This run starts with the rewards you carried out of the last run.</p>
                            <div className="grid gap-2">
                                {bonusLines.map((line) => (
                                    <div
                                        key={line}
                                        className="border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-100"
                                    >
                                        {line}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                These bonuses are now consumed. Earn new rewards to carry anything into the following run.
                            </p>
                        </>
                    ) : (
                        <p>No rewards carried into this run.</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 py-3 px-6 w-full font-bold uppercase tracking-widest text-sm border transition-colors bg-black text-[#e8d4b8] border-zinc-800 enabled:hover:bg-zinc-900"
                >
                    Begin
                </button>
            </div>
        </Modal>
    );
}
