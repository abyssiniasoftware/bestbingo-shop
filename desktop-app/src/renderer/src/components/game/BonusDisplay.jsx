import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@mui/material";

const BonusDisplay = () => {
  const [viewIndex, setViewIndex] = useState(0);

  // Cycle through the 3 versions every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setViewIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Version 1: Bonus Rules (ቅድመ) - Screenshot 1
  const renderVersionOne = () => (
    <Box sx={containerStyle}>
      <Typography sx={{ color: "#aaa", fontSize: "0.8rem", mt: 0.5 }}>
        🎊 ችርስ 🎊
      </Typography>
      <Box
        sx={{ color: "#fff", fontSize: "0.9rem", textAlign: "center", mt: 1 }}
      >
        <div>B-15</div>
        <div>I-22</div>
        <div>N-35</div>
        <div>G-46</div>
        <div>O-68</div>
      </Box>
      <Typography
        sx={{
          color: "#fff",
          fontSize: "0.8rem",
          mt: "auto",
          textAlign: "center",
          pb: 1,
        }}
      >
        ከጨረሱ 🎊 <br /> 100 ብር የቦነስ ሽልማት
      </Typography>
    </Box>
  );

  // Version 2: Two Line (ሁለት ዝግ) - Screenshot 2
  const renderVersionTwo = () => (
    <Box sx={containerStyle}>
      <Typography
        sx={{ color: "#ff9999", fontSize: "1rem", fontWeight: "bold" }}
      >
        ሁለት ዝግ
      </Typography>
      <Table size="small" sx={{ mt: 1, border: "1px solid #555" }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#444" }}>
            <TableCell sx={headerCellStyle}>ጥሪ</TableCell>
            <TableCell sx={headerCellStyle}>ሽልማት</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            [11, 1000],
            [12, 500],
            [13, 300],
            [14, 200],
          ].map((row) => (
            <TableRow key={row[0]}>
              <TableCell sx={bodyCellStyle}>{row[0]}</TableCell>
              <TableCell sx={bodyCellStyle}>{row[1]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  // Version 3: One Line (አንድ ዝግ) - Screenshot 3
  const renderVersionThree = () => (
    <Box sx={containerStyle}>
      <Typography
        sx={{ color: "#ff9999", fontSize: "1rem", fontWeight: "bold" }}
      >
        አንድ ዝግ
      </Typography>
      <Table size="small" sx={{ mt: 1, border: "1px solid #555" }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#444" }}>
            <TableCell sx={headerCellStyle}>ጥሪ</TableCell>
            <TableCell sx={headerCellStyle}>ሽልማት</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            [4, 2000],
            [5, 200],
          ].map((row) => (
            <TableRow key={row[0]}>
              <TableCell sx={bodyCellStyle}>{row[0]}</TableCell>
              <TableCell sx={bodyCellStyle}>{row[1]} ብር</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  const views = [renderVersionOne, renderVersionTwo, renderVersionThree];

  return (
    <Box sx={{ width: "100%", height: "100%", padding: "8px" }}>
      {views[viewIndex]()}
    </Box>
  );
};

// Styles to match the screenshot look
const containerStyle = {
  border: "2px solid #ffd700",
  borderRadius: "8px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "#333",
  position: "relative",
  overflow: "hidden",
};

const headerCellStyle = {
  color: "#fff",
  padding: "2px 4px",
  fontSize: "0.75rem",
  textAlign: "center",
  border: "1px solid #555",
  fontWeight: "bold",
};

const bodyCellStyle = {
  color: "#fff",
  padding: "4px",
  fontSize: "0.8rem",
  textAlign: "center",
  border: "1px solid #555",
};

export default BonusDisplay;
