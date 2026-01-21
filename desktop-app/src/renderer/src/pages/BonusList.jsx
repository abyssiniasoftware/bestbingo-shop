import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
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
  Autocomplete,
  TextField,
  useMediaQuery,
  useTheme,
  Switch,
} from "@mui/material";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import debounce from "lodash.debounce";
import apiService from "../api/apiService";

const BonusList = () => {
  const [bonuses, setBonuses] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("dateIssued");
  const [sortOrder, setSortOrder] = useState("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(400)); // <400px

  // Fetch bonuses (original logic)
  useEffect(() => {
    const fetchBonuses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/api/game/bonuses`);
        setBonuses(response.data.bonuses || []);
        setError(null);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch bonuses";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchBonuses();
  }, []);

  // Fetch cashiers with debounced search
  const fetchCashiers = async (search = "") => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      const response = await apiService.getCashiers(token, { search });
      setCashiers(response.users || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch cashiers");
    } finally {
      setModalLoading(false);
    }
  };

  const debouncedFetchCashiers = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
        fetchCashiers(value);
      }, 500),
    [],
  );

  useEffect(() => {
    if (modalOpen) {
      fetchCashiers(searchTerm);
    }
    return () => debouncedFetchCashiers.cancel();
  }, [modalOpen, searchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedBonuses = [...bonuses].sort((a, b) => {
    const fieldA = a[sortField] || a.gameId?.[sortField] || "";
    const fieldB = b[sortField] || b.gameId?.[sortField] || "";
    if (sortOrder === "asc") {
      return fieldA > fieldB ? 1 : -1;
    }
    return fieldA < fieldB ? 1 : -1;
  });

  const totalPages = Math.ceil(bonuses.length / itemsPerPage);
  const paginatedBonuses = sortedBonuses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const formatDate = (date) => new Date(date).toLocaleString();

  const handleToggleBonus = async (cashierId, currentStatus) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus;
      await apiService.updateDynamicBonus(cashierId, newStatus, token);
      setCashiers((prev) =>
        prev.map((cashier) =>
          cashier._id === cashierId
            ? { ...cashier, enableDynamicBonus: newStatus }
            : cashier,
        ),
      );
      toast.success(`Dynamic bonus ${newStatus ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err.message || "Failed to update bonus setting");
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setSearchInput("");
    setSearchTerm("");
    setCashiers([]);
  };

  const columns = [
    { id: "cashierId", label: "Cashier username", minWidth: 80, maxWidth: 120 },
    { id: "gameId", label: "Game no.", minWidth: 80, maxWidth: 100 },
    {
      id: "winnerCardId",
      label: "Winner Card",
      minWidth: 80,
      maxWidth: 100,
      hideOnSmall: true,
    },
    { id: "prize", label: "Game Prize", minWidth: 80, maxWidth: 100 },
    { id: "houseId", label: "House Name", minWidth: 80, maxWidth: 120 },
    { id: "bonusAmount", label: "Bonus Amount", minWidth: 80, maxWidth: 100 },
    {
      id: "dateIssued",
      label: "Date Issued",
      minWidth: 100,
      maxWidth: 120,
      hideOnSmall: true,
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            color: "#ffffff",
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          All Bonuses
        </Typography>
        <Button
          variant="contained"
          onClick={handleModalOpen}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            padding: { xs: "4px 8px", sm: "6px 12px" },
          }}
          aria-label="Open manage cashiers modal"
        >
          Manage Cashiers
        </Button>
      </Box>

      {error && (
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
          {error}
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
      ) : bonuses.length === 0 ? (
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
            No bonuses found
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
                <TableRow sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                  {columns
                    .filter((col) => !col.hideOnSmall || !isSmallScreen)
                    .map((col) => (
                      <TableCell
                        key={col.id}
                        sx={{
                          minWidth: col.minWidth,
                          maxWidth: col.maxWidth,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          color: "#ffffff",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                          {sortField === col.id ? (
                            sortOrder === "asc" ? (
                              <FaSortUp style={{ marginLeft: 4 }} />
                            ) : (
                              <FaSortDown style={{ marginLeft: 4 }} />
                            )
                          ) : (
                            <FaSort style={{ marginLeft: 4, opacity: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBonuses.map((bonus) => (
                  <TableRow
                    key={bonus._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    {columns
                      .filter((col) => !col.hideOnSmall || !isSmallScreen)
                      .map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{
                            minWidth: col.minWidth,
                            maxWidth: col.maxWidth,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: "#ffffff",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          {col.id === "cashierId"
                            ? bonus.cashierId?.username || "N/A"
                            : col.id === "gameId"
                              ? bonus.gameId?.gameId || "N/A"
                              : col.id === "winnerCardId"
                                ? bonus.gameId?.winnerCardId || "N/A"
                                : col.id === "prize"
                                  ? bonus.gameId?.prize
                                    ? `${bonus.gameId.prize} ETB`
                                    : "N/A"
                                  : col.id === "houseId"
                                    ? bonus.houseId?.name || "N/A"
                                    : col.id === "bonusAmount"
                                      ? `${bonus.bonusAmount} ETB`
                                      : col.id === "dateIssued"
                                        ? formatDate(bonus.dateIssued)
                                        : "N/A"}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: { xs: 1, sm: 2 },
            }}
          >
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              sx={{
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </Button>
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Page {page} of {totalPages}
            </Typography>
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              sx={{
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </Button>
          </Box>
        </>
      )}

      {/* Manage Cashiers Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
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
        aria-labelledby="manage-cashiers-modal-title"
      >
        <DialogTitle
          id="manage-cashiers-modal-title"
          sx={{
            color: "#ffffff",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            p: { xs: 1, sm: 2 },
          }}
        >
          Manage Cashiers
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Autocomplete
            fullWidth
            options={cashiers}
            getOptionLabel={(option) =>
              option.username
                ? `${option.username} (${option.houseId?.name || "N/A"})`
                : ""
            }
            inputValue={searchInput}
            onInputChange={(event, newInputValue) => {
              setSearchInput(newInputValue);
              debouncedFetchCashiers(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Cashiers"
                sx={{
                  mb: { xs: 1, sm: 2 },
                  "& .MuiInputBase-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "#ffffff",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    borderRadius: 1,
                  },
                  "& .MuiInputLabel-root": { color: "#cccccc" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                }}
                InputLabelProps={{ style: { color: "#cccccc" } }}
                inputProps={{
                  ...params.inputProps,
                  "aria-label": "Search cashiers by username or house",
                }}
              />
            )}
            noOptionsText="No cashiers found"
            sx={{ mb: 2 }}
          />
          {modalLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 100,
              }}
            >
              <CircularProgress
                sx={{ color: "#ffffff", size: { xs: 24, sm: 32 } }}
              />
            </Box>
          ) : cashiers.length === 0 ? (
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                textAlign: "center",
                mt: 2,
              }}
            >
              No cashiers available
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
              {cashiers.map((cashier) => (
                <Box
                  key={cashier._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: { xs: 1, sm: 2 },
                    mb: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 1,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: "bold",
                      }}
                    >
                      {cashier.username || "Unknown"}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#cccccc",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      House: {cashier.houseId?.name || "N/A"}
                    </Typography>
                    <Typography
                      sx={{
                        color: cashier.enableDynamicBonus
                          ? "#99ff99"
                          : "#ffcccc",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      Bonus:{" "}
                      {cashier.enableDynamicBonus ? "Enabled" : "Disabled"}
                    </Typography>
                  </Box>
                  <Switch
                    checked={!!cashier.enableDynamicBonus}
                    onChange={() =>
                      handleToggleBonus(cashier._id, cashier.enableDynamicBonus)
                    }
                    disabled={modalLoading}
                    sx={{
                      "& .MuiSwitch-switchBase": {
                        color: "#cccccc",
                        "&.Mui-checked": { color: "#99ff99" },
                        "&.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#99ff99",
                        },
                      },
                      "& .MuiSwitch-track": { backgroundColor: "#666666" },
                    }}
                    aria-label={`Toggle bonus for ${
                      cashier.username || "cashier"
                    }`}
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
          <Button
            onClick={handleModalClose}
            sx={{
              color: "#ffffff",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              padding: { xs: "2px 6px", sm: "4px 8px" },
            }}
            aria-label="Close modal"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BonusList;
