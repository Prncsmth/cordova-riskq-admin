"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsers([]);
    setLoading(false);
  }, []);

  return {
    users,
    loading,
    setUsers,
  };
}