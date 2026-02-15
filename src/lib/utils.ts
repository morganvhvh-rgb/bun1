import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind classes safely.
 * Handles conflicts (e.g. 'bg-red-500' vs 'bg-blue-500') 
 * and conditional logic cleanly.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
