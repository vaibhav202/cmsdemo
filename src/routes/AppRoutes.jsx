import { Navigate, Route, Routes } from "react-router-dom";
import AppShellLayout from "../layouts/AppShellLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminRoute from "./AdminRoute";
import CustomerRoute from "./CustomerRoute";
import HomeRoute from "./HomeRoute";
import QueueRoute from "./QueueRoute";
import StaffRoute from "./StaffRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route path="/" element={<HomeRoute />} />
        <Route element={<DashboardLayout />}>
          <Route path="/order" element={<CustomerRoute />} />
          <Route path="/kitchen" element={<StaffRoute />} />
          <Route path="/control" element={<AdminRoute />} />
          <Route path="/queue" element={<QueueRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
