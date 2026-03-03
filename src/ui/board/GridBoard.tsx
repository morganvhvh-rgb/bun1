import { motion, AnimatePresence } from 'framer-motion';
import { cn, getCoordinates, getStatText } from '@/lib/utils';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME, SYMBOL_CATEGORIES, SYMBOL_EXTRA_EFFECTS, CATEGORY_BADGE_THEME } from '@/lib/constants';
import type { GridSymbol } from '@/types/game';

interface GridBoardProps {
    gridSymbols: (GridSymbol | null)[];
    spinKey: number;
    matchingIndices: Set<number>;
    glowingIndices: number[];
    activeRogueIndex: number | null;
    selectedIndex: number | null;
    selectedEquippedSymbol: GridSymbol | null;
    isSpinning: boolean;
    onSymbolClick: (symbol: GridSymbol, index: number) => void;
    onEmptyGlowClick: (index: number) => void;
    levelUpPerks: string[];
    hasSpecialScroll: boolean;
    areAllSlotsUnlocked: boolean;
}

function formatStatText(text: string, symbolName: string) {
    if (symbolName === 'brandy-bottle') {
        return <span className="text-red-500">{text}</span>;
    }

    const regex = /(Heal \d+ HP|[+-]?\d+(?:%)? (?:Max )?(?:Gold|Gear|ATK|Magic|HP|EXP)|\?\?\?)/gi;
    const parts = text.split(regex);

    return parts.map((part, i) => {
        if (!part) return null;
        const lower = part.toLowerCase();
        let colorClass = "";

        if (lower.includes('gold')) {
            colorClass = "text-yellow-400";
        } else if (lower.includes('gear')) {
            colorClass = "text-blue-400";
        } else if (lower.includes('atk')) {
            colorClass = "text-orange-400";
        } else if (lower.includes('magic')) {
            colorClass = "text-pink-400";
        } else if (lower.includes('hp')) {
            colorClass = "text-red-500";
        } else if (lower.includes('exp')) {
            colorClass = "text-green-500";
        } else if (lower.includes('???') && symbolName === 'spades-card') {
            colorClass = "text-white";
        }

        return colorClass ? <span key={i} className={colorClass}>{part}</span> : <span key={i}>{part}</span>;
    });
}

