import React from 'react';
import { Box, Button, Typography, TextField, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { themeColors } from './constants';

const LoginCard = (props) => {
  const { username, setUsername, password, setPassword, showPassword, setShowPassword, rememberMe, setRememberMe, loading, errorMessage, onSubmit } = props;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 6 },
        width: '100%',
        backgroundColor: themeColors.white,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: `linear-gradient(90deg, ${themeColors.gold}, ${themeColors.primaryRed})`,
        },
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" sx={{ color: themeColors.primaryRed, fontWeight: 800, fontSize: { xs: '1rem', md: '1.5rem' } }}>
          PLEASE LOGIN
        </Typography>
      </Box>

      <form onSubmit={onSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: themeColors.darkBlue, mb: 1, display: 'block' }}>USERNAME</Typography>
          <TextField
            fullWidth
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>,
              sx: { backgroundColor: themeColors.lightInputBg }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: themeColors.darkBlue, mb: 1, display: 'block' }}>PASSWORD</Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} size="small"><VisibilityIcon fontSize="small" /></IconButton>
                </InputAdornment>
              ),
              sx: { backgroundColor: themeColors.lightInputBg }
            }}
          />
        </Box>

        <FormControlLabel
          control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} size="small" />}
          label={<Typography sx={{ fontSize: '0.75rem' }}>Remember me</Typography>}
          sx={{ mb: 3 }}
        />

        {errorMessage && (
          <Typography color="error" textAlign="center" sx={{ mb: 2, fontSize: '0.8rem', fontWeight: 700 }}>
            {errorMessage}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: themeColors.primaryRed,
            py: 1.5,
            fontWeight: 800,
            '&:hover': { backgroundColor: themeColors.primaryRedHover }
          }}
        >
          {loading ? 'LOGGING IN...' : 'SIGN IN NOW'}
        </Button>
      </form>
    </Box>
  );
};

export default LoginCard;