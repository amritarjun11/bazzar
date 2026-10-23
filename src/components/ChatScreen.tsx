import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { audioEngine } from '../utils/audioEngine';
import { Listing } from '../types';

export const ChatScreen: React.FC = () => {
  const {
    goBack,
    navigateTo,
    selectedListing,
    listings,
    chatMessages,
    chatThreads,
    openChatForListing,
    sellerIsTyping,
    sendChatMessage,
    acceptOffer,
    declineOffer,
    openOfferModal,
    showToast,
    openSafetyModal,
    openReviewModal,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [showSafetyTip, setShowSafetyTip] = useState(true);
  const [isPlayingAudioSnippet, setIsPlayingAudioSnippet] = useState(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const listing = selectedListing || listings[0];
  const sellerName = listing?.seller?.proprietorName || listing?.seller?.name || 'Seller';
  const activeMessages = (listing && chatThreads[listing.id]) || chatMessages;

  // Build the list of active conversations across all accounts/posts
  const allListingIds = Array.from(
    new Set([...Object.keys(chatThreads), ...listings.map(l => l.id)])
  );

  const conversationList = allListingIds
    .map(listingId => {
      const targetListing = listings.find(l => l.id === listingId);
      if (!targetListing) return null;
      const msgs = chatThreads[listingId] || [];
      const lastMsg = msgs[msgs.length - 1];
      const hasMsgs = msgs.length > 0;
      return {
        listing: targetListing,
        lastMessage: lastMsg,
        hasMsgs,
        unread: lastMsg?.sender === 'seller' && lastMsg?.status !== 'read',
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a!.listing.id === listing.id) return -1;
      if (b!.listing.id === listing.id) return 1;
      if (a!.hasMsgs && !b!.hasMsgs) return -1;
      if (!a!.hasMsgs && b!.hasMsgs) return 1;
      return 0;
    }) as {
    listing: Listing;
    lastMessage?: any;
    hasMsgs: boolean;
    unread?: boolean;
  }[];

  // Scam / Fraud keyword detection in active chat
  const scamKeywords = ['qr', 'scanner', 'scan', 'pin', 'advance', 'token', 'gate pass', 'army', 'fauji', 'cisf'];
  const hasScamTriggerWords = activeMessages.some(m =>
    scamKeywords.some(kw => (m.text || '').toLowerCase().includes(kw))
  );

  // Auto-scroll to bottom on new message or seller typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, sellerIsTyping]);

  // WhatsApp-style status checkmarks renderer
  const renderMessageTicks = (status?: 'sent' | 'delivered' | 'read', isDarkBg = false) => {
    if (status === 'read') {
      return (
        <span
          className="inline-flex items-center ml-1 select-none font-black"
          title="Seen / Read by Seller (Double Blue Tick ✓✓)"
        >
          <span className={`material-symbols-outlined text-[15px] font-black leading-none ${
            isDarkBg ? 'text-[#38bdf8]' : 'text-[#002f87]'
          }`}>
            done_all
          </span>
        </span>
      );
    }

    if (status === 'delivered') {
      return (
        <span
          className="inline-flex items-center ml-1 select-none"
          title="Delivered to Seller (Double Grey Tick ✓✓)"
        >
          <span className={`material-symbols-outlined text-[15px] font-bold leading-none ${
            isDarkBg ? 'text-[#908fa0]' : 'text-[#0b1326]/60'
          }`}>
            done_all
          </span>
        </span>
      );
    }

    // Default: 'sent' (Single Grey Tick: message sent, not yet viewed)
    return (
      <span
        className="inline-flex items-center ml-1 select-none"
        title="Sent (Single Tick ✓ - Not yet viewed)"
      >
        <span className={`material-symbols-outlined text-[14px] font-bold leading-none ${
          isDarkBg ? 'text-[#908fa0]' : 'text-[#0b1326]/60'
        }`}>
          done
        </span>
      </span>
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage);
    setInputMessage('');
  };

  const handleQuickChip = (chipText: string) => {
    sendChatMessage(chipText);
  };

  const toggleSnippetSound = () => {
    if (isPlayingAudioSnippet) {
      audioEngine.stop();
      setIsPlayingAudioSnippet(false);
    } else {
      const isBullet = listing.title.toLowerCase().includes('bullet') || listing.title.toLowerCase().includes('classic');
      const soundType = listing.categoryId === 'vehicles' ? (isBullet ? 'bullet' : 'bike') : 'gadget';
      audioEngine.playEngineSound(soundType);
      setIsPlayingAudioSnippet(true);
      showToast(soundType === 'bullet' ? '🔊 Playing 350cc Heavy Thump Sound' : soundType === 'bike' ? '🔊 Playing Engine Exhaust Rev Clip' : '🔊 Playing Audio Inspection Clip');
      setTimeout(() => {
        audioEngine.stop();
        setIsPlayingAudioSnippet(false);
      }, 10000);
    }
  };

  const getDynamicQuickChips = () => {
    const p = listing.price || 50000;
    const roundedOffer = Math.round((p * 0.92) / 500) * 500;
    if (listing.categoryId === 'vehicles') {
      return [
        `₹${roundedOffer.toLocaleString()} final cash?`,
        'Is price negotiable?',
        'RC Smart Card original hai?',
        'Test drive timing?',
        'Location send karein',
      ];
    }
    if (listing.categoryId === 'mobiles') {
      return [
        `₹${roundedOffer.toLocaleString()} cash deal?`,
        'Battery health kitni hai?',
        'Original bill & box saath hai?',
        'TrueTone / FaceID working?',
        'Pickup location?',
      ];
    }
    if (listing.categoryId === 'property') {
      return [
        'Visit kab kar sakte hain?',
        'Rent thoda kam hoga?',
        '24h water supply hai?',
        'Car parking available?',
        'Zero brokerage deal?',
      ];
    }
    if (listing.categoryId === 'fashion') {
      return [
        `₹${Math.round((p * 0.9) / 100) * 100} final rate?`,
        'Size & fitting kaisa hai?',
        'Fabric pure quality hai?',
        'Rewa me kahan milenge?',
      ];
    }
    return [
      `₹${roundedOffer.toLocaleString()} final?`,
      'Available hai?',
      'Price negotiable hai?',
      'Milne ka address bhejein',
    ];
  };

  return (
    <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-5rem)] max-w-2xl mx-auto bg-[#0b1326] border-x border-[#222a3d] md:my-3 md:rounded-2xl md:border overflow-hidden">
      {/* Top Seller Bar */}
      <div className="sticky top-0 z-30 bg-[#131b2e] border-b border-[#222a3d] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>

          <div
            onClick={() => navigateTo('seller-profile', { seller: listing.seller })}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="relative">
              <img
                src={listing.seller.avatar}
                alt={listing.seller.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-[#8083ff]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4edea3] border-2 border-[#131b2e]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-bold text-[#dae2fd]">
                  {listing.seller.proprietorName || listing.seller.name}
                </h3>
                <span className="material-symbols-outlined text-xs text-[#4edea3]">
                  verified
                </span>
              </div>
              {sellerIsTyping ? (
                <p className="text-[10px] text-[#4edea3] font-bold flex items-center gap-1 animate-pulse">
                  <span>typing...</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                </p>
              ) : (
                <p className="text-[10px] text-[#4edea3] font-medium">Active now</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* All Chats Switcher Button */}
          <button
            onClick={() => setIsInboxModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-bold text-[#c0c1ff] flex items-center gap-1.5 transition-colors shadow-sm"
            title="Switch between chats"
          >
            <span className="material-symbols-outlined text-sm text-[#8083ff]">forum</span>
            <span className="hidden sm:inline">All Chats</span>
            <span className="bg-[#8083ff] text-[#0b1326] text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {conversationList.length}
            </span>
          </button>

          {/* Safety Shield Button */}
          <button
            onClick={openSafetyModal}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-black flex items-center gap-1 transition-colors shadow-sm"
            title="OLX Safety & Fraud Prevention Rules"
          >
            <span className="material-symbols-outlined text-sm font-bold">shield</span>
            <span className="hidden sm:inline">Safety</span>
          </button>

          {/* Rate & Review Seller Button */}
          <button
            onClick={() => openReviewModal(listing.seller)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1 transition-colors shadow-sm"
            title="Rate & Review Seller"
          >
            <span className="material-symbols-outlined text-sm font-bold text-amber-400">star</span>
            <span className="hidden sm:inline">Rate</span>
          </button>

          <button
            onClick={() => showToast(`📞 Calling ${listing.seller.phone}...`)}
            className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#4edea3] flex items-center justify-center transition-colors"
            title="Call"
          >
            <span className="material-symbols-outlined text-base">call</span>
          </button>
          <button
            onClick={() => showToast('Options: Report User, Block, View Profile')}
            className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#908fa0] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-base">more_vert</span>
          </button>
        </div>
      </div>

      {/* Account / Seller Quick-Switcher Horizontal Bar */}
      <div className="bg-[#0f172a] border-b border-[#222a3d] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        <span className="text-[10px] font-extrabold text-[#8083ff] shrink-0 uppercase tracking-wider flex items-center gap-1 mr-1">
          <span className="material-symbols-outlined text-[13px]">account_circle</span>
          <span className="hidden sm:inline">Accounts:</span>
        </span>
        {listings.map(item => {
          const isSelected = item.id === listing.id;
          const sName =
            item.seller?.proprietorName?.split(' ')[0] ||
            item.seller?.name?.split(' ')[0] ||
            'Seller';
          return (
            <button
              key={item.id}
              onClick={() => openChatForListing(item)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] shadow-md font-black ring-1 ring-white/30'
                  : 'bg-[#171f33] text-[#dae2fd] hover:bg-[#222a3d] border border-[#2d3449]'
              }`}
              title={`Chat with ${sName} (${item.title})`}
            >
              <img
                src={item.seller?.avatar}
                alt=""
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="truncate max-w-[85px]">{sName}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded ${
                  isSelected ? 'bg-black/20 text-[#0b1326]' : 'bg-[#222a3d] text-[#908fa0]'
                }`}
              >
                {item.categoryName || item.categoryId}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pinned Product Context Pill */}
      <div className="bg-[#171f33] border-b border-[#222a3d] px-4 py-2 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={listing.images[0]}
            alt={listing.title}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-lg object-cover border border-[#2d3449] shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#dae2fd] truncate">
              {listing.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-extrabold text-[#dae2fd]">
                ₹{listing.price.toLocaleString()}
              </span>
              <span className="text-[#908fa0]">• {listing.location.neighborhood}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openOfferModal(listing)}
            className="px-2.5 py-1 rounded-lg bg-[#8083ff] text-[#0b1326] text-[11px] font-extrabold transition-colors whitespace-nowrap shadow-sm"
          >
            Offer
          </button>
          <button
            onClick={() => navigateTo('product-detail', { listing })}
            className="px-2.5 py-1 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[11px] font-bold text-[#c0c1ff] transition-colors whitespace-nowrap"
          >
            View Ad
          </button>
        </div>
      </div>

      {/* OLX Scam Prevention Safety Banner */}
      {showSafetyTip && (
        <div className="bg-gradient-to-r from-rose-950/70 via-[#171f33] to-amber-950/50 border-b border-rose-500/40 px-3.5 py-2.5 flex items-center justify-between gap-2.5 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">gpp_bad</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-rose-200 truncate">
                ⚠️ OLX Scam Alert: Paise lene ke liye kabhi QR code scan na karein!
              </p>
              <p className="text-[10px] text-[#dae2fd]/70 line-clamp-1">
                UPI PIN sirf paise bhejne ke liye hota hai. Advance token ya gate pass na dein.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={openSafetyModal}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 text-black text-[10px] font-black shadow hover:opacity-95 transition-opacity"
            >
              Niyam Padhein
            </button>
            <button
              onClick={() => setShowSafetyTip(false)}
              className="w-6 h-6 rounded-md hover:bg-white/10 text-[#908fa0] flex items-center justify-center"
              title="Hide"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Scam Keyword Warning Triggered by Message */}
      {hasScamTriggerWords && (
        <div className="bg-rose-950/90 border-b-2 border-rose-500 px-4 py-2 flex items-center justify-between gap-2 text-rose-200 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-rose-400 shrink-0">
              warning
            </span>
            <span>
              🚨 <strong>Satark Rahein!</strong> Chat me QR code / Advance / Army ka zikr hua hai. Kabhi apna UPI PIN na dalein aur bina saman dekhe advance na dein.
            </span>
          </div>
          <button
            onClick={openSafetyModal}
            className="px-2 py-0.5 rounded bg-rose-500 text-black text-[10px] font-black shrink-0"
          >
            Guide
          </button>
        </div>
      )}

      {/* Chat Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeMessages.map(msg => {
          const isBuyer = msg.sender === 'buyer';

          if (msg.type === 'video_snippet' && msg.videoSnippet) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[85%] bg-[#171f33] border border-[#2d3449] rounded-2xl rounded-tl-sm p-3 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#ffb2b7] text-base">
                      videocam
                    </span>
                    <span className="text-[11px] font-bold text-[#dae2fd]">
                      {msg.videoSnippet.title}
                    </span>
                    <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-[#908fa0]">
                      {msg.videoSnippet.duration}
                    </span>
                  </div>

                  <div
                    onClick={toggleSnippetSound}
                    className="relative aspect-video rounded-xl overflow-hidden bg-black cursor-pointer group border border-[#2d3449]"
                  >
                    <img
                      src={msg.videoSnippet.thumbnail}
                      alt="Reel Snippet"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#8083ff] text-[#0b1326] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl font-bold">
                          {isPlayingAudioSnippet ? 'pause' : 'play_arrow'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#c7c4d7] mt-2 italic">
                    {msg.videoSnippet.note}
                  </p>
                  <span className="text-[9px] text-[#908fa0] mt-1 block text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          if (msg.type === 'counter_offer' && msg.offerData) {
            const isPending = msg.offerData.status === 'pending';
            const isAccepted = msg.offerData.status === 'accepted';
            return (
              <div key={msg.id} className="flex justify-start w-full">
                <div className="w-full max-w-sm bg-gradient-to-br from-[#171f33] to-[#131b2e] border-2 border-[#8083ff]/60 rounded-2xl p-4 shadow-xl">
                  {/* Counter Offer Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#222a3d]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#8083ff] text-lg">
                        handshake
                      </span>
                      <span className="text-xs font-black text-[#dae2fd] uppercase tracking-wider">
                        Seller Counter Offer (Round {msg.offerData.round})
                      </span>
                    </div>
                    <span className="text-[10px] text-[#ffb2b7] font-bold">
                      Expires in {msg.offerData.expiresIn}
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div className="my-3 text-center bg-[#0b1326] py-3 rounded-xl border border-[#2d3449]">
                    <span className="text-[11px] text-[#908fa0] block">Settlement Price</span>
                    <span className="text-2xl font-black text-[#4edea3]">
                      ₹{msg.offerData.amount.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-[#c7c4d7] mt-0.5">
                      Listed: ₹{msg.offerData.originalPrice.toLocaleString()} •{' '}
                      <strong className="text-[#4edea3]">
                        You save ₹{msg.offerData.savings?.toLocaleString()}
                      </strong>
                    </p>
                  </div>

                  {/* Seller Note */}
                  {msg.offerData.sellerNote && (
                    <p className="text-xs text-[#c7c4d7] bg-[#1a233a] p-2.5 rounded-xl border border-[#2d3449] mb-3 leading-relaxed">
                      "{msg.offerData.sellerNote}"
                    </p>
                  )}

                  {/* Actions */}
                  {isPending && (
                    <div className="space-y-2">
                      <button
                        onClick={() => acceptOffer(msg.offerData?.amount || 71000)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs shadow-md shadow-[#8083ff]/30 active:scale-95 transition-transform"
                      >
                        Accept Offer (₹{msg.offerData.amount.toLocaleString()})
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openOfferModal(listing)}
                          className="flex-1 py-2 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-bold text-[#c0c1ff] transition-colors"
                        >
                          Counter Again
                        </button>
                        <button
                          onClick={declineOffer}
                          className="px-4 py-2 rounded-xl bg-[#222a3d] hover:bg-[#ffb4ab]/20 text-xs font-bold text-[#ffb4ab] transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="bg-[#00885d]/30 text-[#4edea3] text-xs font-extrabold text-center py-2.5 rounded-xl border border-[#4edea3]/40">
                      ✅ Deal Accepted! Token Pass Generated.
                    </div>
                  )}

                  <span className="text-[9px] text-[#908fa0] mt-2 block text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          if (msg.type === 'offer' && msg.offerData) {
            return (
              <div key={msg.id} className="flex justify-end w-full">
                <div className="max-w-[85%] bg-[#222a3d] border border-[#8083ff]/40 rounded-2xl rounded-tr-sm p-3 shadow-md text-right">
                  <span className="text-[10px] text-[#c0c1ff] font-bold block uppercase">
                    Buyer Offer Submitted (Round {msg.offerData.round})
                  </span>
                  <span className="text-xl font-black text-[#dae2fd] block my-1">
                    ₹{msg.offerData.amount.toLocaleString()}
                  </span>
                  {msg.offerData.sellerNote && (
                    <p className="text-xs text-[#c7c4d7] text-left">
                      "{msg.offerData.sellerNote}"
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#908fa0]">
                    <span>{msg.timestamp} • Status: {msg.offerData.status}</span>
                    {renderMessageTicks(msg.status, true)}
                  </div>
                </div>
              </div>
            );
          }

          if (msg.type === 'deal_closed') {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-[#00885d]/25 border border-[#4edea3]/40 rounded-2xl px-4 py-2 text-center text-xs font-bold text-[#4edea3]">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  isBuyer
                    ? 'bg-[#8083ff] text-[#0b1326] font-medium rounded-tr-sm'
                    : 'bg-[#171f33] text-[#dae2fd] border border-[#2d3449] rounded-tl-sm'
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`flex items-center gap-1 mt-1 text-[9px] ${
                    isBuyer ? 'justify-end text-[#0b1326]/75' : 'justify-start text-[#908fa0]'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isBuyer && renderMessageTicks(msg.status, false)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time Seller Typing Indicator */}
        {sellerIsTyping && (
          <div className="flex justify-start items-center gap-2 animate-fade-in pt-1">
            <img
              src={listing.seller.avatar}
              alt="Seller"
              className="w-6 h-6 rounded-full object-cover border border-[#8083ff]"
            />
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl rounded-tl-sm px-3.5 py-2 flex items-center gap-1.5 shadow-sm">
              <span className="text-[11px] text-[#908fa0] mr-1">
                {listing.seller.proprietorName?.split(' ')[0] || listing.seller.name?.split(' ')[0] || 'Seller'} typing
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Bargain Chip Rails (Dynamic for each category & price) */}
      <div className="px-4 py-1.5 bg-[#131b2e] border-t border-[#222a3d] flex gap-2 overflow-x-auto no-scrollbar">
        {getDynamicQuickChips().map(chip => (
          <button
            key={chip}
            onClick={() => handleQuickChip(chip)}
            className="px-2.5 py-1 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[11px] font-semibold text-[#c0c1ff] whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#131b2e] border-t border-[#222a3d] flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => showToast('📷 Camera: Upload walkaround or test photo')}
          className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#908fa0] flex items-center justify-center transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-lg">videocam</span>
        </button>

        <button
          type="button"
          onClick={() => showToast('📎 Attachment: Share documents/RC copy')}
          className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#908fa0] flex items-center justify-center transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-lg">attach_file</span>
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder={`Message ${sellerName} about ${listing.title.slice(0, 24)}...`}
          className="flex-1 bg-[#171f33] border border-[#2d3449] focus:border-[#8083ff] rounded-full px-4 py-2 text-xs text-[#dae2fd] placeholder-[#908fa0] focus:outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="w-9 h-9 rounded-full bg-[#8083ff] disabled:opacity-40 disabled:cursor-not-allowed text-[#0b1326] flex items-center justify-center shadow-md shadow-[#8083ff]/30 transition-transform active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-lg font-bold">send</span>
        </button>
      </form>

      {/* All Chats / Inbox Switcher Modal */}
      {isInboxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#222a3d] flex items-center justify-between bg-[#171f33]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">forum</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#dae2fd]">
                    Conversations & Bargains (सभी चैट)
                  </h3>
                  <p className="text-[10px] text-[#908fa0]">
                    Select any post to chat with that specific seller
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInboxModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#222a3d] text-[#dae2fd] flex items-center justify-center hover:bg-[#2d3449] transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Conversations List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {conversationList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#908fa0]">
                  No conversations yet. Open any post and tap "Chat Now" to start!
                </div>
              ) : (
                conversationList.map(item => {
                  const isCurrent = item.listing.id === listing.id;
                  const itemSeller = item.listing.seller?.proprietorName || item.listing.seller?.name || 'Seller';
                  return (
                    <div
                      key={item.listing.id}
                      onClick={() => {
                        openChatForListing(item.listing);
                        setIsInboxModalOpen(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isCurrent
                          ? 'bg-[#8083ff]/15 border-[#8083ff] shadow-md ring-1 ring-[#8083ff]'
                          : 'bg-[#171f33] border-[#2d3449] hover:border-[#8083ff]/40 hover:bg-[#222a3d]'
                      }`}
                    >
                      {/* Seller Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={item.listing.seller?.avatar}
                          alt={itemSeller}
                          className="w-11 h-11 rounded-full object-cover border border-[#2d3449]"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4edea3] border-2 border-[#131b2e]" />
                      </div>

                      {/* Info & Last message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-[#dae2fd] truncate flex items-center gap-1">
                            <span>{itemSeller}</span>
                            {item.listing.seller?.verified && (
                              <span className="material-symbols-outlined text-[12px] text-[#4edea3]">
                                verified
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-[#908fa0] shrink-0">
                            {item.lastMessage?.timestamp || 'Active'}
                          </span>
                        </div>

                        {/* Product Title & Price */}
                        <p className="text-[11px] font-semibold text-[#8083ff] truncate">
                          {item.listing.title} • ₹{item.listing.price?.toLocaleString()}
                        </p>

                        {/* Last Message Preview */}
                        <p className="text-[10px] text-[#908fa0] truncate mt-0.5">
                          {item.lastMessage?.text || 'Tap to view chat conversation...'}
                        </p>
                      </div>

                      {/* Product Thumbnail */}
                      <div className="relative shrink-0">
                        <img
                          src={item.listing.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-[#2d3449]"
                        />
                        {isCurrent && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#4edea3] text-[#0b1326] text-[8px] font-black px-1 rounded-full shadow">
                            OPEN
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
