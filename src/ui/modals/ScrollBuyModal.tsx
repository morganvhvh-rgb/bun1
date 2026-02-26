import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../shared/Icon';
import { ICON_THEME } from '@/lib/constants';
import type { IconName } from '@/types/game';

interface ScrollBuyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuyScroll: () => void;
    scrollStage: 'initial' | 'lifting' | 'faded';
    availableScrolls: IconName[];
    revealedScrollColor: IconName | null;
    gold: number;
    scrollCost: number;
}

export function ScrollBuyModal({
    isOpen, onClose, onBuyScroll, scrollStage, availableScrolls, revealedScrollColor, gold, scrollCost,
}: ScrollBuyModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4" onClick={onClose}>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-black border border-zinc-800 flex flex-col p-5 relative overflow-hidden w-full max-w-sm"
                            style={{ minHeight: 'min(380px, 60svh)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-white font-bold uppercase tracking-widest leading-none">SCROLL TYPE</h2>
                                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors uppercase text-xs tracking-widest">Close</button>
                            </div>

                            <div className="flex justify-center mb-6">
                                {scrollStage === 'initial' ? (
                                    <button
                                        onClick={onBuyScroll}
                                        disabled={gold < scrollCost}
                                        className={`py-3 px-6 w-full font-bold uppercase tracking-widest text-sm border ${gold >= scrollCost ? 'bg-black text-white border-zinc-800' : 'bg-black text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
                                    >
                                        Buy Scroll {gold < scrollCost ? `(Need ${scrollCost}g)` : `(${scrollCost}g)`}
                                    </button>
                                ) : (
                                    <div className="py-3 px-6 w-full text-center font-bold uppercase tracking-widest text-sm bg-black text-white border border-zinc-800 opacity-50">
                                        Unlocking...
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-h-[12rem] border border-zinc-800 bg-black flex flex-col items-center justify-center relative overflow-hidden p-4">
                                <div className="relative flex w-full h-full items-center justify-center">
                                    {availableScrolls.map((color, i) => {
                                        const isRevealed = revealedScrollColor === color;
                                        const spacing = availableScrolls.length > 5 ? 25 : 35;
                                        const xPos = (i - (availableScrolls.length - 1) / 2) * spacing;
                                        const yPos = (isRevealed && (scrollStage === 'lifting' || scrollStage === 'faded')) ? -25 : 10;
                                        const opacity = (!isRevealed && scrollStage === 'faded') ? 0 : 1;

                                        return (
                                            <motion.div
                                                key={color}
                                                className="absolute"
                                                initial={{ x: xPos, y: 10, opacity: 1 }}
                                                animate={{ y: yPos, x: xPos, opacity, zIndex: i }}
                                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                            >
                                                <Icon name={color} scale={4} tintColor={ICON_THEME[color]} />
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
                                    <AnimatePresence>
                                        {scrollStage === 'faded' && revealedScrollColor && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                                className="text-sm text-white font-black uppercase tracking-[0.2em] leading-none text-center"
                                            >
                                                {revealedScrollColor.replace('-scroll', '')}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
