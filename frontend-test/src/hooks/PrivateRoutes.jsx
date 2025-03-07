import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";

const useAuth = () => {
  const [Auth, setAuth] = useState({ isLoggedin: false, isAdmin: false });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    const isAdmin = localStorage.getItem("isAdmin");
    if (user_id && isAdmin) {
      setAuth({ isLoggedin: true, isAdmin: isAdmin });
    }
    setIsLoading(false);
  }, []);
  return { Auth, isLoading };
};

const PrivateRoutes = () => {
  const { Auth, isLoading } = useAuth();
  if (isLoading) {
    return <div className="mr-3 size-5 animate-spin"></div>;
  }
  return Auth.isLoggedin == true ? <Outlet /> : <Navigate to="/login" />;
};
export default PrivateRoutes;
