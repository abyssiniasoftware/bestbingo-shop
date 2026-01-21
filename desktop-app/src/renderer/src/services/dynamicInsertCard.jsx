import api from "../utils/api";
import { getCardSet, prepareCardSetForSubmission } from "./cardSetUtils";

/**
 * Handle bulk submission with selected card set
 * @param {string} userId - User ID
 * @param {string} selectedCardSet - Name of the selected card set
 * @param {Function} setMessage - Callback function for messages
 */
const handleBulkSubmission = async (userId, selectedCardSet, setMessage = () => {}) => {
  try {
    // 1. Get the selected card set
    const cardSet = getCardSet(selectedCardSet);
    
    if (cardSet.length === 0) {
      setMessage("No cards found in the selected set.");
      return;
    }
    
    // 2. Prepare cards for submission (add userId)
    const dataToPost = prepareCardSetForSubmission(cardSet, userId);
    
    // 3. Submit to API
    const response = await api.post(`/api/user/register-cards`, dataToPost);
    
    if (response.status === 200 || response.status === 201) {
      setMessage(`${cardSet.length} cards from "${selectedCardSet}" set registered successfully!`);
    } else {
      setMessage("Bulk submission failed.");
    }
  } catch (error) {
    console.error("Bulk submission error:", error);
    setMessage("An error occurred during bulk submission.");
  }
};

export default handleBulkSubmission;