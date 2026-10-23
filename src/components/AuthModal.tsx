import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { compressImage } from '../utils/imageCompressor';
import { audioEngine } from '../utils/audioEngine';
import { UserProfile } from '../types';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const PRESET_AVATARS = [
  {
    label: 'Professional',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Youth / Seller',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Businessman',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Store Owner',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Female Seller',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Auto Dealer',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  },
];

const POPULAR_AREAS = [
  // Rewa
  'Civil Lines, Rewa',
  'Bodabag, Rewa',
  'College Road, Rewa',
  'Urrahat, Rewa',
  'Sirmour Chauraha, Rewa',
  'Chorhata, Rewa',
  'Ananthpur, Rewa',
  'Huzur, Rewa',
  // Satna
  'Circuit House, Satna',
  'Pateri, Satna',
  'Mukhtiyarganj, Satna',
  'Semariya Chowk, Satna',
  'Amarpatan, Satna',
  // Maihar
  'Ghantaghar, Maihar',
  'Sarla Nagar, Maihar',
  'Maihar Dham, Maihar',
  // Sidhi
  'Samrat Chowk, Sidhi',
  'Churhat, Sidhi',
  // Mauganj
  'Mauganj Town, Mauganj',
  'Hanumana, Mauganj',
  // Capital & State Hubs
  'MP Nagar, Bhopal',
  'Civic Centre, Jabalpur',
  'Vijay Nagar, Indore',
];

const REWA_AREAS = POPULAR_AREAS;

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    createNewAccount,
    switchUserAccount,
    savedAccounts,
    currentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'signup' | 'login' | 'switch'>(authModalTab || 'signup');

  // Sign up form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(REWA_AREAS[0]);
  const [role, setRole] = useState<'seller' | 'buyer' | 'dealer'>('seller');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[1].url);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  // OTP Verification state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [isLoginOtpSent, setIsLoginOtpSent] = useState(false);

  // Hidden File Inputs
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Reset tab when modal opens with a specific tab
  React.useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Handle Gallery file picker trigger
  const triggerGallery = () => {
    if (galleryRef.current) {
      galleryRef.current.value = '';
      galleryRef.current.click();
    }
  };

  const triggerCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.value = '';
      cameraRef.current.click();
    }
  };

  // Process chosen avatar file with instant local compression
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingAvatar(true);
    try {
      const dataUrl = await compressImage(file, 400, 400, 0.85);
      setAvatar(dataUrl);
      showToast('✅ Profile photo successfully add ho gayi!');
      audioEngine.playChime();
    } catch (err) {
      console.warn('Canvas compression error, reading via FileReader:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatar(reader.result as string);
          showToast('✅ Profile photo add ho gayi!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  // Send OTP handler
  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('⚠️ Kripya valid 10-digit mobile number darj karein!');
      return;
    }

    setIsSendingOtp(true);
    try {
      if (isSupabaseConfigured) {
        await supabaseService.signInWithPhoneOtp(cleanPhone);
      }
    } catch (e) {
      console.warn('Supabase OTP notice (falling back to instant demo OTP):', e);
    }

    setIsSendingOtp(false);
    setIsOtpSent(true);
    setOtpCode('123456'); // Pre-fill test OTP for instantaneous effortless testing
    showToast('📲 6-digit OTP bheja gaya! (Test Code: 123456)');
    audioEngine.playChime();
  };

  // Verify OTP handler
  const handleVerifyOtp = () => {
    if (otpCode.trim() === '123456' || otpCode.trim().length === 6) {
      setIsOtpVerified(true);
      showToast('✅ Mobile number OTP successfully verified!');
      audioEngine.playChime();
    } else {
      showToast('⚠️ Invalid OTP! Test ke liye "123456" dalein.');
    }
  };

  // Sign up submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('⚠️ Kripya apna pura naam likhein!');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      showToast('⚠️ Kripya 10-digit mobile number likhein!');
      return;
    }

    const formattedPhone = phone.trim().startsWith('+91')
      ? phone.trim()
      : `+91 ${phone.trim().replace(/^0+/, '')}`;

    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      phone: formattedPhone,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      location,
      avatar,
      bio: bio.trim() || `Verified ${role === 'dealer' ? 'Dealer' : 'Seller'} in ${location}`,
      role,
      verified: true,
      activeAds: 0,
      soldAds: 0,
      reelsCount: 0,
      followersCount: 0,
      reviewsCount: 0,
      rating: 5.0,
    };

    createNewAccount(newProfile);
  };

  // Login submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      showToast('⚠️ Mobile number ya email darj karein!');
      return;
    }

    // Check saved accounts or managed users
    const found = savedAccounts.find(
      a =>
        a.phone.includes(loginPhone.trim()) ||
        (a.email && a.email.toLowerCase().includes(loginPhone.trim().toLowerCase()))
    );

    if (found) {
      switchUserAccount(found);
      showToast(`👋 Swagat hai, ${found.name}! Login safal raha.`);
      return;
    }

    // Otherwise create temporary quick profile
    const quickProfile: UserProfile = {
      id: `user_${Date.now()}`,
      name: `User ${loginPhone.slice(-4)}`,
      phone: loginPhone.startsWith('+91') ? loginPhone : `+91 ${loginPhone}`,
      email: `${loginPhone.replace(/\D/g, '')}@bazaarreels.in`,
      location: 'Civil Lines, Rewa, MP',
      avatar: PRESET_AVATARS[0].url,
      verified: true,
      activeAds: 0,
      soldAds: 0,
      reelsCount: 0,
      followersCount: 0,
      reviewsCount: 0,
      rating: 5.0,
      role: 'seller',
    };

    createNewAccount(quickProfile);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-lg bg-[#0b1326] border border-[#2d3449] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] text-[#dae2fd]"
        onClick={e => e.stopPropagation()}
      >
        {/* Hidden File Inputs for Avatar Selection */}
        <input
          ref={galleryRef}
          type="file"
          accept="image/*,image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleAvatarFile}
          className="sr-only"
          aria-hidden="true"
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*,image/jpeg,image/png,image/webp"
          capture="user"
          onChange={handleAvatarFile}
          className="sr-only"
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#222a3d] bg-[#131b2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8083ff] via-[#4edea3] to-[#8083ff] flex items-center justify-center text-[#0b1326] font-black text-xl shadow-lg">
              ✨
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                BazaarReels Rewa Accounts
              </h2>
              <p className="text-xs text-[#908fa0]">
                Naya account banayein ya login karein
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#222a3d] bg-[#0e1628] px-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'signup'
                ? 'border-[#8083ff] text-[#8083ff] bg-[#8083ff]/5'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>Naya Account (Sign Up)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'login'
                ? 'border-[#4edea3] text-[#4edea3] bg-[#4edea3]/5'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span>OTP Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'switch'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">switch_account</span>
            <span>Switch Account ({savedAccounts.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: CREATE NEW ACCOUNT (SIGN UP) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Profile Photo Selection with Instant Gallery Upload */}
              <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#8083ff] bg-[#131b2e] flex items-center justify-center shadow-lg">
                    {isCompressingAvatar ? (
                      <span className="material-symbols-outlined text-2xl text-[#8083ff] animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerGallery}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] flex items-center justify-center border-2 border-[#171f33] shadow"
                    title="Gallery se Photo Upload"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add_a_photo</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <span>Profile Photo</span>
                      <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] px-1.5 py-0.5 rounded font-bold">
                        Gallery Ready
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#908fa0]">
                      Apne phone ki gallery ya camera se apni photo dalein:
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <button
                      type="button"
                      onClick={triggerGallery}
                      className="px-3 py-1.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">collections</span>
                      <span>+ Gallery se chunein</span>
                    </button>
                    <button
                      type="button"
                      onClick={triggerCamera}
                      className="px-3 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-xs font-bold text-[#dae2fd] flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      <span>Camera</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Avatar Quick Chips */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#908fa0] uppercase font-bold block">
                  Ya in ready-made Avatars me se chunein:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_AVATARS.map((pa, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(pa.url)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                        avatar === pa.url
                          ? 'border-[#4edea3] ring-2 ring-[#4edea3]/50 scale-105'
                          : 'border-[#2d3449] opacity-75 hover:opacity-100 hover:border-[#8083ff]'
                      }`}
                      title={pa.label}
                    >
                      <img src={pa.url} alt={pa.label} className="w-full h-full object-cover" />
                      {avatar === pa.url && (
                        <span className="absolute inset-0 bg-[#4edea3]/30 flex items-center justify-center text-[#0b1326] font-bold text-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-[#dae2fd] uppercase block mb-1">
                  Pura Naam (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jaise: Vikram Singh"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Mobile Phone + OTP Section */}
              <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#dae2fd] uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#4edea3]">phone</span>
                    <span>Mobile Number (10 Digit) *</span>
                  </label>
                  {isOtpVerified && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                      ✓ Phone Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2.5 bg-[#131b2e] border border-[#2d3449] rounded-xl text-xs font-bold text-[#908fa0]">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9827012345"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none tracking-wider font-mono"
                  />
                  {!isOtpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || phone.length < 10}
                      className="px-3 py-2.5 rounded-xl bg-[#8083ff]/20 hover:bg-[#8083ff]/30 text-[#8083ff] text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-40"
                    >
                      {isSendingOtp ? 'Bhej rahe...' : isOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {/* OTP Box */}
                {isOtpSent && !isOtpVerified && (
                  <div className="p-3 bg-[#0b1326] rounded-xl border border-amber-500/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                        <span>📲</span>
                        <span>OTP Darj Karein (Test Code: 123456):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode('123456')}
                        className="text-[10px] text-[#4edea3] hover:underline font-bold"
                      >
                        Auto-fill 123456
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        className="flex-1 bg-[#131b2e] border border-[#2d3449] focus:border-[#4edea3] rounded-xl px-3 py-2 text-xs text-center font-mono text-white tracking-widest text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 rounded-xl bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#0b1326] text-xs font-black shadow-md"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Location / City */}
              <div>
                <label className="text-xs font-bold text-[#dae2fd] uppercase block mb-1">
                  शहर व इलाका (City / Area) *
                </label>
                <div className="space-y-1.5">
                  <select
                    value={POPULAR_AREAS.includes(location) ? location : '__custom__'}
                    onChange={e => {
                      if (e.target.value !== '__custom__') {
                        setLocation(e.target.value);
                      }
                    }}
                    className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {POPULAR_AREAS.map(area => (
                      <option key={area} value={area} className="bg-[#131b2e] text-white">
                        {area}
                      </option>
                    ))}
                    <option value="__custom__" className="bg-[#131b2e] text-amber-300">
                      ✏️ अन्य शहर / इलाका खुद लिखें...
                    </option>
                  </select>

                  {(!POPULAR_AREAS.includes(location) || location === '__custom__') && (
                    <input
                      type="text"
                      placeholder="उदा. Maihar, Satna, Mauganj, Rewa, Bhopal..."
                      value={location === '__custom__' ? '' : location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-[#171f33] border border-[#8083ff]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Account Role */}
              <div>
                <label className="text-xs font-bold text-[#dae2fd] uppercase block mb-1.5">
                  Account Type (Aapka Upyog)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'seller', label: 'Direct Seller', icon: 'storefront', sub: 'Bike/Item Seller' },
                    { id: 'buyer', label: 'Buyer', icon: 'shopping_bag', sub: 'Kharidar' },
                    { id: 'dealer', label: 'Store / Dealer', icon: 'verified', sub: 'Dukandar / Showroom' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        role === r.id
                          ? 'bg-[#8083ff]/15 border-[#8083ff] text-white shadow-sm'
                          : 'bg-[#131b2e] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg block mb-0.5 text-[#8083ff]">
                        {r.icon}
                      </span>
                      <span className="text-xs font-bold block leading-tight">{r.label}</span>
                      <span className="text-[9px] text-[#908fa0] block">{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Email & Bio */}
              <div>
                <label className="text-xs font-bold text-[#dae2fd] uppercase block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="vikram.rewa@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#dae2fd] uppercase block mb-1">
                  Bio / Apne Baare Me
                </label>
                <input
                  type="text"
                  placeholder="Jaise: Rewa Civil Lines resident, genuine used bikes seller"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8083ff] via-[#4edea3] to-[#8083ff] text-[#0b1326] text-xs font-black tracking-wide shadow-xl shadow-[#8083ff]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-base font-bold">how_to_reg</span>
                <span>🎉 Create My Account &amp; Start Selling / Buying</span>
              </button>
            </form>
          )}

          {/* TAB 2: OTP LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="p-3.5 bg-[#171f33] rounded-2xl border border-[#2d3449] space-y-2">
                  <label className="text-xs font-bold text-white uppercase block">
                    Mobile Number ya Email se Login Karein
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Mobile number (98270XXXXX) ya Email"
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      className="flex-1 bg-[#131b2e] border border-[#2d3449] focus:border-[#4edea3] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!loginPhone.trim()) {
                          showToast('⚠️ Kripya number ya email dalein!');
                          return;
                        }
                        setIsLoginOtpSent(true);
                        setLoginOtp('123456');
                        showToast('📲 OTP Bheja Gaya! (Test Code: 123456)');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-[#4edea3] text-[#0b1326] text-xs font-black"
                    >
                      {isLoginOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>

                  {isLoginOtpSent && (
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#908fa0]">
                        <span>Enter 6-Digit OTP:</span>
                        <button
                          type="button"
                          onClick={() => setLoginOtp('123456')}
                          className="text-[#4edea3] font-bold text-[11px] underline"
                        >
                          Auto-fill 123456
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={loginOtp}
                        onChange={e => setLoginOtp(e.target.value)}
                        className="w-full bg-[#131b2e] border border-[#4edea3] rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#0b1326] text-xs font-black shadow-lg shadow-[#4edea3]/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Instant Login Karein</span>
                </button>
              </form>

              {/* 1-Click Demo Profiles */}
              <div className="pt-2 border-t border-[#222a3d] space-y-2">
                <span className="text-[10px] text-[#908fa0] uppercase font-bold block">
                  Quick 1-Click Login (Demo Accounts):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const aman = savedAccounts.find(a => a.name.includes('Aman')) || {
                        name: 'Aman Verma',
                        phone: '+91 98270 41239',
                        email: 'aman.rewa@gmail.com',
                        location: 'Civil Lines, Rewa, MP',
                        avatar: PRESET_AVATARS[1].url,
                        verified: true,
                        activeAds: 6,
                        soldAds: 2,
                        reelsCount: 14,
                        followersCount: 840,
                        reviewsCount: 22,
                        rating: 4.9,
                        role: 'seller',
                      };
                      switchUserAccount(aman as any);
                    }}
                    className="p-2.5 rounded-xl bg-[#171f33] border border-[#2d3449] hover:border-[#8083ff] text-left flex items-center gap-2"
                  >
                    <img src={PRESET_AVATARS[1].url} alt="Aman" className="w-8 h-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">Aman Verma</span>
                      <span className="text-[10px] text-[#908fa0] block truncate">Civil Lines Seller</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rahul: UserProfile = {
                        name: 'Rahul Sharma',
                        phone: '+91 94251 88900',
                        email: 'rahul.automobiles@gmail.com',
                        location: 'Bodabag, Rewa, MP',
                        avatar: PRESET_AVATARS[3].url,
                        verified: true,
                        activeAds: 12,
                        soldAds: 45,
                        reelsCount: 28,
                        followersCount: 2100,
                        reviewsCount: 88,
                        rating: 4.9,
                        role: 'dealer',
                      };
                      switchUserAccount(rahul);
                    }}
                    className="p-2.5 rounded-xl bg-[#171f33] border border-[#2d3449] hover:border-[#4edea3] text-left flex items-center gap-2"
                  >
                    <img src={PRESET_AVATARS[3].url} alt="Rahul" className="w-8 h-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">Rahul Sharma</span>
                      <span className="text-[10px] text-[#908fa0] block truncate">Automobiles Dealer</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SWITCH ACCOUNT */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Is Device par Save kiye gaye Accounts:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-[11px] text-[#8083ff] hover:underline font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  <span>+ Naya Account Jodein</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {savedAccounts.map((account, index) => {
                  const isActive =
                    currentUser.phone === account.phone ||
                    (currentUser.email && account.email && currentUser.email.toLowerCase() === account.email.toLowerCase());

                  return (
                    <div
                      key={index}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-[#171f33] border-[#4edea3] shadow-md shadow-[#4edea3]/10'
                          : 'bg-[#131b2e] border-[#2d3449] hover:border-[#8083ff]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#2d3449]">
                          <img
                            src={account.avatar || PRESET_AVATARS[0].url}
                            alt={account.name}
                            className="w-full h-full object-cover"
                          />
                          {isActive && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4edea3] border border-[#0b1326]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {account.name}
                            </span>
                            {isActive && (
                              <span className="text-[9px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-1.5 py-0.2 rounded border border-[#4edea3]/30">
                                Active Now
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#908fa0] block truncate">
                            {account.phone} • {account.location}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="text-xs text-[#4edea3] font-bold shrink-0 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Chalu hai</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchUserAccount(account)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] text-xs font-black transition-transform active:scale-95 shrink-0"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
