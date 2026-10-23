import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { ScreenType } from '../types';

export const Header: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    location,
    setLocation,
    unreadChatCount,
    viewMode,
    toggleViewMode,
    openToolsModal,
    isAdmin,
    openAuthModal,
    currentUser,
    openSafetyModal,
  } = useApp();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locations = ['Rewa, MP', 'Satna, MP', 'Sidhi, MP', 'Maihar, MP', 'Bhopal, MP'];

  if (currentScreen === 'shorts') {
    // In full-screen Shorts, the header is overlaid or handled inside the shorts player
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0b1326]/95 backdrop-blur-md border-b border-[#222a3d] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center shadow-md shadow-[#8083ff]/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[#0b1326] font-bold text-xl">
              play_circle
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#dae2fd] leading-tight flex items-center gap-1">
              Bazaar<span className="text-[#8083ff]">Reels</span>
              <span className="text-[9px] bg-[#8083ff]/20 text-[#c0c1ff] font-bold px-1.5 py-0.5 rounded border border-[#8083ff]/30">
                REWA
              </span>
            </span>
            <span className="text-[10px] text-[#908fa0] font-medium tracking-wide">
              Buy • Sell • Discover
            </span>
          </div>
        </div>

        {/* Center: Search Bar & Location Selector (desktop/tablet) */}
        <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 mx-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908fa0] text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search Honda bike, iPhone, 2BHK flat in Rewa..."
              onClick={() => navigateTo('search')}
              className="w-full bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff]/50 rounded-full pl-10 pr-4 py-2 text-sm text-[#dae2fd] placeholder-[#908fa0] focus:outline-none focus:border-[#8083ff] transition-colors cursor-pointer"
              readOnly
            />
          </div>

          {/* Location Chip */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#171f33] border border-[#2d3449] hover:bg-[#222a3d] text-xs font-semibold text-[#c0c1ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[#4edea3] text-sm">
                location_on
              </span>
              <span>{location}</span>
              <span className="material-symbols-outlined text-xs text-[#908fa0]">
                expand_more
              </span>
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#171f33] border border-[#2d3449] rounded-xl shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-[#908fa0] uppercase tracking-wider border-b border-[#222a3d]">
                  Select City
                </div>
                {locations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#222a3d] transition-colors ${
                      location === loc ? 'text-[#8083ff] bg-[#222a3d]/50 font-bold' : 'text-[#dae2fd]'
                    }`}
                  >
                    <span>{loc}</span>
                    {location === loc && (
                      <span className="material-symbols-outlined text-xs text-[#4edea3]">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle: Device Mockup vs Responsive Web */}
          <button
            onClick={toggleViewMode}
            title={viewMode === 'mobile' ? 'Switch to Wide Responsive Desktop View' : 'Switch to Mobile App Preview'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-semibold text-[#dae2fd] transition-all"
          >
            <span className="material-symbols-outlined text-sm text-[#c0c1ff]">
              {viewMode === 'mobile' ? 'devices' : 'smartphone'}
            </span>
            <span className="hidden sm:inline text-[11px]">
              {viewMode === 'mobile' ? 'Wide View' : 'Mobile View'}
            </span>
          </button>

          {/* Hyperlocal Map Deals Quick Access */}
          <button
            onClick={() => navigateTo('map')}
            title="Interactive Map & Deals Near You"
            className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold ${
              currentScreen === 'map'
                ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3] shadow-sm shadow-[#4edea3]/20'
                : 'bg-[#171f33] border-[#2d3449] text-[#908fa0] hover:text-[#4edea3] hover:border-[#4edea3]/40'
            }`}
          >
            <span className="material-symbols-outlined text-base text-[#4edea3]">
              map
            </span>
            <span className="hidden sm:inline">Map Deals</span>
          </button>

          {/* Marketplace Tools Quick Access */}
          <button
            onClick={() => openToolsModal('rc')}
            title="Rewa Marketplace Tools: RC Verification & Price Calculator"
            className="px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold bg-[#171f33] border-[#2d3449] text-[#dae2fd] hover:text-[#4edea3] hover:border-[#4edea3]/40"
          >
            <span className="material-symbols-outlined text-base text-[#4edea3]">
              build_circle
            </span>
            <span className="hidden sm:inline">Tools</span>
          </button>

          {/* Shorts Feed Quick Access */}
          <button
            onClick={() => navigateTo('shorts')}
            title="Video Walkaround Reels Feed"
            className="px-2.5 py-1.5 rounded-lg border border-[#2d3449] bg-[#171f33] text-[#dae2fd] hover:text-[#8083ff] hover:border-[#8083ff]/40 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-base text-[#8083ff]">
              play_circle
            </span>
            <span className="hidden sm:inline">Shorts</span>
          </button>

          {/* Admin Panel Quick Access - Only visible to authenticated Admin (Amrit Arjun) */}
          {isAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              title="Admin & Moderation Panel (Owner: Amrit Arjun)"
              className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-black ${
                currentScreen === 'admin'
                  ? 'bg-amber-400/25 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 shadow-sm'
              }`}
            >
              <span className="text-sm">👑</span>
              <span className="text-[11px] font-black tracking-wide">ADMIN</span>
            </button>
          )}

          {/* New Account / Sign Up button on Header */}
          <button
            onClick={() => openAuthModal('signup')}
            title="Naya Account Banayein"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black shadow-sm transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-sm font-bold">person_add</span>
            <span>+ Sign Up</span>
          </button>

          {/* My Ads (मेरे विज्ञापन) Shortcut */}
          <button
            onClick={() => navigateTo('my-ads')}
            title="My Advertisements (मेरे विज्ञापन)"
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-bold ${
              currentScreen === 'my-ads'
                ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#8083ff]'
                : 'bg-[#171f33] border-[#2d3449] text-[#dae2fd] hover:border-[#8083ff]/50'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#4edea3]">list_alt</span>
            <span>My Ads</span>
          </button>

          {/* Safety Shield Button */}
          <button
            onClick={openSafetyModal}
            title="Safety Tips & OLX Fraud Prevention"
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>सुरक्षा नियम</span>
          </button>

          {/* Account / Profile */}
          <button
            onClick={() => navigateTo('profile')}
            title={`Active: ${currentUser.name} (Click to open profile)`}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-xs font-bold ${
              currentScreen === 'profile'
                ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#8083ff]'
                : 'bg-[#171f33] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#8083ff]/40"
              />
            ) : (
              <span className="material-symbols-outlined text-base">person</span>
            )}
            <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
          </button>

          {/* Chat Quick Access (Desktop) */}
          <button
            onClick={() => navigateTo('chat')}
            className="relative p-2 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] transition-colors"
            title="Bargain Chats"
          >
            <span className="material-symbols-outlined text-lg">
              chat_bubble
            </span>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ffb2b7] text-[#67001b] text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Post Ad Button (Desktop) */}
          <button
            onClick={() => navigateTo('post-ad')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-bold text-xs shadow-md shadow-[#8083ff]/25 hover:opacity-95 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              add_circle
            </span>
            <span>Post Ad + Reel</span>
          </button>
        </div>
      </div>

      {/* Mobile Location Sub-bar */}
      <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-[#222a3d]/60 text-xs">
        <button
          onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          className="flex items-center gap-1 text-[#c0c1ff] font-semibold"
        >
          <span className="material-symbols-outlined text-[#4edea3] text-sm">
            near_me
          </span>
          <span>{location}</span>
          <span className="text-[10px] text-[#908fa0]">(within 10 km)</span>
          <span className="material-symbols-outlined text-xs text-[#908fa0]">
            expand_more
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('map')}
            className="text-[11px] font-bold text-[#4edea3] hover:underline flex items-center gap-0.5 bg-[#171f33] px-2 py-0.5 rounded-full border border-[#4edea3]/30"
          >
            <span className="material-symbols-outlined text-xs">map</span>
            <span>Map Deals</span>
          </button>
          <button
            onClick={() => navigateTo('categories')}
            className="text-[11px] font-semibold text-[#8083ff] hover:underline flex items-center gap-0.5"
          >
            <span>Explore All</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
          </button>
        </div>
      </div>
    </header>
  );
};
