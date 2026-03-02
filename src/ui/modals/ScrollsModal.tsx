import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME, SYMBOL_EXTRA_EFFECTS } from '@/lib/constants';
import { Modal } from '../shared/Modal';

interface ScrollsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ScrollsModal({ isOpen, onClose }: ScrollsModalProps) {
    const { keptScrolls } = useGameStore();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Scroll Content" position="bottom">
            <div className="border border-zinc-800 bg-black p-4 text-white text-sm space-y-2 overflow-y-auto touch-pan-y h-full">
                {keptScrolls.length > 0 ? (
                    keptScrolls.map((scrollName, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800 px-2 transition-colors">
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <Icon name={scrollName} scale={2} tintColor={SYMBOL_THEME[scrollName]} />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-white font-bold uppercase text-xs tracking-wider">
                                    {scrollName.replace('-scroll', '')} Scroll
                                </div>
                                <div className="text-xs text-zinc-500 leading-tight mt-0.5">{SYMBOL_EXTRA_EFFECTS[scrollName] ?? '???'}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="opacity-50 text-center mt-4 pt-4 text-white">No scrolls collected</div>
                )}
            </div>
        </Modal>
    );
}
