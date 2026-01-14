import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  Paper,
  Fade,
} from "@mui/material";

const LoginForm = ({ handleLogin, config }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password, setLoading, setErrorMessage);
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#1a237e", // Dark blue background from image
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)",
            zIndex: 1,
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 2, px: { xs: 2, md: 4 } }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* Left Section - Branding */}
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
                {/* Happy Bingo Text */}
                <Typography
                  variant="h3"
                  sx={{
                    color: "#FFD700", // Gold color
                    fontWeight: 900,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    textShadow: "3px 3px 0 #000, 6px 6px 0 rgba(0,0,0,0.2)",
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  happy
                </Typography>
                
                <Typography
                  variant="h1"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: { xs: "3rem", md: "4.5rem" },
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    textShadow: "3px 3px 0 #FFD700, 6px 6px 0 rgba(0,0,0,0.3)",
                    mb: 3,
                    lineHeight: 1,
                  }}
                >
                  BINGO
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    mb: 4,
                    opacity: 0.9,
                  }}
                >
                  ETHIOPIA'S BEST BINGO SOFTWARE
                </Typography>

                {/* Tagline in Amharic */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#BBDEFB", // Light blue
                    maxWidth: 400,
                    lineHeight: 1.8,
                    mx: "auto",
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    borderLeft: "3px solid #FFD700",
                    pl: 2,
                    py: 1,
                  }}
                >
                  ከHappy Bingo ጋር የቢንጎ ጨዋታዎችን በተሻለ ሁኔታ ያግኙ። አሁኑኑ ይቀላቀሉ!
                </Typography>
              </Box>
            </Grid>

            {/* Right Section - Login Form */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={24}
                sx={{
                  maxWidth: 450,
                  mx: "auto",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 3,
                  padding: { xs: 3, md: 5 },
                  position: "relative",
                  overflow: "hidden",
                  border: "2px solid #FFD700",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    backgroundColor: "#1a237e",
                    clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 80,
                    height: 80,
                    backgroundColor: "#FFD700",
                    clipPath: "polygon(0 100%, 100% 100%, 0 0)",
                  }}
                />

                <Box textAlign="center" mb={4} position="relative" zIndex={1}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#1a237e",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      mb: 1,
                    }}
                  >
                    PLEASE LOGIN
                  </Typography>
                  <Box
                    sx={{
                      width: 60,
                      height: 4,
                      backgroundColor: "#FFD700",
                      mx: "auto",
                      mb: 3,
                    }}
                  />
                </Box>

                <form onSubmit={onSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#1a237e",
                        mb: 1.5,
                        fontSize: "1.1rem",
                      }}
                    >
                      Username
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "#F5F5F5",
                          "& fieldset": {
                            borderColor: "#BDBDBD",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#1a237e",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontWeight: 500,
                          color: "#1a237e",
                          padding: "14px",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#1a237e",
                        mb: 1.5,
                        fontSize: "1.1rem",
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "#F5F5F5",
                          "& fieldset": {
                            borderColor: "#BDBDBD",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#1a237e",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontWeight: 500,
                          color: "#1a237e",
                          padding: "14px",
                        },
                      }}
                    />
                  </Box>

                  {errorMessage && (
                    <Typography
                      color="error"
                      align="center"
                      sx={{ mb: 3, fontWeight: 600, fontSize: "0.95rem" }}
                    >
                      {errorMessage}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      backgroundColor: "#1a237e",
                      background: "linear-gradient(145deg, #1a237e 0%, #283593 100%)",
                      paddingY: 2,
                      borderRadius: "8px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      boxShadow: "0 6px 20px rgba(26, 35, 126, 0.3)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        backgroundColor: "#283593",
                        boxShadow: "0 8px 25px rgba(26, 35, 126, 0.4)",
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
                        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                        transition: "left 0.7s",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },
                      "&:disabled": {
                        backgroundColor: "#9e9e9e",
                        cursor: "not-allowed",
                        transform: "none",
                      },
                    }}
                  >
                    {loading ? "LOGGING IN..." : "LOGIN"}
                  </Button>
                </form>

                {/* Footer */}
                <Box sx={{ mt: 5, textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      letterSpacing: ".08em",
                      fontWeight: 500,
                      color: "#424242",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    <Box component="span" sx={{ color: "#1a237e", fontWeight: 700 }}>
                      ★
                    </Box>
                    Powered by
                    <Box
                      component="span"
                      sx={{
                        color: "#1a237e",
                        fontWeight: 700,
                        px: 0.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Abyssinia Software Technology PLC
                    </Box>
                    • © {new Date().getFullYear()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default LoginForm;