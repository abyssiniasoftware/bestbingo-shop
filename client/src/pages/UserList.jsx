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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  TablePagination,
} from "@mui/material";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banStatus, setBanStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToUpdatePassword, setUserToUpdatePassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("fullname");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token = localStorage.getItem("token");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(400));

  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await api.get(`/api/user`, {
        params: { page, limit: rowsPerPage, search },
      });
      if (response.status === 200) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.page || 1);
      } else {
        setErrorMsg("Failed to fetch users.");
      }
    } catch (err) {
      setErrorMsg("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        fetchUsers(1, value);
      }, 500),
    [baseURL, token, rowsPerPage]
  );

  useEffect(() => {
    if (!token) {
      setErrorMsg("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }
    fetchUsers(currentPage, searchTerm);
    return () => debouncedSearch.cancel();
  }, [currentPage, rowsPerPage, token]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    debouncedSearch(value);
  };

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
      await fetchUsers(currentPage, searchTerm);
      setModalOpen(false);
    } catch (err) {
      alert("Failed to update ban status.");
    }
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await api.delete(
        `/api/user/${userToDelete._id}`
      );
      if (response.status === 200) {
        await fetchUsers(currentPage, searchTerm);
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      alert("An error occurred while deleting the user.");
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleOpenPasswordModal = (user) => {
    setUserToUpdatePassword(user);
    setNewPassword("");
    setPasswordError("");
    setPasswordModalOpen(true);
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await api.put(
        `/api/user/update-password/${userToUpdatePassword._id}`,
        { password: newPassword },
      );
      if (response.status === 200) {
        alert("Password updated successfully.");
        setPasswordModalOpen(false);
      } else {
        setPasswordError("Failed to update password.");
      }
    } catch (error) {
      setPasswordError("An error occurred while updating the password.");
    }
  };

  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
    setUserToUpdatePassword(null);
    setNewPassword("");
    setPasswordError("");
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return users.sort((a, b) => {
      const aVal = a[orderBy]?.toString().toLowerCase() || "";
      const bVal = b[orderBy]?.toString().toLowerCase() || "";
      return order === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [users, orderBy, order]);

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
    { id: "username", label: "Username", minWidth: 60, maxWidth: 80 },
    {
      id: "role",
      label: "Role",
      minWidth: 70,
      maxWidth: 90,
      hideOnSmall: true,
    },
    {
      id: "phone",
      label: "Phone",
      minWidth: 70,
      maxWidth: 90,
      hideOnSmall: true,
    },
    {
      id: "address",
      label: "Address",
      minWidth: 70,
      maxWidth: 100,
      hideOnSmall: true,
    },
    { id: "banned", label: "Banned", minWidth: 30, maxWidth: 50 },
    { id: "package", label: "Package", minWidth: 60, maxWidth: 80 },
    {
      id: "action",
      label: "Action",
      minWidth: 90,
      maxWidth: 200,
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
                                right: col.sticky ? 0 : undefined,
                                backgroundColor: col.sticky
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : undefined,
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
                                  "Yes"
                                ) : (
                                  "No"
                                )
                              ) : col.id === "action" ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    gap: { xs: 0.5, sm: 1 },
                                  }}
                                >
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
                                      minWidth: { md: "70px" },
                                    }}
                                  >
                                    ban/unban
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleOpenPasswordModal(user)
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
                                      minWidth: { md: "70px" },
                                    }}
                                  >
                                    Password
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleOpenDeleteModal(user)}
                                    sx={{
                                      color: "#ffffff",
                                      backgroundColor: "#b71c1c",
                                      borderColor: "#b71c1c",
                                      "&:hover": {
                                        backgroundColor: "#d32f2f",
                                        borderColor: "#d32f2f",
                                      },
                                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                      padding: { xs: "2px 6px", sm: "4px 8px" },
                                      minWidth: { md: "70px" },
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </Box>
                              ) : col.id === "package" ? (
                                isNaN(Number(user[col.id])) ? (
                                  "N/A"
                                ) : (
                                  Number(user[col.id]).toFixed(0)
                                )
                              ) : (
                                user[col.id] || "N/A"
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

            <Box mt={{ xs: 1, sm: 2 }} textAlign="right">
              <Typography
                fontWeight="bold"
                sx={{
                  color: "#ffffff",
                  fontSize: { xs: "0.875rem", sm: "1.1rem" },
                }}
              >
                Total Package: {Number(totalPackage).toFixed(0)}
              </Typography>
            </Box>
          </>
        )}

        {/* Ban Status Modal */}
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
              borderRadius: 2,
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
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#2a2d34",
                    },
                  },
                }}
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
                    backgroundColor: "#2a2d34",
                    "&:hover": { backgroundColor: "#2a2d34" },
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

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
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
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography
              variant="body2"
              sx={{
                color: "#cccccc",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Are you sure you want to delete the user{" "}
              <strong>{userToDelete?.fullname}</strong>? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button
              onClick={() => setDeleteModalOpen(false)}
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
              onClick={handleDeleteUser}
              sx={{
                backgroundColor: "#b71c1c",
                color: "#ffffff",
                "&:hover": { backgroundColor: "#d32f2f" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Password Update Modal */}
        <Dialog
          open={passwordModalOpen}
          onClose={handleClosePasswordModal}
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
            Update Password
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
              Update password for:{" "}
              <strong>{userToUpdatePassword?.fullname}</strong>
            </Typography>
            {passwordError && (
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
                {passwordError}
              </Alert>
            )}
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
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
              InputLabelProps={{ shrink: true, style: { color: "#cccccc" } }}
              inputProps={{ "aria-label": "Enter new password" }}
            />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button
              onClick={handleClosePasswordModal}
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
              onClick={handlePasswordUpdate}
              disabled={!newPassword || newPassword.length < 6}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                padding: { xs: "2px 6px", sm: "4px 8px" },
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserList;
