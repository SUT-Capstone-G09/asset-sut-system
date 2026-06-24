"use client"

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { Location } from '@/features/areas/types/location';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

const customIcon = L.divIcon({
  html: renderToString(
    <div className="relative text-[#f26522] hover:scale-115 transition-all duration-200 cursor-pointer drop-shadow-sm">
      {/* Teardrop Pin */}
      <MapPin size={24} fill="currentColor" fillOpacity={0.15} />
    </div>
  ),
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 24], // Anchor bottom-center (tip of the pin)
});

interface MapContainerProps {
  locations: Location[];
}

export default function MapContainer({ locations }: MapContainerProps) {
  const router = useRouter()

  return (
    <LeafletMap
      center={[14.8817715, 102.0206962]}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={true}
      touchZoom={true}
      boxZoom={false}
      keyboard={false}
      minZoom={14}
      maxZoom={20}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ZoomControl position="bottomright" />

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.coordinates}
          icon={customIcon}
          eventHandlers={{
            click: (e) => {
              e.target.openPopup();
            },
            mouseover: (e) => {
              e.target.openPopup();
            },
          }}
        >
          <Popup className="custom-popup">
            <div className="w-44 overflow-hidden rounded-t-[4px]">
              {/* Row 1: Small Image (top) */}
              <div className="h-16 w-full overflow-hidden">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Row 2: Text Details */}
              <div className="p-2.5">
                  <h3 className="font-bold text-gray-900 text-xs leading-snug">
                    {loc.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {loc.category}
                  </p>
                </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
}