import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const AgentHouseList = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [superAdminCommission, setSuperAdminCommission] = useState("");

  const [rechargeMessage, setRechargeMessage] = useState("");
  const [rechargeError, setRechargeError] = useState(false);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(400)); // <400px

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/house/my-house`, {
          headers: { "x-auth-token": token },
        });
        if (response.status === 200) {
          setHouses(response.data.houses || []); // Changed from response.data.house
        } else {
          setErrorMessage("Failed to fetch house list.");
        }
      } catch (error) {
        setErrorMessage("Failed to fetch house list.");
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, [baseURL, token]);

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleRechargeClick = (houseId) => {
    setSelectedHouseId(houseId);
    setRechargeAmount("");
    setSuperAdminCommission("");
    setRechargeMessage("");
    setRechargeError(false);
    setRechargeModalOpen(true);
  };

  const handleRechargeSubmit = async () => {
    setRechargeLoading(true);
    setRechargeMessage("");
    setRechargeError(false);

    try {
      const response = await axios.post(
        `${baseURL}/api/house/recharge`,
        {
          houseId: selectedHouseId,
          amount: Number(rechargeAmount),
          superAdminCommission: Number(superAdminCommission) / 100,
        },
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setRechargeMessage("Recharge submitted successfully!");
        setRechargeError(false);
        // Refresh house list
        const houseResponse = await axios.get(`${baseURL}/api/house/my-house`, {
          // Changed to /my-house for consistency with initial fetch, or ensure /api/house/ structure
          headers: { "x-auth-token": token },
        });
        if (houseResponse.status === 200) {
          setHouses(houseResponse.data.houses || []); // Changed from houseResponse.data.house
        }
        // Close modal and reset state
        setRechargeModalOpen(false);
        setSelectedHouseId("");
        setRechargeAmount("");
        setSuperAdminCommission("");
        setRechargeMessage("");
        setRechargeError(false);
      } else {
        setRechargeMessage("Recharge failed.");
        setRechargeError(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during recharge.";
      setRechargeMessage(errorMessage);
      setRechargeError(true);
    } finally {
      setRechargeLoading(false);
    }
  };

  const filteredHouses = useMemo(() => {
    return (houses || []).filter(
      (house) =>
        house.name.toLowerCase().includes(searchTerm) ||
        (house.houseAdminId?.fullname?.toLowerCase() || "").includes(
          searchTerm
        ) ||
        (house.houseAdminId?.username?.toLowerCase() || "").includes(
          searchTerm
        ) ||
        (house.houseAdminId?.phone?.toLowerCase() || "").includes(searchTerm)
    );
  }, [houses, searchTerm]);

  const columns = [
    { id: "name", label: "Name", minWidth: 80, maxWidth: 120 },
    { id: "admin", label: "Admin", minWidth: 100, maxWidth: 150 },
    { id: "username", label: "Username", minWidth: 80, maxWidth: 120 },
    {
      id: "phone",
      label: "Phone",
      minWidth: 100,
      maxWidth: 120,
      hideOnSmall: true,
    },
    {
      id: "branch",
      label: "Branch",
      minWidth: 80,
      maxWidth: 100,
      hideOnSmall: true,
    },
    { id: "wallet", label: "Wallet", minWidth: 80, maxWidth: 100 },
    { id: "status", label: "Status", minWidth: 80, maxWidth: 100 },
    {
      id: "createdAt",
      label: "Created At",
      minWidth: 100,
      maxWidth: 120,
      hideOnSmall: true,
    },
    {
      id: "action",
      label: "Action",
      minWidth: 80,
      maxWidth: 100,
      sticky: true,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        p: { xs: 0.5, sm: 1, md: 2 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "100%" }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{
            color: "#ffffff",
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Houses List
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by house name, house admin, username, or phone..."
          onChange={handleSearch}
          sx={{
            mb: { xs: 1, sm: 2 },
            maxWidth: "100%",
            "& .MuiInputBase-root": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              borderRadius: 1,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              height: { xs: "36px", sm: "40px" },
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
          }}
          InputLabelProps={{ style: { color: "#cccccc" } }}
          InputProps={{ style: { padding: "8px" } }}
        />

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 1, sm: 2 },
              backgroundColor: "rgba(255, 82, 82, 0.2)",
              color: "#ffcccc",
              backdropFilter: "blur(5px)",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: { xs: 2, sm: 4 },
            }}
          >
            <CircularProgress
              sx={{ color: "#ffffff", size: { xs: 24, sm: 32 } }}
            />
          </Box>
        ) : filteredHouses.length === 0 ? (
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 2,
              p: { xs: 1, sm: 2 },
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              No houses found
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              overflowX: "auto",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                  {columns.map(
                    (col) =>
                      (!col.hideOnSmall || !isSmallScreen) && (
                        <TableCell
                          key={col.id}
                          sx={{
                            minWidth: col.minWidth,
                            maxWidth: col.maxWidth,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: "#ffffff",
                            position: col.sticky ? "sticky" : "static",
                            right: col.sticky ? 0 : "auto",
                            backgroundColor: col.sticky
                              ? "rgba(255, 255, 255, 0.05)"
                              : "inherit",
                            zIndex: col.sticky ? 1 : "auto",
                          }}
                        >
                          {col.label}
                        </TableCell>
                      )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHouses.map((house) => (
                  <TableRow
                    key={house._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    {columns.map(
                      (col) =>
                        (!col.hideOnSmall || !isSmallScreen) && (
                          <TableCell
                            key={col.id}
                            sx={{
                              minWidth: col.minWidth,
                              maxWidth: col.maxWidth,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              color: "#ffffff",
                              position: col.sticky ? "sticky" : "static",
                              right: col.sticky ? 0 : "auto",
                              backgroundColor: col.sticky
                                ? "rgba(255, 255, 255, 0.1)"
                                : "inherit",
                              zIndex: col.sticky ? 1 : "auto",
                              whiteSpace: "normal",
                              wordWrap: "break-word",
                              ...(col.id === "status" && {
                                color: house.houseAdminId?.isBanned
                                  ? "#ff9999"
                                  : "#99ff99",
                              }),
                            }}
                          >
                            {col.id === "name" ? (
                              house.name
                            ) : col.id === "admin" ? (
                              house.houseAdminId?.fullname || "N/A"
                            ) : col.id === "username" ? (
                              house.houseAdminId?.username || "N/A"
                            ) : col.id === "phone" ? (
                              house.houseAdminId?.phone || "N/A"
                            ) : col.id === "branch" ? (
                              house.houseAdminId?.branch || "N/A"
                            ) : col.id === "wallet" ? (
                              house.houseAdminId?.package || 0
                            ) : col.id === "status" ? (
                              house.houseAdminId?.isBanned ? (
                                "Banned"
                              ) : (
                                "Active"
                              )
                            ) : col.id === "createdAt" ? (
                              new Date(house.createdAt).toLocaleDateString()
                            ) : col.id === "action" ? (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleRechargeClick(house._id)}
                                sx={{
                                  color: "#ffffff",
                                  borderColor: "rgba(255, 255, 255, 0.3)",
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    borderColor: "rgba(255, 255, 255, 0.5)",
                                  },
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  padding: { xs: "2px 6px", sm: "4px 8px" },
                                }}
                              >
                                Recharge
                              </Button>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                        )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Recharge Modal */}
        <Dialog
          open={rechargeModalOpen}
          onClose={() => setRechargeModalOpen(false)}
          maxWidth={isSmallScreen ? "xs" : "sm"}
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              borderRadius: isVerySmallScreen ? 0 : 2,
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
              sx={{
                color: "#cccccc",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Recharge for:{" "}
              <strong>
                {(houses || []).find((h) => h._id === selectedHouseId)?.name || // Added (houses || []) guard
                  "Unknown House"}
              </strong>
            </Typography>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              sx={{
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
              }}
              InputLabelProps={{ style: { color: "#cccccc" } }}
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Commission"
              type="number"
              value={superAdminCommission}
              onChange={(e) => setSuperAdminCommission(e.target.value)}
              sx={{
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
              }}
              InputLabelProps={{ style: { color: "#cccccc" } }}
              inputProps={{ min: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button
              onClick={() => setRechargeModalOpen(false)}
              sx={{
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleRechargeSubmit}
              disabled={rechargeLoading || !rechargeAmount}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
              }}
            >
              {rechargeLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Recharge"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AgentHouseList;
