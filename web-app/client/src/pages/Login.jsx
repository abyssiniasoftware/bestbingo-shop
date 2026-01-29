import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box } from "@mui/material";
import LoginForm from "../components/auth/LoginForm";
import useUserStore from "../stores/userStore";
import config from "../constants/config";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";

const Login = () => {
  const { setUser, clearUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = async (
    username,
    password,
    setLoading,
    setErrorMessage,
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      if (!username || !password) {
        setErrorMessage("Please fill in all fields");
        toast.error("Please fill in all fields");
        return;
      }

      let response;
      try {
        response = await api.post("/api/auth/login", {
          username,
          password,
        });
      } catch (err) {
        // Axios error handling
        const msg =
          err.response?.data?.message || err.message || "Login failed";
        throw new Error(msg);
      }

      const data = response.data;

      const { token, id, role, houseId, package: pkg } = data;
      if (!token) throw new Error("Missing token");

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch {
        throw new Error("Invalid token");
      }
      const expirationTime = decoded.exp * 1000;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userId", id);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("houseId", houseId || "");
      sessionStorage.setItem("tokenExpiration", expirationTime);
      setUser({ id, username, role, houseId, package: pkg });

      // Validate session
      try {
        await api.get("/api/me");
      } catch (err) {
        throw new Error(
          err.response?.data?.message || "Session validation failed",
        );
      }
      toast.success("Login successful!");
      switch (role) {
        case "super_admin":
          navigate("/super_admin", { replace: true });
          break;
        case "house_admin":
          navigate("/admin", { replace: true });
          break;
        case "cashier":
          navigate("/game", { replace: true });
          break;
        case "agent":
          navigate("/agent", { replace: true });
          break;
        default:
          throw new Error("Invalid user role");
      }
    } catch (err) {
      clearUser();
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("houseId");
      sessionStorage.removeItem("tokenExpiration");
      const msg = err.message || "Unexpected error";
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", overflowX: "hidden" }}>
      <LoginForm handleLogin={handleLogin} config={config} />
    </Box>
  );
};

export default Login;
