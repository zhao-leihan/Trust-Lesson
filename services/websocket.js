/**
 * Trust Lesson — WebSocket Server for Real-Time Escrow Updates
 *
 * Emits events to connected clients when:
 * - Escrow status changes (FUNDED, DISPUTED, RELEASED)
 * - Milestone is confirmed
 * - Dispute is resolved
 *
 * Usage: integrate with the indexer to call emit() after DB updates.
 */

// Room map: sessionId → Set of WebSocket clients
const rooms = new Map();

/**
 * Emit a message to all clients subscribed to a session.
 * @param {string} sessionId
 * @param {object} payload
 */
export function emitToSession(sessionId, payload) {
  const clients = rooms.get(sessionId);
  if (!clients) return;
  const message = JSON.stringify({ type: "session_update", sessionId, ...payload });
  clients.forEach((ws) => {
    if (ws.readyState === 1 /* OPEN */) {
      ws.send(message);
    }
  });
}

/**
 * Emit to all sessions for a user.
 * @param {string} userAddress
 * @param {object} payload
 */
export function emitToUser(userAddress, payload) {
  const key = `user:${userAddress.toLowerCase()}`;
  const clients = rooms.get(key);
  if (!clients) return;
  const message = JSON.stringify({ type: "escrow_update", userAddress, ...payload });
  clients.forEach((ws) => {
    if (ws.readyState === 1) ws.send(message);
  });
}

/**
 * WebSocket connection handler.
 * Call this from your WebSocket server setup.
 *
 * @param {WebSocket} ws
 * @param {string} room - "session:{id}" or "user:{address}"
 */
export function handleConnection(ws, room) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);

  ws.send(JSON.stringify({ type: "connected", room }));

  ws.on("close", () => {
    const clients = rooms.get(room);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) rooms.delete(room);
    }
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // Handle ping/keep-alive
      if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
    } catch {}
  });
}

/**
 * Get count of active connections.
 */
export function getConnectionStats() {
  let total = 0;
  rooms.forEach((clients) => (total += clients.size));
  return { rooms: rooms.size, connections: total };
}
