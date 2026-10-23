import React, { useState, useMemo, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { useApp } from '../context/AppContext';
import { Listing } from '../types';
import Markdown from 'react-markdown';
import { LeafletMap } from './LeafletMap';
import { MAP_CONFIG, hasGoogleMapsKey } from '../config/mapConfig';

// Source: Google Maps Platform Code Assist
// Default center coordinates: Rewa, Madhya Pradesh
const REWA_CENTER = { lat: 24.5362, lng: 81.3037 };

interface GroundingSource {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

export const MapDealsScreen: React.FC = () => {
  const { listings, navigateTo, openReelWalkaround, openOfferModal, location } = useApp();

  // API Key for Google Maps Platform JS
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || MAP_CONFIG.googleMapsApiKey;

  const [selectedListing, setSelectedListing] = useState<Listing | null>(listings[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(REWA_CENTER);
  const [zoom, setZoom] = useState<number>(13);
  const [activeTab, setActiveTab] = useState<'map' | 'ai-grounding'>('map');

  // Map Provider state: default to 'leaflet' (OpenStreetMap) as requested
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'google'>(MAP_CONFIG.provider);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Temporary API key input inside modal for test/preview
  const [customKeyInput, setCustomKeyInput] = useState<string>(mapsApiKey);

  // AI Maps Grounding State
  const [prompt, setPrompt] = useState<string>('');
  const [isLoadingGrounding, setIsLoadingGrounding] = useState<boolean>(false);
  const [groundingAnswer, setGroundingAnswer] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  // Filter listings based on category & distance
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchCat =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'reels'
          ? item.hasVideoReel
          : item.categoryId === selectedCategory;
      const matchDist = (item.location.distanceKm || 0) <= maxDistanceKm;
      return matchCat && matchDist;
    });
  }, [listings, selectedCategory, maxDistanceKm]);

  // Handle locating user
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserCoords(coords);
          setMapCenter(coords);
          setZoom(15);
        },
        () => {
          setMapCenter(REWA_CENTER);
        }
      );
    } else {
      setMapCenter(REWA_CENTER);
    }
  };

  // Preset query trigger for Gemini Maps Grounding
  const runGroundingQuery = async (queryText: string) => {
    setPrompt(queryText);
    setIsLoadingGrounding(true);
    setGroundingError(null);
    setGroundingAnswer(null);
    setGroundingSources([]);
    setActiveTab('ai-grounding');

    try {
      const response = await fetch('/api/maps/grounding-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to query Maps Grounding service');
      }

      setGroundingAnswer(data.text);
      setGroundingSources(data.sources || []);
    } catch (err: any) {
      console.error('Maps Grounding Error:', err);
      setGroundingError(err.message || 'Error executing Google Maps grounding search');
    } finally {
      setIsLoadingGrounding(false);
    }
  };

  const getMarkerColor = (categoryId: string) => {
    switch (categoryId) {
      case 'vehicles':
        return '#8083ff'; // Primary indigo
      case 'mobiles':
        return '#4edea3'; // Mint green
      case 'property':
        return '#ffb2b7'; // Coral pink
      default:
        return '#c0c1ff';
    }
  };

  return (
    <div className="pb-24 md:pb-12 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Top Header & Mode Toggle */}
      <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3 sm:p-4 mb-3 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] shadow-md shadow-[#8083ff]/30">
            <span className="material-symbols-outlined font-bold text-xl">map</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#dae2fd] flex items-center gap-2">
              <span>Google Maps Hyperlocal Explorer</span>
              <span className="text-[10px] bg-[#8083ff]/20 text-[#c0c1ff] font-bold px-2 py-0.5 rounded-full border border-[#8083ff]/40">
                Rewa Market
              </span>
            </h1>
            <p className="text-xs text-[#908fa0]">
              Browse verified items near you or query Google Maps Grounding with Gemini 3.8 Flash.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0b1326] p-1 rounded-xl border border-[#2d3449] w-full md:w-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-[#8083ff] text-[#0b1326] shadow-sm'
                : 'text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            <span>Map & Deals</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-grounding')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ai-grounding'
                ? 'bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] shadow-sm'
                : 'text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Maps Grounding AI</span>
            <span className="text-[9px] bg-[#0b1326]/40 px-1 py-0.2 rounded font-mono">LIVE</span>
          </button>
        </div>
      </div>

      {activeTab === 'map' ? (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#171f33]/90 border border-[#2d3449] rounded-2xl p-2.5 sm:p-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'All Places' },
                { id: 'reels', label: '🎥 Walkaround Reels' },
                { id: 'vehicles', label: 'Bikes & Scooters' },
                { id: 'mobiles', label: 'Mobiles' },
                { id: 'property', label: 'Flats & Property' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#8083ff] text-[#0b1326]'
                      : 'bg-[#131b2e] text-[#908fa0] border border-[#2d3449] hover:text-[#dae2fd]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Distance Filter & Locate Me */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Map Provider Pill */}
              <div className="flex items-center gap-1.5 bg-[#131b2e] px-2.5 py-1 rounded-lg border border-[#2d3449] text-xs">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
                <span className="font-bold text-[#dae2fd]">
                  {mapProvider === 'google' && hasGoogleMapsKey() ? 'Google Maps' : 'OpenStreetMap (Leaflet)'}
                </span>
              </div>

              {/* Google Maps API Key Architecture Modal Trigger */}
              <button
                onClick={() => setShowApiKeyModal(true)}
                title="Google Maps API Key Setup for Final Build"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] border border-[#8083ff]/40 text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">key</span>
                <span className="hidden sm:inline">Final Build Key</span>
              </button>

              <span className="text-xs text-[#908fa0] font-medium hidden md:inline">
                Radius: <strong className="text-[#dae2fd]">{maxDistanceKm} km</strong>
              </span>
              <select
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="bg-[#131b2e] border border-[#2d3449] text-xs text-[#dae2fd] rounded-lg px-2 py-1 font-semibold focus:outline-none"
              >
                <option value={2}>Within 2 km</option>
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Entire Rewa Dist (25km)</option>
              </select>

              <button
                onClick={handleLocateMe}
                title="Center to my location"
                className="p-1.5 rounded-lg bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-[#4edea3] transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">my_location</span>
              </button>
            </div>
          </div>

          {/* Map View Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Map Area (Leaflet OpenStreetMap by default, or Google Maps if key provided) */}
            <div className="lg:col-span-8 relative bg-[#0b1326] border border-[#2d3449] rounded-2xl overflow-hidden shadow-xl min-h-[440px] h-[52vh] sm:h-[58vh]">
              {mapProvider === 'google' && hasGoogleMapsKey() && (mapsApiKey || customKeyInput) ? (
                <APIProvider apiKey={customKeyInput || mapsApiKey}>
                  <Map
                    style={{ width: '100%', height: '100%' }}
                    defaultCenter={REWA_CENTER}
                    center={mapCenter}
                    defaultZoom={13}
                    zoom={zoom}
                    onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                    onZoomChanged={(ev) => setZoom(ev.detail.zoom)}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                  >
                    {filteredListings.map((listing) => {
                      const lat = listing.location.lat || REWA_CENTER.lat;
                      const lng = listing.location.lng || REWA_CENTER.lng;
                      const isSelected = selectedListing?.id === listing.id;
                      const markerBg = getMarkerColor(listing.categoryId);

                      return (
                        <AdvancedMarker
                          key={listing.id}
                          position={{ lat, lng }}
                          onClick={() => setSelectedListing(listing)}
                          title={`${listing.title} - ₹${listing.price.toLocaleString()}`}
                        >
                          <Pin
                            background={markerBg}
                            borderColor="#ffffff"
                            glyphColor="#0b1326"
                            scale={isSelected ? 1.25 : 1.0}
                          />
                        </AdvancedMarker>
                      );
                    })}

                    {selectedListing && (
                      <InfoWindow
                        position={{
                          lat: selectedListing.location.lat || REWA_CENTER.lat,
                          lng: selectedListing.location.lng || REWA_CENTER.lng,
                        }}
                        onCloseClick={() => setSelectedListing(null)}
                      >
                        <div className="p-1 text-[#0b1326] max-w-[200px]">
                          <img
                            src={selectedListing.images[0]}
                            alt={selectedListing.title}
                            className="w-full h-20 object-cover rounded-lg mb-1"
                          />
                          <span className="font-extrabold text-xs block text-[#0b1326] line-clamp-1">
                            {selectedListing.title}
                          </span>
                          <span className="text-xs font-black text-[#00885d] block">
                            ₹{selectedListing.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-600 block">
                            {selectedListing.location.neighborhood} ({selectedListing.location.distanceKm} km)
                          </span>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              ) : (
                /* Primary Active Map: Leaflet + OpenStreetMap */
                <div className="w-full h-full relative">
                  <LeafletMap
                    listings={filteredListings}
                    selectedListing={selectedListing}
                    onSelectListing={(listing) => {
                      setSelectedListing(listing);
                      setMapCenter({
                        lat: listing.location.lat || REWA_CENTER.lat,
                        lng: listing.location.lng || REWA_CENTER.lng,
                      });
                    }}
                    center={mapCenter}
                    zoom={zoom}
                    userCoords={userCoords}
                  />

                  {/* Top Floating Map Info Tag */}
                  <div className="absolute top-3 left-12 z-[1000] bg-[#171f33]/90 backdrop-blur-md border border-[#2d3449] rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 pointer-events-auto">
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
                    <span className="text-[11px] font-bold text-[#dae2fd]">
                      Rewa Live Map • OpenStreetMap Active
                    </span>
                    <button
                      onClick={() => {
                        setMapCenter(REWA_CENTER);
                        setZoom(13);
                      }}
                      className="text-[10px] font-bold text-[#8083ff] hover:underline ml-1"
                    >
                      Reset View
                    </button>
                  </div>

                  {/* Bottom Map Category Legend */}
                  <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 text-[11px] text-[#dae2fd] bg-[#171f33]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2d3449] shadow-lg pointer-events-auto">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff]" />
                      <span className="text-xs">Vehicles</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]" />
                      <span className="text-xs">Mobiles</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffb2b7]" />
                      <span className="text-xs">Property</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Listing Card / Side Details Panel */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {selectedListing ? (
                <div className="bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff]/50 rounded-2xl p-4 shadow-xl flex flex-col justify-between h-full">
                  <div>
                    {/* Header with image */}
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black">
                      <img
                        src={selectedListing.images[0]}
                        alt={selectedListing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {selectedListing.hasVideoReel && (
                        <button
                          onClick={() => openReelWalkaround(selectedListing)}
                          className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold border border-[#8083ff]/60 flex items-center gap-1 hover:bg-[#8083ff] hover:text-[#0b1326] transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs text-[#ffb2b7]">
                            play_circle
                          </span>
                          <span>Watch 30s Reel</span>
                        </button>
                      )}
                      {selectedListing.negotiable && (
                        <span className="absolute top-2 right-2 bg-[#4edea3]/20 border border-[#4edea3]/40 text-[#4edea3] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Negotiable
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-lg font-black text-[#dae2fd]">
                        ₹{selectedListing.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#908fa0]">
                        {selectedListing.location.distanceKm} km away
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#dae2fd] line-clamp-2 leading-snug">
                      {selectedListing.title}
                    </h3>

                    <div className="mt-2.5 p-2 rounded-xl bg-[#131b2e] border border-[#222a3d] text-xs text-[#908fa0] space-y-1">
                      <div className="flex items-center gap-1 text-[#dae2fd]">
                        <span className="material-symbols-outlined text-sm text-[#8083ff]">
                          location_on
                        </span>
                        <span className="font-semibold">
                          {selectedListing.location.neighborhood}, {selectedListing.location.city}
                        </span>
                      </div>
                      {selectedListing.location.landmark && (
                        <p className="text-[11px] text-[#908fa0] pl-5">
                          Landmark: {selectedListing.location.landmark}
                        </p>
                      )}
                      <p className="text-[11px] text-[#c0c1ff] pl-5">
                        Seller: <strong>{selectedListing.seller.name}</strong> • Rating:{' '}
                        {selectedListing.seller.rating} ★
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#222a3d] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openOfferModal(selectedListing)}
                        className="py-2.5 rounded-xl bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] text-xs font-black transition-colors"
                      >
                        Bargain Offer
                      </button>
                      <button
                        onClick={() => navigateTo('product-detail', { listing: selectedListing })}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black hover:opacity-95 transition-opacity"
                      >
                        View Ad Details
                      </button>
                    </div>

                    {/* Google Maps Directions External Link */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${
                        selectedListing.location.lat || 24.5362
                      },${selectedListing.location.lng || 81.3037}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl border border-[#2d3449] hover:bg-[#222a3d] text-[#dae2fd] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-[#4edea3]">
                        directions
                      </span>
                      <span>Get Directions on Google Maps</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-6 text-center text-[#908fa0] flex flex-col items-center justify-center h-full">
                  <span className="material-symbols-outlined text-3xl text-[#8083ff] mb-2">
                    touch_app
                  </span>
                  <p className="text-xs font-semibold text-[#dae2fd]">No Item Selected</p>
                  <p className="text-[11px] mt-1">
                    Tap any marker pin on the map to preview pricing, walkaround reels, and seller directions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick List Below Map */}
          <div className="mt-4">
            <h2 className="text-xs font-bold text-[#908fa0] uppercase tracking-wider mb-2">
              Listings in Current Map Radius ({filteredListings.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedListing(item);
                    if (item.location.lat && item.location.lng) {
                      setMapCenter({ lat: item.location.lat, lng: item.location.lng });
                    }
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedListing?.id === item.id
                      ? 'bg-[#222a3d] border-[#8083ff]'
                      : 'bg-[#171f33] border-[#2d3449] hover:border-[#8083ff]/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-extrabold text-[#dae2fd] block truncate">
                        {item.title}
                      </span>
                      <span className="text-[11px] font-bold text-[#4edea3]">
                        ₹{item.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#908fa0] block truncate">
                        {item.location.neighborhood} • {item.location.distanceKm} km
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* AI Maps Grounding Tab (Gemini 3.8 Flash + googleMaps tool) */
        <div className="space-y-4">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 shadow-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] shrink-0 shadow-md">
                <span className="material-symbols-outlined font-bold text-xl">travel_explore</span>
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#dae2fd] flex items-center gap-2">
                  <span>Rewa Local AI Navigator</span>
                  <span className="text-[9px] bg-[#4edea3]/20 text-[#4edea3] font-mono px-2 py-0.5 rounded-full border border-[#4edea3]/40">
                    Grounded with Google Maps
                  </span>
                </h2>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Ask real-time questions about shops, bike mechanics, phone service centers, or safe meetup spots in Rewa.
                  Powered by <strong>gemini-3.8-flash</strong> with direct Google Maps verification links.
                </p>
              </div>
            </div>

            {/* Quick Prompt Ideas */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                'Motorcycle mechanics near Civil Lines Rewa for pre-purchase bike inspection',
                'Certified iPhone and smartphone repair centers near Saman Naka Rewa',
                'Popular shopping centers & electronics stores around Shilpi Plaza Rewa',
                'Safe public cafes or meetup spots in Rewa to inspect second-hand items',
              ].map((queryText, idx) => (
                <button
                  key={idx}
                  onClick={() => runGroundingQuery(queryText)}
                  className="px-3 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-xs text-[#c0c1ff] transition-colors text-left flex items-center gap-1.5 group"
                >
                  <span className="material-symbols-outlined text-xs text-[#8083ff] group-hover:scale-110 transition-transform">
                    search
                  </span>
                  <span>{queryText}</span>
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (prompt.trim()) runGroundingQuery(prompt.trim());
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908fa0] text-lg">
                  pin_drop
                </span>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask anything about locations, shops, or markets in Rewa..."
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#dae2fd] placeholder-[#908fa0] focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoadingGrounding || !prompt.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs sm:text-sm font-black disabled:opacity-50 transition-opacity shrink-0 flex items-center gap-1.5"
              >
                {isLoadingGrounding ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#0b1326] border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">near_me</span>
                    <span>Search Maps</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Area */}
          {isLoadingGrounding && (
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-8 text-center">
              <div className="w-8 h-8 border-3 border-[#8083ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-[#dae2fd]">Consulting Google Maps & Gemini 3.8 Flash...</p>
              <p className="text-[11px] text-[#908fa0] mt-1">Grounding verified place coordinates and reviews</p>
            </div>
          )}

          {groundingError && (
            <div className="bg-[#ffb2b7]/10 border border-[#ffb2b7]/30 rounded-2xl p-4 text-xs text-[#ffb2b7] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{groundingError}</span>
            </div>
          )}

          {groundingAnswer && (
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#222a3d]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#4edea3]">
                    verified_user
                  </span>
                  <span className="text-xs font-bold text-[#dae2fd]">Google Maps Grounded Response</span>
                </div>
                <span className="text-[10px] text-[#908fa0]">Rewa, MP (24.5362° N, 81.3037° E)</span>
              </div>

              {/* Formatted Markdown Output */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#dae2fd] leading-relaxed">
                <Markdown>{groundingAnswer}</Markdown>
              </div>

              {/* Verified Sources & Google Maps Links (MANDATORY REQUIREMENT) */}
              {groundingSources.length > 0 && (
                <div className="pt-3 border-t border-[#222a3d]">
                  <h3 className="text-xs font-bold text-[#c0c1ff] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#8083ff]">link</span>
                    <span>Verified Google Maps Places & Direct Links</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groundingSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] hover:border-[#8083ff] transition-all flex items-start justify-between gap-2 group"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="material-symbols-outlined text-base text-[#4edea3] shrink-0 mt-0.5">
                            pin_drop
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#dae2fd] group-hover:text-[#8083ff] block truncate">
                              {source.title}
                            </span>
                            <span className="text-[10px] text-[#908fa0] truncate block">
                              {source.uri}
                            </span>
                            {source.reviewSnippets && source.reviewSnippets.length > 0 && (
                              <p className="text-[10px] text-[#908fa0] italic mt-1 line-clamp-1">
                                "{source.reviewSnippets[0]}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-xs text-[#908fa0] group-hover:text-[#8083ff] shrink-0">
                          open_in_new
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Google Maps API Key Setup & Architecture Modal (For Final Build) */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222a3d]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">map</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#dae2fd]">
                    Google Maps API Configuration
                  </h3>
                  <p className="text-[11px] text-[#908fa0]">
                    Current Provider: <strong className="text-[#8083ff]">{mapProvider === 'google' ? 'Google Maps (Demo Key Active)' : 'Leaflet (OpenStreetMap)'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 rounded-lg text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#222a3d]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Current Status Box */}
            <div className="bg-[#0b1326] border border-[#2d3449] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#c0c1ff] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
                  Google Maps Platform Demo Key Provisioned
                </span>
                <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-2 py-0.5 rounded-full">
                  Normal / Free Key Active
                </span>
              </div>
              <p className="text-[11px] text-[#908fa0] leading-relaxed">
                अभी के लिए Google Maps का फ्री Demo API Key सेट कर दिया गया है। जब आप प्रोडक्शन में Paid API Key डालना चाहें, तो नीचे या <code className="text-[#8083ff]">.env</code> में अपनी Paid Key पेस्ट कर सकते हैं।
              </p>
            </div>

            {/* Instructions for Final Build */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#dae2fd] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#8083ff] text-base">info</span>
                <span>Final Build me Google Maps API Key kaise dalein:</span>
              </h4>
              <ol className="text-[11px] text-[#908fa0] space-y-1.5 list-decimal list-inside pl-1 bg-[#131b2e] p-3 rounded-xl border border-[#222a3d]">
                <li>
                  <strong className="text-[#dae2fd]">Environment Variable:</strong> Apne <code className="text-[#8083ff] font-mono bg-[#0b1326] px-1 py-0.5 rounded">.env</code> file ya Settings me <code className="text-[#4edea3] font-mono bg-[#0b1326] px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY</code> set karein.
                </li>
                <li>
                  <strong className="text-[#dae2fd]">Config File:</strong> Key structure <code className="text-[#8083ff] font-mono bg-[#0b1326] px-1 py-0.5 rounded">src/config/mapConfig.ts</code> me automatically wired hai.
                </li>
                <li>
                  Key set hote hi Google Maps JavaScript SDK, AdvancedMarker, aur Satellite layer automatic switch hone ke liye ready hain.
                </li>
              </ol>
            </div>

            {/* Test or Switch Provider */}
            <div className="space-y-2 pt-1 border-t border-[#222a3d]">
              <label className="text-xs font-bold text-[#dae2fd] block">
                Quick Key Test (Optional preview):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Google Maps API key to test..."
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  className="flex-1 bg-[#0b1326] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono placeholder:text-[#908fa0]/60 focus:border-[#8083ff] focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (customKeyInput.trim().length > 10) {
                      setMapProvider('google');
                      setShowApiKeyModal(false);
                    } else {
                      setMapProvider('leaflet');
                      setShowApiKeyModal(false);
                    }
                  }}
                  className="px-3 py-2 bg-[#8083ff] hover:bg-[#8083ff]/90 text-[#0b1326] text-xs font-bold rounded-xl whitespace-nowrap transition-colors"
                >
                  Apply Provider
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMapProvider('leaflet');
                    setShowApiKeyModal(false);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    mapProvider === 'leaflet'
                      ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]'
                      : 'bg-[#0b1326] border-[#2d3449] text-[#908fa0]'
                  }`}
                >
                  ✓ Keep Leaflet Active
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMapProvider('google');
                    setShowApiKeyModal(false);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    mapProvider === 'google'
                      ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#8083ff]'
                      : 'bg-[#0b1326] border-[#2d3449] text-[#908fa0]'
                  }`}
                >
                  Switch to Google Maps
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
