import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const PrivateRoutes = () => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
