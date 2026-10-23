import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SafetyGuideModal: React.FC = () => {
  const { isSafetyModalOpen, closeSafetyModal, submitSupportMessage, showToast, location } = useApp();
  const [activeTab, setActiveTab] = useState<'qr_upi' | 'army_courier' | 'inspection' | 'cyber_help'>('qr_upi');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('qr_fraud');
  const [reportDetails, setReportDetails] = useState('');

  if (!isSafetyModalOpen) return null;

  const handleReportFraud = () => {
    if (!reportDetails.trim()) {
      showToast('❌ Kripya fraud ya shakk ki jaankari likhein');
      return;
    }

    submitSupportMessage({
      name: 'User Report (Safety Shield)',
      phone: 'Anonymous / In-App',
      category: 'bug_report',
      subject: `🚨 FRAUD REPORT: ${reportReason.toUpperCase()}`,
      message: `User reported potential classified scam. Details: ${reportDetails}. City: ${location}`,
      city: location,
    });

    showToast('🛡️ Aapki complaint darj ho gayi hai! Admin team turant jaanch karegi.');
    setIsReportOpen(false);
    setReportDetails('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#171f33] border border-[#2d3449] rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-rose-950/60 via-[#171f33] to-amber-950/40 border-b border-[#2d3449] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-black flex items-center justify-center font-black shadow-lg shadow-rose-500/20 shrink-0">
              <span className="material-symbols-outlined text-2xl font-bold">shield</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#dae2fd]">
                  सुरक्षा और धोखाधड़ी से बचाव
                </h2>
                <span className="text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SCAM SHIELD
                </span>
              </div>
              <p className="text-xs text-[#908fa0]">
                OLX & Classifieds par hone wale 4 sabse bade frauds se bachein
              </p>
            </div>
          </div>

          <button
            onClick={closeSafetyModal}
            className="w-9 h-9 rounded-full bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-[#131b2e] border-b border-[#222a3d] overflow-x-auto scrollbar-none">
          {[
            { id: 'qr_upi', icon: 'qr_code_scanner', label: '1. QR & UPI Scam' },
            { id: 'army_courier', icon: 'military_tech', label: '2. Fake Army/Courier' },
            { id: 'inspection', icon: 'verified_user', label: '3. Meeting & RC Rules' },
            { id: 'cyber_help', icon: 'support_agent', label: '4. Helpline (1930)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsReportOpen(false);
              }}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                activeTab === tab.id && !isReportOpen
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-black shadow-md'
                  : 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: QR CODE & UPI FRAUD */}
          {activeTab === 'qr_upi' && !isReportOpen && (
            <div className="space-y-4 animate-fadeIn">
              {/* Core Golden Rule Box */}
              <div className="bg-rose-950/40 border-2 border-rose-500/60 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-3xl text-rose-400 shrink-0">
                  gpp_bad
                </span>
                <div>
                  <h3 className="text-sm font-black text-rose-200 uppercase tracking-wide">
                    ⚠️ Golden Rule: Paise Lene Ke Liye KABHI QR Code Scan Na Karein!
                  </h3>
                  <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                    UPI me <strong>QR Code scan karna ya UPI PIN dalna sirf paise DENE (Pay karne)</strong> ke liye hota hai. Kisi se paise lene (Receive karne) ke liye na QR scan hota hai aur na PIN dalna padta hai.
                  </p>
                </div>
              </div>

              {/* How Scammers Trick You */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#131b2e] border border-rose-500/30 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-rose-400 mb-2">
                    <span className="material-symbols-outlined text-base">cancel</span>
                    <span>Scammer Ka Tarika (Fake Buyer)</span>
                  </div>
                  <ul className="text-[11px] text-[#908fa0] space-y-1.5 list-disc list-inside">
                    <li>"Maine aapka saman pasand kar liya, main poora advance bhej raha hoon."</li>
                    <li>WhatsApp par QR code bhejte hain aur bolte hain: <em>"Ye scan karke accept karo, paise transfer honge."</em></li>
                    <li>Jaise hi aap QR scan karke UPI PIN dalte hain, <strong>aapke khate se paise kat jate hain!</strong></li>
                  </ul>
                </div>

                <div className="bg-[#131b2e] border border-emerald-500/30 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 mb-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Asli Tarika (Safe Payment)</span>
                  </div>
                  <ul className="text-[11px] text-[#908fa0] space-y-1.5 list-disc list-inside">
                    <li>Keval apna <strong>Mobile Number</strong> ya <strong>UPI ID</strong> (jaise mobile@upi) dein.</li>
                    <li>Saamne wale ko bolo: <em>"Bina PIN maange seedha mere phone number par Google Pay/PhonePe karein."</em></li>
                    <li>Bank SMS aur App notification aane ke baad hi payment confirm maanein.</li>
                  </ul>
                </div>
              </div>

              {/* Warning Checklist */}
              <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#dae2fd] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-400 text-sm">warning</span>
                  <span>In Baaton Ka Hamesha Dhyan Rakhein:</span>
                </h4>
                <div className="space-y-2 text-xs text-[#dae2fd]/80">
                  <p className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>Kisi bhi anjaan link (Paytm/GooglePay link) par click na karein.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>"Rs. 5 bhej kar dekhta hoon" bol kar test transaction ke bahane bada amount na katwayein.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Hamesha saman ki physical delivery ke samay hi baki cash ya direct UPI lein.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAKE ARMY / CISF COURIER SCAM */}
          {activeTab === 'army_courier' && !isReportOpen && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-3xl text-amber-400 shrink-0">
                  military_tech
                </span>
                <div>
                  <h3 className="text-sm font-black text-amber-200 uppercase tracking-wide">
                    🎖️ Nakli Fauji (Fake Army / CISF) Transfer Scam
                  </h3>
                  <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
                    Classifieds par 60% se zyada gaadiyon aur mobiles ke frauds nakli Army Officer ban kar kiye jate hain. Fauji ID card internet se chura kar profile photo me lagayi jati hai.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-4">
                  <h4 className="text-xs font-black text-[#dae2fd] mb-2">
                    Ye Log Kaise Baatein Karte Hain:
                  </h4>
                  <div className="space-y-2 text-xs text-[#908fa0]">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <p className="italic text-[#dae2fd]">
                        "Sir, main Army Cantonment / CISF Rewa me posted hoon. Mera transfer ho raha hai isliye gaadi saste me bech raha hoon."
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <p className="italic text-[#dae2fd]">
                        "Gaadi Army parcel courier se aapke ghar deliver karwayenge. Pahle Gate Pass aur booking charge ₹2,500 advance bhejo."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 text-xs text-rose-200">
                  <h4 className="font-black flex items-center gap-1.5 text-rose-300 mb-1">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Hamara Niyam (Strict Policy):</span>
                  </h4>
                  <p>
                    Indian Army ya Police kisi bhi private saman ke liye courier ya delivery service nahi karti. <strong>Kisi ko bhi gate pass, advance parcel charge, ya transport booking ke paise KABHI na dein.</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEETING & PHYSICAL INSPECTION */}
          {activeTab === 'inspection' && !isReportOpen && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-3xl text-emerald-400 shrink-0">
                  handshake
                </span>
                <div>
                  <h3 className="text-sm font-black text-emerald-200 uppercase tracking-wide">
                    🤝 Aamne-Saamne Milna Aur Jaanch Ke Niyam
                  </h3>
                  <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                    Kisi bhi deal ko complete karne ka sabse surakshit tarika hai: <strong>Aamne-saamne milna, saman dekhna, aur fir payment karna.</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black text-[#8083ff] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>Surakshit Jagah (Safe Place)</span>
                  </h4>
                  <p className="text-[11px] text-[#908fa0] leading-relaxed">
                    Hamesha din ke samay (Daylight) bheed-bhaad wali public jagah jaise Rewa Bus Stand, College Ground, Petrol Pump, ya Market me milein. Kisi anjaan sunsaan jagah ya anjaan flat par akele na jayein.
                  </p>
                </div>

                <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black text-[#4edea3] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">description</span>
                    <span>Bike / Car Paper Check</span>
                  </h4>
                  <p className="text-[11px] text-[#908fa0] leading-relaxed">
                    RC Smart Card, Insurance, Pollution, aur Chassis number physically check karein. <strong>mParivahan</strong> app par gaadi ka number daal kar owner ka naam aur challan verify karein.
                  </p>
                </div>
              </div>

              <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-4">
                <h4 className="text-xs font-black text-[#dae2fd] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#38bdf8]">smartphone</span>
                  <span>Mobile Phone Kharidne Ke Niyam:</span>
                </h4>
                <ul className="text-[11px] text-[#908fa0] space-y-1.5 list-disc list-inside">
                  <li>Phone ka <strong>*#06#</strong> dial karke IMEI number check karein aur bill/box se match karein.</li>
                  <li>iCloud / Google FRP Lock khula hua hona chahiye, phone ko aamne-saamne reset karwake dekhein.</li>
                  <li>Original GST bill aur seller ke Aadhar Card ki photo copy lein.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: HELPLINE 1930 & CYBER POLICE */}
          {activeTab === 'cyber_help' && !isReportOpen && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 border-2 border-blue-500/50 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-3xl text-blue-400 shrink-0">
                  local_police
                </span>
                <div>
                  <h3 className="text-sm font-black text-blue-200 uppercase tracking-wide">
                    National Cyber Crime Helpline (Govt. of India)
                  </h3>
                  <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                    Agar aapke sath ya kisi jaan-pehchan wale ke sath koi online dhokhadhadi ho jati hai, toh ghabrayein nahi. Bharat Sarkar ka 24x7 helpline number turant dial karein.
                  </p>
                </div>
              </div>

              {/* Big 1930 Dial Banner */}
              <div className="bg-gradient-to-br from-[#171f33] to-[#131b2e] border border-blue-500/30 rounded-3xl p-5 text-center space-y-3 shadow-xl">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                  TOLL-FREE EMERGENCY HELPLINE
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-wider flex items-center justify-center gap-2">
                  <span>📞 1930</span>
                </div>
                <p className="text-xs text-[#908fa0] max-w-md mx-auto">
                  Paise katne ke 2 ghante ke andar (Golden Hour) 1930 par phone karein taaki fraudster ka bank account turant freeze kiya ja sake.
                </p>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <a
                    href="tel:1930"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow"
                  >
                    <span className="material-symbols-outlined text-sm">call</span>
                    <span>Dial 1930 Now</span>
                  </a>

                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-xs font-bold text-[#dae2fd] flex items-center gap-1.5"
                  >
                    <span>cybercrime.gov.in</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Rewa Cyber Police Station */}
              <div className="bg-[#131b2e] border border-[#2d3449] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-[#dae2fd]">
                    Rewa District Cyber Police Cell
                  </h4>
                  <p className="text-[11px] text-[#908fa0] mt-0.5">
                    SP Office Campus, Civil Lines, Rewa (M.P.)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Local Assistance
                </span>
              </div>
            </div>
          )}

          {/* REPORT SCAM / USER FORM */}
          {isReportOpen && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4">
                <h3 className="text-sm font-black text-rose-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">report</span>
                  <span>Sandigdh User Ya Ad Ki Report Karein (Report Fraud)</span>
                </h3>
                <p className="text-xs text-[#908fa0] mt-1">
                  Hamari admin moderation team aapki complaint ki foran jaanch karegi aur dhandhli karne wale user ko platform se block karegi.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#908fa0] block mb-1">
                  Dhokhadhadi Ka Prakar (Fraud Category)
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs font-bold text-[#dae2fd] outline-none"
                >
                  <option value="qr_fraud">QR Code Scan Karwake Paise Mang Raha Hai</option>
                  <option value="army_transfer">Nakli Army Officer / Gate Pass Token Scam</option>
                  <option value="fake_product">Chori Ka Ya Nakli Saman / Galat Photos</option>
                  <option value="advance_token">Saman Dikhane Se Pehle Advance Mang Raha Hai</option>
                  <option value="abusive_chat">Gaali-Galauj Ya Asuvidha-Janak Vyavhar</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#908fa0] block mb-1">
                  Jaankari Darj Karein (Describe Details)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="User ka naam, phone number, ad title ya usne kya likha tha..."
                  rows={4}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl p-3 text-xs text-[#dae2fd] placeholder-[#908fa0] outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#222a3d] text-xs font-bold text-[#908fa0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportFraud}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg"
                >
                  Complaint Submit Karein
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-[#131b2e] border-t border-[#222a3d] px-5 py-3 flex items-center justify-between gap-3">
          {!isReportOpen ? (
            <>
              <button
                onClick={() => setIsReportOpen(true)}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">report_problem</span>
                <span>Kisi User Ki Report Karein</span>
              </button>

              <button
                onClick={closeSafetyModal}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black text-xs font-black shadow-md active:scale-95 transition-transform"
              >
                Main Samajh Gaya (Understood)
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsReportOpen(false)}
              className="text-xs text-[#908fa0] hover:text-white"
            >
              ← Back to Safety Guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
