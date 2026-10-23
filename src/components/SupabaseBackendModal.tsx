import React, { useState, useEffect } from 'react';
import {
  isSupabaseConfigured,
  currentSupabaseUrl,
  currentSupabaseAnonKey,
  saveSupabaseConfig,
  clearSupabaseConfig,
} from '../lib/supabaseClient';
import { supabaseService } from '../services/supabaseService';
import { BAZAAR_SCHEMA_SQL } from '../data/schemaSql';
import { notificationService } from '../services/notificationService';

interface SupabaseBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseBackendModal: React.FC<SupabaseBackendModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'storage' | 'otp_push' | 'guide'>('status');
  const [urlInput, setUrlInput] = useState(currentSupabaseUrl);
  const [keyInput, setKeyInput] = useState(currentSupabaseAnonKey);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [copied, setCopied] = useState(false);
  const [rawSql, setRawSql] = useState<string>(BAZAAR_SCHEMA_SQL);
  const [pushStatus, setPushStatus] = useState<string>(notificationService.getPermissionStatus());
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    // Fetch schema.sql from root or fallback
    fetch('/schema.sql')
      .then(res => res.text())
      .then(text => {
        if (text && !text.includes('<!DOCTYPE html>')) {
          setRawSql(text);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing', message: 'Connecting to Supabase...' });
    const res = await supabaseService.checkConnection();
    if (res.success) {
      setTestResult({ status: 'success', message: res.message });
    } else {
      setTestResult({ status: 'error', message: res.message });
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      alert('Please enter both Supabase URL and Anon Public Key.');
      return;
    }
    saveSupabaseConfig(urlInput.trim(), keyInput.trim());
  };

  const handleCopySchema = () => {
    if (rawSql) {
      navigator.clipboard.writeText(rawSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1326] border border-[#2d3449] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-[#dae2fd] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222a3d] flex items-center justify-between bg-[#131b2e]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3ecf8e] to-[#00b4d8] flex items-center justify-center text-[#0b1326] font-black text-xl shadow-lg shadow-[#3ecf8e]/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Supabase Backend & Database Architecture
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isSupabaseConfigured
                      ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isSupabaseConfigured ? '🟢 Live Configured' : '🟡 Standby / Demo Mode'}
                </span>
              </div>
              <p className="text-xs text-[#908fa0]">
                Auth (Login/Register) • PostgreSQL (Listings & Reels) • Realtime Chat • Storage Buckets
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#222a3d] bg-[#0e1628] px-5 gap-2 overflow-x-auto">
          {[
            { id: 'status', label: '🔌 Connection & Keys', icon: 'settings' },
            { id: 'schema', label: '📄 schema.sql (Full DDL)', icon: 'terminal' },
            { id: 'storage', label: '🗄️ Media & Storage Buckets', icon: 'folder' },
            { id: 'otp_push', label: '📱 Phone OTP & Push Alerts', icon: 'notifications_active' },
            { id: 'guide', label: '📖 Step-by-Step Setup Guide', icon: 'menu_book' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#3ecf8e] text-[#3ecf8e] bg-[#3ecf8e]/5'
                  : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: STATUS & KEYS */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Connection Status Box */}
              <div className="p-4 rounded-xl bg-[#171f33] border border-[#2d3449] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Current Backend Engine:</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/30">
                      Supabase PostgreSQL + Realtime
                    </span>
                  </div>
                  <p className="text-xs text-[#908fa0]">
                    {isSupabaseConfigured
                      ? `Connected to: ${currentSupabaseUrl}`
                      : 'Running with rich local in-memory fallback until you paste your Supabase Project keys.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={testResult.status === 'testing'}
                    className="px-4 py-2 rounded-xl bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-[#0b1326] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#3ecf8e]/20"
                  >
                    <span>{testResult.status === 'testing' ? '⏳ Testing...' : '⚡ Test Connection'}</span>
                  </button>
                </div>
              </div>

              {testResult.message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border ${
                    testResult.status === 'success'
                      ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/40 text-[#3ecf8e]'
                      : testResult.status === 'error'
                      ? 'bg-red-500/10 border-red-500/40 text-red-300'
                      : 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              {/* Input Form for Keys */}
              <form onSubmit={handleSaveCredentials} className="p-5 rounded-2xl bg-[#131b2e] border border-[#2d3449] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🔑</span>
                    <span>Direct Supabase Keys Configuration</span>
                  </h3>
                  <span className="text-[11px] text-[#908fa0]">
                    (Get from Supabase Dashboard → Settings → API)
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#c0c1ff] mb-1">
                      Project URL (VITE_SUPABASE_URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      className="w-full bg-[#0b1326] border border-[#2d3449] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#505a74] focus:outline-none focus:border-[#3ecf8e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#c0c1ff] mb-1">
                      Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={keyInput}
                      onChange={e => setKeyInput(e.target.value)}
                      className="w-full bg-[#0b1326] border border-[#2d3449] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#505a74] focus:outline-none focus:border-[#3ecf8e] font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3ecf8e] to-[#00b4d8] text-[#0b1326] font-bold text-xs shadow-md shadow-[#3ecf8e]/25 hover:opacity-95 transition-opacity"
                  >
                    💾 Save Credentials & Connect
                  </button>

                  {isSupabaseConfigured && (
                    <button
                      type="button"
                      onClick={clearSupabaseConfig}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Disconnect / Reset to Demo
                    </button>
                  )}
                </div>
              </form>

              {/* Architecture Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#171f33]/60 border border-[#2d3449] space-y-1">
                  <div className="text-xs font-bold text-[#3ecf8e]">🔐 Supabase Auth</div>
                  <p className="text-[11px] text-[#908fa0]">
                    Email/Password & OTP Phone sign-up. Profiles auto-synced via Postgres Trigger <code className="text-white">handle_new_user()</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171f33]/60 border border-[#2d3449] space-y-1">
                  <div className="text-xs font-bold text-[#8083ff]">⚡ Postgres & Geo Data</div>
                  <p className="text-[11px] text-[#908fa0]">
                    Indexed tables for listings, vehicles (RC verification), Rewa coordinates, and price filter indices.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171f33]/60 border border-[#2d3449] space-y-1">
                  <div className="text-xs font-bold text-[#4edea3]">💬 Realtime Bargaining</div>
                  <p className="text-[11px] text-[#908fa0]">
                    Supabase Realtime WebSockets push instant buyer offers and counter-proposals to sellers within milliseconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA.SQL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Complete schema.sql DDL</h3>
                  <p className="text-xs text-[#908fa0]">
                    Ready to run in Supabase SQL Editor. Includes Tables, RLS, Indexes, Triggers, Storage Buckets, and Realtime!
                  </p>
                </div>

                <button
                  onClick={handleCopySchema}
                  className="px-4 py-2 rounded-xl bg-[#3ecf8e] text-[#0b1326] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#3ecf8e]/20 hover:opacity-95 transition-all"
                >
                  <span>{copied ? '✅ Copied to Clipboard!' : '📋 Copy schema.sql'}</span>
                </button>
              </div>

              {/* Table Index Summary */}
              <div className="p-3 rounded-xl bg-[#171f33] border border-[#2d3449] text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div><span className="text-[#3ecf8e] font-mono">profiles</span> (Users/Sellers)</div>
                <div><span className="text-[#3ecf8e] font-mono">listings</span> (Ads/Specs)</div>
                <div><span className="text-[#3ecf8e] font-mono">short_reels</span> (30s Videos)</div>
                <div><span className="text-[#3ecf8e] font-mono">chat_messages</span> (Realtime)</div>
                <div><span className="text-[#3ecf8e] font-mono">bargain_offers</span> (Counter-offers)</div>
                <div><span className="text-[#3ecf8e] font-mono">notifications</span> (Push alerts)</div>
                <div><span className="text-[#3ecf8e] font-mono">saved_listings</span> (Favorites)</div>
                <div><span className="text-[#3ecf8e] font-mono">seller_follows</span> (Subscriptions)</div>
              </div>

              {/* Code Box */}
              <div className="relative rounded-2xl bg-[#070c18] border border-[#222a3d] p-4 overflow-x-auto max-h-[50vh]">
                <pre className="text-[11px] font-mono text-[#a5b4fc] leading-relaxed select-all">
                  {rawSql || `-- Loading /schema.sql ... Please click "Copy schema.sql" or check root schema.sql`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE BUCKETS */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Supabase Storage Buckets Architecture</h3>
                <p className="text-xs text-[#908fa0]">
                  Where images, videos, avatars, and RC verification documents are stored securely.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#171f33] border border-[#2d3449] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#3ecf8e]">📸 product-images</span>
                    <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">Public</span>
                  </div>
                  <p className="text-xs text-[#908fa0]">
                    Used for ad photos (Bikes, Mobiles, Electronics, Cars). High-speed CDN delivery.
                  </p>
                  <div className="p-2 rounded-lg bg-[#0b1326] font-mono text-[10px] text-[#a5b4fc]">
                    storage.from('product-images').upload('...')
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171f33] border border-[#2d3449] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#8083ff]">🎬 reels-videos</span>
                    <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">Public</span>
                  </div>
                  <p className="text-xs text-[#908fa0]">
                    Stores 30s walkaround inspection reels (MP4 / WebM). Auto-buffered for seamless loop playback.
                  </p>
                  <div className="p-2 rounded-lg bg-[#0b1326] font-mono text-[10px] text-[#a5b4fc]">
                    storage.from('reels-videos').upload('...')
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171f33] border border-[#2d3449] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#4edea3]">👤 user-avatars</span>
                    <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">Public</span>
                  </div>
                  <p className="text-xs text-[#908fa0]">
                    Profile photos and showroom proprietor logos with fast image caching.
                  </p>
                  <div className="p-2 rounded-lg bg-[#0b1326] font-mono text-[10px] text-[#a5b4fc]">
                    storage.from('user-avatars').upload('...')
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171f33] border border-[#2d3449] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#ffb2b7]">📄 inspection-docs</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Private (RLS)</span>
                  </div>
                  <p className="text-xs text-[#908fa0]">
                    Stores vehicle RC smartcards, purchase receipts, and inspection certificates. Only admin and verified seller can view.
                  </p>
                  <div className="p-2 rounded-lg bg-[#0b1326] font-mono text-[10px] text-[#a5b4fc]">
                    storage.from('inspection-docs').download('...')
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHONE OTP & PUSH NOTIFICATIONS */}
          {activeTab === 'otp_push' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📱 Phone OTP & Closed-App Push Notifications</span>
                  <span className="text-[10px] bg-[#3ecf8e]/20 text-[#3ecf8e] px-2 py-0.5 rounded-full font-bold">
                    Architecture & Guide
                  </span>
                </h3>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Understand how Phone OTP Verification and Background Notifications work when the app is closed.
                </p>
              </div>

              {/* SECTION 1: PUSH NOTIFICATIONS WHEN APP IS CLOSED */}
              <div className="p-4 rounded-2xl bg-[#171f33] border border-[#2d3449] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔔</span>
                    <div>
                      <h4 className="text-xs font-black text-white">
                        Background Push Notifications (जब ऐप बंद हो तब भी नोटिफिकेशन)
                      </h4>
                      <p className="text-[11px] text-[#908fa0]">
                        Service Worker (/sw.js) &amp; Web Push API
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pushStatus === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {pushStatus === 'granted' ? '✓ Permissions Granted' : 'Requires Permission'}
                  </span>
                </div>

                <div className="p-3 bg-[#0b1326] rounded-xl border border-[#222a3d] text-xs text-[#c0c1ff] space-y-1.5 leading-relaxed">
                  <p>
                    <strong>1. ऐप खुला रहने पर:</strong> Supabase Realtime WebSockets से चैट मैसेज और काउंटर-ऑफर तुरंत स्क्रीन पर लाइव आ जाते हैं।
                  </p>
                  <p>
                    <strong>2. ऐप बंद या बैकग्राउंड में रहने पर:</strong> हमारा रजिस्टर्ड <code>/sw.js</code> Service Worker आपके फ़ोन/कंप्यूटर के ऑपरेटिंग सिस्टम पर सीधे <strong>नेक्स्ट-जेन पुश नोटिफिकेशन</strong> भेजता है, भले ही ऐप की विंडो बंद हो।
                  </p>
                </div>

                {/* Interactive Test Action */}
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  {pushStatus !== 'granted' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const granted = await notificationService.requestPermission();
                        setPushStatus(notificationService.getPermissionStatus());
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">notifications</span>
                      <span>ब्राउज़र / फ़ोन नोटिफिकेशन चालू करें (Allow)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        setNotificationSent(true);
                        await notificationService.showNotification({
                          title: '💬 Rahul Sharma (BazaarReels)',
                          body: 'Bhai bike dekhne kab aa rahe ho? Test drive ready hai!',
                          url: '/chat',
                        });
                        setTimeout(() => setNotificationSent(false), 3000);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-[#0b1326] font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">send</span>
                      <span>{notificationSent ? '🔔 Notification Sent!' : 'टेस्ट नोटिफिकेशन भेजें (Send Test Ding)'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 2: PHONE OTP VERIFICATION IN SUPABASE */}
              <div className="p-4 rounded-2xl bg-[#171f33] border border-[#2d3449] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📲</span>
                    <div>
                      <h4 className="text-xs font-black text-white">
                        Phone OTP Verification (मोबाइल OTP लॉगिन व साइनअप)
                      </h4>
                      <p className="text-[11px] text-[#908fa0]">
                        Supabase Auth: signInWithPhoneOtp &amp; verifyPhoneOtp
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#3ecf8e]/20 text-[#3ecf8e] font-bold px-2 py-0.5 rounded-full border border-[#3ecf8e]/40">
                    Code Ready ✅
                  </span>
                </div>

                <div className="p-3 bg-[#0b1326] rounded-xl border border-[#222a3d] text-xs text-[#c0c1ff] space-y-2 leading-relaxed">
                  <p>
                    हमारे ऐप के कोड (<code>supabaseService.ts</code>) में <strong>Phone OTP</strong> के दोनों मेथड्स पूरी तरह तैयार हैं:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#908fa0] text-[11px]">
                    <li><code>supabaseService.signInWithPhoneOtp('+9198270XXXXX')</code></li>
                    <li><code>supabaseService.verifyPhoneOtp('+9198270XXXXX', '123456')</code></li>
                  </ul>
                </div>

                <div className="bg-[#131b2e] p-3.5 rounded-xl border border-[#2d3449] space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-400 text-sm">settings</span>
                    <span>Supabase Dashboard में Phone OTP चालू करने के 3 आसान कदम:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[#908fa0] text-[11px] pl-1">
                    <li>
                      अपने Supabase Dashboard में <strong>Authentication → Providers → Phone</strong> खोलें।
                    </li>
                    <li>
                      <strong>"Enable Phone Provider"</strong> को ON करें।
                    </li>
                    <li>
                      <strong>SMS Provider चुनें:</strong> Twilio, MessageBird, Vonage या भारत के लिए <strong>Fast2SMS / Textlocal</strong>।
                    </li>
                    <li>
                      <strong>मुफ़्त टेस्टिंग के लिए:</strong> नीचे <strong>"Test Phone Numbers"</strong> सेक्शन में अपना मोबाइल नंबर (उदा. <code>+919827012345</code>) और फिक्स OTP (उदा. <code>123456</code>) जोड़ दें। इससे बिना SMS गेटवे खरीदे तुरंत अनलिमिटेड फ्री टेस्ट कर सकते हैं!
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STEP BY STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Supabase Setup Guide (चरणबद्ध गाइड)</h3>
                <p className="text-xs text-[#908fa0]">
                  5 मिनट में अपने प्रोजेक्ट को Supabase से लाइव कनेक्ट करें:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#171f33] border border-[#2d3449] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#3ecf8e] text-[#0b1326] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-white">Create a Supabase Project</div>
                    <p className="text-[#908fa0]">
                      Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#3ecf8e] underline">supabase.com</a>, sign up for free, and click <strong>"New Project"</strong>. Region में <strong>Mumbai (ap-south-1)</strong> चुनें ताकि रीवा और भारत में सुपरफास्ट स्पीड मिले।
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171f33] border border-[#2d3449] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#3ecf8e] text-[#0b1326] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-white">Run schema.sql in SQL Editor</div>
                    <p className="text-[#908fa0]">
                      अपने Supabase Dashboard के बाईं तरफ <strong>"SQL Editor"</strong> पर क्लिक करें। <br />
                      हमारे <strong>"schema.sql"</strong> टैब से पूरा कोड कॉपी करके पेस्ट करें और <strong>"RUN"</strong> बटन दबाएं। यह एक ही बार में सभी 11 टेबल्स, स्टोरेज बकेट्स, ट्रिगर्स और RLS सुरक्षा नीतियां बना देगा।
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171f33] border border-[#2d3449] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#3ecf8e] text-[#0b1326] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-white">Copy API Keys</div>
                    <p className="text-[#908fa0]">
                      Dashboard में <strong>Project Settings → API</strong> में जाएं। वहाँ से: <br />
                      • <strong>Project URL</strong> कॉपी करें <br />
                      • <strong>anon / public API key</strong> कॉपी करें
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171f33] border border-[#2d3449] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#3ecf8e] text-[#0b1326] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-white">Paste Keys & Test!</div>
                    <p className="text-[#908fa0]">
                      वापस इस मॉडल के <strong>"Connection & Keys"</strong> टैब में आकर दोनों कीज़ पेस्ट कर दें और <strong>"Save Credentials"</strong> दबाएं। ऐप तुरंत आपके लाइव Supabase बैकएंड से जुड़ जाएगी!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#222a3d] bg-[#131b2e]/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#908fa0]">
            <span className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-ping" />
            <span>Supabase Ready: schema.sql generated & saved at root</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
