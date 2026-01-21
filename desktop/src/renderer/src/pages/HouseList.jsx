import React, { useEffect, useState, useMemo } from "react";
import debounce from "lodash.debounce";
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
  TextField,
  useMediaQuery,
  useTheme,
  TablePagination,
} from "@mui/material";
import RechargeModal from "../components/ui/RechargeModal";
import api from "../utils/api";

const HouseList = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // New states for verification
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px

  const fetchHouses = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await api.get(`/api/house/`, {
        params: { page, limit: rowsPerPage, search },
      });
      console.log('API Response:', response);
      console.log('API Response Data:', response.data);
      if (response.status === 200) {
        setHouses(response.data.houses || []);
        // Check if houses is missing
        if (!response.data.houses) console.error('response.data.houses is UNDEFINED!');

        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.page);
      } else {
        setErrorMessage("Failed to fetch house list.");
      }
    } catch (error) {
      console.error("Error fetching houses:", error);
      setErrorMessage("Failed to fetch house list.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page on new search
        fetchHouses(1, value);
      }, 500),
    [  rowsPerPage]
  );

  useEffect(() => {
    fetchHouses(currentPage, searchTerm);
    return () => {
      debouncedSearch.cancel(); // Cleanup debounce on unmount
    };
  }, [currentPage, rowsPerPage]);

  // Generate verification code when recharge modal opens
  useEffect(() => {
    if (rechargeModalOpen) {
      const randomThreeDigit = Math.floor(1000 + Math.random() * 9000); // Generates a 3-digit number
      const code = `${randomThreeDigit}`;
      setGeneratedCode(code);
      setVerificationMessage(`Please enter the verification code: ${code}`);
      setVerificationCode("");
      setIsVerified(false);
    }
  }, [rechargeModalOpen]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    debouncedSearch(value);
  };

  const handleRechargeClick = (houseId) => {
    setSelectedHouseId(houseId);
    setRechargeAmount("");
    setSuperAdminCommission("");
    setRechargeMessage("");
    setRechargeError(false);
    setVerificationMessage("");
    setVerificationCode("");
    setRechargeModalOpen(true);
  };

  const handleVerificationChange = (e) => {
    setVerificationCode(e.target.value);
    const code = Number(generatedCode);
    const amount = Number(rechargeAmount);
    const commission = Number(superAdminCommission);
    const entered = Number(e.target.value);
    const validOffsets = [123, 321, 234];
    const isValid = validOffsets.some(
      (offset) => entered === code + amount + commission + offset
    );
    if (isValid) {
      setIsVerified(true);
      setRechargeMessage("");
      setRechargeError(false);
    } else {
      setIsVerified(false);
      setRechargeMessage("Verification incorrect. Please try again.");
      setRechargeError(true);
    }
  };

  const handleRechargeSubmit = async () => {
    // Validate verification code
    if (!isVerified) {
      setRechargeMessage("Verification incorrect. Please try again.");
      setRechargeError(true);
      return;
    }

    setRechargeLoading(true);
    setRechargeMessage("");
    setRechargeError(false);

    try {
      const response = await api.post(
        `/api/house/recharge`,
        {
          houseId: selectedHouseId,
          amount: Number(rechargeAmount),
          superAdminCommission: Number(superAdminCommission) / 100,
        },
      );

      if (response.status === 200 || response.status === 201) {
        setRechargeMessage("Recharge submitted successfully!");
        setRechargeError(false);
        await fetchHouses(currentPage, searchTerm); // Refresh with current page and search
        setRechargeModalOpen(false);
        setSelectedHouseId("");
        setRechargeAmount("");
        setSuperAdminCommission("");
        setRechargeMessage("");
        setRechargeError(false);
        setVerificationCode("");
        setGeneratedCode("");
        setVerificationMessage("");
        setIsVerified(false);
      } else {
        setRechargeMessage("Recharge failed.");
        setRechargeError(true);
      }
    } catch (error) {
      console.error("Recharge error:", error);
      setRechargeMessage("An error occurred during recharge.");
      setRechargeError(true);
    } finally {
      setRechargeLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1); // TablePagination uses 0-based indexing
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  const filteredHouses = useMemo(() => {
    return houses || []; // Client-side filtering removed as search is handled by backend
  }, [houses]);

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
          <>
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
                  <TableRow
                    sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
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
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.05)",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.1)",
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

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalPages * rowsPerPage} // Approximate total count
              rowsPerPage={rowsPerPage}
              page={currentPage - 1} // TablePagination uses 0-based indexing
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                color: "#ffffff",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#ffffff",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
                "& .MuiTablePagination-select": {
                  color: "#ffffff",
                },
                "& .MuiSvgIcon-root": {
                  color: "#ffffff",
                },
                "& .MuiTablePagination-actions": {
                  "& .MuiButtonBase-root": {
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  },
                },
              }}
            />
          </>
        )}

        {/* Recharge Modal */}

        <RechargeModal
          open={rechargeModalOpen}
          onClose={() => setRechargeModalOpen(false)}
          houseName={houses.find((h) => h._id === selectedHouseId)?.name}
          rechargeMessage={rechargeMessage}
          rechargeError={rechargeError}
          verificationMessage={verificationMessage}
          verificationCode={verificationCode}
          onVerificationChange={handleVerificationChange}
          rechargeAmount={rechargeAmount}
          onRechargeAmountChange={(e) => setRechargeAmount(e.target.value)}
          superAdminCommission={superAdminCommission}
          onCommissionChange={(e) => setSuperAdminCommission(e.target.value)}
          onSubmit={handleRechargeSubmit}
          loading={rechargeLoading}
          isVerified={isVerified}
        />
      </Box>
    </Box>
  );
};

export default HouseList;
