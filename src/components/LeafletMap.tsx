import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing } from '../types';
import { MAP_CONFIG } from '../config/mapConfig';

interface LeafletMapProps {
  listings: Listing[];
  selectedListing: Listing | null;
  onSelectListing: (listing: Listing) => void;
  center: { lat: number; lng: number };
  zoom: number;
  userCoords?: { lat: number; lng: number } | null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  listings,
  selectedListing,
  onSelectListing,
  center,
  zoom,
  userCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
      });

      // OpenStreetMap Tiles via CartoDB Voyager (clean, crisp, modern)
      L.tileLayer(MAP_CONFIG.osm.voyagerUrl, {
        maxZoom: 19,
        attribution: MAP_CONFIG.osm.attribution,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Invalidate size in case parent layout resized
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Sync Center & Zoom when user clicks locate me or selects a listing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([center.lat, center.lng], zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center.lat, center.lng, zoom]);

  // Update Markers for Listings
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove obsolete markers
    const currentListingIds = new Set(listings.map((l) => l.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentListingIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    listings.forEach((listing) => {
      const lat = listing.location.lat || 24.5362;
      const lng = listing.location.lng || 81.3037;
      const isSelected = selectedListing?.id === listing.id;

      // Color scheme based on category
      const color =
        listing.categoryId === 'bikes'
          ? '#8083ff'
          : listing.categoryId === 'mobiles'
          ? '#4edea3'
          : listing.categoryId === 'realestate'
          ? '#ffb2b7'
          : '#ffc107';

      const priceFormatted =
        listing.price >= 100000
          ? `₹${(listing.price / 100000).toFixed(1)}L`
          : `₹${(listing.price / 1000).toFixed(0)}k`;

      // Custom SVG Marker with Price Badge & Video Indicator
      const markerHtml = `
        <div class="relative cursor-pointer group transition-transform ${
          isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-20'
        }">
          <div class="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold shadow-xl border ${
            isSelected
              ? 'bg-[#8083ff] text-[#0b1326] border-white ring-2 ring-[#8083ff]'
              : 'bg-[#171f33] text-[#dae2fd] border-[#2d3449] hover:border-[#8083ff]'
          }">
            ${
              listing.hasVideoReel
                ? `<span class="w-2 h-2 rounded-full bg-[#ffb2b7] animate-ping inline-block"></span>`
                : `<span class="w-2 h-2 rounded-full inline-block" style="background-color: ${color}"></span>`
            }
            <span>${priceFormatted}</span>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
            isSelected ? 'border-t-[#8083ff]' : 'border-t-[#171f33]'
          } mx-auto -mt-[1px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-osm-marker',
        html: markerHtml,
        iconSize: [64, 32],
        iconAnchor: [32, 32],
      });

      if (markersRef.current[listing.id]) {
        // Update existing marker icon & position
        markersRef.current[listing.id].setIcon(customIcon);
        markersRef.current[listing.id].setLatLng([lat, lng]);
      } else {
        // Create new marker
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          onSelectListing(listing);
        });

        markersRef.current[listing.id] = marker;
      }
    });
  }, [listings, selectedListing, onSelectListing]);

  // Update User Geolocation marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-[#4edea3]/30 animate-ping"></span>
          <span class="w-4 h-4 rounded-full bg-[#4edea3] border-2 border-white shadow-lg"></span>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'user-loc-marker',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      } else {
        userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
          icon: userIcon,
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />
    </div>
  );
};
