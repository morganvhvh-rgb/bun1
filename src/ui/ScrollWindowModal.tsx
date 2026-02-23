import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { ICON_THEME } from '@/lib/constants';
import type { IconName } from '@/types/game';

interface ScrollWindowModalProps {
    isOpen: boolean;
    keptScrolls: IconName[];
    onClose: () => void;
}

export function ScrollWindowModal({ isOpen, keptScrolls, onClose }: ScrollWindowModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[60]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 rounded-t-3xl shadow-2xl z-[70] flex flex-col p-6"
                        style={{ height: '50%' }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-zinc-100 font-bold uppercase tracking-widest">Scroll Content</h2>
                            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs tracking-widest">Close</button>
                        </div>
                        <div className="flex-1 border border-zinc-800/50 bg-zinc-950/50 rounded p-4 text-zinc-600 text-sm font-mono space-y-2 overflow-y-auto">
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
                                            <div className="text-[10px] text-zinc-500">
                                                Does X to Y twice
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="opacity-50 text-center mt-4 pt-4">No scrolls collected</div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
