-- ==============================================================================
-- BAZAAR REELS - PRODUCTION SUPABASE DATABASE SCHEMA
-- Hyperlocal Marketplace + 30s Inspection Reels + Live Bargaining Engine
-- Target Location Focus: Rewa, Madhya Pradesh & Local India Tier-2/3 Markets
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUMS & CONSTANTS
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('buyer', 'seller', 'dealer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_condition_type AS ENUM (
        'Brand New',
        'Used (Mint Condition)',
        'Good (Normal Wear)',
        'Refurbished'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status_type AS ENUM ('active', 'pending', 'sold', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_status_type AS ENUM ('pending', 'countered', 'accepted', 'declined', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. USER PROFILES TABLE (Linked with Supabase Auth auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    proprietor_name TEXT,
    handle TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role user_role_type DEFAULT 'buyer',
    verified BOOLEAN DEFAULT FALSE,
    trust_score INTEGER DEFAULT 85 CHECK (trust_score >= 0 AND trust_score <= 100),
    rating NUMERIC(3, 2) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5.0),
    reviews_count INTEGER DEFAULT 0,
    active_ads_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    city TEXT DEFAULT 'Rewa',
    state TEXT DEFAULT 'Madhya Pradesh',
    neighborhood TEXT DEFAULT 'Civil Lines',
    address TEXT,
    gst_number TEXT,
    dealer_id TEXT,
    badges TEXT[] DEFAULT ARRAY['Verified Local Seller', 'Fast Responder'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching users and handles
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- ==============================================================================
-- 4. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    tag TEXT,
    highlight TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. LISTINGS TABLE (Products & Hyperlocal Ads)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) CHECK (original_price IS NULL OR original_price >= price),
    negotiable BOOLEAN DEFAULT TRUE,
    condition item_condition_type DEFAULT 'Used (Mint Condition)',
    sub_category TEXT,
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    
    -- 30s Reel Video Walkaround Data
    has_video_reel BOOLEAN DEFAULT FALSE,
    video_url TEXT,
    video_thumbnail TEXT,
    video_duration_sec INTEGER DEFAULT 30 CHECK (video_duration_sec <= 60),
    video_audio_title TEXT DEFAULT 'Original Sound - Seller Walkaround',

    -- Hyperlocal Geo Data (Rewa coordinates default)
    city TEXT NOT NULL DEFAULT 'Rewa',
    state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
    neighborhood TEXT NOT NULL DEFAULT 'Civil Lines',
    pin_code TEXT DEFAULT '486001',
    landmark TEXT DEFAULT 'Near Shilpi Plaza',
    latitude DOUBLE PRECISION DEFAULT 24.5362,
    longitude DOUBLE PRECISION DEFAULT 81.3037,
    distance_km NUMERIC(5, 2) DEFAULT 1.2,

    -- Specs & Vehicle Attributes (RC status, battery health, odometer etc.)
    specs JSONB DEFAULT '[]'::JSONB,
    attributes JSONB DEFAULT '{}'::JSONB,

    -- Trust & Verification Flags
    featured BOOLEAN DEFAULT FALSE,
    verified_rc BOOLEAN DEFAULT FALSE,
    risk_score TEXT DEFAULT 'low' CHECK (risk_score IN ('low', 'medium', 'high')),
    
    -- Engagement Counts
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    reels_views_count INTEGER DEFAULT 0,
    status listing_status_type DEFAULT 'active',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes for search, filter & geospatial mapping
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city, neighborhood);
CREATE INDEX IF NOT EXISTS idx_listings_has_reel ON public.listings(has_video_reel) WHERE has_video_reel = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- ==============================================================================
-- 6. SHORT REELS FEED TABLE (30-second inspection walkaround reels)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.short_reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    caption TEXT NOT NULL,
    hashtags TEXT[] DEFAULT ARRAY['#BazaarReels', '#Rewa'],
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    audio_name TEXT DEFAULT 'Original Sound - Walkaround Inspection',
    audio_subtitle TEXT,
    duration_sec INTEGER DEFAULT 28 CHECK (duration_sec > 0 AND duration_sec <= 60),
    
    -- Engagement metrics
    views_count INTEGER DEFAULT 1,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reels_listing_id ON public.short_reels(listing_id);
CREATE INDEX IF NOT EXISTS idx_reels_seller_id ON public.short_reels(seller_id);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON public.short_reels(created_at DESC);

-- ==============================================================================
-- 7. REEL INTERACTIONS (Likes, Saves, Shares)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reel_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_id UUID NOT NULL REFERENCES public.short_reels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'save', 'share')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reel_id, user_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reel_interactions_user ON public.reel_interactions(user_id);

-- ==============================================================================
-- 8. SAVED / FAVORITE LISTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- ==============================================================================
-- 9. SELLER FOLLOWS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.seller_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, seller_id)
);

-- ==============================================================================
-- 10. CHAT CONVERSATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deal_accepted', 'deal_declined', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, buyer_id, seller_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.chat_conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON public.chat_conversations(seller_id);

-- ==============================================================================
-- 11. CHAT MESSAGES & LIVE BARGAINING OFFERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('buyer', 'seller')),
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'video_snippet', 'offer', 'counter_offer', 'deal_closed')),
    text TEXT,
    video_snippet JSONB, -- {thumbnail, title, duration, note}
    offer_data JSONB,    -- {round, amount, originalPrice, status, sellerNote, savings, expiresIn}
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.chat_messages(conversation_id, created_at ASC);

-- ==============================================================================
-- 12. BARGAIN OFFERS AUDIT LOG (Negotiation History)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bargain_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    round_number INTEGER DEFAULT 1,
    offered_price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2) NOT NULL,
    counter_price NUMERIC(12, 2),
    status offer_status_type DEFAULT 'pending',
    buyer_note TEXT,
    seller_note TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bargain_offers_listing ON public.bargain_offers(listing_id);

