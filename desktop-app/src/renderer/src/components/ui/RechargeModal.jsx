import React from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const RechargeModal = ({
  open,
  onClose,
  houseName,
  rechargeMessage,
  rechargeError,
  verificationMessage,
  verificationCode,
  onVerificationChange,
  rechargeAmount,
  onRechargeAmountChange,
  superAdminCommission,
  onCommissionChange,
  onSubmit,
  loading,
  isVerified,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(400));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isSmallScreen ? "xs" : "sm"}
      fullWidth
      fullScreen={false}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          borderRadius: isVerySmallScreen ? 0 : 2,
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
        {rechargeMessage && (
          <Alert
            severity={rechargeError ? "error" : "success"}
            sx={{
              mb: { xs: 1, sm: 2 },
              backgroundColor: rechargeError
                ? "rgba(255, 82, 82, 0.2)"
                : "rgba(76, 175, 80, 0.2)",
              color: rechargeError ? "#ffcccc" : "#ccffcc",
              backdropFilter: "blur(5px)",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {rechargeMessage}
          </Alert>
        )}

        <Typography
          variant="body2"
          mb={{ xs: 1, sm: 2 }}
          sx={{ color: "#cccccc", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          Recharge for: <strong>{houseName || "Unknown House"}</strong>
        </Typography>

        {verificationMessage && (
          <Typography
            variant="body2"
            mb={{ xs: 1, sm: 2 }}
            sx={{
              color: "#ffffff",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {verificationMessage}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Verification Code"
          type="number"
          value={verificationCode}
          onChange={onVerificationChange}
          sx={{ mb: { xs: 1, sm: 2 }, ...inputStyles }}
          InputLabelProps={{ style: { color: "#cccccc" } }}
        />

        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={rechargeAmount}
          onChange={onRechargeAmountChange}
          sx={{ mb: { xs: 1, sm: 2 }, ...inputStyles }}
          InputLabelProps={{ style: { color: "#cccccc" } }}
          inputProps={{ min: 1 }}
        />

        <TextField
          fullWidth
          label="Commission"
          type="number"
          value={superAdminCommission}
          onChange={onCommissionChange}
          sx={inputStyles}
          InputLabelProps={{ style: { color: "#cccccc" } }}
          inputProps={{ min: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
        <Button onClick={onClose} sx={buttonStyles("light")}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={
            loading || !rechargeAmount || !verificationCode || !isVerified
          }
          sx={buttonStyles("dark")}
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

const inputStyles = {
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

const buttonStyles = (mode) => ({
  color: "#ffffff",
  backgroundColor:
    mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
  "&:hover": {
    backgroundColor:
      mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
  },
  fontSize: { xs: "0.7rem", sm: "0.75rem" },
  padding: { xs: "2px 6px", sm: "4px 8px" },
});

export default RechargeModal;
