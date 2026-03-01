import { useState } from 'react';
import { Modal } from '../shared/Modal';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    const [page, setPage] = useState(1);
    const totalPages = 3;

    const pageContent = [
        (
            <div className="flex flex-col gap-4 text-sm text-zinc-300">
                <p><strong className="text-white text-base">DAILY ROGUE</strong> is divided into two sections:</p>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="font-bold text-white mb-1 uppercase tracking-widest text-xs">Top Section</p>
                    <p>A simple, turn-based auto-battler. Defeat waves of enemies to win.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="font-bold text-white mb-1 uppercase tracking-widest text-xs">Bottom Section</p>
                    <p>A grid of symbols. Equip or interact with them to design your build.</p>
                </div>
            </div>
        ),
        (
            <div className="flex flex-col gap-4 text-sm text-zinc-300">
                <p>The symbol grid works in 3 ways:</p>
                <ul className="space-y-3 pl-2">
                    <li><strong className="text-white">Spin</strong> - receive random symbols</li>
                    <li><strong className="text-white">Reshuffle</strong> - rearrange current symbols</li>
                    <li><strong className="text-white">Move</strong> - tap your rogue icon to a desired symbol</li>
                </ul>
                <p className="mt-2 text-zinc-400">
                    <span className="text-teal-400 font-bold uppercase tracking-widest text-xs mr-2">Note:</span>
                    You can tap symbols to 'keep' and equip them, but they only last for 2 battles!
                </p>
            </div>
        ),
        (
            <div className="flex flex-col gap-4 text-sm text-zinc-300">
                <p>Spins, reshuffles, and movements cost <strong className="text-yellow-400">Gold</strong>. Hitting 0 gold or 0 HP usually ends the run.</p>

                <div className="h-px w-full bg-white/10 my-1" />

                <p>The rogue icon earns EXP for movement. Save it up to unlock level-up effects in the player menu.</p>

                <p>Buy scrolls to unlock permanent, unique effects for your run.</p>
            </div>
        )
    ];

    const handleNext = () => {
        if (page < totalPages) {
            setPage(page + 1);
        } else {
            setPage(1);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Tutorial (${page}/${totalPages})`}
            position="center"
            className="w-[85vw] h-[75vh] max-w-lg max-h-[500px] flex flex-col pt-6 pb-5 px-6"
            closeOnOutsideClick={false}
            backdrop="light"
            showHeader={false}
        >
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-white font-bold uppercase tracking-widest leading-none text-base">Tutorial</h2>
                <span className="text-zinc-500 font-mono text-xs">{page} / {totalPages}</span>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                {/* Content area based on page */}
                <div className="flex-1 w-full overflow-y-auto">
                    {pageContent[page - 1]}
                </div>

                {/* Navigation */}
                <div className="flex pt-4 mt-auto border-t border-white/10 shrink-0">
                    <button
                        onClick={handleNext}
                        className="flex-1 flex justify-center items-center bg-white text-black font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-sm hover:focus-visible:ring-2 hover:bg-zinc-200 transition-colors"
                    >
                        {page < totalPages ? (
                            <div className="flex items-center gap-2">
                                <span>Next</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        ) : 'Close'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
