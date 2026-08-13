"use client";

import { useCallback, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { LngLatBoundsLike } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

export type LiveMapMarkerType = "incident" | "responder" | "evacuation";

export type LiveMapMarker = {
  id: string;
  position: [number, number];
  label: string;
  type: LiveMapMarkerType;
};

const markerColor: Record<LiveMapMarkerType, string> = {
  incident: "#dc2626",
  responder: "#1d4ed8",
  evacuation: "#15803d",
};

const center: [number, number] = [10.2531, 123.9495];

// Keeps the map locked to Cordova, Cebu — no panning/zooming out to other areas.
const CORDOVA_BOUNDS: LngLatBoundsLike = [
  [123.9, 10.2],
  [124.0, 10.32],
];

const mapStyles = {
  Road: "mapbox://styles/mapbox/streets-v12",
  Satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  Terrain: "mapbox://styles/mapbox/outdoors-v12",
} as const;

type MapStyleName = keyof typeof mapStyles;

// Mock markers for UI — replace with real API data once backend endpoints are available.
export const defaultMarkers: LiveMapMarker[] = [
  { id: "inc-1", position: [10.2551, 123.9505], label: "Fire Incident — Poblacion", type: "incident" },
  { id: "inc-2", position: [10.2508, 123.9469], label: "Road Accident — Ajoya", type: "incident" },
  { id: "res-1", position: [10.2535, 123.9522], label: "Responder — Juan Dela Cruz", type: "responder" },
  { id: "res-2", position: [10.2495, 123.9481], label: "Responder — Maria Garcia", type: "responder" },
  { id: "evac-1", position: [10.2562, 123.9452], label: "Gabi Evacuation Center", type: "evacuation" },
  { id: "evac-2", position: [10.2482, 123.9518], label: "Poblacion Evacuation Center", type: "evacuation" },
];

type LiveMapProps = {
  markers?: LiveMapMarker[];
  center?: [number, number];
  zoom?: number;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function LiveMap({
  markers = defaultMarkers,
  center: mapCenter = center,
  zoom = 14,
}: LiveMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [activeStyle, setActiveStyle] = useState<MapStyleName>("Road");
  const [selectedMarker, setSelectedMarker] = useState<LiveMapMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [minZoom, setMinZoom] = useState(13);

  // Recomputes the tightest zoom that still fits the Cordova bounds to the
  // current container size, so zooming out never reveals areas outside it.
  const clampZoomToBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const fitted = map.cameraForBounds(CORDOVA_BOUNDS, { padding: 0 });
    if (fitted && typeof fitted.zoom === "number") {
      setMinZoom(fitted.zoom);
    }
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 p-4 text-center text-sm text-muted">
        Missing NEXT_PUBLIC_MAPBOX_TOKEN — set it in .env.local to load the map.
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={mapStyles[activeStyle]}
      initialViewState={{
        longitude: mapCenter[1],
        latitude: mapCenter[0],
        zoom,
      }}
      minZoom={minZoom}
      maxBounds={CORDOVA_BOUNDS}
      onLoad={() => {
        setMapReady(true);
        clampZoomToBounds();
      }}
      onResize={clampZoomToBounds}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-right" />

      <div className="absolute right-2 top-24 z-10 overflow-hidden rounded-md border border-border bg-white text-xs shadow-sm">
        {(Object.keys(mapStyles) as MapStyleName[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setActiveStyle(name)}
            className={`block w-full px-3 py-1.5 text-left hover:bg-slate-50 ${
              activeStyle === name ? "bg-slate-100 font-medium" : ""
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {mapReady &&
        markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.position[1]}
            latitude={marker.position[0]}
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setSelectedMarker(marker);
            }}
          >
            <span
              style={{
                display: "block",
                width: 16,
                height: 16,
                borderRadius: 9999,
                background: markerColor[marker.type],
                border: "2px solid white",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                cursor: "pointer",
              }}
            />
          </Marker>
        ))}

      {mapReady && selectedMarker && (
        <Popup
          longitude={selectedMarker.position[1]}
          latitude={selectedMarker.position[0]}
          anchor="bottom"
          offset={12}
          closeOnClick={false}
          onClose={() => setSelectedMarker(null)}
        >
          {selectedMarker.label}
        </Popup>
      )}
    </Map>
  );
}
