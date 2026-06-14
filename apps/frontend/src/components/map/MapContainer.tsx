"use client"

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { mockLocations } from '@/features/areas/data/locations';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

const customIcon = L.divIcon({
  html: renderToString(
    <div className='text-[#f26522] drop-shadow-md'>
      <MapPin size={32} fill="currentColor" fillOpacity={0.2} />
    </div>
  ),
  className: "custom-div-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

export default function MapContainer() {
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

      {mockLocations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.coordinates}
          icon={customIcon}
          eventHandlers={{
            click: () => {
              router.push(`/location/${loc.id}`);
            },
            mouseover: (e) => {
              e.target.openPopup();
            },
          }}
        >
          <Popup className="custom-popup">
            <div
              className="
                  w-40 
                  overflow-hidden 
                  rounded-lg
                "
            >
              <div className="h-20 w-full overflow-hidden">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="
                      w-full h-full 
                      object-cover 
                      transition-transform duration-500 
                      hover:scale-110
                    "
                />
              </div>
              <div className="p-2">
                <h3
                  className="
                      font-bold 
                      text-gray-900 
                      text-[11px] 
                      leading-tight
                    "
                >
                  {loc.name}
                </h3>

                <button
                  className="
                      mt-2 
                      w-full 
                      py-1.5 
                      rounded-md 
                      text-[10px] 
                      font-semibold 
                      transition-colors 
                      shadow-sm
                      bg-[#f26522] 
                      text-white 
                      hover:bg-[#d8561d]
                    "
                  onClick={() => router.push(`/location/${loc.id}`)}
                >
                  {loc.category === 'โรงอาหาร' ? 'ดูผังร้าน' : 'รายละเอียด'}
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
}