import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { GridItem } from '@/types/game';

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
