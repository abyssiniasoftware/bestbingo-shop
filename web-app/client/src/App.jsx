import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Register from "./pages/Register";
import HouseAdminDashboard from "./pages/HouseAdminDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import NewGame from "./pages/NewGame";
import AddCartela from "./pages/AddCartela";
import ViewCartela from "./pages/ViewCartela";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import CreateHouseForm from "./pages/RegisterHouse";
import RechargeHistory from "./pages/RechargeHistory";
import HouseList from "./pages/HouseList";
import UserList from "./pages/UserList";
import Reports from "./pages/Reports";
import RedirectToDashboard from "./components/common/RedirectToDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RedirectToDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-user" element={<Register />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/404" element={<NotFound />} />

        {/* Protected Routes */}
        <Route
          path="/super_admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["house_admin"]}>
              <HouseAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["cashier"]}>
              <CashierDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-game"
          element={
            <ProtectedRoute allowedRoles={["cashier"]}>
              <NewGame />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users-list"
          element={<ProtectedRoute element={<UserList />} />}
        />
        <Route
          path="/register-house"
          element={<ProtectedRoute element={<CreateHouseForm />} />}
        />
        <Route
          path="/recharge-house"
          element={<ProtectedRoute element={<RechargeHistory />} />}
        />
        <Route
          path="/recharge/:houseId"
          element={<ProtectedRoute element={<RechargeHistory />} />}
        />
        <Route
          path="/house-list"
          element={<ProtectedRoute element={<HouseList />} />}
        />
        <Route
          path="/add-cartela"
          element={
            <ProtectedRoute allowedRoles={["cashier"]}>
              <AddCartela />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-cartela"
          element={
            <ProtectedRoute allowedRoles={["cashier"]}>
              <ViewCartela />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={<ProtectedRoute element={<Reports />} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
