import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import { Box } from "@mui/material";

const BlowerAnimation = ({
  calledNumbers = [],
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
    const width = 280;
    const height = 280;

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

      const ball = Matter.Bodies.circle(x, y, 7.5, {
        restitution: 1.05,
        friction: 0.001,
        frictionAir: 0.01,
        render: {
          sprite: {
            texture: `/balls/${i}.png`,
            xScale: 0.30,
            yScale: 0.30
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
        const scale = width / 550;
        const forceMag = 0.0012;

        if (ball.position.y >= height - (90 * scale)) {
          Matter.Body.applyForce(ball, ball.position, { x: forceMag * 0.5, y: -forceMag * 2.5 });
        }
        if (ball.position.y < (110 * scale)) {
          Matter.Body.applyForce(ball, ball.position, { x: -forceMag * 0.5, y: forceMag });
        }
        if (ball.position.x < (70 * scale)) {
          Matter.Body.applyForce(ball, ball.position, { x: forceMag, y: -forceMag * 0.2 });
        }
        if (ball.position.x > width - (70 * scale)) {
          Matter.Body.applyForce(ball, ball.position, { x: -forceMag, y: forceMag * 0.2 });
        }

        const turbulenceX = (Math.random() - 0.5) * 0.0006;
        const turbulenceY = (Math.random() - 0.5) * 0.0006 - 0.0004;
        Matter.Body.applyForce(ball, ball.position, { x: turbulenceX, y: turbulenceY });

        if (Math.random() > 0.99) {
          Matter.Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * 0.006,
            y: (Math.random() - 0.5) * 0.006
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
  }, []);

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
          width: "280px",
          height: "280px",
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
            width: "50px",
            height: "50px",
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