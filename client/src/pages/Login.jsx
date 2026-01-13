import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box } from "@mui/material";
import LoginForm from "../components/auth/LoginForm";
import LoginFooter from "../components/auth/LoginFooter";
import useUserStore from "../stores/userStore";
import config from "../constants/config";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";

const Login = () => {
  const { setUser, clearUser } = useUserStore();
  const navigate = useNavigate();
  

  const safeFetchJson = async (resp) => {
    const text = await resp.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from server");
    }
  };

  const handleLogin = async (
    username,
    password,
    setLoading,
    setErrorMessage
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      if (!username || !password) {
        setErrorMessage("Please fill in all fields");
        toast.error("Please fill in all fields");
        return;
      }

      // Timeout (15s) to avoid infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await api.post(`/api/auth/login`, { username, password });
      } catch (e) {
        if (e.name === "AbortError") throw new Error("Request timed out");
        throw new Error("Network error");
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await safeFetchJson(response);
      if (!response.ok)
        throw new Error(data.message || `Login failed (${response.status})`);

      const { token, id, role, houseId, package: pkg } = data;
      if (!token) throw new Error("Missing token");

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch {
        throw new Error("Invalid token");
      }
      const expirationTime = decoded.exp * 1000;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", id);
      localStorage.setItem("role", role);
      localStorage.setItem("houseId", houseId || "");
      localStorage.setItem("tokenExpiration", expirationTime);
      setUser({ id, username, role, houseId, package: pkg });

      // Validate session
      const meResp = await api.get(`/api/me`,);
      const meData = await safeFetchJson(meResp).catch(() => ({}));
      if (!meResp.ok)
        throw new Error(meData.message || "Session validation failed");

      toast.success("Login successful!");
      switch (role) {
        case "super_admin":
          navigate("/super_admin", { replace: true });
          break;
        case "house_admin":
          navigate("/admin", { replace: true });
          break;
        case "cashier":
          navigate("/dashboard", { replace: true });
          break;
        case "agent":
          navigate("/agent", { replace: true });
          break;
        default:
          throw new Error("Invalid user role");
      }
    } catch (err) {
      clearUser();
      localStorage.clear();
      const msg = err.message || "Unexpected error";
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="dynamic-bg"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <LoginForm handleLogin={handleLogin} config={config} />
      <LoginFooter phoneNumber={config.phoneNumber} />
    </Box>
  );
};

export default Login;
