//hooks/useAuth.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/userStore";
import api from "../utils/api";
import { isTokenValid } from "../services/authService";

const useAuth = () => {
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Use centralized token validation
    if (token && isTokenValid()) {
      api
        .get(`/api/me`)
        .then((response) => response.data) // Fixed: axios uses .data, not .json()
        .then((userData) => {
          setUser({
            id: userData.id || userData._id,
            username: userData.username,
            role: userData.role,
            houseId: userData.houseId,
            package: userData.package,
          });
        })
        .catch(() => {
          clearUser();
          navigate("/login");
        });
    } else {
      clearUser();
      navigate("/login");
    }
  }, [navigate, setUser, clearUser]);

  return user;
};

export default useAuth;

