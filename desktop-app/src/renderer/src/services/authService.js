/**
 * Centralized Authentication Service
 * Handles token validation, session management, and logout operations.
 */

/**
 * Check if the current token is valid (exists and not expired)
 * @returns {boolean} True if token is valid, false otherwise
 */
export const isTokenValid = () => {
    const token = sessionStorage.getItem("token");
    const expiration = sessionStorage.getItem("tokenExpiration");

    if (!token || !expiration) {
        return false;
    }

    return Date.now() < parseInt(expiration, 10);
};

/**
 * Get the remaining time until token expires in milliseconds
 * @returns {number} Milliseconds until expiration, or 0 if expired/missing
 */
export const getTokenRemainingTime = () => {
    const expiration = sessionStorage.getItem("tokenExpiration");
    if (!expiration) return 0;

    const remaining = parseInt(expiration, 10) - Date.now();
    return remaining > 0 ? remaining : 0;
};

/**
 * Clear all authentication data from sessionStorage
 * This is the centralized cleanup function - use this instead of manually removing items
 */
export const clearAuthData = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("tokenExpiration");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("houseId");
    sessionStorage.removeItem("enableDynamicBonus");
};

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with auth token if valid
 */
export const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token");
    if (!token || !isTokenValid()) {
        return {};
    }
    return {
        "x-auth-token": token,
    };
};

export default {
    isTokenValid,
    getTokenRemainingTime,
    clearAuthData,
    getAuthHeaders,
};
