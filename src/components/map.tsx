'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/lib/definitions';

interface ReactLeafletModule {
  MapContainer: typeof import('react-leaflet').MapContainer;
  TileLayer: typeof import('react-leaflet').TileLayer;
  Marker: typeof import('react-leaflet').Marker;
  Popup: typeof import('react-leaflet').Popup;
}

export default function Map({
  locations,
  initialPosition
}: {
  locations?: Location[];
  initialPosition?: [number, number]
}) {
  const [MapComponents, setMapComponents] = useState<ReactLeafletModule | null>(null);
  const [map, setMap] = useState<any>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Dynamically load react-leaflet components
  useEffect(() => {
    import('react-leaflet').then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        Marker: mod.Marker,
        Popup: mod.Popup,
      });
    });
  }, []);

  // Read initial position from URL or use defaults
  const initialCenter: [number, number] =
    (searchParams.get('c')?.split(',').map(Number) as [number, number])
    || initialPosition
    || [37.7749, -122.4149];
  const initialZoom = parseFloat(searchParams.get('z') || '18');

  // Ensure URL has initial parameters on mount
  useEffect(() => {
    if (!searchParams.get('c')) {
      handleUpdateURL();
    }
  }, []);

  // Debounced URL update handler
  const handleUpdateURL = useDebouncedCallback(() => {
    if (!map) return;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bounds = map.getBounds().toBBoxString();
    const params = new URLSearchParams(window.location.search);
    
    params.set('c', `${center.lat.toFixed(6)},${center.lng.toFixed(6)}`);
    params.set('z', zoom.toString());
    params.set('bb', bounds)

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // Attach map event listeners
  useEffect(() => {
    if (!map) return;

    map.on('moveend', handleUpdateURL);
    map.on('zoomend', handleUpdateURL);

    return () => {
      map.off('moveend', handleUpdateURL);
      map.off('zoomend', handleUpdateURL);
    };
  }, [map, handleUpdateURL]);

  if (!MapComponents) {
    return <p>Loading map...</p>;
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      minZoom={4}
      className="z-0"
      worldCopyJump={true}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      {locations?.map((location) => (
        <Marker
          key={location.location_id}
          position={location.geom.coordinates}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold">{location.location_id}</p>
              <p>{location.geom.coordinates.join(', ')}</p>
              <p>Check-ins: {location.checkin_count}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}