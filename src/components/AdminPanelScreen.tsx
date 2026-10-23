import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { audioEngine } from '../utils/audioEngine';
import { ManagedUser, Listing, SupportMessage } from '../types';

const PREDEFINED_WARNING_REASONS = [
  'फ़र्ज़ी या गलत कीमत डालना (Fake / Misleading Bait-and-Switch Price)',
  'इंटरनेट से चुराई फ़ोटो या गलत उत्पाद दिखाना (Fake / Stock Photos)',
  'बिना वैध RC / दस्तावेजों के गाड़ी बेचना (Vehicle without valid RC / Paperwork)',
  'अग्रिम पैसे / टोकन फ्रॉड की कोशिश (Suspicious Advance Payment Demand)',
  'चैट में अनुचित व्यवहार या गाली-गलौज (Harassment / Abusive Chat Behavior)',
  'नकली या फर्स्ट-कॉपी सामान को ओरिजिनल बताना (Counterfeit / Replica Product)',
];

export const AdminPanelScreen: React.FC = () => {
  const {
    navigateTo,
    listings,
    shorts,
    showToast,
    openSupabaseModal,
    isAdmin,
    loginAsAdmin,
    logoutAdmin,
    managedUsers,
    banUser,
    unbanUser,
    warnUser,
    setUserReviewStatus,
    listingModerationMap,
    updateListingModerationStatus,
    supportMessages,
    submitSupportMessage,
    updateSupportMessageStatus,
    deleteSupportMessage,
    unreadSupportMessagesCount,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'reels' | 'dealers' | 'audit_log' | 'support_feedback'>('users');
  const [approvedReelIds, setApprovedReelIds] = useState<Set<string>>(new Set());
  const [rejectedReelIds, setRejectedReelIds] = useState<Set<string>>(new Set());

  // Support & Feedback Filter & Search state
  const [supportSearchQuery, setSupportSearchQuery] = useState('');
  const [supportCategoryFilter, setSupportCategoryFilter] = useState<'all' | 'help' | 'contact_support' | 'feedback' | 'bug_report' | 'suggestion'>('all');
  const [supportStatusFilter, setSupportStatusFilter] = useState<'all' | 'unread' | 'read' | 'in_progress' | 'resolved'>('all');
  const [selectedSupportMessage, setSelectedSupportMessage] = useState<SupportMessage | null>(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [isTestMessageModalOpen, setIsTestMessageModalOpen] = useState(false);
  const [testMsgForm, setTestMsgForm] = useState({
    name: 'सतीश शुक्ला (Satish Shukla)',
    phone: '+91 94251 33490',
    email: 'satish.shukla.rewa@gmail.com',
    category: 'feedback' as const,
    subject: 'रीवा में बाइक डिलीवरी व पेमेंट एस्क्रो का सुझाव',
    message: 'ऐप पर रीवा में बहुत तेजी से गाड़ियां बिक रही हैं। अगर आप इसमें रीवा आरटीओ ट्रांसफर गाइड और वेरीफाइड टोकन एस्क्रो जोड़ दें तो यह सबसे भरोसेमंद प्लेटफॉर्म बन जाएगा। शानदार काम!',
    city: 'Rewa',
    rating: 5,
  });

  // User Filter & Search state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'warned' | 'pending_review' | 'banned' | 'dealer'>('all');

  // Listing Filter & Search state
  const [listingSearchQuery, setListingSearchQuery] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'active' | 'pending_review' | 'flagged' | 'rejected'>('all');

  // Selected User for Dossier Modal
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<ManagedUser | null>(null);

  // Warning Modal State
  const [warningModalTargetUser, setWarningModalTargetUser] = useState<ManagedUser | null>(null);
  const [warningTargetListing, setWarningTargetListing] = useState<Listing | null>(null);
  const [selectedWarningReason, setSelectedWarningReason] = useState(PREDEFINED_WARNING_REASONS[0]);
  const [customWarningReason, setCustomWarningReason] = useState('');

  // Gate login form state
  const [gateEmail, setGateEmail] = useState('amritarjun11@gmail.com');
  const [gatePassword, setGatePassword] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    setGateLoading(true);
    try {
      const res = await loginAsAdmin(gateEmail, gatePassword);
      if (!res.success) {
        setGateError(res.message);
      }
    } catch (err: any) {
      setGateError(err.message || 'Login failed.');
    } finally {
      setGateLoading(false);
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return managedUsers.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.phone.includes(userSearchQuery) ||
        user.location.toLowerCase().includes(userSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (userStatusFilter === 'all') return true;
      if (userStatusFilter === 'dealer') return user.role === 'dealer';
      return user.status === userStatusFilter;
    });
  }, [managedUsers, userSearchQuery, userStatusFilter]);

  // Filtered listings list
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const currentMod = listingModerationMap[l.id];
      const status = currentMod?.status || 'active';

      const matchesSearch =
        l.title.toLowerCase().includes(listingSearchQuery.toLowerCase()) ||
        l.seller.name.toLowerCase().includes(listingSearchQuery.toLowerCase()) ||
        l.location.neighborhood.toLowerCase().includes(listingSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (listingStatusFilter === 'all') return true;
      return status === listingStatusFilter;
    });
  }, [listings, listingModerationMap, listingSearchQuery, listingStatusFilter]);

  // All audit log items
  const allAuditLogs = useMemo(() => {
    const logs: {
      userId: string;
      userName: string;
      userEmail: string;
      reason: string;
      timestamp: string;
      issuedBy: string;
      listingTitle?: string;
    }[] = [];

    managedUsers.forEach(u => {
      u.warningsLog.forEach(w => {
        logs.push({
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          reason: w.reason,
          timestamp: w.timestamp,
          issuedBy: w.issuedBy,
          listingTitle: w.listingTitle,
        });
      });
    });

    return logs.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
  }, [managedUsers]);

  // Filtered support messages
  const filteredSupportMessages = useMemo(() => {
    return supportMessages.filter(msg => {
      const q = supportSearchQuery.toLowerCase();
      const matchesSearch =
        msg.name.toLowerCase().includes(q) ||
        (msg.email && msg.email.toLowerCase().includes(q)) ||
        msg.phone.includes(q) ||
        msg.city.toLowerCase().includes(q) ||
        (msg.subject && msg.subject.toLowerCase().includes(q)) ||
        msg.message.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (supportCategoryFilter !== 'all' && msg.category !== supportCategoryFilter) {
        return false;
      }

      if (supportStatusFilter !== 'all' && msg.status !== supportStatusFilter) {
        return false;
      }

      return true;
    });
  }, [supportMessages, supportSearchQuery, supportCategoryFilter, supportStatusFilter]);

  // Support & Feedback metrics
  const feedbackItems = useMemo(
    () => supportMessages.filter(m => m.category === 'feedback' && typeof m.rating === 'number'),
    [supportMessages]
  );
  const avgFeedbackRating = useMemo(() => {
    if (feedbackItems.length === 0) return 5.0;
    const sum = feedbackItems.reduce((acc, cur) => acc + (cur.rating || 5), 0);
    return Number((sum / feedbackItems.length).toFixed(1));
  }, [feedbackItems]);
  const resolvedMessagesCount = supportMessages.filter(m => m.status === 'resolved').length;

  const handleOpenSupportDossier = (msg: SupportMessage) => {
    setSelectedSupportMessage(msg);
    setAdminNotesDraft(msg.adminNotes || '');
    if (msg.status === 'unread') {
      updateSupportMessageStatus(msg.id, 'read');
    }
  };

  const handleSaveAdminNotes = () => {
    if (!selectedSupportMessage) return;
    updateSupportMessageStatus(selectedSupportMessage.id, selectedSupportMessage.status, adminNotesDraft);
    setSelectedSupportMessage(prev => prev ? { ...prev, adminNotes: adminNotesDraft } : null);
    showToast('💾 Admin Resolution Note saved');
  };

  const handleUpdateStatusInModal = (newStatus: SupportMessage['status']) => {
    if (!selectedSupportMessage) return;
    updateSupportMessageStatus(selectedSupportMessage.id, newStatus, adminNotesDraft);
    setSelectedSupportMessage(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleCreateTestSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    submitSupportMessage({
      name: testMsgForm.name,
      phone: testMsgForm.phone,
      email: testMsgForm.email,
      category: testMsgForm.category,
      subject: testMsgForm.subject,
      message: testMsgForm.message,
      city: testMsgForm.city,
      rating: testMsgForm.category === 'feedback' ? testMsgForm.rating : undefined,
    });
    setIsTestMessageModalOpen(false);
    showToast('📥 New Customer Support / Feedback message received in inbox!');
  };

  // Counts for KPIs
  const totalBanned = managedUsers.filter(u => u.status === 'banned').length;
  const totalWarned = managedUsers.filter(u => u.status === 'warned').length;
  const totalPendingUsers = managedUsers.filter(u => u.status === 'pending_review').length;
  const totalPendingListings = Object.values(listingModerationMap).filter(m => m.status === 'pending_review').length;

  const handleOpenWarningModal = (user: ManagedUser, listing?: Listing) => {
    setWarningModalTargetUser(user);
    setWarningTargetListing(listing || null);
    setSelectedWarningReason(PREDEFINED_WARNING_REASONS[0]);
    setCustomWarningReason('');
  };

  const handleConfirmWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningModalTargetUser) return;

    const finalReason = customWarningReason.trim()
      ? customWarningReason.trim()
      : selectedWarningReason;

    warnUser(
      warningModalTargetUser.id,
      finalReason,
      warningTargetListing?.id,
      warningTargetListing?.title
    );

    setWarningModalTargetUser(null);
    setWarningTargetListing(null);
  };

  // If not authenticated as Admin, show the secure access gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex items-center justify-center p-4">
        <div className="bg-[#131b2e] border border-[#2d3449] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] shadow-lg shadow-[#8083ff]/30 mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl font-black">lock</span>
          </div>

          <h2 className="text-lg font-black text-white text-center">
            Restricted Administrator Console
          </h2>
          <p className="text-xs text-[#908fa0] text-center mt-1 mb-5">
            यह क्षेत्र केवल एडमिन (<span className="text-[#4edea3]">amritarjun11@gmail.com</span>) के लिए सुरक्षित है।
          </p>

          {gateError && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-red-400">error</span>
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#c0c1ff] mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={gateEmail}
                onChange={e => setGateEmail(e.target.value)}
                placeholder="amritarjun11@gmail.com"
                required
                className="w-full bg-[#0b1326] border border-[#2d3449] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#8083ff]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#c0c1ff]">
                  Admin Password
                </label>
                <span className="text-[10px] text-[#908fa0]">
                  Default: <code className="text-[#4edea3]">admin123</code>
                </span>
              </div>
              <input
                type="password"
                value={gatePassword}
                onChange={e => setGatePassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full bg-[#0b1326] border border-[#2d3449] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#8083ff]"
              />
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs shadow-lg shadow-[#8083ff]/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {gateLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">vpn_key</span>
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#222a3d] text-center">
            <button
              onClick={() => navigateTo('home')}
              className="text-xs text-[#908fa0] hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to BazaarReels Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleApproveReel = (id: string, title: string) => {
    setApprovedReelIds(prev => new Set(prev).add(id));
    showToast(`✅ Approved Reel: "${title}" published to Rewa feed`);
  };

  const handleRejectReel = (id: string, title: string) => {
    setRejectedReelIds(prev => new Set(prev).add(id));
    showToast(`❌ Rejected Reel: "${title}" returned to seller for correction`);
  };

  const handleSoundTest = () => {
    audioEngine.playEngineSound('bullet');
    showToast('🔊 Playing Bullet 350 Thump Moderation Check');
    setTimeout(() => audioEngine.stop(), 3000);
  };

  return (
    <div className="pb-28 max-w-5xl mx-auto bg-[#0b1326] min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/95 backdrop-blur-md border-b border-[#222a3d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigateTo('profile')}
            className="w-8 h-8 rounded-full bg-[#171f33] text-[#dae2fd] flex items-center justify-center hover:bg-[#222a3d] transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline-sm text-[#dae2fd] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8083ff] text-lg">
                admin_panel_settings
              </span>
              <span>BazaarReels Master Control Console</span>
            </h1>
            <p className="text-[10px] text-[#4edea3]">
              Rewa Trust &amp; Safety Desk • Full Moderation &amp; User Enforcement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#8083ff]/20 text-[#8083ff] font-bold px-2.5 py-1 rounded-full border border-[#8083ff]/30 hidden sm:inline-flex items-center gap-1">
            <span>👑 Amrit Arjun (Master Admin)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
          </span>
          <button
            onClick={logoutAdmin}
            title="Log out from Admin session"
            className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3">
            <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
              Total Users
            </span>
            <span className="text-xl font-black text-[#dae2fd] mt-0.5 block">
              {managedUsers.length}
            </span>
            <span className="text-[10px] text-[#4edea3] font-bold block">
              Rewa Network
            </span>
          </div>

          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3">
            <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">
              {totalPendingUsers + totalPendingListings}
            </span>
            <span className="text-[10px] text-amber-300/80 block">
              {totalPendingUsers} users • {totalPendingListings} ads
            </span>
          </div>

          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3">
            <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
              Warned Users
            </span>
            <span className="text-xl font-black text-orange-400 mt-0.5 block">
              {totalWarned}
            </span>
            <span className="text-[10px] text-orange-300/80 block">
              Active Warnings
            </span>
          </div>

          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3">
            <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
              Banned Accounts
            </span>
            <span className="text-xl font-black text-red-400 mt-0.5 block">
              {totalBanned}
            </span>
            <span className="text-[10px] text-red-300/80 block">
              Restricted
            </span>
          </div>

          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3">
            <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
              Help &amp; Feedback
            </span>
            <span className="text-xl font-black text-[#8083ff] mt-0.5 block flex items-center gap-1">
              <span>{supportMessages.length}</span>
              {unreadSupportMessagesCount > 0 && (
                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold">
                  {unreadSupportMessagesCount} New
                </span>
              )}
            </span>
            <span className="text-[10px] text-[#c0c1ff] block">
              ★ {avgFeedbackRating} Satisfaction
            </span>
          </div>

          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
              Trust Score Avg
            </span>
            <span className="text-xl font-black text-[#4edea3] mt-0.5 block">
              96.2%
            </span>
            <span className="text-[10px] text-[#4edea3] block">
              Zero escrow dispute
            </span>
          </div>
        </div>

        {/* Supabase PostgreSQL Backend & Schema Control */}
        <div className="bg-gradient-to-r from-[#171f33] to-[#122330] border border-[#3ecf8e]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-[#3ecf8e]/5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h3 className="text-xs font-black text-white">Supabase Backend & Database Engine</h3>
              <span className="text-[9px] font-bold bg-[#3ecf8e]/20 text-[#3ecf8e] px-2 py-0.5 rounded-full border border-[#3ecf8e]/40">
                schema.sql Generated
              </span>
            </div>
            <p className="text-[11px] text-[#908fa0]">
              PostgreSQL Users, Moderation, Listings &amp; Realtime WebSockets tables ready for production.
            </p>
          </div>

          <button
            onClick={openSupabaseModal}
            className="px-3 py-1.5 rounded-xl bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-[#0b1326] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <span>⚡ Open Supabase SQL</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#222a3d] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">group</span>
            <span>Users &amp; Sellers Control ({managedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'listings'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            <span>Listings Moderation ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'reels'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">movie</span>
            <span>Reel Approvals ({shorts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dealers')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'dealers'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Dealer Verifications</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit_log'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">history</span>
            <span>Enforcement Audit Log ({allAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support_feedback')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'support_feedback'
                ? 'border-[#8083ff] text-[#8083ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">support_agent</span>
            <span>Help Desk &amp; Customer Feedback ({supportMessages.length})</span>
            {unreadSupportMessagesCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full animate-pulse">
                {unreadSupportMessagesCount} New
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: USERS & SELLERS CONTROL (यूज़र नियंत्रण व निगरानी) */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {/* Search and Filters bar */}
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2.5 justify-between">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#908fa0]">
                  search
                </span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone, location..."
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Users' },
                  { id: 'active', label: 'Active 🟢' },
                  { id: 'warned', label: 'Warned ⚠️' },
                  { id: 'pending_review', label: 'Pending 🟡' },
                  { id: 'banned', label: 'Banned 🚫' },
                  { id: 'dealer', label: 'Dealers 🏢' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setUserStatusFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      userStatusFilter === tab.id
                        ? 'bg-[#8083ff] text-[#0b1326]'
                        : 'bg-[#131b2e] text-[#908fa0] hover:text-[#dae2fd] border border-[#2d3449]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users List Cards */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-[#171f33] border border-[#2d3449] rounded-2xl">
                <span className="material-symbols-outlined text-3xl text-[#908fa0] mb-2">
                  person_off
                </span>
                <p className="text-xs text-[#908fa0]">No users found matching your filter or query.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => {
                  const isBanned = user.status === 'banned';
                  const isWarned = user.status === 'warned';
                  const isPending = user.status === 'pending_review';

                  return (
                    <div
                      key={user.id}
                      className={`bg-[#171f33] border rounded-2xl p-4 transition-all ${
                        isBanned
                          ? 'border-red-500/50 bg-red-950/10'
                          : isWarned
                          ? 'border-orange-500/50 bg-orange-950/10'
                          : isPending
                          ? 'border-amber-500/40 bg-amber-950/10'
                          : 'border-[#2d3449]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* User Identity info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className={`w-12 h-12 rounded-full object-cover border-2 ${
                                isBanned
                                  ? 'border-red-500 opacity-60'
                                  : isWarned
                                  ? 'border-orange-400'
                                  : 'border-[#8083ff]'
                              }`}
                            />
                            {isBanned && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full text-red-400 text-xs font-black">
                                ✕
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-xs font-extrabold text-[#dae2fd] truncate">
                                {user.name}
                              </h3>
                              {user.kycVerified && (
                                <span className="material-symbols-outlined text-xs text-[#4edea3]" title="KYC Verified">
                                  verified
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#131b2e] text-[#8083ff] border border-[#2d3449]">
                                {user.role}
                              </span>

                              {/* Status Badge */}
                              {isBanned ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                                  <span>🚫 BANNED</span>
                                </span>
                              ) : isWarned ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1">
                                  <span>⚠️ WARNED ({user.warningsCount}/3)</span>
                                </span>
                              ) : isPending ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                  <span>🟡 PENDING REVIEW</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00885d]/20 text-[#4edea3] border border-[#00885d]/40 flex items-center gap-1">
                                  <span>🟢 ACTIVE</span>
                                </span>
                              )}
                            </div>

                            {/* Contact Details Rail */}
                            <div className="flex items-center gap-3 text-[11px] text-[#908fa0] mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-[#dae2fd]/80">
                                <span className="material-symbols-outlined text-xs text-[#8083ff]">mail</span>
                                {user.email}
                              </span>
                              <span className="flex items-center gap-1 text-[#dae2fd]/80">
                                <span className="material-symbols-outlined text-xs text-[#4edea3]">call</span>
                                {user.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {user.location}
                              </span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-[10px] text-[#908fa0] mt-1.5 flex-wrap">
                              <span>Joined: <strong className="text-white">{user.joinedDate}</strong></span>
                              <span>•</span>
                              <span>Ads: <strong className="text-[#8083ff]">{user.activeListings} active</strong> / {user.totalListings} total</span>
                              <span>•</span>
                              <span>Trust Score: <strong className="text-[#4edea3]">{user.trustScore}%</strong></span>
                              <span>•</span>
                              <span>Last active: {user.lastActive}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center flex-wrap">
                          {/* Dossier button */}
                          <button
                            onClick={() => setSelectedUserForDetails(user)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-bold text-[#c0c1ff] flex items-center gap-1 transition-colors"
                            title="View complete user dossier and warning history"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            <span>Details</span>
                          </button>

                          {/* Warning Button */}
                          <button
                            onClick={() => handleOpenWarningModal(user)}
                            className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Issue official warning to user"
                          >
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>Warn</span>
                          </button>

                          {/* Pending Review toggle */}
                          {user.status === 'pending_review' ? (
                            <button
                              onClick={() => setUserReviewStatus(user.id, 'active')}
                              className="px-2.5 py-1.5 rounded-xl bg-[#00885d]/20 hover:bg-[#00885d]/30 text-[#4edea3] border border-[#00885d]/40 text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Approve user to active state"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Approve</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setUserReviewStatus(user.id, 'pending_review')}
                              className="px-2 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-[#908fa0] text-xs font-bold transition-colors"
                              title="Set user to pending review"
                            >
                              Hold
                            </button>
                          )}

                          {/* Ban / Unban Button */}
                          {isBanned ? (
                            <button
                              onClick={() => unbanUser(user.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black flex items-center gap-1 shadow transition-transform active:scale-95"
                              title="Lift ban and restore user"
                            >
                              <span className="material-symbols-outlined text-sm">lock_open</span>
                              <span>Unban</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to BAN ${user.name}? They will be blocked from posting and messaging.`)) {
                                  banUser(user.id, 'Manually banned by Administrator Amrit Arjun');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                              title="Permanently ban this user"
                            >
                              <span className="material-symbols-outlined text-sm">block</span>
                              <span>Ban</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Warnings mini log if any */}
                      {user.warningsLog.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#222a3d] text-[11px] space-y-1">
                          <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">
                            Recent Warnings Log ({user.warningsLog.length}):
                          </span>
                          {user.warningsLog.slice(0, 2).map((w, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-orange-200/80 bg-orange-950/20 px-2.5 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-xs text-orange-400">report</span>
                              <span className="flex-1 truncate">"{w.reason}"</span>
                              <span className="text-[9px] text-[#908fa0]">{w.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LISTINGS MODERATION & WARNINGS (विज्ञापनों की जांच) */}
        {/* ============================================================== */}
        {activeTab === 'listings' && (
          <div className="space-y-3">
            {/* Filter & Search Bar */}
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2.5 justify-between">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#908fa0]">
                  search
                </span>
                <input
                  type="text"
                  value={listingSearchQuery}
                  onChange={e => setListingSearchQuery(e.target.value)}
                  placeholder="Search ads by title, seller, area..."
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Ads' },
                  { id: 'active', label: 'Active / Live 🟢' },
                  { id: 'pending_review', label: 'Pending Review 🟡' },
                  { id: 'flagged', label: 'Flagged / Warned ⚠️' },
                  { id: 'rejected', label: 'Rejected ❌' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setListingStatusFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      listingStatusFilter === tab.id
                        ? 'bg-[#8083ff] text-[#0b1326]'
                        : 'bg-[#131b2e] text-[#908fa0] hover:text-[#dae2fd] border border-[#2d3449]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listings Grid / List */}
            <div className="space-y-3">
              {filteredListings.map(l => {
                const modStatus = listingModerationMap[l.id]?.status || 'active';
                const rejectionReason = listingModerationMap[l.id]?.rejectionReason;

                return (
                  <div
                    key={l.id}
                    className={`bg-[#171f33] border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${
                      modStatus === 'pending_review'
                        ? 'border-amber-400/50 bg-amber-950/10'
                        : modStatus === 'flagged'
                        ? 'border-orange-500/50 bg-orange-950/10'
                        : modStatus === 'rejected'
                        ? 'border-red-500/50 bg-red-950/10'
                        : 'border-[#2d3449]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={l.images[0]}
                        alt={l.title}
                        className="w-16 h-16 rounded-xl object-cover border border-[#2d3449] shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-[#dae2fd] truncate">
                            {l.title}
                          </h4>
                          <span className="text-xs font-black text-[#4edea3]">
                            ₹{l.price.toLocaleString()}
                          </span>

                          {/* Moderation Badge */}
                          {modStatus === 'active' && (
                            <span className="text-[10px] bg-[#00885d]/30 text-[#4edea3] font-bold px-2 py-0.5 rounded border border-[#00885d]/40">
                              Active &amp; Verified
                            </span>
                          )}
                          {modStatus === 'pending_review' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                              🟡 Pending Review
                            </span>
                          )}
                          {modStatus === 'flagged' && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded border border-orange-500/40">
                              ⚠️ Warning Issued
                            </span>
                          )}
                          {modStatus === 'rejected' && (
                            <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded border border-red-500/40">
                              ❌ Rejected / Removed
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#908fa0] mt-0.5">
                          {l.categoryName} • {l.location.neighborhood} • Seller: <strong className="text-white">{l.seller.name}</strong> ({l.seller.phone})
                        </p>

                        {rejectionReason && (
                          <p className="text-[10px] text-amber-300/90 mt-1 italic bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">
                            Reason: "{rejectionReason}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Moderation Actions for Listing */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center flex-wrap">
                      {/* Approve button */}
                      <button
                        onClick={() => updateListingModerationStatus(l.id, 'active')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          modStatus === 'active'
                            ? 'bg-[#00885d]/20 text-[#4edea3] border border-[#00885d]/30'
                            : 'bg-emerald-500 text-black font-black hover:bg-emerald-400'
                        }`}
                        title="Mark as approved and live"
                      >
                        Approve Live
                      </button>

                      {/* Put on Pending */}
                      <button
                        onClick={() => updateListingModerationStatus(l.id, 'pending_review', 'Under manual inspection by admin')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          modStatus === 'pending_review'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-[#222a3d] hover:bg-[#2d3449] text-amber-300'
                        }`}
                        title="Put ad on Pending review"
                      >
                        Put Pending
                      </button>

                      {/* Warn Seller */}
                      <button
                        onClick={() => {
                          const sellerUser = managedUsers.find(u => u.phone === l.seller.phone || u.name === l.seller.name) || {
                            id: `user_seller_${l.seller.id}`,
                            name: l.seller.name,
                            email: 'seller@rewa.bazaar',
                            phone: l.seller.phone,
                            role: 'seller' as const,
                            location: l.location.neighborhood,
                            avatar: l.seller.avatar,
                            joinedDate: l.seller.memberSince,
                            trustScore: l.seller.trustScore,
                            rating: l.seller.rating,
                            totalListings: l.seller.activeAdsCount,
                            activeListings: l.seller.activeAdsCount,
                            status: 'active' as const,
                            warningsCount: 0,
                            warningsLog: [],
                            kycVerified: l.seller.verified,
                            lastActive: 'Active',
                          };
                          handleOpenWarningModal(sellerUser, l);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-black border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1"
                        title="Give warning to seller regarding this listing"
                      >
                        <span className="material-symbols-outlined text-xs">report_problem</span>
                        <span>Warn Seller</span>
                      </button>

                      {/* Reject button */}
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason for seller:', 'Violates image or price guidelines.');
                          if (reason) {
                            updateListingModerationStatus(l.id, 'rejected', reason);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition-colors"
                        title="Reject and hide listing"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: REELS MODERATION */}
        {/* ============================================================== */}
        {activeTab === 'reels' && (
          <div className="space-y-3">
            {shorts.map(reel => {
              const isApproved = approvedReelIds.has(reel.id);
              const isRejected = rejectedReelIds.has(reel.id);

              return (
                <div
                  key={reel.id}
                  className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-22 rounded-xl overflow-hidden bg-black shrink-0 border border-[#2d3449]">
                      <img
                        src={reel.thumbnailUrl}
                        alt={reel.listingTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] px-1 rounded font-bold">
                        0:{reel.durationSec}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#dae2fd]">
                          {reel.listingTitle}
                        </span>
                        <span className="text-[10px] text-[#4edea3] font-black">
                          ₹{reel.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#908fa0] mt-0.5">
                        Posted by {reel.sellerName} ({reel.location})
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={handleSoundTest}
                          className="px-2 py-0.5 rounded bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">volume_up</span>
                          <span>Sound Check</span>
                        </button>
                        <span className="text-[10px] text-[#4edea3] flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          <span>Audio Valid</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isApproved ? (
                      <span className="text-xs font-bold text-[#4edea3] bg-[#00885d]/30 px-3 py-1.5 rounded-xl border border-[#4edea3]/40">
                        ✓ Approved Live
                      </span>
                    ) : isRejected ? (
                      <span className="text-xs font-bold text-[#ffb4ab] bg-[#ba1a1a]/30 px-3 py-1.5 rounded-xl border border-[#ffb4ab]/40">
                        ✕ Flagged / Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRejectReel(reel.id, reel.listingTitle)}
                          className="px-3 py-2 rounded-xl bg-[#222a3d] hover:bg-[#ffb4ab]/20 text-[#ffb4ab] text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveReel(reel.id, reel.listingTitle)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black shadow transition-transform active:scale-95"
                        >
                          Approve Video
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: DEALERS VERIFICATIONS */}
        {/* ============================================================== */}
        {activeTab === 'dealers' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Pending Dealership Applications (Rewa District)
            </h3>

            <div className="p-3 bg-[#131b2e] rounded-xl border border-[#2d3449] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#dae2fd]">
                  Shree Ram Motors (Saman Naka, Rewa)
                </h4>
                <p className="text-[10px] text-[#908fa0]">
                  GSTIN: 23AABCR1234F1Z9 • 15 Pre-owned 4-wheelers • Aadhaar Verified
                </p>
              </div>
              <button
                onClick={() => showToast('✅ Dealership verified with Aadhaar + GST match')}
                className="px-3 py-1.5 rounded-xl bg-[#8083ff] text-[#0b1326] text-xs font-black"
              >
                Verify Store
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: ENFORCEMENT AUDIT LOG (कार्रवाई इतिहास) */}
        {/* ============================================================== */}
        {activeTab === 'audit_log' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#222a3d]">
              <div>
                <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
                  Platform Moderation &amp; Enforcement History
                </h3>
                <p className="text-[11px] text-[#908fa0]">
                  Detailed log of warnings, ad flags, and bans issued by administrator.
                </p>
              </div>
              <span className="text-xs text-[#8083ff] font-bold">
                {allAuditLogs.length} Total Incidents
              </span>
            </div>

            {allAuditLogs.length === 0 ? (
              <p className="text-xs text-[#908fa0] text-center py-6">No enforcement logs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {allAuditLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#131b2e] border border-[#2d3449] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Target: {log.userName}
                        </span>
                        <span className="text-[10px] text-[#8083ff]">({log.userEmail})</span>
                      </div>
                      <p className="text-xs text-orange-300 mt-0.5">
                        Violation: "{log.reason}"
                      </p>
                      {log.listingTitle && (
                        <p className="text-[10px] text-[#908fa0] mt-0.5">
                          Referenced Listing: {log.listingTitle}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[10px] text-[#908fa0] shrink-0">
                      <span>Issued by: <strong className="text-[#4edea3]">{log.issuedBy}</strong></span>
                      <span className="block">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: CUSTOMER HELP DESK & FEEDBACK MANAGEMENT                */}
        {/* ============================================================== */}
        {activeTab === 'support_feedback' && (
          <div className="space-y-4">
            {/* Top Stats Banner */}
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center border border-[#8083ff]/30">
                    <span className="material-symbols-outlined text-xl">support_agent</span>
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                      <span>कस्टमर सपोर्ट डेस्क व ग्राहक फीडबैक (Help &amp; Customer Feedback)</span>
                      <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-2 py-0.5 rounded-full border border-[#4edea3]/40">
                        Live Central Desk
                      </span>
                    </h2>
                    <p className="text-[11px] text-[#908fa0]">
                      ग्राहकों के ईमेल, सहायता संदेश, बग रिपोर्ट्स व सुझाव पढ़कर सेवा को और बेहतर बनाएं।
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsTestMessageModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs shadow-md shadow-[#8083ff]/20 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-bold">add_comment</span>
                  <span>+ टेस्ट फीडबैक / सहायता दर्ज करें</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Sub-cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#131b2e] border border-[#242e45] rounded-xl p-3">
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">Unread Inquiries</span>
                <span className="text-lg font-black text-red-400 mt-0.5 block flex items-center gap-1.5">
                  <span>{unreadSupportMessagesCount}</span>
                  {unreadSupportMessagesCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                </span>
                <span className="text-[10px] text-red-300/80">लंबित ग्राहक संदेश</span>
              </div>

              <div className="bg-[#131b2e] border border-[#242e45] rounded-xl p-3">
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">Customer Satisfaction</span>
                <span className="text-lg font-black text-amber-400 mt-0.5 block">
                  ★ {avgFeedbackRating} / 5.0
                </span>
                <span className="text-[10px] text-amber-300/80">{feedbackItems.length} ग्राहक रेटिंग्स से</span>
              </div>

              <div className="bg-[#131b2e] border border-[#242e45] rounded-xl p-3">
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">Resolved Cases</span>
                <span className="text-lg font-black text-[#4edea3] mt-0.5 block">
                  {resolvedMessagesCount}
                </span>
                <span className="text-[10px] text-[#4edea3]/80">
                  {supportMessages.length > 0 ? Math.round((resolvedMessagesCount / supportMessages.length) * 100) : 0}% समाधान दर
                </span>
              </div>

              <div className="bg-[#131b2e] border border-[#242e45] rounded-xl p-3">
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">Total Logged Tickets</span>
                <span className="text-lg font-black text-[#dae2fd] mt-0.5 block">
                  {supportMessages.length}
                </span>
                <span className="text-[10px] text-[#908fa0]">रीवा, सतना व विंध्य क्षेत्र</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 justify-between">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#908fa0]">
                  search
                </span>
                <input
                  type="text"
                  value={supportSearchQuery}
                  onChange={e => setSupportSearchQuery(e.target.value)}
                  placeholder="नाम, फ़ोन, ईमेल, शहर या संदेश खोजें..."
                  className="w-full bg-[#0b1326] border border-[#2d3449] rounded-xl pl-9 pr-3 py-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                {/* Category Filter */}
                <select
                  value={supportCategoryFilter}
                  onChange={e => setSupportCategoryFilter(e.target.value as any)}
                  className="bg-[#0b1326] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                >
                  <option value="all">सभी श्रेणियाँ (All Categories)</option>
                  <option value="help">हेल्प व सहायता (Help Desk)</option>
                  <option value="contact_support">कस्टमर सपोर्ट (Support Inquiries)</option>
                  <option value="feedback">ग्राहक फीडबैक (Feedback & Reviews)</option>
                  <option value="bug_report">तकनीकी समस्या (Bug Reports)</option>
                  <option value="suggestion">सुझाव (Improvement Suggestions)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={supportStatusFilter}
                  onChange={e => setSupportStatusFilter(e.target.value as any)}
                  className="bg-[#0b1326] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                >
                  <option value="all">सभी स्थितियाँ (All Statuses)</option>
                  <option value="unread">नया / अपठित (Unread)</option>
                  <option value="read">देखा गया (Read)</option>
                  <option value="in_progress">प्रक्रिया जारी (In Progress)</option>
                  <option value="resolved">समाधान पूर्ण (Resolved)</option>
                </select>
              </div>
            </div>

            {/* Support Messages List */}
            {filteredSupportMessages.length === 0 ? (
              <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-8 text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-[#908fa0]">inbox</span>
                <p className="text-sm font-bold text-white">कोई संदेश या फीडबैक नहीं मिला</p>
                <p className="text-xs text-[#908fa0]">
                  आपके द्वारा चुने गए फ़िल्टर से संबंधित कोई डेटा उपलब्ध नहीं है।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSupportMessages.map(msg => {
                  const isUnread = msg.status === 'unread';
                  const isResolved = msg.status === 'resolved';
                  const isInProgress = msg.status === 'in_progress';

                  return (
                    <div
                      key={msg.id}
                      className={`bg-[#171f33] border rounded-2xl p-4 transition-all hover:border-[#8083ff]/50 ${
                        isUnread
                          ? 'border-red-500/50 bg-gradient-to-r from-[#171f33] to-[#1a1c35]'
                          : isResolved
                          ? 'border-[#2d3449] opacity-85'
                          : 'border-[#2d3449]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8083ff]/20 to-[#4edea3]/20 border border-[#8083ff]/30 text-[#8083ff] flex items-center justify-center font-black text-sm shrink-0">
                            {msg.name ? msg.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-white">{msg.name}</h3>
                              <span className="text-[10px] text-[#908fa0] font-mono bg-[#0b1326] px-2 py-0.5 rounded-lg border border-[#242e45]">
                                📍 {msg.city}
                              </span>
                              {msg.userRole && (
                                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold bg-[#8083ff]/10 text-[#8083ff] border border-[#8083ff]/20">
                                  {msg.userRole}
                                </span>
                              )}
                              {/* Category Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  msg.category === 'feedback'
                                    ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30'
                                    : msg.category === 'bug_report'
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                    : msg.category === 'suggestion'
                                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                    : 'bg-[#8083ff]/10 text-[#8083ff] border-[#8083ff]/30'
                                }`}
                              >
                                {msg.category === 'feedback'
                                  ? 'फ़ीडबैक'
                                  : msg.category === 'bug_report'
                                  ? 'बग रिपोर्ट'
                                  : msg.category === 'suggestion'
                                  ? 'सुझाव'
                                  : 'सहायता / संपर्क'}
                              </span>

                              {/* Star Rating if present */}
                              {typeof msg.rating === 'number' && (
                                <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                  {'★'.repeat(msg.rating)} ({msg.rating}/5)
                                </span>
                              )}
                            </div>

                            {/* Contact Details Line */}
                            <div className="flex items-center gap-3 text-xs text-[#908fa0] mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-[#dae2fd]">
                                <span className="material-symbols-outlined text-xs text-[#4edea3]">call</span>
                                <span>{msg.phone}</span>
                              </span>
                              {msg.email && (
                                <span className="flex items-center gap-1 text-[#c0c1ff]">
                                  <span className="material-symbols-outlined text-xs">mail</span>
                                  <span>{msg.email}</span>
                                </span>
                              )}
                              <span className="text-[11px] text-[#6b7280]">⏰ {msg.timestamp}</span>
                            </div>

                            {/* Subject */}
                            {msg.subject && (
                              <h4 className="text-xs font-bold text-[#dae2fd] mt-2">
                                विषय: {msg.subject}
                              </h4>
                            )}

                            {/* Message Body */}
                            <p className="text-xs text-[#cbd5e1] mt-1.5 leading-relaxed bg-[#0b1326]/60 p-3 rounded-xl border border-[#242e45]">
                              "{msg.message}"
                            </p>

                            {/* Admin Notes if present */}
                            {msg.adminNotes && (
                              <div className="mt-2 text-xs bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-300 flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-emerald-400 shrink-0">edit_note</span>
                                <div>
                                  <span className="font-bold text-[11px] block">एडमिन समाधान नोट (Resolution Note):</span>
                                  <span>{msg.adminNotes}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions Column */}
                        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#242e45]">
                          {/* Status Badge */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                                isUnread
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                                  : isInProgress
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : isResolved
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-[#222a3d] text-[#908fa0] border-[#2d3449]'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>
                                {isUnread
                                  ? 'नया संदेश (Unread)'
                                  : isInProgress
                                  ? 'समाधान जारी (In Progress)'
                                  : isResolved
                                  ? 'समाधान पूर्ण (Resolved)'
                                  : 'देखा गया (Read)'}
                              </span>
                            </span>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenSupportDossier(msg)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#8083ff]/20 hover:bg-[#8083ff]/30 text-[#8083ff] border border-[#8083ff]/30 text-xs font-bold transition-all flex items-center gap-1"
                              title="पूरा विवरण देखें व समाधान नोट लिखें"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>विवरण / उत्तर</span>
                            </button>

                            <button
                              onClick={() => {
                                const cleanPhone = msg.phone.replace(/[^0-9]/g, '');
                                window.open(`https://wa.me/${cleanPhone}?text=Namaste%20${encodeURIComponent(msg.name)}%2C%20BazaarReels%20Rewa%20Support%20team%20here.`, '_blank');
                              }}
                              className="w-8 h-8 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 flex items-center justify-center transition-colors"
                              title="WhatsApp पर ग्राहक से चैट करें"
                            >
                              <span className="material-symbols-outlined text-sm">chat</span>
                            </button>

                            {msg.email && (
                              <button
                                onClick={() => {
                                  window.open(`mailto:${msg.email}?subject=Regarding%20your%20BazaarReels%20query&body=Namaste%20${encodeURIComponent(msg.name)}%2C`, '_blank');
                                }}
                                className="w-8 h-8 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center transition-colors"
                                title="ईमेल भेजें"
                              >
                                <span className="material-symbols-outlined text-sm">mail</span>
                              </button>
                            )}

                            {msg.status !== 'resolved' ? (
                              <button
                                onClick={() => updateSupportMessageStatus(msg.id, 'resolved', 'एडमिन द्वारा समस्या का समाधान किया गया।')}
                                className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center transition-colors"
                                title="Mark as Resolved"
                              >
                                <span className="material-symbols-outlined text-sm">check</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => updateSupportMessageStatus(msg.id, 'in_progress')}
                                className="w-8 h-8 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center transition-colors"
                                title="Reopen / In Progress"
                              >
                                <span className="material-symbols-outlined text-sm">replay</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`संदेश हटाएं? (${msg.name})`)) {
                                  deleteSupportMessage(msg.id);
                                }
                              }}
                              className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors"
                              title="हटाएं"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: WARNING ISSUANCE MODAL (चेतावनी देने का मॉडल) */}
      {/* ============================================================== */}
      {warningModalTargetUser && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in"
          onClick={() => setWarningModalTargetUser(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0b1326] border border-[#2d3449] rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#222a3d] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                  <span className="material-symbols-outlined text-xl">warning</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#dae2fd]">
                    Issue Official Warning to User
                  </h3>
                  <p className="text-xs text-[#908fa0]">
                    {warningModalTargetUser.name} ({warningModalTargetUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWarningModalTargetUser(null)}
                className="w-8 h-8 rounded-full bg-[#171f33] text-[#dae2fd] flex items-center justify-center hover:bg-[#222a3d]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Warning strike counter info */}
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs text-orange-300 flex items-center justify-between">
              <span>
                Current Warning Count: <strong>{warningModalTargetUser.warningsCount} of 3</strong>
              </span>
              <span className="text-[10px] text-orange-200">
                (At 3 warnings, user is automatically banned)
              </span>
            </div>

            <form onSubmit={handleConfirmWarning} className="space-y-3.5">
              {warningTargetListing && (
                <div className="p-2.5 bg-[#131b2e] border border-[#2d3449] rounded-xl text-xs">
                  <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                    Referenced Listing Ad:
                  </span>
                  <span className="font-bold text-white">{warningTargetListing.title}</span>
                  <span className="text-[#4edea3] block">₹{warningTargetListing.price.toLocaleString()}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#c0c1ff] mb-1.5">
                  Select Violation Category:
                </label>
                <div className="space-y-1.5">
                  {PREDEFINED_WARNING_REASONS.map((reason, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedWarningReason === reason
                          ? 'border-orange-500 bg-orange-500/15 text-white font-bold'
                          : 'border-[#2d3449] bg-[#131b2e] text-[#908fa0] hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="warningReason"
                        checked={selectedWarningReason === reason}
                        onChange={() => setSelectedWarningReason(reason)}
                        className="accent-orange-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#c0c1ff] mb-1">
                  Or Custom Specific Reason / Note for Seller:
                </label>
                <textarea
                  rows={2}
                  value={customWarningReason}
                  onChange={e => setCustomWarningReason(e.target.value)}
                  placeholder="e.g. Please update photos with actual bike RC and remove duplicate listing."
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="pt-2 border-t border-[#222a3d] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWarningModalTargetUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#171f33] text-xs font-bold text-[#dae2fd]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-black shadow transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-bold">send</span>
                  <span>Issue Warning Strike</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: USER DETAILS DOSSIER MODAL (पूरी जानकारी देखें) */}
      {/* ============================================================== */}
      {selectedUserForDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in"
          onClick={() => setSelectedUserForDetails(null)}
        >
          <div
            className="w-full max-w-xl bg-[#0b1326] border border-[#2d3449] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222a3d] pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForDetails.avatar}
                  alt={selectedUserForDetails.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#8083ff]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {selectedUserForDetails.name}
                    </h3>
                    {selectedUserForDetails.kycVerified && (
                      <span className="text-[10px] bg-[#00885d]/30 text-[#4edea3] font-bold px-2 py-0.5 rounded border border-[#00885d]/40">
                        Aadhaar Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#908fa0]">
                    ID: {selectedUserForDetails.id} • Role: <strong className="uppercase text-[#8083ff]">{selectedUserForDetails.role}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="w-8 h-8 rounded-full bg-[#171f33] text-[#dae2fd] flex items-center justify-center hover:bg-[#222a3d]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Profile Field Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#131b2e] p-3.5 rounded-2xl border border-[#2d3449]">
              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-white font-bold block">{selectedUserForDetails.email}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="text-[#4edea3] font-bold block">{selectedUserForDetails.phone}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                  City / Location
                </span>
                <span className="text-white font-bold block">{selectedUserForDetails.location}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="font-black uppercase text-amber-300 block">
                  {selectedUserForDetails.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                  Joined Platform
                </span>
                <span className="text-white block">{selectedUserForDetails.joinedDate}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">
                  Trust Score &amp; Rating
                </span>
                <span className="text-white block">
                  ⭐ {selectedUserForDetails.rating} ({selectedUserForDetails.trustScore}% Score)
                </span>
              </div>
            </div>

            {/* Internal Admin Notes */}
            {selectedUserForDetails.notes && (
              <div className="p-3 bg-[#171f33] border border-[#2d3449] rounded-xl text-xs">
                <span className="text-[10px] font-bold text-[#8083ff] uppercase tracking-wider block mb-0.5">
                  Internal Administrative Note:
                </span>
                <p className="text-[#c7c4d7] italic">"{selectedUserForDetails.notes}"</p>
              </div>
            )}

            {/* Warning History Log */}
            <div>
              <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Violation &amp; Warning Log ({selectedUserForDetails.warningsLog.length})</span>
                <span className="text-[10px] text-orange-400 font-bold">
                  {selectedUserForDetails.warningsCount} Strikes Total
                </span>
              </h4>

              {selectedUserForDetails.warningsLog.length === 0 ? (
                <p className="text-[11px] text-[#4edea3] bg-[#00885d]/10 border border-[#00885d]/30 p-2.5 rounded-xl">
                  ✓ Clean record: No policy violations or user complaints on this account.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedUserForDetails.warningsLog.map((w, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-orange-950/20 border border-orange-500/30 rounded-xl text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-300">Strike #{i + 1}</span>
                        <span className="text-[9px] text-[#908fa0]">{w.timestamp}</span>
                      </div>
                      <p className="text-white mt-1">"{w.reason}"</p>
                      {w.listingTitle && (
                        <p className="text-[10px] text-[#908fa0] mt-0.5">
                          Ad: {w.listingTitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-[#222a3d] flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={() => {
                  handleOpenWarningModal(selectedUserForDetails);
                }}
                className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-black border border-orange-500/40 text-xs font-bold transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Send Warning</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedUserForDetails.status === 'banned' ? (
                  <button
                    onClick={() => {
                      unbanUser(selectedUserForDetails.id);
                      setSelectedUserForDetails({ ...selectedUserForDetails, status: 'active' });
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-black shadow"
                  >
                    Unban User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm(`Ban user ${selectedUserForDetails.name}?`)) {
                        banUser(selectedUserForDetails.id, 'Banned from User Dossier Modal');
                        setSelectedUserForDetails({ ...selectedUserForDetails, status: 'banned' });
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black shadow"
                  >
                    Ban User
                  </button>
                )}

                <button
                  onClick={() => setSelectedUserForDetails(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#171f33] text-xs font-bold text-[#dae2fd]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: SUPPORT MESSAGE & FEEDBACK DOSSIER (विस्तृत ग्राहक टिकट) */}
      {/* ============================================================== */}
      {selectedSupportMessage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in"
          onClick={() => setSelectedSupportMessage(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#0b1326] border border-[#2d3449] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222a3d] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8083ff]/20 to-[#4edea3]/20 border border-[#8083ff]/40 text-[#8083ff] flex items-center justify-center font-black text-lg">
                  {selectedSupportMessage.name ? selectedSupportMessage.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white">
                      {selectedSupportMessage.name}
                    </h3>
                    <span className="text-[10px] bg-[#0b1326] text-[#4edea3] font-bold px-2 py-0.5 rounded-lg border border-[#242e45]">
                      📍 {selectedSupportMessage.city}
                    </span>
                    {typeof selectedSupportMessage.rating === 'number' && (
                      <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {'★'.repeat(selectedSupportMessage.rating)} ({selectedSupportMessage.rating}/5)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#908fa0]">
                    टिकट ID: <code className="text-[#c0c1ff] font-mono">{selectedSupportMessage.id}</code> • {selectedSupportMessage.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSupportMessage(null)}
                className="w-8 h-8 rounded-full bg-[#171f33] text-[#dae2fd] flex items-center justify-center hover:bg-[#222a3d]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Customer Contact & Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#131b2e] p-3 rounded-2xl border border-[#2d3449] text-xs">
              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">फ़ोन नंबर</span>
                <a
                  href={`tel:${selectedSupportMessage.phone}`}
                  className="font-bold text-[#4edea3] hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span className="material-symbols-outlined text-xs">call</span>
                  <span>{selectedSupportMessage.phone}</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">ईमेल पता</span>
                {selectedSupportMessage.email ? (
                  <a
                    href={`mailto:${selectedSupportMessage.email}`}
                    className="font-bold text-[#c0c1ff] hover:underline flex items-center gap-1 mt-0.5 truncate"
                  >
                    <span className="material-symbols-outlined text-xs">mail</span>
                    <span className="truncate">{selectedSupportMessage.email}</span>
                  </a>
                ) : (
                  <span className="text-[#908fa0] mt-0.5 block">उपलब्ध नहीं</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-[#908fa0] uppercase tracking-wider block">श्रेणी / भूमिका</span>
                <span className="font-bold text-white capitalize mt-0.5 block">
                  {selectedSupportMessage.category.replace('_', ' ')} • {selectedSupportMessage.userRole || 'User'}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              {selectedSupportMessage.subject && (
                <div className="text-xs font-bold text-[#8083ff] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">subject</span>
                  <span>विषय: {selectedSupportMessage.subject}</span>
                </div>
              )}
              <div className="bg-[#0b1326] p-4 rounded-2xl border border-[#242e45] text-xs text-[#e2e8f0] leading-relaxed">
                "{selectedSupportMessage.message}"
              </div>
            </div>

            {/* Status Change Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#dae2fd] block">
                स्थिति अपडेट करें (Update Ticket Status):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['unread', 'read', 'in_progress', 'resolved'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatusInModal(st)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      selectedSupportMessage.status === st
                        ? st === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                          : st === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                          : st === 'unread'
                          ? 'bg-red-500/20 text-red-300 border-red-500 shadow-sm'
                          : 'bg-[#8083ff]/20 text-[#8083ff] border-[#8083ff] shadow-sm'
                        : 'bg-[#131b2e] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd]'
                    }`}
                  >
                    <span>
                      {st === 'unread'
                        ? 'नया (Unread)'
                        : st === 'read'
                        ? 'देखा गया (Read)'
                        : st === 'in_progress'
                        ? 'प्रक्रिया जारी'
                        : 'समाधान संपन्न'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Admin Resolution Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#dae2fd] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#4edea3]">note_alt</span>
                  <span>एडमिन समाधान नोट (Internal Resolution Notes):</span>
                </label>
                <span className="text-[10px] text-[#908fa0]">केवल एडमिन को दिखाई देगा</span>
              </div>
              <textarea
                value={adminNotesDraft}
                onChange={e => setAdminNotesDraft(e.target.value)}
                placeholder="यहाँ लिखें कि इस ग्राहक की समस्या का क्या समाधान किया गया, क्या बातचीत हुई या क्या एक्शन लिया गया..."
                rows={3}
                className="w-full bg-[#0b1326] border border-[#2d3449] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#8083ff]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAdminNotes}
                  className="px-3 py-1.5 rounded-xl bg-[#8083ff] text-[#0b1326] text-xs font-black flex items-center gap-1 hover:opacity-95"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>नोट सुरक्षित करें</span>
                </button>
              </div>
            </div>

            {/* One-Click Quick Response / Reply Actions */}
            <div className="p-3.5 bg-[#131b2e] rounded-2xl border border-[#2d3449] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#dae2fd] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#8083ff]">reply_all</span>
                  <span>त्वरित ग्राहक संपर्क (Quick Customer Response):</span>
                </span>
                <span className="text-[10px] text-[#908fa0]">क्लिक करके सीधे जवाब भेजें</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const cleanPhone = selectedSupportMessage.phone.replace(/[^0-9]/g, '');
                    const text = encodeURIComponent(
                      `नमस्ते ${selectedSupportMessage.name} जी! रीवा बाज़ार सपोर्ट टीम द्वारा आपका अनुरोध ("${selectedSupportMessage.subject || 'सहायता'}") प्राप्त हो गया है। हम आपकी पूरी सहायता के लिए तत्पर हैं।`
                    );
                    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>WhatsApp पर उत्तर</span>
                </button>

                <button
                  onClick={() => {
                    window.location.href = `tel:${selectedSupportMessage.phone}`;
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#4edea3]/20 hover:bg-[#4edea3]/30 border border-[#4edea3]/40 text-[#4edea3] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span>फ़ोन कॉल करें</span>
                </button>

                {selectedSupportMessage.email ? (
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(`Regarding your query on BazaarReels - ${selectedSupportMessage.subject || 'Support Desk'}`);
                      const body = encodeURIComponent(`नमस्ते ${selectedSupportMessage.name} जी,\n\nरीवा बाज़ार सपोर्ट टीम में संपर्क करने के लिए धन्यवाद। आपके संदेश ("${selectedSupportMessage.message}") के संबंध में:\n\n\nसादर,\nअमृत अर्जुन\nमास्टर एडमिन, रीवा बाज़ार`);
                      window.open(`mailto:${selectedSupportMessage.email}?subject=${subject}&body=${body}`, '_blank');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    <span>ईमेल पर उत्तर</span>
                  </button>
                ) : (
                  <div className="py-2.5 px-3 rounded-xl bg-[#171f33] border border-[#242e45] text-[#908fa0] text-xs flex items-center justify-center">
                    ईमेल अनुपलब्ध
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#222a3d] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (confirm(`इस संदेश को हमेशा के लिए हटाएं? (${selectedSupportMessage.name})`)) {
                    deleteSupportMessage(selectedSupportMessage.id);
                    setSelectedSupportMessage(null);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>संदेश हटाएं</span>
              </button>

              <button
                onClick={() => setSelectedSupportMessage(null)}
                className="px-4 py-2 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-xs font-bold text-[#dae2fd] transition-colors"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: TEST SUPPORT MESSAGE / FEEDBACK SIMULATOR MODAL       */}
      {/* ============================================================== */}
      {isTestMessageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in"
          onClick={() => setIsTestMessageModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0b1326] border border-[#2d3449] rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#222a3d] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">add_comment</span>
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">
                    नया ग्राहक संदेश / फीडबैक टेस्ट करें
                  </h3>
                  <p className="text-[11px] text-[#908fa0]">
                    यह टेस्ट संदेश एडमिन सपोर्ट डेस्क और फीडबैक इनबॉक्स में तुरंत दर्ज होगा।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTestMessageModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#171f33] text-[#dae2fd] flex items-center justify-center hover:bg-[#222a3d]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTestSupportMessage} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                  संदेश का प्रकार (Category):
                </label>
                <select
                  value={testMsgForm.category}
                  onChange={e => setTestMsgForm({ ...testMsgForm, category: e.target.value as any })}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                >
                  <option value="feedback">ग्राहक फीडबैक (Feedback with Rating)</option>
                  <option value="help">हेल्प व सहायता (Help Desk Request)</option>
                  <option value="contact_support">कस्टमर सपोर्ट (Contact Support)</option>
                  <option value="bug_report">तकनीकी बग रिपोर्ट (Bug Report)</option>
                  <option value="suggestion">सुझाव (Improvement Suggestion)</option>
                </select>
              </div>

              {testMsgForm.category === 'feedback' && (
                <div>
                  <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                    रेटिंग (Star Rating):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTestMsgForm({ ...testMsgForm, rating: st })}
                        className={`text-lg transition-transform ${
                          st <= testMsgForm.rating ? 'text-amber-400 scale-110' : 'text-[#444c65]'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs text-[#908fa0] font-bold ml-2">
                      {testMsgForm.rating} Star
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                    ग्राहक का नाम:
                  </label>
                  <input
                    type="text"
                    value={testMsgForm.name}
                    onChange={e => setTestMsgForm({ ...testMsgForm, name: e.target.value })}
                    required
                    className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                    शहर / इलाका:
                  </label>
                  <input
                    type="text"
                    value={testMsgForm.city}
                    onChange={e => setTestMsgForm({ ...testMsgForm, city: e.target.value })}
                    required
                    className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                    मोबाइल नंबर:
                  </label>
                  <input
                    type="tel"
                    value={testMsgForm.phone}
                    onChange={e => setTestMsgForm({ ...testMsgForm, phone: e.target.value })}
                    required
                    className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                    ईमेल (Email):
                  </label>
                  <input
                    type="email"
                    value={testMsgForm.email}
                    onChange={e => setTestMsgForm({ ...testMsgForm, email: e.target.value })}
                    className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                  विषय (Subject):
                </label>
                <input
                  type="text"
                  value={testMsgForm.subject}
                  onChange={e => setTestMsgForm({ ...testMsgForm, subject: e.target.value })}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#dae2fd] block mb-1">
                  संदेश / फीडबैक का विवरण:
                </label>
                <textarea
                  value={testMsgForm.message}
                  onChange={e => setTestMsgForm({ ...testMsgForm, message: e.target.value })}
                  rows={3}
                  required
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#171f33] text-xs font-bold text-[#dae2fd]"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] text-xs font-black shadow-md shadow-[#8083ff]/20 hover:opacity-95"
                >
                  इनबॉक्स में दर्ज करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
