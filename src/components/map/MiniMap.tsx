"use client";

import { useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";

import "mapbox-gl/dist/mapbox-gl.css";

type MiniMapProps = {
  latitude: number;
  longitude: number;
  label?: string;
  zoom?: number;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MiniMap({ latitude, longitude, label, zoom = 15 }: MiniMapProps) {
  const [mapReady, setMapReady] = useState(false);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-center text-xs text-muted">
        Missing NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      initialViewState={{ longitude, latitude, zoom }}
      dragPan={false}
      dragRotate={false}
      scrollZoom={false}
      doubleClickZoom={false}
      touchZoomRotate={false}
      touchPitch={false}
      keyboard={false}
      attributionControl={false}
      onLoad={() => setMapReady(true)}
      style={{ width: "100%", height: "100%" }}
    >
      {mapReady && (
        <Marker longitude={longitude} latitude={latitude} anchor="center">
          <span
            title={label}
            style={{
              display: "block",
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: "#15803d",
              border: "2px solid white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </Marker>
      )}
    </Map>
  );
}
