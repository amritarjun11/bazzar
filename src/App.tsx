import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { notificationService } from './services/notificationService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ShortsFeedScreen } from './components/ShortsFeedScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { ChatScreen } from './components/ChatScreen';
import { PostAdScreen } from './components/PostAdScreen';
import { SellerProfileScreen } from './components/SellerProfileScreen';
import { CategoriesScreen } from './components/CategoriesScreen';
import { SearchResultsScreen } from './components/SearchResultsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AdminPanelScreen } from './components/AdminPanelScreen';
import { MapDealsScreen } from './components/MapDealsScreen';
import { ReelModal } from './components/ReelModal';
import { OfferModal } from './components/OfferModal';
import { MarketplaceToolsModal } from './components/MarketplaceToolsModal';
import { SupabaseBackendModal } from './components/SupabaseBackendModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AuthModal } from './components/AuthModal';
import { MyAdsScreen } from './components/MyAdsScreen';
import { SafetyGuideModal } from './components/SafetyGuideModal';
import { ReviewModal } from './components/ReviewModal';
import { BoostPlanModal } from './components/BoostPlanModal';
// MobileQrModal removed per user request

const AppContent: React.FC = () => {
  const {
    currentScreen,
    isReelModalOpen,
    isOfferModalOpen,
    isToolsModalOpen,
    closeToolsModal,
    toolsInitialTab,
    isSupabaseModalOpen,
    closeSupabaseModal,
    isAdminLoginModalOpen,
    closeAdminLoginModal,
    toastMessage,
  } = useApp();

  useEffect(() => {
    notificationService.init();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'map':
        return <MapDealsScreen />;
      case 'shorts':
        return <ShortsFeedScreen />;
      case 'product-detail':
        return <ProductDetailScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'post-ad':
        return <PostAdScreen />;
      case 'seller-profile':
        return <SellerProfileScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'search':
        return <SearchResultsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'my-ads':
        return <MyAdsScreen />;
      case 'admin':
        return <AdminPanelScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Full header on standard screens; hidden on shorts, and desktop-only on subpages
  const showHeaderOnMobile = ['home', 'map', 'categories', 'search', 'profile', 'admin', 'my-ads'].includes(currentScreen);
  const isShorts = currentScreen === 'shorts';

  // Hide bottom nav on full-screen chat, post ad, and product-detail (which has its own action bar)
  const showBottomNav = !['chat', 'post-ad', 'product-detail'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans flex flex-col selection:bg-[#8083ff] selection:text-[#0b1326]">
      {!isShorts && (
        <div className={showHeaderOnMobile ? 'block' : 'hidden md:block'}>
          <Header />
        </div>
      )}

      <main className="flex-1 w-full">{renderScreen()}</main>

      {showBottomNav && <BottomNav />}

      {/* Global Overlays */}
      {isReelModalOpen && <ReelModal />}
      {isOfferModalOpen && <OfferModal />}
      <MarketplaceToolsModal
        isOpen={isToolsModalOpen}
        onClose={closeToolsModal}
        initialTab={toolsInitialTab}
      />
      {/* Admin-only Supabase Backend Modal */}
      <SupabaseBackendModal isOpen={isSupabaseModalOpen} onClose={closeSupabaseModal} />
      <AdminLoginModal isOpen={isAdminLoginModalOpen} onClose={closeAdminLoginModal} />
      <EditProfileModal />
      <AuthModal />
      <SafetyGuideModal />
      <ReviewModal />
      <BoostPlanModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#171f33]/95 border border-[#8083ff]/50 text-xs font-bold text-[#dae2fd] shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fade-in pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
