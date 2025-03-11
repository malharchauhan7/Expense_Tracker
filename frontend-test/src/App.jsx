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
        <Route element={<PrivateRoutes />}>
          <Route path="/user" element={<Sidebar />}>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>
          <Route path="/admin" element={<Sidebar />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />}></Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
