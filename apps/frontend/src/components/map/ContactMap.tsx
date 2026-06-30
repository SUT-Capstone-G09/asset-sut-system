"use client"

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

const customIcon = L.divIcon({
  html: renderToString(
    <div className='text-orange-500 drop-shadow-md'>
      <MapPin size={36} fill="currentColor" fillOpacity={0.2} />
    </div>
  ),
  className: "custom-div-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

export default function ContactMap() {
  const position: [number, number] = [14.8808124, 102.0209532] // SUT Administration Building

  return (
    <LeafletMap
      center={position}
      zoom={17}
      className="h-full w-full"
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={true}
      touchZoom={true}
      boxZoom={false}
      keyboard={false}
      minZoom={10}
      maxZoom={19}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ZoomControl position="bottomright" />

      <Marker position={position} icon={customIcon}>
        <Popup className="custom-popup">
          <div className="p-3 text-center min-w-[200px]">
            <h3 className="font-bold text-slate-800 text-xs leading-tight">ส่วนบริหารสินทรัพย์ SUT</h3>
            <p className="text-[10px] text-slate-400 mt-1">อาคารบริหาร ชั้น 1 มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
            <a 
              href="https://www.google.com/maps/place/%E0%B8%AD%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3+%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B9%80%E0%B8%97%E0%B8%84%E0%B9%82%E0%B8%99%E0%B9%82%E0%B8%A5%E0%B8%A2%E0%B8%B5%E0%B8%AA%E0%B8%B8%E0%B8%A3%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%B5/@14.8808124,102.0209532,17.89z" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block mt-2 text-[9px] font-bold text-white bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded transition-colors"
            >
              ดูใน Google Maps
            </a>
          </div>
        </Popup>
      </Marker>
    </LeafletMap>
  )
}
