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
                        </div>

                        <button
                            onClick={onClose}
                            className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:text-[#e8d4b8]"
                            aria-label="Close tutorial"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 mt-2 text-sm leading-relaxed text-zinc-300">
                        <p>
                            Daily Rogue has 2 sections: The top is an auto-battler where you defeat waves of enemies to win the daily run. The bottom is a symbol grid, where you can <em className="text-[#e8d4b8] not-italic font-medium">Spin</em> for new symbols, <em className="text-[#e8d4b8] not-italic font-medium">Shuffle</em> current symbols or <em className="text-[#e8d4b8] not-italic font-medium">Slide</em> your Rogue over certain symbol types.
                        </p>
                        <p>
                            You can <em className="text-[#e8d4b8] not-italic font-medium">Equip</em> symbols to boost your stats and take advantage of their special effects. All these actions cost gold.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
