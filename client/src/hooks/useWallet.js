import { useState, useEffect, useCallback } from "react";
import apiService from "../api/apiService";

const useWallet = () => {
  const [wallet, setWalletData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchWalletData(
        localStorage.getItem("token"),
      );
      setWalletData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return { wallet, error, isLoading, refreshWallet: fetchWalletData };
};

export default useWallet;
