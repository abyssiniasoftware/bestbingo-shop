import { cardSets } from './cardSets/index.js';

/**
 * Get a card set by name
 * @param {string} cardSetName - Name of the card set (e.g., 'abyssinia', 'best')
 * @returns {Array} The card set array or empty array if not found
 */
export const getCardSet = (cardSetName) => {
  return cardSets[cardSetName] || [];
};

/**
 * Get available card set names
 * @returns {Array} Array of available card set names
 */
export const getAvailableCardSets = () => {
  return Object.keys(cardSets);
};

/**
 * Prepare cards for submission by adding userId to all cards in the set
 * @param {Array} cardSet - Array of card objects
 * @param {string} userId - User ID to add to each card
 * @returns {Array} Cards with userId added
 */
export const prepareCardSetForSubmission = (cardSet, userId) => {
  if (!Array.isArray(cardSet)) return [];
  
  return cardSet.map(card => ({
    ...card,
    userId: userId
  }));
};