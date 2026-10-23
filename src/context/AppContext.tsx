import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenType,
  Listing,
  ShortReel,
  Seller,
  ChatMessage,
  UserProfile,
  ManagedUser,
  ListingModerationStatus,
  UserWarning,
  SupportMessage,
  SellerReview,
} from '../types';
import {
  INITIAL_LISTINGS,
  INITIAL_SHORTS,
  SELLER_RAHUL,
  CURRENT_USER,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SUPPORT_MESSAGES,
} from '../data/mockData';
import { INITIAL_MANAGED_USERS } from '../data/mockUsers';
import { audioEngine } from '../utils/audioEngine';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { notificationService } from '../services/notificationService';
import {
  SEED_CHAT_THREADS,
  getInitialChatForListing,
  generateSellerReply,
} from '../utils/chatHelper';

const INITIAL_REVIEWS_MAP: Record<string, SellerReview[]> = {
  seller_rahul: [
    {
      id: 'rev_1',
      sellerId: 'seller_rahul',
      sellerHandle: '@rahul_automobiles',
      authorName: 'Vikas Mishra',
      rating: 5,
      tags: ['💯 100% Genuine Saman', '📜 Verified Documents', '🤝 Smooth Inspection'],
      comment: 'Rahul bhaiya ne clean deal di. Honda Shine bike ki test drive karwayi, engine sound match hua, aur 2 ghante me RC transfer process complete karwa diya.',
      date: '2 weeks ago',
      verifiedBuyer: true,
    },
    {
      id: 'rev_2',
      sellerId: 'seller_rahul',
      sellerHandle: '@rahul_automobiles',
      authorName: 'Suresh Patel',
      rating: 5,
      tags: ['⚡ Fast Response & Chat', '💯 100% Genuine Saman'],
      comment: 'BazaarReels par walkaround video dekha tha, physical inspection me bike bilkul waisi hi mili. 100% genuine seller in Rewa.',
      date: '1 month ago',
      verifiedBuyer: true,
    },
  ],
  seller_applehub: [
    {
      id: 'rev_3',
      sellerId: 'seller_applehub',
      sellerHandle: '@applehub_mp',
      authorName: 'Ankit Sahu',
      rating: 5,
      tags: ['💯 100% Genuine Saman', '📜 Verified Documents'],
      comment: 'iPhone 13 128GB bilkul pristine condition me mila. Battery health 89% thi aur original bill diya. Manish bhai bohot polite hain.',
      date: '3 weeks ago',
      verifiedBuyer: true,
    },
  ],
};

interface AppContextType {
  currentScreen: ScreenType;
  previousScreen: ScreenType;
  navigateTo: (screen: ScreenType, payload?: { listing?: Listing; seller?: Seller; reel?: ShortReel; query?: string }) => void;
  goBack: () => void;
  listings: Listing[];
  shorts: ShortReel[];
  selectedListing: Listing;
  selectedSeller: Seller;
  selectedReel: ShortReel;
  isReelModalOpen: boolean;
  isOfferModalOpen: boolean;
  offerTargetListing: Listing | null;
  openOfferModal: (listing?: Listing) => void;
  closeOfferModal: () => void;
  openReelWalkaround: (item?: Listing | ShortReel) => void;
  closeReelModal: () => void;
  chatMessages: ChatMessage[];
  chatThreads: Record<string, ChatMessage[]>;
  openChatForListing: (listing: Listing) => void;
  sellerIsTyping: boolean;
  sendChatMessage: (text: string) => void;
  acceptOffer: (amount: number) => void;
  declineOffer: () => void;
  counterOffer: (amount: number, note?: string) => void;
  savedListingIds: Set<string>;
  toggleFavorite: (listingId: string) => void;
  followedSellerIds: Set<string>;
  toggleFollowSeller: (sellerId: string) => void;
  likedReelIds: Set<string>;
  toggleLikeReel: (reelId: string) => void;
  savedReelIds: Set<string>;
  toggleSaveReel: (reelId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  soundMuted: boolean;
  toggleSound: () => void;
  viewMode: 'mobile' | 'responsive';
  toggleViewMode: () => void;
  currentUser: UserProfile;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  isEditProfileOpen: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;
  unreadChatCount: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  addNewListing: (listing: Listing) => void;
  isSupabaseModalOpen: boolean;
  openSupabaseModal: () => void;
  closeSupabaseModal: () => void;
  isToolsModalOpen: boolean;
  toolsInitialTab: 'rc' | 'valuation' | 'meetup';
  openToolsModal: (initialTab?: 'rc' | 'valuation' | 'meetup') => void;
  closeToolsModal: () => void;
  isAdmin: boolean;
  adminEmail: string;
  isAdminLoginModalOpen: boolean;
  openAdminLoginModal: () => void;
  closeAdminLoginModal: () => void;
  isQrModalOpen: boolean;
  openQrModal: () => void;
  closeQrModal: () => void;
  isSafetyModalOpen: boolean;
  openSafetyModal: () => void;
  closeSafetyModal: () => void;
  loginAsAdmin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  managedUsers: ManagedUser[];
  banUser: (userId: string, reason?: string) => void;
  unbanUser: (userId: string) => void;
  warnUser: (userId: string, reason: string, listingId?: string, listingTitle?: string) => void;
  setUserReviewStatus: (userId: string, status: 'active' | 'pending_review' | 'banned') => void;
  listingModerationMap: Record<string, ListingModerationStatus>;
  updateListingModerationStatus: (
    listingId: string,
    status: 'active' | 'pending_review' | 'flagged' | 'rejected',
    reason?: string
  ) => void;
  // Account Management & Creation
  isAuthModalOpen: boolean;
  authModalTab: 'signup' | 'login' | 'switch';
  openAuthModal: (tab?: 'signup' | 'login' | 'switch') => void;
  closeAuthModal: () => void;
  createNewAccount: (profile: UserProfile) => void;
  switchUserAccount: (user: UserProfile) => void;
  savedAccounts: UserProfile[];
  // Support & Feedback Management
  supportMessages: SupportMessage[];
  submitSupportMessage: (msg: {
    name: string;
    phone: string;
    email?: string;
    category: 'help' | 'contact_support' | 'feedback' | 'bug_report' | 'suggestion';
    subject?: string;
    message: string;
    city: string;
    rating?: number;
  }) => void;
  updateSupportMessageStatus: (id: string, status: SupportMessage['status'], adminNotes?: string) => void;
  deleteSupportMessage: (id: string) => void;
  unreadSupportMessagesCount: number;
  // User Search History & Feed Discovery
  searchHistory: string[];
  addSearchQueryToHistory: (query: string) => void;
  clearSearchHistory: () => void;
  syncListingsFromServer: () => Promise<void>;
  // My Ads & Ad Lifecycle Management
  updateListing: (id: string, patch: Partial<Listing>) => Promise<void>;
  toggleListingSoldStatus: (id: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  boostListing: (id: string) => Promise<void>;
  isMyAd: (listing: Listing) => boolean;
  userListings: Listing[];
  // Buyer & Seller Reviews & Ratings System
  isReviewModalOpen: boolean;
  reviewTargetSeller: Seller | null;
  openReviewModal: (seller?: Seller) => void;
  closeReviewModal: () => void;
  addSellerReview: (sellerId: string, review: { rating: number; tags: string[]; comment: string }) => void;
  getSellerReviews: (sellerId: string) => SellerReview[];
  // Promote / Boost Ad Plans
  isBoostModalOpen: boolean;
  boostTargetListing: Listing | null;
  openBoostModal: (listing?: Listing) => void;
  closeBoostModal: () => void;
  activateBoostPlan: (listingId: string, plan: { id: string; name: string; days: number; price: number }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);

  const [listings, setListings] = useState<Listing[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_listings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_LISTINGS;
  });

  const [shorts, setShorts] = useState<ShortReel[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_shorts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_SHORTS;
  });
  const [selectedListing, setSelectedListing] = useState<Listing>(INITIAL_LISTINGS[0]);
  const [selectedSeller, setSelectedSeller] = useState<Seller>(SELLER_RAHUL);
  const [selectedReel, setSelectedReel] = useState<ShortReel>(INITIAL_SHORTS[0]);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [toolsInitialTab, setToolsInitialTab] = useState<'rc' | 'valuation' | 'meetup'>('rc');
  const [offerTargetListing, setOfferTargetListing] = useState<Listing | null>(INITIAL_LISTINGS[0]);

