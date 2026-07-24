"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function Boundary() {
  const map = useMap();

  useEffect(() => {
    // Cordova Municipal Center
    const cordovaCenter = L.latLng(
      10.2506,
      123.9493
    );

    // Approximate viewing area around Cordova
    const southWest = L.latLng(
      10.20,
      123.90
    );

    const northEast = L.latLng(
      10.32,
      124.00
    );

    const bounds = L.latLngBounds(
      southWest,
      northEast
    );

    // Limit map movement
    map.setMaxBounds(bounds);

    // Center map on Cordova
    map.setView(
      cordovaCenter,
      14
    );

    // Keep map inside bounds
    const handleDrag = () => {
      map.panInsideBounds(
        bounds,
        {
          animate: false,
        }
      );
    };

    map.on(
      "drag",
      handleDrag
    );

    return () => {
      map.off(
        "drag",
        handleDrag
      );
    };
  }, [map]);

  return null;
}