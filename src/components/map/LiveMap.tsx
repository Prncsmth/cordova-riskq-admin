"use client";

import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
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
  Search,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import "mapbox-gl/dist/mapbox-gl.css";

export type LiveMapMarkerType = "incident" | "responder" | "evacuation";

import { useSidebar } from "@/components/layout/SidebarContext";
import { CORDOVA_BARANGAYS, CORDOVA_CENTER, CORDOVA_MAP_BOUNDS } from "@/lib/cordovaBarangays";
import cordovaBoundary from "@/lib/cordovaBoundary.geojson.json";

export type LiveMapMarker = {
  id: string;
  position: [number, number];
  label: string;
  type: LiveMapMarkerType;
};

export const markerConfig: Record<LiveMapMarkerType, { icon: LucideIcon; color: string; label: string }> = {
  incident: { icon: Siren, color: "#dc2626", label: "Active Incidents" },
  responder: { icon: ShieldCheck, color: "#b45309", label: "Responders" },
  evacuation: { icon: Building2, color: "#1e8e3e", label: "Evacuation Centers" },
};

// Evacuation centers have no admin detail page yet, so their markers get no link.
function detailHref(marker: LiveMapMarker): string | null {
  if (marker.type === "incident") return `/emergencies/${marker.id}`;
  if (marker.type === "responder") return `/responders/${marker.id}`;
  return null;
}

const center: [number, number] = [CORDOVA_CENTER.latitude, CORDOVA_CENTER.longitude];

// Keeps the map locked to Cordova, Cebu — no panning/zooming out to other areas.
const CORDOVA_BOUNDS = CORDOVA_MAP_BOUNDS;

const mapStyles: Record<string, { url: string; icon: LucideIcon }> = {
  Road: { url: "mapbox://styles/mapbox/streets-v12", icon: MapIcon },
  Satellite: { url: "mapbox://styles/mapbox/satellite-streets-v12", icon: Satellite },
  Terrain: { url: "mapbox://styles/mapbox/outdoors-v12", icon: Mountain },
  Night: { url: "mapbox://styles/mapbox/dark-v11", icon: Moon },
};

type MapStyleName = keyof typeof mapStyles;

