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
    onCoffeeOpen: () => void;
}

export function Controls({ shuffleCost, isAnimating, onSpin, onVary, onScrollsOpen, onCoffeeOpen }: ControlsProps) {
    const { gold, isUnlockingMode, keptScrolls } = useGameStore();

    const btnStyle: React.CSSProperties = { width: 'var(--cell)', height: 'var(--cell)' };
    const btnClass = 'relative bg-black border border-zinc-600 flex items-center justify-center focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden';

    return (
        <div className="relative flex flex-col" style={{ gap: 'var(--gap)' }}>
            <motion.button onClick={onSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating || isUnlockingMode} className={btnClass} style={btnStyle} title="Spin">
                <i className="ra ra-cycle text-white" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
            </motion.button>

            <motion.button onClick={onVary} disabled={gold < shuffleCost || isAnimating || isUnlockingMode} className={btnClass} style={btnStyle} title="Shuffle">
                <i className="ra ra-perspective-dice-random text-white" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
            </motion.button>

            <motion.button type="button" onClick={onScrollsOpen} className={cn(btnClass)} style={btnStyle} title="Scrolls">
                <Icon name="scroll-unfurled" scale={1.8} tintColor="#fff" />
                <div className="absolute inset-0 text-white font-bold flex items-center justify-center pointer-events-none" style={{ fontSize: 'var(--text-base)' }}>
                    {keptScrolls.length}
                </div>
            </motion.button>

            {/* Coffee Button */}
            <button
                type="button"
                onClick={onCoffeeOpen}
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center focus:outline-none bg-black border border-zinc-600"
                style={{
                    top: 'var(--coffee-btn-offset)',
                    width: 'var(--coffee-btn-size)',
                    height: 'var(--coffee-btn-size)'
                }}
                title="Coffee"
                aria-label="Open coffee popup"
            >
                <i className="ra ra-coffee-mug text-white" style={{ fontSize: 'var(--coffee-icon-size)' }} />
            </button>
        </div>
    );
}
