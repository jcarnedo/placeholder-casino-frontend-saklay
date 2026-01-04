import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function RoomPlay() {
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [board, setBoard] = useState([]);
  const [round, setRound] = useState(null);
  const [wallet, setWallet] = useState(null);

  const [slotId, setSlotId] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [debug, setDebug] = useState([]); // show which endpoint failed

  const canBet = useMemo(() => round?.status === "betting", [round]);

  async function loadAll() {
    setErr("");
    setMsg("");
    setDebug([]);

    const results = await Promise.allSettled([
      api.get(`/sakla/rooms/${roomId}`),
      api.get(`/sakla/rooms/${roomId}/board`),
      api.get(`/sakla/rooms/${roomId}/rounds/current`),
      api.get(`/wallet`),
    ]);

    const [roomRes, boardRes, roundRes, walletRes] = results;

    const failures = [];

    // room
    if (roomRes.status === "fulfilled") {
      setRoom(roomRes.value.data);
    } else {
      const status = roomRes.reason?.response?.status;
      const data = roomRes.reason?.response?.data;
      console.error("room error:", status, data);
      failures.push({ endpoint: `/sakla/rooms/${roomId}`, status, data });
    }

    // board
    if (boardRes.status === "fulfilled") {
      setBoard(boardRes.value.data || []);
    } else {
      const status = boardRes.reason?.response?.status;
      const data = boardRes.reason?.response?.data;
      console.error("board error:", status, data);
      failures.push({ endpoint: `/sakla/rooms/${roomId}/board`, status, data });
    }

    // round
    if (roundRes.status === "fulfilled") {
      setRound(roundRes.value.data);
    } else {
      const status = roundRes.reason?.response?.status;
      const data = roundRes.reason?.response?.data;
      console.error("round error:", status, data);
      failures.push({ endpoint: `/sakla/rooms/${roomId}/rounds/current`, status, data });
    }

    // wallet (auth)
    if (walletRes.status === "fulfilled") {
      setWallet(walletRes.value.data);
    } else {
      const status = walletRes.reason?.response?.status;
      const data = walletRes.reason?.response?.data;
      console.error("wallet error:", status, data);
      failures.push({ endpoint: `/wallet`, status, data });
    }

    if (failures.length) {
      setDebug(failures);
      setErr("Some data failed to load. See debug panel below.");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  async function testWallet() {
    try {
      const r = await api.get("/wallet");
      alert("Wallet OK:\n" + JSON.stringify(r.data, null, 2));
    } catch (e) {
      alert(
        "Wallet FAIL:\n" +
          (e?.response?.status || "") +
          "\n" +
          JSON.stringify(e?.response?.data, null, 2)
      );
    }
  }

  async function placeBet(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!round) {
      setErr("No current round found for this room.");
      return;
    }

    if (!canBet) {
      setErr("Betting is closed. Round is not in betting status.");
      return;
    }

    if (!slotId) {
      setErr("Please select a slot.");
      return;
    }

    if (!amount) {
      setErr("Please enter an amount.");
      return;
    }

    try {
      await api.post("/sakla/bets", {
        room_id: Number(roomId),
        round_id: Number(round.id),
        slot_id: Number(slotId),
        amount: Number(amount),
      });

      setMsg("Bet placed! Check admin panel → Sakla Bets.");
      setAmount("");
      setSlotId("");

      await loadAll(); // refresh wallet + round state
    } catch (e) {
      console.error("placeBet error:", e?.response?.status, e?.response?.data);
      setErr(e?.response?.data?.message || "Failed to place bet.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button onClick={loadAll}>Refresh</button>
        <button onClick={testWallet}>Test Wallet</button>
      </div>

      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}
      {msg && <div style={{ color: "green", marginTop: 10 }}>{msg}</div>}

      {debug.length > 0 && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
          <strong>Debug (failed requests)</strong>
          <ul style={{ marginTop: 8 }}>
            {debug.map((d, idx) => (
              <li key={idx}>
                <code>{d.endpoint}</code> — <b>{String(d.status || "ERR")}</b>{" "}
                <span style={{ opacity: 0.8 }}>
                  {d.data ? JSON.stringify(d.data) : ""}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Open DevTools → Console to see full error logs.
          </div>
        </div>
      )}

      {!room ? (
        <div style={{ marginTop: 16 }}>Loading...</div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: 0 }}>{room.name}</h3>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Min: {room.min_bet} | Max: {room.max_bet}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Wallet:</strong>{" "}
            {wallet ? (wallet.balance ?? JSON.stringify(wallet)) : "Loading..."}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Current Round:</strong>{" "}
            {round ? `#${round.round_no} (${round.status})` : "No round"}
          </div>

          <hr style={{ margin: "16px 0" }} />

          <h4>Board</h4>
          {board.length === 0 ? (
            <div style={{ opacity: 0.8 }}>
              No board slots found for this room. Create slots in Admin → Sakla Board Slots.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
              {board.map((s) => (
                <div
                  key={s.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 10,
                    cursor: "pointer",
                    background: String(slotId) === String(s.id) ? "#f5f5f5" : "white",
                  }}
                  onClick={() => setSlotId(String(s.id))}
                >
                  <div style={{ fontWeight: 600 }}>{s.name ?? `Slot ${s.slot_no ?? ""}`}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    x{String(s.multiplier ?? 2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr style={{ margin: "16px 0" }} />

          <h4>Place Bet</h4>
          <form onSubmit={placeBet} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
            <select value={slotId} onChange={(e) => setSlotId(e.target.value)} required>
              <option value="">Select slot</option>
              {board.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? `Slot ${s.slot_no ?? s.id}`} (x{s.multiplier ?? 2})
                </option>
              ))}
            </select>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Amount"
              min={room.min_bet ?? 1}
              max={room.max_bet ?? undefined}
              required
            />

            <button type="submit" disabled={!canBet || !round}>
              {!round ? "No Round" : canBet ? "Place Bet" : "Betting Closed"}
            </button>
          </form>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Places bet via <code>POST /api/sakla/bets</code> (auth:sanctum) and should appear in Filament Admin → Sakla Bets.
          </p>
        </div>
      )}
    </div>
  );
}
