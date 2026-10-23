import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Listing } from '../types';
import { Footer } from './Footer';

export const SearchResultsScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    listings,
    shorts,
    navigateTo,
    openChatForListing,
    goBack,
    openReelWalkaround,
    openOfferModal,
    toggleFavorite,
    savedListingIds,
    location,
    searchHistory,
    addSearchQueryToHistory,
  } = useApp();

  const [filterWithReel, setFilterWithReel] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [radiusFilter, setRadiusFilter] = useState<number>(0);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  let filteredListings = listings.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.categoryName.toLowerCase().includes(q) || item.subCategory.toLowerCase().includes(q);
      const matchDesc = item.description.some(d => d.toLowerCase().includes(q));
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }
    if (filterWithReel && !item.hasVideoReel) return false;
    if (filterVerifiedOnly && !item.seller.verified) return false;
    if (item.price > maxPrice) return false;
    if (radiusFilter > 0) {
      const dist = item.location?.distanceKm ?? 1.5;
      if (dist > radiusFilter) return false;
    }
    return true;
  });

  if (sortByDistance) {
    filteredListings = [...filteredListings].sort((a, b) => {
      const distA = a.location?.distanceKm ?? 1.5;
      const distB = b.location?.distanceKm ?? 1.5;
      return distA - distB;
    });
  }

  return (
    <div className="pb-28 md:pb-12 max-w-4xl mx-auto bg-[#0b1326] min-h-screen">
      {/* Search Header Bar */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/95 backdrop-blur-md border-b border-[#222a3d] px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors shrink-0"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8083ff] text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addSearchQueryToHistory(searchQuery);
              }}
              onBlur={() => {
                if (searchQuery.trim().length > 1) addSearchQueryToHistory(searchQuery);
              }}
              placeholder="Search bikes, phones, flats in Rewa..."
              className="w-full bg-[#171f33] border border-[#2d3449] focus:border-[#8083ff] rounded-full pl-10 pr-10 py-2.5 text-xs font-medium text-[#dae2fd] placeholder-[#908fa0] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#908fa0] hover:text-[#dae2fd]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilterDrawer(true)}
            className={`px-3 py-2.5 rounded-full border flex items-center gap-1 text-xs font-bold transition-colors ${
              filterWithReel || filterVerifiedOnly
                ? 'bg-[#8083ff] text-[#0b1326] border-[#8083ff]'
                : 'bg-[#171f33] text-[#dae2fd] border-[#2d3449] hover:bg-[#222a3d]'
            }`}
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Location & Count Context */}
        <div className="flex items-center justify-between text-xs text-[#908fa0]">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#4edea3]">
              near_me
            </span>
            <span>{location} (within 10 km)</span>
            <span>•</span>
            <strong className="text-[#dae2fd]">{filteredListings.length} results</strong>
          </div>

          <span className="text-[11px] text-[#8083ff] font-semibold">
            Sort: Most Relevant
          </span>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => {
              setFilterWithReel(false);
              setFilterVerifiedOnly(false);
              setMaxPrice(150000);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors ${
              !filterWithReel && !filterVerifiedOnly
                ? 'bg-[#8083ff] text-[#0b1326]'
                : 'bg-[#171f33] text-[#908fa0] border border-[#2d3449]'
            }`}
          >
            All Results
          </button>

          <button
            onClick={() => setFilterWithReel(!filterWithReel)}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 transition-colors ${
              filterWithReel
                ? 'bg-[#8083ff] text-[#0b1326]'
                : 'bg-[#171f33] text-[#908fa0] border border-[#2d3449] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-xs text-[#ffb2b7]">
              play_circle
            </span>
            <span>With 30s Reel</span>
          </button>

          <button
            onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 transition-colors ${
              filterVerifiedOnly
                ? 'bg-[#8083ff] text-[#0b1326]'
                : 'bg-[#171f33] text-[#908fa0] border border-[#2d3449] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-xs text-[#4edea3]">
              verified
            </span>
            <span>Verified Seller</span>
          </button>

          <button
            onClick={() => setMaxPrice(prev => (prev === 80000 ? 150000 : 80000))}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors ${
              maxPrice === 80000
                ? 'bg-[#8083ff] text-[#0b1326]'
                : 'bg-[#171f33] text-[#908fa0] border border-[#2d3449]'
            }`}
          >
            Under ₹80k
          </button>

          {/* Distance Radius Filter Chips */}
          {[
            { km: 5, label: '🎯 5 km' },
            { km: 10, label: '🎯 10 km' },
            { km: 25, label: '🎯 25 km' },
          ].map(item => (
            <button
              key={item.km}
              onClick={() => setRadiusFilter(prev => (prev === item.km ? 0 : item.km))}
              className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                radiusFilter === item.km
                  ? 'bg-[#4edea3] text-[#0b1326] font-black shadow'
                  : 'bg-[#171f33] text-[#908fa0] border border-[#2d3449] hover:text-[#dae2fd]'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Nearest First Sort Toggle */}
          <button
            onClick={() => setSortByDistance(!sortByDistance)}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 transition-colors ${
              sortByDistance
                ? 'bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black'
                : 'bg-[#171f33] text-[#908fa0] border border-[#2d3449] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-xs">
              {sortByDistance ? 'check_circle' : 'swap_vert'}
            </span>
            <span>{sortByDistance ? '✓ पास वाले' : 'पास वाले (Nearest)'}</span>
          </button>
        </div>
      </div>

      {/* Video Walkarounds Spotlight in Search (Image 16) */}
      <div className="px-4 py-3 bg-[#131b2e]/60 border-b border-[#222a3d]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffb2b7] text-base">
              play_circle
            </span>
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Video Walkarounds ({shorts.length})
            </h3>
          </div>
          <button
            onClick={() => navigateTo('shorts')}
            className="text-[11px] font-bold text-[#8083ff] hover:underline"
          >
            Watch Fullscreen &gt;
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {shorts.map(reel => (
            <div
              key={reel.id}
              onClick={() => openReelWalkaround(reel)}
              className="relative w-32 sm:w-36 aspect-[9/15] rounded-xl overflow-hidden shrink-0 cursor-pointer group border border-[#2d3449] shadow"
            >
              <img
                src={reel.thumbnailUrl}
                alt={reel.listingTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute top-1.5 left-1.5 bg-black/60 px-1 py-0.5 rounded text-[8px] font-bold text-white">
                0:{reel.durationSec}
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <span className="text-[10px] font-bold text-[#4edea3] block">
                  ₹{reel.price.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold line-clamp-1 block">
                  {reel.listingTitle}
                </span>
                <span className="text-[9px] text-[#c7c4d7]">
                  {reel.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Listing Results Feed */}
      <div className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-[#908fa0] uppercase tracking-wider">
          Available in Rewa ({filteredListings.length})
        </h3>

        {filteredListings.length === 0 ? (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-8 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-[#908fa0]">
              search_off
            </span>
            <h4 className="text-sm font-bold text-[#dae2fd]">No listings found</h4>
            <p className="text-xs text-[#908fa0]">
              Try searching for "Honda", "Bike", or adjusting your price filters.
            </p>
          </div>
        ) : (
          filteredListings.map(listing => {
            const isSaved = savedListingIds.has(listing.id);
            return (
              <div
                key={listing.id}
                onClick={() => navigateTo('product-detail', { listing })}
                className="bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff]/60 rounded-2xl p-3 sm:p-4 flex gap-3 cursor-pointer transition-all hover:shadow-lg"
              >
                {/* Photo with Reel Badge */}
                <div className="relative w-28 sm:w-36 aspect-[4/3] rounded-xl overflow-hidden bg-black shrink-0">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  {listing.hasVideoReel && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openReelWalkaround(listing);
                      }}
                      className="absolute bottom-1.5 left-1.5 bg-black/75 hover:bg-[#8083ff] hover:text-[#0b1326] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs text-[#ffb2b7]">
                        play_circle
                      </span>
                      <span>30s Reel</span>
                    </button>
                  )}

                  {listing.verifiedRC && (
                    <span className="absolute top-1 left-1 bg-[#00885d] text-[#dae2fd] text-[8px] font-black px-1 py-0.2 rounded">
                      RC VERIFIED
                    </span>
                  )}

                  {/* Corner Views Count */}
                  <div
                    className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md border border-white/20 text-[#dae2fd] text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 pointer-events-none"
                    title={`${(listing.viewsCount || 1).toLocaleString()} people viewed`}
                  >
                    <span className="material-symbols-outlined text-[11px] text-[#38bdf8]">visibility</span>
                    <span>{(listing.viewsCount || 1).toLocaleString()}</span>
                  </div>
                </div>

                {/* Details & CTAs */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-price-card text-[#dae2fd]">
                          ₹{listing.price.toLocaleString()}
                        </span>
                        {listing.originalPrice && (
                          <span className="text-[10px] text-[#908fa0] line-through">
                            ₹{listing.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {listing.negotiable && (
                        <span className="text-[9px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-1.5 py-0.2 rounded">
                          Negotiable
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-[#dae2fd] line-clamp-2 mt-0.5 leading-snug">
                      {listing.title}
                    </h4>

                    <p className="text-[10px] text-[#908fa0] mt-1 flex items-center gap-1">
                      <span>{listing.attributes.odometerKm || '14,200 km'}</span>
                      <span>•</span>
                      <span>{listing.attributes.regYear || '2022'}</span>
                      <span>•</span>
                      <span>{listing.location.neighborhood} ({listing.location.distanceKm} km)</span>
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#222a3d] mt-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] text-[#c0c1ff] font-medium truncate">
                        By {listing.seller.name}
                      </span>
                      <span className="text-[9px] text-[#38bdf8] font-bold flex items-center gap-0.5 shrink-0" title="Views">
                        <span className="material-symbols-outlined text-[11px]">visibility</span>
                        <span>{(listing.viewsCount || 1).toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(listing.id);
                        }}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                          isSaved ? 'bg-[#ffb2b7] text-[#67001b]' : 'bg-[#222a3d] text-[#dae2fd]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">favorite</span>
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openOfferModal(listing);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] text-[10px] font-bold transition-colors"
                      >
                        Bargain
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openChatForListing(listing);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-[10px] font-black"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dynamic Location & Account Aware Footer */}
      <Footer />

      {/* Advanced Filter Sliding Drawer Modal */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#131b2e] border border-[#2d3449] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#222a3d]">
              <h3 className="font-headline-sm text-[#dae2fd]">
                Filter Rewa Marketplace
              </h3>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="w-8 h-8 rounded-full bg-[#171f33] text-[#908fa0] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#908fa0]">Max Price</span>
                <span className="font-extrabold text-[#4edea3]">
                  ₹{maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={200000}
                step={5000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#8083ff]"
              />
            </div>

            {/* Video Walkaround Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-bold text-[#dae2fd] block">
                  30s Video Reel Verified Only
                </span>
                <span className="text-[10px] text-[#908fa0]">
                  Only items with engine/room sound check
                </span>
              </div>
              <button
                onClick={() => setFilterWithReel(!filterWithReel)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  filterWithReel ? 'bg-[#8083ff]' : 'bg-[#2d3449]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#0b1326] transition-transform ${
                    filterWithReel ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Verified Seller Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-bold text-[#dae2fd] block">
                  Verified Dealerships Only
                </span>
                <span className="text-[10px] text-[#908fa0]">
                  Aadhaar & GST verified shops
                </span>
              </div>
              <button
                onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  filterVerifiedOnly ? 'bg-[#4edea3]' : 'bg-[#2d3449]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#0b1326] transition-transform ${
                    filterVerifiedOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setShowFilterDrawer(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