export function GridBoard({
    gridSymbols, spinKey, matchingIndices, glowingIndices, activeRogueIndex,
    selectedIndex, selectedEquippedSymbol, isSpinning, onSymbolClick, onEmptyGlowClick, levelUpPerks,
    hasSpecialScroll, areAllSlotsUnlocked,
}: GridBoardProps) {

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
    };
    const symbolVariants = {
        hidden: ({ isSpinning }: { index: number, isSpinning: boolean }) => ({
            opacity: isSpinning ? 0 : 1,
            scale: isSpinning ? 0.8 : 1,
            y: isSpinning ? -30 : 0,
        }),
        show: ({ index, isSpinning }: { index: number, isSpinning: boolean }) => {
            if (!isSpinning) {
                return {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { duration: 0 }
                };
            }
            const col = index % 4;
            const row = Math.floor(index / 4);
            const order = (col * 3) + row;
            const delay = order * 0.09;
            return {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { delay, type: 'spring' as const, stiffness: 500, damping: 28 }
            };
        },
    };

    const displaySymbol = selectedIndex !== null ? gridSymbols[selectedIndex] : selectedEquippedSymbol;
    const isDisplaySymbolBoosted = selectedIndex !== null ? matchingIndices.has(selectedIndex) : !!selectedEquippedSymbol?.isBoosted;
    const displayCategory = displaySymbol ? SYMBOL_CATEGORIES[displaySymbol.name] : null;
    const categoryTheme = displayCategory ? CATEGORY_BADGE_THEME[displayCategory] : null;

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
                <AnimatePresence mode="popLayout">
                    {gridSymbols.map((symbol, index) => {
                        const isMatching = matchingIndices.has(index);
                        const isNonTargetMatch = isMatching && !glowingIndices.includes(index);
                        const isSelected = selectedIndex === index && !glowingIndices.includes(index);
                        const isTarget = glowingIndices.includes(index) && activeRogueIndex !== null;

                        let arrowRotation = 0;
                        if (isTarget && activeRogueIndex !== null) {
                            const { row: sr, col: sc } = getCoordinates(activeRogueIndex);
                            const { row: tr, col: tc } = getCoordinates(index);
                            if (tr < sr) arrowRotation = 0;
                            else if (tr > sr) arrowRotation = 180;
                            else if (tc < sc) arrowRotation = 270;
                            else if (tc > sc) arrowRotation = 90;
                        }

                        return (
                            <motion.div
                                key={symbol?.id ?? `empty-${index}`}
                                layout
                                custom={{ index, isSpinning }}
                                variants={symbolVariants}
                                initial="hidden"
                                animate="show"
                                transition={{ layout: { type: 'tween', duration: 0.18, ease: 'easeInOut' } }}
                                className={cn(
                                    'flex items-center justify-center relative transition-colors duration-300 rounded-2xl',
                                    isNonTargetMatch ? 'bg-teal-900 border border-teal-500/40'
                                        : isSelected ? 'bg-zinc-800 border border-white/20'
                                            : !symbol ? 'bg-zinc-950 border border-white/5 hover:bg-zinc-900 hover:border-white/10'
                                                : 'bg-zinc-950 border border-white/5 hover:border-white/10 hover:bg-zinc-900'
                                )}
                                style={{
                                    width: 'var(--cell)',
                                    height: 'var(--cell)',
                                    // Hood always renders on top so it slides over adjacent cells, not under them
                                    zIndex: symbol?.name === 'hood' ? 20 : 'auto',
                                }}
                            >
                                {isTarget && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none" style={{ transform: `rotate(${arrowRotation}deg)` }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
                                        </svg>
                                    </div>
                                )}
                                {symbol ? (
                                    <div className="relative z-10 active:opacity-50 cursor-pointer">
                                        <Icon
                                            name={symbol.name} scale={3} tintColor={SYMBOL_THEME[symbol.name]}
                                            onClick={() => onSymbolClick(symbol, index)}
                                            className={cn((activeRogueIndex === index && symbol.name === 'hood') && 'opacity-80')}
                                        />
                                    </div>
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
            <div className="w-full min-w-0 flex items-start justify-center text-center p-2 relative text-white" style={{ minHeight: 'calc(var(--cell) * 1.5)' }}>
                {displaySymbol ? (
                    <div className="flex flex-col items-center justify-start w-full min-w-0 gap-1 relative z-10">
                        <div className="font-bold tracking-widest uppercase w-full min-w-0 break-words flex items-center justify-center gap-2 font-mono" style={{ fontSize: 'var(--text-base)' }}>
                            <span className="text-white drop-shadow-sm">{displaySymbol.name.replace(/_/g, ' ')}</span>
                            <span className={cn(
                                "text-[10px] sm:text-[11px] px-1.5 py-0.5 border rounded-md leading-none font-sans",
                                categoryTheme?.className ?? 'text-zinc-200 border-zinc-300/35 bg-zinc-500/12'
                            )}>
                                {categoryTheme?.label ?? displayCategory}
                            </span>
                        </div>
                        <div className={cn(
                            "font-bold tracking-widest uppercase w-full min-w-0 break-words",
                            SYMBOL_CATEGORIES[displaySymbol.name] === 'Special' ? 'text-[#a16207]' : 'text-teal-400'
                        )} style={{ fontSize: 'var(--text-sm)' }}>
                            {formatStatText(getStatText(displaySymbol.name, isDisplaySymbolBoosted, levelUpPerks, hasSpecialScroll, areAllSlotsUnlocked), displaySymbol.name)}
                        </div>
                        <div className="font-bold tracking-wider uppercase text-zinc-400 flex items-center justify-center w-full min-w-0 leading-tight whitespace-normal break-words" style={{ fontSize: 'var(--text-xs)', minHeight: 14 }}>
                            {SYMBOL_EXTRA_EFFECTS[displaySymbol.name] ? (
                                SYMBOL_EXTRA_EFFECTS[displaySymbol.name]?.includes('[perspective-dice-random symbol]') ? (
                                    <span className="flex items-center justify-center gap-1 w-full min-w-0 whitespace-normal break-words">
                                        <i className="ra ra-perspective-dice-random" style={{ fontSize: 12 }} /> costs 1 if experience is {'<'}3
                                    </span>
                                ) : SYMBOL_EXTRA_EFFECTS[displaySymbol.name]
                            ) : ''}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold uppercase tracking-widest" style={{ fontSize: 'var(--text-sm)', minHeight: '3rem' }}>
                        Select a symbol
                    </div>
                )}
            </div>
        </div>
    );
}
