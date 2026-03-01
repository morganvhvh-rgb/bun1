import { useState } from 'react';
import { Modal } from '../shared/Modal';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    const [page, setPage] = useState(1);
    const totalPages = 3;

    const handleNext = () => {
        if (page < totalPages) {
            setPage(page + 1);
        } else {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Page ${page} of ${totalPages}`}
            position="center"
            className="w-2/3 h-2/3 max-w-2xl max-h-[600px] flex flex-col"
            closeOnOutsideClick={false}
        >
            <div className="flex-1 min-h-0 flex flex-col pt-4">
                {/* Content area based on page */}
                <div className="flex-1 w-full flex items-center justify-center text-zinc-500 font-mono text-xs">
                    [Tutorial Page {page} Content]
                </div>

                {/* Navigation */}
                <div className="flex pt-4 mt-auto border-t border-white/10 shrink-0">
                    <button
                        onClick={handleNext}
                        className="flex-1 flex justify-center items-center bg-white text-black font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-sm hover:focus-visible:ring-2 hover:bg-zinc-200 transition-colors"
                    >
                        {page < totalPages ? (
                            <div className="flex items-center gap-2">
                                <span>Next</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        ) : 'Close'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
