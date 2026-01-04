import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getToken } from "./lib/auth";
import { setAuthToken } from "./lib/api";

import App from "./pages/App.jsx";
import Login from "./pages/Login.jsx";
import Rooms from "./pages/Rooms.jsx";
import RoomPlay from "./pages/RoomPlay.jsx";

const token = getToken();
if (token) setAuthToken(token);

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<App />}>
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:roomId" element={<RoomPlay />} />
      </Route>

      <Route path="*" element={<Login />} />
    </Routes>
  </BrowserRouter>
);
