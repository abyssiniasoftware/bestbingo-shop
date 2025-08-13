import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Fade,
  TextField,
  Typography,
  Grid,
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
          backgroundImage: `url(${config.logo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom right, rgba(30, 58, 138, 0.85), rgba(0,0,0,0.7))",
            backdropFilter: "blur(10px)",
            zIndex: 1,
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 2, px: { xs: 2, md: 4 } }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* Logo and Text Section for Desktop */}
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
              <Box>
                <img
                  src={config.logo}
                  alt={`${config.bingoName} ሎጎ`}
                  style={{
                    width: "300px",
                    height: "auto",
                    marginBottom: "2rem",
                    borderRadius: "16px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  }}
                />

                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#cbd5e1",
                    maxWidth: 400,
                    lineHeight: 1.6,
                    mx: "auto",
                  }}
                >
                  ከ{config.bingoName} ጋር የቢንጎ ጨዋታዎችን በተሻለ ሁኔታ ያግኙ። አሁኑኑ ይቀላቀሉ እና
                  የማይተመኑ ደስታና ተደጋጋሚ እድሎችን ያግኙ።
                </Typography>

                {/* Improved Designer Credit */}
                <Box sx={{ mt: 5 }}>
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
                      color: "#e2e8f0",
                      textTransform: "uppercase",
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      opacity: 0.85,
                    }}
                  >
                    <Box component="span" aria-hidden sx={{ color: "#f87171" }}>
                      ♥
                    </Box>
                    Crafted by
                    <Box
                      component="span"
                      sx={{
                        background: "linear-gradient(90deg,#60a5fa,#c084fc)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
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
              </Box>
            </Grid>

            {/* Form Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  maxWidth: 480,
                  mx: "auto",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  padding: { xs: 3, sm: 5 },
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {config.bingoName}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#cbd5e1", mt: 1 }}
                  >
                    ወደ ማስተር ቢንጎ ይግቡ
                  </Typography>
                </Box>

                <form onSubmit={onSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#f1f5f9", mb: 1 }}
                    >
                      የተጠቃሚ ስም
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="የተጠቃሚ ስምህን አስገባ"
                      variant="outlined"
                      sx={{
                        input: { color: "#fff" },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          "& fieldset": { borderColor: "#e0e7ff" },
                          "&:hover fieldset": { borderColor: "#3b82f6" },
                          "&.Mui-focused fieldset": { borderColor: "#60a5fa" },
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#f1f5f9", mb: 1 }}
                    >
                      የይለፍ ቃል
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="የይለፍ ቃልህን አስገባ"
                      variant="outlined"
                      sx={{
                        input: { color: "#fff" },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          "& fieldset": { borderColor: "#e0e7ff" },
                          "&:hover fieldset": { borderColor: "#3b82f6" },
                          "&.Mui-focused fieldset": { borderColor: "#60a5fa" },
                        },
                      }}
                    />
                  </Box>

                  {errorMessage && (
                    <Typography
                      color="error"
                      align="center"
                      sx={{ mb: 3, fontSize: "0.875rem" }}
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
                      backgroundColor: "#1e3a8a",
                      paddingY: 1.5,
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#3b82f6" },
                      "&:disabled": {
                        backgroundColor: "#9ca3af",
                        cursor: "not-allowed",
                      },
                    }}
                  >
                    {loading ? "በመግባት ላይ..." : "ግባ"}
                  </Button>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default LoginForm;
