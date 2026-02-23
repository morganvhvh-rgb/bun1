import { motion } from 'framer-motion';
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

    const btnStyle: React.CSSProperties = { width: 'var(--cell)', height: 'var(--cell)' };
    const btnClass = 'bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md grid place-items-center focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <div className="flex flex-col" style={{ gap: 'var(--gap)', marginLeft: '2px' }}>
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
        </div>
    );
}
