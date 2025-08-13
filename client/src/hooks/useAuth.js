//hooks/useAuth.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/userStore";

const useAuth = () => {
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedExpiration = localStorage.getItem("tokenExpiration");
    const currentTime = new Date().getTime();

    if (token && storedExpiration && currentTime < storedExpiration) {
      fetch(`${import.meta.env.VITE_APP_API_URL}/api/me`, {
        headers: { "x-auth-token": token },
      })
        .then((response) => response.json())
        .then((userData) => {
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
          navigate("/login");
        });
    } else {
      clearUser();
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate, setUser, clearUser]);

  return user;
};

export default useAuth;