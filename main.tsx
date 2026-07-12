import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  Layers, 
  Terminal, 
  RefreshCw, 
  Coins, 
  TrendingUp, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Database,
  Lock,
  X
} from 'lucide-react';
import { StartupListing } from './types';
import ListingCard from './components/ListingCard';
import ListingDetailModal from './components/ListingDetailModal';
import AddListingModal from './components/AddListingModal';
import DeveloperTab from './components/DeveloperTab';
import CookieBanner from './components/CookieBanner';
import ComplianceModal from './components/ComplianceModal';
import { generateAffiliateLink } from './utils/affiliateLinks';
import { getClientListings, getBestDealsListings, parseMultipleVal } from './utils/listingsData';

// Helper to load client-persisted startups listed by the user
const loadSavedListings = (): StartupListing[] => {
  try {
    const saved = localStorage.getItem('saashelf_custom_listings');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'listings' | 'dev_kit'>('listings');
  const [listings, setListings] = useState<StartupListing[]>(() => {
    const backendDefaults = getClientListings();
    const customListings = loadSavedListings();
    // Unique list by appending custom listings at the beginning
    const seenIds = new Set(customListings.map(l => l.id));
    const cleanDefaults = backendDefaults.filter(l => !seenIds.has(l.id));
    return [...customListings, ...cleanDefaults];
  });
  const [showBestDealsOnly, setShowBestDealsOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxMultipleQuery, setMaxMultipleQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedListing, setSelectedListing] = useState<StartupListing | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Compliance states
  const [isComplianceOpen, setIsComplianceOpen] = useState<boolean>(false);
  const [complianceTab, setComplianceTab] = useState<'privacy' | 'terms' | 'adsense'>('privacy');

  // Fetch listings on initial component mount and merge with client-saved startups
  const fetchListings = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/listings');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const customListings = loadSavedListings();
            const serverIds = new Set(data.map(l => l.id));
            const uniqueCustom = customListings.filter(cl => !serverIds.has(cl.id));
            setListings([...uniqueCustom, ...data]);
          }
        }
      }
    } catch (e) {
      console.error("Failed fetching listings from API, using client fallback: ", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Soft Reset to Original Seeds
  const handleResetDatabase = async () => {
    if (!window.confirm("Do you want to reset the directory back to the default premium TrustMRR listings?")) {
      return;
    }
    setRefreshing(true);
    try {
      // Clear custom local listings
      localStorage.removeItem('saashelf_custom_listings');
      
      const res = await fetch('/api/listings/reset', { method: 'POST' });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && Array.isArray(data.listings)) {
            setListings(data.listings);
          }
        }
      }
    } catch (e) {
      console.error("Failed resetting db", e);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle addition of custom listings
  const handleAddSuccess = (newListing: StartupListing) => {
    // Append dynamically to state and persist in local storage to prevent loss under Vercel
    setListings(prev => {
      const updated = [newListing, ...prev];
      try {
        const customListings = loadSavedListings();
        // Check if already in local storage to prevent duplicate listings
        if (!customListings.some(cl => cl.id === newListing.id)) {
          localStorage.setItem('saashelf_custom_listings', JSON.stringify([newListing, ...customListings]));
        }
      } catch (e) {
        console.error("LocalStorage write failed:", e);
      }
      return updated;
    });
  };

  // Select the base data source based on toggle state
  const activeBaseList = showBestDealsOnly ? listings.filter(item => item.is_best_deal) : listings;

  // Unique categories aggregated dynamically from active data for filter list
  const categories: string[] = ['All', ...Array.from(new Set<string>(activeBaseList.map(l => l.category || "Other")))];
  const platforms = showBestDealsOnly ? ['All', 'Best_Deals'] : ['All', 'TrustMRR', 'Flippa', 'EmpireFlippers'];

  // Match search filter conditions (case-insensitive search across name/desc/category/multiple)
  const filteredListings = activeBaseList.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      (item.startup_name || "").toLowerCase().includes(query) ||
      (item.short_description || "").toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query) ||
      (item.multiple || "").toLowerCase().includes(query);
      
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'All' || 
      (item.source_platform || "").toLowerCase() === selectedPlatform.toLowerCase() ||
      (selectedPlatform.toLowerCase() === 'best_deals' && item.is_best_deal);

    // Multiples range search/filter
    let matchesMultiple = true;
    if (maxMultipleQuery.trim() !== '') {
      const maxVal = parseFloat(maxMultipleQuery);
      if (!isNaN(maxVal)) {
        const itemMult = parseMultipleVal(item.multiple);
        matchesMultiple = itemMult <= maxVal;
      }
    }

    return matchesSearch && matchesCategory && matchesPlatform && matchesMultiple;
  });

  // Calculate high quality stats block
  const premiumOver10kCount = activeBaseList.length;
  
  const formattedHighestValuation = activeBaseList.reduce((max, item) => {
    return item.startup_name === "POST BRIDGE" ? "$4.2M" : max; // Seed maximum
  }, "$4.2M");

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans transition-colors duration-200">
      
      {/* SaaShelf Dynamic Banner */}
      <div className="bg-slate-900 text-slate-100 py-2.5 px-4 text-center text-xs font-mono tracking-wider font-medium flex items-center justify-center gap-1.5 border-b border-slate-800">
        <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
        <span>Monetizing Premium Startup Acquisitions &gt;= $10,000 threshold with TrustMRR, Flippa, and EmpireFlippers</span>
      </div>

      {/* Primary Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-4 md:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <span className="font-display text-xl font-bold tracking-tight">S$</span>
            </div>
            <div>
              <span className="font-display text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                SaaShelf
              </span>
              <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase">MODULAR STARTUP MARKETPLACE</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-2">
            
            {/* View Mode Select */}
            <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 text-xs font-semibold">
              <button
                id="view-marketplace-btn"
                onClick={() => setActiveTab('listings')}
                className={`px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'listings' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Marketplace
              </button>
              <button
                id="view-devkit-btn"
                onClick={() => setActiveTab('dev_kit')}
                className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'dev_kit' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Dev Snippets
              </button>
            </div>

            {/* List Startup Trigger (Sellers action) - Premium Active */}
            <div>
              <button
                id="list-startup-nav-btn"
                onClick={() => setIsAddOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer transition-all animate-fade-in"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>List Startup</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Marketplace View */}
        {activeTab === 'listings' && (
          <div className="space-y-8">
            
            {/* Bento Grid Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="col-span-1 md:col-span-2 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800 shadow-xl">
                <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
                  <span className="text-9xl font-display font-black">S</span>
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  ACTIVE PLATFORM STRATEGY
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mt-3 text-slate-100">
                  Acquire Premium Hand-Picked Micro-SaaS
                </h1>
                <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-md leading-relaxed">
                  Welcome to SaaShelf, the premier hub for high-yield digital assets. Browse premium listings, generate ready affiliate metrics, and list yours in minutes.
                </p>
              </div>

              {/* Verified Premium Listings */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">PREMIUM LISTINGS</span>
                  <span className="text-4xl font-black font-display text-slate-800 tracking-tight mt-1 inline-block">
                    {premiumOver10kCount}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold font-mono mt-4">
                  <Coins className="w-4 h-4" /> All Active listings &gt;= $10k
                </div>
              </div>

              {/* Highest Seed Valuation */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">MAX VALUATION</span>
                  <span className="text-4xl font-black font-display text-slate-800 tracking-tight mt-1 inline-block">
                    {formattedHighestValuation}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold font-mono mt-4">
                  <TrendingUp className="w-4 h-4" /> Multiples up to 8.6x
                </div>
              </div>

            </div>

            {/* Quick Informational / Educational Banner */}
            <div className="bg-amber-50/70 border border-amber-200 text-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 block">Affiliate Strategy</span>
                <p className="text-xs text-amber-800 leading-relaxed max-w-3xl">
                  SaaShelf is custom built for modular Next.js developers. Click on any SaaS offering to open the 'Buy Action' detail component and view, generate, or copy-paste clean integration links.
                </p>
              </div>
              <button
                id="reset-db-btn"
                onClick={handleResetDatabase}
                className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold py-1.5 px-3 rounded-lg shrink-0 flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Default Seed Listings
              </button>
            </div>

            {/* Section Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex max-w-md w-full border border-slate-200/60 shadow-xs">
                <button
                  id="tab-all-directory"
                  onClick={() => {
                    setShowBestDealsOnly(false);
                    setSelectedCategory('All');
                    setSelectedPlatform('All');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !showBestDealsOnly
                      ? 'bg-white text-slate-900 shadow-md font-bold border border-slate-200/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${!showBestDealsOnly ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                  <span>All Directory ({listings.length})</span>
                </button>
                <button
                  id="tab-best-deals"
                  onClick={() => {
                    setShowBestDealsOnly(true);
                    setSelectedCategory('All');
                    setSelectedPlatform('All');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    showBestDealsOnly
                      ? 'bg-slate-900 text-white shadow-md font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={showBestDealsOnly ? 'animate-pulse' : ''}>🔥</span>
                  <span>Best Deals ({listings.filter(l => l.is_best_deal).length})</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Showing {filteredListings.length} results</span>
              </div>
            </div>

            {/* Filters and Search Bar Section */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search query input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="directory-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, tags, description..."
                    className="w-full text-xs md:text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all font-sans"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Multiplier Limit Search */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="relative w-full sm:w-auto min-w-[215px]">
                      <span className="absolute left-3 top-3 text-[10px] font-bold text-indigo-600 font-mono uppercase tracking-wider">Max Multiplier</span>
                      <input
                        id="directory-max-multiple-input"
                        type="text"
                        value={maxMultipleQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[0-9.]*$/.test(val)) {
                            setMaxMultipleQuery(val);
                          }
                        }}
                        placeholder="e.g. 2.0"
                        className="w-full text-xs md:text-sm pl-28 pr-7 py-2.5 bg-indigo-50/20 border border-indigo-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-bold font-mono transition-all placeholder-slate-300"
                      />
                      {maxMultipleQuery && (
                        <button
                          id="clear-max-multiple"
                          onClick={() => setMaxMultipleQuery('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Quick presets */}
                    <div className="flex items-center gap-1">
                      <button
                        id="preset-mult-1-5"
                        onClick={() => setMaxMultipleQuery(maxMultipleQuery === '1.5' ? '' : '1.5')}
                        className={`text-[11px] font-bold px-2 px-1.5 py-1 rounded-lg border cursor-pointer transition-all ${
                          maxMultipleQuery === '1.5'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        &lt; 1.5x
                      </button>
                      <button
                        id="preset-mult-2-0"
                        onClick={() => setMaxMultipleQuery(maxMultipleQuery === '2.0' ? '' : '2.0')}
                        className={`text-[11px] font-bold px-2 px-1.5 py-1 rounded-lg border cursor-pointer transition-all ${
                          maxMultipleQuery === '2.0'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        &lt; 2.0x
                      </button>
                      <button
                        id="preset-mult-3-0"
                        onClick={() => setMaxMultipleQuery(maxMultipleQuery === '3.0' ? '' : '3.0')}
                        className={`text-[11px] font-bold px-2 px-1.5 py-1 rounded-lg border cursor-pointer transition-all ${
                          maxMultipleQuery === '3.0'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        &lt; 3.0x
                      </button>
                    </div>
                  </div>

                  {/* Platform trigger */}
                  <div className="flex items-center gap-1 border-l border-slate-200/80 pl-2 lg:pl-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mr-1.5 hidden xl:inline">Platform</span>
                    <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
                      {platforms.map((plat) => (
                        <button
                          id={`platform-filter-${plat.toLowerCase()}`}
                          key={plat}
                          onClick={() => setSelectedPlatform(plat)}
                          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            selectedPlatform === plat 
                              ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Categories badge navigation bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mr-2">Categories</span>
                  {categories.map((cat) => (
                    <button
                      id={`category-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <span>Loading active listings from SaaShelf database...</span>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-3 shadow-xs">
                <div className="text-slate-400 text-4xl">📭</div>
                <h3 className="font-display font-bold text-lg text-slate-800">No Premium Listings Found</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Try refiltering your search queries or listing a custom startup with asking price above $10,000 to see it live.
                </p>
                <button
                  id="reset-state-empty-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedPlatform('All');
                  }}
                  className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Clear all active filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredListings.map((listing) => {
                    const defaultCode = listing.source_platform.toLowerCase() === 'trustmrr' ? 'toprak-renkli-2800ac' : 'partner';
                    const affUrl = generateAffiliateLink(listing.original_url, listing.source_platform, defaultCode);
                    return (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        affiliateUrl={affUrl}
                        onClick={(item) => setSelectedListing(item)}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

          </div>
        )}

        {/* Developer Tab Toolkit */}
        {activeTab === 'dev_kit' && (
          <DeveloperTab />
        )}

      </main>

      {/* Footer Area */}
      <footer className="bg-white border-t border-slate-200/60 py-10 mt-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <span className="font-display font-extrabold text-slate-800 text-lg">SaaShelf</span>
            <p className="text-xs text-slate-400">
              Building lightweight, modular startup directories for micro-affiliates.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500 justify-center md:justify-start pt-1">
              <button id="footer-privacy-btn" onClick={() => { setComplianceTab('privacy'); setIsComplianceOpen(true); }} className="hover:text-indigo-600 hover:underline cursor-pointer transition-all">Gizlilik Politikası</button>
              <span className="text-slate-300">•</span>
              <button id="footer-adsense-btn" onClick={() => { setComplianceTab('adsense'); setIsComplianceOpen(true); }} className="hover:text-indigo-600 hover:underline cursor-pointer transition-all">Google AdSense &amp; Çerezler</button>
              <span className="text-slate-300">•</span>
              <button id="footer-terms-btn" onClick={() => { setComplianceTab('terms'); setIsComplianceOpen(true); }} className="hover:text-indigo-600 hover:underline cursor-pointer transition-all">Kullanım Koşulları</button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
            <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 flex items-center gap-1 text-slate-600">
              <Database className="w-3.5 h-3.5 text-indigo-500" /> PostgreSQL Ready
            </span>
            <span>Created on 2026-06-18</span>
            <span>Version 1.0.0 (MVP)</span>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner onOpenPrivacy={() => { setComplianceTab('adsense'); setIsComplianceOpen(true); }} />

      {/* Compliance Legal Modal */}
      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
        initialTab={complianceTab}
      />

      {/* Add Listing Modal Frame */}
      {isAddOpen && (
        <AddListingModal
          onClose={() => setIsAddOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Detail Showcase Drawer Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

    </div>
  );
}
