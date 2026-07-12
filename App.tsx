import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldAlert, X, ShieldCheck } from 'lucide-react';

interface CookieBannerProps {
  onOpenPrivacy: () => void;
}

export default function CookieBanner({ onOpenPrivacy }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage for existing consent
    const consent = localStorage.getItem('saashelf_cookie_consent');
    if (!consent) {
      // Small timeout to show it naturally after page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('saashelf_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    localStorage.setItem('saashelf_cookie_consent', 'declined_all');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="cookie-consent-banner"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-lg bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-2xl border border-slate-800 z-50 flex flex-col gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shrink-0">
            <Cookie className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-semibold text-sm text-white flex items-center gap-1.5">
              <span>Çerez ve Google AdSense Bilgilendirmesi</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded-full border border-indigo-505/30">AdSense Uyumlu</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Yasal uyumluluk gereği, sitemizde reklamlar (Google AdSense) ve analiz amaçlı üçüncü taraf çerezler kullanılmaktadır. Üçüncü taraf satıcı olarak Google, sitemizde reklam yayınlamak için çerezleri kullanır. Detaylı bilgiye ve çerez yönetimine <button onClick={onOpenPrivacy} className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer">Gizlilik Politikamız</button> üzerinden erişebilirsiniz.
            </p>
          </div>
          <button 
            id="close-cookie-banner-x"
            onClick={handleDeclineAll} 
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-slate-800 text-xs">
          <button
            id="cookie-decline-btn"
            onClick={handleDeclineAll}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-semibold transition-all cursor-pointer"
          >
            Yalnızca Zorunlu / Reddet
          </button>
          <button
            id="cookie-accept-btn"
            onClick={handleAcceptAll}
            className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Tümünü Kabul Et
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
