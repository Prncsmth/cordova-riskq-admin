"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";

export function useSocket() {
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

  return socket;
}