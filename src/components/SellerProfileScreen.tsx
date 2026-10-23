import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SellerProfileScreen: React.FC = () => {
  const {
    selectedSeller,
    selectedListing,
    goBack,
    listings,
    shorts,
    openReelWalkaround,
    navigateTo,
    openChatForListing,
    followedSellerIds,
    toggleFollowSeller,
    openOfferModal,
    showToast,
    openReviewModal,
    getSellerReviews,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'reels' | 'reviews'>('listings');
  const seller = selectedSeller;
  const isFollowing = followedSellerIds.has(seller.handle);

  const sellerListings = listings.filter(l => l.seller.id === seller.id || l.seller.handle === seller.handle);
  const sellerReels = shorts.filter(s => s.sellerHandle === seller.handle);
  const sellerReviews = getSellerReviews(seller.id);

  const handleCall = () => {
    showToast(`📞 Dialing ${seller.phone} (${seller.name})...`);
  };

  return (
    <div className="pb-28 max-w-3xl mx-auto bg-[#0b1326] min-h-screen">
      {/* Top App Bar */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/90 backdrop-blur-md border-b border-[#222a3d] px-4 py-3 flex items-center justify-between">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>

        <span className="text-xs font-bold text-[#dae2fd]">
          Verified Dealership Profile
        </span>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            showToast('🔗 Store link copied to clipboard!');
          }}
          className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-lg">share</span>
        </button>
      </div>

      {/* Storefront Hero Glass Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-[#171f33] via-[#1a233a] to-[#131b2e] border border-[#2d3449] rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#8083ff]/10 blur-3xl pointer-events-none" />

          {/* Top Identity Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#8083ff] shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#4edea3] text-[#003824] rounded-full p-0.5 shadow">
                  <span className="material-symbols-outlined text-xs font-bold block">
                    verified
                  </span>
                </span>
              </div>

              <div>
                <h1 className="font-headline-sm text-[#dae2fd]">
                  {seller.name}
                </h1>
                <p className="text-xs text-[#908fa0]">
                  {seller.proprietorName && `Prop. ${seller.proprietorName} • `}
                  {seller.handle}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-extrabold text-[#dae2fd] flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs text-amber-400">
                      star
                    </span>
                    <span>{seller.rating}</span>
                    <span className="text-[#908fa0] font-normal">
                      ({seller.reviewsCount} reviews)
                    </span>
                  </span>
                  <span className="text-[10px] bg-[#00885d]/30 text-[#4edea3] font-bold px-2 py-0.2 rounded border border-[#00885d]/40">
                    {seller.trustScore}% Trust
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button
              onClick={() => toggleFollowSeller(seller.handle)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isFollowing
                  ? 'bg-[#4edea3] text-[#003824]'
                  : 'bg-[#8083ff] text-[#0b1326] hover:scale-105'
              }`}
            >
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          </div>

          {/* Verification Badges */}
          <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-[#222a3d]">
            {seller.badges.map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold text-[#c0c1ff] bg-[#222a3d] px-2.5 py-1 rounded-full border border-[#2d3449] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs text-[#4edea3]">
                  verified
                </span>
                <span>{badge}</span>
              </span>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#222a3d] text-center">
            <div>
              <span className="text-sm font-black text-[#dae2fd] block">
                {seller.activeAdsCount}
              </span>
              <span className="text-[10px] text-[#908fa0]">Active Ads</span>
            </div>
            <div>
              <span className="text-sm font-black text-[#dae2fd] block">
                {seller.soldCount}
              </span>
              <span className="text-[10px] text-[#908fa0]">Sold</span>
            </div>
            <div>
              <span className="text-sm font-black text-[#dae2fd] block">
                {seller.followersCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#908fa0]">Followers</span>
            </div>
            <div>
              <span className="text-sm font-black text-[#4edea3] block">
                {seller.reelViewsCount}
              </span>
              <span className="text-[10px] text-[#908fa0]">Reel Views</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#222a3d]">
            <button
              onClick={() => {
                const target = sellerListings[0] || selectedListing;
                if (target) openChatForListing(target);
              }}
              className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center justify-center gap-1 shadow-md shadow-[#8083ff]/30 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                chat
              </span>
              <span>Bargain Chat</span>
            </button>

            <button
              onClick={handleCall}
              className="py-2.5 px-2 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-[#4edea3]">
                call
              </span>
              <span>Call Dealer</span>
            </button>

            <button
              onClick={() => openReviewModal(seller)}
              className="py-2.5 px-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95"
              title="Seller ko review aur rating dein"
            >
              <span className="material-symbols-outlined text-sm text-amber-400 font-bold">
                star
              </span>
              <span>+ Rating दें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Walkaround Reels Carousel from this Seller */}
      {sellerReels.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffb2b7] text-base">
                play_circle
              </span>
              <span>Walkaround Reels by {seller.name}</span>
            </h3>
            <span className="text-xs text-[#8083ff] font-semibold">
              {sellerReels.length} Videos
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {sellerReels.map(reel => (
              <div
                key={reel.id}
                onClick={() => openReelWalkaround(reel)}
                className="relative w-32 aspect-[9/15] rounded-xl overflow-hidden shrink-0 cursor-pointer group border border-[#2d3449]"
              >
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.listingTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-1.5 right-1.5 bg-black/60 px-1 py-0.5 rounded text-[8px] font-bold text-white">
                  0:{reel.durationSec}
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <span className="text-[9px] font-bold text-[#4edea3] block">
                    ₹{reel.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold line-clamp-1 block">
                    {reel.listingTitle}
                  </span>
                  <span className="text-[9px] text-[#c7c4d7]">
                    {reel.viewsCount.toLocaleString()} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Segmented Tabs */}
      <div className="px-4 mb-3">
        <div className="flex border-b border-[#222a3d]">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            Listings ({sellerListings.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            Reviews & Trust ({seller.reviewsCount})
          </button>
        </div>
      </div>

      {/* Tab Content: Listings */}
      {activeTab === 'listings' && (
        <div className="px-4 space-y-3">
          {sellerListings.map(listing => (
            <div
              key={listing.id}
              onClick={() => navigateTo('product-detail', { listing })}
              className="bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff]/50 rounded-2xl p-3 flex gap-3 cursor-pointer transition-all"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {listing.hasVideoReel && (
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px] text-[#ffb2b7]">
                      play_circle
                    </span>
                    <span>Reel</span>
                  </span>
                )}

                {/* Views count in corner */}
                <span className="absolute bottom-1 right-1 bg-black/80 text-[#dae2fd] text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-white/10">
                  <span className="material-symbols-outlined text-[10px] text-[#38bdf8]">visibility</span>
                  <span>{(listing.viewsCount || 1).toLocaleString()}</span>
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-price-card text-[#dae2fd]">
                      ₹{listing.price.toLocaleString()}
                    </span>
                    {listing.negotiable && (
                      <span className="text-[9px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-1.5 py-0.2 rounded">
                        Negotiable
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-[#dae2fd] line-clamp-1 mt-0.5">
                    {listing.title}
                  </h3>
                  <p className="text-[10px] text-[#908fa0] mt-0.5">
                    {listing.attributes.odometerKm || '14,200 km'} • {listing.attributes.fuelType || 'Petrol'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#2d3449]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#908fa0]">
                      {listing.location.neighborhood}
                    </span>
                    <span className="text-[9px] text-[#38bdf8] font-bold flex items-center gap-0.5" title="Total Views">
                      <span className="material-symbols-outlined text-[10px]">visibility</span>
                      <span>{(listing.viewsCount || 1).toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openOfferModal(listing);
                      }}
                      className="px-2 py-0.5 rounded bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] text-[10px] font-bold transition-colors"
                    >
                      Bargain
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openChatForListing(listing);
                      }}
                      className="px-2 py-0.5 rounded bg-[#8083ff] text-[#0b1326] text-[10px] font-bold"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Reviews */}
      {activeTab === 'reviews' && (
        <div className="px-4 space-y-3">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-black text-[#dae2fd]">
                  {seller.rating}
                </span>
                <span className="text-amber-400 text-xl font-bold">★</span>
                <span className="text-xs text-[#908fa0]">/ 5.0</span>
              </div>
              <p className="text-xs text-[#908fa0] mt-0.5">
                Based on {sellerReviews.length} verified buyer reviews
              </p>
            </div>

            <button
              onClick={() => openReviewModal(seller)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm font-bold">rate_review</span>
              <span>+ Review Likhein</span>
            </button>
          </div>

          {/* User Review Cards */}
          {sellerReviews.length === 0 ? (
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-6 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-amber-400">rate_review</span>
              <p className="text-xs text-[#dae2fd] font-bold">Abhi tak koi review nahi likha gaya hai</p>
              <button
                onClick={() => openReviewModal(seller)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-black shadow"
              >
                + Pehla Review Likhein
              </button>
            </div>
          ) : (
            sellerReviews.map(rev => (
              <div key={rev.id} className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3.5 space-y-2 hover:border-[#8083ff]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center justify-center">
                      {rev.authorName ? rev.authorName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-[#dae2fd]">{rev.authorName}</span>
                        {rev.verifiedBuyer && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">check</span>
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#908fa0]">{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400 text-sm font-bold">
                    {'★'.repeat(rev.rating)}
                    <span className="text-[11px] text-[#908fa0] ml-1">({rev.rating}.0)</span>
                  </div>
                </div>

                {/* Feedback Tags / Badges */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rev.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-semibold bg-[#131b2e] border border-[#2d3449] text-[#c0c1ff] px-2 py-0.5 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[#c7c4d7] leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dealership Physical Store Address Card */}
      <div className="p-4 mt-2">
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#4edea3]">
              storefront
            </span>
            <span>Visit Physical Dealership</span>
          </h3>
          <p className="text-xs text-[#c7c4d7]">
            {seller.address}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#908fa0] pt-2 border-t border-[#222a3d]">
            <span>GSTIN: {seller.gstNumber}</span>
            <span>Dealer ID: {seller.dealerId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
