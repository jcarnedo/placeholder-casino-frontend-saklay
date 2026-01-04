import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { clearToken } from "../lib/auth";

export default function App() {
  const navigate = useNavigate();

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearToken();
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Sakla Client</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <hr style={{ margin: "16px 0" }} />

      <Outlet />
    </div>
  );
}
