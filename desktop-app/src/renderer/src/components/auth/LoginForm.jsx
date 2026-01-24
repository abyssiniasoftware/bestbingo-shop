import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Fade,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { logo } from "../../images/images";

const LoginForm = ({ handleLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password, setLoading, setErrorMessage);
  };

  return (
    <Fade in timeout={800}>
      {/* BODY */}
      <Box
        sx={{
          fontFamily: "Arial, sans-serif",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(3, 192, 255, 0.5)",
        }}
      >
        {/* LOGIN CONTAINER */}
        <Paper
          elevation={10}
          sx={{
            display: "flex",
            flexDirection: "row",
            height: 420,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 10px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* LEFT: FORM */}
          <Box
            sx={{
              width: 400,
              height: 400,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* HEADER */}
            <Typography
              sx={{
                mb: "20px",
                fontSize: "30px",
                color: "#a45b28",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Login
            </Typography>

            {/* ERROR MESSAGE */}
            <Typography
              sx={{
                color: "red",
                fontSize: "14px",
                mb: "15px",
              }}
            >
              {errorMessage || "Enter username and password"}
            </Typography>

            <form onSubmit={onSubmit}>
              {/* USERNAME */}
              <Box sx={{ mb: "15px" }}>
                <Typography sx={{ mb: "5px" }}>Username</Typography>
                <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 300 }}
                  slotProps={{
                    input: {
                      sx: {
                        padding: "10px",
                        fontSize: "16px",
                        borderRadius: "4px",
                      },
                    },
                  }}
                />
              </Box>

              {/* PASSWORD */}
              <Box sx={{ mb: "15px" }}>
                <Typography sx={{ mb: "5px" }}>Password</Typography>
                <TextField
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 300 }}
                  slotProps={{
                    input: {
                      sx: {
                        padding: "10px",
                        fontSize: "16px",
                        borderRadius: "4px",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* BUTTON */}
              <Button
                type="submit"
                disabled={loading}
                sx={{
                  width: 300,
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  borderRadius: "4px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#0056b3",
                  },
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Box>

          {/* RIGHT: IMAGE */}
          <Box
            component="img"
            src={logo}
            alt="Dallol Bingo"
            sx={{
              width: 420,
              height: 420,
              borderRadius: "8px",
              boxShadow: "-10px 0 15px -5px rgba(0, 0, 0, 0.5)",
              objectFit: "cover",
            }}
          />
        </Paper>
      </Box>
    </Fade>
  );
};

export default LoginForm;
