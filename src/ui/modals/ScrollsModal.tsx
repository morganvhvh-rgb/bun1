import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { ICON_THEME } from '@/lib/constants';
import { Modal } from '../shared/Modal';

interface ScrollsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ScrollsModal({ isOpen, onClose }: ScrollsModalProps) {
    const { keptScrolls } = useGameStore();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Scroll Content" position="bottom">
            <div className="border border-zinc-800/50 bg-zinc-950/50 rounded p-4 text-zinc-600 text-sm font-mono space-y-2 overflow-y-auto touch-pan-y h-full">
                {keptScrolls.length > 0 ? (
                    keptScrolls.map((scrollName, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/30 px-2 transition-colors rounded-lg">
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <Icon name={scrollName} scale={2} tintColor={ICON_THEME[scrollName]} />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-zinc-300 font-bold uppercase text-xs tracking-wider">
                                    {scrollName.replace('-scroll', '')} Scroll
                                </div>
                                <div className="text-[10px] text-zinc-500">Does X to Y twice</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="opacity-50 text-center mt-4 pt-4">No scrolls collected</div>
                )}
            </div>
        </Modal>
    );
}
