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
    const { Engine, Render, World, Bodies, Body, Runner, Events } = Matter;

    const engine = Engine.create();
    engine.gravity.y = 0.6; 
    engineRef.current = engine;
    worldRef.current = engine.world;

    const width = 260;
    const height = 260;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: "transparent",
      },
    });

    // 1. REINFORCED BOUNDARY
    const centerX = width / 2;
    const centerY = height / 2;
    const r = width * 0.48; 
    const pegCount = 72;
    for (let i = 0; i < pegCount; i++) {
      const angle = (i / pegCount) * Math.PI * 2;
      const x = Math.cos(angle) * r + centerX;
      const y = Math.sin(angle) * r + centerY;
      const peg = Bodies.rectangle(x, y, 40, 120, {
        angle: angle,
        isStatic: true,
        render: { fillStyle: "transparent" },
        friction: 0,
        restitution: 1.05 
      });
      World.add(engine.world, peg);
    }

    // 2. CREATE BALLS (3D PERSPECTIVE)
    const calledSet = new Set(calledNumbers.map(n => parseInt(n)));
    
    for (let i = 1; i <= 75; i++) {
      if (calledSet.has(i)) continue;

      const ball = Bodies.circle(centerX, centerY, 10, {
        restitution: 1.02,
        friction: 0,
        frictionAir: 0.012, // TWEAK: Increased slightly from 0.007 to slow down top speed
        render: {
          sprite: {
            texture: `/balls/${i}.png`,
            xScale: 0.4,
            yScale: 0.4
          }
        }
      });

      ball.z = Math.random(); 
      ball.zSpeed = (Math.random() - 0.5) * 0.02; // TWEAK: Slightly slower depth change
      ballsRef.current[i] = ball;
      World.add(engine.world, ball);
    }

    // 3. MOTION & RENDERING ENGINE
    const onRenderTick = () => {
      const balls = Object.values(ballsRef.current);
      const forceMag = 0.0028; // TWEAK: Lowered from 0.0035 for "a little" slower movement

      balls.forEach(ball => {
        // --- 3D PERSPECTIVE LOGIC ---
        ball.z += ball.zSpeed;
        if (ball.z > 1 || ball.z < 0) ball.zSpeed *= -1;

        const depthScale = 0.32 + (ball.z * 0.22);
        ball.render.sprite.xScale = depthScale;
        ball.render.sprite.yScale = depthScale;
        ball.render.opacity = 0.65 + (ball.z * 0.35);

        // --- SAFETY CHECK ---
        const distFromCenter = Math.sqrt(Math.pow(ball.position.x - centerX, 2) + Math.pow(ball.position.y - centerY, 2));
        if (distFromCenter > width) {
          Body.setPosition(ball, { x: centerX, y: centerY });
          Body.setVelocity(ball, { x: 0, y: 0 });
        }

        // --- DYNAMIC BLOWING PHYSICS ---
        if (ball.position.y >= height - 85) {
          Body.applyForce(ball, ball.position, { x: (Math.random() - 0.5) * 0.002, y: -forceMag * 2.3 });
        }
        
        // Circular swirl (Strength tuned for space utilization)
        const swirlX = (centerY - ball.position.y) * 0.000025;
        const swirlY = (ball.position.x - centerX) * 0.000025;
        Body.applyForce(ball, ball.position, { x: swirlX, y: swirlY });

        // Reduced Jitter
        if (Math.random() > 0.985) {
          Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * 0.006,
            y: (Math.random() - 0.5) * 0.006
          });
        }
      });

      // Z-INDEX SORTING
      engine.world.bodies.sort((a, b) => (a.z || 0) - (b.z || 0));
    };

    const runner = Runner.create();
    Events.on(runner, 'tick', onRenderTick);
    Runner.run(runner, engine);
    Render.run(render);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if(render.canvas) render.canvas.remove();
    };
  }, []);

  // 4. PRECISION REMOVAL LOGIC
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
    }}>
      <Box
        ref={sceneRef}
        sx={{
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          overflow: "hidden",
          background: "radial-gradient(circle at 40% 40%, #2c2c2c 0%, #000 100%)",
          boxShadow: "inset 0 0 50px rgba(0,0,0,1)",
          "& canvas": { width: "100% !important", height: "100% !important" }
        }}
      />
      <Box
        component="img"
        src="/images/blower.png"
        sx={{
          width: "120%",
          height: "120%",
          objectFit: "contain",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(90deg)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      />
      {zoomingBallNum && (
        <Box
          component="img"
          src={`/balls/${parseInt(zoomingBallNum)}.png`}
          sx={{
            position: "absolute",
            width: "100px",
            height: "100px",
            left: "50%",
            top: "50%",
            zIndex: 100,
            transform: "translate(-50%, -50%)",
            animation: "zoomPop 0.8s ease-out forwards",
          }}
        />
      )}
      <style>
        {`
          @keyframes zoomPop {
              0% { transform: translate(-50%, -50%) scale(0) rotate(-20deg); opacity: 0; }
              50% { opacity: 1; transform: translate(-50%, -50%) scale(1.8) rotate(0deg); }
              100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
};

export default BlowerAnimation;