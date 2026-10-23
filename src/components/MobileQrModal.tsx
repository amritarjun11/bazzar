import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const MobileQrModal: React.FC = () => {
  const { isQrModalOpen, closeQrModal, showToast } = useApp();
  const [selectedLinkType, setSelectedLinkType] = useState<'dev' | 'share'>('dev');

  if (!isQrModalOpen) return null;

  const devUrl = 'https://ais-dev-snjcpq4k76qgazred7cxsf-351548653874.asia-southeast1.run.app';
  const preUrl = 'https://ais-pre-snjcpq4k76qgazred7cxsf-351548653874.asia-southeast1.run.app';

  const activeUrl = selectedLinkType === 'dev' ? devUrl : preUrl;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    activeUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    showToast('📋 लिंक कॉपी हो गया! अपने WhatsApp पर भेजकर खोलें।');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1326] border-2 border-[#8083ff]/60 rounded-3xl w-full max-w-sm shadow-2xl text-[#dae2fd] overflow-hidden relative">
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#8083ff]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#4edea3]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222a3d] flex items-center justify-between bg-[#131b2e]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] font-black shadow-md">
              <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white">मोबाइल में टेस्ट करें (QR Code)</h2>
              <p className="text-[10px] text-[#4edea3] font-bold">BazaarReels Live Test</p>
            </div>
          </div>

          <button
            onClick={closeQrModal}
            className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#908fa0] hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Link Switcher */}
        <div className="flex border-b border-[#222a3d] bg-[#131b2e]/40 p-1.5 gap-1.5">
          <button
            onClick={() => setSelectedLinkType('dev')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedLinkType === 'dev'
                ? 'bg-[#8083ff] text-[#0b1326] shadow-sm'
                : 'text-[#908fa0] hover:text-white'
            }`}
          >
            📱 Direct Dev Link
          </button>
          <button
            onClick={() => setSelectedLinkType('share')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedLinkType === 'share'
                ? 'bg-[#4edea3] text-[#0b1326] shadow-sm'
                : 'text-[#908fa0] hover:text-white'
            }`}
          >
            🌐 Public Share Link
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-center space-y-3.5">
          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl inline-block shadow-2xl border-4 border-[#8083ff] relative mx-auto">
            <img
              src={qrImageUrl}
              alt="Scan QR Code to open BazaarReels on Mobile"
              className="w-48 h-48 mx-auto rounded-lg object-contain block"
              loading="eager"
            />
            <div className="absolute bottom-1.5 left-0 right-0 text-center">
              <span className="bg-[#0b1326] text-[#4edea3] text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                SCAN WITH PHONE CAMERA
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <h3 className="text-xs font-black text-white flex items-center justify-center gap-1">
              <span>📷 फ़ोन के कैमरे या Google Lens से स्कैन करें</span>
            </h3>
            <p className="text-[11px] text-[#908fa0] leading-relaxed">
              {selectedLinkType === 'dev'
                ? 'मोबाइल Chrome में आपके Google खाते (amritarjun11@gmail.com) से लॉगिन होना चाहिए।'
                : 'पब्लिक लिंक को किसी भी फ़ोन या ब्राउज़र में बिना किसी लॉगिन के खोला जा सकता है।'}
            </p>
          </div>

          {/* Direct Link box */}
          <div className="p-2.5 rounded-xl bg-[#171f33] border border-[#2d3449] flex items-center justify-between gap-2 text-left">
            <div className="truncate flex-1">
              <span className="text-[9px] text-[#908fa0] block">URL:</span>
              <span className="text-[11px] font-mono text-[#c0c1ff] truncate block">
                {activeUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-[#8083ff]/20 hover:bg-[#8083ff]/30 text-[#c0c1ff] text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>Copy</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1"
            >
              <span>WhatsApp पर भेजें</span>
            </button>
            <button
              onClick={closeQrModal}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black shadow-md active:scale-98 transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
