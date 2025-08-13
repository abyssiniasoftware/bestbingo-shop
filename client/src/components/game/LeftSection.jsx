import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import BingoGrid from "./BingoGrid";
import { formatPatternName } from "../../utils/gameUtils";

const LeftSection = ({
  calledNumbers,
  getBallColor,
  shuffling,
  dynamicBonusAmount,
  enableDynamicBonus,
  isBonusGloballyActive,
  bonusAmount,
  bonusPattern,
}) => {
  const [isBonusHidden, setIsBonusHidden] = useState(() => {
    const storedValue = localStorage.getItem("isBonusHidden");
    return storedValue === "true";
  });

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

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
      <BingoGrid
        calledNumbers={calledNumbers}
        getBallColor={getBallColor}
        shuffling={shuffling}
      />
      {!isBonusGloballyActive && (
        <Typography
          className="animate-[marquee_20s_linear_infinite] text-white font-bold text-lg"
          style={{ whiteSpace: "nowrap", willChange: "transform" }}
          sx={{
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            display: { xs: "none", md: "block" },
          }}
        >
          {getBonusText()}
        </Typography>
      )}
      {/* Custom Bonus Special Animation */}
      {bonusAmount > 0 && bonusPattern && (
        <Box
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 rounded-2xl shadow-2xl border-4 border-blue-300"
          sx={{
            py: 2,
            px: 4,
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
      {/* Global Bonus Special Animation */}
      {isBonusGloballyActive && (
        <Box
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-300 via-red-500 to-yellow-400 rounded-2xl shadow-2xl border-4 border-yellow-500"
          sx={{
            py: 2,
            px: 4,
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
  );
};

export default LeftSection;
