import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const OfferModal: React.FC = () => {
  const { isOfferModalOpen, closeOfferModal, offerTargetListing, counterOffer } = useApp();
  const listing = offerTargetListing;

  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [buyerNote, setBuyerNote] = useState('');

  useEffect(() => {
    if (listing) {
      // Default to 8% discount rounded to nearest 500
      const defaultOffer = Math.round((listing.price * 0.92) / 500) * 500;
      setOfferAmount(defaultOffer);
      setBuyerNote('Aaj sham cash payment ke sath inspection kar sakta hoon.');
    }
  }, [listing]);

  if (!isOfferModalOpen || !listing) return null;

  const discountPercents = [5, 10, 15];
  const diff = listing.price - offerAmount;
  const percentOff = Math.round((diff / listing.price) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount <= 0) return;
    counterOffer(offerAmount, buyerNote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="w-full max-w-lg bg-[#131b2e] border border-[#2d3449] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Handle & Header */}
        <div className="pt-3 pb-2 px-6 flex flex-col items-center relative border-b border-[#222a3d]">
          <div className="w-12 h-1.5 rounded-full bg-[#31394d] mb-3 sm:hidden" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8083ff] text-xl">
                handshake
              </span>
              <h3 className="font-headline-sm text-[#dae2fd]">
                Make a Bargain Offer
              </h3>
            </div>
            <button
              onClick={closeOfferModal}
              className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#908fa0] hover:text-[#dae2fd] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Product Reference Card */}
        <div className="p-4 bg-[#171f33]/80 mx-4 mt-4 rounded-2xl border border-[#222a3d] flex items-center gap-3">
          <img
            src={listing.images[0]}
            alt={listing.title}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover border border-[#2d3449] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#dae2fd] truncate">
              {listing.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#908fa0]">Listed Price:</span>
              <span className="text-sm font-extrabold text-[#dae2fd]">
                ₹{listing.price.toLocaleString()}
              </span>
              {listing.negotiable && (
                <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-1.5 py-0.2 rounded border border-[#4edea3]/30">
                  Negotiable
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#908fa0] mt-0.5 truncate">
              Seller: {listing.seller.name} • {listing.location.neighborhood}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Preset Discount Pills */}
          <div>
            <label className="block text-xs font-semibold text-[#908fa0] mb-2 uppercase tracking-wider">
              Quick Suggestions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {discountPercents.map(pct => {
                const targetVal = Math.round((listing.price * (1 - pct / 100)) / 500) * 500;
                const isSelected = offerAmount === targetVal;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setOfferAmount(targetVal)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                      isSelected
                        ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#c0c1ff] shadow-sm'
                        : 'bg-[#171f33] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd] hover:border-[#8083ff]/40'
                    }`}
                  >
                    <span className="text-[10px] text-[#4edea3]">-{pct}% Off</span>
                    <span className="text-sm font-extrabold text-[#dae2fd]">
                      ₹{targetVal.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#dae2fd]">
                Your Proposed Price (₹)
              </label>
              {percentOff > 0 && (
                <span className="text-xs font-bold text-[#4edea3]">
                  You save ₹{diff.toLocaleString()} ({percentOff}% lower)
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#908fa0]">
                ₹
              </span>
              <input
                type="number"
                value={offerAmount}
                onChange={e => setOfferAmount(Number(e.target.value))}
                min={1000}
                max={listing.price * 2}
                step={500}
                className="w-full bg-[#171f33] border border-[#2d3449] focus:border-[#8083ff] rounded-xl pl-9 pr-4 py-3 text-lg font-extrabold text-[#dae2fd] focus:outline-none transition-colors"
                required
              />
            </div>
            <p className="text-[11px] text-[#908fa0] mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#8083ff]">
                info
              </span>
              Realistic offers within 10-15% of listed price have an 82% higher acceptance rate.
            </p>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-[#908fa0] mb-1.5 uppercase tracking-wider">
              Add Note for Seller (Optional)
            </label>
            <input
              type="text"
              value={buyerNote}
              onChange={e => setBuyerNote(e.target.value)}
              placeholder="e.g. Can visit today at 5 PM for cash deal"
              className="w-full bg-[#171f33] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-4 py-2.5 text-xs text-[#dae2fd] placeholder-[#908fa0] focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeOfferModal}
              className="flex-1 py-3 rounded-xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-bold text-[#dae2fd] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] hover:opacity-95 text-[#0b1326] text-xs font-black tracking-wide shadow-lg shadow-[#8083ff]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                send
              </span>
              <span>Send Offer of ₹{offerAmount.toLocaleString()}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
