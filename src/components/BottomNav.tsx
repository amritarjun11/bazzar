import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenType } from '../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo, unreadChatCount, isAdmin } = useApp();

  const leftNavItems: { screen: ScreenType; label: string; icon: string; badge?: number }[] = [
    { screen: 'home', label: 'Home', icon: 'home' },
    { screen: 'shorts', label: 'Shorts', icon: 'play_circle' },
  ];

  const rightNavItems: { screen: ScreenType; label: string; icon: string; badge?: number }[] = [
    { screen: 'chat', label: 'Bargain', icon: 'chat_bubble', badge: unreadChatCount },
    { screen: 'profile', label: isAdmin ? 'Admin' : 'Account', icon: isAdmin ? 'admin_panel_settings' : 'person' },
  ];

  const renderNavButton = (item: { screen: ScreenType; label: string; icon: string; badge?: number }) => {
    const isActive = currentScreen === item.screen;
    return (
      <button
        key={item.screen}
        onClick={() => navigateTo(item.screen)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
          isActive ? 'text-[#8083ff]' : 'text-[#908fa0] hover:text-[#dae2fd]'
        }`}
      >
        <div className="relative">
          <span
            className={`material-symbols-outlined text-2xl transition-transform ${
              isActive ? 'scale-110 font-bold' : ''
            }`}
          >
            {item.icon}
          </span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#ffb2b7] text-[#67001b] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
              {item.badge}
            </span>
          )}
          {item.screen === 'shorts' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
          )}
        </div>
        <span
          className={`text-[10px] font-medium tracking-tight mt-0.5 ${
            isActive ? 'font-bold text-[#8083ff]' : ''
          }`}
        >
          {item.label}
        </span>
        {isActive && <span className="w-1 h-1 rounded-full bg-[#8083ff] mt-0.5" />}
      </button>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1326]/95 backdrop-blur-lg border-t border-[#222a3d] pb-safe">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-between relative">
        {/* Left: Home & Shorts */}
        {leftNavItems.map(renderNavButton)}

        {/* Center: Sell (+) Button */}
        <div className="relative -top-4 flex flex-col items-center flex-1">
          <button
            onClick={() => navigateTo('post-ad')}
            className={`w-13 h-13 rounded-full bg-gradient-to-tr from-[#8083ff] to-[#4edea3] text-[#0b1326] flex items-center justify-center shadow-lg shadow-[#8083ff]/40 hover:scale-105 active:scale-95 transition-transform ${
              currentScreen === 'post-ad' ? 'ring-4 ring-[#8083ff]/30' : ''
            }`}
            title="Sell Item + Add Walkaround Reel"
          >
            <span className="material-symbols-outlined text-2xl font-black">
              add
            </span>
          </button>
          <span
            className={`text-[10px] font-bold mt-0.5 ${
              currentScreen === 'post-ad' ? 'text-[#8083ff]' : 'text-[#dae2fd]'
            }`}
          >
            Sell
          </span>
        </div>

        {/* Right: Bargain & Account */}
        {rightNavItems.map(renderNavButton)}
      </div>
    </nav>
  );
};
