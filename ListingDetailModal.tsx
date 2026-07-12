import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, Building2, Globe, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StartupListing } from '../types';

interface AddListingModalProps {
  onClose: () => void;
  onSuccess: (newListing: StartupListing) => void;
}

export default function AddListingModal({ onClose, onSuccess }: AddListingModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('SaaS');
  const [description, setDescription] = useState('');
  const [revenue, setRevenue] = useState('$5k');
  const [askingPrice, setAskingPrice] = useState('$120k');
  const [multiple, setMultiple] = useState('2.0x');
  const [platform, setPlatform] = useState('trustmrr');
  const [url, setUrl] = useState('https://trustmrr.com/startup/');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to parse price string for dynamic UI feedback
  function parsePriceToNumber(priceStr: string): number {
    if (!priceStr) return 0;
    const cleaned = priceStr.toLowerCase().replace(/[\$,\s]/g, '');
    if (cleaned.endsWith('m')) {
      const val = parseFloat(cleaned.replace('m', ''));
      return isNaN(val) ? 0 : val * 1000000;
    }
    if (cleaned.endsWith('k')) {
      const val = parseFloat(cleaned.replace('k', ''));
      return isNaN(val) ? 0 : val * 1000;
    }
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
  }

  const numericPrice = parsePriceToNumber(askingPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Initial validations
    if (!name.trim()) return setErrorMsg('Startup Name is required');
    if (!description.trim()) return setErrorMsg('Short description cannot be empty');
    if (!askingPrice.trim()) return setErrorMsg('Asking Price is required');
    if (!url.trim() || !url.startsWith('http')) return setErrorMsg('Platform listing URL must be a valid http/https link');

    // Premium Check Validation
    if (numericPrice < 10000) {
      return setErrorMsg(
        `MVP Restriction Warning: SaaShelf is starting ONLY with TrustMRR listings priced >= $10,000. Your parsed price is $${numericPrice.toLocaleString()}. Please list a premium asset.`
      );
    }

    setLoading(true);
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startup_name: name,
          category,
          short_description: description,
          revenue_30d: revenue,
          asking_price: askingPrice,
          multiple,
          source_platform: platform,
          original_url: url
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list startup');
      }

      setSuccessMsg('Amazing! Your startup was successfully listed.');
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong listing your startup.');
    } finally {
      setLoading(false);
    }
  };

  const syncUrlWithPlatform = (plat: string) => {
    setPlatform(plat);
    if (plat === 'trustmrr') {
      setUrl('https://trustmrr.com/startup/');
    } else if (plat === 'flippa') {
      setUrl('https://flippa.com/listings/');
    } else if (plat === 'empireflippers') {
      setUrl('https://empireflippers.com/listing/');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="add-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Layout Frame */}
        <motion.div
          id="add-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/60 max-w-lg w-full max-h-[90vh] overflow-y-auto z-10 flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
            <h2 className="font-display text-xl font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-5 h-5 text-indigo-600" /> List Your Startup
            </h2>
            <button
              id="close-add-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Platform Selection */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium block mb-1.5">
                Target Listing Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['TrustMRR', 'Flippa', 'EmpireFlippers'].map((plat) => {
                  const platLower = plat.toLowerCase();
                  const isSelected = platform === platLower;
                  return (
                    <button
                      id={`plat-btn-${platLower}`}
                      key={plat}
                      type="button"
                      onClick={() => syncUrlWithPlatform(platLower)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold font-sans transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {plat}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {platform === 'trustmrr' 
                  ? 'Active validation: prices must correspond to premium assets (>= $10k)' 
                  : 'Flippa & EmpireFlippers templates are structured but in verification phases'}
              </p>
            </div>

            {/* Grid for Name & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Startup Name</label>
                <input
                  id="startup-name-input"
                  type="text"
                  required
                  placeholder="e.g. Outstand.so"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Category</label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option>SaaS</option>
                  <option>Developer Tools</option>
                  <option>Marketing</option>
                  <option>Artificial Intelligence</option>
                  <option>Content Creation</option>
                  <option>Customer Support</option>
                  <option>Social Media</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Elevator Description</label>
              <textarea
                id="description-textarea"
                required
                rows={2}
                placeholder="Describe your SaaS product, target user, and core feature set..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Grid for Deal Financial Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">30d Revenue</label>
                <input
                  id="revenue-input"
                  type="text"
                  placeholder="e.g. $6.2k"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1 text-slate-700">Asking Price</label>
                <input
                  id="asking-price-input"
                  type="text"
                  required
                  placeholder="e.g. $130k"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none font-mono ${
                    numericPrice < 10000 
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/25' 
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Multiple</label>
                <input
                  id="multiple-input"
                  type="text"
                  placeholder="e.g. 1.7x"
                  value={multiple}
                  onChange={(e) => setMultiple(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Threshold warning label */}
            <div className={`p-2.5 rounded-lg border text-[11px] flex gap-2 items-center ${
              numericPrice < 10000 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-indigo-50/50 text-indigo-700 border-indigo-100'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {numericPrice < 10000 
                  ? `Price warning: Minimum is $10k. Current parsed: $${numericPrice.toLocaleString()}`
                  : `Validated Price: $${numericPrice.toLocaleString()} is premium!`}
              </span>
            </div>

            {/* Original URL */}
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">
                Original {platform.toUpperCase()} Listing URL
              </label>
              <div className="relative">
                <input
                  id="original-url-input"
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
                <Globe className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Submit Action Block */}
            <div className="pt-4 flex gap-2">
              <button
                id="cancel-add-btn"
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-listing-btn"
                type="submit"
                disabled={loading || numericPrice < 10000}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                {loading ? 'Registering...' : 'List Startup'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
