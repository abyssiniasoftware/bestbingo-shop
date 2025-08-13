import React from "react";
import { Box, Typography } from "@mui/material";

const LoginFooter = ({ phoneNumber }) => (
  <Box
    component="footer"
    sx={{
      py: 3,
      mt: 4,
      width: "100%",
      textAlign: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "#fff",
    }}
  >
    <Typography variant="body2">{phoneNumber}</Typography>
  </Box>
);

export default LoginFooter;
