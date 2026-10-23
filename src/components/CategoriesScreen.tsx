import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { Footer } from './Footer';

export const CategoriesScreen: React.FC = () => {
  const { navigateTo, openReelWalkaround, shorts, location } = useApp();
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>('vehicles');
  const [videoOnlyToggle, setVideoOnlyToggle] = useState(false);

  const toggleCategory = (id: string) => {
    setExpandedCategoryId(prev => (prev === id ? null : id));
  };

  return (
    <div className="pb-28 md:pb-12 max-w-4xl mx-auto bg-[#0b1326] min-h-screen">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/95 backdrop-blur-md border-b border-[#222a3d] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('home')}
              className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline-sm text-[#dae2fd]">
                Explore & Categories
              </h1>
              <p className="text-[10px] text-[#4edea3] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping" />
                <span>4,280+ Verified Listings • 1,180 Live Video Reels in {location}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('search')}
            className="w-9 h-9 rounded-full bg-[#171f33] text-[#dae2fd] flex items-center justify-center border border-[#2d3449]"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>
        </div>
      </div>

      {/* Video Walkaround Tours Highlights Carousel (Image 20) */}
      <section className="p-4 bg-[#131b2e]/60 border-b border-[#222a3d]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb2b7] text-xl">
              videocam
            </span>
            <h2 className="text-xs font-black text-[#dae2fd] uppercase tracking-wider">
              Video Walkaround Tours
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shorts')}
            className="text-xs font-bold text-[#8083ff] hover:underline"
          >
            Watch Feed &gt;
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              title: 'Bikes & Cars',
              subtitle: 'Raw Engine Sound Check',
              count: '380 Reels',
              icon: 'two_wheeler',
              bgGradient: 'from-amber-900/40 to-[#171f33]',
              color: '#ffb2b7',
            },
            {
              title: 'Flats & Plots',
              subtitle: '360° Room Walkthrough',
              count: '95 Tours',
              icon: 'apartment',
              bgGradient: 'from-blue-900/40 to-[#171f33]',
              color: '#8083ff',
            },
            {
              title: 'Mobiles & Tech',
              subtitle: 'Diagnostic & Display Test',
              count: '210 Tests',
              icon: 'smartphone',
              bgGradient: 'from-emerald-900/40 to-[#171f33]',
              color: '#4edea3',
            },
          ].map((tour, idx) => (
            <div
              key={idx}
              onClick={() => openReelWalkaround(shorts[idx % shorts.length])}
              className={`p-3 rounded-2xl bg-gradient-to-b ${tour.bgGradient} border border-[#2d3449] hover:border-[#8083ff] cursor-pointer flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm`}
            >
              <div>
                <span
                  className="material-symbols-outlined text-2xl mb-1 block"
                  style={{ color: tour.color }}
                >
                  {tour.icon}
                </span>
                <h3 className="text-xs font-extrabold text-[#dae2fd] leading-tight">
                  {tour.title}
                </h3>
                <p className="text-[10px] text-[#908fa0] leading-snug mt-0.5">
                  {tour.subtitle}
                </p>
              </div>
              <span className="text-[9px] font-bold mt-2 bg-black/40 px-1.5 py-0.5 rounded text-white self-start">
                {tour.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Accordions and Main Grid */}
      <section className="p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#908fa0] uppercase tracking-wider">
          All Marketplace Categories
        </h2>

        {CATEGORIES.map(category => {
          const isExpanded = expandedCategoryId === category.id;
          return (
            <div
              key={category.id}
              className="bg-[#171f33] border border-[#2d3449] rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Category Header Bar */}
              <div
                onClick={() => toggleCategory(category.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#222a3d]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#222a3d] border border-[#2d3449] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-[#c0c1ff]">
                      {category.icon}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#dae2fd]">
                        {category.name}
                      </h3>
                      {category.tag && (
                        <span className="text-[9px] bg-[#ffb2b7]/20 text-[#ffb2b7] font-bold px-1.5 py-0.2 rounded">
                          {category.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#908fa0]">
                      {category.count} items •{' '}
                      <span className="text-[#4edea3] font-semibold">
                        {category.reelsCount} Video Reels
                      </span>
                    </p>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[#908fa0] transition-transform duration-200">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              {/* Expandable Subcategories Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-[#131b2e] border-t border-[#222a3d] space-y-3">
                  {/* Category description highlight */}
                  {category.highlight && (
                    <p className="text-[11px] text-[#c7c4d7] italic">
                      Includes: {category.highlight}
                    </p>
                  )}

                  {/* Reels Only Filter Switch inside Category */}
                  <div className="flex items-center justify-between bg-[#171f33] p-2.5 rounded-xl border border-[#2d3449]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#ffb2b7]">
                        play_circle
                      </span>
                      <span className="text-xs font-bold text-[#dae2fd]">
                        Show Listings with 30s Reel Only
                      </span>
                    </div>
                    <button
                      onClick={() => setVideoOnlyToggle(!videoOnlyToggle)}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                        videoOnlyToggle ? 'bg-[#8083ff]' : 'bg-[#2d3449]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-[#0b1326] transition-transform ${
                          videoOnlyToggle ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Subcategory Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {category.subcategories.map(sub => (
                      <button
                        key={sub.name}
                        onClick={() => navigateTo('search', { query: sub.name })}
                        className="p-2.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] hover:border-[#8083ff]/50 text-left transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-[#dae2fd] truncate">
                          {sub.name}
                        </span>
                        <span className="text-[10px] text-[#908fa0] ml-1 shrink-0 font-medium">
                          {sub.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigateTo('search', { query: category.name })}
                    className="w-full py-2.5 rounded-xl bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-xs font-extrabold text-[#c0c1ff] transition-colors"
                  >
                    View All {category.name} in Rewa ({category.count})
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Trending Tags in Rewa */}
      <section className="p-4">
        <h3 className="text-xs font-bold text-[#908fa0] uppercase tracking-wider mb-2">
          Trending in Rewa Today
        </h3>
        <div className="flex gap-2 flex-wrap">
          {[
            '#HondaShine125',
            '#APSU_Student_Flats',
            '#Bullet350Stealth',
            '#iPhone13Rewa',
            '#ZeroBrokerageRent',
            '#ShilpiPlazaShops',
          ].map(tag => (
            <button
              key={tag}
              onClick={() => navigateTo('search', { query: tag.replace('#', '') })}
              className="px-3 py-1.5 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-semibold text-[#8083ff] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic Location & Account Aware Footer */}
      <Footer />
    </div>
  );
};