type LiveMapProps = {
  markers?: LiveMapMarker[];
  center?: [number, number];
  zoom?: number;
  // Hides the floating layers/zoom/recenter controls — for small embedded
  // previews (e.g. the dashboard card) where those controls have no room to
  // breathe and just duplicate what the full /live-map page already offers.
  controls?: boolean;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function LiveMap({
  markers = [],
  center: mapCenter = center,
  zoom = 14,
  controls = true,
}: LiveMapProps) {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { collapsed } = useSidebar();
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showBarangayMenu, setShowBarangayMenu] = useState(false);
  const [barangayQuery, setBarangayQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStyle, setActiveStyle] = useState<MapStyleName>("Road");
  const [visibleTypes, setVisibleTypes] = useState<Record<LiveMapMarkerType, boolean>>({
    incident: true,
    responder: true,
    evacuation: true,
  });
  const [selectedMarker, setSelectedMarker] = useState<LiveMapMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [minZoom, setMinZoom] = useState(13);

  const filteredBarangays = CORDOVA_BARANGAYS.filter((b) =>
    b.name.toLowerCase().includes(barangayQuery.trim().toLowerCase())
  );

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

  // Tracks fullscreen state from the browser itself, not just our own
  // toggle -- the user can also exit via Esc, which only fires this event,
  // never our button's onClick. Also resizes the map canvas once the
  // fullscreen transition's layout settles, same reasoning as the
  // sidebar-collapse effect above.
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
      setTimeout(() => mapRef.current?.getMap()?.resize(), 80);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background p-4 text-center text-sm text-muted">
        Missing NEXT_PUBLIC_MAPBOX_TOKEN — set it in .env.local to load the map.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
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
        {/* Cordova municipal boundary -- subtle fill + outline so it reads
            as context, not a block over markers/roads underneath. Same
            source data and tide-teal accent as the mobile app's own
            showCordovaBoundary (constants/cordovaBoundary.geojson.json),
            for visual consistency between the two. */}
        <Source id="cordova-boundary" type="geojson" data={cordovaBoundary}>
          <Layer
            id="cordova-boundary-fill"
            type="fill"
            paint={{ "fill-color": "#0e7b86", "fill-opacity": 0.06 }}
          />
          <Layer
            id="cordova-boundary-line"
            type="line"
            paint={{ "line-color": "#0e7b86", "line-width": 2 }}
          />
        </Source>

        {/* Zoom + recenter controls, grouped bottom-right like a native map app */}
        {controls && (
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface shadow-md transition-all duration-150 hover:scale-105 active:scale-95"
            >
              <MapPin size={18} strokeWidth={2} className="text-primary" fill="currentColor" fillOpacity={0.15} />
            </button>

            <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-md">
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => mapRef.current?.getMap().zoomIn({ duration: 200 })}
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-primary-light/40 active:scale-90"
              >
                <Plus size={17} strokeWidth={2.5} />
              </button>
              <div className="h-px bg-border/70" />
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
        )}

        {/* Layers control — basemap style + data layer visibility */}
        {controls && (
        <div className="absolute left-4 top-4 z-50">
          <button
            aria-label="Map layers and filters"
            onClick={() => setShowLayerMenu((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface text-foreground shadow-md transition-all duration-150 hover:scale-105 active:scale-95"
          >
            <Layers size={20} strokeWidth={2.25} />
          </button>

          {showLayerMenu && (
            <div className="mt-2 w-56 overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-md">
              <p className="px-3.5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-text-tertiary">
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
                      <StyleIcon size={15} strokeWidth={2.5} className="shrink-0" />
                      <span className="flex-1">{name}</span>
                      {active && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>

              <p className="border-t border-border/70 px-3.5 pt-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-text-tertiary">
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
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: config.color }}
                      >
                        <Icon size={13} color="white" strokeWidth={2.5} />
                      </span>
                      <span className="flex-1">
                        {config.label} <span className="text-text-tertiary">({count})</span>
                      </span>
                      <span
                        className={`relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ${
                          on ? "bg-primary" : "bg-border"
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
        )}

        {/* Jump to barangay -- quick-access search, direct-click like the
            always-visible toolbar buttons on reference map tools, scoped to
            what's actually useful for dispatch: finding a barangay fast
            instead of manually panning. */}
        {controls && (
        <div className="absolute left-16 top-4 z-50">
          <button
            aria-label="Jump to barangay"
            onClick={() => setShowBarangayMenu((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface text-foreground shadow-md transition-all duration-150 hover:scale-105 active:scale-95"
          >
            <Search size={18} strokeWidth={2.25} />
          </button>

          {showBarangayMenu && (
            <div className="mt-2 w-56 overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-md">
              <div className="border-b border-border/70 p-2">
                <input
                  autoFocus
                  value={barangayQuery}
                  onChange={(e) => setBarangayQuery(e.target.value)}
                  placeholder="Search barangay..."
                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-primary"
                />
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {filteredBarangays.length === 0 ? (
                  <p className="px-3.5 py-3 text-center text-xs text-muted">No matches.</p>
                ) : (
                  filteredBarangays.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        mapRef.current?.getMap().flyTo({
                          center: [b.longitude, b.latitude],
                          zoom: 16,
                          duration: 800,
                        });
                        setShowBarangayMenu(false);
                        setBarangayQuery("");
                      }}
                      className="block w-full px-3.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-primary-light/30"
                    >
                      {b.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Fullscreen -- for a dispatch wall/monitor setup */}
        {controls && (
        <div className="absolute right-4 top-4 z-50">
          <button
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={toggleFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface text-foreground shadow-md transition-all duration-150 hover:scale-105 active:scale-95"
          >
            {isFullscreen ? (
              <Minimize2 size={18} strokeWidth={2.25} />
            ) : (
              <Maximize2 size={18} strokeWidth={2.25} />
            )}
          </button>
        </div>
        )}

        {mapReady &&
          visibleMarkers.map((marker) => {
            const config = markerConfig[marker.type];
            const Icon = config.icon;

            return (
              <Marker
                key={marker.id}
                longitude={marker.position[1]}
                latitude={marker.position[0]}
                anchor={marker.type === "responder" ? "center" : "bottom"}
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  setSelectedMarker(marker);
                }}
              >
                {marker.type === "responder" ? (
                  // Branded responder marker -- literally just the app logo,
                  // circularly cropped, no pin shape or border. anchor is
                  // "center" above (not "bottom" like the teardrop pins)
                  // since a plain circle's center is the exact coordinate.
                  <button
                    type="button"
                    aria-label={marker.label}
                    className="relative block h-8 w-8 overflow-hidden rounded-full drop-shadow-md transition-transform duration-150 hover:scale-110"
                  >
                    <Image src="/images/logo.png" alt="" fill sizes="32px" className="object-cover" />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label={marker.label}
                    className="group relative block"
                    style={{ width: 32, height: 32 }}
                  >
                    {marker.type === "incident" && (
                      <span
                        className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 animate-ping rounded-full opacity-50"
                        style={{ background: config.color }}
                      />
                    )}
                    {/* Teardrop pin -- category color fill with a thin white
                        outline for definition against the map, white icon.
                        Single closed path so the outline traces one clean
                        outer silhouette with no seam. anchor="bottom" on the
                        Marker means the tip (bottom of the path) is the exact
                        coordinate. */}
                    <svg
                      width={32}
                      height={32}
                      viewBox="0 0 24 24"
                      className="absolute inset-0 origin-bottom drop-shadow-md transition-transform duration-150 group-hover:scale-110"
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                        fill={config.color}
                        stroke="white"
                        strokeWidth={1.5}
                      />
                    </svg>
                    <div
                      className="pointer-events-none absolute left-0 top-0 flex items-center justify-center"
                      style={{ width: 32, height: 22 }}
                    >
                      <Icon size={14} color="white" strokeWidth={2.25} />
                    </div>
                  </button>
                )}
              </Marker>
            );
          })}

        {selectedMarker && (
          <Popup
            longitude={selectedMarker.position[1]}
            latitude={selectedMarker.position[0]}
            anchor="bottom"
            offset={36}
            closeButton
            closeOnClick={false}
            onClose={() => setSelectedMarker(null)}
          >
            <div className="min-w-[160px] py-0.5">
              <div className="flex items-center gap-2 pr-2">
                {selectedMarker.type === "responder" ? (
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                    <Image src="/images/logo.png" alt="" fill sizes="28px" className="object-cover" />
                  </div>
                ) : (
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: markerConfig[selectedMarker.type].color }}
                  >
                    {(() => {
                      const Icon = markerConfig[selectedMarker.type].icon;
                      return <Icon size={14} color="white" strokeWidth={2.5} />;
                    })()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{selectedMarker.label}</p>
                  <p className="text-[11px] capitalize text-muted">{selectedMarker.type}</p>
                </div>
              </div>

              {detailHref(selectedMarker) && (
                <Link
                  href={detailHref(selectedMarker)!}
                  className="mt-2 block rounded-lg bg-primary py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  View Details
                </Link>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
