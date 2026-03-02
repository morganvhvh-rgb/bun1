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
            className="w-[90vw] h-auto max-w-2xl flex flex-col pt-4 pb-6 px-6 font-sans"
            closeOnOutsideClick={false}
            backdrop="light"
            showHeader={false}
        >
            <div className="flex justify-end items-center mb-2 shrink-0">
                <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 w-full">
                    <div className="flex flex-col gap-4 text-sm text-slate-300">
                        <p><strong className="text-slate-100 text-base font-semibold">DAILY ROGUE</strong> has two main sections:</p>

                        <div className="bg-slate-900/45 border border-slate-400/20 p-4 rounded-xl flex flex-col gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                            <p className="font-bold text-slate-100 mb-1 uppercase tracking-widest text-[11px] opacity-80">Top Half</p>
                            <p>A turn-based auto-battler. Defeat waves of enemies to win.</p>
                            <p className="text-slate-400">You can tap your Rogue icon for level-up bonuses.</p>
                        </div>

                        <div className="bg-slate-900/45 border border-slate-400/20 p-4 rounded-xl flex flex-col gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                            <p className="font-bold text-slate-100 mb-1 uppercase tracking-widest text-[11px] opacity-80">Bottom Half</p>
                            <p>A grid of unique symbols. Some symbols are tap to equip, others activate when your Rogue slides over them.</p>
                            <p className="text-slate-400">Rogue can slide once per spin.</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <p>Spin, shuffle, slide and equip all cost <strong className="text-yellow-400 font-medium">gold</strong>.</p>
                            <p className="text-slate-400">Equip up to two symbols per category. They are removed after two battles.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