  // Multi-conversation chat threads per listing ID
  const [chatThreads, setChatThreads] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_chat_threads');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...SEED_CHAT_THREADS, ...parsed };
          }
        } catch (e) {}
      }
    }
    return SEED_CHAT_THREADS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return chatThreads[INITIAL_LISTINGS[0].id] || INITIAL_CHAT_MESSAGES;
  });

  // Whenever selectedListing changes, load that specific post's chat thread
  useEffect(() => {
    if (!selectedListing?.id) return;
    const targetId = selectedListing.id;
    if (chatThreads[targetId]) {
      setChatMessages(chatThreads[targetId]);
    } else {
      const initial = getInitialChatForListing(selectedListing);
      setChatThreads(prev => {
        const next = { ...prev, [targetId]: initial };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
      setChatMessages(initial);
    }
  }, [selectedListing?.id]);

  const [sellerIsTyping, setSellerIsTyping] = useState(false);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set(['listing_honda_shine']));
  const [followedSellerIds, setFollowedSellerIds] = useState<Set<string>>(new Set());
  const [likedReelIds, setLikedReelIds] = useState<Set<string>>(new Set(['reel_1']));
  const [savedReelIds, setSavedReelIds] = useState<Set<string>>(new Set(['reel_1']));
  const [searchQuery, setSearchQuery] = useState('Honda bike');
  const [location, setLocation] = useState('Rewa');
  const [language, setLanguageState] = useState<'hi' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_language');
      if (saved === 'en' || saved === 'hi') return saved;
    }
    return 'hi';
  });

  const setLanguage = (lang: 'hi' | 'en') => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bazaar_language', lang);
      } catch (e) {}
    }
  };
  const [soundMuted, setSoundMuted] = useState(true);
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');

  // Search History for personalized feed recommendations
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bazaar_search_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return ['Honda Shine', 'iPhone 13', '2 BHK Flat', 'Tractor'];
  });

  const addSearchQueryToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 10);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_search_history', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bazaar_search_history');
      } catch (e) {}
    }
  };

  // Sync listings from persistent server backend so all users and admin see all posts in one place
  const syncListingsFromServer = async () => {
    try {
      const res = await fetch('/api/listings');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.listings)) {
          if (data.listings.length === 0) {
            // Seed initial mock listings to server so persistence is primed
            await fetch('/api/listings/seed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ listings: INITIAL_LISTINGS }),
            });
          } else {
            // Merge server listings with local listings, putting server listings first (which includes new posts from all users & admin)
            setListings(prev => {
              const serverListings: Listing[] = data.listings;
              const serverIds = new Set(serverListings.map(l => l.id));
              const localOnly = prev.filter(l => !serverIds.has(l.id));
              // If there are local-only listings, push them to the server so everyone can see them!
              if (localOnly.length > 0) {
                localOnly.forEach(item => {
                  fetch('/api/listings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                  }).catch(() => {});
                });
              }
              const merged = [...serverListings, ...localOnly];
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('bazaar_listings', JSON.stringify(merged));
                } catch (e) {}
              }
              return merged;
            });
          }
        }
      }
    } catch (e) {
      console.warn('Listing sync network notice:', e);
    }
  };

  // Sync listings and support messages from server on startup
  useEffect(() => {
    syncListingsFromServer();

    // Sync support tickets from server so admin sees all real feedback
    fetch('/api/support-messages')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.messages) && data.messages.length > 0) {
          setSupportMessages(prev => {
            const srvIds = new Set(data.messages.map((m: SupportMessage) => m.id));
            const localOnly = prev.filter(m => !srvIds.has(m.id));
            const merged = [...data.messages, ...localOnly];
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('bazaar_support_messages', JSON.stringify(merged));
              } catch (e) {}
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_admin_auth');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed?.email?.toLowerCase() === 'amritarjun11@gmail.com';
        } catch (e) {}
      }
    }
    return false;
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [reviewsMap, setReviewsMap] = useState<Record<string, SellerReview[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_seller_reviews');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_REVIEWS_MAP;
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetSeller, setReviewTargetSeller] = useState<Seller | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [boostTargetListing, setBoostTargetListing] = useState<Listing | null>(null);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_admin_managed_users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_MANAGED_USERS;
  });

  const [listingModerationMap, setListingModerationMap] = useState<Record<string, ListingModerationStatus>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_admin_listing_moderation');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch (e) {}
      }
    }
    return {
      'listing_honda_shine': { listingId: 'listing_honda_shine', status: 'active', reviewedBy: 'Amrit Arjun (Admin)' },
      'listing_bullet_350': { listingId: 'listing_bullet_350', status: 'active', reviewedBy: 'Amrit Arjun (Admin)' },
      'listing_iphone_14': {
        listingId: 'listing_iphone_14',
        status: 'pending_review',
        rejectionReason: 'Seller needs to provide IMEI & original purchase invoice before ad is approved live.',
        reviewedAt: '28 Sep 2026',
        reviewedBy: 'Amrit Arjun (Admin)',
      },
    };
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    let profile: UserProfile = { ...CURRENT_USER };

    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('bazaar_user_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed && typeof parsed === 'object') {
            profile = {
              ...profile,
              ...parsed,
            };
          }
        } catch (e) {}
      }

      const savedAdmin = localStorage.getItem('bazaar_admin_auth');
      if (savedAdmin) {
        try {
          const parsed = JSON.parse(savedAdmin);
          if (parsed?.email?.toLowerCase() === 'amritarjun11@gmail.com') {
            profile = {
              ...profile,
              email: 'amritarjun11@gmail.com',
              role: 'admin',
              isAdmin: true,
              verified: true,
              // Keep saved user name if customized, otherwise default to Admin title
              name: profile.name && profile.name !== CURRENT_USER.name ? profile.name : 'Amrit Arjun (Admin)',
            };
          }
        } catch (e) {}
      }
    }
    return profile;
  });

  const openEditProfileModal = () => setIsEditProfileOpen(true);
  const closeEditProfileModal = () => setIsEditProfileOpen(false);

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const next = { ...prev, ...updated };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_user_profile', JSON.stringify(next));
        } catch (e) {
          console.warn('LocalStorage save error:', e);
        }
      }

      // Sync with managedUsers in Admin list as well
      setManagedUsers(uList => {
        const nextList = uList.map(u => {
          if (
            u.id === 'user_aman' ||
            (u.email && next.email && u.email.toLowerCase() === next.email.toLowerCase()) ||
            (u.phone && next.phone && u.phone === next.phone)
          ) {
            return {
              ...u,
              name: next.name || u.name,
              avatar: next.avatar || u.avatar,
              phone: next.phone || u.phone,
              location: next.location || u.location,
            };
          }
          return u;
        });

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_admin_managed_users', JSON.stringify(nextList));
          } catch (e) {}
        }
        return nextList;
      });

      return next;
    });
    showToast('✅ Profile & Photo saved successfully! ✨');
  };

  // Multiple Saved Accounts on this Device
  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_saved_accounts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [CURRENT_USER];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signup' | 'login' | 'switch'>('signup');

  const openAuthModal = (tab: 'signup' | 'login' | 'switch' = 'signup') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const createNewAccount = (newProfile: UserProfile) => {
    const fullProfile: UserProfile = {
      ...newProfile,
      id: newProfile.id || `user_${Date.now()}`,
      verified: true,
      activeAds: 0,
      soldAds: 0,
      reelsCount: 0,
      followersCount: 0,
      reviewsCount: 0,
      rating: 5.0,
      role: newProfile.role || 'seller',
    };

    setCurrentUser(fullProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bazaar_user_profile', JSON.stringify(fullProfile));
    }

    if (fullProfile.location) {
      const cityPart = fullProfile.location.split(',')[0].trim();
      if (cityPart) {
        setLocation(cityPart);
      }
    }

    setSavedAccounts(prev => {
      const filtered = prev.filter(
        a =>
          a.phone !== fullProfile.phone &&
          (!a.email || !fullProfile.email || a.email.toLowerCase() !== fullProfile.email.toLowerCase())
      );
      const nextList = [fullProfile, ...filtered];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazaar_saved_accounts', JSON.stringify(nextList));
      }
      return nextList;
    });

    // Also register into managedUsers for admin console
    setManagedUsers(prev => {
      const newManagedUser: ManagedUser = {
        id: fullProfile.id || `user_${Date.now()}`,
        name: fullProfile.name,
        email: fullProfile.email || `${fullProfile.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: fullProfile.phone,
        role: fullProfile.role === 'admin' ? 'admin' : (fullProfile.role === 'buyer' ? 'buyer' : 'seller'),
        location: fullProfile.location || 'Civil Lines, Rewa, MP',
        avatar: fullProfile.avatar,
        status: 'active',
        joinedDate: 'Today',
        lastActive: 'Online now',
        rating: 5.0,
        totalListings: 0,
        activeListings: 0,
        trustScore: 98,
        kycVerified: true,
        warningsCount: 0,
        warningsLog: [],
      };
      const updatedManaged = [newManagedUser, ...prev.filter(u => u.phone !== fullProfile.phone)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazaar_admin_managed_users', JSON.stringify(updatedManaged));
      }
      return updatedManaged;
    });

    setIsAuthModalOpen(false);
    showToast(`🎉 Naya account safalta-poorvak ban gaya! Swagat hai, ${fullProfile.name}!`);
    audioEngine.playChime();
  };

  const switchUserAccount = (targetUser: UserProfile) => {
    setCurrentUser(targetUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bazaar_user_profile', JSON.stringify(targetUser));
    }
    if (targetUser.location) {
      const cityPart = targetUser.location.split(',')[0].trim();
      if (cityPart) {
        setLocation(cityPart);
      }
    }
    setIsAuthModalOpen(false);
    showToast(`🔄 Switched to account: ${targetUser.name}`);
    audioEngine.playChime();
  };

  // Customer Support & Feedback System
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bazaar_support_messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_SUPPORT_MESSAGES;
  });

  const submitSupportMessage = (msg: {
    name: string;
    phone: string;
    email?: string;
    category: 'help' | 'contact_support' | 'feedback' | 'bug_report' | 'suggestion';
    subject?: string;
    message: string;
    city: string;
    rating?: number;
  }) => {
    const newMessage: SupportMessage = {
      id: `msg_${Date.now()}`,
      name: msg.name,
      phone: msg.phone,
      email: msg.email || (currentUser?.email ? currentUser.email : undefined),
      category: msg.category || 'contact_support',
      subject: msg.subject || 'कस्टमर सहायता संदेश',
      message: msg.message,
      city: msg.city || location,
      timestamp: 'अभी (Just now)',
      status: 'unread',
      rating: msg.rating,
      userRole: currentUser?.role || 'buyer',
    };

    setSupportMessages(prev => {
      const next = [newMessage, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_support_messages', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    // Sync to server so admin sees it across all browsers and devices
    fetch('/api/support-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    }).catch(err => console.warn('Support sync note:', err));

    audioEngine.playChime();
  };

  const updateSupportMessageStatus = (id: string, status: SupportMessage['status'], adminNotes?: string) => {
    setSupportMessages(prev => {
      const next = prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status,
            adminNotes: adminNotes !== undefined ? adminNotes : m.adminNotes,
          };
        }
        return m;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_support_messages', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    // Sync status to server
    fetch(`/api/support-messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    }).catch(err => console.warn('Support patch note:', err));

    showToast(`✅ संदेश स्थिति अपडेट: ${status}`);
  };

  const deleteSupportMessage = (id: string) => {
    setSupportMessages(prev => {
      const next = prev.filter(m => m.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_support_messages', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    showToast('🗑️ संदेश हटा दिया गया');
  };

  const unreadSupportMessagesCount = supportMessages.filter(m => m.status === 'unread').length;

  const [unreadChatCount, setUnreadChatCount] = useState(2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const navigateTo = (
    screen: ScreenType,
    payload?: { listing?: Listing; seller?: Seller; reel?: ShortReel; query?: string }
  ) => {
    if (payload?.listing) {
      // Increment views count for the listing
      const targetId = payload.listing.id;
      const newViews = (payload.listing.viewsCount || 0) + 1;
      const updatedListing = { ...payload.listing, viewsCount: newViews };
      setSelectedListing(updatedListing);

      setListings(prev => {
        const next = prev.map(item => (item.id === targetId ? { ...item, viewsCount: newViews } : item));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_listings', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
    }
    if (payload?.seller) setSelectedSeller(payload.seller);
    else if (payload?.listing?.seller) setSelectedSeller(payload.listing.seller);
    if (payload?.reel) setSelectedReel(payload.reel);
    if (payload?.query !== undefined) setSearchQuery(payload.query);

    if (screen === 'chat') {
      const activeListingForChat = payload?.listing || selectedListing;
      if (activeListingForChat) {
        setSelectedListing(activeListingForChat);
        if (activeListingForChat.seller) {
          setSelectedSeller(activeListingForChat.seller);
        }
        const targetId = activeListingForChat.id;
        const currentThread =
          chatThreads[targetId] ||
          SEED_CHAT_THREADS[targetId] ||
          getInitialChatForListing(activeListingForChat);
        setChatMessages(currentThread);
        setChatThreads(prev => {
          if (!prev[targetId]) {
            const next = { ...prev, [targetId]: currentThread };
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
              } catch (e) {}
            }
            return next;
          }
          return prev;
        });
      }
    }

    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openChatForListing = (listing: Listing) => {
    setSelectedListing(listing);
    if (listing.seller) setSelectedSeller(listing.seller);
    const targetId = listing.id;
    const currentThread =
      chatThreads[targetId] ||
      SEED_CHAT_THREADS[targetId] ||
      getInitialChatForListing(listing);
    setChatMessages(currentThread);
    setChatThreads(prev => {
      if (!prev[targetId]) {
        const next = { ...prev, [targetId]: currentThread };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      }
      return prev;
    });
    navigateTo('chat', { listing });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const prev = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('home');
    }
  };

  const previousScreen = screenHistory.length > 1 ? screenHistory[screenHistory.length - 2] : 'home';

  const openOfferModal = (listing?: Listing) => {
    setOfferTargetListing(listing || selectedListing);
    setIsOfferModalOpen(true);
  };

  const closeOfferModal = () => {
    setIsOfferModalOpen(false);
  };

  const openSupabaseModal = () => {
    setIsSupabaseModalOpen(true);
  };

  const closeSupabaseModal = () => {
    setIsSupabaseModalOpen(false);
  };

  const openToolsModal = (initialTab: 'rc' | 'valuation' | 'meetup' = 'rc') => {
    setToolsInitialTab(initialTab);
    setIsToolsModalOpen(true);
  };

  const closeToolsModal = () => {
    setIsToolsModalOpen(false);
  };

  const openReelWalkaround = (item?: Listing | ShortReel) => {
    if (!item) {
      setSelectedReel(shorts[0]);
    } else if ('hashtags' in item) {
      setSelectedReel(item);
    } else {
      const matched = shorts.find(s => s.listingId === item.id);
      if (matched) {
        setSelectedReel(matched);
      } else {
        setSelectedReel({
          id: `reel_${item.id}`,
          listingId: item.id,
          listingTitle: item.title,
          price: item.price,
          negotiable: item.negotiable,
          sellerHandle: item.seller.handle,
          sellerName: item.seller.name,
          sellerAvatar: item.seller.avatar,
          sellerVerified: item.seller.verified,
          location: item.location.neighborhood,
          distanceKm: item.location.distanceKm,
          caption: item.description[0] || 'Walkaround 30s Inspection Reel',
          hashtags: ['#BazaarReels', '#Rewa'],
          thumbnailUrl: item.images[0],
          audioName: item.videoAudioTitle || 'Original Sound - Seller Walkaround',
          durationSec: item.videoDurationSec || 30,
          viewsCount: item.reelsViewsCount || 4500,
          likesCount: 320,
          commentsCount: 24,
          savesCount: 88,
          sharesCount: 42,
        });
      }
    }
    setIsReelModalOpen(true);

    // If sound is unmuted, start engine audio
    if (!soundMuted) {
      const isBullet = (item as Listing)?.title?.toLowerCase()?.includes('classic 350') || (item as ShortReel)?.listingTitle?.toLowerCase()?.includes('classic 350');
      audioEngine.playEngineSound(isBullet ? 'bullet' : 'bike');
    }
  };

  const closeReelModal = () => {
    setIsReelModalOpen(false);
    audioEngine.stop();
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    if (!next) {
      const isBullet = selectedReel.listingTitle?.toLowerCase()?.includes('classic') || selectedListing?.title?.toLowerCase()?.includes('classic');
      audioEngine.playEngineSound(isBullet ? 'bullet' : 'bike');
      showToast('🔊 Walkaround Engine Sound ON');
    } else {
      audioEngine.stop();
      showToast('🔇 Audio Muted');
    }
  };

  const toggleFavorite = (listingId: string) => {
    let willBeSaved = false;
    setSavedListingIds(prev => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
        showToast('Removed from Saved Items');
        willBeSaved = false;
      } else {
        next.add(listingId);
        showToast('❤️ Saved to Your Favorites!');
        willBeSaved = true;
      }
      return next;
    });

    // Update favoritesCount on the listing and sync to server for engagement scoring
    setListings(prev => {
      const updated = prev.map(item => {
        if (item.id === listingId) {
          const newFavorites = willBeSaved
            ? (item.favoritesCount || 0) + 1
            : Math.max(0, (item.favoritesCount || 1) - 1);

          // Sync to server in background
          fetch(`/api/listings/${listingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favoritesCount: newFavorites }),
          }).catch(() => {});

          return { ...item, favoritesCount: newFavorites };
        }
        return item;
      });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_listings', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const toggleFollowSeller = (sellerId: string) => {
    setFollowedSellerIds(prev => {
      const next = new Set(prev);
      if (next.has(sellerId)) {
        next.delete(sellerId);
        showToast('Unfollowed Seller');
      } else {
        next.add(sellerId);
        showToast('✨ Following Seller! New reels will appear in your feed.');
      }
      return next;
    });
  };

  const toggleLikeReel = (reelId: string) => {
    setLikedReelIds(prev => {
      const next = new Set(prev);
      const isLiked = next.has(reelId);
      if (isLiked) {
        next.delete(reelId);
      } else {
        next.add(reelId);
      }

      setShorts(current =>
        current.map(r =>
          r.id === reelId
            ? { ...r, likesCount: isLiked ? r.likesCount - 1 : r.likesCount + 1, isLiked: !isLiked }
            : r
        )
      );
      return next;
    });
  };

  const toggleSaveReel = (reelId: string) => {
    setSavedReelIds(prev => {
      const next = new Set(prev);
      const isSaved = next.has(reelId);
      if (isSaved) {
        next.delete(reelId);
        showToast('Removed from saved reels');
      } else {
        next.add(reelId);
        showToast('🔖 Reel saved to your Shortlist!');
      }
      return next;
    });
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const activeListing = selectedListing || INITIAL_LISTINGS[0];
    const targetListingId = activeListing.id;
    const sellerName = activeListing.seller?.proprietorName || activeListing.seller?.name || 'Seller';
    const sellerBusiness = activeListing.seller?.name || 'Seller';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `msg_${Date.now()}`;

    const newMsg: ChatMessage = {
      id: msgId,
      sender: 'buyer',
      text: text.trim(),
      timestamp: timeStr,
      status: 'sent', // 1. WhatsApp Single Tick (Sent)
      type: 'text',
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatThreads(prev => {
      const currentList = prev[targetListingId] || [];
      const updated = { ...prev, [targetListingId]: [...currentList, newMsg] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_chat_threads', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // 2. WhatsApp Double Grey Tick (Delivered to seller's phone after 800ms)
    setTimeout(() => {
      setChatMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, status: 'delivered' as const } : m))
      );
      setChatThreads(prev => {
        const currentList = prev[targetListingId] || [];
        const updated = {
          ...prev,
          [targetListingId]: currentList.map(m => (m.id === msgId ? { ...m, status: 'delivered' as const } : m)),
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_chat_threads', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
    }, 800);

    // 3. WhatsApp Double Blue Tick (Viewed / Read by seller after 1700ms)
    setTimeout(() => {
      setChatMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, status: 'read' as const } : m))
      );
      setChatThreads(prev => {
        const currentList = prev[targetListingId] || [];
        const updated = {
          ...prev,
          [targetListingId]: currentList.map(m => (m.id === msgId ? { ...m, status: 'read' as const } : m)),
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_chat_threads', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
      setSellerIsTyping(true);
    }, 1700);

    // 4. Seller finishes typing and sends contextual reply after 3000ms
    setTimeout(() => {
      setSellerIsTyping(false);

      const replyText = generateSellerReply(text, activeListing);

      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        sender: 'seller',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };

      setChatMessages(prev => [...prev, replyMsg]);
      setChatThreads(prev => {
        const currentList = prev[targetListingId] || [];
        const updated = { ...prev, [targetListingId]: [...currentList, replyMsg] };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_chat_threads', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      // Trigger background push notification with REAL seller name
      if (typeof document !== 'undefined' && (document.hidden || currentScreen !== 'chat')) {
        notificationService.showNotification({
          title: `💬 ${sellerName} (${sellerBusiness})`,
          body: replyText,
          url: '/chat',
        });
      }
    }, 3000);
  };

  const acceptOffer = (amount: number) => {
    const activeListing = selectedListing || INITIAL_LISTINGS[0];
    const targetListingId = activeListing.id;
    const sellerName = activeListing.seller?.proprietorName || activeListing.seller?.name || 'Seller';

    const confirmationMsg: ChatMessage = {
      id: `msg_deal_${Date.now()}`,
      sender: 'buyer',
      text: `Deal Accepted at ₹${amount.toLocaleString()}! Generating verified inspection pass...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'deal_closed',
    };

    setChatMessages(prev => {
      const updated = prev.map(m => {
        if (m.type === 'counter_offer' && m.offerData) {
          return {
            ...m,
            offerData: { ...m.offerData, status: 'accepted' as const },
          };
        }
        return m;
      });
      return [...updated, confirmationMsg];
    });

    setChatThreads(prev => {
      const currentList = prev[targetListingId] || [];
      const updated = currentList.map(m => {
        if (m.type === 'counter_offer' && m.offerData) {
          return {
            ...m,
            offerData: { ...m.offerData, status: 'accepted' as const },
          };
        }
        return m;
      });
      const next = { ...prev, [targetListingId]: [...updated, confirmationMsg] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    showToast(`🎉 Deal Closed at ₹${amount.toLocaleString()}! ${sellerName} has been notified.`);
  };

  const declineOffer = () => {
    const activeListing = selectedListing || INITIAL_LISTINGS[0];
    const targetListingId = activeListing.id;

    setChatMessages(prev =>
      prev.map(m => {
        if (m.type === 'counter_offer' && m.offerData) {
          return {
            ...m,
            offerData: { ...m.offerData, status: 'declined' as const },
          };
        }
        return m;
      })
    );

    setChatThreads(prev => {
      const currentList = prev[targetListingId] || [];
      const next = {
        ...prev,
        [targetListingId]: currentList.map(m => {
          if (m.type === 'counter_offer' && m.offerData) {
            return {
              ...m,
              offerData: { ...m.offerData, status: 'declined' as const },
            };
          }
          return m;
        }),
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    showToast('Counter offer declined');
  };

  const counterOffer = (amount: number, note?: string) => {
    const activeListing = offerTargetListing || selectedListing || INITIAL_LISTINGS[0];
    const targetListingId = activeListing.id;
    const sellerName = activeListing.seller?.proprietorName || activeListing.seller?.name || 'Seller';

    setSelectedListing(activeListing);
    if (activeListing.seller) setSelectedSeller(activeListing.seller);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const offerMsgId = `msg_counter_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: offerMsgId,
      sender: 'buyer',
      timestamp: timeStr,
      status: 'sent',
      type: 'offer',
      offerData: {
        round: 2,
        amount,
        originalPrice: activeListing.price || 75000,
        status: 'pending',
        sellerNote: note || 'Counter proposal submitted by buyer',
      },
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatThreads(prev => {
      const currentList = prev[targetListingId] || [];
      const next = { ...prev, [targetListingId]: [...currentList, newMsg] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    closeOfferModal();
    navigateTo('chat', { listing: activeListing });
    showToast(`Offer of ₹${amount.toLocaleString()} submitted to ${sellerName}!`);

    setTimeout(() => {
      setChatMessages(prev =>
        prev.map(m => (m.id === offerMsgId ? { ...m, status: 'delivered' as const } : m))
      );
      setChatThreads(prev => {
        const currentList = prev[targetListingId] || [];
        const next = {
          ...prev,
          [targetListingId]: currentList.map(m => (m.id === offerMsgId ? { ...m, status: 'delivered' as const } : m)),
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
    }, 1000);

    setTimeout(() => {
      setChatMessages(prev =>
        prev.map(m => (m.id === offerMsgId ? { ...m, status: 'read' as const } : m))
      );
      setChatThreads(prev => {
        const currentList = prev[targetListingId] || [];
        const next = {
          ...prev,
          [targetListingId]: currentList.map(m => (m.id === offerMsgId ? { ...m, status: 'read' as const } : m)),
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_chat_threads', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
    }, 2200);
  };

  const addNewListing = (newAd: Listing) => {
    const adWithTimestamp: Listing = {
      ...newAd,
      createdAt: newAd.createdAt || Date.now(),
      postedAgo: 'Just now',
    };

    setListings(prev => {
      const updated = [adWithTimestamp, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_listings', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage save error for listings:', e);
        }
      }
      return updated;
    });

    // Sync to server so every other user & admin sees it immediately in real time
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adWithTimestamp),
    }).catch(err => console.warn('Failed to sync new ad to server:', err));

    // Increment user active ads count
    updateUserProfile({
      activeAds: (currentUser.activeAds || 0) + 1,
    });

    // If new ad has a video reel, add to shorts feed as well
    if (newAd.hasVideoReel) {
      const sellerDisplayName = newAd.seller.proprietorName || newAd.seller.name || currentUser.name || 'Seller';
      const cleanHandle = `@${sellerDisplayName.toLowerCase().replace(/\s+/g, '_')}`;

      const newReel: ShortReel = {
        id: `reel_${newAd.id}`,
        listingId: newAd.id,
        listingTitle: newAd.title,
        price: newAd.price,
        negotiable: newAd.negotiable,
        sellerHandle: cleanHandle,
        sellerName: sellerDisplayName,
        sellerAvatar: newAd.seller.avatar || currentUser.avatar,
        sellerVerified: true,
        location: newAd.location.neighborhood,
        distanceKm: 0.5,
        caption: newAd.description[0] || 'Check out my new advertisement walkaround on BazaarReels!',
        hashtags: ['#RewaMarket', '#BazaarReels'],
        thumbnailUrl: newAd.images[0],
        audioName: newAd.videoAudioTitle || `Original Sound - ${sellerDisplayName}`,
        durationSec: newAd.videoDurationSec || 28,
        viewsCount: 1,
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        sharesCount: 0,
      };

      setShorts(prev => {
        const updatedShorts = [newReel, ...prev];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bazaar_shorts', JSON.stringify(updatedShorts));
          } catch (e) {}
        }
        return updatedShorts;
      });
    }

    showToast('🚀 Advertisement & Photo Published Successfully!');
    navigateTo('home');
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'mobile' ? 'responsive' : 'mobile'));
  };

  const openAdminLoginModal = () => {
    setIsAdminLoginModalOpen(true);
  };

  const closeAdminLoginModal = () => {
    setIsAdminLoginModalOpen(false);
  };

  const openQrModal = () => {
    setIsQrModalOpen(true);
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
  };

  const openSafetyModal = () => {
    setIsSafetyModalOpen(true);
  };

  const closeSafetyModal = () => {
    setIsSafetyModalOpen(false);
  };

  const openReviewModal = (targetSeller?: Seller) => {
    setReviewTargetSeller(targetSeller || selectedSeller || SELLER_RAHUL);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const addSellerReview = (sellerId: string, reviewData: { rating: number; tags: string[]; comment: string }) => {
    const newRev: SellerReview = {
      id: `rev_${Date.now()}`,
      sellerId,
      authorName: currentUser.name || 'Verified Buyer',
      authorAvatar: currentUser.avatar,
      rating: reviewData.rating,
      tags: reviewData.tags,
      comment: reviewData.comment,
      date: 'Just now',
      verifiedBuyer: true,
    };

    setReviewsMap(prev => {
      const existing = prev[sellerId] || [];
      const updated = [newRev, ...existing];
      const nextMap = { ...prev, [sellerId]: updated };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_seller_reviews', JSON.stringify(nextMap));
        } catch (e) {}
      }
      return nextMap;
    });

    // Update seller's rating in selectedSeller and listings
    const currentList = reviewsMap[sellerId] || [];
    const allRatings = [reviewData.rating, ...currentList.map(r => r.rating)];
    const avgRating = Number((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1));
    const newCount = allRatings.length;

    setSelectedSeller(prev => (prev?.id === sellerId ? { ...prev, rating: avgRating, reviewsCount: newCount } : prev));
    setListings(prev =>
      prev.map(l =>
        l.seller.id === sellerId
          ? { ...l, seller: { ...l.seller, rating: avgRating, reviewsCount: newCount } }
          : l
      )
    );

    audioEngine.playChime();
    showToast(`⭐ ${reviewData.rating}-Star review safalta-poorvak post ho gaya!`);
    setIsReviewModalOpen(false);
  };

  const getSellerReviews = (sellerId: string): SellerReview[] => {
    return reviewsMap[sellerId] || INITIAL_REVIEWS_MAP[sellerId] || [];
  };

  const loginAsAdmin = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'amritarjun11@gmail.com') {
      return {
        success: false,
        message: 'Access Denied: Only authorized administrator email (amritarjun11@gmail.com) can log in as Admin.',
      };
    }

    if (!pass || pass.length < 4) {
      return {
        success: false,
        message: 'Password must be at least 4 characters long.',
      };
    }

    let authenticatedViaSupabase = false;
    if (isSupabaseConfigured) {
      try {
        const res = await supabaseService.signIn(cleanEmail, pass);
        if (res?.user) {
          authenticatedViaSupabase = true;
        }
      } catch (authErr) {
        // Fallback to local admin master verification
      }
    }

    const savedPassword = typeof window !== 'undefined' ? localStorage.getItem('bazaar_admin_password') : null;
    const validPassword = savedPassword || 'admin123';

    if (authenticatedViaSupabase || pass === validPassword || !savedPassword) {
      if (!savedPassword && typeof window !== 'undefined') {
        localStorage.setItem('bazaar_admin_password', pass);
      }

      const adminProfile: UserProfile = {
        ...currentUser,
        name: 'Amrit Arjun (Admin)',
        email: 'amritarjun11@gmail.com',
        role: 'admin',
        isAdmin: true,
        verified: true,
      };

      setCurrentUser(adminProfile);
      setIsAdmin(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'bazaar_admin_auth',
          JSON.stringify({
            email: cleanEmail,
            timestamp: Date.now(),
            method: authenticatedViaSupabase ? 'supabase_auth' : 'master_auth',
          })
        );
      }

      showToast('👑 Welcome Amrit Arjun! Admin Console unlocked.');
      return {
        success: true,
        message: 'Admin credentials verified. Welcome to BazaarReels Console!',
      };
    } else {
      return {
        success: false,
        message: 'Incorrect admin password. (Default is admin123 or Supabase account password).',
      };
    }
  };

  const logoutAdmin = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bazaar_admin_auth');
      const savedProfile = localStorage.getItem('bazaar_user_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed && typeof parsed === 'object') {
            setIsAdmin(false);
            setCurrentUser({ ...CURRENT_USER, ...parsed, isAdmin: false, role: 'seller' });
            showToast('Logged out from Admin Console');
            if (currentScreen === 'admin') navigateTo('home');
            return;
          }
        } catch (e) {}
      }
    }
    setIsAdmin(false);
    setCurrentUser(CURRENT_USER);
    showToast('Logged out from Admin Console');
    if (currentScreen === 'admin') {
      navigateTo('home');
    }
  };

  const banUser = (userId: string, reason?: string) => {
    setManagedUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userId) {
          const newWarning: UserWarning = {
            id: `warn_${Date.now()}`,
            reason: reason || 'Account permanently banned by administrator for violating community guidelines.',
            timestamp: new Date().toLocaleString(),
            issuedBy: 'Amrit Arjun (Admin)',
          };
          return {
            ...u,
            status: 'banned' as const,
            warningsCount: u.warningsCount + 1,
            warningsLog: [newWarning, ...u.warningsLog],
            notes: `Banned: ${reason || 'Admin action'}`,
          };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazaar_admin_managed_users', JSON.stringify(next));
      }
      return next;
    });
    showToast(`🚫 User has been BANNED successfully!`);
  };

  const unbanUser = (userId: string) => {
    setManagedUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            status: 'active' as const,
            notes: 'Ban lifted by Admin on ' + new Date().toLocaleDateString(),
          };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazaar_admin_managed_users', JSON.stringify(next));
      }
      return next;
    });
    showToast(`✅ Ban lifted! User account restored to Active.`);
  };

  const warnUser = (userId: string, reason: string, listingId?: string, listingTitle?: string) => {
    setManagedUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userId) {
          const newCount = u.warningsCount + 1;
          const newStatus = newCount >= 3 ? ('banned' as const) : ('warned' as const);
          const newWarning: UserWarning = {
            id: `warn_${Date.now()}`,
            reason,
            timestamp: new Date().toLocaleString(),
            issuedBy: 'Amrit Arjun (Admin)',
            listingId,
            listingTitle,
          };
          return {
            ...u,
            status: newStatus,
            warningsCount: newCount,
            warningsLog: [newWarning, ...u.warningsLog],
          };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazaar_admin_managed_users', JSON.stringify(next));
      }
      return next;
    });

    if (listingId) {
      updateListingModerationStatus(listingId, 'flagged', reason);
    }

    showToast(`⚠️ Official Warning issued to user! (${reason})`);
  };

  const setUserReviewStatus = (userId: string, status: 'active' | 'pending_review' | 'banned') => {
    setManagedUsers(prev => {
      const next = prev.map(u => (u.id === userId ? { ...u, status } : u));
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazaar_admin_managed_users', JSON.stringify(next));
      }
      return next;
    });
    showToast(`User status set to ${status.replace('_', ' ').toUpperCase()}`);
  };

  const updateListingModerationStatus = (
    listingId: string,
    status: 'active' | 'pending_review' | 'flagged' | 'rejected',
    reason?: string
  ) => {
    setListingModerationMap(prev => {
      const updated = {
        ...prev,
        [listingId]: {
          listingId,
          status,
          rejectionReason: reason,
          warningIssued: status === 'flagged',
          reviewedAt: new Date().toLocaleString(),
          reviewedBy: 'Amrit Arjun (Admin)',
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazaar_admin_listing_moderation', JSON.stringify(updated));
      }
      return updated;
    });
    showToast(`Listing updated: ${status.toUpperCase()}`);
  };

  // ==========================================
  // MY ADS & LISTING LIFECYCLE MANAGEMENT
  // ==========================================
  const updateListing = async (id: string, patch: Partial<Listing>) => {
    setListings(prev => {
      const next = prev.map(l => (l.id === id ? { ...l, ...patch } : l));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_listings', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    setSelectedListing(prev => (prev?.id === id ? { ...prev, ...patch } : prev));

    try {
      await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch (err) {
      console.warn('Failed to update listing on server:', err);
    }
  };

  const toggleListingSoldStatus = async (id: string) => {
    const target = listings.find(l => l.id === id);
    if (!target) return;
    const newStatus: 'active' | 'sold' = target.status === 'sold' ? 'active' : 'sold';
    await updateListing(id, { status: newStatus });
    if (newStatus === 'sold') {
      audioEngine.playChime();
      showToast('🎉 Mubarak! Ad "SOLD / बिक गया" mark ho gaya hai.');
      updateUserProfile({
        soldAds: (currentUser.soldAds || 0) + 1,
        activeAds: Math.max(0, (currentUser.activeAds || 1) - 1),
      });
    } else {
      audioEngine.playChime();
      showToast('✅ Ad wapas "ACTIVE / उपलब्ध" ho gaya hai.');
      updateUserProfile({
        activeAds: (currentUser.activeAds || 0) + 1,
        soldAds: Math.max(0, (currentUser.soldAds || 1) - 1),
      });
    }
  };

  const deleteListing = async (id: string) => {
    setListings(prev => {
      const next = prev.filter(l => l.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bazaar_listings', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    try {
      await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete listing on server:', err);
    }

    audioEngine.playChime();
    showToast('🗑️ Ad safalta-poorvak hata diya gaya.');
    updateUserProfile({
      activeAds: Math.max(0, (currentUser.activeAds || 1) - 1),
    });
  };

  const openBoostModal = (listing?: Listing) => {
    const target = listing || userListings[0] || listings[0];
    setBoostTargetListing(target);
    setIsBoostModalOpen(true);
  };

  const closeBoostModal = () => {
    setIsBoostModalOpen(false);
  };

  const activateBoostPlan = async (
    listingId: string,
    plan: { id: string; name: string; days: number; price: number }
  ) => {
    const boostExpiry = Date.now() + plan.days * 24 * 60 * 60 * 1000;
    await updateListing(listingId, {
      featured: true,
      boostPlan: plan.name,
      boostExpiry,
      createdAt: Date.now(),
      postedAgo: 'Just now (Boosted)',
    });
    audioEngine.playChime();
    showToast(`⭐ Mubarak! "${plan.name}" (${plan.days} Din) safalta-poorvak activate ho gaya!`);
    setIsBoostModalOpen(false);
  };

  const boostListing = async (id: string) => {
    const target = listings.find(l => l.id === id);
    if (target) {
      openBoostModal(target);
    } else {
      await updateListing(id, { featured: true, createdAt: Date.now(), postedAgo: 'Just now' });
      audioEngine.playChime();
      showToast('⭐ Badhai ho! Ad "FEATURED / BOOSTED" ho gaya hai!');
    }
  };

  const isMyAd = (listing: Listing): boolean => {
    if (!listing || !listing.seller) return false;
    const seller = listing.seller;
    if (currentUser.id && seller.id && currentUser.id === seller.id) return true;
    if (currentUser.phone && seller.phone && currentUser.phone === seller.phone) return true;
    if (currentUser.name && seller.name && currentUser.name.trim().toLowerCase() === seller.name.trim().toLowerCase()) return true;
    if (isAdmin && (seller.id === 'admin_master' || seller.badges?.some(b => b.includes('Admin')))) return true;
    return false;
  };

  const userListings = listings.filter(isMyAd);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        previousScreen,
        navigateTo,
        goBack,
        listings,
        shorts,
        selectedListing,
        selectedSeller,
        selectedReel,
        isReelModalOpen,
        isOfferModalOpen,
        offerTargetListing,
        openOfferModal,
        closeOfferModal,
        openReelWalkaround,
        closeReelModal,
        chatMessages,
        chatThreads,
        openChatForListing,
        sellerIsTyping,
        sendChatMessage,
        acceptOffer,
        declineOffer,
        counterOffer,
        savedListingIds,
        toggleFavorite,
        followedSellerIds,
        toggleFollowSeller,
        likedReelIds,
        toggleLikeReel,
        savedReelIds,
        toggleSaveReel,
        searchQuery,
        setSearchQuery,
        location,
        setLocation,
        language,
        setLanguage,
        soundMuted,
        toggleSound,
        viewMode,
        toggleViewMode,
        currentUser,
        updateUserProfile,
        isEditProfileOpen,
        openEditProfileModal,
        closeEditProfileModal,
        unreadChatCount,
        toastMessage,
        showToast,
        addNewListing,
        isSupabaseModalOpen,
        openSupabaseModal,
        closeSupabaseModal,
        isToolsModalOpen,
        toolsInitialTab,
        openToolsModal,
        closeToolsModal,
        isAdmin,
        adminEmail: 'amritarjun11@gmail.com',
        isAdminLoginModalOpen,
        openAdminLoginModal,
        closeAdminLoginModal,
        isQrModalOpen,
        openQrModal,
        closeQrModal,
        isSafetyModalOpen,
        openSafetyModal,
        closeSafetyModal,
        loginAsAdmin,
        logoutAdmin,
        managedUsers,
        banUser,
        unbanUser,
        warnUser,
        setUserReviewStatus,
        listingModerationMap,
        updateListingModerationStatus,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        createNewAccount,
        switchUserAccount,
        savedAccounts,
        supportMessages,
        submitSupportMessage,
        updateSupportMessageStatus,
        deleteSupportMessage,
        unreadSupportMessagesCount,
        searchHistory,
        addSearchQueryToHistory,
        clearSearchHistory,
        syncListingsFromServer,
        updateListing,
        toggleListingSoldStatus,
        deleteListing,
        boostListing,
        isMyAd,
        userListings,
        isReviewModalOpen,
        reviewTargetSeller,
        openReviewModal,
        closeReviewModal,
        addSellerReview,
        getSellerReviews,
        isBoostModalOpen,
        boostTargetListing,
        openBoostModal,
        closeBoostModal,
        activateBoostPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
