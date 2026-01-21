import { useState, useEffect, useCallback } from "react";
import apiService from "../api/apiService";

const useCardIds = () => {
  const [cardIds, setCardIds] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchCardIds = useCallback(async () => {
    // Check cache first
    const cacheKey = `cachedCardIds_${userId}`;
    const cachedCardIds = localStorage.getItem(cacheKey);
    if (cachedCardIds) {
      const parsedCardIds = JSON.parse(cachedCardIds);
      setCardIds(parsedCardIds.sort((a, b) => parseInt(a) - parseInt(b)));
      return;
    }

    if (userId) {
      setIsLoading(true);
      try {
        const data = await apiService.fetchCardIds(userId, token);
        const sortedData = data.sort((a, b) => parseInt(a) - parseInt(b));
        setCardIds(sortedData);
        localStorage.setItem(cacheKey, JSON.stringify(sortedData));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [userId, token]);

  const refreshCards = useCallback(async () => {
    // Clear cache and refetch
    const cacheKey = `cachedCardIds_${userId}`;
    localStorage.removeItem(cacheKey);
    if (userId) {
      setIsLoading(true);
      try {
        const data = await apiService.fetchCardIds(userId, token);
        const sortedData = data.sort((a, b) => parseInt(a) - parseInt(b));
        setCardIds(sortedData);
        localStorage.setItem(cacheKey, JSON.stringify(sortedData));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [userId, token]);

  useEffect(() => {
    fetchCardIds();
  }, [fetchCardIds]);

  return { cardIds, error, isLoading, refreshCards };
};

export default useCardIds;
