import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { LeafletMiniMap } from './LeafletMiniMap';
import { MAP_CONFIG, hasGoogleMapsKey } from '../config/mapConfig';

export const ProductDetailScreen: React.FC = () => {
  const {
    selectedListing,
    goBack,
    navigateTo,
    openChatForListing,
    openReelWalkaround,
    openOfferModal,
    toggleFavorite,
    savedListingIds,
    showToast,
    isMyAd,
    toggleListingSoldStatus,
    openSafetyModal,
    openReviewModal,
    openBoostModal,
  } = useApp();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const listing = selectedListing;
  const isSaved = savedListingIds.has(listing.id);
  const isOwner = isMyAd(listing);
  const isSold = listing.status === 'sold';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('🔗 Listing link copied to clipboard!');
  };

  const handleCall = () => {
    showToast(`📞 Dialing ${listing.seller.phone} (${listing.seller.name})...`);
  };

  return (
    <div className="pb-28 max-w-3xl mx-auto bg-[#0b1326] min-h-screen">
      {/* Top Floating App Bar */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/90 backdrop-blur-md border-b border-[#222a3d] px-4 py-3 flex items-center justify-between">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
          <button
            onClick={() => toggleFavorite(listing.id)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              isSaved
                ? 'bg-[#ffb2b7] text-[#67001b] border-[#ffb2b7]'
                : 'bg-[#171f33] hover:bg-[#222a3d] border-[#2d3449] text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">favorite</span>
          </button>
        </div>
      </div>

      {/* Owner Management Strip */}
      {isOwner && (
        <div className="bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-blue-600/20 border-b border-amber-400/40 p-3.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <div>
              <p className="text-xs font-black text-amber-300">
                आप इस विज्ञापन के मालिक हैं (You own this ad)
              </p>
              <p className="text-[10px] text-[#dae2fd]/70">
                Status: {isSold ? '🔴 SOLD (बिक गया)' : '🟢 ACTIVE (लाइव)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleListingSoldStatus(listing.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow transition-transform active:scale-95 ${
                isSold
                  ? 'bg-emerald-500 text-black'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm font-bold">
                {isSold ? 'restart_alt' : 'check_circle'}
              </span>
              <span>{isSold ? 'Make Active' : 'Mark as Sold'}</span>
            </button>

            {!isSold && (
              <button
                onClick={() => openBoostModal(listing)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-black flex items-center gap-1 shadow transition-transform active:scale-95"
                title="Boost plan chunein"
              >
                <span className="material-symbols-outlined text-sm font-black">rocket_launch</span>
                <span>{listing.featured ? 'Boosted ⭐' : 'Boost Ad'}</span>
              </button>
            )}

            <button
              onClick={() => navigateTo('my-ads')}
              className="px-3 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-bold text-[#dae2fd] border border-[#2d3449] flex items-center gap-1"
            >
              <span>My Ads</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* SOLD Alert Banner */}
      {isSold && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2.5 flex items-center gap-2 text-rose-200 text-xs font-bold">
          <span className="material-symbols-outlined text-rose-400 text-base shrink-0">info</span>
          <span>यह सामान बिक चुका है (This item is SOLD OUT). अब कोई नया ऑर्डर या ऑफर स्वीकार नहीं किया जा रहा है।</span>
        </div>
      )}

      {/* Hero Photo Gallery & Walkaround Reel Overlay */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black overflow-hidden select-none">
        <img
          src={listing.images[activePhotoIdx] || listing.images[0]}
          alt={listing.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Counter Badge & Views Count */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#dae2fd] border border-white/15 flex items-center gap-1 shadow-lg" title="Total Views Count">
            <span className="material-symbols-outlined text-xs text-[#38bdf8]">visibility</span>
            <span>{(listing.viewsCount || 1).toLocaleString()} views</span>
          </div>

          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white border border-white/10">
            {activePhotoIdx + 1} / {listing.images.length}
          </div>
        </div>

        {/* Verified Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {listing.featured && (
            <span className="bg-[#8083ff] text-[#0b1326] text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
              FEATURED AD
            </span>
          )}
          {listing.verifiedRC && (
            <span className="bg-[#00885d] text-[#dae2fd] text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              <span>VERIFIED RC</span>
            </span>
          )}
        </div>

        {/* Watch 30s Walkaround HD Reel Button (Image 8 style) */}
        {listing.hasVideoReel && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <button
              onClick={() => openReelWalkaround(listing)}
              className="w-full max-w-sm py-3 px-4 rounded-2xl bg-gradient-to-r from-[#8083ff] via-[#4edea3] to-[#8083ff] text-[#0b1326] font-extrabold text-xs sm:text-sm shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg font-black animate-pulse">
                play_circle
              </span>
              <span>Watch 30s Walkaround HD Reel</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-bold">
                Sound Included 🔊
              </span>
            </button>
          </div>
        )}

        {/* Thumbnail Selector Dots / Strips */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-16 sm:bottom-18 left-0 right-0 flex justify-center gap-1.5">
            {listing.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  activePhotoIdx === idx ? 'w-6 bg-[#8083ff]' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-5">
        {/* Pricing & Key Title */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 shadow-sm">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-price-hero text-[#dae2fd]">
                ₹{listing.price.toLocaleString()}
              </span>
              {listing.originalPrice && (
                <span className="text-sm text-[#908fa0] line-through">
                  ₹{listing.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {listing.negotiable && (
              <span className="text-xs bg-[#4edea3]/20 text-[#4edea3] font-bold px-2 py-1 rounded-full border border-[#4edea3]/30">
                Negotiable
              </span>
            )}
          </div>

          <h1 className="font-headline-sm text-[#dae2fd] mt-2 leading-snug">
            {listing.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-[#908fa0] mt-2 flex-wrap">
            <span className="material-symbols-outlined text-sm text-[#8083ff]">
              location_on
            </span>
            <span>{listing.location.neighborhood}, {listing.location.city}</span>
            <span>•</span>
            <span>{listing.location.distanceKm} km away</span>
            <span>•</span>
            <span>Posted {listing.postedAgo}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[#38bdf8] font-bold bg-[#38bdf8]/10 px-2 py-0.5 rounded-full border border-[#38bdf8]/30">
              <span className="material-symbols-outlined text-xs">visibility</span>
              <span>{(listing.viewsCount || 1).toLocaleString()} लोगों ने देखा</span>
            </span>
          </div>

          {/* Quick Attributes Strip */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#222a3d]">
            <div className="bg-[#131b2e] rounded-xl p-2 text-center border border-[#222a3d]">
              <span className="text-[10px] text-[#908fa0] block">Odometer</span>
              <span className="text-xs font-bold text-[#dae2fd]">
                {listing.attributes.odometerKm || '14,200 km'}
              </span>
            </div>
            <div className="bg-[#131b2e] rounded-xl p-2 text-center border border-[#222a3d]">
              <span className="text-[10px] text-[#908fa0] block">Fuel Type</span>
              <span className="text-xs font-bold text-[#dae2fd]">
                {listing.attributes.fuelType || 'Petrol'}
              </span>
            </div>
            <div className="bg-[#131b2e] rounded-xl p-2 text-center border border-[#222a3d]">
              <span className="text-[10px] text-[#908fa0] block">Ownership</span>
              <span className="text-xs font-bold text-[#dae2fd]">
                {listing.attributes.owners || '1st Owner'}
              </span>
            </div>
            <div className="bg-[#131b2e] rounded-xl p-2 text-center border border-[#222a3d]">
              <span className="text-[10px] text-[#908fa0] block">Year</span>
              <span className="text-xs font-bold text-[#dae2fd]">
                {listing.attributes.regYear || '2022'}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Key Specifications Grid */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 shadow-sm">
          <h3 className="font-headline-sm text-[#dae2fd] mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8083ff] text-xl">
              fact_check
            </span>
            <span>Key Specifications</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {listing.specs.map((spec, idx) => (
              <div
                key={idx}
                className="bg-[#131b2e] border border-[#222a3d] rounded-xl p-2.5"
              >
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                  {spec.label}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-bold text-[#dae2fd]">
                    {spec.value}
                  </span>
                  {spec.verified && (
                    <span className="material-symbols-outlined text-xs text-[#4edea3]">
                      check_circle
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seller Card (Rahul Automobiles) */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div
              onClick={() => navigateTo('seller-profile', { seller: listing.seller })}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={listing.seller.avatar}
                alt={listing.seller.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-full object-cover border-2 border-[#8083ff] group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-extrabold text-[#dae2fd] group-hover:text-[#8083ff]">
                    {listing.seller.name}
                  </h4>
                  {listing.seller.verified && (
                    <span className="material-symbols-outlined text-sm text-[#4edea3]">
                      verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#908fa0]">
                  {listing.seller.proprietorName && `Prop. ${listing.seller.proprietorName} • `}
                  Member since {listing.seller.memberSince}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-[#dae2fd] flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs text-amber-400">
                      star
                    </span>
                    <span>{listing.seller.rating}</span>
                    <span className="text-[#908fa0] font-normal">
                      ({listing.seller.reviewsCount})
                    </span>
                  </span>
                  <span className="text-[10px] bg-[#00885d]/30 text-[#4edea3] font-bold px-1.5 py-0.2 rounded">
                    {listing.seller.trustScore}% Trust Score
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
              <button
                onClick={() => openReviewModal(listing.seller)}
                className="w-full sm:w-auto px-2.5 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-xs text-amber-400">star</span>
                <span>Rate</span>
              </button>
              <button
                onClick={() => navigateTo('seller-profile', { seller: listing.seller })}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-bold text-[#c0c1ff] whitespace-nowrap transition-colors"
              >
                View Store &gt;
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#222a3d] flex items-center justify-between text-xs text-[#908fa0]">
            <span>Active Ads: <strong className="text-[#dae2fd]">{listing.seller.activeAdsCount}</strong></span>
            <span>Sold: <strong className="text-[#dae2fd]">{listing.seller.soldCount}</strong></span>
            <span>Response: <strong className="text-[#4edea3]">{listing.seller.replyTime}</strong></span>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 shadow-sm">
          <h3 className="font-headline-sm text-[#dae2fd] mb-2.5">
            Description & Condition
          </h3>
          <div className="space-y-2 text-xs text-[#c7c4d7] leading-relaxed">
            {listing.description.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        {/* Inspection Location Map Preview (OpenStreetMap / Leaflet Active + Google Maps Ready) */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline-sm text-[#dae2fd] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8083ff] text-xl">
                map
              </span>
              <span>Inspection Location Map</span>
            </h3>
            <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-2 py-0.5 rounded-full border border-[#4edea3]/40">
              {hasGoogleMapsKey() ? 'Google Maps' : 'OpenStreetMap (Leaflet)'}
            </span>
          </div>
          <p className="text-xs text-[#908fa0] mb-3">
            {listing.seller.address || `${listing.location.neighborhood}, Rewa MP`} •{' '}
            <strong className="text-[#dae2fd]">{listing.location.distanceKm} km from you</strong>
          </p>

          {/* Interactive Map (Leaflet OpenStreetMap by default, or Google Maps if key provided) */}
          <div className="relative h-44 rounded-xl bg-[#060e20] border border-[#2d3449] overflow-hidden">
            {hasGoogleMapsKey() && mapsApiKey ? (
              <APIProvider apiKey={mapsApiKey}>
                <Map
                  style={{ width: '100%', height: '100%' }}
                  defaultCenter={{
                    lat: listing.location.lat || 24.5385,
                    lng: listing.location.lng || 81.3090,
                  }}
                  defaultZoom={14}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  disableDefaultUI={true}
                  gestureHandling="cooperative"
                >
                  <AdvancedMarker
                    position={{
                      lat: listing.location.lat || 24.5385,
                      lng: listing.location.lng || 81.3090,
                    }}
                    title={listing.title}
                  >
                    <Pin background="#8083ff" borderColor="#ffffff" glyphColor="#0b1326" />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            ) : (
              <LeafletMiniMap
                lat={listing.location.lat || 24.5385}
                lng={listing.location.lng || 81.3090}
                title={listing.title}
                neighborhood={listing.location.neighborhood}
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${
                listing.location.lat || 24.5385
              },${listing.location.lng || 81.3090}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#dae2fd] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm text-[#4edea3]">
                directions
              </span>
              <span>Get Directions</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>

            <button
              onClick={() => navigateTo('map')}
              className="py-2 px-3 rounded-xl bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff] text-[#c0c1ff] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm text-[#8083ff]">
                explore
              </span>
              <span>All Deals on Map</span>
            </button>
          </div>
        </div>

        {/* BazaarReels Safety Shield & Scam Alert Card */}
        <div className="bg-gradient-to-r from-rose-950/30 via-[#131b2e] to-emerald-950/20 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl font-bold">shield</span>
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-[#dae2fd]">BazaarReels Safety Shield &amp; Guarantee</h4>
                <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded">
                  ANTI-FRAUD
                </span>
              </div>
              <p className="text-[#908fa0] mt-0.5 leading-relaxed">
                UPI me paise lene ke liye kabhi QR scan na karein. Advance token na bhejein aur aamne-saamne milkar RC book verify karein.
              </p>
            </div>
          </div>

          <button
            onClick={openSafetyModal}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#222a3d] hover:bg-rose-500 hover:text-black border border-[#2d3449] text-xs font-bold text-rose-300 hover:text-black transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">security</span>
            <span>Safety Guide Padhein</span>
          </button>
        </div>
      </div>

      {/* Sticky Bottom Transactional Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b1326]/95 backdrop-blur-md border-t border-[#222a3d] p-3 pb-safe">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {/* Heart */}
          <button
            onClick={() => toggleFavorite(listing.id)}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-colors ${
              isSaved
                ? 'bg-[#ffb2b7] text-[#67001b] border-[#ffb2b7]'
                : 'bg-[#171f33] hover:bg-[#222a3d] border-[#2d3449] text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">favorite</span>
          </button>

          {/* Call */}
          <button
            onClick={handleCall}
            className="w-12 h-12 rounded-2xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#4edea3] flex items-center justify-center shrink-0 transition-colors"
            title="Call Seller"
          >
            <span className="material-symbols-outlined text-xl">call</span>
          </button>

          {/* Conditional Actions: If Sold or Active */}
          {isSold ? (
            <div className="flex-1 py-3 px-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-center flex items-center justify-center gap-2 text-rose-300 text-xs font-black shadow-lg">
              <span className="material-symbols-outlined text-sm font-bold">block</span>
              <span>यह सामान बिक चुका है (Sold Out)</span>
            </div>
          ) : (
            <>
              {/* Make Offer */}
              <button
                onClick={() => openOfferModal(listing)}
                className="flex-1 py-3 rounded-2xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-extrabold text-[#dae2fd] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#8083ff]">
                  handshake
                </span>
                <span>Make Offer</span>
              </button>

              {/* Chat Now */}
              <button
                onClick={() => openChatForListing(listing)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-[#8083ff]/30 hover:opacity-95 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base font-bold">
                  chat
                </span>
                <span>Chat Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
