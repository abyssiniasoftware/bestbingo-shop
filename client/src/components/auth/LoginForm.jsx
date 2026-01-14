import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Fade,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  Paper,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

const LoginForm = ({ handleLogin, config }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const themeColors = {
    primaryRed: "#8C3B3B",
    lightInputBg: "#F0F4F8", 
    highlightGrey: "#D1D5DB", 
    darkBlue: "#1a237e",
    gold: "#FFD700",
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password, setLoading, setErrorMessage);
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          width: "100%", // Ensures full width
        }}
      >
        {/* 1. TOP HEADER (Full Width) */}
        <Box
          component="header"
          sx={{
            width: "100%",
            height: "80px", // Fixed height for header
            px: { xs: 2, md: 5 },
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          <img
            src={config.logo}
            alt="Logo"
            style={{ height: "50px", objectFit: "contain" }}
          />
        </Box>

        {/* 2. MAIN CONTENT AREA */}
        <Container 
          maxWidth="xl" // Changed to xl for wider spread
          sx={{ 
            flexGrow: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            py: 4 
          }}
        >
          <Grid container spacing={8} alignItems="center" justifyContent="center">
            
            {/* LEFT SIDE: Marketing Text & Image */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Box sx={{ maxWidth: 500, mx: "auto" }}>
                {/* Bingo Name Text - Adjusted for better contrast */}
                <Typography
                  variant="h3"
                  sx={{
                    color: themeColors.gold,
                    fontWeight: 900,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    textShadow: "3px 3px 0 rgba(0,0,0,0.3), 6px 6px 0 rgba(0,0,0,0.1)",
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  {config.bingoName}
                </Typography>
                
                {/* BINGO Text - Darker shadow for better contrast */}
                <Typography
                  variant="h1"
                  sx={{
                    color: themeColors.darkBlue,
                    fontWeight: 900,
                    fontSize: { xs: "3rem", md: "4.5rem" },
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    textShadow: `3px 3px 0 ${themeColors.gold}, 6px 6px 0 rgba(0,0,0,0.2)`,
                    mb: 3,
                    lineHeight: 1,
                  }}
                >
                  BINGO
                </Typography>

                {/* Subtitle - Changed from white to dark blue for contrast */}
                <Typography
                  variant="h6"
                  sx={{
                    color: themeColors.darkBlue,
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    mb: 4,
                    opacity: 0.9,
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    px: 3,
                    py: 1,
                    borderRadius: "8px",
                    border: `2px solid ${themeColors.gold}`,
                  }}
                >
                  ETHIOPIA'S BEST BINGO SOFTWARE
                </Typography>

                {/* Tagline in Amharic - Darker blue for better readability */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#1e40af", // Darker blue for better contrast
                    maxWidth: 400,
                    lineHeight: 1.8,
                    mx: "auto",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    borderLeft: `3px solid ${themeColors.gold}`,
                    pl: 2,
                    py: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "0 8px 8px 0",
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                  }}
                >
                  ከ{config.bingoName} Bingo ጋር የቢንጎ ጨዋታዎችን በተሻለ ሁኔታ ያግኙ። አሁኑኑ ይቀላቀሉ!
                </Typography>

                {/* Optional: Add decorative elements for visual interest */}
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
                  <Box sx={{ width: 20, height: 20, backgroundColor: themeColors.gold, borderRadius: "50%" }} />
                  <Box sx={{ width: 20, height: 20, backgroundColor: themeColors.darkBlue, borderRadius: "50%" }} />
                  <Box sx={{ width: 20, height: 20, backgroundColor: themeColors.primaryRed, borderRadius: "50%" }} />
                </Box>
              </Box>
            </Grid>

            {/* RIGHT SIDE: Login Card */}
            <Grid item xs={12} md={5} lg={4}>
              <Paper
                elevation={4}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: "16px",
                  border: "1px solid #f0f0f0",
                  width: "100%",
                  backgroundColor: "#fff",
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: `linear-gradient(90deg, ${themeColors.darkBlue}, ${themeColors.gold}, ${themeColors.primaryRed})`,
                  },
                }}
              >
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: themeColors.primaryRed,
                      fontWeight: "bold",
                      fontFamily: '"Times New Roman", serif',
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      fontSize: "1.25rem",
                      mb: 1,
                    }}
                  >
                    PLEASE LOGIN
                  </Typography>
                  <Box 
                    sx={{ 
                      width: 60, 
                      height: 2, 
                      backgroundColor: themeColors.darkBlue,
                      mx: "auto",
                      opacity: 0.7,
                    }} 
                  />
                </Box>

                <form onSubmit={onSubmit}>
                  {/* Username */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#374151",
                        fontWeight: 600,
                        mb: 1,
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Username
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: themeColors.darkBlue }} />
                          </InputAdornment>
                        ),
                        sx: {
                          backgroundColor: themeColors.lightInputBg,
                          borderRadius: "8px",
                          "& fieldset": { border: "none" },
                          fontSize: "0.95rem",
                          "&::placeholder": {
                            color: "#6b7280",
                            opacity: 0.8,
                          },
                        },
                      }}
                    />
                  </Box>

                  {/* Password */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#374151",
                        fontWeight: 600,
                        mb: 1,
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Password
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: themeColors.darkBlue }} />
                          </InputAdornment>
                        ),
                        sx: {
                          backgroundColor: themeColors.lightInputBg,
                          borderRadius: "8px",
                          "& fieldset": { border: "none" },
                          "&::placeholder": {
                            color: "#6b7280",
                            opacity: 0.8,
                            letterSpacing: "0.2em",
                          },
                        },
                      }}
                    />
                  </Box>

                  {errorMessage && (
                    <Typography
                      color="error"
                      align="center"
                      sx={{ 
                        mb: 3, 
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        backgroundColor: "#fee2e2",
                        py: 1,
                        borderRadius: "4px",
                      }}
                    >
                      {errorMessage}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    variant="contained"
                    sx={{
                      backgroundColor: themeColors.primaryRed,
                      paddingY: 1.5,
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      boxShadow: "0 4px 12px rgba(140, 59, 59, 0.3)",
                      letterSpacing: "0.05em",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        backgroundColor: "#6e2e2e",
                        boxShadow: "0 6px 16px rgba(110, 46, 46, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transition: "left 0.7s",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },
                    }}
                  >
                    {loading ? "LOGGING IN..." : "LOGIN"}
                  </Button>

                  {/* Footer note */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 3,
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      opacity: 0.8,
                    }}
                  >
                    Secure login powered by Abyssinia Software
                  </Typography>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default LoginForm;