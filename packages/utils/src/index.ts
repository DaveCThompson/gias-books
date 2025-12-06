import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for conditionally merging class names.
 * Uses clsx under the hood for consistent behavior.
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}
