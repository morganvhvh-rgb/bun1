import { Modal } from '../shared/Modal';

interface CoffeeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CoffeeModal({ isOpen, onClose }: CoffeeModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            showHeader={false}
            closeOnOutsideClick
            className="max-w-[var(--coffee-modal-w)] h-[var(--coffee-modal-h)] p-0 relative"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-2 right-2 w-6 h-6 border border-slate-400/25 bg-slate-950/85 text-slate-100 hover:bg-slate-800/80 transition-colors grid place-items-center leading-none rounded-md"
                aria-label="Close coffee popup"
            >
                <span style={{ fontSize: '16px', lineHeight: 1 }}>&times;</span>
            </button>
        </Modal>
    );
}
