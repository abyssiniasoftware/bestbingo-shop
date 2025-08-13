import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { PatternBox } from "./GameStyles";
import { formatPatternName } from "../../utils/gameUtils";

const RightSection = ({
  callCount,
  prefixedNumber,
  currentNumber,
  recentCalls,
  patterns,
  patternAnimationIndex,
  winAmount,
  dynamicBonusAmount,
  enableDynamicBonus,
  isBonusGloballyActive,
  bonusAmount,
  bonusPattern,
}) => {
  const theme = useTheme();
  const [showWinAmount, setShowWinAmount] = useState(false);
  const [isBonusHidden, setIsBonusHidden] = useState(() => {
    const storedValue = localStorage.getItem("isBonusHidden");
    return storedValue === "true";
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWinAmount(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedValue = localStorage.getItem("isBonusHidden");
      setIsBonusHidden(storedValue === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getBonusText = () => {
    if (isBonusGloballyActive && enableDynamicBonus) {
      return null;
    }
    if (bonusAmount > 0 && bonusPattern) {
      return null; // Special display handles this case
    }
    if (enableDynamicBonus && dynamicBonusAmount > 0) {
      if (isBonusHidden) {
        return null;
      }
      return `🎯🎉 ${Number(dynamicBonusAmount).toFixed(
        0
      )} ብር ዳይናሚክ ቦነስ - በ4 ጥሪዎች ያሸንፉ! 🎉`;
    }
    if (isBonusHidden) {
      return null;
    }
    return `🎯🎉 1000 ብር ቦነስ ጃክፖት - በ4 ጥሪዎች ያሸንፉ! 🎉 500 ብር ቦነስ በ5 ጥሪዎች! 🎉 300 ብር ቦነስ በ6 ጥሪዎች! 🎉 200 ብር ቦነስ በ7 ጥሪዎች! 🎉`;
  };

  const currentPattern = patterns[patternAnimationIndex] || {
    type: "None",
    progressGrid: Array(25).fill(false),
  };

  const renderPatternGrid = () => {
    if (!patterns.length) return null;
    return (
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 0.5,
          }}
        >
          {currentPattern.progressGrid.map((cell, cellIdx) => (
            <PatternBox key={cellIdx} active={true} winning={cell} />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        width: "100%",
        mt: { xs: 2, md: 0 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 4 },
          flex: 1,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: { md: "block", xs: "none" } }}>
          <Typography
            variant="subtitle1"
            sx={{ color: "#9ca3af", textAlign: "center" }}
          >
            የማሸነፊያ ፓተርን {formatPatternName(currentPattern.type)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mt: 1,
              mb: 2,
              alignItems: "center",
            }}
          >
            {renderPatternGrid()}
          </Box>
          {!isBonusGloballyActive && (
            <Typography
              className="animate-[marquee_20s_linear_infinite] text-white font-bold text-lg"
              style={{ whiteSpace: "nowrap", willChange: "transform" }}
              sx={{
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                display: { xs: "block", md: "none" },
              }}
            >
              {getBonusText()}
            </Typography>
          )}
          {bonusAmount > 0 && bonusPattern && (
            <Box
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 rounded-2xl shadow-2xl border-4 border-blue-300"
              sx={{
                py: 2,
                px: 4,
                display: { xs: "block", md: "none" },
              }}
            >
              <Typography
                className="text-white font-extrabold animate-bounce drop-shadow-md"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                  whiteSpace: "nowrap",
                }}
              >
                🎁 ቦነስ {Number(bonusAmount).toFixed(0)} ብር -{" "}
                {formatPatternName(bonusPattern)} ፓተርን! 🎁
              </Typography>
            </Box>
          )}
          {isBonusGloballyActive && (
            <Box
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-300 via-red-500 to-yellow-400 rounded-2xl shadow-2xl border-4 border-yellow-500"
              sx={{
                py: 2,
                px: 4,
                display: { xs: "block", md: "none" },
              }}
            >
              <Typography
                className="text-white font-extrabold animate-bounce drop-shadow-md"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                  whiteSpace: "nowrap",
                }}
              >
                🎁 ቦነስ ላይ ሽልማት {Number(dynamicBonusAmount).toFixed(0)} ብር 🎁
              </Typography>
              <Typography
                className="text-green-200 font-bold animate-pulse drop-shadow-lg"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                  whiteSpace: "nowrap",
                }}
              >
                💰 ልዩ አንድ ጊዜ ሽልማት! 💰
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "#9ca3af" }}>
            የተጠሩ ቁጥሮች
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: "3rem", sm: "4rem" } }}
          >
            {callCount}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              bgcolor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#fff",
              fontSize: "2rem",
              fontWeight: "bold",
              transition: "all 0.1s ease",
              [theme.breakpoints.down("sm")]: {
                width: 120,
                height: 120,
                fontSize: "1.5rem",
              },
            }}
          >
            {prefixedNumber && (
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "2rem", sm: "3rem" },
                  [theme.breakpoints.down("sm")]: { fontSize: "1.5rem" },
                }}
              >
                {prefixedNumber.charAt(0).toUpperCase()}
              </Typography>
            )}
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "3rem", sm: "4rem" },
                [theme.breakpoints.down("sm")]: { fontSize: "2.5rem" },
              }}
            >
              {currentNumber}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "#9ca3af" }}>
            ቅርብ ጥሪዎች
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 1,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {recentCalls.length > 0 ? (
              recentCalls.map((number, index) => (
                <Typography
                  key={index}
                  variant="h2"
                  sx={{
                    fontSize: { xs: "2rem", sm: "3rem", md: "4.3rem" },
                    color: "#fff",
                    bgcolor: "#374151",
                    borderRadius: "8px",
                    padding: { xs: "2px 4px", sm: "4px 8px" },
                    minWidth: { xs: "30px", sm: "40px" },
                    textAlign: "center",
                  }}
                >
                  {number.padStart(2, "0")}
                </Typography>
              ))
            ) : (
              <Typography
                variant="h6"
                sx={{ fontSize: "1.5rem", color: "#9ca3af" }}
              >
                የለም
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          minWidth: 250,
          mr: { xs: 0, md: 5 },
        }}
      >
        <Box
          sx={{
            width: 250,
            height: 150,
            borderRadius: "20%",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#fff",
            fontSize: "2rem",
            fontWeight: "bold",
            transition: "all 0.1s ease",
            [theme.breakpoints.down("sm")]: {
              width: 120,
              height: 120,
              fontSize: "1.5rem",
            },
          }}
        >
          {winAmount && showWinAmount && (
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                [theme.breakpoints.down("sm")]: { fontSize: "1rem" },
              }}
            >
              ደራሽ
            </Typography>
          )}
          {winAmount && showWinAmount && (
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "3.5rem", sm: "4.5rem", md: "6rem" },
                [theme.breakpoints.down("sm")]: { fontSize: "3rem" },
              }}
            >
              {Math.floor(winAmount)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RightSection;
