import { AnimatePresence, motion } from 'framer-motion';

interface GameOverModalProps {
    isOpen: boolean;
    onReset: () => void;
}

export function GameOverModal({ isOpen, onReset }: GameOverModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="gameover-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(20,0,0,0.85)' }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.5, delay: 0.1 }}
                        className="relative z-10 flex flex-col items-center gap-6 px-10 py-10 rounded-3xl border border-red-500/20"
                        style={{ background: 'rgba(20,10,10,0.95)', boxShadow: '0 0 60px rgba(220,38,38,0.3), 0 8px 32px rgba(0,0,0,0.8)' }}
                    >
                        {/* Glow ring */}
                        <div
                            className="absolute inset-0 rounded-3xl pointer-events-none"
                            style={{ boxShadow: 'inset 0 0 40px rgba(220,38,38,0.1)' }}
                        />

                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[11px] font-bold tracking-[0.35em] uppercase text-red-500/70">
                                You Have Fallen
                            </span>
                            <h2
                                className="text-5xl font-black tracking-widest uppercase text-red-500"
                                style={{
                                    textShadow: '0 0 30px rgba(220,38,38,0.6), 0 2px 4px rgba(0,0,0,1)',
                                }}
                            >
                                GAME OVER
                            </h2>
                        </div>

                        <button
                            onClick={onReset}
                            className="mt-2 px-8 py-3 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm transition-all active:scale-95 active:opacity-70 touch-manipulation"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444, #991b1b)',
                                color: '#ffffff',
                                boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
                            }}
                        >
                            Try Again
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
