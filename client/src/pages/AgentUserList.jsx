import React, { useEffect, useState, useMemo } from "react";
import api from "../utils/api";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const AgentUserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banStatus, setBanStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("fullname");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(400)); // <400px

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/api/user/agent`);
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          setErrorMsg("Failed to fetch users.");
        }
      } catch (error) {
        setErrorMsg("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [ token]);

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setBanStatus(user.isBanned ? "unban" : "ban");
    setModalOpen(true);
  };

  const handleBanChange = async () => {
    try {
      const bannedBy = "admin";
      const res = await api.put(
        `/api/user/ban/${selectedUser._id}`,
        { bannedBy },
      );

      await fetchUsers();
      setModalOpen(false);
    } catch (err) {
      alert("Failed to update ban status.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const fullname = user.fullname?.toLowerCase() || "";
        const username = user.username?.toLowerCase() || "";
        const phone = user.phone?.toLowerCase() || "";
        const address = user.address?.toLowerCase() || "";

        return (
          fullname.includes(searchTerm) ||
          username.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          address.includes(searchTerm)
        );
      })
      .sort((a, b) => {
        const aVal = a[orderBy]?.toString().toLowerCase() || "";
        const bVal = b[orderBy]?.toString().toLowerCase() || "";
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
  }, [users, searchTerm, orderBy, order]);

  const totalPackage = useMemo(() => {
    const housePackages = new Map();
    users.forEach((user) => {
      if (user.houseId && user.package && !housePackages.has(user.houseId)) {
        housePackages.set(user.houseId, user.package);
      }
    });
    return Array.from(housePackages.values()).reduce(
      (sum, pkg) => sum + (pkg || 0),
      0
    );
  }, [users]);

  const columns = [
    { id: "username", label: "Username", minWidth: 80, maxWidth: 120 },
    { id: "fullname", label: "Fullname", minWidth: 100, maxWidth: 150 },
    {
      id: "role",
      label: "Role",
      minWidth: 80,
      maxWidth: 100,
      hideOnSmall: true,
    },
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
    {
      id: "branch",
      label: "Branch",
      minWidth: 80,
      maxWidth: 100,
      hideOnSmall: true,
    },
    { id: "banned", label: "Banned", minWidth: 80, maxWidth: 100 },
    { id: "package", label: "Package", minWidth: 80, maxWidth: 100 },
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
          User List
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
              backdropFilter: "blur(5px)",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {errorMsg}
          </Alert>
        ) : filteredUsers.length === 0 ? (
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
              No users found
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
                        )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
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
                                ...(col.id === "banned" && {
                                  color: user.isBanned ? "#ff9999" : "#99ff99",
                                }),
                              }}
                            >
                              {col.id === "banned" ? (
                                user.isBanned ? (
                                  "Banned"
                                ) : (
                                  "Active"
                                )
                              ) : col.id === "action" ? (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleOpenModal(user)}
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
                                  Edit
                                </Button>
                              ) : (
                                user[col.id] ||
                                (col.id === "package" ? 0 : "N/A")
                              )}
                            </TableCell>
                          )
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={{ xs: 1, sm: 2 }} textAlign="right">
              <Typography
                fontWeight="bold"
                sx={{
                  color: "#ffffff",
                  fontSize: { xs: "0.875rem", sm: "1.1rem" },
                }}
              >
                Total Package: {totalPackage}
              </Typography>
            </Box>
          </>
        )}

        {/* Modal */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
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
            Edit Ban Status
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography
              variant="body2"
              mb={{ xs: 1, sm: 2 }}
              sx={{
                color: "#cccccc",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Change ban status for: <strong>{selectedUser?.fullname}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: "#cccccc",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Status
              </InputLabel>
              <Select
                value={banStatus}
                onChange={(e) => setBanStatus(e.target.value)}
                label="Status"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                }}
              >
                <MenuItem
                  value="ban"
                  sx={{
                    color: "#ffffff",
                    backgroundColor: "#1e3a8a",
                    "&:hover": { backgroundColor: "#2b4cb8" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Banned
                </MenuItem>
                <MenuItem
                  value="unban"
                  sx={{
                    color: "#ffffff",
                    backgroundColor: "#1e3a8a",
                    "&:hover": { backgroundColor: "#2b4cb8" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Active
                </MenuItem>
              </Select>
            </FormControl>
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
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleBanChange}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AgentUserList;
