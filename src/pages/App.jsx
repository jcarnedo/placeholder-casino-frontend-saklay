import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

export default function App() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <h1>Sakla Client</h1>
      <Outlet />
    </div>
  );
}
