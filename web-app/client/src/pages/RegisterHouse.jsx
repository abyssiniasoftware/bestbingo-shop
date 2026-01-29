import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../utils/api";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const GlassBox = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "12px",
  padding: theme.spacing(4),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const GlassButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #66bb6a 30%, #99ff99 90%)",
  borderRadius: "8px",
  padding: theme.spacing(1.5),
  fontWeight: "bold",
  textTransform: "none",
  color: "#ffffff",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 4px 10px rgba(102, 187, 106, 0.3)",
    background: "linear-gradient(45deg, #81c784 30%, #b2ff59 90%)",
  },
  "&:disabled": {
    background: "rgba(255, 255, 255, 0.3)",
    color: "rgba(255, 255, 255, 0.5)",
  },
  fontSize: { xs: "1rem", sm: "1.1rem" },
  height: { xs: "48px", sm: "56px" },
}));

const GlassTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    borderRadius: "10px",
    fontSize: { xs: "1rem", sm: "1.1rem" },
    height: { xs: "48px", sm: "56px" },
    padding: theme.spacing(1.5),
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  },
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.5, 1),
  },
  "& .MuiInputLabel-root": {
    color: "#e0e0e0",
    fontSize: { xs: "1rem", sm: "1.1rem" },
    transform: "translate(14px, 16px) scale(1)",
    "&.Mui-focused, &.MuiFormLabel-filled": {
      transform: "translate(14px, -9px) scale(0.85)",
      color: "#99ff99",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#99ff99",
  },
  "& .MuiSelect-icon": {
    color: "#ffffff",
  },
  "& .MuiFormHelperText-root": {
    color: "#e0e0e0",
    fontSize: { xs: "0.875rem", sm: "1rem" },
  },
}));

const GlassMenuItem = styled(MenuItem)(({ theme }) => ({
  color: "#ffffff",
  fontSize: { xs: "1rem", sm: "1.1rem" },
  padding: theme.spacing(1.5, 2),
  minWidth: "200px",
  "&:hover": {
    backgroundColor: "rgba(153, 255, 153, 0.3)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(153, 255, 153, 0.4)",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "rgba(153, 255, 153, 0.5)",
    },
  },
  "&.Mui-disabled": {
    color: "rgba(255, 255, 255, 0.5)",
  },
}));

const CreateHouseForm = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    houseAdminId: "",
    cashierId: "",
    createdAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/api/user`);
        setUsers(response.data);
      } catch (error) {
        setErrorMsg("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  const houseAdmins = useMemo(() => {
    return users.filter((user) => user.role === "house_admin");
  }, [users]);

  const cashiers = useMemo(() => {
    return users.filter((user) => user.role === "cashier");
  }, [users]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      try {
        const response = await api.post(`/api/house/create`, formData);

        setSuccessMsg("House created successfully!");
        setFormData({
          name: "",
          houseAdminId: "",
          cashierId: "",
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        setErrorMsg(error.response?.data?.message || "Failed to create house");
      } finally {
        setLoading(false);
      }
    },
    [ formData],
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 4 },
      }}
    >
      <GlassBox sx={{ maxWidth: 700, width: "100%", mx: "auto" }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "#ffffff",
            fontSize: { xs: "1.75rem", sm: "2.25rem" },
          }}
          id="create-house-title"
        >
          Create New House
        </Typography>

        <Fade in={!!errorMsg}>
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: "rgba(255, 82, 82, 0.2)",
              color: "#ffcccc",
              backdropFilter: "blur(5px)",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              borderRadius: "8px",
            }}
            aria-live="assertive"
          >
            {errorMsg}
          </Alert>
        </Fade>
        <Fade in={!!successMsg}>
          <Alert
            severity="success"
            sx={{
              mb: 2,
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              color: "#ccffcc",
              backdropFilter: "blur(5px)",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              borderRadius: "8px",
            }}
            aria-live="assertive"
          >
            {successMsg}
          </Alert>
        </Fade>

        <form
          onSubmit={handleSubmit}
          aria-label="Create House Form"
          aria-labelledby="create-house-title"
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: "medium",
              color: "#ffffff",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
            id="house-info-section"
          >
            🏠 House Info
          </Typography>
          <Grid container spacing={isSmallScreen ? 2 : 3}>
            <Grid item xs={12}>
              <GlassTextField
                fullWidth
                name="name"
                label="House Name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
                inputProps={{
                  "aria-label": "House name",
                  "aria-describedby": "house-name-helper",
                }}
                helperText={
                  <Box
                    id="house-name-helper"
                    sx={{
                      color: "#e0e0e0",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Required
                  </Box>
                }
                sx={{
                  minWidth: { xs: "100%", sm: 600 },
                  maxWidth: 700,
                  mx: "auto",
                }}
              />
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              mt: 4,
              fontWeight: "medium",
              color: "#ffffff",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
            id="assign-users-section"
          >
            👥 Assign Users
          </Typography>
          <Grid container spacing={isSmallScreen ? 2 : 3}>
            <Grid item xs={12} sm={6}>
              <GlassTextField
                select
                fullWidth
                name="houseAdminId"
                label="Select House Admin"
                value={formData.houseAdminId}
                onChange={handleChange}
                variant="outlined"
                margin="normal"
                inputProps={{ "aria-label": "Select house admin" }}
                sx={{
                  minWidth: { xs: "100%", sm: 285 },
                  maxWidth: 350,
                  mx: "auto",
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                        maxWidth: "100%",
                      },
                    },
                  },
                }}
              >
                {houseAdmins.length === 0 ? (
                  <GlassMenuItem disabled>
                    No house admins available
                  </GlassMenuItem>
                ) : (
                  houseAdmins.map((user) => (
                    <GlassMenuItem key={user._id} value={user._id}>
                      {user.username || user.fullname || "Unnamed User"}
                    </GlassMenuItem>
                  ))
                )}
              </GlassTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <GlassTextField
                select
                fullWidth
                name="cashierId"
                label="Select Cashier"
                value={formData.cashierId}
                onChange={handleChange}
                variant="outlined"
                margin="normal"
                inputProps={{ "aria-label": "Select cashier" }}
                sx={{
                  minWidth: { xs: "100%", sm: 285 },
                  maxWidth: 350,
                  mx: "auto",
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                        maxWidth: "100%",
                      },
                    },
                  },
                }}
              >
                {cashiers.length === 0 ? (
                  <GlassMenuItem disabled>No cashiers available</GlassMenuItem>
                ) : (
                  cashiers.map((user) => (
                    <GlassMenuItem key={user._id} value={user._id}>
                      {user.username || user.fullname || "Unnamed User"}
                    </GlassMenuItem>
                  ))
                )}
              </GlassTextField>
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ mt: 4 }}>
            <GlassButton
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading || !formData.name}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
              aria-label="Create house"
              sx={{
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1.1rem", sm: "1.2rem" },
                height: { xs: "52px", sm: "60px" },
              }}
            >
              {loading ? "Creating..." : "Create House"}
            </GlassButton>
          </Grid>
        </form>
      </GlassBox>
    </Box>
  );
};

export default CreateHouseForm;
