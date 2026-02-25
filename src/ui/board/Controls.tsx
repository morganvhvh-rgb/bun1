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
    const btnClass = 'relative bg-zinc-950/80 backdrop-blur-md border border-zinc-800 hover:border-zinc-600 rounded-xl grid place-items-center focus:outline-none transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(0,0,0,0.5)] active:scale-95 group overflow-hidden';

    return (
        <div className="relative flex flex-col" style={{ gap: 'var(--gap)', marginLeft: '2px' }}>
            <motion.button onClick={onSpin} disabled={gold < GAME_CONSTANTS.SPIN_COST || isAnimating || isUnlockingMode} className={btnClass} style={btnStyle} title="Spin">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none group-hover:from-white/10" />
                <i className="ra ra-cycle text-zinc-300 drop-shadow-md group-hover:text-white transition-colors" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
            </motion.button>

            <motion.button onClick={onVary} disabled={gold < shuffleCost || isAnimating || isUnlockingMode} className={btnClass} style={btnStyle} title="Shuffle">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none group-hover:from-white/10" />
                <i className="ra ra-perspective-dice-random text-zinc-300 drop-shadow-md group-hover:text-white transition-colors" style={{ fontSize: 'calc(var(--cell) * 0.55)' }} />
            </motion.button>

            <motion.button type="button" onClick={onScrollsOpen} className={cn(btnClass)} style={btnStyle} title="Scrolls">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none group-hover:from-white/10" />
                <Icon name="scroll-unfurled" scale={1.8} tintColor="#a1a1aa" className="drop-shadow-md group-hover:brightness-125 transition-all" />
                <div className="absolute inset-0 text-white font-black leading-none flex items-center justify-center pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ fontSize: 'var(--text-base)' }}>
                    {keptScrolls.length}
                </div>
            </motion.button>

            {/* Coffee Button */}
            <button
                type="button"
                onClick={onCoffeeOpen}
                className="absolute left-1/2 -translate-x-1/2 rounded-full grid place-items-center focus:outline-none active:scale-95 transition-all bg-blue-600/90 border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] backdrop-blur-md overflow-hidden"
                style={{
                    top: 'var(--coffee-btn-offset)',
                    width: 'var(--coffee-btn-size)',
                    height: 'var(--coffee-btn-size)'
                }}
                title="Coffee"
                aria-label="Open coffee popup"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <i className="ra ra-coffee-mug text-white relative z-10 drop-shadow-md" style={{ fontSize: 'var(--coffee-icon-size)' }} />
            </button>
        </div>
    );
}
