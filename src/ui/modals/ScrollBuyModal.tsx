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
                                <h2 className="text-white font-bold uppercase tracking-widest leading-none">SCROLLS</h2>
                                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors uppercase text-xs tracking-widest">Close</button>
                            </div>

                            <div className="flex justify-center mb-6">
                                {scrollStage === 'initial' ? (
                                    <button
                                        onClick={onBuyScroll}
                                        disabled={gold < scrollCost}
                                        className={`py-3 px-6 w-full font-bold uppercase tracking-widest text-sm border transition-colors ${gold >= scrollCost
                                            ? 'bg-[#5c3a21] hover:bg-[#6b442a] text-white border-[#8b5a33] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                                            : 'bg-[#3a2012] text-[#8b5a33] border-[#4a2e1b] cursor-not-allowed'
                                            }`}
                                    >
                                        BUY SCROLL - <span className="text-[#eab308]">{scrollCost} GOLD</span>
                                    </button>
                                ) : (
                                    <div className="py-3 px-6 w-full text-center font-bold uppercase tracking-widest text-sm bg-[#5c3a21] text-[#fcd0a1] border border-[#8b5a33] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] opacity-50">
                                        REVEALING...
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-h-[12rem] flex flex-col items-center justify-center relative overflow-hidden p-4">
                                <div className="relative flex w-full h-full items-center justify-center">
                                    {availableScrolls.map((color, i) => {
                                        const isRevealed = revealedScrollColor === color;
                                        const centerIndex = (availableScrolls.length - 1) / 2;
                                        const offsetFromCenter = i - centerIndex;
                                        const spacing = availableScrolls.length > 5 ? 26 : 35;

                                        let xPos = offsetFromCenter * spacing;
                                        const rotate = offsetFromCenter * 8;
                                        const archY = Math.pow(offsetFromCenter, 2) * 3;
                                        let yPos = 10 + archY;

                                        if (isRevealed && (scrollStage === 'lifting' || scrollStage === 'faded')) {
                                            xPos = 0;
                                            yPos = -25;
                                        }

                                        const opacity = (!isRevealed && scrollStage === 'faded') ? 0 : 1;

                                        return (
                                            <motion.div
                                                key={color}
                                                className="absolute drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                                                initial={{ x: xPos, y: 20, opacity: 1, rotate }}
                                                animate={{
                                                    y: yPos,
                                                    x: xPos,
                                                    opacity,
                                                    zIndex: (isRevealed && scrollStage !== 'initial') ? 50 : i,
                                                    rotate: isRevealed && scrollStage !== 'initial' ? 0 : rotate
                                                }}
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
                                                {revealedScrollColor.replace('-scroll', '')} SCROLL
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
