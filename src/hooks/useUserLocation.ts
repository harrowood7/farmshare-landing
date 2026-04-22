import { useCallback, useState } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
}

interface State {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

export function useUserLocation() {
  const [state, setState] = useState<State>({ location: null, loading: false, error: null });

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ location: null, loading: false, error: 'Geolocation not supported in this browser.' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState({
          location: null,
          loading: false,
          error: err.message || 'Unable to get your location.',
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const clear = useCallback(() => {
    setState({ location: null, loading: false, error: null });
  }, []);

  return { ...state, request, clear };
}

/** Haversine distance in miles between two lat/lng points. */
export function distanceMiles(a: UserLocation, b: { lat: number; lng: number }): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
