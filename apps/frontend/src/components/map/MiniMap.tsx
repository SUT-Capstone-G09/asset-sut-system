"use client"

import { MapContainer as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

const customIcon = L.divIcon({
  html: renderToString(
    <div className="relative text-[#f26522] drop-shadow-sm">
      <MapPin size={28} fill="currentColor" fillOpacity={0.15} />
    </div>
  ),
  className: "custom-div-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

interface MiniMapProps {
  coordinates: [number, number];
}

export default function MiniMap({ coordinates }: MiniMapProps) {
  return (
    <LeafletMap
      center={coordinates}
      zoom={17}
      className="h-full w-full rounded-2xl border border-slate-100"
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      dragging={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coordinates} icon={customIcon} />
    </LeafletMap>
  );
}
