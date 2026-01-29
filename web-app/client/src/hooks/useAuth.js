//hooks/useAuth.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/userStore";
import api from "../utils/api";

const useAuth = () => {
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedExpiration = localStorage.getItem("tokenExpiration");
    const currentTime = new Date().getTime();

    if (token && storedExpiration && currentTime < storedExpiration) {
      api
        .get(`/api/me`)
        .then((response) => {
          const userData = response.data;
          setUser({
            id: userData.id,
            username: userData.username,
            role: userData.role,
            bossId: userData.bossId,
          });
        })
        .catch(() => {
          clearUser();
          localStorage.clear();
          localStorage.clear();
          navigate("/login");
        });
    } else {
      clearUser();
      localStorage.clear();
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate, setUser, clearUser]);

  return user;
};

export default useAuth;
