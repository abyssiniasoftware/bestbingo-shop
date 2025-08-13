import { useEffect } from "react";
import apiService from "../api/apiService";

const useCardIds = ({
  userId,
  cardIds,
  setCardIds,
  setError,
  setIsLoading,
}) => {
  useEffect(() => {
    const fetchCardIds = async () => {
      const cachedCardIds = localStorage.getItem("cachedCardIds");
      if (cachedCardIds) {
        const parsedCardIds = JSON.parse(cachedCardIds);
        setCardIds(parsedCardIds.sort((a, b) => parseInt(a) - parseInt(b)));
        return;
      }

      if (userId) {
        setIsLoading(true);
        try {
          const data = await apiService.fetchCardIds(
            userId,
            localStorage.getItem("token")
          );
          const sortedData = data.sort((a, b) => parseInt(a) - parseInt(b));
          setCardIds(sortedData);
          localStorage.setItem("cachedCardIds", JSON.stringify(sortedData));
        } catch (error) {
          setError(error.message);
          // toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCardIds();
  }, [userId, setCardIds, setError, setIsLoading]);
};

export default useCardIds;
