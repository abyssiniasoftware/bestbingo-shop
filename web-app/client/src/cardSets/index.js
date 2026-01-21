import { abyssiniaCard } from './abyssiniaCard.js';
import { bestCard } from './bestCard.js';

// Export all card sets as an object
export const cardSets = {
  abyssinia: abyssiniaCard,
  best: bestCard,
};

// Export individual sets
export { abyssiniaCard, bestCard };

// Get available card set names
export const availableCardSets = Object.keys(cardSets);