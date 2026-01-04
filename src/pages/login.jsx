import React, { useState } from "react";
import { api } from "../lib/api";
import { saveToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/auth/login", { email, password });
      saveToken(res.data.token);
      navigate("/rooms");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Sign in</button>
      </form>
      <p style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
        Uses API: POST /api/auth/login (Sanctum token)
      </p>
    </div>
  );
}
