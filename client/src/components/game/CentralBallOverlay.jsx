import { Box, Typography, Zoom, Fade } from "@mui/material";

const getBallImage = (num) => `/balls/${num}.png`;

const CentralBallOverlay = ({ currentNumber, show, isMoving }) => {
  const numValue = parseInt(currentNumber) || 0;

  const isVisible = show && numValue > 0;

  if (!isVisible) return null;

  if (numValue <= 0) return null;

  return (
    <Fade in={isVisible} timeout={400}>
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: (() => {
            if (!isMoving) return "translate(-50%, -50%) scale(1)";

            const targetCell = document.getElementById(`cell-number-${numValue}`);
            if (targetCell) {
              const rect = targetCell.getBoundingClientRect();
              const centerX = window.innerWidth / 2;
              const centerY = window.innerHeight / 2;

              // Calculate delta to move from center to target cell center
              const targetX = rect.left + rect.width / 2;
              const targetY = rect.top + rect.height / 2;

              const deltaX = targetX - centerX;
              const deltaY = targetY - centerY;

              // We must maintain the centering translate(-50%, -50%) and THEN apply the delta
              // Note: transforms are applied left-to-right. 
              // Actually, since we start at top:50%, left:50%, adding deltaX/Y moves the top-left origin.
              // We then need strictly translate(-50%, -50%) relative to the element size to center it.
              return `translate(${deltaX}px, ${deltaY}px) translate(-50%, -50%) scale(0.15)`;
            }

            // Fallback if cell not found (e.g., scrolled out or logic error)
            return "translate(-45vw, -45vh) translate(-50%, -50%) scale(0.15)";
          })(),
          zIndex: 9999,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: isMoving ? "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          opacity: isMoving ? 0.3 : 1
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
