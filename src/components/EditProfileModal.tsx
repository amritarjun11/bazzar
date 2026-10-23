import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { compressImage } from '../utils/imageCompressor';

const PRESET_AVATARS = [
  {
    label: 'Smiling Guy',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Smart Professional',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Cool Rider',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Business Lady',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'College Student',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Verified Dealer',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
];

const REWA_LOCATIONS = [
  'Civil Lines, Rewa, MP',
  'Saman Naka, Rewa, MP',
  'College Road, Rewa, MP',
  'Bichhiya, Rewa, MP',
  'University Road, Rewa, MP',
  'Sirmaur Chauraha, Rewa, MP',
  'Satna, MP',
];

export const EditProfileModal: React.FC = () => {
  const { currentUser, isEditProfileOpen, closeEditProfileModal, updateUserProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.location);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarError, setAvatarError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const triggerCameraInput = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (isEditProfileOpen) {
      setName(currentUser.name);
      setPhone(currentUser.phone);
      setEmail(currentUser.email);
      setLocation(currentUser.location);
      setAvatar(currentUser.avatar);
      setBio(currentUser.bio || '');
      setAvatarError(false);
    }
  }, [isEditProfileOpen, currentUser]);

  if (!isEditProfileOpen) return null;

  // Handle local image file upload from device / gallery with auto-compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      setAvatar(compressedDataUrl);
      setAvatarError(false);
    } catch (err) {
      console.error('Failed to compress avatar photo, fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setAvatar(dataUrl);
          setAvatarError(false);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      avatar: avatar.trim(),
      bio: bio.trim(),
    });

    closeEditProfileModal();
  };

  const initials = (name.trim() || 'User')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={closeEditProfileModal}
    >
      <div
        className="w-full max-w-lg bg-[#0b1326] border border-[#2d3449] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#222a3d] bg-[#131b2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] shadow-lg">
              <span className="material-symbols-outlined text-2xl font-bold">badge</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#dae2fd]">Edit Profile & Photo</h2>
              <p className="text-xs text-[#908fa0]">Update your name, contact details & avatar</p>
            </div>
          </div>
          <button
            onClick={closeEditProfileModal}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Avatar Upload / Selector Section */}
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#8083ff] bg-[#131b2e] flex items-center justify-center shadow-md">
                {!avatarError && avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-lg font-black text-[#0b1326]">
                    {initials}
                  </div>
                )}
              </div>

              {/* Upload trigger overlay button */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </button>

              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#8083ff] hover:bg-[#6c70ff] text-white flex items-center justify-center border-2 border-[#171f33] shadow"
                title="Upload Photo"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h4 className="text-xs font-bold text-[#dae2fd]">Profile Photo</h4>
                <p className="text-[11px] text-[#908fa0]">
                  JPG, PNG or WEBP from your phone/computer (Max 5MB)
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,image/jpeg,image/png,image/webp,image/jpg,image/heic,image/heif"
                  className="sr-only"
                  aria-hidden="true"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  accept="image/*,image/jpeg,image/png,image/webp,image/jpg"
                  capture="user"
                  className="sr-only"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm font-bold">
                    {isUploading ? 'sync' : 'upload'}
                  </span>
                  <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={triggerCameraInput}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-xs font-bold text-[#4edea3] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Take Selfie / Camera Photo"
                >
                  <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                  <span>Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const random = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
                    setAvatar(random.url);
                    setAvatarError(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-semibold text-[#c0c1ff] transition-colors"
                >
                  🎲 Random Avatar
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#908fa0] uppercase tracking-wider block">
              Or Choose Preset Avatar:
            </span>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatar(p.url);
                    setAvatarError(false);
                  }}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                    avatar === p.url ? 'border-[#4edea3] ring-2 ring-[#4edea3]/30 scale-105' : 'border-[#2d3449]'
                  }`}
                  title={p.label}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  {avatar === p.url && (
                    <div className="absolute inset-0 bg-[#4edea3]/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white font-bold text-sm">
                        check
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Details Fields */}
          <div className="space-y-3 pt-2 border-t border-[#222a3d]">
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block mb-1">
                Full Name (पूरा नाम) *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] text-base">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aman Verma"
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#dae2fd] font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block mb-1">
                Mobile Number (फ़ोन नंबर) *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] text-base">
                  call
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +91 98270 41239"
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#dae2fd] font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block mb-1">
                Email Address (ईमेल पता)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] text-base">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. aman.rewa@gmail.com"
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#dae2fd] font-medium focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block mb-1">
                Location (शहर / मोहल्ला)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] text-base">
                  location_on
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Civil Lines, Rewa, MP"
                  className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#dae2fd] font-bold focus:outline-none transition-colors"
                />
              </div>

              {/* Quick location chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <span className="text-[10px] text-[#908fa0]">Rewa Areas:</span>
                {REWA_LOCATIONS.map((loc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[10px] bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-[#c0c1ff] px-2 py-0.5 rounded-lg transition-colors"
                  >
                    {loc.replace(', Rewa, MP', '').replace(', MP', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio / About */}
            <div>
              <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block mb-1">
                Bio / About (परिचय)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="e.g. Trusted Rewa seller dealing in genuine bikes and electronics."
                className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#222a3d] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeEditProfileModal}
              className="px-4 py-2.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-bold text-[#dae2fd] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#8083ff]/20 hover:opacity-95 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base font-bold">check</span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
