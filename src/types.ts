export type ScreenType =
  | 'home'
  | 'map'
  | 'categories'
  | 'search'
  | 'product-detail'
  | 'post-ad'
  | 'shorts'
  | 'chat'
  | 'seller-profile'
  | 'profile'
  | 'admin'
  | 'my-ads';

export interface LocationInfo {
  city: string;
  state: string;
  neighborhood: string;
  distanceKm: number;
  pinCode?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface Seller {
  id: string;
  name: string;
  proprietorName?: string;
  handle: string;
  avatar: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  location: LocationInfo;
  activeAdsCount: number;
  soldCount: number;
  followersCount: number;
  reelViewsCount: string;
  memberSince: string;
  responseRate: string;
  replyTime: string;
  trustScore: number;
  badges: string[];
  phone: string;
  address?: string;
  gstNumber?: string;
  dealerId?: string;
}

export interface SellerReview {
  id: string;
  sellerId: string;
  sellerHandle?: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  tags: string[];
  comment: string;
  date: string;
  verifiedBuyer?: boolean;
}

export interface ListingSpecification {
  label: string;
  value: string;
  verified?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  negotiable: boolean;
  categoryId: string;
  categoryName: string;
  subCategory: string;
  condition: string;
  images: string[];
  hasVideoReel: boolean;
  videoDurationSec?: number;
  videoThumbnail?: string;
  videoUrl?: string;
  videoAudioTitle?: string;
  specs: ListingSpecification[];
  attributes: {
    odometerKm?: string;
    fuelType?: string;
    owners?: string;
    gearbox?: string;
    regYear?: string;
    insuranceValidity?: string;
    rcStatus?: string;
    tyreCondition?: string;
    chassisCondition?: string;
    batteryHealth?: string;
    bhk?: string;
    [key: string]: any;
  };
  description: string[];
  location: LocationInfo;
  seller: Seller;
  featured?: boolean;
  verifiedRC?: boolean;
  postedAgo: string;
  createdAt?: number;
  viewsCount: number;
  favoritesCount: number;
  reelsViewsCount?: number;
  status: 'active' | 'pending' | 'sold' | 'expired';
  riskScore?: 'low' | 'medium' | 'high';
  boostPlan?: string;
  boostExpiry?: number;
}

export interface ShortReel {
  id: string;
  listingId: string;
  listingTitle: string;
  price: number;
  negotiable: boolean;
  sellerHandle: string;
  sellerName: string;
  sellerAvatar: string;
  sellerVerified: boolean;
  location: string;
  distanceKm: number;
  caption: string;
  hashtags: string[];
  thumbnailUrl: string;
  videoUrl?: string;
  audioName: string;
  audioSubtitle?: string;
  durationSec: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'video_snippet' | 'offer' | 'counter_offer' | 'deal_closed';
  videoSnippet?: {
    thumbnail: string;
    title: string;
    duration: string;
    note: string;
  };
  offerData?: {
    round: number;
    amount: number;
    originalPrice: number;
    status: 'pending' | 'countered' | 'accepted' | 'declined';
    sellerNote?: string;
    savings?: number;
    expiresIn?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  reelsCount: number;
  tag?: string;
  subcategories: { name: string; count: number }[];
  highlight?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  location: string;
  verified: boolean;
  activeAds: number;
  soldAds: number;
  reelsCount: number;
  followersCount: number;
  reviewsCount: number;
  rating: number;
  role?: 'buyer' | 'seller' | 'dealer' | 'admin';
  isAdmin?: boolean;
  bio?: string;
}

export interface UserWarning {
  id: string;
  reason: string;
  timestamp: string;
  issuedBy: string;
  listingId?: string;
  listingTitle?: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'dealer' | 'admin';
  location: string;
  avatar: string;
  joinedDate: string;
  trustScore: number;
  rating: number;
  totalListings: number;
  activeListings: number;
  status: 'active' | 'warned' | 'pending_review' | 'banned';
  warningsCount: number;
  warningsLog: UserWarning[];
  notes?: string;
  kycVerified: boolean;
  lastActive: string;
}

export interface ListingModerationStatus {
  listingId: string;
  status: 'active' | 'pending_review' | 'flagged' | 'rejected';
  rejectionReason?: string;
  warningIssued?: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  category: 'help' | 'contact_support' | 'feedback' | 'bug_report' | 'suggestion';
  subject?: string;
  message: string;
  city: string;
  timestamp: string;
  status: 'unread' | 'read' | 'in_progress' | 'resolved';
  rating?: number;
  adminNotes?: string;
  userRole?: string;
}
