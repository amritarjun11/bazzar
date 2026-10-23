import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ReviewModal: React.FC = () => {
  const {
    isReviewModalOpen,
    closeReviewModal,
    reviewTargetSeller,
    addSellerReview,
    showToast,
    currentUser,
  } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '💯 100% Genuine Saman',
    '⚡ Fast Response & Chat',
  ]);
  const [comment, setComment] = useState('');

  if (!isReviewModalOpen || !reviewTargetSeller) return null;

  const seller = reviewTargetSeller;

  const quickTags = [
    '💯 100% Genuine Saman',
    '⚡ Fast Response & Chat',
    '🤝 Achhi Bargaining / Fair Price',
    '📜 Verified Documents / Bill',
    '🚗 Smooth Inspection & Test Drive',
    '🛡️ Honest & Trustworthy',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return '😞 Bohot Kharab (Poor Experience)';
      case 2:
        return '😐 Thik-Thak (Average)';
      case 3:
        return '🙂 Achha Raha (Good)';
      case 4:
        return '😊 Bohot Achha (Very Good)';
      case 5:
        return '🤩 Lajawab / 100% Recommended (Excellent)';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('❌ Kripya thoda feedback ya review comment darj karein');
      return;
    }

    addSellerReview(seller.id, {
      rating,
      tags: selectedTags,
      comment: comment.trim(),
    });

    setComment('');
  };

  const activeDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#171f33] border border-[#2d3449] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-[#171f33] to-purple-600/20 border-b border-[#2d3449] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={seller.avatar}
                alt={seller.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black rounded-full p-0.5 shadow">
                <span className="material-symbols-outlined text-[10px] font-black block">star</span>
              </span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#dae2fd]">
                Seller Ko Rating &amp; Review Dein
              </h2>
              <p className="text-xs text-[#908fa0] truncate">
                {seller.name} ({seller.handle})
              </p>
            </div>
          </div>

          <button
            onClick={closeReviewModal}
            className="w-8 h-8 rounded-full bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-[#908fa0] hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Star Rating Selector */}
          <div className="text-center py-2 bg-[#131b2e] rounded-2xl border border-[#222a3d]">
            <span className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider block mb-1">
              Aapka Anubhav Kaisa Raha?
            </span>

            {/* 5 Big Clickable Stars */}
            <div className="flex items-center justify-center gap-2 my-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform active:scale-125 hover:scale-110 p-1 focus:outline-none"
                >
                  <span
                    className={`material-symbols-outlined text-3xl sm:text-4xl transition-colors ${
                      star <= activeDisplayRating
                        ? 'text-amber-400 font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'text-[#2d3449]'
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs font-black text-amber-300 mt-1">
              {getRatingLabel(activeDisplayRating)}
            </p>
          </div>

          {/* Quick Feedback Tags */}
          <div>
            <label className="text-xs font-bold text-[#dae2fd] block mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#4edea3]">check_box</span>
              <span>Khaas Baatein Chunein (Select Highlights):</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow-md font-black scale-[1.02]'
                        : 'bg-[#131b2e] text-[#908fa0] hover:text-[#dae2fd] border border-[#2d3449]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Review Comment */}
          <div>
            <label className="text-xs font-bold text-[#dae2fd] block mb-1.5 flex items-center justify-between">
              <span>Aapki Rai (Detailed Review):</span>
              <span className="text-[10px] text-[#908fa0]">Reviewer: {currentUser.name}</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Jaise: Deal bohot aasan thi, saman bilkul photo aur video jaisa tha. Seller ne test drive karwayi aur sabhi papers verify karwaye..."
              rows={3}
              required
              className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-amber-400 rounded-xl p-3 text-xs text-[#dae2fd] placeholder-[#908fa0] outline-none transition-colors"
            />
          </div>

          {/* Verified Transaction Note */}
          <div className="bg-[#131b2e] border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-[#4edea3]">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Aapka review verified buyer ke roop me seller ke profile par live dikhega.</span>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={closeReviewModal}
              className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-bold text-[#908fa0] hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base font-bold">rate_review</span>
              <span>Review Post Karein</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
