"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

function buildIcon(type: LiveMapMarkerType) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${markerColor[type]};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const center: [number, number] = [10.2531, 123.9495];

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

export default function LiveMap({
  markers = defaultMarkers,
  center: mapCenter = center,
  zoom = 14,
}: LiveMapProps) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={buildIcon(marker.type)}
        >
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