-- ==============================================================================
-- 13. USER NOTIFICATIONS TABLE (In-App Alerts & Push History)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN (
            'offer_received',
            'offer_accepted',
            'offer_declined',
            'counter_offer',
            'chat_message',
            'new_reel',
            'price_drop',
            'account_alert'
        )
    ),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::JSONB, -- {listingId, reelId, senderId, amount}
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- ==============================================================================
-- 14. AUTOMATIC TRIGGERS & FUNCTIONS
-- ==============================================================================

-- A. Auto-update `updated_at` column timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_listings_updated_at ON public.listings;
CREATE TRIGGER trigger_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER trigger_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. Auto-create User Profile on Supabase auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_name TEXT;
    default_handle TEXT;
BEGIN
    default_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Bazaar User');
    default_handle := '@' || LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'user'), ' ', '_')) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4);

    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        handle,
        phone,
        avatar_url,
        city
    ) VALUES (
        NEW.id,
        LOWER(SPLIT_PART(NEW.email, '@', 1)),
        default_name,
        default_handle,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Rewa')
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- C. Auto-increment views and interaction counters
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.listings
    SET views_count = views_count + 1
    WHERE id = listing_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_reel_views(reel_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.short_reels
    SET views_count = views_count + 1
    WHERE id = reel_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bargain_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view profiles, users can only update their own
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Public read-only
CREATE POLICY "Categories are viewable by everyone" 
    ON public.categories FOR SELECT USING (true);

-- Listings: Public can view active listings, creators manage their own
CREATE POLICY "Active listings are viewable by everyone" 
    ON public.listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create listings" 
    ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings" 
    ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings" 
    ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Short Reels: Public can view all reels, sellers manage their own
CREATE POLICY "Short reels are viewable by everyone" 
    ON public.short_reels FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reels" 
    ON public.short_reels FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own reels" 
    ON public.short_reels FOR DELETE USING (auth.uid() = seller_id);

-- Reel Interactions: Users manage their own likes/saves
CREATE POLICY "Users can view their own interactions" 
    ON public.reel_interactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert interactions" 
    ON public.reel_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own interactions" 
    ON public.reel_interactions FOR DELETE USING (auth.uid() = user_id);

-- Saved Listings: Users see only their saved items
CREATE POLICY "Users can manage their saved listings" 
    ON public.saved_listings FOR ALL USING (auth.uid() = user_id);

-- Seller Follows: Users manage their follow relationships
CREATE POLICY "Follows are viewable by everyone" 
    ON public.seller_follows FOR SELECT USING (true);

CREATE POLICY "Users can manage their followings" 
    ON public.seller_follows FOR ALL USING (auth.uid() = follower_id);

-- Chat Conversations: Only the buyer and seller can view/update
CREATE POLICY "Conversation participants can view conversation" 
    ON public.chat_conversations FOR SELECT 
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can start conversation" 
    ON public.chat_conversations FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversation status" 
    ON public.chat_conversations FOR UPDATE 
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Chat Messages: Only conversation participants can view and send
CREATE POLICY "Conversation participants can read messages" 
    ON public.chat_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_conversations c 
            WHERE c.id = chat_messages.conversation_id 
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Conversation participants can send messages" 
    ON public.chat_messages FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_conversations c 
            WHERE c.id = chat_messages.conversation_id 
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

-- Bargain Offers: Participants can view and create offers
CREATE POLICY "Participants can view bargain offers" 
    ON public.bargain_offers FOR SELECT 
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyer can propose offer" 
    ON public.bargain_offers FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update offer status" 
    ON public.bargain_offers FOR UPDATE 
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Notifications: Users only see their own notifications
CREATE POLICY "Users can view and update their own notifications" 
    ON public.notifications FOR ALL 
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 16. SUPABASE STORAGE BUCKETS SETUP
-- ==============================================================================
-- Run these storage configuration commands in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('product-images', 'product-images', true),
    ('reels-videos', 'reels-videos', true),
    ('user-avatars', 'user-avatars', true),
    ('inspection-docs', 'inspection-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Public read access for images and reels
CREATE POLICY "Public Read Product Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Public Read Reels Videos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'reels-videos');

CREATE POLICY "Public Read Avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'user-avatars');

-- Authenticated users upload to buckets
CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload reels videos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'reels-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 17. REALTIME SUBSCRIPTIONS CONFIGURATION
-- ==============================================================================
-- Enable Supabase Realtime WebSocket engine on chat & notifications tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bargain_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================================================
-- 18. INITIAL SEED DATA (Categories & Local Rewa Marketplace Data)
-- ==============================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, icon, tag, highlight, sort_order) VALUES
('bikes', 'Bikes & Scooters', 'Bike', 'High Demand', '30s Engine Sound Reels', 1),
('mobiles', 'Mobiles & Tablets', 'Smartphone', 'Verified Battery', 'Screen & Camera Reels', 2),
('cars', 'Cars & Commercial', 'Car', 'RC Smartcard Verified', '360° Walkaround', 3),
('electronics', 'Electronics & Laptops', 'Laptop', 'Refurbished Deals', 'Working Demo Reels', 4),
('furniture', 'Home & Furniture', 'Armchair', 'Direct Owner', 'Condition Inspection', 5),
('real-estate', 'Rooms & Flats', 'Home', 'Zero Brokerage', 'Room Tour Videos', 6)
ON CONFLICT (id) DO NOTHING;

-- Complete Setup Message
COMMENT ON TABLE public.listings IS 'BazaarReels hyperlocal items with 30s walkaround reels and bargaining support';
