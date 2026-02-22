import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { ICON_THEME, ICON_CATEGORIES, ICON_STATS, ICON_EXTRA_EFFECTS } from '@/lib/constants';
import type { GridItem, IconName } from '@/types/game';

const getStatText = (name: IconName, isBoosted: boolean, levelUpPerks: string[]) => {
    if (!isBoosted) return ICON_STATS[name] || "???";

    const expMultiplier = levelUpPerks.includes("nature_2x_exp") ? 2 : 1;

    switch (name) {
        case 'apple': return "Heal 12 HP";
        case 'meat': return "Heal 20 HP";
        case 'crab-claw': return "+2 Max HP +2 HP";
        case 'brandy-bottle': return "-50% HP & +8 Max HP";
        case 'clover': return `+${2 * expMultiplier} EXP +2 Magic`;
        case 'pine-tree': return `+${2 * expMultiplier} EXP`;
        case 'zigzag-leaf': return `-${3 * expMultiplier} EXP +10 Magic`;
        case 'axe': return "+4 ATK +2 Gear";
        case 'relic-blade':
        case 'crossbow':
        case 'daggers': return "+2 ATK +2 Gear";
        case 'shield':
        case 'knight-helmet': return "+4 Gear";
        case 'crystal-wand':
        case 'fairy-wand': return "+10 Magic";
        case 'gold-bar': return "+20 gold";
        case 'gem-pendant': return "+20 Gold";
        default: return ICON_STATS[name] || "???";
    }
};

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
    gridIcons,
    spinKey,
    matchingIndices,
    glowingIndices,
    activeHoodedIndex,
    selectedIndex,
    selectedEquippedItem,
    isShaking,
    onIconClick,
    onEmptyGlowClick,
    levelUpPerks
}: GridBoardProps) {

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        show: { opacity: 1, scale: 1 },
        shake: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4 }
        }
    };

    const getCoordinates = (index: number) => ({ row: Math.floor(index / 4), col: index % 4 });

    const displayItem = selectedIndex !== null ? gridIcons[selectedIndex] : selectedEquippedItem;
    const isDisplayItemBoosted = selectedIndex !== null ? matchingIndices.has(selectedIndex) : false;

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                key={spinKey}
                className="grid grid-cols-4 grid-rows-3 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence mode='popLayout'>
                    {gridIcons.map((item, index) => {
                        const isMatching = matchingIndices.has(index);
                        const isTarget = glowingIndices.includes(index) && activeHoodedIndex !== null;

                        let arrowRotation = 0;
                        if (isTarget && activeHoodedIndex !== null) {
                            const { row: startRow, col: startCol } = getCoordinates(activeHoodedIndex);
                            const { row: targetRow, col: targetCol } = getCoordinates(index);

                            if (targetRow < startRow) arrowRotation = 0; // Up
                            else if (targetRow > startRow) arrowRotation = 180; // Down
                            else if (targetCol < startCol) arrowRotation = 270; // Left
                            else if (targetCol > startCol) arrowRotation = 90; // Right
                        }

                        return (
                            <motion.div
                                key={item?.id ?? `empty-${index}`}
                                layout
                                variants={itemVariants}
                                animate={isShaking ? "shake" : undefined}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={cn(
                                    "w-14 h-14 flex items-center justify-center relative rounded-md ring-1 ring-inset transition-shadow",
                                    (!glowingIndices.includes(index) && isMatching) ? "ring-pink-500" :
                                        (selectedIndex === index && !glowingIndices.includes(index)) ? "ring-white" : "ring-transparent"
                                )}
                            >
                                {isTarget && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                                        style={{ transform: `rotate(${arrowRotation}deg)` }}
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]">
                                            <path d="M12 19V5" />
                                            <path d="M5 12l7-7 7 7" />
                                        </svg>
                                    </div>
                                )}

                                {item ? (
                                    <Icon
                                        name={item.name}
                                        scale={3}
                                        tintColor={ICON_THEME[item.name]}
                                        onClick={() => onIconClick(item, index)}
                                        className={cn(
                                            "hover:brightness-110 transition-all active:scale-95",
                                            (activeHoodedIndex === index && item.name === 'hood') && "brightness-125"
                                        )}
                                    />
                                ) : (
                                    glowingIndices.includes(index) ? (
                                        <div onClick={() => onEmptyGlowClick(index)} className="w-14 h-14 cursor-pointer" />
                                    ) : (
                                        <div className="w-14 h-14" />
                                    )
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Info Text */}
            <div className="h-20 flex items-start justify-center text-center">
                {displayItem ? (
                    <div className="flex flex-col items-center justify-start gap-1">
                        <div className="text-sm font-medium tracking-widest text-zinc-400 uppercase">
                            <span className="text-zinc-200">{displayItem.name.replace(/_/g, ' ')}</span>
                            <span className="text-zinc-600 mx-2">-</span>
                            <span className="text-zinc-500">{ICON_CATEGORIES[displayItem.name]}</span>
                        </div>
                        <div className="text-xs font-medium tracking-wider text-teal-400/80 uppercase">
                            {getStatText(displayItem.name, isDisplayItemBoosted, levelUpPerks)}
                        </div>
                        <div className="text-xs font-medium tracking-wider uppercase text-zinc-500">
                            {ICON_EXTRA_EFFECTS[displayItem.name] || ""}
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-zinc-600 uppercase tracking-widest mt-1">
                        Select an icon
                    </div>
                )}
            </div>
        </div>
    );
}
