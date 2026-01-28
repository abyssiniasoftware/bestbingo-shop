import { useState, useEffect, useCallback } from "react";
import apiService from "../api/apiService";
import useUserStore from "../stores/userStore";

const useWallet = () => {
  const [wallet, setWalletData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setWalletBalance } = useUserStore();

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchWalletData(
      );
      setWalletData(data);
      if (data && (data.package !== undefined || data.packageBalance !== undefined || data.balance !== undefined)) {
        setWalletBalance(data.package ?? data.packageBalance ?? data.balance ?? 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setWalletBalance]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return { wallet, error, isLoading, refreshWallet: fetchWalletData };
};

export default useWallet;
