import type { DigestData } from '../types';

const STORAGE_PREFIX = 'digest-';

const getCurrentMonthKey = (): string => {
    const now = new Date();
    // Format as YYYY-MM
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Saves a digest to localStorage.
 * The key includes the company name and the current month to ensure uniqueness.
 * @param digest - The digest data to save.
 */
export const saveDigest = (digest: DigestData): void => {
    try {
        const monthKey = getCurrentMonthKey();
        const storageKey = `${STORAGE_PREFIX}${digest.companyName.replace(/\s+/g, '_')}-${monthKey}`;
        // We use the digest's own ID as the primary key within the app,
        // but for storage, we key it by company and month to prevent duplicates per month.
        // If a new one is generated, it overwrites the old one for that month.
        localStorage.setItem(storageKey, JSON.stringify(digest));
    } catch (error) {
        console.error("Failed to save digest to localStorage:", error);
    }
};

/**
 * Retrieves all digests from localStorage that were saved in the current month.
 * @returns An array of DigestData objects.
 */
export const getDigestsForCurrentMonth = (): DigestData[] => {
    try {
        const monthKey = getCurrentMonthKey();
        const digests: DigestData[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX) && key.endsWith(monthKey)) {
                const item = localStorage.getItem(key);
                if (item) {
                    digests.push(JSON.parse(item));
                }
            }
        }
        
        // Sort by generation time (newest first), assuming ID contains timestamp
        return digests.sort((a, b) => {
             const timeA = parseInt(a.id.split('-').pop() || '0');
             const timeB = parseInt(b.id.split('-').pop() || '0');
             return timeB - timeA;
        });

    } catch (error) {
        console.error("Failed to retrieve digests from localStorage:", error);
        return [];
    }
};