import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import api from "../utils/api";
import handleBulkSubmission from "../services/cardsInsert";
import useUserStore from "../stores/userStore";

const MemoizedTextField = React.memo(TextField);

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    branch: "",
    phone: "",
    isAgent: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Select role with useMemo to stabilize the reference
  const role = useUserStore(useMemo(() => (state) => state.role, []));

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
    setMessage("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setMessage("");

    try {
      const endpoint = formData.isAgent
        ? `/api/auth/register/agent`
        : `/api/auth/register`;

      const payload = formData.isAgent
        ? {
            username: formData.username,
            password: formData.password,
            fullname: formData.username, // Use username as fullname for agent
            address: formData.branch, // Use branch as address for agent
            phone: formData.phone,
            role: "agent", // Explicitly set role for agent
          }
        : {
            username: formData.username,
            password: formData.password,
            branch: formData.branch,
            phone: formData.phone,
          };

      const response = await api.post(endpoint, payload);

      if (response.status === 201) {
        const { message, users, house } = response.data;
        setSuccess(
          message ||
            (formData.isAgent
              ? "Agent registered successfully!"
              : "Users and house registered successfully!"),
        );

        // Trigger card submission only for house registration (not for agents)
        if (!formData.isAgent) {
          const cashier = users?.find((user) => user.role === "cashier");
          if (cashier) {
            await handleBulkSubmission(cashier.id, setMessage);
          }
        }

        setFormData({
          username: "",
          password: "",
          branch: "",
          phone: "",
          isAgent: false,
        });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          mt: 5,
        }}
      >
        <Box
          sx={{
            width: "90%",
            maxWidth: 600,
            p: 4,
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            color: "#ffffff",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: "#ffffff", fontWeight: "bold" }}
          >
            Register {formData.isAgent ? "Agent" : "New House"}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                backgroundColor: "rgba(255, 82, 82, 0.2)",
                color: "#ffcccc",
                backdropFilter: "blur(5px)",
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                color: "#ccffcc",
                backdropFilter: "blur(5px)",
              }}
            >
              {success}
            </Alert>
          )}
          {message && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                backgroundColor: "rgba(33, 150, 243, 0.2)",
                color: "#cce6ff",
                backdropFilter: "blur(5px)",
              }}
            >
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <MemoizedTextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  borderRadius: 1,
                },
                "& .MuiInputLabel-root": { color: "#cccccc" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              }}
              InputLabelProps={{ style: { color: "#cccccc" } }}
            />
            <MemoizedTextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  borderRadius: 1,
                },
                "& .MuiInputLabel-root": { color: "#cccccc" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              }}
              InputLabelProps={{ style: { color: "#cccccc" } }}
            />
            <MemoizedTextField
              fullWidth
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  borderRadius: 1,
                },
                "& .MuiInputLabel-root": { color: "#cccccc" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              }}
              InputLabelProps={{ style: { color: "#cccccc" } }}
            />
            <MemoizedTextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  borderRadius: 1,
                },
                "& .MuiInputLabel-root": { color: "#cccccc" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              }}
              InputLabelProps={{ style: { color: "#cccccc" } }}
            />
            {role === "super_admin" && (
              <FormControlLabel
                control={
                  <Checkbox
                    name="isAgent"
                    checked={formData.isAgent}
                    onChange={handleChange}
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "&.Mui-checked": { color: "#ffffff" },
                    }}
                  />
                }
                label="Register as Agent"
                sx={{ color: "#cccccc", mt: 2 }}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                backdropFilter: "blur(5px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:disabled": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#aaaaaa",
                },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#ffffff" }} />
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterUser;
