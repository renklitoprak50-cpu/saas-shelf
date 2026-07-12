import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Coins, Percent, FileCode2 } from 'lucide-react';
import { StartupListing } from '../types';

interface ListingCardProps {
  key?: React.Key | string | number;
  listing: StartupListing;
  onClick: (listing: StartupListing) => void;
  affiliateUrl: string;
}

export default function ListingCard({ listing, onClick, affiliateUrl }: ListingCardProps) {
  // Setup beautiful backgrounds depending on the category to introduce visual rhythm
  const getCategoryTheme = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('dev') || cat.includes('api')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (cat.includes('ai') || cat.includes('intelligence')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (cat.includes('marketing') || cat.includes('seo')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    } else if (cat.includes('social') || cat.includes('media')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (cat.includes('content') || cat.includes('creation') || cat.includes('art')) {
      return 'bg-pink-50 text-pink-700 border-pink-200';
    } else {
      return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <motion.div
      id={`card-${listing.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -4, boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.08)' }}
      className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between cursor-pointer transition-shadow"
      onClick={() => onClick(listing)}
    >
      <div className="w-full">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
              {listing.startup_name}
            </h3>
            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border mt-1.5 ${getCategoryTheme(listing.category)}`}>
              {listing.category}
            </span>
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-semibold bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <FileCode2 className="w-3.5 h-3.5" />
            {listing.source_platform === 'best_deals' ? 'BEST DEAL 🔥' : listing.source_platform}
          </span>
        </div>

        {/* Description */}
        {listing.short_description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3" id={`desc-${listing.id}`}>
            {listing.short_description}
          </p>
        )}
      </div>

      {/* Metrics Row (Bento style highlight) */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="grid grid-cols-3 gap-1.5 w-full">
          
          {/* Revenue */}
          <div className="bg-slate-50 px-3 py-2 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">30d Revenue</span>
            <span className="text-sm font-semibold text-slate-800 font-mono mt-0.5">{listing.revenue_30d || "$0"}</span>
          </div>

          {/* Asking Price */}
          <div className="bg-indigo-50/70 px-3 py-2 rounded-xl flex flex-col justify-center border border-indigo-100/40">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Asking Price</span>
            <span className="text-sm font-bold text-indigo-700 font-mono mt-0.5">{listing.asking_price}</span>
          </div>

          {/* Multiple */}
          <div className="bg-slate-50 px-3 py-2 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Multiple</span>
            <span className="text-sm font-semibold text-slate-800 font-mono mt-0.5">{listing.multiple}</span>
          </div>

        </div>
      </div>

      {/* Trigger Button Footer */}
      <div className="mt-5 flex items-center justify-between text-xs text-slate-400 group pt-2">
        <div className="flex items-center gap-1 group-hover:text-amber-500 transition-colors">
          <span className="font-medium text-slate-500">Affiliate ready</span>
        </div>
        <div className="text-indigo-600 font-medium flex items-center gap-0.5 group-hover:underline">
          View details <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}
