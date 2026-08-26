"use client";

import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import {
  Layers,
  Map as MapIcon,
  Satellite,
  Mountain,
  Moon,
  Check,
  Siren,
  ShieldCheck,
  Building2,
  Plus,
  Minus,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import "mapbox-gl/dist/mapbox-gl.css";

export type LiveMapMarkerType = "incident" | "responder" | "evacuation";

import { useSidebar } from "@/components/layout/SidebarContext";
import { ThemeToggle } from "@/components/layout/ThemeProvider";
import { CORDOVA_BARANGAYS, CORDOVA_CENTER, CORDOVA_MAP_BOUNDS, jitter } from "@/lib/cordovaBarangays";

export type LiveMapMarker = {
  id: string;
  position: [number, number];
  label: string;
  type: LiveMapMarkerType;
};

export const markerConfig: Record<LiveMapMarkerType, { icon: LucideIcon; color: string; label: string }> = {
  incident: { icon: Siren, color: "#dc2626", label: "Active Incidents" },
  responder: { icon: ShieldCheck, color: "#1d4ed8", label: "Responders" },
  evacuation: { icon: Building2, color: "#1e8e3e", label: "Evacuation Centers" },
};

const center: [number, number] = [CORDOVA_CENTER.latitude, CORDOVA_CENTER.longitude];

// Keeps the map locked to Cordova, Cebu — no panning/zooming out to other areas.
const CORDOVA_BOUNDS = CORDOVA_MAP_BOUNDS;

function barangay(id: string) {
  const found = CORDOVA_BARANGAYS.find((b) => b.id === id);
  if (!found) throw new Error(`Unknown Cordova barangay: ${id}`);
  return found;
}

const mapStyles: Record<string, { url: string; icon: LucideIcon }> = {
  Road: { url: "mapbox://styles/mapbox/streets-v12", icon: MapIcon },
  Satellite: { url: "mapbox://styles/mapbox/satellite-streets-v12", icon: Satellite },
  Terrain: { url: "mapbox://styles/mapbox/outdoors-v12", icon: Mountain },
  Night: { url: "mapbox://styles/mapbox/dark-v11", icon: Moon },
};

type MapStyleName = keyof typeof mapStyles;

// Mock markers for UI — replace with real API data once backend endpoints are available.
// Positions are the real barangay coordinates (see lib/cordovaBarangays) with
// a small deterministic jitter, so e.g. the Gabi Evacuation Center actually
// plots inside Gabi rather than a arbitrary nearby point.
export const defaultMarkers: LiveMapMarker[] = [
  { id: "inc-1", position: jitter(barangay("poblacion"), 0), label: "Fire Incident — Poblacion", type: "incident" },
  { id: "inc-2", position: jitter(barangay("san-miguel"), 1), label: "Road Accident — San Miguel", type: "incident" },
  { id: "res-1", position: jitter(barangay("catarman"), 2), label: "Responder — Juan Dela Cruz", type: "responder" },
  { id: "res-2", position: jitter(barangay("day-as"), 3), label: "Responder — Maria Garcia", type: "responder" },
  { id: "evac-1", position: jitter(barangay("gabi"), 4), label: "Gabi Evacuation Center", type: "evacuation" },
  { id: "evac-2", position: jitter(barangay("poblacion"), 5), label: "Poblacion Evacuation Center", type: "evacuation" },
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
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [activeStyle, setActiveStyle] = useState<MapStyleName>("Road");
  const [visibleTypes, setVisibleTypes] = useState<Record<LiveMapMarkerType, boolean>>({
    incident: true,
    responder: true,
    evacuation: true,
  });
  const [selectedMarker, setSelectedMarker] = useState<LiveMapMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [minZoom, setMinZoom] = useState(13);

  const visibleMarkers = markers.filter((marker) => visibleTypes[marker.type]);

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
      <div className="flex h-full w-full items-center justify-center bg-background p-4 text-center text-sm text-muted">
        Missing NEXT_PUBLIC_MAPBOX_TOKEN — set it in .env.local to load the map.
      </div>
    );
  }

  return (
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyles[activeStyle].url}
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
        {/* Zoom + recenter controls, grouped bottom-right like a native map app */}
        <div className="absolute bottom-6 right-4 z-40 flex flex-col items-center gap-2.5">
          <button
            type="button"
            aria-label="Recenter on Cordova"
            title="Recenter on Cordova"
            onClick={() => {
              mapRef.current?.getMap().flyTo({
                center: [CORDOVA_CENTER.longitude, CORDOVA_CENTER.latitude],
                zoom,
                duration: 800,
              });
            }}
            className="glass-strong flex h-10 w-10 items-center justify-center rounded-full border border-(--glass-border) shadow-md transition-all duration-150 hover:scale-105 active:scale-95"
          >
            <MapPin size={18} strokeWidth={2} className="text-primary" fill="currentColor" fillOpacity={0.15} />
          </button>

          <div className="glass-strong flex flex-col overflow-hidden rounded-2xl border border-(--glass-border) shadow-md">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => mapRef.current?.getMap().zoomIn({ duration: 200 })}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-primary-light/40 active:scale-90"
            >
              <Plus size={17} strokeWidth={2.5} />
            </button>
            <div className="h-px bg-(--glass-border)" />
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => mapRef.current?.getMap().zoomOut({ duration: 200 })}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-primary-light/40 active:scale-90"
            >
              <Minus size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Layers control — basemap style + data layer visibility */}
        <div className="absolute left-4 top-4 z-50">
          <button
            aria-label="Map layers"
            onClick={() => setShowLayerMenu((s) => !s)}
            className="glass-strong flex h-10 w-10 items-center justify-center rounded-full border border-(--glass-border) text-foreground shadow-md transition-all duration-150 hover:scale-105 active:scale-95"
          >
            <Layers size={18} strokeWidth={2} />
          </button>

          {showLayerMenu && (
            <div className="glass-strong mt-2 w-56 overflow-hidden rounded-2xl border border-(--glass-border) shadow-lg">
              <p className="px-3.5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Map Style
              </p>

              <div className="pb-1">
                {(Object.keys(mapStyles) as MapStyleName[]).map((name) => {
                  const StyleIcon = mapStyles[name].icon;
                  const active = activeStyle === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setActiveStyle(name)}
                      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                        active ? "bg-primary-light/60 text-primary" : "text-foreground hover:bg-primary-light/30"
                      }`}
                    >
                      <StyleIcon size={14} strokeWidth={2.25} className="shrink-0" />
                      <span className="flex-1">{name}</span>
                      {active && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>

              <p className="border-t border-(--glass-border) px-3.5 pt-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Show on Map
              </p>

              <div className="pb-1.5">
                {(Object.keys(markerConfig) as LiveMapMarkerType[]).map((type) => {
                  const config = markerConfig[type];
                  const Icon = config.icon;
                  const count = markers.filter((m) => m.type === type).length;
                  const on = visibleTypes[type];

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }))}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-primary-light/30"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: config.color }}
                      >
                        <Icon size={11} color="white" strokeWidth={2.5} />
                      </span>
                      <span className="flex-1">
                        {config.label} <span className="text-muted">({count})</span>
                      </span>
                      <span
                        className={`relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ${
                          on ? "bg-linear-to-b from-primary to-primary-dark" : "bg-border"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            on ? "translate-x-[17px]" : "translate-x-0.5"
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="glass-strong absolute bottom-6 left-4 z-40 hidden rounded-2xl border border-(--glass-border) px-3.5 py-3 shadow-md sm:block">
          <div className="space-y-1.5">
            {(Object.keys(markerConfig) as LiveMapMarkerType[]).map((type) => {
              const config = markerConfig[type];
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 ring-white"
                    style={{ background: config.color }}
                  >
                    <Icon size={11} color="white" strokeWidth={2.5} />
                  </span>
                  {config.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* AdminHeader is hidden on this fullscreen route, so this is the
            only theme toggle reachable here — keep it visible at all sizes. */}
        <div className="glass-strong absolute right-4 top-4 z-50 rounded-full border border-(--glass-border) shadow-md">
          <ThemeToggle />
        </div>

        {mapReady &&
          visibleMarkers.map((marker) => {
            const config = markerConfig[marker.type];
            const Icon = config.icon;

            return (
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
                <button
                  type="button"
                  aria-label={marker.label}
                  className="group relative flex h-8 w-8 items-center justify-center"
                >
                  {marker.type === "incident" && (
                    <span
                      className="absolute inline-flex h-8 w-8 animate-ping rounded-full opacity-40"
                      style={{ background: config.color }}
                    />
                  )}
                  <span
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-transform duration-150 group-hover:scale-110"
                    style={{ background: config.color }}
                  >
                    <Icon size={15} color="white" strokeWidth={2.5} />
                  </span>
                </button>
              </Marker>
            );
          })}

        {selectedMarker && (
          <Popup
            longitude={selectedMarker.position[1]}
            latitude={selectedMarker.position[0]}
            anchor="bottom"
            offset={20}
            closeButton
            closeOnClick={false}
            onClose={() => setSelectedMarker(null)}
          >
            <div className="flex items-center gap-2 py-0.5 pr-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: markerConfig[selectedMarker.type].color }}
              >
                {(() => {
                  const Icon = markerConfig[selectedMarker.type].icon;
                  return <Icon size={13} color="white" strokeWidth={2.5} />;
                })()}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{selectedMarker.label}</p>
                <p className="text-[11px] capitalize text-muted">{selectedMarker.type}</p>
              </div>
            </div>
          </Popup>
        )}
      </Map>
  );
}
