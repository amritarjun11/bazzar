import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { audioEngine } from '../utils/audioEngine';
import { ShortReel, Listing } from '../types';

interface ReelComment {
  id: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

const DEFAULT_COMMENTS: Record<string, ReelComment[]> = {
  default: [
    {
      id: 'c1',
      userName: 'Amitabh Sharma',
      userHandle: '@amitabh_rewa',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: 'Bhai RC original smart card hai na? Rewa RTO me naam transfer turant ho jayega?',
      timeAgo: '1 ghante pehle',
      likes: 12,
    },
    {
      id: 'c2',
      userName: 'Pooja Patel',
      userHandle: '@pooja_p',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      text: 'Final cash deal me kitna kam hoga bhaiya? Aaj inspection ke liye kahan mil sakte hain?',
      timeAgo: '3 ghante pehle',
      likes: 8,
    },
    {
      id: 'c3',
      userName: 'Sachin Tiwari',
      userHandle: '@sachin_rewa',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      text: 'Exhaust sound ekdum clean aur tight hai! Tyre condition kitni percent hai bhai?',
      timeAgo: 'Kal',
      likes: 5,
    },
  ],
};

export const ShortsFeedScreen: React.FC = () => {
  const {
    shorts,
    selectedReel,
    likedReelIds,
    toggleLikeReel,
    savedReelIds,
    toggleSaveReel,
    followedSellerIds,
    toggleFollowSeller,
    openOfferModal,
    listings,
    navigateTo,
    openChatForListing,
    soundMuted,
    toggleSound,
    showToast,
    currentUser,
  } = useApp();

  // Helper to convert any listing into a ShortReel for infinite streaming
  const createReelFromListing = useCallback((listing: Listing, index: number): ShortReel => {
    const isBike =
      listing.categoryId === 'vehicles' ||
      listing.title.toLowerCase().includes('bike') ||
      listing.title.toLowerCase().includes('shine') ||
      listing.title.toLowerCase().includes('pulsar') ||
      listing.title.toLowerCase().includes('bullet') ||
      listing.title.toLowerCase().includes('activa');

    const isBullet =
      listing.title.toLowerCase().includes('bullet') ||
      listing.title.toLowerCase().includes('classic') ||
      listing.title.toLowerCase().includes('royalenfield');

    const isMobile =
      listing.categoryId === 'mobiles' ||
      listing.title.toLowerCase().includes('iphone') ||
      listing.title.toLowerCase().includes('phone') ||
      listing.title.toLowerCase().includes('samsung');

    const audioTypeTitle = isBullet
      ? 'Original Exhaust Thump - Rewa Motors'
      : isBike
      ? 'Original Engine Sound - Rewa Auto Walkaround'
      : isMobile
      ? 'Display & Touch Test Audio - AppleHub Rewa'
      : 'Walkaround Inspection Audio - Rewa Bazaar';

    const tags = isBike
      ? ['#RewaBikes', '#UsedVehicles', '#RewaDeals']
      : isMobile
      ? ['#RewaMobiles', '#SmartphoneDeal', '#Gadgets']
      : ['#RewaMarket', '#BazaarReels', '#LocalRewa'];

    return {
      id: `gen_reel_${listing.id}_${index}`,
      listingId: listing.id,
      listingTitle: listing.title,
      price: listing.price,
      negotiable: listing.negotiable,
      sellerHandle: listing.seller.handle || `@${listing.seller.name.toLowerCase().replace(/\s+/g, '_')}`,
      sellerName: listing.seller.name,
      sellerAvatar: listing.seller.avatar,
      sellerVerified: listing.seller.verified,
      location: `${listing.location.neighborhood || 'Civil Lines'}, Rewa`,
      distanceKm: listing.location.distanceKm || 1.8,
      caption:
        listing.description?.[0] ||
        `Verified walkaround check for ${listing.title}. Direct deal with owner in Rewa. Contact for inspection!`,
      hashtags: tags,
      thumbnailUrl: listing.images[0] || listing.videoThumbnail || '',
      videoUrl: listing.videoUrl,
      audioName: audioTypeTitle,
      audioSubtitle: isBike ? '30s Cold start & sound check' : 'Full inspection walkaround',
      durationSec: 28,
      viewsCount: Math.floor(Math.random() * 8000) + 1400,
      likesCount: Math.floor(Math.random() * 800) + 120,
      commentsCount: Math.floor(Math.random() * 70) + 15,
      savesCount: Math.floor(Math.random() * 120) + 25,
      sharesCount: Math.floor(Math.random() * 50) + 12,
    };
  }, []);

  // Main active feed of reels (starts with initial shorts + can expand infinitely)
  const [feedReels, setFeedReels] = useState<ShortReel[]>(() => {
    if (shorts && shorts.length > 0) return [...shorts];
    return listings.map((l, i) => createReelFromListing(l, i));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [swipeHintVisible, setSwipeHintVisible] = useState(true);

  // Drag & Swipe Interaction Physics
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const hasMovedRef = useRef(false);
  const isWheelCooling = useRef(false);

  // Interactive Features State
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, ReelComment[]>>(DEFAULT_COMMENTS);
  const [commentInput, setCommentInput] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Local likes & saves count override for instant feedback
  const [likesCountDelta, setLikesCountDelta] = useState<Record<string, number>>({});
  const [savesCountDelta, setSavesCountDelta] = useState<Record<string, number>>({});

  // Sync when selectedReel changes from other screens (e.g. clicking a reel in HomeScreen)
  useEffect(() => {
    if (!selectedReel) return;
    const existingIndex = feedReels.findIndex(
      r => r.id === selectedReel.id || r.listingId === selectedReel.listingId
    );
    if (existingIndex !== -1) {
      setCurrentIndex(existingIndex);
    } else {
      setFeedReels(prev => [selectedReel, ...prev]);
      setCurrentIndex(0);
    }
    setProgress(0);
  }, [selectedReel]);

  // Fade out swipe hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setSwipeHintVisible(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Load more random / related reels when approaching end
  const loadMoreReelsIfNeeded = useCallback(() => {
    setFeedReels(prev => {
      const newItems: ShortReel[] = [];
      const shuffledListings = [...listings].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(shuffledListings.length, 6); i++) {
        const item = shuffledListings[i];
        newItems.push(createReelFromListing(item, Date.now() + i));
      }

      return [...prev, ...newItems];
    });
  }, [listings, createReelFromListing]);

  // Current active reel
  const currentReel = feedReels[currentIndex] || feedReels[0] || (shorts[0] as ShortReel);
  const reelId = currentReel?.id || 'reel_1';

  const isLiked = likedReelIds.has(reelId);
  const isSaved = savedReelIds.has(reelId);
  const isFollowing = currentReel ? followedSellerIds.has(currentReel.sellerHandle) : false;

  const currentLikesCount =
    (currentReel?.likesCount || 0) + (likesCountDelta[reelId] || 0) + (isLiked ? 1 : 0);
  const currentSavesCount =
    (currentReel?.savesCount || 0) + (savesCountDelta[reelId] || 0) + (isSaved ? 1 : 0);

  const targetListing =
    listings.find(l => l.id === currentReel?.listingId) || listings[0];

  // Go to Next Reel (Swipe Up)
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIdx = prev + 1;
      if (nextIdx >= feedReels.length - 2) {
        loadMoreReelsIfNeeded();
      }
      setProgress(0);
      return nextIdx < feedReels.length ? nextIdx : 0;
    });
  }, [feedReels.length, loadMoreReelsIfNeeded]);

  // Go to Previous Reel (Swipe Down)
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => {
      setProgress(0);
      return prev > 0 ? prev - 1 : feedReels.length - 1;
    });
  }, [feedReels.length]);

  // ----------------------------------------------------
  // POINTER DRAG & SWIPE (WORKS ON BOTH MOUSE & TOUCH!)
  // ----------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Don't drag if clicking buttons, inputs, links, or comment sheet
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.no-drag') ||
      isCommentsOpen ||
      isShareModalOpen
    ) {
      return;
    }

    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    hasMovedRef.current = false;
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diffY = e.clientY - startYRef.current;
    if (Math.abs(diffY) > 6) {
      hasMovedRef.current = true;
    }
    // Elastic resistance clamping
    const clamped = Math.max(-140, Math.min(140, diffY));
    setDragY(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const moved = dragY;
    const elapsed = Date.now() - startTimeRef.current;
    setDragY(0);

    // Fast flick or distance > 35px
    if (moved < -35 || (moved < -20 && elapsed < 250)) {
      handleNext();
    } else if (moved > 35 || (moved > 20 && elapsed < 250)) {
      handlePrev();
    }
  };

  // Mouse Wheel / Trackpad Scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (isWheelCooling.current || isCommentsOpen || isShareModalOpen) return;
    if (Math.abs(e.deltaY) > 25) {
      isWheelCooling.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        isWheelCooling.current = false;
      }, 350);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen || isShareModalOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'm') {
        toggleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, toggleSound, isCommentsOpen, isShareModalOpen]);

  // Looping progress simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNext();
          return 0;
        }
        return p + 1.2;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, handleNext]);

  // Sound Engine sync on reel change
  useEffect(() => {
    if (!soundMuted && currentReel) {
      const titleLower = currentReel.listingTitle.toLowerCase();
      const isBullet = titleLower.includes('classic') || titleLower.includes('bullet');
      const isBike =
        titleLower.includes('shine') ||
        titleLower.includes('pulsar') ||
        titleLower.includes('bike') ||
        titleLower.includes('activa');

      if (isBullet) {
        audioEngine.playEngineSound('bullet');
      } else if (isBike) {
        audioEngine.playEngineSound('bike');
      } else {
        audioEngine.playEngineSound('gadget');
      }
    }
  }, [currentIndex, soundMuted, currentReel]);

  // ----------------------------------------------------
  // INTERACTIVE ACTION HANDLERS
  // ----------------------------------------------------
  // Like Handler
  const handleToggleLike = () => {
    toggleLikeReel(reelId);
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      showToast('❤️ Liked reel!');
    }
  };

  // Double Tap Video to Like
  const handleStageClick = () => {
    // If it was a drag, don't trigger play/pause
    if (hasMovedRef.current) return;
    setIsPlaying(p => !p);
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      toggleLikeReel(reelId);
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  // Save / Bookmark Handler
  const handleToggleSave = () => {
    toggleSaveReel(reelId);
  };

  // Share Handler
  const handleOpenShare = () => {
    setIsShareModalOpen(true);
  };

  const handleWhatsAppShare = () => {
    const text = `Check out "${currentReel.listingTitle}" for ₹${currentReel.price.toLocaleString()} in Rewa on BazaarReels!\n${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsShareModalOpen(false);
    showToast('💬 Opening WhatsApp to share...');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    showToast('🔗 Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: currentReel.listingTitle,
          text: `Check out ${currentReel.listingTitle} in Rewa!`,
          url: window.location.href,
        })
        .then(() => setIsShareModalOpen(false))
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  // Comments Handler
  const handleOpenComments = () => {
    setIsCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsOpen(false);
  };

  const currentComments = commentsMap[reelId] || commentsMap['default'] || [];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: ReelComment = {
      id: `comment_${Date.now()}`,
      userName: currentUser.name || 'Aman Verma',
      userHandle: '@aman_rewa',
      userAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: commentInput.trim(),
      timeAgo: 'Just now',
      likes: 0,
    };

    setCommentsMap(prev => {
      const existing = prev[reelId] || prev['default'] || [];
      return {
        ...prev,
        [reelId]: [newComment, ...existing],
      };
    });

    setCommentInput('');
    showToast('💬 Comment posted successfully!');
  };

  if (!currentReel) return null;

  return (
    <div
      className="relative w-full h-[calc(100dvh-4rem)] md:h-[calc(100vh-2rem)] max-w-md mx-auto bg-black overflow-hidden flex flex-col justify-between select-none md:my-2 md:rounded-3xl md:border md:border-[#2d3449] md:shadow-2xl cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: 'pan-x' }}
    >
      {/* Top Floating Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 px-3 pt-2">
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8083ff] rounded-full transition-all duration-100 ease-linear shadow-sm shadow-[#8083ff]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Top Floating Header & Nav Controls */}
      <div className="absolute top-3 left-0 right-0 z-40 px-4 flex items-center justify-between no-drag">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('home')}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg active:scale-95 transition-transform"
            title="Go Home"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
            <span className="text-xs font-black text-white tracking-wide">
              Shorts Feed
            </span>
            <span className="text-[10px] text-[#8083ff] font-bold">
              #{currentIndex + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Engine Button */}
          <button
            onClick={toggleSound}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-all ${
              !soundMuted
                ? 'bg-[#8083ff] text-[#0b1326] border-[#8083ff] shadow-[#8083ff]/40'
                : 'bg-black/60 text-white border-white/20'
            }`}
            title={soundMuted ? 'Unmute Walkaround Audio' : 'Mute Sound'}
          >
            <span className="material-symbols-outlined text-lg">
              {!soundMuted ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          <button
            onClick={() => navigateTo('search')}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg"
            title="Search"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>
        </div>
      </div>

      {/* Floating Swipe Cue Hint */}
      {swipeHintVisible && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-md border border-[#8083ff]/50 px-3.5 py-1.5 rounded-full flex items-center gap-2 pointer-events-none animate-bounce shadow-xl">
          <span className="material-symbols-outlined text-sm text-[#8083ff]">swap_vert</span>
          <span className="text-[11px] font-bold text-white">
            Swipe or Drag Up ↕️ for Next Reel
          </span>
        </div>
      )}

      {/* One-Tap Up/Down Navigation Buttons (Easy clicking on desktop & mobile) */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5 no-drag">
        <button
          onClick={handlePrev}
          className="w-9 h-9 rounded-full bg-black/70 hover:bg-[#8083ff] text-white hover:text-[#0b1326] flex items-center justify-center border border-white/25 backdrop-blur-md shadow-xl transition-all active:scale-90"
          title="Previous Reel (Swipe Down)"
        >
          <span className="material-symbols-outlined text-xl">keyboard_arrow_up</span>
        </button>
        <button
          onClick={handleNext}
          className="w-9 h-9 rounded-full bg-black/70 hover:bg-[#8083ff] text-white hover:text-[#0b1326] flex items-center justify-center border border-white/25 backdrop-blur-md shadow-xl transition-all active:scale-90"
          title="Next Reel (Swipe Up)"
        >
          <span className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
        </button>
      </div>

      {/* Main Video / Image Stage with Live Drag Transform */}
      <div
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center select-none"
        onClick={handleStageClick}
        onDoubleClick={handleDoubleTap}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {currentReel.videoUrl ? (
          <video
            src={currentReel.videoUrl}
            poster={currentReel.thumbnailUrl}
            className="w-full h-full object-cover pointer-events-none"
            autoPlay
            loop
            muted={soundMuted}
            playsInline
          />
        ) : (
          <img
            src={currentReel.thumbnailUrl}
            alt={currentReel.listingTitle}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95 pointer-events-none" />

        {/* Sound Active Visualizer */}
        {!soundMuted && (
          <div className="absolute top-14 left-4 z-30 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-[#4edea3]/40 flex items-center gap-1.5 pointer-events-none">
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-1 bg-[#4edea3] h-2.5 animate-pulse" />
              <span className="w-1 bg-[#4edea3] h-4 animate-pulse delay-75" />
              <span className="w-1 bg-[#4edea3] h-2 animate-pulse delay-150" />
            </div>
            <span className="text-[10px] font-bold text-[#4edea3]">
              Engine Sound Active
            </span>
          </div>
        )}

        {/* Pause Overlay Icon */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
              <span className="material-symbols-outlined text-white text-4xl">
                play_arrow
              </span>
            </div>
          </div>
        )}

        {/* Double Tap Heart Burst Animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
            <span className="material-symbols-outlined text-[#ffb2b7] text-9xl drop-shadow-2xl">
              favorite
            </span>
          </div>
        )}
      </div>

      {/* Right Side Action Rail (Like, Comment, Save, Share) */}
      <div className="absolute right-3 bottom-32 z-40 flex flex-col items-center gap-3 no-drag">
        {/* Seller Avatar + Follow Button */}
        <div className="relative mb-1">
          <div
            onClick={e => {
              e.stopPropagation();
              navigateTo('seller-profile', { seller: targetListing.seller });
            }}
            className="w-11 h-11 rounded-full border-2 border-[#8083ff] overflow-hidden cursor-pointer shadow-lg hover:scale-105 transition-transform"
            title="View Seller Profile"
          >
            <img
              src={currentReel.sellerAvatar}
              alt={currentReel.sellerName}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              toggleFollowSeller(currentReel.sellerHandle);
            }}
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow ${
              isFollowing
                ? 'bg-[#4edea3] text-[#003824]'
                : 'bg-[#8083ff] text-[#0b1326]'
            }`}
            title={isFollowing ? 'Following' : 'Follow Seller'}
          >
            <span className="material-symbols-outlined text-xs">
              {isFollowing ? 'check' : 'add'}
            </span>
          </button>
        </div>

        {/* 1. LIKE BUTTON */}
        <button
          onClick={e => {
            e.stopPropagation();
            handleToggleLike();
          }}
          className="flex flex-col items-center gap-0.5 group active:scale-125 transition-transform"
          title="Like Reel"
        >
          <div
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-colors ${
              isLiked
                ? 'bg-[#ffb2b7] text-[#67001b] border-2 border-white'
                : 'bg-black/60 text-white border border-white/20 hover:bg-black/80'
            }`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              favorite
            </span>
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {currentLikesCount.toLocaleString()}
          </span>
        </button>

        {/* 2. COMMENT BUTTON */}
        <button
          onClick={e => {
            e.stopPropagation();
            handleOpenComments();
          }}
          className="flex flex-col items-center gap-0.5 group active:scale-110 transition-transform"
          title="Comments"
        >
          <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-[#8083ff] hover:text-[#0b1326] backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-colors">
            <span className="material-symbols-outlined text-2xl">chat_bubble</span>
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {currentComments.length}
          </span>
        </button>

        {/* 3. SAVE / BOOKMARK BUTTON */}
        <button
          onClick={e => {
            e.stopPropagation();
            handleToggleSave();
          }}
          className="flex flex-col items-center gap-0.5 group active:scale-110 transition-transform"
          title="Save Reel"
        >
          <div
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-colors ${
              isSaved
                ? 'bg-[#4edea3] text-[#003824] border-2 border-white'
                : 'bg-black/60 text-white border border-white/20 hover:bg-black/80'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">bookmark</span>
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {currentSavesCount}
          </span>
        </button>

        {/* 4. SHARE BUTTON */}
        <button
          onClick={e => {
            e.stopPropagation();
            handleOpenShare();
          }}
          className="flex flex-col items-center gap-0.5 group active:scale-110 transition-transform"
          title="Share Reel"
        >
          <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-[#4edea3] hover:text-[#003824] backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-colors">
            <span className="material-symbols-outlined text-2xl">share</span>
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            Share
          </span>
        </button>
      </div>

      {/* Bottom HUD: Product Card, Seller Details & Action Buttons */}
      <div className="relative z-40 p-4 pb-20 md:pb-5 bg-gradient-to-t from-black via-black/95 to-transparent no-drag">
        {/* Audio Track Pill */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="material-symbols-outlined text-xs text-[#8083ff] animate-spin">
            music_note
          </span>
          <span className="text-[11px] text-[#c7c4d7] truncate max-w-[220px]">
            {currentReel.audioName}
          </span>
        </div>

        {/* Seller Info & Caption */}
        <div className="mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-white">
              {currentReel.sellerName}
            </span>
            {currentReel.sellerVerified && (
              <span className="material-symbols-outlined text-sm text-[#4edea3]">
                verified
              </span>
            )}
            <span className="text-[11px] text-[#908fa0]">• {currentReel.location}</span>
          </div>

          <p className="text-xs text-white/95 mt-1 line-clamp-2 leading-relaxed">
            {currentReel.caption}
          </p>

          <div className="flex gap-1.5 mt-1 flex-wrap">
            {currentReel.hashtags.map(h => (
              <span key={h} className="text-[10px] text-[#8083ff] font-semibold">
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Pinned Listing Card */}
        <div className="bg-[#171f33]/95 backdrop-blur-md border border-[#2d3449] rounded-2xl p-2.5 flex items-center justify-between gap-3 mb-2.5 shadow-xl">
          <div
            onClick={() => navigateTo('product-detail', { listing: targetListing })}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
          >
            <img
              src={targetListing.images[0]}
              alt={targetListing.title}
              className="w-12 h-12 rounded-xl object-cover border border-[#2d3449] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#dae2fd] truncate">
                {targetListing.title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
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
            onClick={() => navigateTo('product-detail', { listing: targetListing })}
            className="px-2.5 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-xs font-bold text-[#c0c1ff] whitespace-nowrap transition-colors"
          >
            Details
          </button>
        </div>

        {/* Action Buttons: Make Offer & Chat */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => openOfferModal(targetListing)}
            className="py-2.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-xs font-bold text-[#dae2fd] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-[#8083ff]">
              handshake
            </span>
            <span>Make Offer</span>
          </button>

          <button
            onClick={() => {
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

      {/* ==================================================== */}
      {/* REAL COMMENTS BOTTOM SHEET / DRAWER                 */}
      {/* ==================================================== */}
      {isCommentsOpen && (
        <div
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end no-drag"
          onClick={handleCloseComments}
        >
          <div
            className="w-full max-h-[75%] bg-[#131b2e] rounded-t-3xl border-t border-[#2d3449] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-[#222a3d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8083ff] text-xl">chat</span>
                <h3 className="text-sm font-extrabold text-[#dae2fd]">
                  Comments ({currentComments.length})
                </h3>
              </div>
              <button
                onClick={handleCloseComments}
                className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {currentComments.map(c => (
                <div key={c.id} className="flex gap-2.5">
                  <img
                    src={c.userAvatar}
                    alt={c.userName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#2d3449]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#dae2fd]">{c.userName}</span>
                      <span className="text-[10px] text-[#908fa0]">{c.timeAgo}</span>
                    </div>
                    <p className="text-xs text-[#c7c4d7] mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                  <button className="flex flex-col items-center text-[#908fa0] hover:text-[#ffb2b7] text-[10px] shrink-0 pt-1">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    <span>{c.likes}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="p-3 bg-[#0b1326] border-t border-[#222a3d] flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Ask seller about price, condition, RC..."
                className="flex-1 bg-[#171f33] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-[#dae2fd] focus:outline-none placeholder-[#908fa0]"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] flex items-center justify-center shrink-0 disabled:opacity-40 transition-transform active:scale-95 shadow"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* REAL SHARE MODAL SHEET                              */}
      {/* ==================================================== */}
      {isShareModalOpen && (
        <div
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end no-drag"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="w-full bg-[#131b2e] rounded-t-3xl border-t border-[#2d3449] p-5 space-y-4 shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#222a3d]">
              <div>
                <h3 className="text-sm font-extrabold text-[#dae2fd]">Share Walkaround Reel</h3>
                <p className="text-[10px] text-[#908fa0]">Share with buyers or friends in Rewa</p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Share Targets Grid */}
            <div className="grid grid-cols-4 gap-3 py-2 text-center">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#171f33] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">chat</span>
                </div>
                <span className="text-[11px] font-bold text-[#dae2fd]">WhatsApp</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#171f33] transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-all ${
                    copiedLink ? 'bg-[#4edea3] text-[#003824]' : 'bg-[#8083ff] text-[#0b1326]'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {copiedLink ? 'check' : 'content_copy'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#dae2fd]">
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </span>
              </button>

              {/* Direct Chat */}
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  if (targetListing) openChatForListing(targetListing);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#171f33] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-[#171f33] border border-[#2d3449] text-[#8083ff] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">forum</span>
                </div>
                <span className="text-[11px] font-bold text-[#dae2fd]">In-App Chat</span>
              </button>

              {/* More / System Share */}
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#171f33] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-[#222a3d] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">more_horiz</span>
                </div>
                <span className="text-[11px] font-bold text-[#dae2fd]">More</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
