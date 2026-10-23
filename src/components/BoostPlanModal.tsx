import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface BoostPlan {
  id: string;
  name: string;
  days: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  tag: string;
  viewsMultiplier: string;
  features: string[];
}

export const BoostPlanModal: React.FC = () => {
  const {
    isBoostModalOpen,
    closeBoostModal,
    boostTargetListing,
    activateBoostPlan,
    showToast,
  } = useApp();

  const plans: BoostPlan[] = [
    {
      id: 'boost_3d',
      name: '3-Day Turbo Boost',
      days: 3,
      price: 99,
      tag: '⚡ Quick Sale',
      viewsMultiplier: '3x More Views',
      features: [
        'Top of Home Feed & Category for 3 Days',
        'Golden "⭐ FEATURED" Badge',
        'Direct Call & Chat Priority',
      ],
    },
    {
      id: 'boost_7d',
      name: '7-Day Super Seller Pack',
      days: 7,
      price: 199,
      originalPrice: 299,
      popular: true,
      tag: '🔥 Most Popular',
      viewsMultiplier: '5x More Leads',
      features: [
        'Top of Feed & Search Results for 7 Full Days',
        'Glowing Golden Border on Listing Card',
        'Rewa & MP Buyer Notification Alert',
        '5x Higher Chance of Deal Closing',
      ],
    },
    {
      id: 'boost_30d',
      name: '30-Day Business Showcase',
      days: 30,
      price: 499,
      originalPrice: 999,
      tag: '💎 Best Value',
      viewsMultiplier: '10x Leads',
      features: [
        'Full 30 Days Priority Feed Placement',
        'Dealership Level Visibility in Rewa',
        'Unlimited In-App Enquiries & Bargains',
        'High-Value Cars, Flats & Mobiles Recommended',
      ],
    },
  ];

  const [selectedPlanId, setSelectedPlanId] = useState<string>('boost_7d');
  const [paymentMethod, setPaymentMethod] = useState<'instant' | 'upi'>('instant');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isBoostModalOpen || !boostTargetListing) return null;

  const ad = boostTargetListing;
  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[1];

  const handleActivate = async () => {
    setIsProcessing(true);
    // Simulate brief payment gateway or demo processing
    setTimeout(async () => {
      await activateBoostPlan(ad.id, currentPlan);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#171f33] border border-amber-400/40 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-500/25 via-[#171f33] to-purple-600/25 border-b border-[#2d3449] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <span className="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#dae2fd]">
                  विज्ञापन प्रमोट करें (Boost Ad)
                </h2>
                <span className="text-[9px] font-black bg-amber-400 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  5X FASTER SALE
                </span>
              </div>
              <p className="text-xs text-[#908fa0]">
                Apne vigyapan ko front page par pin karein aur turant grahak payein
              </p>
            </div>
          </div>

          <button
            onClick={closeBoostModal}
            className="w-8 h-8 rounded-full bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-[#908fa0] hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Target Ad Summary Strip */}
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-3 flex items-center gap-3">
            <img
              src={ad.images[0]}
              alt={ad.title}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-black text-[#dae2fd] truncate">{ad.title}</h3>
              <p className="text-xs font-black text-[#4edea3] mt-0.5">
                ₹{ad.price.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#908fa0] truncate">
                {ad.location?.neighborhood || 'Rewa'} • {ad.categoryName}
              </p>
            </div>
            {ad.featured && (
              <span className="text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-1 rounded-lg shrink-0">
                ⭐ Currently Active
              </span>
            )}
          </div>

          {/* Plan Cards Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-[#dae2fd] block">
              Boost Plan Chunein (Select Boost Duration):
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {plans.map(plan => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-2xl p-3.5 cursor-pointer transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#1c2642] to-[#131b2e] border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]'
                        : 'bg-[#131b2e] border-[#2d3449] hover:border-[#8083ff]/40'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-rose-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow uppercase tracking-wide">
                        ⭐ Popular
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#8083ff]">
                          {plan.tag}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-400 border-amber-400 text-black'
                              : 'border-[#4e5569]'
                          }`}
                        >
                          {isSelected && <span className="text-[10px] font-black">✓</span>}
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-[#dae2fd] mt-1">{plan.name}</h4>

                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-amber-400">
                          ₹{plan.price}
                        </span>
                        {plan.originalPrice && (
                          <span className="text-[10px] text-[#908fa0] line-through">
                            ₹{plan.originalPrice}
                          </span>
                        )}
                        <span className="text-[10px] text-[#908fa0]">/ {plan.days}d</span>
                      </div>

                      <div className="mt-1 text-[10px] font-extrabold text-[#4edea3]">
                        {plan.viewsMultiplier}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#222a3d] space-y-1">
                      {plan.features.slice(0, 2).map((feat, fIdx) => (
                        <p key={fIdx} className="text-[9px] text-[#908fa0] leading-tight flex items-start gap-1">
                          <span className="text-amber-400">✓</span>
                          <span>{feat}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-[#dae2fd] block">
              Payment Tarika (Payment Method):
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('instant')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'instant'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-black'
                    : 'bg-[#171f33] border-[#2d3449] text-[#908fa0]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>Instant Demo (Free)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-black'
                    : 'bg-[#171f33] border-[#2d3449] text-[#908fa0]'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-[#4edea3]">account_balance_wallet</span>
                <span>GooglePay / UPI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA Bar */}
        <div className="bg-[#131b2e] border-t border-[#222a3d] p-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#908fa0] block">Chuna Hua Plan:</span>
            <span className="text-xs font-black text-amber-300">
              {currentPlan.name} • ₹{currentPlan.price}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeBoostModal}
              className="py-2.5 px-3.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-bold text-[#908fa0] hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleActivate}
              disabled={isProcessing}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base font-black">
                {isProcessing ? 'hourglass_top' : 'rocket_launch'}
              </span>
              <span>{isProcessing ? 'Activating...' : `Activate Boost (₹${currentPlan.price})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
