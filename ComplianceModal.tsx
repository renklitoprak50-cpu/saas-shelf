import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ExternalLink, 
  Coins, 
  Percent, 
  TrendingUp, 
  Copy, 
  Check, 
  Sparkles, 
  Network,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { StartupListing } from '../types';
import { generateAffiliateLink, PLATFORM_CONFIGS } from '../utils/affiliateLinks';

interface ListingDetailModalProps {
  listing: StartupListing | null;
  onClose: () => void;
}

export default function ListingDetailModal({ listing, onClose }: ListingDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [customRefCode, setCustomRefCode] = useState('');

  if (!listing) return null;

  // Programmatic SEO implementation to dynamically adjust Document Title & Meta tags for search engines
  useEffect(() => {
    if (listing) {
      // Formula: Buy [Category] Startup | [startup_name] ([revenue_30d] MRR) | SaaShelf
      const originalTitle = document.title;
      const seoTitle = `Buy ${listing.category || 'SaaS'} Startup | ${listing.startup_name} (${listing.revenue_30d} MRR) | SaaShelf`;
      document.title = seoTitle;

      // Meta Description formula
      const originalMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      let metaDescEl = document.querySelector('meta[name="description"]');
      const dynamicDesc = `Acquire ${listing.startup_name}, a highly profitable ${listing.category || 'tech'} startup generating ${listing.revenue_30d} in monthly revenue. Asking price: ${listing.asking_price}.`;
      
      if (!metaDescEl) {
        metaDescEl = document.createElement('meta');
        metaDescEl.setAttribute('name', 'description');
        document.head.appendChild(metaDescEl);
      }
      metaDescEl.setAttribute('content', dynamicDesc);

      return () => {
        document.title = originalTitle;
        if (metaDescEl) {
          metaDescEl.setAttribute('content', originalMetaDesc);
        }
      };
    }
  }, [listing]);

  // Find default config parameters
  const currentPlatform = listing.source_platform.toLowerCase();
  const config = PLATFORM_CONFIGS[currentPlatform] || { defaultRefCode: 'SAASHELF' };
  
  const activeRefCode = useCustomCode ? customRefCode : config.defaultRefCode;
  const affiliateUrl = generateAffiliateLink(listing.original_url, listing.source_platform, activeRefCode);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate the requested JSON-LD Rich Schema dynamically for SEO validation in live previews!
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": listing.startup_name,
    "applicationCategory": listing.category,
    "description": `Acquire ${listing.startup_name || 'this startup'}, a highly profitable ${listing.category || 'digital'} startup generating ${listing.revenue_30d} in monthly revenue. Asking price: ${listing.asking_price}.`,
    "offers": {
      "@type": "Offer",
      "price": listing.asking_price.replace(/[^0-9.]/g, ''),
      "priceCurrency": "USD",
      "url": affiliateUrl
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Schema dynamic injection */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} 
        />
        {/* Backdrop */}
        <motion.div
          id="detail-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content Frame */}
        <motion.div
          id="detail-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col z-10"
        >
          {/* Close trigger header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Sourced via verified {listing.source_platform.toUpperCase()}
            </span>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Title Block */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {listing.startup_name}
              </h2>
              <p className="text-sm text-indigo-600 font-medium font-sans mt-1">
                Category: {listing.category}
              </p>
            </div>

            {/* Description Card */}
            {listing.short_description && (
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100" id="detail-overview-card">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Startup Overview</h4>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  {listing.short_description}
                </p>
              </div>
            )}

            {/* Bento Grid Metrics */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Key Deal Metrics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                  <span className="text-xs text-amber-700 font-medium">30d Revenue</span>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">{listing.revenue_30d || "$0"}</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Verified Monthly Revenue</span>
                  </div>
                </div>

                <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100/60 flex flex-col justify-between">
                  <span className="text-xs text-violet-700 font-medium">Asking Price</span>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-mono text-indigo-800">{listing.asking_price}</span>
                    <span className="text-[10px] text-violet-600 block mt-0.5">Premium Listing Valuation</span>
                  </div>
                </div>

                <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60 flex flex-col justify-between">
                  <span className="text-xs text-teal-700 font-medium">Revenue Multiple</span>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">{listing.multiple}</span>
                    <span className="text-[10px] text-teal-600 block mt-0.5">Price to Revenue Factor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Affiliate Tool Simulator inside the component */}
            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-500" /> Affiliate URL Generator Details
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    id="toggle-custom-code"
                    type="checkbox"
                    checked={useCustomCode}
                    onChange={(e) => setUseCustomCode(e.target.checked)}
                    className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="toggle-custom-code" className="text-xs font-medium text-slate-500 cursor-pointer">
                    Custom Ref Code
                  </label>
                </div>
              </div>

              {useCustomCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <label className="text-xs text-slate-500 font-medium">Override Referral Code</label>
                  <input
                    id="custom-ref-code-input"
                    type="text"
                    value={customRefCode}
                    onChange={(e) => setCustomRefCode(e.target.value)}
                    placeholder={`e.g. MY_AFF_CODE (Default: ${config.defaultRefCode})`}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </motion.div>
              )}

              {/* URL Preview */}
              <div className="bg-slate-950 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">GENERATED ENCODED URL</span>
                  <button
                    id="copy-affiliate-url-btn"
                    onClick={handleCopyLink}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-sans active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy URL
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-300 select-all overflow-x-auto whitespace-nowrap scrollbar-thin py-0.5">
                  {affiliateUrl}
                </div>
              </div>
            </div>

            {/* Requirement 3: The 'Buy Action' Component (UI/UX) */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
              
              {/* Soft, reassuring English text requested EXACTLY above or below the buy redirect button */}
              <p className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200 leading-relaxed italic text-center">
                'Please use this link when purchasing. It won't cost you anything extra, but it really helps support our platform.'
              </p>

              {/* The Action Button */}
              <a
                id="buy-external-link-btn"
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-xl font-medium flex items-center justify-center gap-2 group transition-all text-center text-sm active:scale-[0.99] shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Buy Startup on {listing.source_platform.toUpperCase()} 
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1">
                <span>Original Link Sourced from</span>
                <a 
                  href={listing.original_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium underline hover:text-slate-600 flex items-center gap-0.5"
                >
                  {listing.source_platform} <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
