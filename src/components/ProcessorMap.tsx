import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { MapPin, Calendar, ChevronRight, CheckCircle2, Send, X } from 'lucide-react';
import type { Processor } from '../data/processors';

interface Props {
  processors: Processor[];
  userLocation?: { lat: number; lng: number } | null;
  /** Clamp max zoom level when auto-fitting to markers (1 marker => zooms too far). */
  maxZoomOnFit?: number;
}

const DEFAULT_CENTER = { lat: 39.5, lng: -98.35 };
const DEFAULT_ZOOM = 4;

// Continental US bounding box — used to clamp the default view so we
// don't auto-zoom out to include Alaska/Hawaii/territories.
const CONUS_BOUNDS = {
  north: 49.5, // US/Canada border
  south: 24.5, // Southern tip of Florida
  west: -125.0, // West coast
  east: -66.5,  // East coast
};

export default function ProcessorMap({ processors, userLocation, maxZoomOnFit = 10 }: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const points = useMemo(
    () =>
      processors.filter(
        (p): p is Processor & { lat: number; lng: number } =>
          typeof p.lat === 'number' && typeof p.lng === 'number'
      ),
    [processors]
  );

  if (!apiKey) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-stone-600">
        Map unavailable — missing <code>VITE_GOOGLE_MAPS_API_KEY</code>.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative rounded-lg overflow-hidden shadow-md" style={{ height: '600px' }}>
        <Map
          mapId={(import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) || 'DEMO_MAP_ID'}
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
        >
          <ClusteredMarkers points={points} userLocation={userLocation} maxZoomOnFit={maxZoomOnFit} />
        </Map>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-md px-3 py-2 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#2D5A3D' }} />
              <span className="text-stone-700 font-medium">Farmshare network</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#A8A29E' }} />
              <span className="text-stone-700 font-medium">Independent</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#2563EB' }} />
                <span className="text-stone-700 font-medium">You</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </APIProvider>
  );
}

interface ClusteredProps {
  points: (Processor & { lat: number; lng: number })[];
  userLocation?: { lat: number; lng: number } | null;
  maxZoomOnFit: number;
}

function ClusteredMarkers({ points, userLocation, maxZoomOnFit }: ClusteredProps) {
  const map = useMap();
  const [selected, setSelected] = useState<(Processor & { lat: number; lng: number }) | null>(null);
  const [markers, setMarkers] = useState<Record<string, Marker>>({});

  const clusterer = useMemo(() => {
    if (!map) return null;
    return new MarkerClusterer({ map });
  }, [map]);

  useEffect(() => {
    if (!clusterer) return;
    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);

  const setMarkerRef = useCallback((marker: Marker | null, key: string) => {
    setMarkers((prev) => {
      if ((marker && prev[key]) || (!marker && !prev[key])) return prev;
      if (marker) return { ...prev, [key]: marker };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Stable per-slug ref callbacks — avoids React unmount/remount loop from
  // inline arrow functions creating a new ref each render.
  const refCache = useRef<Record<string, (m: Marker | null) => void>>({});
  const getRef = useCallback(
    (slug: string) => {
      if (!refCache.current[slug]) {
        refCache.current[slug] = (m) => setMarkerRef(m, slug);
      }
      return refCache.current[slug];
    },
    [setMarkerRef]
  );

  // Auto-fit bounds. Three modes:
  // 1. User location known → fit to user + nearest 10 markers (regional zoom).
  // 2. >50 markers, no user location → continental-US clamp.
  // 3. ≤50 markers, no user location → fit all markers tightly.
  useEffect(() => {
    if (!map || points.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    if (userLocation) {
      const ranked = [...points].sort((a, b) => {
        const da = (a.lat - userLocation.lat) ** 2 + (a.lng - userLocation.lng) ** 2;
        const db = (b.lat - userLocation.lat) ** 2 + (b.lng - userLocation.lng) ** 2;
        return da - db;
      });
      ranked.slice(0, 10).forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      bounds.extend(userLocation);
    } else if (points.length > 50) {
      bounds.extend({ lat: CONUS_BOUNDS.north, lng: CONUS_BOUNDS.west });
      bounds.extend({ lat: CONUS_BOUNDS.south, lng: CONUS_BOUNDS.east });
    } else {
      points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    }
    map.fitBounds(bounds, 40);

    // Clamp zoom on next idle so single-point bounds don't zoom to street level
    const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
      const z = map.getZoom();
      if (z !== undefined && z > maxZoomOnFit) map.setZoom(maxZoomOnFit);
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, points, userLocation, maxZoomOnFit]);

  return (
    <>
      {points.map((p) => (
        <AdvancedMarker
          key={p.slug}
          position={{ lat: p.lat, lng: p.lng }}
          ref={getRef(p.slug)}
          onClick={() => setSelected(p)}
        >
          <Pin
            background={p.status === 'customer' ? '#2D5A3D' : '#A8A29E'}
            borderColor={p.status === 'customer' ? '#1F3F2A' : '#78716C'}
            glyphColor="#FFFFFF"
          />
        </AdvancedMarker>
      ))}

      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div
            className="rounded-full border-2 border-white shadow-lg"
            style={{ width: 18, height: 18, background: '#2563EB' }}
          />
        </AdvancedMarker>
      )}

      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
          pixelOffset={[0, -40]}
          headerDisabled
        >
          <div className="relative min-w-[230px] max-w-[270px]">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute top-0 right-0 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 mb-2 pr-6">
              {selected.logo && (
                <img
                  src={selected.logo}
                  alt={selected.name}
                  className="w-10 h-10 rounded object-contain flex-shrink-0 bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-brand-green text-sm leading-tight">{selected.name}</h3>
                <div className="flex items-center text-stone-500 text-xs mt-0.5">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  {selected.location}
                </div>
                {selected.status === 'customer' && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-green mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Online scheduling
                  </div>
                )}
              </div>
            </div>

            {selected.species.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selected.species.slice(0, 4).map((s) => (
                  <span key={s} className="bg-brand-orange/10 text-brand-orange text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}

            <Link
              to={`/find-a-processor/${selected.slug}`}
              className={`flex items-center justify-between text-xs font-semibold rounded-md px-2 py-1.5 transition-colors ${
                selected.status === 'customer'
                  ? 'bg-brand-green text-white hover:bg-brand-green/90'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span className="inline-flex items-center">
                {selected.status === 'customer' ? (
                  <>
                    <Calendar className="h-3 w-3 mr-1.5" />
                    Book now
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1.5" />
                    Send scheduling request
                  </>
                )}
              </span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
