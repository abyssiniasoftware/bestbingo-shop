import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { logo } from '../../images/images';
import { themeColors, uiStyles } from './constants';

const LoginLeftPanel = ({ config }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100%',
minHeight: { xs: 'auto', md: 'auto' }
,                backgroundColor: '#FFFFFF',
                borderRadius: uiStyles.borderRadius,
                overflow: 'hidden',
                border: '1px solid #edf2f7',
                boxShadow: uiStyles.cardShadow,
                transition: uiStyles.transition,
                '&:hover': {
                    boxShadow: '0 15px 50px rgba(0,0,0,0.12)',
                },
            }}
        >
            {/* INTEGRATED TOP BRANDING */}
            <Box
                sx={{
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    p: { xs: 1.5, md: 4 }, // Smaller padding on mobile side-by-side
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                    textAlign: 'center',
                    backdropFilter: 'blur(4px)',
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        color: themeColors.gold,
                        fontWeight: 900,
                        fontSize: { xs: '1.2rem', sm: '1.8rem', md: '3.2rem' }, // Scaled down for narrow columns
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        textShadow: '2px 4px 20px rgba(0,0,0,0.9)',
                        mb: 0.5,
                        lineHeight: 1,
                    }}
                >
                    {config.bingoName}
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        color: themeColors.white,
                        fontWeight: 800,
                        fontSize: { xs: '0.5rem', sm: '0.7rem', md: '0.9rem' }, // Scaled down
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        opacity: 0.95,
                        textShadow: '1px 2px 8px rgba(0,0,0,0.8)',
                    }}
                >
                    ETHIOPIA'S BEST BINGO SOFTWARE
                </Typography>
            </Box>

            {/* CENTER LOGO AREA - TRUE FULL SPACE */}
            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0, // No padding for full space impact
                    backgroundColor: '#fff',
                    position: 'relative',
                }}
            >
                <img
                    src={logo}
                    alt="Bingo Logo"
                    style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain', // Ensure logo isn't cropped but fills space ideally
                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        padding: '20px 0', // Tiny vertical breathing room but full width
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04) rotate(1deg)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
                />
            </Box>

            {/* INTEGRATED BOTTOM SECTION */}
            <Box
                sx={{
                    width: '100%',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    zIndex: 2,
                    p: { xs: 1.5, md: 4 },
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                    textAlign: 'center',
                    backdropFilter: 'blur(4px)',
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: themeColors.white,
                        lineHeight: 1.4,
                        fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' }, // Scaled down
                        fontWeight: 700,
                        mb: 2,
                        fontStyle: 'italic',
                        textShadow: '2px 2px 10px rgba(0,0,0,0.9)',
                    }}
                >
                    ከ{config.bingoName} ጋር የቢንጎ ጨዋታዎችን በተሻለ ሁኔታ ያግኙ።
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box sx={{ height: '2px', width: '40px', backgroundColor: themeColors.gold, borderRadius: '2px', boxShadow: `0 0 10px ${themeColors.gold}` }} />
                    {[themeColors.gold, '#FFFFFF', themeColors.primaryRed].map((color, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: 9,
                                height: 9,
                                backgroundColor: color,
                                borderRadius: '50%',
                                boxShadow: `0 0 15px ${color}`,
                                opacity: i === 1 ? 1 : 0.8,
                            }}
                        />
                    ))}
                    <Box sx={{ height: '2px', width: '40px', backgroundColor: themeColors.primaryRed, borderRadius: '2px', boxShadow: `0 0 10px ${themeColors.primaryRed}` }} />
                </Box>
            </Box>
        </Box>
    );
};

export default LoginLeftPanel;