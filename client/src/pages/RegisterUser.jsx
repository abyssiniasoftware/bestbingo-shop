import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import api from "../utils/api";
import handleBulkSubmission from "../services/cardsInsert";

const roles = ["super_admin", "house_admin", "cashier"];

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
    fullname: "",
    address: "",
    phone: "",
    package: "",
    branch: "",
    houseId: "",
  });

  const [houses, setHouses] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/api/house/`,
         
        );

        if (res.data && Array.isArray(res.data.house)) {
          setHouses(res.data.house);
        } else {
          console.warn("House data is not in expected format:", res.data);
          setHouses([]);
        }
      } catch (err) {}
    };

    fetchHouses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Missing auth token! Please login or check localStorage.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        `/api/auth/register`,
        formData,
        
      );

      if (response.status === 200 || response.status === 201) {
        const { message, user } = response.data;
        setSuccess(message || "User registered successfully!");

        if (user.role === "cashier") {
          await handleBulkSubmission(user.id, setMessage);
        }

        setFormData({
          username: "",
          password: "",
          role: "",
          fullname: "",
          address: "",
          phone: "",
          package: "",
          branch: "",
          houseId: "",
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
      {/* Main Content Section */}
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
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent background
            backdropFilter: "blur(10px)", // Frosted glass effect
            border: "1px solid rgba(255, 255, 255, 0.2)", // Subtle border
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", // Light shadow
            color: "#ffffff", // White text for contrast
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: "#ffffff", fontWeight: "bold" }}
          >
            Register New User
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                backgroundColor: "rgba(255, 82, 82, 0.2)", // Semi-transparent alert
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
            <TextField
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
            <TextField
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
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "#4B5563", // Tailwind gray-600
                  color: "#ffffff",
                  borderRadius: 1,
                },
                "& .MuiInputLabel-root": { color: "#D1D5DB" }, // Tailwind gray-300
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6B7280", // gray-500
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9CA3AF", // gray-400
                },
                "& .MuiSelect-icon": {
                  color: "#ffffff",
                },
              }}
              InputLabelProps={{ style: { color: "#D1D5DB" } }}
            >
              {roles.map((role) => (
                <MenuItem
                  key={role}
                  value={role}
                  sx={{
                    color: "#ffffff",
                    backgroundColor: "#374151", // gray-700 default
                    "&.Mui-selected": {
                      backgroundColor: "#1F2937", // gray-800 when selected
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#4B5563", // gray-600 on hover when selected
                    },
                    "&:hover": {
                      backgroundColor: "#4B5563", // gray-600 on hover
                    },
                  }}
                >
                  {role}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Full Name"
              name="fullname"
              value={formData.fullname}
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
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
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
            <TextField
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

            {/* <TextField
              fullWidth
              select
              label="Select House"
              name="houseId"
              value={formData.houseId}
              onChange={handleChange}
              margin="normal"
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  borderRadius: 1,
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              }}
              InputLabelProps={{ style: { color: '#cccccc' } }}
            >
              {houses.length === 0 ? (
                <MenuItem value="" disabled sx={{ color: '#ffffff', backgroundColor: '#1e3a8a' }}>
                  No houses available
                </MenuItem>
              ) : (
                houses.map((house) => (
                  <MenuItem
                    key={house._id}
                    value={house._id}
                    sx={{ color: '#ffffff', backgroundColor: '#1e3a8a' }}
                  >
                    {house.name}
                  </MenuItem>
                ))
              )}
            </TextField> */}

            {/* <TextField
              fullWidth
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              margin="normal"
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  borderRadius: 1,
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              }}
              InputLabelProps={{ style: { color: '#cccccc' } }}
            /> */}

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
