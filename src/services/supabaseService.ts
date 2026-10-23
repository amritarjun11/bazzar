import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Listing, ShortReel, ChatMessage, UserProfile } from '../types';

export interface SupabaseProfile {
  id: string;
  username: string;
  full_name: string;
  handle: string;
  phone: string;
  avatar_url: string;
  role: 'buyer' | 'seller' | 'dealer' | 'admin';
  verified: boolean;
  trust_score: number;
  rating: number;
  city: string;
  neighborhood: string;
}

export const supabaseService = {
  // ----------------------------------------------------
  // CONNECTION CHECK
  // ----------------------------------------------------
  async checkConnection(): Promise<{ success: boolean; message: string; tableCount?: number }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        message: 'Supabase credentials (URL / Anon Key) not configured yet.',
      };
    }

    try {
      const { data, error } = await supabase.from('categories').select('id', { count: 'exact' });
      if (error) {
        return {
          success: false,
          message: `Supabase responded with error: ${error.message} (Make sure schema.sql has been executed in SQL Editor)`,
        };
      }
      return {
        success: true,
        message: `Successfully connected to Supabase! (${data?.length || 0} categories available)`,
        tableCount: data?.length || 0,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error while connecting to Supabase.',
      };
    }
  },

  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  async signUp(email: string, pass: string, fullName: string, phone?: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          city: 'Rewa',
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, pass: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  // ----------------------------------------------------
  // PHONE OTP AUTHENTICATION
  // ----------------------------------------------------
  async signInWithPhoneOtp(phone: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^0+/, '')}`;
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        channel: 'sms',
      },
    });
    if (error) throw error;
    return data;
  },

  async verifyPhoneOtp(phone: string, token: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^0+/, '')}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSessionUser() {
    if (!isSupabaseConfigured) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile };
  },

  // ----------------------------------------------------
  // LISTINGS (Buy / Sell Ads)
  // ----------------------------------------------------
  async fetchListings(category?: string): Promise<Listing[] | null> {
    if (!isSupabaseConfigured) return null;

    let query = supabase
      .from('listings')
      .select('*, profiles:seller_id(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetchListings error:', error.message);
      return null;
    }

    // Map database rows to UI Listing type
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      negotiable: Boolean(row.negotiable),
      categoryId: row.category_id || 'all',
      categoryName: row.category_id ? row.category_id.toUpperCase() : 'General',
      subCategory: row.sub_category || 'General',
      condition: row.condition,
      images: row.images || [],
      hasVideoReel: Boolean(row.has_video_reel),
      videoDurationSec: row.video_duration_sec,
      videoThumbnail: row.video_thumbnail,
      videoUrl: row.video_url,
      videoAudioTitle: row.video_audio_title,
      specs: row.specs || [],
      attributes: row.attributes || {},
      description: row.description || [],
      location: {
        city: row.city || 'Rewa',
        state: row.state || 'Madhya Pradesh',
        neighborhood: row.neighborhood || 'Civil Lines',
        distanceKm: Number(row.distance_km || 1.2),
        pinCode: row.pin_code || '486001',
        landmark: row.landmark,
        lat: row.latitude ? Number(row.latitude) : 24.5362,
        lng: row.longitude ? Number(row.longitude) : 81.3037,
      },
      seller: {
        id: row.seller_id,
        name: row.profiles?.full_name || 'Verified Seller',
        handle: row.profiles?.handle || '@seller_rewa',
        avatar: row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        verified: Boolean(row.profiles?.verified),
        rating: Number(row.profiles?.rating || 4.8),
        reviewsCount: Number(row.profiles?.reviews_count || 12),
        location: {
          city: row.city || 'Rewa',
          state: 'Madhya Pradesh',
          neighborhood: row.neighborhood || 'Civil Lines',
          distanceKm: 1.2,
        },
        activeAdsCount: Number(row.profiles?.active_ads_count || 3),
        soldCount: Number(row.profiles?.sold_count || 14),
        followersCount: Number(row.profiles?.followers_count || 120),
        reelViewsCount: '18.4K',
        memberSince: '2023',
        responseRate: '98%',
        replyTime: 'Under 10 mins',
        trustScore: Number(row.profiles?.trust_score || 92),
        badges: row.profiles?.badges || ['Verified Local Seller'],
        phone: row.profiles?.phone || '+91 98930 11223',
      },
      featured: Boolean(row.featured),
      verifiedRC: Boolean(row.verified_rc),
      postedAgo: 'Recently',
      viewsCount: Number(row.views_count || 0),
      favoritesCount: Number(row.favorites_count || 0),
      reelsViewsCount: Number(row.reels_views_count || 0),
      status: row.status,
      riskScore: row.risk_score || 'low',
    }));
  },

  async createListing(listing: Listing, sellerId: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('listings').insert({
      seller_id: sellerId,
      category_id: listing.categoryId,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      original_price: listing.originalPrice,
      negotiable: listing.negotiable,
      condition: listing.condition,
      sub_category: listing.subCategory,
      images: listing.images,
      has_video_reel: listing.hasVideoReel,
      video_url: listing.videoUrl,
      video_thumbnail: listing.videoThumbnail,
      video_duration_sec: listing.videoDurationSec,
      video_audio_title: listing.videoAudioTitle,
      city: listing.location.city,
      state: listing.location.state,
      neighborhood: listing.location.neighborhood,
      pin_code: listing.location.pinCode,
      landmark: listing.location.landmark,
      latitude: listing.location.lat,
      longitude: listing.location.lng,
      distance_km: listing.location.distanceKm,
      specs: listing.specs,
      attributes: listing.attributes,
      status: 'active',
      verified_rc: listing.verifiedRC || false,
    }).select().single();

    if (error) throw error;
    return data;
  },

  // ----------------------------------------------------
  // REELS & SHORTS
  // ----------------------------------------------------
  async fetchShortReels(): Promise<ShortReel[] | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('short_reels')
      .select('*, profiles:seller_id(*), listings:listing_id(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchShortReels error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      listingId: row.listing_id,
      listingTitle: row.listings?.title || 'Hyperlocal Walkaround Ad',
      price: Number(row.listings?.price || 0),
      negotiable: Boolean(row.listings?.negotiable ?? true),
      sellerHandle: row.profiles?.handle || '@seller_rewa',
      sellerName: row.profiles?.full_name || 'Rewa Seller',
      sellerAvatar: row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      sellerVerified: Boolean(row.profiles?.verified),
      location: row.listings?.neighborhood || 'Rewa Market',
      distanceKm: Number(row.listings?.distance_km || 1.0),
      caption: row.caption,
      hashtags: row.hashtags || ['#BazaarReels', '#Rewa'],
      thumbnailUrl: row.thumbnail_url,
      videoUrl: row.video_url,
      audioName: row.audio_name || 'Original Sound - Walkaround',
      durationSec: Number(row.duration_sec || 30),
      viewsCount: Number(row.views_count || 1),
      likesCount: Number(row.likes_count || 0),
      commentsCount: Number(row.comments_count || 0),
      savesCount: Number(row.saves_count || 0),
      sharesCount: Number(row.shares_count || 0),
    }));
  },

  // ----------------------------------------------------
  // CHAT & REALTIME BARGAINING
  // ----------------------------------------------------
  async sendChatMessage(conversationId: string, senderId: string, role: 'buyer' | 'seller', text: string) {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_role: role,
      type: 'text',
      text,
    }).select().single();

    if (error) throw error;
    return data;
  },

  async proposeOffer(params: {
    conversationId: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    offeredPrice: number;
    originalPrice: number;
    buyerNote?: string;
  }) {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase.from('bargain_offers').insert({
      conversation_id: params.conversationId,
      listing_id: params.listingId,
      buyer_id: params.buyerId,
      seller_id: params.sellerId,
      offered_price: params.offeredPrice,
      original_price: params.originalPrice,
      status: 'pending',
      buyer_note: params.buyerNote,
    }).select().single();

    if (error) throw error;
    return data;
  },

  // ----------------------------------------------------
  // STORAGE (Upload Photos & 30s Reel Videos)
  // ----------------------------------------------------
  async uploadMedia(file: File, bucket: 'product-images' | 'reels-videos' | 'user-avatars'): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  },

  // ----------------------------------------------------
  // REALTIME SUBSCRIPTION HELPER
  // ----------------------------------------------------
  subscribeToChat(conversationId: string, onNewMessage: (msg: any) => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
