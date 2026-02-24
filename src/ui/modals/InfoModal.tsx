import { Modal } from '../shared/Modal';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Info"
            align="top-right"
            className="max-w-[var(--info-modal-w)] p-4"
        >
            <div />
        </Modal>
    );
}
