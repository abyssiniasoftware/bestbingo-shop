/**
 * Daily Round Counter Utility
 * 
 * Manages a daily round counter that resets at the start of each new day.
 * Uses localStorage to persist the counter across page refreshes.
 */

const DAILY_ROUND_KEY_PREFIX = 'dailyRound_';

/**
 * Get today's date as a string in YYYY-MM-DD format
 */
const getTodayDateKey = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
};

/**
 * Get the current daily round number.
 * Returns 1 if no games have been played today.
 */
export const getDailyRoundNumber = () => {
    const dateKey = getTodayDateKey();
    const storageKey = `${DAILY_ROUND_KEY_PREFIX}${dateKey}`;

    // Clean up old date entries
    cleanupOldDailyRounds(dateKey);

    const stored = localStorage.getItem(storageKey);
    if (stored) {
        return parseInt(stored, 10) || 1;
    }
    return 1;
};

/**
 * Increment the daily round counter.
 * Call this when a new game is successfully started.
 * Returns the new round number.
 */
export const incrementDailyRound = () => {
    const dateKey = getTodayDateKey();
    const storageKey = `${DAILY_ROUND_KEY_PREFIX}${dateKey}`;

    const currentRound = getDailyRoundNumber();
    const newRound = currentRound + 1;

    localStorage.setItem(storageKey, newRound.toString());
    return newRound;
};

/**
 * Clean up localStorage entries from previous days.
 * Keeps only today's entry to avoid localStorage bloat.
 */
const cleanupOldDailyRounds = (todayKey) => {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DAILY_ROUND_KEY_PREFIX) && key !== `${DAILY_ROUND_KEY_PREFIX}${todayKey}`) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Reset the daily round counter (for testing or admin purposes).
 */
export const resetDailyRound = () => {
    const dateKey = getTodayDateKey();
    const storageKey = `${DAILY_ROUND_KEY_PREFIX}${dateKey}`;
    localStorage.removeItem(storageKey);
};

export default {
    getDailyRoundNumber,
    incrementDailyRound,
    resetDailyRound,
};
