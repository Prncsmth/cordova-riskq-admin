"use client";

import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { LngLatBoundsLike } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

export type LiveMapMarkerType = "incident" | "responder" | "evacuation";

import { useSidebar } from "@/components/layout/SidebarContext";
import { ThemeToggle } from "@/components/layout/ThemeProvider";
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
  Night: "mapbox://styles/mapbox/dark-v11",
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
  const { collapsed } = useSidebar();
  const [showStyleMenu, setShowStyleMenu] = useState(false);
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

  // When the sidebar collapses/expands, Mapbox can end up with an incorrect
  // canvas size. Trigger a resize so the map reflows to the new viewport.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    // small delay lets layout finish before resize
    const id = setTimeout(() => map.resize(), 80);
    return () => clearTimeout(id);
  }, [collapsed]);

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

        {/* Map layer icon + style menu */}
        <div className="absolute left-4 top-4 z-50">
          <button
            aria-label="Map layers"
            onClick={() => setShowStyleMenu((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white p-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline">
              <path d="M12 2l9 4-9 4-9-4 9-4z"></path>
              <path d="M12 10l9 4-9 4-9-4 9-4z"></path>
              <path d="M12 18l9 4-9 0-9-4 9 0z"></path>
            </svg>
          </button>

          {showStyleMenu && (
            <div className="mt-2 overflow-hidden rounded-md border border-border bg-white text-xs shadow-sm">
              {(Object.keys(mapStyles) as MapStyleName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setActiveStyle(name);
                    setShowStyleMenu(false);
                  }}
                  className={`block w-40 px-3 py-2 text-left hover:bg-slate-50 ${
                    activeStyle === name ? "bg-slate-100 font-medium" : ""
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="absolute right-16 top-4 z-50 lg:hidden">
          <ThemeToggle />
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
                // ignore text/show only marker — do not open popup
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
      </Map>
  );
}
