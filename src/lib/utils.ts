import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { GridItem, IconName } from '@/types/game';
import { ICON_STATS } from '@/lib/constants';

/**
 * Merges Tailwind classes safely.
 * Handles conflicts (e.g. 'bg-red-500' vs 'bg-blue-500') 
 * and conditional logic cleanly.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getCoordinates = (index: number, columns: number = 4) => ({ row: Math.floor(index / columns), col: index % columns });
export const getIndex = (row: number, col: number, columns: number = 4) => row * columns + col;

export const findMatchingIndices = (gridIcons: (GridItem | null)[], columns: number = 4, rows: number = 3): Set<number> => {
    const matches = new Set<number>();
    const visited = new Set<number>();

    for (let i = 0; i < gridIcons.length; i++) {
        if (visited.has(i) || !gridIcons[i]) continue;

        const name = gridIcons[i]!.name;
        const group = [i];
        const queue = [i];
        visited.add(i);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const { row, col } = getCoordinates(current, columns);

            const neighbors = [
                { r: row - 1, c: col }, { r: row + 1, c: col }, { r: row, c: col - 1 }, { r: row, c: col + 1 }
            ];

            for (const n of neighbors) {
                if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < columns) {
                    const nIdx = getIndex(n.r, n.c, columns);
                    if (!visited.has(nIdx) && gridIcons[nIdx]?.name === name) {
                        visited.add(nIdx);
                        group.push(nIdx);
                        queue.push(nIdx);
                    }
                }
            }
        }

        if (group.length >= 3) group.forEach(idx => matches.add(idx));
    }
    return matches;
};

export const getStatText = (
    name: IconName,
    isBoosted: boolean,
    levelUpPerks: string[],
    hasSpecialScroll: boolean = false,
    areAllSlotsUnlocked: boolean = false
): string => {
    const expMultiplier = levelUpPerks.includes("nature_2x_exp") ? 2 : 1;

    if (!isBoosted) {
        if (name === 'clover') return `+${1 * expMultiplier} EXP +1 Magic`;
        if (name === 'pine-tree') return `+${2 * expMultiplier} EXP`;
        if (name === 'dead-tree') return `-${3 * expMultiplier} EXP +5 Magic`;
        if (name === 'key' && hasSpecialScroll && areAllSlotsUnlocked) return '+16 gold';
        return ICON_STATS[name] || "???";
    }

    switch (name) {
        case 'apple': return "Heal 16 HP";
        case 'meat': return "Heal 24 HP";
        case 'crab-claw': return "+6 Max HP";
        case 'brandy-bottle': return "-25% HP & +10 Max HP";
        case 'clover': return `+${2 * expMultiplier} EXP +2 Magic`;
        case 'pine-tree': return `+${4 * expMultiplier} EXP`;
        case 'dead-tree': return `-${3 * expMultiplier} EXP +10 Magic`;
        case 'axe': return "";
        case 'relic-blade':
        case 'crossbow':
        case 'daggers': return "+2 ATK +2 Gear";
        case 'shield':
        case 'knight-helmet': return "+4 Gear";
        case 'crystal-wand':
            return "+10 Magic";
        case 'fairy-wand': return "+6 Magic";
        case 'gold-bar': return "+20 gold";
        case 'gem-pendant': return "+20 Gold";
        case 'key':
            if (hasSpecialScroll && areAllSlotsUnlocked) return '+32 gold';
            return ICON_STATS[name] || "???";
        default: return ICON_STATS[name] || "???";
    }
};
