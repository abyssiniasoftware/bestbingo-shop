import React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { FaPlay, FaStop, FaGlobe, FaTimes } from 'react-icons/fa';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '50%',
  minWidth: 40,
  height: 40,
  color: '#fff',
  backgroundColor: '#4b5563',
  '&:hover': {
    backgroundColor: '#6b7280',
    transform: 'scale(1.05)',
  },
  transition: 'transform 0.2s',
}));

const NavBar = ({ isPlaying, startDrawing, stopDrawing, handleReset, players, stake, winAmount }) => {
  return (
    <Box
      sx={{
        bgcolor: '#1f2937',
        p: 1,
        borderRadius: '12px',
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', gap: 1 }}>
        <StyledButton sx={{ bgcolor: '#60a5fa', '&:hover': { bgcolor: '#3b82f6' } }}>
          Players {players}
        </StyledButton>
        <StyledButton sx={{ bgcolor: '#60a5fa', '&:hover': { bgcolor: '#3b82f6' } }}>
          Bet {stake}
        </StyledButton>
        <StyledButton sx={{ bgcolor: '#60a5fa', '&:hover': { bgcolor: '#3b82f6' } }}>
          Win Amount {winAmount}
        </StyledButton>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StyledButton
          sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
          onClick={startDrawing}
          disabled={isPlaying}
        >
          <FaPlay />
        </StyledButton>
        <StyledButton
          sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
          onClick={stopDrawing}
          disabled={!isPlaying}
        >
          <FaStop />
        </StyledButton>
        <StyledButton sx={{ bgcolor: '#60a5fa', '&:hover': { bgcolor: '#3b82f6' } }}>
          Ready
        </StyledButton>
        <StyledButton>
          <FaGlobe />
        </StyledButton>
        <StyledButton onClick={handleReset}>
          <FaTimes />
        </StyledButton>
      </Box>
    </Box>
  );
};

export default NavBar;