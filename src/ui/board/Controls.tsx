import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { GAME_CONSTANTS } from '@/lib/constants';

interface ControlsProps {
    shuffleCost: number;
    isAnimating: boolean;
    onSpin: () => void;
    onVary: () => void;
    onScrollsOpen: () => void;
}

export function Controls({ shuffleCost, isAnimating, onSpin, onVary, onScrollsOpen }: ControlsProps) {
    const { gold, isUnlockingMode, keptScrolls } = useGameStore();
    const [isCoffeePopupOpen, setIsCoffeePopupOpen] = useState(false);

    const btnStyle: React.CSSProperties = { width: 'var(--cell)', height: 'var(--cell)' };
    const btnClass = 'bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md grid place-items-center focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <>
            <div className="relative flex flex-col" style={{ gap: 'var(--gap)', marginLeft: '2px' }}>
                <motion.button onClick={onSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={btnClass} style={btnStyle} title="Spin">
                    <i className="ra ra-cycle text-zinc-400" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
                </motion.button>
                <motion.button onClick={onVary} disabled={gold < shuffleCost || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={btnClass} style={btnStyle} title="Shuffle">
                    <i className="ra ra-perspective-dice-random text-zinc-400" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
                </motion.button>
                <motion.button type="button" onClick={onScrollsOpen} whileTap={{ scale: 0.95 }} className={cn(btnClass, 'relative')} style={btnStyle} title="Scrolls">
                    <Icon name="scroll-unfurled" scale={1.8} tintColor="#a1a1aa" />
                    <div className="absolute inset-0 text-white text-sm font-black leading-none flex items-center justify-center pointer-events-none">
                        {keptScrolls.length}
                    </div>
                </motion.button>

                <button
                    type="button"
                    onClick={() => setIsCoffeePopupOpen(true)}
                    className="absolute left-1/2 -translate-x-1/2 rounded-full grid place-items-center focus:outline-none active:scale-95 transition-transform"
                    style={{
                        top: 'calc((var(--cell) * 3) + (var(--gap) * 3))',
                        width: 'calc(var(--cell) * 0.68)',
                        height: 'calc(var(--cell) * 0.68)',
                        backgroundColor: '#2563eb',
                        border: '1px solid #1d4ed8'
                    }}
                    title="Coffee"
                    aria-label="Open coffee popup"
                >
                    <i className="ra ra-coffee-mug text-white" style={{ fontSize: 'calc(var(--cell) * 0.34)' }} />
                </button>
            </div>

            <AnimatePresence>
                {isCoffeePopupOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close coffee popup"
                            onClick={() => setIsCoffeePopupOpen(false)}
                            className="fixed inset-0 bg-black/70 z-[60]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.85, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="relative w-full max-w-[12rem] h-[8rem] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsCoffeePopupOpen(false)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors grid place-items-center leading-none"
                                    aria-label="Close coffee popup"
                                >
                                    <span style={{ fontSize: '16px', lineHeight: 1 }}>×</span>
                                </button>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
