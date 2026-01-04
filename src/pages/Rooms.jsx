import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/sakla/rooms")
      .then((r) => setRooms(r.data))
      .catch(() => setErr("Failed to load rooms"));
  }, []);

  return (
    <div>
      <h3>Rooms</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {rooms.map((room) => (
          <div key={room.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{room.name}</strong>
              <span style={{ opacity: 0.7 }}>{String(room.status)}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
              Min: {room.min_bet} | Max: {room.max_bet}
            </div>

            <div style={{ marginTop: 10 }}>
              <Link to={`/rooms/${room.id}`}>Enter</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
