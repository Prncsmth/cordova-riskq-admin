"use client";

import { useEffect, useSyncExternalStore } from "react";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";

// Owns the shared socket's connect/disconnect lifecycle. Call this exactly
// once, from a component that stays mounted for the entire authenticated
// session (AdminLayout) -- not from useSocket() itself, which many
// independent page-level hooks (useResponders, useSupportRequests,
// useEmergencies, ...) call just to read/listen on the shared instance. It
// used to be bundled into useSocket(), so each of those hooks' own
// mount/unmount effect called connect()/disconnect() on the same singleton:
// navigating away from any one of them tore the connection down for every
// other still-mounted consumer relying on it (e.g. EmergencyAlertProvider),
// which is why a page with no socket-consuming hook of its own, like
// Announcements, could land on a connection some other page's unmount had
// just killed and never reconnect it.
export function useSocketConnection() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Backend's socket auth middleware requires handshake.auth.token (same
    // JWT as REST) -- set it before each connect since the token can change
    // across logins.
    socket.auth = { token };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [token]);
}

export function useSocket() {
  return socket;
}

export type SocketConnectionStatus = "connected" | "connecting" | "disconnected";

// `socket.connected` alone can't distinguish "never tried yet" / "actively
// retrying" from a flat "disconnected" -- reconnection is an event, not a
// readable property, so it needs this one flag alongside the socket's own
// state. Starts true: before useSocket's effect has even called connect()
// yet, the dashboard is still in its initial connecting window, not at rest
// disconnected.
let isConnecting = true;

function getSocketStatus(): SocketConnectionStatus {
  if (socket.connected) return "connected";
  return isConnecting ? "connecting" : "disconnected";
}

// SSR/first-paint snapshot -- matches the real socket's state before any
// client effect has run (not yet connected, not yet attempted).
function getServerSocketStatus(): SocketConnectionStatus {
  return "connecting";
}

function subscribeSocketStatus(onStoreChange: () => void): () => void {
  function handleConnect() {
    isConnecting = false;
    onStoreChange();
  }
  function handleDisconnect() {
    isConnecting = false;
    onStoreChange();
  }
  function handleReconnectAttempt() {
    isConnecting = true;
    onStoreChange();
  }

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.io.on("reconnect_attempt", handleReconnectAttempt);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.io.off("reconnect_attempt", handleReconnectAttempt);
  };
}

// Exposes the shared socket's own connection state -- doesn't open a second
// connection or drive connect()/disconnect() itself (useSocket above, tied
// to the auth token lifecycle, already owns that). Any component can mount
// this independently to show live connection status.
export function useSocketConnectionStatus(): SocketConnectionStatus {
  return useSyncExternalStore(subscribeSocketStatus, getSocketStatus, getServerSocketStatus);
}