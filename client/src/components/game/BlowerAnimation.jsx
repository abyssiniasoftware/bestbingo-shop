import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import { Box } from "@mui/material";

const BlowerAnimation = ({
  calledNumbers = [],
  // eslint-disable-next-line no-unused-vars
  currentNumber,
  zoomingBallNum = null
}) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const ballsRef = useRef({});

  useEffect(() => {
    // 1. Setup Engine
    const engine = Matter.Engine.create();
    engine.gravity.y = 1.0;
    engineRef.current = engine;
    worldRef.current = engine.world;

    // 2. Setup Renderer - Internal size
    const width = 260;
    const height = 260;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: "transparent",
      },
    });

    // 3. Create Circular Boundary (The Glass Sphere)
    const centerX = width / 2;
    const centerY = height / 2;
    const m = width;
    const r = m * (1 / 4.5 * 2);
    const pegCount = 64;
    const TAU = Math.PI * 2;

    for (let i = 0; i < pegCount; i++) {
      const segment = TAU / pegCount;
      const angle = (i / pegCount) * TAU + segment / 2;
      const x = Math.cos(angle) * r + centerX;
      const y = Math.sin(angle) * r + centerY;

      const peg = Matter.Bodies.rectangle(x, y, 100 / 1000 * m, 3000 / 1000 * m, {
        angle: angle,
        isStatic: true,
        render: { fillStyle: "transparent" },
      });
      Matter.World.add(engine.world, peg);
    }

    // 4. Create Balls
    const initialBalls = [];
    const calledSet = new Set(calledNumbers.map(n => parseInt(n)));

    for (let i = 1; i <= 75; i++) {
      const x = centerX + (Math.random() - 0.5) * 50;
      const y = centerY + (Math.random() - 0.5) * 50;

      const ball = Matter.Bodies.circle(x, y, 14, {
        restitution: 0.95,
        friction: 0.005,
        frictionAir: 0.04,
        render: {
          sprite: {
            texture: `/balls/${i}.png`,
            xScale: 0.55,
            yScale: 0.55
          }
        }
      });
      ball.label = `ball-${i}`;
      if (!calledSet.has(i)) {
        initialBalls.push(ball);
        ballsRef.current[i] = ball;
      }
    }
    Matter.World.add(engine.world, initialBalls);

    // 5. Blowing Logic
    const onRenderTick = () => {
      const balls = Object.values(ballsRef.current);
      balls.forEach(ball => {
        // 1. Gentle turbulence (Air chaoticity)
        const turbulenceX = (Math.random() - 0.5) * 0.001;
        const turbulenceY = (Math.random() - 0.5) * 0.001;
        Matter.Body.applyForce(ball, ball.position, { x: turbulenceX, y: turbulenceY });

        // 2. Main Blower "Fan" - Apply gentle upward pressure from the bottom
        const fanY = height * 0.8;
        if (ball.position.y > fanY) {
          const power = (ball.position.y - fanY) / (height * 0.2);
          Matter.Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * 0.001,
            y: -0.004 * power
          });
        }

        // 3. Very subtle vortex effect
        const dx = ball.position.x - centerX;
        const dy = ball.position.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          Matter.Body.applyForce(ball, ball.position, {
            x: -dy * 0.000005,
            y: dx * 0.000005
          });
        }

        // 4. Occasional gentle pulses
        if (Math.random() > 0.99) {
          Matter.Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * 0.005,
            y: (Math.random() - 0.5) * 0.005
          });
        }
      });
    };

    const runner = Matter.Runner.create();
    setTimeout(() => {
      Matter.Events.on(runner, 'tick', onRenderTick);
    }, 1000);

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null;
    };
  }, [calledNumbers]);

  useEffect(() => {
    if (!worldRef.current) return;
    const calledSet = new Set(calledNumbers.map(n => parseInt(n)));
    Object.keys(ballsRef.current).forEach(numStr => {
      const num = parseInt(numStr);
      if (calledSet.has(num)) {
        const ball = ballsRef.current[num];
        if (ball) {
          Matter.World.remove(worldRef.current, ball);
          delete ballsRef.current[num];
        }
      }
    });
  }, [calledNumbers]);

  return (
    <Box sx={{
      position: "relative",
      width: "280px",
      height: "280px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible" // ALLOW TUBE TO STICK OUT
    }}>
      {/* Matter.js Canvas */}
      <Box
        ref={sceneRef}
        sx={{
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          overflow: "hidden",
          background: "rgba(0,0,0,0.3)", // Slight dark backing for glass
          "& canvas": { width: "100% !important", height: "100% !important" }
        }}
      />

      {/* OVERLAY IMAGE 
         1. Rotated 90deg (Tube points right)
         2. Scaled up to 115% so tube clears the container
         3. Translated to center the Sphere part over the canvas
      */}
      <Box
        component="img"
        src="/images/blower.png"
        alt="Bingo Blower"
        sx={{
          width: "115%",
          height: "115%",
          objectFit: "contain",
          position: "absolute",
          top: "50%",
          left: "50%",
          // Rotate 90deg. 
          // Depending on your image transparency padding, you might need to tweak the X/Y translation slightly.
          // Assuming the sphere is centered in the source image:
          transform: "translate(-50%, -50%) rotate(90deg)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      />

      {/* Zooming Ball */}
      {zoomingBallNum && (
        <Box
          component="img"
          src={`/balls/${parseInt(zoomingBallNum)}.png`}
          alt={`Zooming Ball ${zoomingBallNum}`}
          sx={{
            position: "absolute",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            left: "50%",
            top: "50%",
            zIndex: 30, // Above the glass
            transform: "translate(-50%, -50%)",
            animation: "zoomAndVanish 1s ease-out forwards",
          }}
        />
      )}
      <style>
        {`
          @keyframes zoomAndVanish {
              0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; filter: brightness(1); }
              50% { transform: translate(-50%, -50%) scale(2.5); opacity: 1; filter: brightness(1.5); }
              100% { transform: translate(-50%, -50%) scale(5); opacity: 0; filter: brightness(2); }
          }
        `}
      </style>
    </Box>
  );
};

export default BlowerAnimation;