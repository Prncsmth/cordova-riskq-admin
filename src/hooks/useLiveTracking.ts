"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type LocationUpdate = {
  responderId: string;
  latitude: number;
  longitude: number;
};

export function useLiveTracking() {
  const [locations, setLocations] = useState<
    LocationUpdate[]
  >([]);

  useEffect(() => {
    socket.on(
      "responder-location-update",
      (location: LocationUpdate) => {
        setLocations((current) => {
          const filtered = current.filter(
            (item) =>
              item.responderId !== location.responderId
          );

          return [...filtered, location];
        });
      }
    );

    return () => {
      socket.off("responder-location-update");
    };
  }, []);

  return {
    locations,
  };
}