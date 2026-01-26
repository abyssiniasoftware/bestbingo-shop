import { useState } from 'react';
import { Box, Container, Fade, Grid } from '@mui/material';
import LoginLeftPanel from './LoginLeftPanel';
import LoginCard from './LoginCard';
import { localStorageKeys } from "./constants";

const LoginForm = ({ handleLogin, config }) => {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem(localStorageKeys.REMEMBER_ME) === "true"
      ? localStorage.getItem(localStorageKeys.REMEMBERED_USERNAME) || ""
      : "";
  });

  const [password, setPassword] = useState(() => {
    return localStorage.getItem(localStorageKeys.REMEMBER_ME) === "true"
      ? localStorage.getItem(localStorageKeys.REMEMBERED_PASSWORD) || ""
      : "";
  });

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem(localStorageKeys.REMEMBER_ME) === "true";
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (rememberMe) {
      localStorage.setItem(localStorageKeys.REMEMBERED_USERNAME, username);
      localStorage.setItem(localStorageKeys.REMEMBERED_PASSWORD, password);
      localStorage.setItem(localStorageKeys.REMEMBER_ME, "true");
    } else {
      localStorage.removeItem(localStorageKeys.REMEMBERED_USERNAME);
      localStorage.removeItem(localStorageKeys.REMEMBERED_PASSWORD);
      localStorage.setItem(localStorageKeys.REMEMBER_ME, "false");
    }
    handleLogin(username, password, setLoading, setErrorMessage);
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          p: { xs: 1, md: 3 }
        }}
      >
        <Container maxWidth="lg" sx={{ p: '0 !important' }}>
          <Grid
            container
            sx={{ 
                flexWrap: 'nowrap', 
                flexDirection: 'row',
                alignItems: 'stretch',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                borderRadius: '16px',
                overflow: 'hidden' // Keeps the inner cards' corners clean
            }}
          >
            {/* LEFT PANEL - 50% width */}
            <Grid item xs={6} sx={{ display: 'flex' }}>
              <LoginLeftPanel config={config} />
            </Grid>

            {/* RIGHT PANEL - 50% width */}
            <Grid item xs={6} sx={{ display: 'flex' }}>
              <LoginCard
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                loading={loading}
                errorMessage={errorMessage}
                onSubmit={onSubmit}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default LoginForm;