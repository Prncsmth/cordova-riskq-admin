"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
const defaultIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CORDOVA_CENTER: [number, number] = [10.2531, 123.9495];

const emergencyLocations = [
  {
    id: 1,
    name: "Barangay Gabi",
    position: [10.2525, 123.948] as [number, number],
    status: "Active Emergency",
  },
  {
    id: 2,
    name: "Cordova Municipal Hall",
    position: [10.2565, 123.9498] as [number, number],
    status: "Responder",
  },
];

export default function LiveMapPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Live Map
          </h2>

          <p className="text-sm text-slate-500">
            Monitor active responders and incidents
          </p>
        </div>

        <span className="flex items-center gap-2 text-sm font-medium text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live
        </span>
      </div>

      {/* Leaflet Map */}
      <div className="h-`130` w-full">
        <MapContainer
          center={CORDOVA_CENTER}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {emergencyLocations.map((location) => (
            <Marker
              key={location.id}
              position={location.position}
              icon={defaultIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {location.name}
                  </h3>

                  <p className="text-sm">
                    {location.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}