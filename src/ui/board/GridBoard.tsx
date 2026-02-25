import { motion, AnimatePresence } from 'framer-motion';
import { cn, getCoordinates, getStatText } from '@/lib/utils';
import { Icon } from '../shared/Icon';
import { ICON_THEME, ICON_CATEGORIES, ICON_EXTRA_EFFECTS } from '@/lib/constants';
import type { GridItem } from '@/types/game';

interface GridBoardProps {
    gridIcons: (GridItem | null)[];
    spinKey: number;
    matchingIndices: Set<number>;
    glowingIndices: number[];
    activeHoodedIndex: number | null;
    selectedIndex: number | null;
    selectedEquippedItem: GridItem | null;
    isShaking: boolean;
    onIconClick: (item: GridItem, index: number) => void;
    onEmptyGlowClick: (index: number) => void;
    levelUpPerks: string[];
}

export function GridBoard({
    gridIcons, spinKey, matchingIndices, glowingIndices, activeHoodedIndex,
    selectedIndex, selectedEquippedItem, isShaking, onIconClick, onEmptyGlowClick, levelUpPerks,
}: GridBoardProps) {

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        show: { opacity: 1, scale: 1 },
        shake: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    };

    const displayItem = selectedIndex !== null ? gridIcons[selectedIndex] : selectedEquippedItem;
    const isDisplayItemBoosted = selectedIndex !== null ? matchingIndices.has(selectedIndex) : false;

    return (
        <div className="flex flex-col items-center shrink-0" style={{ gap: 'var(--gap)', width: 'calc(var(--cell) * 4 + var(--gap) * 3)' }}>
            <motion.div
                key={spinKey}
                className="grid grid-cols-4 grid-rows-3 relative"
                style={{ gap: 'var(--gap)' }}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Subtle soft background glow behind grid */}
                <div className="absolute inset-0 bg-blue-900/10 blur-[50px] pointer-events-none rounded-full" />

                <AnimatePresence mode="popLayout">
                    {gridIcons.map((item, index) => {
                        const isMatching = matchingIndices.has(index);
                        const isNonTargetMatch = isMatching && !glowingIndices.includes(index);
                        const isSelected = selectedIndex === index && !glowingIndices.includes(index);
                        const isTarget = glowingIndices.includes(index) && activeHoodedIndex !== null;

                        let arrowRotation = 0;
                        if (isTarget && activeHoodedIndex !== null) {
                            const { row: sr, col: sc } = getCoordinates(activeHoodedIndex);
                            const { row: tr, col: tc } = getCoordinates(index);
                            if (tr < sr) arrowRotation = 0;
                            else if (tr > sr) arrowRotation = 180;
                            else if (tc < sc) arrowRotation = 270;
                            else if (tc > sc) arrowRotation = 90;
                        }

                        return (
                            <motion.div
                                key={item?.id ?? `empty-${index}`}
                                layout
                                variants={itemVariants}
                                animate={isShaking ? 'shake' : undefined}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className={cn(
                                    'flex items-center justify-center relative rounded-xl transition-colors duration-300 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:rounded-xl',
                                    isNonTargetMatch ? 'bg-zinc-900/80 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                        : isSelected ? 'bg-zinc-800/90 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                            : 'bg-zinc-950/60 border border-zinc-800/60 shadow-inner hover:bg-zinc-800/50'
                                )}
                                style={{ width: 'var(--cell)', height: 'var(--cell)' }}
                            >
                                {isTarget && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ transform: `rotate(${arrowRotation}deg)` }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
                                        </svg>
                                    </div>
                                )}
                                {item ? (
                                    <Icon
                                        name={item.name} scale={3} tintColor={ICON_THEME[item.name]}
                                        onClick={() => onIconClick(item, index)}
                                        className={cn('relative z-10 hover:brightness-125 transition-all active:scale-95 drop-shadow-md', (activeHoodedIndex === index && item.name === 'hood') && 'brightness-125')}
                                    />
                                ) : glowingIndices.includes(index) ? (
                                    <div onClick={() => onEmptyGlowClick(index)} className="w-full h-full cursor-pointer relative z-10" />
                                ) : (
                                    <div className="w-full h-full" />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Info Text */}
            <div className="w-full min-w-0 flex items-start justify-center text-center bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-[2px] shadow-inner p-2 relative" style={{ minHeight: 'calc(var(--cell) * 1.5)' }}>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                {displayItem ? (
                    <div className="flex flex-col items-center justify-start w-full min-w-0 gap-1 relative z-10">
                        <div className="font-bold tracking-widest uppercase w-full min-w-0 break-words drop-shadow-sm flex items-center justify-center gap-2" style={{ fontSize: 'var(--text-base)' }}>
                            <span className="text-zinc-100">{displayItem.name.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 leading-none">
                                {ICON_CATEGORIES[displayItem.name]}
                            </span>
                        </div>
                        <div className="font-bold tracking-widest text-teal-400/90 uppercase w-full min-w-0 break-words drop-shadow-md" style={{ fontSize: 'var(--text-sm)' }}>
                            {getStatText(displayItem.name, isDisplayItemBoosted, levelUpPerks)}
                        </div>
                        <div className="font-semibold tracking-wider uppercase text-zinc-500 flex items-center justify-center w-full min-w-0 leading-tight whitespace-normal break-words" style={{ fontSize: 'var(--text-xs)', minHeight: 14 }}>
                            {ICON_EXTRA_EFFECTS[displayItem.name] ? (
                                ICON_EXTRA_EFFECTS[displayItem.name]?.includes('[perspective-dice-random icon]') ? (
                                    <span className="flex items-center justify-center gap-1 w-full min-w-0 whitespace-normal break-words">
                                        <i className="ra ra-perspective-dice-random text-zinc-400" style={{ fontSize: 12 }} /> costs 1 if experience is {'<'}3
                                    </span>
                                ) : ICON_EXTRA_EFFECTS[displayItem.name]
                            ) : ''}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest" style={{ fontSize: 'var(--text-sm)', minHeight: '3rem' }}>
                        Select an icon
                    </div>
                )}
            </div>
        </div>
    );
}
