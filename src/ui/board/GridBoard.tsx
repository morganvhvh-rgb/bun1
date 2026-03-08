import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getCoordinates, getStatText } from '@/lib/utils';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME, SYMBOL_CATEGORIES, SYMBOL_EXTRA_EFFECTS, CATEGORY_BADGE_THEME, CATEGORY_TEXT_THEME } from '@/lib/constants';
import type { GridSymbol } from '@/types/game';
import type { LevelUpPerk } from '@/types/levelUp';
import type { EffectPopup } from '../hooks/useGridInteraction';

interface GridBoardProps {
    gridSymbols: (GridSymbol | null)[];
    spinKey: number;
    matchingIndices: Set<number>;
    goldCostPopups: { id: string; index: number; amount: number }[];
    effectPopups: EffectPopup[];
    glowingIndices: number[];
    activeRogueIndex: number | null;
    selectedIndex: number | null;
    selectedEquippedSymbol: GridSymbol | null;
    isSpinning: boolean;
    onSymbolClick: (symbol: GridSymbol, index: number) => void;
    onEmptyGlowClick: (index: number) => void;
    levelUpPerks: LevelUpPerk[];
    hasSpecialScroll: boolean;
    areAllSlotsUnlocked: boolean;
}

const MATCH_SPARKLES = [
    { top: '14%', left: '18%', size: 12, delay: 0, duration: 1.45, color: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)', driftX: '-3px', driftY: '-6px' },
    { top: '24%', left: '72%', size: 10, delay: 0.18, duration: 1.6, color: '#facc15', glow: 'rgba(250, 204, 21, 0.58)', driftX: '4px', driftY: '-5px' },
    { top: '48%', left: '24%', size: 11, delay: 0.32, duration: 1.5, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.58)', driftX: '-5px', driftY: '2px' },
    { top: '68%', left: '64%', size: 9, delay: 0.08, duration: 1.35, color: '#34d399', glow: 'rgba(52, 211, 153, 0.54)', driftX: '3px', driftY: '5px' },
    { top: '58%', left: '78%', size: 8, delay: 0.26, duration: 1.7, color: '#c084fc', glow: 'rgba(192, 132, 252, 0.55)', driftX: '6px', driftY: '1px' },
    { top: '76%', left: '34%', size: 10, delay: 0.4, duration: 1.55, color: '#fb7185', glow: 'rgba(251, 113, 133, 0.56)', driftX: '-4px', driftY: '5px' },
];

const EFFECT_COLOR: Record<string, { text: string; shadow: string }> = {
    Gold: { text: CATEGORY_TEXT_THEME.Treasure, shadow: 'rgba(234, 179, 8, 0.45)' },
    EXP: { text: CATEGORY_TEXT_THEME.Nature, shadow: 'rgba(34, 197, 94, 0.45)' },
    Magic: { text: CATEGORY_TEXT_THEME.Magic, shadow: 'rgba(236, 72, 153, 0.45)' },
    Gear: { text: CATEGORY_TEXT_THEME.Armor, shadow: 'rgba(59, 130, 246, 0.45)' },
    Slot: { text: CATEGORY_TEXT_THEME.Special, shadow: 'rgba(217, 119, 6, 0.45)' },
};

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
            colorClass = CATEGORY_TEXT_THEME.Treasure;
        } else if (lower.includes('gear')) {
            colorClass = CATEGORY_TEXT_THEME.Armor;
        } else if (lower.includes('atk')) {
            colorClass = CATEGORY_TEXT_THEME.Weapon;
        } else if (lower.includes('magic')) {
            colorClass = CATEGORY_TEXT_THEME.Magic;
        } else if (lower.includes('hp')) {
            colorClass = CATEGORY_TEXT_THEME.Food;
        } else if (lower.includes('exp')) {
            colorClass = CATEGORY_TEXT_THEME.Nature;
        }

        return colorClass ? <span key={i} className={colorClass}>{part}</span> : <span key={i}>{part}</span>;
    });
}

function MatchSparkleCluster({ index }: { index: number }) {
    const phaseOffset = (index % 4) * 0.08 + Math.floor(index / 4) * 0.06;

    return (
        <div className="absolute inset-[-12%] z-20 pointer-events-none overflow-visible">
            {MATCH_SPARKLES.map((sparkle, sparkleIndex) => {
                const sparkleStyle = {
                    top: sparkle.top,
                    left: sparkle.left,
                    width: sparkle.size,
                    height: sparkle.size,
                    animationDelay: `${sparkle.delay + phaseOffset}s`,
                    animationDuration: `${sparkle.duration}s`,
                    ['--sparkle-color' as string]: sparkle.color,
                    ['--sparkle-glow' as string]: sparkle.glow,
                    ['--sparkle-drift-x' as string]: sparkle.driftX,
                    ['--sparkle-drift-y' as string]: sparkle.driftY,
                } as CSSProperties;

                return <span key={`sparkle-${sparkleIndex}`} className="match-sparkle" style={sparkleStyle} />;
            })}
        </div>
    );
}

