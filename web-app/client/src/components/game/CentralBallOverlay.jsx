import { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { balls } from "../../images/balls";

const getBallImage = (num) => balls[num];

const CentralBallOverlay = ({ currentNumber, show, isMoving, moveDuration = 600 }) => {
  const numValue = parseInt(currentNumber) || 0;
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1
  });
  const [opacity, setOpacity] = useState(1);
  const ballRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!show || numValue <= 0) return;

    // Reset to center when showing (defer state update)
    requestAnimationFrame(() => {
      setTransform({
        x: 0,
        y: 0,
        scale: 1
      });
      setOpacity(1);

      if (ballRef.current) {
        ballRef.current.style.transition = 'none';
      }
    });
  }, [show, numValue]);


  useEffect(() => {
    if (!isMoving || !show || numValue <= 0 || !ballRef.current) {
      return;
    }

    const calculateAndAnimate = () => {
      const targetCell = document.getElementById(`cell-number-${numValue}`);
      if (!targetCell) {
        // Fallback: move to corner and fade out
        setTransform({
          x: -window.innerWidth * 0.4,
          y: -window.innerHeight * 0.4,
          scale: 0.15
        });
        setTimeout(() => {
          setOpacity(0);
        }, moveDuration * 0.7); // Start fading 70% through the movement
        return;
      }

      const rect = targetCell.getBoundingClientRect();
      const ballRect = ballRef.current.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Target position (center of the cell)
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      // Calculate movement delta
      const deltaX = targetX - centerX;
      const deltaY = targetY - centerY;

      // Calculate final scale (match cell height)
      const ballHeight = ballRect.height || 350; // Default fallback
      const scaleFactor = Math.max(0.15, rect.height / ballHeight);

      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame to ensure smooth start
      animationFrameRef.current = requestAnimationFrame(() => {
        // First, enable transitions
        if (ballRef.current) {
          ballRef.current.style.transition = `transform ${moveDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${moveDuration * 0.3}ms ease ${moveDuration * 0.7}ms`;
        }

        // Start the movement animation
        setTransform({
          x: deltaX,
          y: deltaY,
          scale: scaleFactor
        });

        // Start fade out towards the end of movement
        setTimeout(() => {
          setOpacity(0);
        }, moveDuration * 0.7);
      });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(calculateAndAnimate, 50);

    return () => {
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMoving, numValue, show, moveDuration]);

  if (!show || numValue <= 0) return null;

  return (
    <Box
      ref={ballRef}
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: `translate(${transform.x}px, ${transform.y}px) translate(-50%, -50%) scale(${transform.scale})`,
        opacity: opacity,
        zIndex: 9999,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0ms, opacity 0ms", // Default (will be overridden)
        willChange: "transform, opacity", // Optimize for animation
      }}
    >
      {/* Ball Container */}
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
        {/* Outer Glow Ring - only when not moving */}
        {!isMoving && (
          <Box
            sx={{
              position: "absolute",
              width: "110%",
              height: "110%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,165,0,0.4) 0%, rgba(255,69,0,0.1) 60%, rgba(255,0,0,0) 80%)",
              animation: "glowPulse 1.5s ease-in-out infinite",
              zIndex: 1,
            }}
          />
        )}

        {/* Inner High-Intensity Glow - only when not moving */}
        {!isMoving && (
          <Box
            sx={{
              position: "absolute",
              width: "90%",
              height: "90%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.2) 70%, transparent 100%)",
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
            transition: "filter 300ms ease",
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
            marginTop: "-5%",
            transition: "transform 300ms ease",
            transform: isMoving ? "scale(0.9)" : "scale(1)",
          }}
        >
          {numValue}
        </Typography>
      </Box>

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
  );
};

export default CentralBallOverlay;