import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layouts/Sidebar";
import axios from "axios";
import PrivateRoutes from "./hooks/PrivateRoutes";

const Home = lazy(() => import("./components/pages/Home"));
const Login = lazy(() => import("./components/common/Login"));
const Signup = lazy(() => import("./components/common/Signup"));
const UserDashboard = lazy(() => import("./components/user/UserDashboard"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const Transactions = lazy(() => import("./components/user/Transactions"));
const UsersManagement = lazy(() =>
  import("./components/admin/UsersManagement")
);
const UserAllDetails = lazy(() => import("./components/admin/UserAllDetails"));
const AddBudget = lazy(() => import("./components/user/AddBudget"));

// Profile and settings
const UserProfile = lazy(() => import("./components/user/UserProfile"));
const UserSettings = lazy(() => import("./components/user/UserSettings"));

const AdminProfile = lazy(() => import("./components/admin/AdminProfile"));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings"));
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
// Financial Dashboards
const FinancialDashboard = lazy(() =>
  import("./components/charts/user/FinancialDashboard")
);

// Reset Password and Forgot Password
const ForgotPassword = lazy(() => import("./components/common/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/common/ResetPassword"));

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const App = () => {
  axios.defaults.baseURL = "http://localhost:8000";
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resetpassword/:token" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/user" element={<Sidebar />}>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="addbudget" element={<AddBudget />} />
            <Route path="charts" element={<FinancialDashboard />} />
          </Route>
          <Route path="/admin" element={<Sidebar />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />}></Route>
            <Route path="users/:userId" element={<UserAllDetails />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
