import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./pages/App.jsx";
import Login from "./pages/Login.jsx";
import Rooms from "./pages/Rooms.jsx";
import RoomPlay from "./pages/RoomPlay.jsx";
import { loadToken } from "./lib/auth.js";

loadToken();

function RequireAuth({ children }) {
  const token = localStorage.getItem("sakla_token");
  return token ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><App /></RequireAuth>}>
          <Route index element={<Navigate to="/rooms" replace />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/:roomId" element={<RoomPlay />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/rooms" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
