"use client"

import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// SUT campus center
const SUT_CENTER: [number, number] = [14.8804616, 102.0161729];

const pickerIcon = L.divIcon({
  html: renderToString(
    <div className="relative text-brand-primary drop-shadow-md cursor-grab active:cursor-grabbing">
      <MapPin size={32} fill="currentColor" fillOpacity={0.25} />
    </div>
  ),
  className: "custom-div-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface ClickHandlerProps {
  onPick: (lat: number, lng: number) => void;
}

function ClickHandler({ onPick }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapPickerProps {
  lat?: number | null;
  lng?: number | null;
  onPick: (lat: number, lng: number) => void;
  height?: string;
}

export default function MapPicker({ lat, lng, onPick, height = "200px" }: MapPickerProps) {
  const markerRef = useRef<L.Marker | null>(null);

  const position: [number, number] | null =
    lat != null && lng != null ? [lat, lng] : null;

  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (marker) {
      const { lat, lng } = marker.getLatLng();
      onPick(lat, lng);
    }
  }, [onPick]);

  return (
    <MapContainer
      center={position ?? SUT_CENTER}
      zoom={16}
      style={{ height, width: "100%", borderRadius: "6px" }}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {position && (
        <Marker
          position={position}
          icon={pickerIcon}
          draggable={true}
          ref={markerRef}
          eventHandlers={{ dragend: handleDragEnd }}
        />
      )}
    </MapContainer>
  );
}
