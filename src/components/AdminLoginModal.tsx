import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAsAdmin, navigateTo } = useApp();
  const [email, setEmail] = useState('amritarjun11@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginAsAdmin(email, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          navigateTo('admin');
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1326] border border-[#2d3449] rounded-3xl w-full max-w-md shadow-2xl text-[#dae2fd] overflow-hidden relative">
        {/* Glow effect */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#8083ff]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#4edea3]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#222a3d] flex items-center justify-between bg-[#131b2e]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] shadow-lg shadow-[#8083ff]/30 font-black">
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                Admin Console Login
              </h2>
              <p className="text-[11px] text-[#908fa0]">
                Restricted to Amrit Arjun (<span className="text-[#4edea3]">Owner</span>)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171f33] hover:bg-[#222a3d] text-[#908fa0] hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-2xl bg-[#171f33]/80 border border-[#222a3d] text-xs text-[#908fa0] space-y-1">
            <div className="flex items-center gap-1.5 text-[#dae2fd] font-bold">
              <span className="material-symbols-outlined text-sm text-[#4edea3]">security</span>
              <span>Private Access Verification</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              यह पैनल केवल आपके मुख्य ईमेल (<strong className="text-[#c0c1ff]">amritarjun11@gmail.com</strong>) के लिए सुरक्षित है। आम यूज़र्स को यह एडमिन पैनल नहीं दिखेगा।
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-red-400">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/40 text-[#4edea3] text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#4edea3]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#c0c1ff] mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="amritarjun11@gmail.com"
                  required
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#505a74] focus:outline-none focus:border-[#8083ff] pl-9 font-medium"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#908fa0]">
                  mail
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#c0c1ff]">
                  Admin Password
                </label>
                <span className="text-[10px] text-[#908fa0]">
                  Default: <code className="text-[#4edea3]">admin123</code>
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#505a74] focus:outline-none focus:border-[#8083ff] pl-9 pr-10 font-medium"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#908fa0]">
                  lock
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-[#908fa0] hover:text-white"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs shadow-lg shadow-[#8083ff]/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0b1326] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base font-black">
                      vpn_key
                    </span>
                    <span>Admin Log In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-[10px] text-[#908fa0] text-center pt-1">
            Protected with AES Encryption & Supabase Auth RBAC Role Guard.
          </p>
        </div>
      </div>
    </div>
  );
};
