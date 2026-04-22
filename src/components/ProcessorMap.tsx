import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
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
              <span className="w-3 h-3 rounded-full" style={{ background: '#E97638' }} />
              <span className="text-stone-700 font-medium">Farmshare network</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#2D5A3D' }} />
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

  // Auto-fit bounds. For US-wide views, fit to continental-US bounds instead
  // of including Alaska/Hawaii/territories. For narrower queries (state page,
  // filter, near me), fit tightly to the markers plus the user's location.
  useEffect(() => {
    if (!map || points.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const useConus = points.length > 50 && !userLocation;
    if (useConus) {
      bounds.extend({ lat: CONUS_BOUNDS.north, lng: CONUS_BOUNDS.west });
      bounds.extend({ lat: CONUS_BOUNDS.south, lng: CONUS_BOUNDS.east });
    } else {
      points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      if (userLocation) bounds.extend(userLocation);
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
            background={p.status === 'customer' ? '#E97638' : '#2D5A3D'}
            borderColor={p.status === 'customer' ? '#B8541F' : '#1F3F2A'}
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
        >
          <div className="p-1 min-w-[220px] max-w-[260px]">
            <div className="flex items-start gap-3 mb-2">
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

            <div className="flex items-center text-[11px] text-stone-600 mb-2">
              {selected.status === 'customer' ? (
                <>
                  <Calendar className="h-3 w-3 mr-1 text-brand-orange" />
                  Online scheduling available
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 mr-1 text-brand-green" />
                  Independent processor
                </>
              )}
            </div>

            <Link
              to={`/find-a-processor/${selected.slug}`}
              className="inline-flex items-center text-xs font-bold text-brand-orange hover:underline"
            >
              View details <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
