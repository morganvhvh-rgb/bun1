import { Modal } from '../shared/Modal';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tutorial"
            position="center"
            className="w-[92vw] max-w-2xl max-h-[min(76svh,36rem)] flex flex-col px-4 pt-3 pb-4 font-sans sm:px-5 sm:pt-4 sm:pb-4"
            closeOnOutsideClick={false}
            backdrop="light"
            showHeader={false}
        >
            <div className="flex h-full min-h-0 flex-col justify-center">
                <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                            <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">How to Play</p>
                            <h2 className="text-xl font-semibold tracking-[0.2em] text-[#e8d4b8] sm:text-2xl">DAILY ROGUE</h2>
                            <p className="text-sm text-zinc-400">
                                Build your loadout below, then survive the battle above.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:text-[#e8d4b8]"
                            aria-label="Close tutorial"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 shadow-sm">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#e8d4b8]/70">Top Half</p>
                            <p className="text-sm text-zinc-200">Turn-based auto-battler.</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                                Beat each wave. Tap your Rogue to view level-up perks.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 shadow-sm">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#e8d4b8]/70">Bottom Half</p>
                            <p className="text-sm text-zinc-200">Symbol grid and movement.</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                                Tap to equip. Slide over other symbols to trigger them. You get one slide per spin.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-x-4 gap-y-1 text-sm leading-relaxed text-zinc-400 sm:grid-cols-2">
                        <p>Spin, shuffle, slide, and equip cost <strong className="font-medium text-yellow-400">gold</strong>.</p>
                        <p>Equip up to <strong className="font-medium text-[#e8d4b8]">two symbols per category</strong>.</p>
                        <p className="sm:col-span-2">Equipped symbols last <strong className="font-medium text-[#e8d4b8]">two battles</strong>.</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
