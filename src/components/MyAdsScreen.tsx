import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Listing } from '../types';

export const MyAdsScreen: React.FC = () => {
  const {
    userListings,
    toggleListingSoldStatus,
    deleteListing,
    boostListing,
    openBoostModal,
    updateListing,
    navigateTo,
    goBack,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'sold' | 'featured'>('all');
  const [editingAd, setEditingAd] = useState<Listing | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeAdsCount = userListings.filter(l => l.status !== 'sold').length;
  const soldAdsCount = userListings.filter(l => l.status === 'sold').length;
  const featuredAdsCount = userListings.filter(l => l.featured).length;
  const totalViews = userListings.reduce((sum, l) => sum + (l.viewsCount || 1), 0);

  const filteredAds = userListings.filter(ad => {
    if (activeTab === 'active') return ad.status !== 'sold';
    if (activeTab === 'sold') return ad.status === 'sold';
    if (activeTab === 'featured') return ad.featured;
    return true;
  });

  const handleOpenEditPrice = (ad: Listing) => {
    setEditingAd(ad);
    setNewPrice(String(ad.price));
  };

  const handleSavePrice = async () => {
    if (!editingAd) return;
    const priceNum = parseInt(newPrice.replace(/[^0-9]/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      showToast('❌ Kripya sahi price darj karein');
      return;
    }
    await updateListing(editingAd.id, {
      price: priceNum,
      originalPrice: editingAd.price > priceNum ? editingAd.price : editingAd.originalPrice,
    });
    showToast(`✅ Price safalta-poorvak update ho gaya: ₹${priceNum.toLocaleString()}`);
    setEditingAd(null);
  };

  return (
    <div className="pb-28 max-w-3xl mx-auto bg-[#0b1326] min-h-screen text-[#dae2fd]">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/95 backdrop-blur-md border-b border-[#222a3d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
            title="Wapas jayein"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline-sm text-[#dae2fd] text-base sm:text-lg flex items-center gap-1.5">
              <span>मेरे विज्ञापन</span>
              <span className="text-xs text-[#908fa0] font-normal">(My Ads)</span>
            </h1>
            <p className="text-[11px] text-[#908fa0]">
              Apne sabhi ads manage karein, 'Sold' mark karein ya price badlein
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('post-ad')}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center gap-1 shadow-md shadow-[#8083ff]/20 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          <span>+ Naya Ad</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Stats Rail */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3 text-center">
            <span className="text-base sm:text-lg font-black text-[#dae2fd] block">
              {userListings.length}
            </span>
            <span className="text-[10px] text-[#908fa0]">Kul Ads</span>
          </div>

          <div className="bg-[#171f33] border border-emerald-500/30 rounded-2xl p-3 text-center">
            <span className="text-base sm:text-lg font-black text-emerald-400 block">
              {activeAdsCount}
            </span>
            <span className="text-[10px] text-[#908fa0]">🟢 Active</span>
          </div>

          <div className="bg-[#171f33] border border-rose-500/30 rounded-2xl p-3 text-center">
            <span className="text-base sm:text-lg font-black text-rose-400 block">
              {soldAdsCount}
            </span>
            <span className="text-[10px] text-[#908fa0]">🔴 Sold (बिक गया)</span>
          </div>

          <div className="bg-[#171f33] border border-[#8083ff]/30 rounded-2xl p-3 text-center">
            <span className="text-base sm:text-lg font-black text-[#8083ff] block">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#908fa0]">Total Views</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#131b2e] rounded-2xl border border-[#222a3d] overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: `Sabhi (${userListings.length})` },
            { id: 'active', label: `Active (${activeAdsCount})` },
            { id: 'sold', label: `Bik Gaye (${soldAdsCount})` },
            { id: 'featured', label: `⭐ Boosted (${featuredAdsCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] shadow'
                  : 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ads List */}
        {filteredAds.length === 0 ? (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-3xl p-8 text-center my-6">
            <div className="w-16 h-16 rounded-full bg-[#131b2e] border border-[#2d3449] flex items-center justify-center mx-auto mb-3 text-3xl">
              📦
            </div>
            <h3 className="text-base font-extrabold text-[#dae2fd]">
              {activeTab === 'sold'
                ? 'Abhi tak koi ad Sold mark nahi hua hai'
                : activeTab === 'featured'
                ? 'Koi Boosted ya Featured ad nahi hai'
                : 'Aapne abhi tak koi ad post nahi kiya hai'}
            </h3>
            <p className="text-xs text-[#908fa0] mt-1 max-w-sm mx-auto">
              Apni purani bike, mobile, plot ya saman bechne ke liye sirf 30 seconds me free ad dalein.
            </p>
            <div className="mt-5">
              <button
                onClick={() => navigateTo('post-ad')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black shadow-lg shadow-[#8083ff]/30 hover:scale-105 active:scale-95 transition-all"
              >
                + Free Ad Post Karein
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredAds.map(ad => {
              const isSold = ad.status === 'sold';

              return (
                <div
                  key={ad.id}
                  className={`bg-[#171f33] border rounded-2xl p-4 transition-all hover:shadow-xl relative overflow-hidden ${
                    isSold
                      ? 'border-rose-900/40 bg-[#151a28]/70 opacity-90'
                      : ad.featured
                      ? 'border-amber-400/50 shadow-amber-500/5'
                      : 'border-[#2d3449]'
                  }`}
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Thumbnail Image with Sold/Featured Badge */}
                    <div
                      onClick={() => navigateTo('product-detail', { listing: ad })}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer group"
                    >
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />

                      {isSold && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-1">
                          <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                            SOLD
                          </span>
                        </div>
                      )}

                      {ad.featured && !isSold && (
                        <div className="absolute top-1 left-1 bg-amber-400 text-black font-black text-[8px] px-1.5 py-0.5 rounded shadow">
                          ⭐ BOOSTED
                        </div>
                      )}
                    </div>

                    {/* Details Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#8083ff] uppercase tracking-wider block truncate">
                            {ad.categoryName} • {ad.subCategory || 'General'}
                          </span>
                          <h2
                            onClick={() => navigateTo('product-detail', { listing: ad })}
                            className="text-sm font-extrabold text-[#dae2fd] truncate cursor-pointer hover:text-[#8083ff] transition-colors"
                          >
                            {ad.title}
                          </h2>
                        </div>

                        {/* Status Chip */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                            isSold
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          <span>{isSold ? 'बिक गया (Sold)' : 'सक्रिय (Active)'}</span>
                        </span>
                      </div>

                      {/* Price & Negotiation */}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-base font-black text-[#4edea3]">
                          ₹{ad.price.toLocaleString()}
                        </span>
                        {ad.originalPrice && ad.originalPrice > ad.price && (
                          <span className="text-xs text-[#908fa0] line-through">
                            ₹{ad.originalPrice.toLocaleString()}
                          </span>
                        )}
                        {ad.negotiable && (
                          <span className="text-[10px] text-[#908fa0]"> मोल-भाव संभव</span>
                        )}
                      </div>

                      {/* Views & Engagement Stats */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-[#908fa0]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-[#38bdf8]">
                            visibility
                          </span>
                          <span>{(ad.viewsCount || 1).toLocaleString()} views</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-[#ffb2b7]">
                            favorite
                          </span>
                          <span>{ad.favoritesCount || 0} likes</span>
                        </span>

                        <span className="text-[10px] text-[#908fa0]/70 truncate">
                          📅 {ad.postedAgo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Rail (Mark Sold / Boost / Edit Price / Delete) */}
                  <div className="mt-3 pt-3 border-t border-[#222a3d] flex items-center gap-2 flex-wrap">
                    {/* Mark Sold Toggle Button */}
                    <button
                      onClick={() => toggleListingSoldStatus(ad.id)}
                      className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                        isSold
                          ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                      }`}
                      title={isSold ? 'Wapas Active Banayein' : 'Mark as Sold (Bik Gaya)'}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">
                        {isSold ? 'restart_alt' : 'check_circle'}
                      </span>
                      <span>{isSold ? 'सक्रिय करें (Make Active)' : 'बिक गया (Mark as Sold)'}</span>
                    </button>

                    {/* Boost Ad Button */}
                    {!isSold && (
                      <button
                        onClick={() => openBoostModal(ad)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                          ad.featured
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-[#222a3d] hover:bg-amber-400 hover:text-black border border-[#2d3449] text-[#dae2fd]'
                        }`}
                        title="Top of feed par pin karein"
                      >
                        <span className="material-symbols-outlined text-sm text-amber-400">
                          rocket_launch
                        </span>
                        <span>{ad.featured ? 'Boosted' : '⚡ Boost'}</span>
                      </button>
                    )}

                    {/* Edit Price Button */}
                    <button
                      onClick={() => handleOpenEditPrice(ad)}
                      className="py-2 px-3 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-[#dae2fd] text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Price badlein"
                    >
                      <span className="material-symbols-outlined text-sm text-[#4edea3]">
                        edit
                      </span>
                      <span>Price</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteConfirmId(ad.id)}
                      className="w-9 h-9 rounded-xl bg-[#222a3d] hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 border border-[#2d3449] flex items-center justify-center transition-colors"
                      title="Ad delete karein"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>

                    {/* View Live Button */}
                    <button
                      onClick={() => navigateTo('product-detail', { listing: ad })}
                      className="w-9 h-9 rounded-xl bg-[#222a3d] hover:bg-[#8083ff]/20 hover:border-[#8083ff]/40 text-[#8083ff] border border-[#2d3449] flex items-center justify-center transition-colors"
                      title="Live Ad dekhein"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Price Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#dae2fd]">
                Price Badlein (Update Price)
              </h3>
              <button
                onClick={() => setEditingAd(null)}
                className="w-8 h-8 rounded-full bg-[#131b2e] text-[#908fa0] flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#908fa0] line-clamp-1">
              Ad: <strong className="text-white">{editingAd.title}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-[#908fa0] block mb-1.5">
                Naya Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-[#4edea3]">
                  ₹
                </span>
                <input
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#4edea3] rounded-xl pl-8 pr-4 py-2.5 text-base font-black text-[#dae2fd] outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setEditingAd(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-bold text-[#908fa0] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrice}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-xs font-black text-[#0b1326] shadow-md shadow-[#8083ff]/30 active:scale-95 transition-transform"
              >
                Save Karein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#171f33] border border-rose-500/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-2xl">
              🗑️
            </div>
            <h3 className="text-base font-extrabold text-[#dae2fd]">
              Kya aap is ad ko delete karna chahte hain?
            </h3>
            <p className="text-xs text-[#908fa0]">
              Delete karne ke baad ye ad public feed aur search se hamesha ke liye hat jayega. Agar saman bik gaya hai toh aap use "Mark as Sold" bhi kar sakte hain.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-bold text-[#dae2fd]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await deleteListing(id);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white shadow-md active:scale-95 transition-all"
              >
                Haan, Delete Karein
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
