import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/userStore";

const RedirectToDashboard = () => {
  const navigate = useNavigate();
  const { role, clearUser } = useUserStore();

  useEffect(() => {
    // Check token and expiration
    const token = localStorage.getItem("token");
    const tokenExpiration = localStorage.getItem("tokenExpiration");

    // If no token or token is expired, clear user data and redirect to login
    if (
      !token ||
      !tokenExpiration ||
      new Date().getTime() > parseInt(tokenExpiration)
    ) {
      clearUser(); // Clear user data from store and localStorage
      navigate("/login", { replace: true });
      return;
    }

    // Redirect based on role
    switch (role) {
      case "cashier":
        navigate("/game", { replace: true });
        break;
      case "super_admin":
        navigate("/super_admin", { replace: true });
        break;
      case "admin":
      case "house_admin": // Handle house_admin role explicitly
        navigate("/admin", { replace: true });
        break;
      case "agent":
        navigate("/agent", { replace: true });
        break;
      default:
        clearUser(); // Clear invalid role
        navigate("/login", { replace: true });
    }
  }, [navigate, role, clearUser]);

  return null;
};

export default RedirectToDashboard;
