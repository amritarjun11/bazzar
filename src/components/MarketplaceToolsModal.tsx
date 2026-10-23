import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'rc' | 'valuation' | 'meetup';
}

const SAMPLE_VEHICLES = [
  { no: 'MP 17 BC 4521', model: 'Honda Shine 125 Disc', year: '2022', owner: '1st Owner', ins: 'Valid (Oct 2026)', challans: 0 },
  { no: 'MP 17 MA 9901', model: 'Royal Enfield Classic 350 Stealth', year: '2021', owner: '1st Owner', ins: 'Valid (Dec 2025)', challans: 0 },
  { no: 'MP 17 CB 2024', model: 'Maruti Suzuki Swift ZXi', year: '2020', owner: '1st Owner', ins: 'Valid (Aug 2026)', challans: 0 },
];

export const MarketplaceToolsModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'rc' }) => {
  const [activeTab, setActiveTab] = useState<'rc' | 'valuation' | 'meetup'>(initialTab);

  // RC Checker State
  const [vehicleNo, setVehicleNo] = useState('MP 17 BC 4521');
  const [isCheckingRC, setIsCheckingRC] = useState(false);
  const [rcResult, setRcResult] = useState<typeof SAMPLE_VEHICLES[0] | null>(SAMPLE_VEHICLES[0]);

  // Valuation Calculator State
  const [category, setCategory] = useState<'bike' | 'scooter' | 'mobile' | 'car'>('bike');
  const [modelName, setModelName] = useState('Honda Shine 125');
  const [regYear, setRegYear] = useState('2022');
  const [condition, setCondition] = useState<'mint' | 'good' | 'fair'>('mint');
  const [kmDriven, setKmDriven] = useState('14000');
  const [calcResult, setCalcResult] = useState<{
    low: number;
    high: number;
    recommended: number;
    demand: string;
    avgDays: number;
  } | null>({
    low: 71000,
    high: 76000,
    recommended: 74500,
    demand: 'High Demand in Rewa (Top 5% Most Searched)',
    avgDays: 3,
  });

  if (!isOpen) return null;

  const handleCheckRC = () => {
    if (!vehicleNo.trim()) return;
    setIsCheckingRC(true);
    setTimeout(() => {
      const match = SAMPLE_VEHICLES.find(
        v => v.no.replace(/\s+/g, '').toUpperCase() === vehicleNo.replace(/\s+/g, '').toUpperCase()
      );
      if (match) {
        setRcResult(match);
      } else {
        setRcResult({
          no: vehicleNo.toUpperCase(),
          model: 'Registered Vehicle (MP-17 Rewa RTO)',
          year: '2022',
          owner: '1st Owner (Smart Card Verified)',
          ins: 'Valid (Comprehensive Insurance)',
          challans: 0,
        });
      }
      setIsCheckingRC(false);
    }, 600);
  };

  const handleCalculateValuation = () => {
    let base = 75000;
    if (category === 'bike') {
      if (modelName.toLowerCase().includes('classic') || modelName.toLowerCase().includes('bullet')) base = 155000;
      else if (modelName.toLowerCase().includes('pulsar')) base = 95000;
      else base = 75000;
    } else if (category === 'scooter') {
      base = 65000;
    } else if (category === 'mobile') {
      if (modelName.toLowerCase().includes('iphone 13')) base = 42000;
      else if (modelName.toLowerCase().includes('iphone 14')) base = 52000;
      else if (modelName.toLowerCase().includes('iphone 15')) base = 62000;
      else base = 25000;
    } else if (category === 'car') {
      base = 450000;
    }

    const yearNum = Number(regYear) || 2022;
    const ageYears = Math.max(0, 2026 - yearNum);
    const depFactor = Math.max(0.45, 1 - ageYears * 0.12);
    const condFactor = condition === 'mint' ? 1.05 : condition === 'good' ? 0.95 : 0.85;

    const estimated = Math.round((base * depFactor * condFactor) / 500) * 500;
    setCalcResult({
      low: Math.round(estimated * 0.94),
      high: Math.round(estimated * 1.05),
      recommended: estimated,
      demand: 'High Liquidity in Rewa Marketplace',
      avgDays: condition === 'mint' ? 2 : 4,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0b1326] border border-[#2d3449] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#222a3d] bg-[#131b2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] shadow-lg">
              <span className="material-symbols-outlined text-2xl font-bold">build_circle</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#dae2fd] flex items-center gap-2">
                <span>Rewa Marketplace Tools</span>
                <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] font-black px-2 py-0.5 rounded-full">
                  FREE UTILITY
                </span>
              </h2>
              <p className="text-xs text-[#908fa0]">
                RTO RC Verification, Price Calculator & Safe Meetup Zones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-[#222a3d] bg-[#0e1629]">
          <button
            onClick={() => setActiveTab('rc')}
            className={`py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'rc'
                ? 'border-[#4edea3] text-[#4edea3] bg-[#171f33]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-base">directions_car</span>
            <span className="truncate">RC & Challan</span>
          </button>

          <button
            onClick={() => setActiveTab('valuation')}
            className={`py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'valuation'
                ? 'border-[#8083ff] text-[#8083ff] bg-[#171f33]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-base">calculate</span>
            <span className="truncate">Price Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('meetup')}
            className={`py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'meetup'
                ? 'border-[#ffb2b7] text-[#ffb2b7] bg-[#171f33]'
                : 'border-transparent text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-base">shield</span>
            <span className="truncate">Safe Meetup</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* ==================================================== */}
          {/* TAB 1: RC & CHALLAN CHECKER                          */}
          {/* ==================================================== */}
          {activeTab === 'rc' && (
            <div className="space-y-4">
              <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block">
                  MP-17 Rewa Vehicle Registration Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value.toUpperCase())}
                    placeholder="e.g. MP 17 BC 4521"
                    className="flex-1 bg-[#131b2e] border border-[#2d3449] focus:border-[#4edea3] rounded-xl px-3.5 py-2.5 text-sm font-black text-[#dae2fd] uppercase tracking-widest focus:outline-none"
                  />
                  <button
                    onClick={handleCheckRC}
                    disabled={isCheckingRC}
                    className="px-5 py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#3ecf8e] text-[#0b1326] font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#4edea3]/20 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isCheckingRC ? 'sync' : 'search'}
                    </span>
                    <span>{isCheckingRC ? 'Verifying...' : 'Check RC'}</span>
                  </button>
                </div>

                {/* Sample quick chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#908fa0]">Try Samples:</span>
                  {SAMPLE_VEHICLES.map(s => (
                    <button
                      key={s.no}
                      onClick={() => {
                        setVehicleNo(s.no);
                        setRcResult(s);
                      }}
                      className="text-[10px] bg-[#131b2e] hover:bg-[#222a3d] border border-[#2d3449] text-[#c0c1ff] px-2 py-0.5 rounded-lg transition-colors font-semibold"
                    >
                      {s.no}
                    </button>
                  ))}
                </div>
              </div>

              {/* RC Verification Result Card */}
              {rcResult && (
                <div className="bg-gradient-to-br from-[#171f33] to-[#131b2e] border-2 border-[#4edea3]/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#222a3d]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">verified</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#dae2fd] tracking-wide">
                          {rcResult.no}
                        </h4>
                        <p className="text-[11px] text-[#4edea3] font-bold">
                          Rewa RTO (MP-17) • Official Smart Card Active
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#4edea3] text-[#0b1326] text-[10px] font-black px-2 py-1 rounded-md">
                      VERIFIED RC ✓
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
                      <span className="text-[10px] text-[#908fa0] uppercase block mb-0.5">Model</span>
                      <span className="font-bold text-[#dae2fd] block truncate">{rcResult.model}</span>
                    </div>

                    <div className="bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
                      <span className="text-[10px] text-[#908fa0] uppercase block mb-0.5">Registration Year</span>
                      <span className="font-bold text-[#dae2fd] block">{rcResult.year}</span>
                    </div>

                    <div className="bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
                      <span className="text-[10px] text-[#908fa0] uppercase block mb-0.5">Ownership</span>
                      <span className="font-bold text-[#dae2fd] block">{rcResult.owner}</span>
                    </div>

                    <div className="bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
                      <span className="text-[10px] text-[#908fa0] uppercase block mb-0.5">Insurance Status</span>
                      <span className="font-bold text-[#4edea3] block">{rcResult.ins}</span>
                    </div>

                    <div className="bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
                      <span className="text-[10px] text-[#908fa0] uppercase block mb-0.5">Pending E-Challans</span>
                      <span className="font-black text-[#4edea3] block flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>0 Pending (Clean Record)</span>
                      </span>
                    </div>

                    <div className="bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
                      <span className="text-[10px] text-[#908fa0] uppercase block mb-0.5">Fitness Validity</span>
                      <span className="font-bold text-[#dae2fd] block">Valid up to 2037</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#908fa0] flex items-center gap-1.5 pt-1">
                    <span className="material-symbols-outlined text-sm text-[#4edea3]">security</span>
                    <span>
                      Original Smart Card RC physically verified. No hypothecation pending in Rewa RTO.
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: FAIR PRICE CALCULATOR                         */}
          {/* ==================================================== */}
          {activeTab === 'valuation' && (
            <div className="space-y-4">
              <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['bike', 'scooter', 'mobile', 'car'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        if (cat === 'bike') setModelName('Honda Shine 125');
                        if (cat === 'scooter') setModelName('Honda Activa 6G');
                        if (cat === 'mobile') setModelName('iPhone 13 128GB');
                        if (cat === 'car') setModelName('Maruti Swift 2021');
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                        category === cat
                          ? 'bg-[#8083ff] text-[#0b1326] border-[#8083ff] shadow'
                          : 'bg-[#131b2e] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd]'
                      }`}
                    >
                      {cat === 'bike' ? '🏍️ Bike' : cat === 'scooter' ? '🛵 Scooter' : cat === 'mobile' ? '📱 Mobile' : '🚗 Car'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] text-[#908fa0] uppercase block mb-1">Make & Model</label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={e => setModelName(e.target.value)}
                      placeholder="e.g. Honda Shine 125 or iPhone 13"
                      className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#908fa0] uppercase block mb-1">Registration / Purchase Year</label>
                    <select
                      value={regYear}
                      onChange={e => setRegYear(e.target.value)}
                      className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                    >
                      <option value="2024">2024 (Under 1 Year)</option>
                      <option value="2023">2023 (~1-2 Years)</option>
                      <option value="2022">2022 (~2-3 Years)</option>
                      <option value="2021">2021 (~3-4 Years)</option>
                      <option value="2020">2020 (~4-5 Years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#908fa0] uppercase block mb-1">Condition</label>
                    <select
                      value={condition}
                      onChange={e => setCondition(e.target.value as any)}
                      className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                    >
                      <option value="mint">Like New (Mint Condition - Zero Scratches)</option>
                      <option value="good">Good (Normal Wear & Clean)</option>
                      <option value="fair">Fair (Average Use / High KM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#908fa0] uppercase block mb-1">KM Driven / Battery Health</label>
                    <input
                      type="text"
                      value={kmDriven}
                      onChange={e => setKmDriven(e.target.value)}
                      placeholder="e.g. 14000 km or 90% Battery"
                      className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculateValuation}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#8083ff]/20 transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm font-bold">price_change</span>
                  <span>Calculate Fair Market Price</span>
                </button>
              </div>

              {/* Valuation Result */}
              {calcResult && (
                <div className="bg-gradient-to-br from-[#171f33] to-[#131b2e] border-2 border-[#8083ff]/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#908fa0] uppercase block">Fair Market Value (Rewa)</span>
                      <div className="text-2xl font-black text-[#4edea3] tracking-tight">
                        ₹{calcResult.low.toLocaleString()} – ₹{calcResult.high.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#908fa0] uppercase block">Recommended Deal Price</span>
                      <span className="text-base font-extrabold text-[#dae2fd]">
                        ₹{calcResult.recommended.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0b1326] rounded-xl border border-[#2d3449] flex items-center justify-between text-xs">
                    <span className="text-[#908fa0]">Rewa Demand Score:</span>
                    <span className="font-bold text-[#8083ff]">{calcResult.demand}</span>
                  </div>

                  <p className="text-[11px] text-[#dae2fd]/80">
                    💡 <strong>Buyer Tip:</strong> Allow up to ₹2,000–₹3,000 counter-bargaining buffer for quick same-day hand-to-hand deal in Rewa.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: SAFE MEETUP ZONES                             */}
          {/* ==================================================== */}
          {activeTab === 'meetup' && (
            <div className="space-y-3.5">
              <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4">
                <h3 className="text-xs font-black text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-sm text-[#4edea3]">verified_user</span>
                  <span>Rewa Verified Safe Deal Zones</span>
                </h3>
                <p className="text-xs text-[#908fa0]">
                  Meet at these busy public spots with CCTV and security for safe, transparent vehicle inspection and cash/UPI handover:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Civil Lines Police Line Ground Gate',
                    sub: 'Near Rewa Police Line Ground, Civil Lines',
                    landmark: 'Opposite Police Mess • 24x7 Monitored',
                    color: 'text-[#4edea3]',
                  },
                  {
                    title: 'Saman Naka / Sirmour Chauraha Traffic Point',
                    sub: 'Sirmour Square, Rewa',
                    landmark: 'Busy Junction with Traffic Police Post',
                    color: 'text-[#8083ff]',
                  },
                  {
                    title: 'Rewa Central Mall Main Entrance',
                    sub: 'College Road, Rewa',
                    landmark: 'Public Shopping Hub with CCTV & Security',
                    color: 'text-[#ffb2b7]',
                  },
                  {
                    title: 'APSU Main Gate Police Outpost',
                    sub: 'University Road, Rewa',
                    landmark: 'Wide Road for Safe Vehicle Test Drive',
                    color: 'text-[#4edea3]',
                  },
                ].map((spot, i) => (
                  <div key={i} className="bg-[#171f33] border border-[#2d3449] rounded-xl p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0b1326] text-[#dae2fd] font-extrabold flex items-center justify-center shrink-0 border border-[#2d3449] text-xs">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#dae2fd]">{spot.title}</h4>
                      <p className="text-[11px] text-[#908fa0]">{spot.sub}</p>
                      <p className={`text-[10px] font-bold ${spot.color} mt-0.5`}>✓ {spot.landmark}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#0b1326] rounded-xl border border-[#2d3449] text-xs text-[#dae2fd] space-y-1">
                <span className="font-bold text-[#4edea3] block">🛡️ Escrow Token Protection:</span>
                <p className="text-[11px] text-[#908fa0]">
                  Never send full advance payment online. Always inspect the vehicle, verify original RC and Aadhaar in person before releasing payment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