export function GridBoard({
    gridSymbols, spinKey, matchingIndices, goldCostPopups, effectPopups, glowingIndices, activeRogueIndex,
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
    const statTheme = displayCategory ? CATEGORY_TEXT_THEME[displayCategory] : null;

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
                        const isSparklingMatch = isMatching;
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
                                transition={{ layout: { type: 'tween', duration: 0.14, ease: 'easeOut' } }}
                                className="flex items-center justify-center relative rounded-2xl"
                                style={{
                                    width: 'var(--cell)',
                                    height: 'var(--cell)',
                                    // Hood always renders on top so it slides over adjacent cells, not under them
                                    zIndex: symbol?.name === 'hood' ? 20 : 'auto',
                                    willChange: 'transform',
                                }}
                            >
                                {isSparklingMatch && (
                                    <MatchSparkleCluster index={index} />
                                )}
                                {isTarget && (
                                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none" style={{ transform: `rotate(${arrowRotation}deg)` }}>
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
                <AnimatePresence>
                    {goldCostPopups.map((popup) => {
                        const { row, col } = getCoordinates(popup.index);
                        return (
                            <motion.div
                                key={popup.id}
                                initial={{ opacity: 0, y: 6, scale: 0.84 }}
                                animate={{ opacity: [0, 1, 1, 0], y: [6, -8, -20, -30], scale: [0.84, 1.08, 1.03, 0.98] }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                className="absolute z-40 pointer-events-none select-none font-bold tracking-widest text-yellow-300 -translate-x-1/2"
                                style={{
                                    left: `calc((var(--cell) + var(--gap)) * ${col} + (var(--cell) / 2))`,
                                    top: `calc((var(--cell) + var(--gap)) * ${row} - (var(--gap) * 0.6))`,
                                    textShadow: '0 1px 0 #000, 0 0 8px rgba(234, 179, 8, 0.45)',
                                    fontSize: 22,
                                }}
                            >
                                -{popup.amount}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <AnimatePresence>
                    {effectPopups.map((popup) => {
                        const { row, col } = getCoordinates(popup.index);
                        const colors = EFFECT_COLOR[popup.stat] ?? EFFECT_COLOR.Gold;
                        const label = popup.stat === 'Slot'
                            ? '🔓'
                            : `${popup.amount > 0 ? '+' : ''}${popup.amount}`;
                        return (
                            <motion.div
                                key={popup.id}
                                initial={{ opacity: 0, y: 0, scale: 0.84 }}
                                animate={{ opacity: [0, 1, 1, 0], y: [0, -18, -34, -46], scale: [0.84, 1.08, 1.03, 0.98] }}
                                transition={{ duration: 0.85, ease: 'easeOut' }}
                                className={`absolute z-40 pointer-events-none select-none font-bold tracking-widest -translate-x-1/2 ${colors.text}`}
                                style={{
                                    left: `calc((var(--cell) + var(--gap)) * ${col} + (var(--cell) / 2))`,
                                    top: `calc((var(--cell) + var(--gap)) * ${row} + (var(--cell) * 0.35))`,
                                    textShadow: `0 1px 0 #000, 0 0 8px ${colors.shadow}`,
                                    fontSize: 22,
                                }}
                            >
                                {label}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Info Text */}
            <div className="w-full min-w-0 flex items-start justify-center text-center p-2 relative text-[#e8d4b8] overflow-hidden" style={{ height: 'calc(var(--cell) * 1.5)' }}>
                {displaySymbol ? (
                    <div className="flex flex-col items-center justify-start w-full min-w-0 gap-1 relative z-10">
                        <div className="font-bold tracking-widest uppercase w-full min-w-0 break-words flex items-center justify-center gap-2 font-mono" style={{ fontSize: 'var(--text-base)' }}>
                            <span className="text-[#e8d4b8] drop-shadow-sm">{displaySymbol.name.replace(/_/g, ' ')}</span>
                            <span className={cn(
                                "text-[10px] sm:text-[11px] px-1.5 py-0.5 border rounded-md leading-none font-sans",
                                categoryTheme?.className ?? 'text-zinc-200 border-zinc-300/35 bg-zinc-500/12'
                            )}>
                                {categoryTheme?.label ?? displayCategory}
                            </span>
                        </div>
                        <div className={cn(
                            "font-bold tracking-widest uppercase w-full min-w-0 break-words",
                            statTheme ?? CATEGORY_TEXT_THEME.Special
                        )} style={{ fontSize: 'var(--text-sm)' }}>
                            {formatStatText(getStatText(displaySymbol.name, isDisplaySymbolBoosted, levelUpPerks, hasSpecialScroll, areAllSlotsUnlocked), displaySymbol.name)}
                        </div>
                        <div className="font-bold tracking-wider uppercase text-zinc-400 flex items-center justify-center w-full min-w-0 leading-tight whitespace-normal break-words" style={{ fontSize: 'var(--text-xs)', minHeight: 14 }}>
                            {SYMBOL_EXTRA_EFFECTS[displaySymbol.name] ? (
                                SYMBOL_EXTRA_EFFECTS[displaySymbol.name]?.includes('[perspective-dice-random symbol]') ? (
                                    <span className="flex items-center justify-center gap-1 w-full min-w-0 whitespace-normal break-words">
                                        <i className="ra ra-perspective-dice-random" style={{ fontSize: 12 }} /> {SYMBOL_EXTRA_EFFECTS[displaySymbol.name]!.replace('[perspective-dice-random symbol] ', '')}
                                    </span>
                                ) : SYMBOL_EXTRA_EFFECTS[displaySymbol.name]
                            ) : ''}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold uppercase tracking-widest" style={{ fontSize: 'var(--text-sm)' }}>
                        Select a symbol
                    </div>
                )}
            </div>
        </div>
    );
}
