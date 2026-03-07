import { AnimatePresence, motion } from 'framer-motion';

interface GameOverModalProps {
    isOpen: boolean;
    onReset: () => void;
}

export function GameOverModal({ isOpen, onReset }: GameOverModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="gameover-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 pointer-events-auto"
            >
                <div className="bg-black border border-zinc-900 flex flex-col p-5 w-full max-w-sm">
                    <div className="flex flex-col items-center gap-4 py-6">
                        <span className="text-[11px] font-bold tracking-[0.35em] uppercase text-red-500/70">
                            You Have Fallen
                        </span>
                        <h2 className="text-4xl font-black tracking-widest uppercase text-red-500">
                            GAME OVER
                        </h2>
                    </div>

                    <button
                        onClick={onReset}
                        className="mt-6 py-3 px-6 w-full font-bold uppercase tracking-widest text-sm border transition-colors bg-black text-[#e8d4b8] border-zinc-800 hover:bg-zinc-900"
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
