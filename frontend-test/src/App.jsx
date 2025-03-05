import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserDashboard from "./components/user/UserDashboard";
import Sidebar from "./components/layouts/Sidebar";
import AdminDashboard from "./components/admin/AdminDashboard";
import Login from "./components/common/Login";
import Signup from "./components/common/Signup";
import axios from "axios";
import Transactions from "./components/user/Transactions";

const App = () => {
  axios.defaults.baseURL = "http://localhost:8000";
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/user" element={<Sidebar />}>
        <Route index element={<Navigate to="/user/transactions" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="transactions" element={<Transactions />} />
      </Route>
      <Route path="/admin" element={<Sidebar />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
