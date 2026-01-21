import { Dialog, DialogContent, Typography, Box, Button } from "@mui/material";

const NewGameConfirmDialog = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "16px",
          bgcolor: "#fff",
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center", pb: 0 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", mb: 1, color: "#374151" }}
        >
          Start a New Game?
        </Typography>

        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", mb: 1, color: "#374151" }}
        >
          አዲስ ጨዋታ ይጀምሩ?
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "#6b7280", mb: 3 }}
        >
          የነበረው ይጠፋል?
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            mt: 2,
          }}
        >
          <Button
            onClick={onConfirm}
            sx={{
              bgcolor: "#10b981",
              color: "#fff",
              px: 4,
              py: 1,
              fontSize: "1rem",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#059669" },
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            OK
          </Button>

          <Button
            onClick={onClose}
            sx={{
              bgcolor: "#ef4444",
              color: "#fff",
              px: 4,
              py: 1,
              fontSize: "1rem",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#dc2626" },
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewGameConfirmDialog;
