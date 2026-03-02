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
            <div className="surface-panel border-slate-500/25 p-4 text-slate-100 text-sm space-y-2 overflow-y-auto touch-pan-y h-full">
                {keptScrolls.length > 0 ? (
                    keptScrolls.map((scrollName, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-500/24 last:border-0 hover:bg-slate-800/60 rounded-md px-2 transition-colors">
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <Icon name={scrollName} scale={2} tintColor={SYMBOL_THEME[scrollName]} />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-slate-100 font-bold uppercase text-xs tracking-wider">
                                    {scrollName.replace('-scroll', '')} Scroll
                                </div>
                                <div className="text-xs text-slate-400 leading-tight mt-0.5">{SYMBOL_EXTRA_EFFECTS[scrollName] ?? '???'}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="opacity-60 text-center mt-4 pt-4 text-slate-200">No scrolls collected</div>
                )}
            </div>
        </Modal>
    );
}
