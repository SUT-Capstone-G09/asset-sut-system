"use client"

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { RentalSpace } from '@/features/areas/types/rental-space';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { useEffect, useRef } from 'react';
import { getCategoryIcon } from '@/utils/commercial-category-icons';

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
  locations: RentalSpace[];
  hoveredId?: string | null;
  onHoveredIdChange?: (id: string | null) => void;
}

export default function MapContainer({
  locations,
  hoveredId,
  onHoveredIdChange,
}: MapContainerProps) {
  const router = useRouter();
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync hoveredId from parent to open/close popups programmatically
  useEffect(() => {
    if (hoveredId) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      const marker = markerRefs.current[hoveredId];
      if (marker) {
        marker.openPopup();
      }
    } else {
      // Don't close immediately if we are in the middle of a transition timeout
      if (!closeTimeoutRef.current) {
        Object.values(markerRefs.current).forEach((marker) => {
          if (marker && marker.isPopupOpen()) {
            marker.closePopup();
          }
        });
      }
    }
  }, [hoveredId]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseOverMarker = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    onHoveredIdChange?.(id);
  };

  const handleMouseOutMarker = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      onHoveredIdChange?.(null);
      // Programmatically close popup
      Object.values(markerRefs.current).forEach((marker) => {
        if (marker && marker.isPopupOpen()) {
          marker.closePopup();
        }
      });
    }, 300); // 300ms buffer to move mouse into popup
  };

  const handleMouseEnterPopup = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeavePopup = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      onHoveredIdChange?.(null);
      // Programmatically close popup
      Object.values(markerRefs.current).forEach((marker) => {
        if (marker && marker.isPopupOpen()) {
          marker.closePopup();
        }
      });
    }, 200);
  };

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
          riseOnHover={true}
          ref={(el) => {
            if (el) {
              markerRefs.current[loc.id] = el;
            } else {
              delete markerRefs.current[loc.id];
            }
          }}
          eventHandlers={{
            click: () => {
              router.push(`/areas/${loc.id}`);
            },
            mouseover: () => {
              handleMouseOverMarker(loc.id);
            },
            mouseout: () => {
              handleMouseOutMarker();
            },
          }}
        >
          <Popup
            className="custom-popup"
            closeButton={false}
            autoPan={false}
            offset={[0, -10]}
          >
            <div 
              onClick={() => router.push(`/areas/${loc.id}`)}
              onMouseEnter={handleMouseEnterPopup}
              onMouseLeave={handleMouseLeavePopup}
              className="w-56 p-2 bg-white hover:bg-slate-50/80 transition-colors flex gap-2.5 font-sans cursor-pointer select-none"
            >
              {/* Thumbnail Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50 shrink-0 shadow-sm border border-slate-100">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  {/* Category Badge */}
                  <div className="flex mb-1">
                    {(() => {
                      const CategoryIcon = getCategoryIcon(loc.area);
                      return (
                        <span className="inline-flex items-center gap-1 px-1 py-0.2 rounded text-[8px] font-bold bg-brand-primary/8 text-brand-primary">
                          <CategoryIcon size={8} />
                          {loc.area}
                        </span>
                      );
                    })()}
                  </div>
                  {/* Name */}
                  <h4 className="font-extrabold text-gray-900 text-[11px] leading-snug line-clamp-2">
                    {loc.name}
                  </h4>
                  {loc.building && (
                    <p className="text-[9px] text-gray-400 font-medium truncate mt-0.5">
                      {loc.building}
                    </p>
                  )}
                </div>

                {/* Click instruction */}
                <div className="text-[8px] text-brand-primary font-bold flex items-center gap-0.5 mt-1">
                  คลิกดูรายละเอียดพื้นที่ →
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
}