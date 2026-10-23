import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MAP_CONFIG } from '../config/mapConfig';

interface LeafletMiniMapProps {
  lat: number;
  lng: number;
  title: string;
  neighborhood: string;
}

export const LeafletMiniMap: React.FC<LeafletMiniMapProps> = ({
  lat,
  lng,
  title,
  neighborhood,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
      });

      // CartoDB Voyager tiles (OpenStreetMap)
      L.tileLayer(MAP_CONFIG.osm.voyagerUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom Pin Marker
      const pinHtml = `
        <div class="relative flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-[#8083ff] text-[#0b1326] flex items-center justify-center shadow-lg border-2 border-white">
            <span class="material-symbols-outlined text-lg">pin_drop</span>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#8083ff]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-minimap-pin',
        html: pinHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `<div style="padding: 6px 10px; font-size: 12px; font-weight: 700; color: #dae2fd;">${neighborhood}</div>`
        );

      mapRef.current = map;
    } else {
      mapRef.current.setView([lat, lng], 15);
    }

    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [lat, lng, neighborhood]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
