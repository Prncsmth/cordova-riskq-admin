"use client";

import { useEffect, useState } from "react";
import { Responder } from "@/types/responder";

export function useResponders() {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setResponders([]);
    setLoading(false);
  }, []);

  return {
    responders,
    loading,
    setResponders,
  };
}