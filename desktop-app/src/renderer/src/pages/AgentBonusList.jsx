import React, { useState, useEffect } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const AgentBonusList = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("dateIssued");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 10;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px

  useEffect(() => {
    const fetchBonuses = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/game/agent-bonuses`);
        setBonuses(response.data.bonuses || []);
        setError(null);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch bonuses";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchBonuses();
  }, []);

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

  const columns = [
    // { id: '_id', label: 'Bonus ID', minWidth: 80, maxWidth: 120 },
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
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{
          color: "#ffffff",
          fontSize: { xs: "1rem", sm: "1.25rem" },
        }}
      >
        All Bonuses
      </Typography>

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
                      ),
                  )}
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
                        ),
                    )}
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
    </Box>
  );
};

export default AgentBonusList;
