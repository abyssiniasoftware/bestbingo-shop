import React, { useEffect, useState, useMemo } from "react";
import api from "../utils/api";
import debounce from "lodash.debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  TableSortLabel,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  TablePagination,
} from "@mui/material";
import { toast } from "react-toastify";

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentUsers, setAgentUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("fullname");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [superAdminCommission, setSuperAdminCommission] = useState("");
  const [superAdminId, setSuperAdminId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(400)); // <400px

  // Fetch all agents
  const fetchAgents = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await api.get(`/api/user/role/agent`, {
        params: { page, limit: rowsPerPage, search },
      });
      if (response.status === 200) {
        setAgents(response.data.users);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.page);
      } else {
        setErrorMsg("Failed to fetch agents.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "An error occurred while fetching agents.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch super admin ID
  const fetchSuperAdminId = async () => {
    try {
      const response = await api.get(`/api/me`);
      setSuperAdminId(response.data.id);
    } catch (err) {
      toast.error("Failed to fetch super admin data");
    }
  };

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page on new search
        fetchAgents(1, value);
      }, 500),
    [ rowsPerPage],
  );

  useEffect(() => {
    fetchAgents(currentPage, searchTerm);
    fetchSuperAdminId();
    return () => {
      debouncedSearch.cancel(); // Cleanup debounce on unmount
    };
  }, [currentPage, rowsPerPage]);

  // Fetch users under an agent
  const fetchAgentUsers = async (agentId) => {
    setModalLoading(true);
    try {
      const response = await api.get(`/api/user/agent/${agentId}`);
      if (response.status === 200) {
        setAgentUsers(response.data);
      } else {
        toast.error("Failed to fetch agent users.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while fetching agent users.",
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Handle recharge
  const handleRecharge = async () => {
    if (
      !rechargeAmount ||
      !superAdminCommission ||
      parseFloat(rechargeAmount) <= 0 ||
      parseFloat(superAdminCommission) <= 0
    ) {
      toast.error("Please enter valid amount and commission");
      return;
    }
    try {
      const response = await api.post(`/api/house/recharge-agent`, {
        agentId: selectedAgent._id,
        amount: parseFloat(rechargeAmount),
        superAdminCommission: parseFloat(superAdminCommission / 100),
        rechargeBy: superAdminId,
      });
      toast.success("Agent recharged successfully");
      setRechargeModalOpen(false);
      setRechargeAmount("");
      setSuperAdminCommission("");
      fetchAgents(currentPage, searchTerm); // Refresh with current page and search
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to recharge agent");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    debouncedSearch(value);
  };

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const handleOpenModal = (agent, action = "view") => {
    setSelectedAgent(agent);
    if (action === "recharge") {
      setRechargeModalOpen(true);
    } else {
      setAgentUsers([]);
      fetchAgentUsers(agent._id);
      setModalOpen(true);
    }
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1); // TablePagination uses 0-based indexing
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  const filteredAgents = useMemo(() => {
    return agents.sort((a, b) => {
      const aVal = a[orderBy]?.toString().toLowerCase() || "";
      const bVal = b[orderBy]?.toString().toLowerCase() || "";
      return order === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [agents, orderBy, order]);

  const columns = [
    { id: "username", label: "Username", minWidth: 80, maxWidth: 120 },
    { id: "fullname", label: "Fullname", minWidth: 100, maxWidth: 150 },
    {
      id: "phone",
      label: "Phone",
      minWidth: 100,
      maxWidth: 120,
      hideOnSmall: true,
    },
    {
      id: "address",
      label: "Address",
      minWidth: 120,
      maxWidth: 150,
      hideOnSmall: true,
    },
    { id: "package", label: "Package", minWidth: 80, maxWidth: 100 },
    {
      id: "action",
      label: "Action",
      minWidth: 150,
      maxWidth: 200,
      sticky: true,
    },
  ];

  const userColumns = [
    { id: "username", label: "Username", minWidth: 80, maxWidth: 120 },
    { id: "fullname", label: "Fullname", minWidth: 100, maxWidth: 150 },
    { id: "role", label: "Role", minWidth: 80, maxWidth: 100 },
    { id: "phone", label: "Phone", minWidth: 100, maxWidth: 120 },
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
          Agent List
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, phone, or address..."
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
        ) : errorMsg ? (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 1, sm: 2 },
              backgroundColor: "rgba(255, 82, 82, 0.2)",
              color: "#ffcccc",
              borderRadius: 1,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {errorMsg}
          </Alert>
        ) : filteredAgents.length === 0 ? (
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
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
              No agents found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
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
                            <TableSortLabel
                              active={orderBy === col.id}
                              direction={orderBy === col.id ? order : "asc"}
                              onClick={() => handleSort(col.id)}
                              sx={{
                                color: "#ffffff",
                                "&.Mui-active": { color: "#ffffff" },
                                "&:hover": { color: "#e0e0e0" },
                                "& .MuiTableSortLabel-icon": {
                                  color: "#ffffff !important",
                                },
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              {col.label}
                            </TableSortLabel>
                          </TableCell>
                        ),
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow
                      key={agent._id}
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
                              {col.id === "action" ? (
                                <>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenModal(agent)}
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
                                      mr: 1,
                                    }}
                                  >
                                    View Users
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleOpenModal(agent, "recharge")
                                    }
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
                                </>
                              ) : (
                                agent[col.id] ||
                                (col.id === "package" ? 0 : "N/A")
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

        {/* Modal for Agent Users */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          maxWidth={isSmallScreen ? "xs" : "md"}
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
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
            Users Under Agent: {selectedAgent?.fullname}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
            {modalLoading ? (
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
            ) : agentUsers.length === 0 ? (
              <Typography
                sx={{
                  color: "#cccccc",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  textAlign: "center",
                }}
              >
                No users found under this agent.
              </Typography>
            ) : (
              <TableContainer
                sx={{
                  backgroundColor: "#1e1e1e", // Solid dark background
                  borderRadius: 1,
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#2a2a2a" }}>
                      {userColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{
                            minWidth: col.minWidth,
                            maxWidth: col.maxWidth,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: "#ffffff",
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agentUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#333333",
                          },
                        }}
                      >
                        {userColumns.map((col) => (
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
                            {user[col.id] || "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button
              onClick={() => setModalOpen(false)}
              sx={{
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal for Recharge */}
        <Dialog
          open={rechargeModalOpen}
          onClose={() => setRechargeModalOpen(false)}
          maxWidth={isSmallScreen ? "xs" : "sm"}
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
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
            Recharge Agent: {selectedAgent?.fullname}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Amount"
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
                "& .MuiInputLabel-root": {
                  color: "#cccccc",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Super Admin Commission"
              type="number"
              value={superAdminCommission}
              onChange={(e) => setSuperAdminCommission(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
                "& .MuiInputLabel-root": {
                  color: "#cccccc",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button
              onClick={() => {
                setRechargeModalOpen(false);
                setRechargeAmount("");
                setSuperAdminCommission("");
              }}
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
              onClick={handleRecharge}
              disabled={
                !rechargeAmount || !superAdminCommission || !superAdminId
              }
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
              }}
            >
              Recharge
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AgentList;
