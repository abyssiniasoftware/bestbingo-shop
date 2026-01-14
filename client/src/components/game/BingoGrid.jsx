import { useState, useEffect } from "react";

import { Box, Grid, Typography, styled } from "@mui/material";

import "../../styles/game-redesign.css";



// Define animations

const gridPulseAnimation = `

@keyframes gridPulse {

0% { transform: scale(1); background-color: #1f2937; }

50% { transform: scale(1.1); background-color: #3b82f6; }

100% { transform: scale(1); background-color: #1f2937; }

`;



const calledPulseAnimation = `

@keyframes calledPulse {

0% { transform: scale(1); }

50% { transform: scale(1.15); }

100% { transform: scale(1); }

`;



const numberFlipAnimation = `

@keyframes numberFlip {

0% { transform: perspective(400px) rotateX(0deg); opacity: 1; }

50% { transform: perspective(400px) rotateX(90deg); opacity: 0.3; }

100% { transform: perspective(400px) rotateX(0deg); opacity: 1; }

`;



// BINGO letter styles

const letterColors = {

  B: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",

  I: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",

  N: "linear-gradient(135deg, #854d0e 0%, #eab308 100%)",

  G: "linear-gradient(135deg, #14532d 0%, #22c55e 100%)",

  O: "linear-gradient(135deg, #374151 0%, #6b7280 100%)",

};



const StyledBingoLetter = styled(Box)(({ theme, letter }) => ({
  width: "100%", // Fill the column width
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#fff",
  // Simple gradients for headers
  background: letterColors[letter] || letterColors.B,
  borderRadius: "4px",
  marginBottom: "4px", // Small gap between header and numbers
}));



const StyledNumberCell = styled(Box)(({ theme, called, isShuffling }) => ({
  // Dimensions: Set width to fill the grid column, fixed height for the "bar" look
  width: "100%",
  height: "65px", // Increased height to match the tall rectangular look in screenshot

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  // Typography
  fontSize: "2rem", // Larger font to match screenshot
  fontWeight: "900", // Extra bold
  color: "#fff",
  textShadow: "0px 2px 4px rgba(0,0,0,0.6)", // Text shadow for better readability


  backgroundImage: called
    ? "url(/images/called.png)"
    : "url(/images/num.png)",

  backgroundSize: "100% 100%", // Critical: Stretches the image to fit the rectangle exactly
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundColor: "transparent", // Ensure no solid color sits behind

  cursor: "default",
  userSelect: "none",

  // Animations
  transition: "transform 0.2s ease",
  animation: isShuffling
    ? "gridPulse 0.6s ease-in-out, numberFlip 0.3s ease-in-out"
    : called
      ? "calledPulse 0.4s ease-in-out"
      : "none",

  // Responsive Breakpoints
  [theme.breakpoints.down("lg")]: {
    height: "55px",
    fontSize: "1.75rem",
  },
  [theme.breakpoints.down("md")]: {
    height: "45px",
    fontSize: "1.4rem",
  },
  [theme.breakpoints.down("sm")]: {
    height: "35px",
    fontSize: "1rem",
  },
}));



// Utility functions

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;



const getBingoLetter = (number) => {

  if (number >= 1 && number <= 15) return "B";

  if (number >= 16 && number <= 30) return "I";

  if (number >= 31 && number <= 45) return "N";

  if (number >= 46 && number <= 60) return "G";

  return "O";

};



const BingoGrid = ({ calledNumbers, shuffling }) => {

  const [shuffledNumber, setShuffledNumber] = useState(null);

  const [fastShuffleNums, setFastShuffleNums] = useState([]);

  const [displayNumbers, setDisplayNumbers] = useState({});

  const [isFastShuffling, setIsFastShuffling] = useState(false);



  // Shuffle simulation

  useEffect(() => {

    if (!shuffling) {

      setShuffledNumber(null);

      setFastShuffleNums([]);

      setDisplayNumbers({});

      setIsFastShuffling(false);

      return;

    }



    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);

    const uncalledNumbers = allNumbers.filter(

      (num) => !calledNumbers.includes(num.toString())

    );

    if (uncalledNumbers.length === 0) {

      setShuffledNumber(null);

      setFastShuffleNums([]);

      setDisplayNumbers({});

      setIsFastShuffling(false);

      return;

    }



    setIsFastShuffling(true);

    let shuffleCount = 0;

    const maxShuffleRounds = 50;

    const numbersToShuffle = 60;

    const fastShuffleInterval = setInterval(() => {

      shuffleCount += 1;

      const shuffledIndices = [];

      const shuffledNumbers = [];

      while (

        shuffledIndices.length < Math.min(numbersToShuffle, uncalledNumbers.length)

      ) {

        const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);

        if (!shuffledIndices.includes(randomIndex)) {

          shuffledIndices.push(randomIndex);

          shuffledNumbers.push(uncalledNumbers[randomIndex]);

        }

      }

      setFastShuffleNums(shuffledNumbers);



      const newDisplayNumbers = {};

      shuffledNumbers.forEach((num) => {

        newDisplayNumbers[num] = getRandomInt(1, 75);

      });

      setDisplayNumbers(newDisplayNumbers);



      if (shuffleCount >= maxShuffleRounds) {

        clearInterval(fastShuffleInterval);

        setIsFastShuffling(false);

        setFastShuffleNums([]);

        setDisplayNumbers({});

      }

    }, 100);



    const selectTimeout = setTimeout(() => {

      const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);

      const selectedNumber = uncalledNumbers[randomIndex];

      setShuffledNumber(selectedNumber);

    }, 100 * maxShuffleRounds + 1200);



    return () => {

      clearTimeout(selectTimeout);

      clearInterval(fastShuffleInterval);

    };

  }, [shuffling, calledNumbers]);



  const letters = ["B", "I", "N", "G", "O"];



  // Render the grid in 5 rows (one per BINGO letter)

  return (

    <>

      <style>

        {gridPulseAnimation} {calledPulseAnimation} {numberFlipAnimation}

      </style>

      <Box

        className="bingo-grid-container"

        sx={{

          background: "#1a1a1a",

          padding: { xs: "5px", sm: "10px" },

          borderRadius: "8px",

          overflowX: "auto",

        }}

      >

        {letters.map((letter, rowIdx) => {

          const startNum = rowIdx * 15 + 1;

          return (

            <Box

              key={letter}

              sx={{

                display: "flex",

                gap: { xs: 0.25, sm: 0.5 },

                mb: { xs: 0.25, sm: 0.5 },

              }}

            >

              {/* BINGO letter */}

              <StyledBingoLetter letter={letter}>{letter}</StyledBingoLetter>



              {/* Numbers 1-15, 16-30, etc. */}

              {Array.from({ length: 15 }, (_, colIdx) => {

                const num = startNum + colIdx;

                const isCalled = calledNumbers.includes(num.toString());

                const isShuffled = num === shuffledNumber && !isCalled;

                const isFastShuffled =

                  fastShuffleNums.includes(num) && isFastShuffling && !isCalled;

                const displayNum = isFastShuffled ? displayNumbers[num] || num : num;



                return (

                  <StyledNumberCell

                    key={num}

                    called={isCalled}

                    isShuffling={isShuffled || isFastShuffled}

                  >

                    {displayNum}

                  </StyledNumberCell>

                );

              })}

            </Box>

          );

        })}

      </Box>

    </>

  );

};



export default BingoGrid;