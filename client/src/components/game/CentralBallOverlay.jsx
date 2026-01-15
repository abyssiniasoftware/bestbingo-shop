import { useRef, useLayoutEffect } from "react";
import { Box, Typography, Zoom, Fade } from "@mui/material";

const getBallImage = (num) => `/balls/${num}.png`;

const CentralBallOverlay = ({ currentNumber, show, isMoving, moveDuration = 600 }) => {
  const numValue = parseInt(currentNumber) || 0;

  const isVisible = show && numValue > 0;
  const ballRef = useRef(null);

  useLayoutEffect(() => {
    if (!ballRef.current) return;

    if (!isMoving) {
      ballRef.current.style.transform = "translate(-50%, -50%) scale(1)";
      return;
    }

    const calculateTransform = () => {
      const targetCell = document.getElementById(`cell-number-${numValue}`);
      if (targetCell) {
        const rect = targetCell.getBoundingClientRect();
        const ballRect = ballRef.current.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Calculate dynamic scale to match target height exactly
        // If ballRect height is 0 (first render), default to 0.15
        // Use Math.max to avoid division by zero
        const scaleFactor = ballRect.height > 1 ? rect.height / ballRect.height : 0.15;

        // Calculate delta to move from center to target cell center
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        const deltaX = targetX - centerX;
        const deltaY = targetY - centerY;

        ballRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) translate(-50%, -50%) scale(${scaleFactor})`;
      } else {
        // Fallback
        ballRef.current.style.transform = "translate(-45vw, -45vh) translate(-50%, -50%) scale(0.15)";
      }
    };

    // Calculate immediately
    requestAnimationFrame(calculateTransform);

    // Optional: Recalculate on resize if needed, though animation is short
    // window.addEventListener('resize', calculateTransform);
    // return () => window.removeEventListener('resize', calculateTransform);

  }, [isMoving, numValue]);

  if (!isVisible) return null;

  if (numValue <= 0) return null;

  return (
    <Fade in={isVisible} timeout={500}>
      <Box
        ref={ballRef}
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(1)", // Initial state
          zIndex: 9999,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Smoother transition with separated properties and dynamic duration
          transition: isMoving ? `transform ${moveDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${moveDuration}ms ease` : "none",
          // Keep fully visible during move so it arrives at the grid
          opacity: 1
        }}
      >
        <Zoom in={isVisible} timeout={500}>
          <Box
            sx={{
              position: "relative",
              width: { xs: "250px", sm: "350px", md: "450px" },
              height: { xs: "250px", sm: "350px", md: "450px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Outer Glow Ring */}
            {!isMoving && (
              <Box
                sx={{
                  position: "absolute",
                  width: "110%",
                  height: "110%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,165,0,0.4) 0%, rgba(255,69,0,0.1) 60%, rgba(255,0,0,0) 80%)",
                  animation: "glowPulse 1.5s ease-in-out infinite",
                  zIndex: 1,
                }}
              />
            )}

            {/* Inner High-Intensity Glow */}
            {!isMoving && (
              <Box
                sx={{
                  position: "absolute",
                  width: "90%",
                  height: "90%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.2) 70%, transparent 100%)",
                  filter: "blur(20px)",
                  zIndex: 2,
                }}
              />
            )}

            {/* The Ball Image */}
            <Box
              component="img"
              src={getBallImage(numValue)}
              alt={`Ball ${numValue}`}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                position: "relative",
                zIndex: 3,
                filter: isMoving ? "none" : "drop-shadow(0 10px 40px rgba(0,0,0,0.6))",
              }}
            />

            {/* Large White Number Overlay */}
            <Typography
              sx={{
                position: "absolute",
                zIndex: 4,
                color: "#fff",
                fontSize: { xs: "5rem", sm: "7rem", md: "10rem" },
                fontWeight: "900",
                textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                fontFamily: "'Roboto Black', sans-serif",
                marginTop: "-5%", // Tilt correction for perspective
              }}
            >
              {numValue}
            </Typography>
          </Box>
        </Zoom>

        <style>
          {`
            @keyframes glowPulse {
                0% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.05); opacity: 0.9; }
                100% { transform: scale(1); opacity: 0.6; }
            }
          `}
        </style>
      </Box>
    </Fade>
  );
};

export default CentralBallOverlay;
