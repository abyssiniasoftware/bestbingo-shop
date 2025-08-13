import { Box, styled } from '@mui/material';

export const pulseAnimation = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

export const StyledCardNumber = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'called' && prop !== 'isShuffling',
})(({ theme, called }) => ({
  width: 40,
  height: 40,
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '1rem',
  color: '#fff',
  backgroundColor: called === 'true' || called === true ? '#ef4444' : '#4b5563',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    width: 32,
    height: 32,
    fontSize: '0.875rem',
  },
}));

export const PatternBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'winning',
})(({ theme, active, winning }) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: winning === true || winning === 'true' ? '#22c55e' : '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: active === true || active === 'true' ? 'pulse 0.5s ease-in-out infinite' : 'none',
  [theme.breakpoints.down('sm')]: {
    width: 15,
    height: 15,
  },
}));



