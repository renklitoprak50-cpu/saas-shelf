import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Coins, TrendingUp, Layers } from 'lucide-react';

import { StartupListing } from '@/src/types';
import listingsData from '@/data/listings.json';

const listings = listingsData as StartupListing[];

function getSlug(listing: StartupListing): string {
  if (listing.slug) return listing.slug;
  if (listing.original_url) {
    const parts = listing.original_url.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart) return lastPart;
  }
  return listing.startup_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = listings.find((l) => getSlug(l) === slug);

  if (!listing) {
    return {
      title: 'Startup Not Found | SaaShelf',
    };
  }

  const title = `${listing.startup_name} - Buy Startup Listing | SaaShelf`;
  const description = listing.short_description || `${listing.category} startup: ${listing.startup_name} is up for acquisition with ${listing.revenue_30d} 30d revenue.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return listings.map((listing) => ({
    slug: getSlug(listing),
  }));
}

export default async function StartupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = listings.find((l) => getSlug(l) === slug);
  if (!listing) {
    notFound();
  }

  // Affiliate link mapping: original_url?ref=toprak-renkli-2800ac
  const baseAffLink = listing.original_url;
  const referralCode = 'toprak-renkli-2800ac';
  
  let affiliateUrl = baseAffLink;
  if (listing.source_platform.toLowerCase() === 'trustmrr') {
    affiliateUrl = baseAffLink.includes('?') 
      ? `${baseAffLink}&ref=${referralCode}` 
      : `${baseAffLink}?ref=${referralCode}`;
  } else if (listing.source_platform.toLowerCase() === 'flippa') {
    affiliateUrl = baseAffLink.includes('?') 
      ? `${baseAffLink}&utm_source=saashelf&aff=saashelf_partner` 
      : `${baseAffLink}?utm_source=saashelf&aff=saashelf_partner`;
  } else if (listing.source_platform.toLowerCase() === 'empireflippers') {
    affiliateUrl = baseAffLink.includes('?') 
      ? `${baseAffLink}&referral=EF_SAASHELF` 
      : `${baseAffLink}?referral=EF_SAASHELF`;
  } else {
    // Default fallback
    affiliateUrl = baseAffLink.includes('?') 
      ? `${baseAffLink}&ref=${referralCode}` 
      : `${baseAffLink}?ref=${referralCode}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      
      {/* SaaShelf Header */}
      <header className="bg-white border-b border-slate-100 py-5 px-6 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
              <span className="font-display font-bold text-lg">S$</span>
            </div>
            <span className="font-display text-xl font-black text-slate-900 tracking-tight">
              SaaShelf
            </span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-md">
            Acquisition Details
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 md:px-6 py-10 md:py-16 flex-1 flex flex-col justify-center">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-xs font-semibold mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Dynamic Detail Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100/50">
          
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                {listing.category || 'Startup'}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
                {listing.startup_name}
              </h1>
            </div>
            
            <div className="bg-indigo-50/50 border border-indigo-100/40 rounded-2xl px-5 py-3 text-left md:text-right shrink-0 min-w-[150px]">
              <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase">Asking Price</span>
              <span className="text-2xl font-black text-indigo-600 font-mono mt-0.5 inline-block">{listing.asking_price}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-150">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">30d Revenue</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{listing.revenue_30d || "$0"}</span>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-slate-150">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Valuation Multiple</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{listing.multiple || "N/A"}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-slate-150">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Source Platform</span>
                <span className="text-lg font-bold text-slate-800 capitalize font-mono">{listing.source_platform || "TrustMRR"}</span>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="mb-10 space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold">About the Listing</h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {listing.short_description || "This premium startup features solid recurring revenue and holds a verified seller profile. Perfect opportunity for entrepreneurs looking to acquire a verified SaaS product."}
            </p>
          </div>

          {/* Call to Action Footer */}
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Attribution-tracked link verified. Attributed with <strong>{referralCode}</strong>.</span>
            </div>

            <a 
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 text-center text-sm cursor-pointer shadow-md"
            >
              Acquire Startup
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>

        </div>
      </main>

      {/* Footer Area */}
      <footer className="bg-white border-t border-slate-100 py-6 px-6 text-center text-xs text-slate-400">
        <p>© 2026 SaaShelf Directory. Attributed startup marketplace.</p>
      </footer>

    </div>
  );
}
