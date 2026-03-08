import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { GridSymbol, SymbolName } from '@/types/game';
import type { LevelUpPerk } from '@/types/levelUp';
import { SYMBOL_STATS } from '@/lib/constants';

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

export const findMatchingIndices = (gridSymbols: (GridSymbol | null)[], columns: number = 4, rows: number = 3): Set<number> => {
    const matches = new Set<number>();
    const visited = new Set<number>();

    for (let i = 0; i < gridSymbols.length; i++) {
        if (visited.has(i) || !gridSymbols[i]) continue;

        const name = gridSymbols[i]!.name;
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
                    if (!visited.has(nIdx) && gridSymbols[nIdx]?.name === name) {
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
    name: SymbolName,
    isBoosted: boolean,
    levelUpPerks: LevelUpPerk[],
    hasSpecialScroll: boolean = false,
    areAllSlotsUnlocked: boolean = false
): string => {
    const expMultiplier = levelUpPerks.includes("nature_2x_exp") ? 2 : 1;
    const isLevel3Plus = levelUpPerks.length >= 2;

    if (name === 'hood') return '';

    if (!isBoosted) {
        if (name === 'clover') return `+${2 * expMultiplier} EXP +2 Magic`;
        if (name === 'pine-tree') return `+${4 * expMultiplier} EXP`;
        if (name === 'dead-tree') return `-${3 * expMultiplier} EXP +5 Magic`;
        if (name === 'brandy-bottle') return isLevel3Plus ? "-10 HP & +6 Max HP" : "-10 HP & +5 Max HP";
        if (name === 'key' && hasSpecialScroll && areAllSlotsUnlocked) return '+16 gold';
        return SYMBOL_STATS[name] || "???";
    }

    switch (name) {
        case 'apple': return "Heal 30 HP";
        case 'crab-claw': return "+6 Max HP +2 EXP";
        case 'brandy-bottle': return isLevel3Plus ? "-20 HP & +12 Max HP" : "-20 HP & +10 Max HP";
        case 'clover': return `+${4 * expMultiplier} EXP +4 Magic`;
        case 'pine-tree': return `+${8 * expMultiplier} EXP`;
        case 'dead-tree': return `-${3 * expMultiplier} EXP +10 Magic`;
        case 'axe': return "+6 ATK +4 Gear";
        case 'relic-blade':
        case 'daggers': return "+2 ATK +2 Gear";
        case 'crossbow': return "+2 ATK +8 Gear";
        case 'shield': return "+14 Gear";
        case 'knight-helmet': return "+4 Gear";
        case 'crystal-wand':
            return "+6 Magic";
        case 'fairy-wand': return "+12 Magic";
        case 'gold-bar': return "+32 gold";
        case 'gem-pendant': return "+16 Gold +4 Gear";
        case 'bell': return "-4 ATK";
        case 'key':
            if (hasSpecialScroll && areAllSlotsUnlocked) return '+32 Gold';
            return SYMBOL_STATS[name] || "???";
        default: return SYMBOL_STATS[name] || "???";
    }
};
