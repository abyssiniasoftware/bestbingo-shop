import { useEffect } from "react";
import apiService from "../api/apiService";

const useWallet = ({ userId, setWalletData, setError, setIsLoading }) => {
  useEffect(() => {
    const fetchWalletData = async () => {
      if (userId) {
        setIsLoading(true);
        try {
          const data = await apiService.fetchWalletData(
            localStorage.getItem("token")
          );
          setWalletData(data);
        } catch (err) {
          setError(err.message);
          // toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchWalletData();
  }, [userId, setWalletData, setError, setIsLoading]);
};

export default useWallet;
