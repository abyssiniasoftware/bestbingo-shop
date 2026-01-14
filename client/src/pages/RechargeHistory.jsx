import React, { useEffect, useState, useMemo, Suspense, lazy } from "react";
import api from "../utils/api";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  IconButton,
  TablePagination,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
);

// Lazy load chart components
const Pie = lazy(() =>
  import("react-chartjs-2").then((module) => ({ default: module.Pie })),
);
const Bar = lazy(() =>
  import("react-chartjs-2").then((module) => ({ default: module.Bar })),
);
const Line = lazy(() =>
  import("react-chartjs-2").then((module) => ({ default: module.Line })),
);

const RechargeHistory = React.memo(() => {
  const [recharges, setRecharges] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [amount, setAmount] = useState("");
  const [superAdminCommission, setSuperAdminCommission] = useState("");
  const [selectedRechargeId, setSelectedRechargeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token = localStorage.getItem("token");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(400));

  // Reusable chart options
  const getChartOptions = (isSmallScreen) => ({
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
          font: { size: isSmallScreen ? 10 : 12 },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
          font: { size: isSmallScreen ? 10 : 12 },
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
          font: { size: isSmallScreen ? 10 : 12 },
        },
      },
    },
    responsive: true,
  });

  const fetchData = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const params = { page, limit: rowsPerPage };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const [rechargeResponse, houseResponse] = await Promise.all([
        api.get(`/api/house/recharge-history`, {
          params,
        }),
        houses.length === 0
          ? api.get(`/api/house/`)
          : Promise.resolve({ status: 200, data: { houses } }),
      ]);

      if (rechargeResponse.status === 200) {
        setRecharges(rechargeResponse.data.recharges || []);
        setTotalPages(rechargeResponse.data.totalPages || 1);
        setCurrentPage(rechargeResponse.data.page || 1);
      }
      if (houseResponse.status === 200) {
        setHouses(houseResponse.data.houses || houseResponse.data.house || []);
      }
    } catch (error) {
      setErrorMessage("Failed to fetch recharge history or houses.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        fetchData(1, value);
      }, 500),
    [token, rowsPerPage, startDate, endDate],
  );

  useEffect(() => {
    if (!token) {
      setErrorMessage("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }
    fetchData(currentPage, searchTerm);
    return () => debouncedSearch.cancel();
  }, [currentPage, rowsPerPage, token]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleRechargeSubmit = async () => {
    setModalLoading(true);
    setMessage("");
    setError(false);

    try {
      const payload = {
        amount: Number(amount),
        superAdminCommission: Number(superAdminCommission) / 100,
      };
      if (modalMode === "create") {
        payload.houseId = selectedHouseId;
      } else {
        payload.rechargeId = selectedRechargeId;
      }

      const response = await api.post(
        `/api/house/${modalMode === "create" ? "recharge" : "update-recharge"}`,
        payload,
      );

      if (response.status === 200 || response.status === 201) {
        setMessage(
          `Recharge ${
            modalMode === "create" ? "submitted" : "updated"
          } successfully!`,
        );
        setError(false);
        await fetchData(currentPage, searchTerm);
        handleModalClose();
      } else {
        setMessage(
          `Recharge ${modalMode === "create" ? "failed" : "update failed"}.`,
        );
        setError(true);
      }
    } catch (error) {
      setMessage(
        `An error occurred during recharge ${
          modalMode === "create" ? "" : "update"
        }.`,
      );
      setError(true);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateClick = (recharge) => {
    setModalMode("update");
    setSelectedRechargeId(recharge._id);
    setSelectedHouseId(recharge.houseId?._id || "");
    setAmount(recharge.amount.toString());
    setSuperAdminCommission((recharge.superAdminCommission * 100).toString());
    setSearchInput(recharge.houseId?.name || "");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMode("create");
    setSelectedHouseId("");
    setSelectedRechargeId("");
    setAmount("");
    setSuperAdminCommission("");
    setSearchInput("");
    setMessage("");
    setError(false);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    if (!houses || houses.length === 0)
      return { totalCount: 0, totalAmount: 0, avgAmount: 0, topHouses: [] };

    const totalCount = recharges.length;
    const totalAmount = recharges.reduce((sum, r) => sum + (r.amount || 0), 0);
    const avgAmount =
      totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : 0;
    const houseTotals = houses
      .map((house) => ({
        name: house.name,
        amount: recharges
          .filter((r) => r.houseId?._id === house._id)
          .reduce((sum, r) => sum + (r.amount || 0), 0),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return { totalCount, totalAmount, avgAmount, topHouses: houseTotals };
  }, [recharges, houses]);

  const pieChartData = useMemo(() => {
    const houseAmounts = houses.reduce((acc, house) => {
      const total = recharges
        .filter((r) => r.houseId?._id === house._id)
        .reduce((sum, r) => sum + (r.amount || 0), 0);
      if (total > 0) acc[house.name] = total;
      return acc;
    }, {});

    return {
      labels:
        Object.keys(houseAmounts).length > 0
          ? Object.keys(houseAmounts)
          : ["No Data"],
      datasets: [
        {
          data:
            Object.values(houseAmounts).length > 0
              ? Object.values(houseAmounts)
              : [1],
          backgroundColor:
            Object.keys(houseAmounts).length > 0
              ? ["#ff9999", "#99ff99", "#9999ff", "#ffcc99", "#cc99ff"]
              : ["#cccccc"],
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderWidth: 1,
        },
      ],
    };
  }, [recharges, houses]);

  const barChartData = useMemo(() => {
    const houseAmounts = houses
      .map((house) => ({
        name: house.name,
        amount: recharges
          .filter((r) => r.houseId?._id === house._id)
          .reduce((sum, r) => sum + (r.amount || 0), 0),
      }))
      .filter((h) => h.amount > 0);

    return {
      labels:
        houseAmounts.length > 0 ? houseAmounts.map((h) => h.name) : ["No Data"],
      datasets: [
        {
          label: "Recharge Amount",
          data:
            houseAmounts.length > 0 ? houseAmounts.map((h) => h.amount) : [0],
          backgroundColor: "rgba(153, 255, 153, 0.6)",
          borderColor: "#99ff99",
          borderWidth: 1,
        },
      ],
    };
  }, [recharges, houses]);

  const lineChartData = useMemo(() => {
    const dateRange =
      endDate && startDate
        ? (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        : 30;
    const groupBy = dateRange > 60 ? "month" : "day";
    const grouped = recharges.reduce((acc, recharge) => {
      const date = new Date(recharge.createdAt);
      const key =
        groupBy === "month"
          ? `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`
          : `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + (recharge.amount || 0);
      return acc;
    }, {});

    const labels = Object.keys(grouped).sort();
    return {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [
        {
          label: `Recharge Amount (${groupBy})`,
          data: labels.length > 0 ? labels.map((date) => grouped[date]) : [0],
          fill: false,
          borderColor: "#99ff99",
          tension: 0.1,
        },
      ],
    };
  }, [recharges, startDate, endDate]);

  const columns = [
    { id: "house", label: "House", minWidth: 100, maxWidth: 150 },
    { id: "amount", label: "Amount", minWidth: 80, maxWidth: 100 },
    {
      id: "packageAdded",
      label: "Package Added",
      minWidth: 80,
      maxWidth: 100,
      hideOnSmall: true,
    },
    {
      id: "superAdminCommission",
      label: "Commission (%)",
      minWidth: 80,
      maxWidth: 100,
      hideOnSmall: true,
    },
    { id: "createdAt", label: "Created At", minWidth: 100, maxWidth: 120 },
    {
      id: "actions",
      label: "Actions",
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
            Recharge History
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setModalMode("create");
              setModalOpen(true);
            }}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              padding: { xs: "4px 8px", sm: "6px 12px" },
            }}
            aria-label="Open recharge house modal"
          >
            Recharge House
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#cccccc" } }}
            sx={{
              flex: 1,
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "#ffffff",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: "36px", sm: "40px" },
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
            inputProps={{ "aria-label": "Select start date" }}
          />
          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#cccccc" } }}
            sx={{
              flex: 1,
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "#ffffff",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: "36px", sm: "40px" },
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
            inputProps={{ "aria-label": "Select end date" }}
          />
          <TextField
            label="Search by House or Amount"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              flex: 2,
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "#ffffff",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: "36px", sm: "40px" },
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
            inputProps={{ "aria-label": "Search by house or amount" }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSearchTerm("");
              setCurrentPage(1);
              fetchData(1, "");
            }}
            sx={{
              color: "#ffffff",
              borderColor: "rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              height: { xs: "36px", sm: "40px" },
            }}
            aria-label="Reset filters"
          >
            Reset
          </Button>
        </Box>

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
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: { xs: 1, sm: 2 } }}>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      Total Recharges
                    </Typography>
                    <Typography
                      sx={{
                        color: "#99ff99",
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        fontWeight: "bold",
                      }}
                    >
                      {stats.totalCount} (ETB{" "}
                      {stats.totalAmount.toLocaleString()})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      Average Recharge
                    </Typography>
                    <Typography
                      sx={{
                        color: "#99ff99",
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        fontWeight: "bold",
                      }}
                    >
                      ETB {stats.avgAmount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      Top Houses
                    </Typography>
                    {stats.topHouses.length > 0 ? (
                      stats.topHouses.map((house, index) => (
                        <Typography
                          key={index}
                          sx={{
                            color: "#cccccc",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          {house.name}: ETB {house.amount.toLocaleString()}
                        </Typography>
                      ))
                    ) : (
                      <Typography
                        sx={{
                          color: "#cccccc",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        No recharges
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Suspense
              fallback={
                <CircularProgress
                  sx={{ color: "#ffffff", display: "block", mx: "auto" }}
                  size={24}
                />
              }
            >
              <Grid container spacing={2} sx={{ mb: { xs: 1, sm: 2 } }}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: 2,
                      p: { xs: 1, sm: 2 },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        mb: 1,
                      }}
                    >
                      Recharge by House (Pie)
                    </Typography>
                    <Pie
                      data={pieChartData}
                      options={getChartOptions(isSmallScreen)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: 2,
                      p: { xs: 1, sm: 2 },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        mb: 1,
                      }}
                    >
                      Recharge by House (Bar)
                    </Typography>
                    <Bar
                      data={barChartData}
                      options={getChartOptions(isSmallScreen)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: 2,
                      p: { xs: 1, sm: 2 },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        mb: 1,
                      }}
                    >
                      Recharge Trend
                    </Typography>
                    <Line
                      data={lineChartData}
                      options={getChartOptions(isSmallScreen)}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Suspense>

            {recharges.length === 0 ? (
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
                  No recharges found
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
                  <Table size="small" aria-label="Recharge history table">
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
                            ),
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recharges.map((recharge) => (
                        <TableRow
                          key={recharge._id}
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
                                  }}
                                >
                                  {col.id === "house" ? (
                                    recharge.houseId?.name || "N/A"
                                  ) : col.id === "amount" ? (
                                    recharge.amount?.toLocaleString() || "0"
                                  ) : col.id === "packageAdded" ? (
                                    recharge.packageAdded?.toLocaleString() ||
                                    "0"
                                  ) : col.id === "superAdminCommission" ? (
                                    (
                                      parseFloat(
                                        recharge.superAdminCommission,
                                      ) * 100
                                    ).toLocaleString() || "0"
                                  ) : col.id === "createdAt" ? (
                                    new Date(recharge.createdAt).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  ) : col.id === "actions" ? (
                                    <IconButton
                                      onClick={() =>
                                        handleUpdateClick(recharge)
                                      }
                                      sx={{ color: "#ffffff" }}
                                      aria-label={`Update recharge ${recharge._id}`}
                                    >
                                      <Edit />
                                    </IconButton>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                              ),
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalPages * rowsPerPage}
                  rowsPerPage={rowsPerPage}
                  page={currentPage - 1}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    color: "#ffffff",
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      {
                        color: "#ffffff",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      },
                    "& .MuiTablePagination-select": { color: "#ffffff" },
                    "& .MuiSvgIcon-root": { color: "#ffffff" },
                    "& .MuiTablePagination-actions .MuiButtonBase-root": {
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  }}
                />
              </>
            )}

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
                  borderRadius: 2,
                  m: { xs: 1, sm: 2 },
                  width: "100%",
                  color: "#ffffff",
                },
              }}
              aria-labelledby="recharge-modal-title"
            >
              <DialogTitle
                id="recharge-modal-title"
                sx={{
                  color: "#ffffff",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  p: { xs: 1, sm: 2 },
                }}
              >
                {modalMode === "create" ? "Recharge House" : "Update Recharge"}
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
                {modalMode === "create" && (
                  <Autocomplete
                    fullWidth
                    options={houses}
                    getOptionLabel={(option) => option.name || ""}
                    onChange={(event, newValue) => {
                      setSelectedHouseId(newValue ? newValue._id : "");
                    }}
                    inputValue={searchInput}
                    onInputChange={(event, newInputValue) => {
                      setSearchInput(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select House"
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
                          "aria-label": "Search and select house",
                        }}
                      />
                    )}
                    noOptionsText="No houses available"
                    sx={{ mb: { xs: 1, sm: 2 } }}
                  />
                )}
                {modalMode === "update" && (
                  <TextField
                    fullWidth
                    label="House"
                    value={searchInput || "N/A"}
                    disabled
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
                    }}
                    InputLabelProps={{ style: { color: "#cccccc" } }}
                  />
                )}
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                  inputProps={{ min: 0, "aria-label": "Enter recharge amount" }}
                />
                <TextField
                  fullWidth
                  label="Commission (%)"
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
                    min: 0,
                    max: 100,
                    "aria-label": "Enter commission percentage",
                  }}
                />
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
                  aria-label="Cancel recharge"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRechargeSubmit}
                  disabled={
                    modalLoading ||
                    (modalMode === "create" &&
                      (!selectedHouseId ||
                        !amount ||
                        Number(amount) <= 0 ||
                        !superAdminCommission ||
                        Number(superAdminCommission) <= 0)) ||
                    (modalMode === "update" &&
                      (!amount ||
                        Number(amount) <= 0 ||
                        !superAdminCommission ||
                        Number(superAdminCommission) <= 0))
                  }
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    padding: { xs: "2px 6px", sm: "4px 8px" },
                  }}
                  aria-label={
                    modalMode === "create"
                      ? "Submit recharge"
                      : "Update recharge"
                  }
                >
                  {modalLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : modalMode === "create" ? (
                    "Recharge"
                  ) : (
                    "Update"
                  )}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Box>
  );
});

export default RechargeHistory;
