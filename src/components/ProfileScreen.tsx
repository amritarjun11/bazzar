import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    navigateTo,
    location,
    showToast,
    openToolsModal,
    openSupabaseModal,
    openEditProfileModal,
    isAdmin,
    openAdminLoginModal,
    logoutAdmin,
    openAuthModal,
    savedAccounts,
    userListings,
  } = useApp();

  const [avatarError, setAvatarError] = useState(false);

  const initials = (currentUser.name || 'User')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pb-28 md:pb-12 max-w-2xl mx-auto bg-[#0b1326] min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/90 backdrop-blur-md border-b border-[#222a3d] px-4 py-3 flex items-center justify-between">
        <h1 className="font-headline-sm text-[#dae2fd]">
          Profile & Account
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAuthModal('signup')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center gap-1 shadow-md shadow-[#8083ff]/20 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-sm font-bold">person_add</span>
            <span>+ Naya Account</span>
          </button>
          <button
            onClick={() => showToast('⚙️ Settings & Notification Preferences')}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Administrator Status Banner if logged in as Admin */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-blue-600/20 border-2 border-amber-400/60 rounded-3xl p-4 shadow-xl shadow-amber-500/10 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-black flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                👑
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    Super Administrator Mode
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-amber-400 text-black rounded-full uppercase shadow">
                    Active
                  </span>
                </div>
                <p className="text-xs text-white font-bold truncate mt-0.5">
                  amritarjun11@gmail.com
                </p>
                <p className="text-[10px] text-amber-200/80">
                  Full master access enabled. Only you can view this.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('admin')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Admin Panel</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>
        )}

        {/* User Identity Card */}
        <div className={`bg-gradient-to-br from-[#171f33] to-[#131b2e] border rounded-3xl p-5 shadow-xl relative overflow-hidden ${
          isAdmin ? 'border-amber-400/50 shadow-amber-500/10' : 'border-[#2d3449]'
        }`}>
          <div className="flex items-center gap-3.5">
            <div
              onClick={openEditProfileModal}
              className="relative cursor-pointer group"
              title="Click to change profile photo"
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 bg-[#131b2e] flex items-center justify-center ${
                isAdmin ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-[#8083ff]'
              }`}>
                {!avatarError && currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-sm font-black text-[#0b1326]">
                    {initials}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
              </div>
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#171f33] flex items-center justify-center ${
                isAdmin ? 'bg-amber-400' : 'bg-[#4edea3]'
              }`}>
                <span className="material-symbols-outlined text-[10px] text-[#003824] font-black">
                  {isAdmin ? 'star' : 'check'}
                </span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-[#dae2fd] truncate">
                  {currentUser.name}
                </h2>
                {isAdmin ? (
                  <span className="text-sm font-bold" title="Administrator">👑</span>
                ) : (
                  <span className="material-symbols-outlined text-sm text-[#4edea3]">
                    verified
                  </span>
                )}
              </div>
              <p className="text-xs text-[#908fa0]">{currentUser.phone}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {isAdmin ? (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-black px-2 py-0.5 rounded border border-amber-400/40 flex items-center gap-1">
                    <span>👑</span> Master Admin
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#00885d]/20 text-[#4edea3] font-bold px-2 py-0.5 rounded border border-[#00885d]/30">
                    KYC Verified Seller
                  </span>
                )}
                <span className="text-[10px] text-[#908fa0]">
                  {currentUser.location}
                </span>
              </div>
              {currentUser.bio && (
                <p className="text-[11px] text-[#dae2fd]/70 mt-1 line-clamp-1 italic">
                  "{currentUser.bio}"
                </p>
              )}
            </div>

            <button
              onClick={openEditProfileModal}
              className="px-3 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-xs font-bold text-[#c0c1ff] transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-sm shrink-0"
              title="Edit Profile Details & Photo"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>Edit</span>
            </button>
          </div>

          {/* Stats Rail */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#222a3d] text-center">
            <button
              onClick={() => navigateTo('my-ads')}
              className="p-1.5 rounded-xl hover:bg-[#222a3d] transition-colors"
            >
              <span className="text-sm font-black text-[#dae2fd] block">
                {userListings.length || currentUser.activeAds}
              </span>
              <span className="text-[10px] text-[#4edea3] font-bold">My Ads ↗</span>
            </button>
            <div>
              <span className="text-sm font-black text-[#ffb2b7] block">
                {currentUser.reelsCount}
              </span>
              <span className="text-[10px] text-[#908fa0]">Reels</span>
            </div>
            <div>
              <span className="text-sm font-black text-[#dae2fd] block">
                {currentUser.followersCount}
              </span>
              <span className="text-[10px] text-[#908fa0]">Followers</span>
            </div>
            <div>
              <span className="text-sm font-black text-[#4edea3] block">
                {currentUser.rating} ★
              </span>
              <span className="text-[10px] text-[#908fa0]">
                {currentUser.reviewsCount} Reviews
              </span>
            </div>
          </div>

          {/* Quick Account Switcher & Creation Row */}
          <div className="mt-3 pt-3 border-t border-[#222a3d] flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openAuthModal('signup')}
              className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-[#8083ff]/20 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-sm font-bold">person_add</span>
              <span>+ Naya Account Banayein</span>
            </button>

            <button
              onClick={() => openAuthModal('switch')}
              className="py-2 px-3 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-xs font-bold text-[#c0c1ff] flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">switch_account</span>
              <span>Account Badlein ({savedAccounts.length})</span>
            </button>
          </div>
        </div>

        {/* Creator & Business Hub Banner */}
        <div className="bg-gradient-to-r from-[#8083ff]/15 via-[#4edea3]/10 to-[#171f33] border border-[#8083ff]/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-black text-[#8083ff] uppercase tracking-wider">
              <span className="material-symbols-outlined text-xs">storefront</span>
              <span>Creator &amp; Dealer Storefront</span>
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-[#dae2fd] mt-0.5">
              Upgrade to Verified Dealer Profile
            </h3>
            <p className="text-[11px] text-[#908fa0] mt-0.5">
              Get custom store link, GST badge, and auto-boosted walkaround reels.
            </p>
          </div>
          <button
            onClick={() => showToast('🚀 Dealer enrollment request submitted to Rewa team!')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black shrink-0 hover:scale-105 transition-transform shadow"
          >
            Upgrade
          </button>
        </div>

        {/* Section 1: Marketplace & Content */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#131b2e] border-b border-[#222a3d] text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">
            Marketplace &amp; Content
          </div>
          <div className="divide-y divide-[#222a3d]">
            {[
              {
                label: 'मेरे विज्ञापन (My Ads - Manage, Sold, Boost)',
                icon: 'list_alt',
                count: `${userListings.length} Ads`,
                action: () => navigateTo('my-ads'),
              },
              { label: 'My Published Walkaround Reels', icon: 'play_circle', count: '14 Reels', action: () => navigateTo('shorts') },
              { label: 'Saved Favorites & Shortlist', icon: 'favorite', action: () => navigateTo('home') },
              { label: 'Negotiation Offers & Deals', icon: 'handshake', count: '2 Active', action: () => navigateTo('chat') },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#222a3d]/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-[#c0c1ff]">
                    {item.icon}
                  </span>
                  <span className="text-xs font-semibold text-[#dae2fd]">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count && (
                    <span className="text-[10px] font-bold text-[#8083ff] bg-[#8083ff]/10 px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-xs text-[#908fa0]">
                    chevron_right
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Preferences & Safety */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#131b2e] border-b border-[#222a3d] text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">
            Trust, Safety &amp; Tools
          </div>
          <div className="divide-y divide-[#222a3d]">
            {[
              { label: 'Location & Radius', sub: `${location} (within 10 km)`, icon: 'near_me', action: () => showToast('Location set to Rewa') },
              { label: 'MP RTO RC & Challan Verification', sub: 'Check MP-17 Rewa registration, owner & e-challans', icon: 'directions_car', action: () => openToolsModal('rc') },
              { label: 'Fair Market Price Calculator', sub: 'Instant valuation for used bikes, cars & mobiles', icon: 'calculate', action: () => openToolsModal('valuation') },
              { label: 'Rewa Safe Deal Meetup Zones & Escrow', sub: 'Verified police ground spots & fraud protection', icon: 'shield', action: () => openToolsModal('meetup') },
              { label: 'Aadhaar & KYC Escrow Verification', sub: 'Verified ✓', icon: 'verified_user', action: () => showToast('KYC Identity verified') },
              ...(isAdmin
                ? [
                    {
                      label: 'Supabase Database & Cloud Backend (Admin Only)',
                      sub: 'Postgres tables, storage buckets & schema.sql',
                      icon: 'database',
                      action: () => openSupabaseModal(),
                    },
                    {
                      label: 'Users & Content Moderation Console (Admin)',
                      sub: '👑 Control users, Ban, Issue warnings, Pending review & Audit log',
                      icon: 'admin_panel_settings',
                      action: () => navigateTo('admin'),
                    },
                  ]
                : []),
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#222a3d]/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-[#4edea3]">
                    {item.icon}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-[#dae2fd] block">
                      {item.label}
                    </span>
                    {item.sub && (
                      <span className="text-[10px] text-[#908fa0] block">{item.sub}</span>
                    )}
                  </div>
                </div>
                <span className="material-symbols-outlined text-xs text-[#908fa0]">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Active Controls OR Discrete Admin Login */}
        {isAdmin ? (
          <button
            onClick={logoutAdmin}
            className="w-full py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>Exit Administrator Session (Amrit Arjun)</span>
          </button>
        ) : (
          <div className="pt-2 text-center">
            <button
              onClick={openAdminLoginModal}
              className="text-[11px] text-[#505a74] hover:text-[#8083ff] transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-[#171f33]"
              title="Restricted portal for platform owner"
            >
              <span className="material-symbols-outlined text-xs">lock</span>
              <span>Staff &amp; Admin Login Portal</span>
            </button>
          </div>
        )}

        {/* Account Switcher & Create Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openAuthModal('switch')}
            className="py-3 rounded-2xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-bold text-[#c0c1ff] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">switch_account</span>
            <span>Switch Account</span>
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="py-3 rounded-2xl bg-[#8083ff]/15 hover:bg-[#8083ff]/25 border border-[#8083ff]/40 text-xs font-bold text-[#8083ff] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>+ Naya Account</span>
          </button>
        </div>

        {/* Log Out */}
        <button
          onClick={() => {
            showToast('👋 Logged out securely. Naya account banane ya login ke liye Switch Account chunein.');
          }}
          className="w-full py-3 rounded-2xl bg-[#171f33] hover:bg-[#ffb4ab]/15 border border-[#2d3449] text-xs font-bold text-[#ffb4ab] flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Log Out from Device</span>
        </button>
      </div>
    </div>
  );
};
