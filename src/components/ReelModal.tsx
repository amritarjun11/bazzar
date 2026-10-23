import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const ReelModal: React.FC = () => {
  const {
    isReelModalOpen,
    closeReelModal,
    selectedReel,
    soundMuted,
    toggleSound,
    likedReelIds,
    toggleLikeReel,
    savedReelIds,
    toggleSaveReel,
    openOfferModal,
    listings,
    navigateTo,
    openChatForListing,
    showToast,
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const reel = selectedReel;
  const isLiked = likedReelIds.has(reel?.id || '');
  const isSaved = savedReelIds.has(reel?.id || '');

  // Progress simulation loop
  useEffect(() => {
    if (!isReelModalOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 1.2));
    }, 120);
    return () => clearInterval(interval);
  }, [isReelModalOpen, isPlaying]);

  if (!isReelModalOpen || !reel) return null;

  const currentSeconds = Math.floor((progress / 100) * (reel.durationSec || 30));
  const targetListing = listings.find(l => l.id === reel.listingId) || listings[0];

  const handleDoubleTap = () => {
    if (!isLiked) toggleLikeReel(reel.id);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('🔗 Walkaround reel link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4">
      {/* 9:16 Aspect ratio container */}
      <div
        className="relative w-full max-w-sm sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl bg-[#060e20] overflow-hidden border border-[#2d3449] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 px-3 pt-3">
          <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8083ff] rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Top Floating Bar */}
        <div className="absolute top-4 left-0 right-0 z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#ffb2b7] animate-pulse" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              30s Walkaround Reel
            </span>
            <span className="text-[10px] text-[#c7c4d7]">
              0:{currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds} / 0:{reel.durationSec}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle Button */}
            <button
              onClick={toggleSound}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                !soundMuted
                  ? 'bg-[#8083ff] text-[#0b1326] border-[#8083ff]'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
              title={soundMuted ? 'Turn Sound ON' : 'Mute Sound'}
            >
              <span className="material-symbols-outlined text-lg">
                {!soundMuted ? 'volume_up' : 'volume_off'}
              </span>
            </button>

            {/* Close Modal */}
            <button
              onClick={closeReelModal}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Main Video Viewport (Double-click to like) */}
        <div
          className="relative flex-1 w-full h-full cursor-pointer select-none bg-black overflow-hidden flex items-center justify-center"
          onDoubleClick={handleDoubleTap}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <img
            src={reel.thumbnailUrl}
            alt={reel.listingTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Cinematic Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 pointer-events-none" />

          {/* Pause Icon Indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <span className="material-symbols-outlined text-white text-6xl opacity-80">
                play_arrow
              </span>
            </div>
          )}

          {/* Double Tap Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce">
              <span className="material-symbols-outlined text-[#ffb2b7] text-8xl drop-shadow-2xl font-fill">
                favorite
              </span>
            </div>
          )}

          {/* Live Sound Wave Badge (When sound is active) */}
          {!soundMuted && (
            <div className="absolute top-16 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#4edea3]/40 flex items-center gap-1.5 pointer-events-none">
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-[#4edea3] h-2.5 animate-pulse" />
                <span className="w-1 bg-[#4edea3] h-4 animate-pulse delay-75" />
                <span className="w-1 bg-[#4edea3] h-2 animate-pulse delay-150" />
              </div>
              <span className="text-[10px] font-bold text-[#4edea3]">
                Live Engine Audio Synthesizer
              </span>
            </div>
          )}
        </div>

        {/* Right Floating Interaction Rail */}
        <div className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-3.5">
          {/* Like */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleLikeReel(reel.id);
            }}
            className="flex flex-col items-center gap-0.5 group"
          >
            <div
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-transform group-active:scale-125 ${
                isLiked
                  ? 'bg-[#ffb2b7]/25 text-[#ffb2b7] border border-[#ffb2b7]/50'
                  : 'bg-black/50 text-white border border-white/15 hover:bg-black/70'
              }`}
            >
              <span className="material-symbols-outlined text-2xl font-bold">
                favorite
              </span>
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {reel.likesCount.toLocaleString()}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={e => {
              e.stopPropagation();
              showToast('💬 Comments: "Bhai genuine sound hai", "Test drive available?"');
            }}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">
                chat_bubble
              </span>
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {reel.commentsCount}
            </span>
          </button>

          {/* Bookmark */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleSaveReel(reel.id);
            }}
            className="flex flex-col items-center gap-0.5"
          >
            <div
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center ${
                isSaved
                  ? 'bg-[#4edea3]/25 text-[#4edea3] border border-[#4edea3]/50'
                  : 'bg-black/50 text-white border border-white/15 hover:bg-black/70'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">bookmark</span>
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {reel.savesCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">share</span>
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              Share
            </span>
          </button>
        </div>

        {/* Bottom Product HUD Card */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-8">
          {/* Audio Track Ticker */}
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-xs text-[#8083ff] animate-spin">
              music_note
            </span>
            <p className="text-[11px] text-[#c7c4d7] truncate font-medium">
              {reel.audioName}
            </p>
          </div>

          {/* Seller Pill */}
          <div className="flex items-center gap-2 mb-2.5">
            <img
              src={reel.sellerAvatar}
              alt={reel.sellerName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-white/20"
            />
            <span className="text-xs font-bold text-white">{reel.sellerName}</span>
            {reel.sellerVerified && (
              <span className="material-symbols-outlined text-[#4edea3] text-sm">
                verified
              </span>
            )}
            <span className="text-[11px] text-[#908fa0]">• {reel.location}</span>
          </div>

          {/* Mini Product Pill */}
          <div className="bg-[#171f33]/90 backdrop-blur-md border border-[#2d3449] rounded-2xl p-2.5 flex items-center justify-between gap-3 mb-3">
            <div
              onClick={() => {
                closeReelModal();
                navigateTo('product-detail', { listing: targetListing });
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
            >
              <img
                src={targetListing.images[0]}
                alt={targetListing.title}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-lg object-cover border border-[#2d3449] shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#dae2fd] truncate">
                  {targetListing.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-[#4edea3]">
                    ₹{targetListing.price.toLocaleString()}
                  </span>
                  {targetListing.negotiable && (
                    <span className="text-[9px] bg-[#4edea3]/20 text-[#4edea3] px-1 py-0.2 rounded font-bold">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                closeReelModal();
                navigateTo('product-detail', { listing: targetListing });
              }}
              className="px-2.5 py-1 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[11px] font-bold text-[#c0c1ff] whitespace-nowrap transition-colors"
            >
              View Ad
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                closeReelModal();
                openOfferModal(targetListing);
              }}
              className="py-2.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-xs font-bold text-[#dae2fd] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-[#8083ff]">
                handshake
              </span>
              <span>Make Offer</span>
            </button>

            <button
              onClick={() => {
                closeReelModal();
                if (targetListing) openChatForListing(targetListing);
              }}
              className="py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-[#8083ff]/30"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                chat
              </span>
              <span>Chat Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
