import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Switch, Avatar, Grid, Paper } from "@mui/material";
import { user as userIcon } from "../images/images";
import useUserStore from "../stores/userStore";
import useWallet from "../hooks/useWallet";
import api from "../utils/api";
import { toast } from "react-toastify";

const Settings = () => {
    const { user } = useUserStore();
    const { wallet } = useWallet();
    const [stats, setStats] = useState(null);
    const [jackpotPercentage, setJackpotPercentage] = useState("0.00");
    const [jackpotAmount, setJackpotAmount] = useState("0.00");
    const [displayGameInfo, setDisplayGameInfo] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/api/cases/house-cases");
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchStats();
    }, []);

    const handleSave = () => {
        toast.success("Profile settings saved successfully!");
    };

    return (
        <Box sx={{ p: 4, height: "100%", background: "#00b2ff", overflowY: "auto" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", fontFamily: "'Comic Sans MS', cursive, sans-serif", color: "#333" }}>
                Profile
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    background: "#007fa5",
                    borderRadius: "20px",
                    p: 6,
                    color: "white",
                    display: "flex",
                    gap: 6,
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                }}
            >
                {/* Left Side: Avatar and Username */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 200 }}>
                    <Avatar
                        src={userIcon}
                        sx={{ width: 150, height: 150, border: "5px solid #ff7043", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
                        {user?.username || "Admin"}
                    </Typography>
                </Box>

                {/* Right Side: Information Grid */}
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={4}>
                        {/* General Information Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", opacity: 0.9 }}>
                                General Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Typography sx={{ fontWeight: "bold" }}>Name:</Typography>
                                        <Typography>{user?.username || "N/A"}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Typography sx={{ fontWeight: "bold" }}>Balance:</Typography>
                                        <Typography>{wallet?.package ?? wallet?.balance ?? 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Typography sx={{ fontWeight: "bold" }}>Today Game:</Typography>
                                        <Typography>{stats?.stats?.totalGames || 0}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Jackpot Inputs */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontWeight: "bold", minWidth: 150 }}>Jackpot Percentage:</Typography>
                                <TextField
                                    size="small"
                                    value={jackpotPercentage}
                                    onChange={(e) => setJackpotPercentage(e.target.value)}
                                    sx={{
                                        background: "white",
                                        borderRadius: "4px",
                                        width: 100,
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { border: "none" },
                                        },
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontWeight: "bold", minWidth: 150 }}>% Jackpot Amount:</Typography>
                                <TextField
                                    size="small"
                                    value={jackpotAmount}
                                    onChange={(e) => setJackpotAmount(e.target.value)}
                                    sx={{
                                        background: "white",
                                        borderRadius: "4px",
                                        width: 100,
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { border: "none" },
                                        },
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Game Information Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: "bold", opacity: 0.9 }}>
                                Game Information
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography sx={{ fontWeight: "bold" }}>Display Game Information:</Typography>
                                <Typography sx={{ fontWeight: "bold", color: displayGameInfo ? "#4caf50" : "#ff5252" }}>
                                    {displayGameInfo ? "ON" : "OFF"}
                                </Typography>
                                <Switch
                                    checked={displayGameInfo}
                                    onChange={(e) => setDisplayGameInfo(e.target.checked)}
                                    sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#4caf50" },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#4caf50" },
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Save Button */}
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                sx={{
                                    mt: 2,
                                    px: 4,
                                    py: 1,
                                    borderRadius: "10px",
                                    background: "linear-gradient(to right, #26c6da, #ff7043)",
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    "&:hover": {
                                        opacity: 0.9,
                                    },
                                }}
                            >
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default Settings;