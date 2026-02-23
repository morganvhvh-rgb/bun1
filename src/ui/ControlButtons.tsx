import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { GAME_CONSTANTS } from '@/lib/constants';

interface ControlButtonsProps {
    gold: number;
    shuffleCost: number;
    isAnimating: boolean;
    isUnlockingMode: boolean;
    keptScrollsCount: number;
    onSpin: () => void;
    onVary: () => void;
    onScrollsOpen: () => void;
}

const controlButtonClass = "bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md grid place-items-center focus:outline-none transition-colors w-14 h-14 disabled:opacity-50 disabled:cursor-not-allowed";

export function ControlButtons({
    gold, shuffleCost, isAnimating, isUnlockingMode,
    keptScrollsCount, onSpin, onVary, onScrollsOpen
}: ControlButtonsProps) {
    return (
        <div className="flex flex-col gap-3 ml-2">
            <motion.button onClick={onSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={controlButtonClass} title="Spin">
                <i className="ra ra-cycle text-zinc-400" style={{ fontSize: 32 }} />
            </motion.button>
            <motion.button onClick={onVary} disabled={gold < shuffleCost || isAnimating || isUnlockingMode} whileTap={{ scale: 0.95 }} className={controlButtonClass} title="Shuffle">
                <i className="ra ra-perspective-dice-random text-zinc-400" style={{ fontSize: 32 }} />
            </motion.button>
            <motion.button
                type="button"
                onClick={onScrollsOpen}
                whileTap={{ scale: 0.95 }}
                className={cn(controlButtonClass, "relative")}
                title="Scrolls"
            >
                <Icon name="scroll-unfurled" scale={2} tintColor="#a1a1aa" />
                <div className="absolute inset-0 text-white text-base font-black leading-none flex items-center justify-center pointer-events-none">
                    {keptScrollsCount}
                </div>
            </motion.button>
        </div>
    );
}
