// components/RechargeModal.jsx
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const RechargeModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  amount,
  commission,
  message,
  error,
  houseName,
  onAmountChange,
  onCommissionChange,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isSmallScreen ? "xs" : "sm"}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          borderRadius: 2,
          m: { xs: 1, sm: 2 },
          color: "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "#ffffff",
          fontSize: { xs: "0.875rem", sm: "1rem" },
          p: { xs: 1, sm: 2 },
        }}
      >
        Recharge House
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
        {message && (
          <Alert
            severity={error ? "error" : "success"}
            sx={{
              mb: { xs: 1, sm: 2 },
              backgroundColor: error
                ? "rgba(255, 82, 82, 0.2)"
                : "rgba(76, 175, 80, 0.2)",
              color: error ? "#ffcccc" : "#ccffcc",
              backdropFilter: "blur(5px)",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {message}
          </Alert>
        )}
        <Typography
          variant="body2"
          mb={{ xs: 1, sm: 2 }}
          sx={{
            color: "#cccccc",
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          }}
        >
          Recharge for: <strong>{houseName || "Unknown House"}</strong>
        </Typography>
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          sx={textFieldSx}
          inputProps={{ min: 1 }}
        />
        <TextField
          fullWidth
          label="Commission"
          type="number"
          value={commission}
          onChange={(e) => onCommissionChange(e.target.value)}
          sx={textFieldSx}
          inputProps={{ min: 0 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
        <Button onClick={onClose} sx={buttonSx}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !amount}
          sx={buttonSx}
        >
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            "Recharge"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const textFieldSx = {
  mt: 1,
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
    fontSize: { xs: "0.75rem", sm: "0.875rem" },
    borderRadius: 1,
  },
  "& .MuiInputLabel-root": {
    color: "#cccccc",
    fontSize: { xs: "0.75rem", sm: "0.875rem" },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
};

const buttonSx = {
  color: "#ffffff",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
  fontSize: { xs: "0.7rem", sm: "0.75rem" },
  padding: { xs: "2px 6px", sm: "4px 8px" },
};

export default RechargeModal;
