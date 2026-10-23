import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { Listing } from '../types';
import { Footer } from './Footer';
import { audioEngine } from '../utils/audioEngine';

export const HomeScreen: React.FC = () => {
  const {
    listings,
    shorts,
    navigateTo,
    openChatForListing,
    openReelWalkaround,
    toggleFavorite,
    savedListingIds,
    openOfferModal,
    location,
    searchHistory,
    syncListingsFromServer,
    showToast,
  } = useApp();

  const [feedMode, setFeedMode] = useState<'for_you' | 'newest' | 'most_liked' | 'random' | 'reels'>('for_you');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 = All Rewa & MP, 5 = 5km, 10 = 10km, 25 = 25km, 50 = 50km
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Manual / Quick refresh trigger
  const handleSyncRefresh = async () => {
    setIsSyncing(true);
    try {
      await syncListingsFromServer();
      showToast('🔄 ताज़ा पोस्ट्स लोड हो गई हैं!');
      audioEngine.playChime?.();
    } catch (e) {
      showToast('रिफ्रेश पूर्ण');
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  // Purely newest listings for the top spotlight "ताज़ा पोस्ट"
  const newestListings = useMemo(() => {
    return [...listings]
      .sort((a, b) => {
        const timeA = a.createdAt || (a.postedAgo.includes('Just now') ? Date.now() : 0);
        const timeB = b.createdAt || (b.postedAgo.includes('Just now') ? Date.now() : 0);
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [listings]);

  // Scoring function for personalized recommendations
  // Algorithm factors:
  // 1. Freshness: New posts get +1000 points ("naya post hamesha front me dikhe")
  // 2. Search Intent: Matches for user's past queries get +150 points ("user ke pasand ke hisab se jo search kiya")
  // 3. User Likes: High likes get +15 points per like ("like karta hai koi uss hisab se bhi post dikhe")
  // 4. Random Discovery: +0-35 points pseudo-random jitter ("kuch random post bhi dikhe")
  const calculateListingScore = (listing: Listing): { score: number; reason: 'new' | 'search_match' | 'popular' | 'random' | 'general' } => {
    let score = 0;
    let reason: 'new' | 'search_match' | 'popular' | 'random' | 'general' = 'general';

    // 0. Featured / Boosted Ads get top priority
    if (listing.featured && listing.status !== 'sold') {
      score += 2500;
    }

    // 1. Freshness
    const isNew = listing.postedAgo.includes('Just now') ||
                  listing.postedAgo.includes('अभी') ||
                  (listing.createdAt && (Date.now() - listing.createdAt < 86400000 * 2));
    if (isNew) {
      score += 1000;
      reason = 'new';
    }

    // 2. Search match
    const lowerTitle = listing.title.toLowerCase();
    const lowerCat = (listing.categoryName || '').toLowerCase();
    const lowerSub = (listing.subCategory || '').toLowerCase();
    let hasSearchMatch = false;

    if (searchHistory && searchHistory.length > 0) {
      for (const q of searchHistory) {
        const term = q.toLowerCase().trim();
        if (term.length > 1 && (lowerTitle.includes(term) || lowerCat.includes(term) || lowerSub.includes(term))) {
          score += 180;
          hasSearchMatch = true;
        }
      }
    }
    if (hasSearchMatch && reason !== 'new') {
      reason = 'search_match';
    }

    // 3. Engagement / Likes
    const favCount = listing.favoritesCount || 0;
    score += favCount * 15;
    if (favCount >= 3 && reason === 'general') {
      reason = 'popular';
    }

    // 4. Random discovery jitter
    // Deterministic hash based on char code so items stay steady during view
    const hash = (listing.id.charCodeAt(listing.id.length - 1) * 7) % 40;
    score += hash;
    if (hash > 28 && reason === 'general') {
      reason = 'random';
    }

    return { score, reason };
  };

  // Main filtered and sorted listings
  const filteredListings = useMemo(() => {
    // Category filter
    let base = listings.filter(item => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'reels') return item.hasVideoReel;
      if (selectedFilter === 'vehicles') return item.categoryId === 'vehicles';
      if (selectedFilter === 'mobiles') return item.categoryId === 'mobiles';
      if (selectedFilter === 'property') return item.categoryId === 'property';
      return item.categoryId === selectedFilter;
    });

    // Distance Radius filter (Hyper-Local)
    if (radiusFilter > 0) {
      base = base.filter(item => {
        const dist = item.location?.distanceKm ?? 1.5;
        return dist <= radiusFilter;
      });
    }

    // Distance sorting takes priority if selected
    if (sortByDistance) {
      return [...base].sort((a, b) => {
        const distA = a.location?.distanceKm ?? 1.5;
        const distB = b.location?.distanceKm ?? 1.5;
        return distA - distB;
      });
    }

    if (feedMode === 'newest') {
      // Purely newest first
      return [...base].sort((a, b) => {
        const timeA = a.createdAt || (a.postedAgo.includes('Just now') ? Date.now() : 0);
        const timeB = b.createdAt || (b.postedAgo.includes('Just now') ? Date.now() : 0);
        return timeB - timeA;
      });
    }

    if (feedMode === 'most_liked') {
      // High likes first
      return [...base].sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0));
    }

    if (feedMode === 'random') {
      // Random discovery shuffle
      return [...base].sort((a, b) => {
        const aVal = (a.id.charCodeAt(0) * 13) % 100;
        const bVal = (b.id.charCodeAt(0) * 13) % 100;
        return aVal - bVal;
      });
    }

    if (feedMode === 'reels') {
      return base.filter(l => l.hasVideoReel);
    }

    // DEFAULT 'for_you' (Smart algorithmic feed)
    return [...base].sort((a, b) => {
      const scoreA = calculateListingScore(a).score;
      const scoreB = calculateListingScore(b).score;
      return scoreB - scoreA;
    });
  }, [listings, feedMode, selectedFilter, searchHistory, radiusFilter, sortByDistance]);

  return (
    <div className="pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Top Mobile Search Bar */}
      <div className="px-4 pt-3 pb-2 md:hidden">
        <div
          onClick={() => navigateTo('search')}
          className="bg-[#171f33] border border-[#2d3449] rounded-2xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2 text-sm text-[#908fa0]">
            <span className="material-symbols-outlined text-lg text-[#8083ff]">
              search
            </span>
            <span>Search "Honda Shine", "iPhone 13", "Flat"...</span>
          </div>
          <span className="material-symbols-outlined text-base text-[#4edea3]">
            mic
          </span>
        </div>
      </div>

      {/* Community Marketplace Live Status Banner */}
      <section className="px-4 pt-2 pb-1">
        <div className="bg-gradient-to-r from-[#171f33] via-[#1a233a] to-[#171f33] border border-[#2d3449] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#dae2fd] truncate flex items-center gap-1.5">
                <span>ओपन कम्युनिटी बाज़ार (Live Rewa Hub)</span>
                <span className="text-[10px] bg-[#8083ff]/20 text-[#8083ff] px-1.5 py-0.2 rounded font-extrabold">
                  {listings.length} लाइव
                </span>
              </p>
              <p className="text-[10px] text-[#908fa0] truncate">
                यहाँ एडमिन, दुकानदार और सभी लोकल यूज़र्स की पोस्ट एक साथ दिखती हैं
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncRefresh}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] text-[11px] font-bold flex items-center gap-1 transition-all"
              title="ताज़ा पोस्ट्स रिफ्रेश करें"
            >
              <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'लोड हो रहा...' : 'रिफ्रेश'}</span>
            </button>
            <button
              onClick={() => navigateTo('post-ad')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-[11px] font-black flex items-center gap-1 shadow hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>+ पोस्ट डालें</span>
            </button>
          </div>
        </div>
      </section>

      {/* Fresh Posts Spotlight Strip ("naya post hamesha front me dikhe") */}
      {newestListings.length > 0 && (
        <section className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-base">bolt</span>
              <h2 className="text-xs font-extrabold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
                <span>🔥 ताज़ा पोस्ट (Just Added Deals)</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-black border border-emerald-500/30">
                  FRONTLINE
                </span>
              </h2>
            </div>
            <button
              onClick={() => setFeedMode('newest')}
              className="text-[11px] font-bold text-[#8083ff] hover:underline"
            >
              सभी ताज़ा देखें &gt;
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {newestListings.map(item => (
              <div
                key={`spotlight_${item.id}`}
                onClick={() => navigateTo('product-detail', { listing: item })}
                className="w-44 sm:w-48 bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff] rounded-xl overflow-hidden shrink-0 cursor-pointer shadow-md group transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-[16/10] bg-black overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                    ✨ {item.postedAgo || 'Just now'}
                  </span>
                  {item.seller?.badges?.some(b => b.includes('Admin')) && (
                    <span className="absolute top-1.5 right-1.5 bg-amber-400 text-black font-black text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                      👑 Admin
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#dae2fd]">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#908fa0] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px] text-[#8083ff]">location_on</span>
                      {item.location.neighborhood}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold text-[#c7c4d7] line-clamp-1 mt-0.5 group-hover:text-[#8083ff]">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-[#908fa0]">
                    <span className="truncate max-w-[90px]">By {item.seller.name}</span>
                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                      ❤️ {item.favoritesCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Category Icons Strip */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-[#908fa0] uppercase tracking-wider">
            Explore Categories
          </h2>
          <button
            onClick={() => navigateTo('categories')}
            className="text-xs font-bold text-[#8083ff] hover:underline flex items-center gap-0.5"
          >
            <span>All Categories</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigateTo('search', { query: cat.name })}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#171f33] group-hover:bg-[#222a3d] border border-[#2d3449] group-hover:border-[#8083ff]/50 flex items-center justify-center transition-all group-hover:scale-105 shadow-sm">
                <span className="material-symbols-outlined text-2xl text-[#c0c1ff]">
                  {cat.icon}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#dae2fd] text-center line-clamp-1 leading-tight group-hover:text-[#8083ff]">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Shorts / Video Reels Carousel */}
      <section className="py-4 bg-[#131b2e]/60 border-y border-[#222a3d]/80 my-2">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffb2b7] animate-ping" />
            <h2 className="font-headline-sm text-[#dae2fd] flex items-center gap-1.5">
              <span>Trending Shorts in {location}</span>
              <span className="text-[10px] bg-[#ffb2b7]/20 text-[#ffb2b7] font-bold px-1.5 py-0.5 rounded border border-[#ffb2b7]/30">
                LIVE
              </span>
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shorts')}
            className="text-xs font-bold text-[#4edea3] hover:underline flex items-center gap-0.5"
          >
            <span>Watch All</span>
            <span className="material-symbols-outlined text-xs">play_arrow</span>
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar pb-1">
          {shorts.map(reel => (
            <div
              key={reel.id}
              onClick={() => openReelWalkaround(reel)}
              className="relative w-36 sm:w-44 aspect-[9/15] rounded-2xl overflow-hidden shrink-0 cursor-pointer group border border-[#2d3449] shadow-lg hover:border-[#8083ff] transition-all hover:scale-[1.02]"
            >
              <img
                src={reel.thumbnailUrl}
                alt={reel.listingTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Sound Wave Indicator */}
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-xs text-[#4edea3]">
                  graphic_eq
                </span>
              </div>

              {/* Duration Badge */}
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                0:{reel.durationSec}
              </div>

              {/* Bottom Card Content */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                <span className="text-[10px] font-bold text-[#4edea3] bg-[#003824]/80 px-1.5 py-0.5 rounded">
                  ₹{reel.price.toLocaleString()}
                </span>
                <h3 className="text-xs font-bold text-white mt-1 line-clamp-1">
                  {reel.listingTitle}
                </h3>
                <p className="text-[10px] text-[#c7c4d7] mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px] text-[#8083ff]">
                    verified
                  </span>
                  <span>{reel.sellerName}</span>
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#908fa0] mt-1 pt-1 border-t border-white/10">
                  <span>{reel.viewsCount.toLocaleString()} views</span>
                  <span className="text-[#8083ff] font-bold">Watch &gt;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* "Got Something to Sell?" Creative Promo Card */}
      <section className="px-4 my-4">
        <div className="bg-gradient-to-r from-[#171f33] to-[#222a3d] border border-[#2d3449] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#8083ff]/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#4edea3]">
              Rewa Hyperlocal Seller Hub
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#dae2fd] mt-0.5">
              Got a Bike, Phone, or Flat to sell?
            </h3>
            <p className="text-xs text-[#908fa0] mt-1">
              Add a 30s video walkaround reel for 5x more buyer enquiries.
            </p>
          </div>
          <button
            onClick={() => navigateTo('post-ad')}
            className="relative z-10 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black shrink-0 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#8083ff]/20"
          >
            Post in 30s
          </button>
        </div>
      </section>

      {/* Google Maps Discovery & AI Grounding Promo */}
      <section className="px-4 my-4">
        <div className="bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff]/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] shadow-md shadow-[#8083ff]/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl font-bold">explore</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-[#dae2fd]">
                  Explore Deals on Google Maps
                </h3>
                <span className="text-[9px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-1.5 py-0.5 rounded border border-[#4edea3]/30">
                  MAPS GROUNDED
                </span>
              </div>
              <p className="text-xs text-[#908fa0] mt-0.5">
                View verified listings on map pins across Rewa or query the Google Maps AI Navigator.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('map')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#dae2fd] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-base">map</span>
            <span>Open Interactive Map</span>
          </button>
        </div>
      </section>

      {/* Feed Mode & Category Filter Section */}
      <section className="px-4 mb-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-[#dae2fd] flex items-center gap-2">
              <span>Deals Near You in {location}</span>
              <span className="text-[10px] bg-[#8083ff]/20 text-[#8083ff] font-bold px-2 py-0.5 rounded-full border border-[#8083ff]/30">
                {feedMode === 'for_you' && '✨ आपके लिए'}
                {feedMode === 'newest' && '🆕 सबसे नया'}
                {feedMode === 'most_liked' && '❤️ सबसे लोकप्रिय'}
                {feedMode === 'random' && '🎲 रैंडम डिस्कवर'}
                {feedMode === 'reels' && '🎥 रील्स वाले'}
              </span>
            </h2>
            <p className="text-[11px] text-[#908fa0]">
              {filteredListings.length} verified listings • सभी यूज़र्स व एडमिन के लाइव विज्ञापन
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateTo('post-ad')}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black items-center gap-1 shadow hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>पोस्ट विज्ञापन</span>
            </button>
          </div>
        </div>

        {/* 1. Feed Mode Switcher Tabs (Smart Algorithm Controls) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'for_you', label: '✨ आपके लिए (For You)', desc: 'पसंद, सर्च व ताज़ा मिक्स' },
            { id: 'newest', label: '🆕 सबसे नया (Newest First)', desc: 'हमेसा फ्रंट में ताज़ा पोस्ट' },
            { id: 'most_liked', label: '❤️ सबसे लोकप्रिय (Most Liked)', desc: 'ज़्यादा पसंद किए गए' },
            { id: 'random', label: '🎲 रैंडम डिस्कवर (Discover)', desc: 'सरप्राइज व छुपे सौदे' },
            { id: 'reels', label: '🎥 30s वीडियो रील्स', desc: 'वीडियो वॉकअराउंड' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFeedMode(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                feedMode === tab.id
                  ? 'bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] shadow-md font-black scale-[1.02]'
                  : 'bg-[#171f33] text-[#dae2fd]/80 hover:text-[#dae2fd] border border-[#2d3449] hover:border-[#8083ff]/40'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 2. User Search History ribbon (अगर यूज़र ने पहले कुछ सर्च किया है) */}
        {searchHistory && searchHistory.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-[#131b2e]/60 px-2.5 rounded-xl border border-[#222a3d]">
            <span className="text-[10px] text-[#908fa0] uppercase tracking-wider font-extrabold whitespace-nowrap flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-xs text-[#8083ff]">history</span>
              <span>आपकी हालिया खोज:</span>
            </span>
            {searchHistory.slice(0, 5).map(q => (
              <button
                key={q}
                onClick={() => navigateTo('search', { query: q })}
                className="px-2 py-0.5 rounded-full bg-[#1c253b] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#dae2fd] text-[10px] font-bold border border-[#2d3449] shrink-0 transition-colors flex items-center gap-1"
                title={`Search again for "${q}"`}
              >
                <span>{q}</span>
              </button>
            ))}
          </div>
        )}

        {/* 3. Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'सभी श्रेणियां (All Deals)' },
            { id: 'vehicles', label: '🏍️ गाड़ियां व बाइक्स' },
            { id: 'mobiles', label: '📱 मोबाइल व गैजेट्स' },
            { id: 'property', label: '🏠 फ्लैट्स व मकान' },
            { id: 'electronics', label: '💻 इलेक्ट्रॉनिक्स' },
            { id: 'fashion', label: '👗 फैशन व परिधान' },
            { id: 'agri', label: '🚜 कृषि व ट्रैक्टर' },
            { id: 'jobs', label: '💼 नौकरियां' },
            { id: 'pets', label: '🐄 पशु व पालतू जानवर' },
            { id: 'books', label: '📚 किताबें' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-[#8083ff] text-[#0b1326] font-bold'
                  : 'bg-[#171f33] text-[#908fa0] hover:text-[#dae2fd] border border-[#2d3449]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. Hyper-Local Distance Radius & Sorting Bar (दूरी फ़िल्टर) */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-md">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-[11px] font-extrabold text-[#4edea3] flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-sm">near_me</span>
              <span>दूरी दायरा (Radius):</span>
            </span>

            {/* Quick Distance Radius Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { km: 0, label: 'सभी (All)' },
                { km: 5, label: '🎯 5 km' },
                { km: 10, label: '🎯 10 km' },
                { km: 25, label: '🎯 25 km' },
                { km: 50, label: '🎯 50 km' },
              ].map(item => (
                <button
                  key={item.km}
                  onClick={() => setRadiusFilter(item.km)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                    radiusFilter === item.km
                      ? 'bg-[#4edea3] text-[#0b1326] shadow font-black'
                      : 'bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd]/70 hover:text-white border border-[#2d3449]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nearest First Sort Toggle */}
          <button
            onClick={() => setSortByDistance(!sortByDistance)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-end sm:self-auto shrink-0 ${
              sortByDistance
                ? 'bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black shadow-md'
                : 'bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] border border-[#2d3449]'
            }`}
            title="Sabse nazdeeki saman pehle dikhayein"
          >
            <span className="material-symbols-outlined text-sm">
              {sortByDistance ? 'check_circle' : 'swap_vert'}
            </span>
            <span>{sortByDistance ? '✓ पास वाले पहले' : 'पास वाले पहले (Nearest)'}</span>
          </button>
        </div>
      </section>

      {/* Main Listings Grid */}
      <section className="px-4">
        {filteredListings.length === 0 ? (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-8 text-center my-6">
            <span className="material-symbols-outlined text-4xl text-[#908fa0] mb-2">search_off</span>
            <h3 className="text-sm font-extrabold text-[#dae2fd]">इस श्रेणी में अभी कोई पोस्ट नहीं है</h3>
            <p className="text-xs text-[#908fa0] mt-1 max-w-sm mx-auto">
              आप पहली पोस्ट डालकर शुरुआत कर सकते हैं या दूसरे फ़िल्टर चुन सकते हैं।
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setFeedMode('for_you');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#222a3d] text-xs font-bold text-[#dae2fd] hover:bg-[#8083ff] hover:text-[#0b1326] transition-colors"
              >
                सभी पोस्ट्स देखें
              </button>
              <button
                onClick={() => navigateTo('post-ad')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-xs font-black text-[#0b1326] shadow"
              >
                + विज्ञापन पोस्ट करें
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredListings.map(listing => {
              const isSaved = savedListingIds.has(listing.id);
              const { reason } = calculateListingScore(listing);
              const isAdminPoster = listing.seller?.badges?.some(b => b.includes('Admin')) || listing.seller?.id === 'admin_master';

              return (
                <div
                  key={listing.id}
                  onClick={() => navigateTo('product-detail', { listing })}
                  className={`bg-[#171f33] border rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-xl group ${
                    listing.featured && listing.status !== 'sold'
                      ? 'border-amber-400/80 shadow-lg shadow-amber-500/10 hover:border-amber-400 ring-1 ring-amber-400/30'
                      : 'border-[#2d3449] hover:border-[#8083ff]/60'
                  }`}
                >
                  {/* Photo & Top Badges */}
                  <div className="relative aspect-[4/3] bg-black overflow-hidden">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Algorithmic Reason Badge (क्यों दिख रहा है) */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
                      {reason === 'new' && (
                        <span className="bg-emerald-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 animate-pulse">
                          ✨ ताज़ा पोस्ट
                        </span>
                      )}
                      {reason === 'search_match' && (
                        <span className="bg-purple-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                          🎯 आपकी पसंद
                        </span>
                      )}
                      {reason === 'popular' && (
                        <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                          ❤️ टॉप पसंद
                        </span>
                      )}
                      {reason === 'random' && (
                        <span className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                          🎲 डिस्कवर
                        </span>
                      )}
                      {isAdminPoster && (
                        <span className="bg-amber-400 text-black font-black text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                          👑 Admin
                        </span>
                      )}
                      {listing.featured && listing.status !== 'sold' && (
                        <span className="bg-amber-400 text-black font-black text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 animate-bounce">
                          ⭐ FEATURED
                        </span>
                      )}
                    </div>

                    {/* SOLD Overlay Banner */}
                    {listing.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-[1.5px] flex items-center justify-center z-20 pointer-events-none">
                        <div className="bg-rose-600/95 text-white font-black text-[11px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-2xl border border-white/30 transform -rotate-6">
                          SOLD • बिक गया
                        </div>
                      </div>
                    )}

                    {/* Favorite Heart Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(listing.id);
                      }}
                      className={`absolute top-2 right-2 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-125 z-20 ${
                        isSaved
                          ? 'bg-[#ffb2b7] text-[#67001b]'
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                      title={isSaved ? 'Saved to Favorites' : 'Save / Like Post'}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">
                        favorite
                      </span>
                    </button>

                    {/* 30s Video Walkaround Reel Badge */}
                    {listing.hasVideoReel && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openReelWalkaround(listing);
                        }}
                        className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md border border-[#8083ff]/50 hover:bg-[#8083ff] hover:text-[#0b1326] text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold transition-colors z-10"
                      >
                        <span className="material-symbols-outlined text-xs text-[#ffb2b7]">
                          play_circle
                        </span>
                        <span>30s Reel</span>
                      </button>
                    )}

                    {/* Verified RC / Guarantee Tag */}
                    {listing.verifiedRC && (
                      <span className="absolute bottom-2 left-2 bg-[#00885d] text-[#000703] font-bold text-[9px] px-1.5 py-0.5 rounded shadow z-10">
                        VERIFIED RC
                      </span>
                    )}

                    {/* Corner Views Count Badge */}
                    <div
                      className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md border border-white/20 text-[#dae2fd] px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-extrabold shadow-md z-10 pointer-events-none"
                      title={`${(listing.viewsCount || 1).toLocaleString()} people viewed this ad`}
                    >
                      <span className="material-symbols-outlined text-xs text-[#38bdf8]">
                        visibility
                      </span>
                      <span>{(listing.viewsCount || 1).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price & Negotiable & Favorites */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-price-card text-[#dae2fd]">
                            ₹{listing.price.toLocaleString()}
                          </span>
                          {listing.originalPrice && (
                            <span className="text-[11px] text-[#908fa0] line-through">
                              ₹{listing.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {listing.favoritesCount > 0 && (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 flex items-center gap-0.5">
                              ❤️ {listing.favoritesCount}
                            </span>
                          )}
                          {listing.negotiable && (
                            <span className="text-[9px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-1 py-0.2 rounded border border-[#4edea3]/30">
                              Neg
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-bold text-[#dae2fd] line-clamp-2 mt-1 leading-snug group-hover:text-[#8083ff] transition-colors">
                        {listing.title}
                      </h3>

                      {/* Seller info pill */}
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#908fa0]">
                        <span className="truncate">
                          {isAdminPoster ? '👑 ' : '👤 '}{listing.seller?.name}
                        </span>
                        <span>•</span>
                        <span className="text-[#4edea3]">{listing.postedAgo}</span>
                      </div>
                    </div>

                    {/* Bottom Meta & Action */}
                    <div className="mt-2.5 pt-2 border-t border-[#222a3d] flex items-center justify-between text-[10px] text-[#908fa0]">
                      <div className="flex items-center gap-1 truncate max-w-[125px]">
                        <span className="material-symbols-outlined text-[13px] text-[#4edea3] shrink-0">
                          near_me
                        </span>
                        <span className="text-[#4edea3] font-black shrink-0">
                          {listing.location?.distanceKm ? `${listing.location.distanceKm} km` : '1.5 km'}
                        </span>
                        <span className="truncate text-[#908fa0]">
                          • {listing.location.neighborhood}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openOfferModal(listing);
                          }}
                          className="px-2 py-1 rounded bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] font-bold text-[10px] transition-colors whitespace-nowrap"
                          title="Submit Bargain Offer"
                        >
                          Offer
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openChatForListing(listing);
                          }}
                          className="px-2.5 py-1 rounded bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-[10px] shadow-sm hover:opacity-95 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1"
                          title={`Chat with ${listing.seller?.proprietorName || listing.seller?.name || 'Seller'}`}
                        >
                          <span className="material-symbols-outlined text-[12px] font-bold">chat</span>
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Comprehensive Footer with Disclaimer, Privacy Policy, Terms, and Contact Support */}
      <Footer />

      {/* Floating Quick Map Deals Action Button */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          onClick={() => navigateTo('map')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#171f33]/90 hover:bg-[#222a3d] text-white border border-[#4edea3]/50 shadow-xl shadow-black/60 hover:scale-105 active:scale-95 transition-all group backdrop-blur-md"
          title="Explore Deals Near You on Interactive Map"
        >
          <span className="material-symbols-outlined text-[#4edea3] text-lg group-hover:rotate-12 transition-transform">
            map
          </span>
          <span className="text-xs font-bold text-[#dae2fd]">Map Deals</span>
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
        </button>
      </div>
    </div>
  );
};
