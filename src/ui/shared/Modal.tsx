import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    /** 'center' = centered card, 'top' = slides from top, 'bottom' = slides from bottom */
    position?: 'center' | 'top' | 'bottom';
    /** Only applies to 'center' position */
    align?: 'center' | 'top-right';
    showHeader?: boolean;
    closeOnOutsideClick?: boolean;
    /** Extra classes on the inner card */
    className?: string;
    children: React.ReactNode;
}

const slideVariants = {
    top: { hidden: { y: '-100%' }, visible: { y: 0 }, exit: { y: '-100%' } },
    bottom: { hidden: { y: '100%' }, visible: { y: 0 }, exit: { y: '100%' } },
    center: { hidden: { scale: 0.85, opacity: 0 }, visible: { scale: 1, opacity: 1 }, exit: { scale: 0.85, opacity: 0 } },
};

const positionClasses = {
    top: 'fixed top-0 left-0 right-0',
    bottom: 'fixed bottom-0 left-0 right-0',
    center: 'w-full max-w-sm',
};

export function Modal({
    isOpen,
    onClose,
    title,
    position = 'center',
    align = 'center',
    showHeader = true,
    closeOnOutsideClick = false,
    className = '',
    children,
}: ModalProps) {
    const pos = position;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 z-[60]"
                    />

                    {/* Positioner */}
                    <div
                        className={cn(
                            'fixed inset-0 z-[70] flex p-4',
                            pos !== 'center'
                                ? 'items-center justify-center pointer-events-none'
                                : align === 'top-right'
                                    ? 'items-start justify-end'
                                    : 'items-center justify-center'
                        )}
                        onClick={closeOnOutsideClick ? onClose : undefined}
                    >
                        <motion.div
                            variants={slideVariants[pos]}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={cn(
                                'bg-black border border-zinc-800 flex flex-col p-5 pointer-events-auto',
                                positionClasses[pos],
                                className
                            )}
                            onClick={(e) => e.stopPropagation()}
                            style={pos !== 'center' ? { height: '50%' } : undefined}
                        >
                            {/* Header */}
                            {showHeader && (
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-white font-bold uppercase tracking-widest leading-none text-sm">{title}</h2>
                                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors uppercase text-xs tracking-widest">Close</button>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-h-0 overflow-y-auto">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
