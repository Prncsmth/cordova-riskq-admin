"use client";

import { useState } from "react";

export function useAuth() {
  const [authenticated] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("riskq_admin_authenticated") === "true";
  });

  return { authenticated };
}