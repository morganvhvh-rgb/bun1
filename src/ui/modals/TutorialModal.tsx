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
            className="w-[90vw] h-auto max-w-2xl flex flex-col pt-4 pb-6 px-6"
            closeOnOutsideClick={false}
            backdrop="light"
            showHeader={false}
        >
            <div className="flex justify-end items-center mb-2 shrink-0">
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 w-full">
                    <div className="flex flex-col gap-4 text-sm text-zinc-300">
                        <p><strong className="text-white text-base">DAILY ROGUE</strong> has two sections:</p>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <p className="font-bold text-white mb-1 uppercase tracking-widest text-xs">Top</p>
                            <p>A turn-based auto-battler. Defeat waves of enemies to win.</p>
                            <p className="mt-2">You can tap the Rogue icon for level-up bonuses.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <p className="font-bold text-white mb-1 uppercase tracking-widest text-xs">Bottom</p>
                            <p>A grid of unique symbols. Some symbols can be equipped, others have effects when you slide your Rogue over them. Rogue can slide once per spin.</p>
                        </div>

                        <div className="h-px w-full bg-white/10 my-1" />

                        <p>Spin, shuffle, equip and slide all cost <strong className="text-yellow-400">gold</strong>, so manage your money wisely.</p>
                        <p>You can equip up to two of each category, and equipped symbols will be removed after two battles.</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
