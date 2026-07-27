import React, { useEffect, useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';

declare const __APP_BUILD_TIME__: string;

export default function AutoUpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // 1. Unregister legacy service workers & clear stale browser cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }

    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }

    // 2. Initial build time
    const localBuildTime = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : null;

    const checkNewVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.version) {
            const serverVersion = String(data.version);
            if (localBuildTime && serverVersion !== String(localBuildTime)) {
              setUpdateAvailable(true);
            }
          }
        }
      } catch (err) {
        // Silently catch fetch errors (e.g. offline)
      }
    };

    // Check version immediately on mount
    checkNewVersion();

    // Check version every 45 seconds
    const interval = setInterval(checkNewVersion, 45000);

    // Check version on tab focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        checkNewVersion();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleApplyUpdate = () => {
    setIsRefreshing(true);
    // Hard reload bypassing cache
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-neutral-900 text-white border border-red-500/50 rounded-2xl p-4 shadow-2xl max-w-sm animate-bounce font-sans">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-red-600 rounded-xl text-white shrink-0 mt-0.5">
          <Zap className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex-1 text-xs space-y-1">
          <p className="font-extrabold text-sm text-red-400">নতুন আপডেট প্রকাশিত হয়েছে!</p>
          <p className="text-neutral-300 font-medium leading-relaxed">
            ওয়েবসাইটের নতুন সংষ্করণ রিলিজ হয়েছে। সর্বাধুনিক অভিজ্ঞতা পেতে এখনই রিফ্রেশ করুন।
          </p>
          <button
            onClick={handleApplyUpdate}
            disabled={isRefreshing}
            className="mt-2 w-full py-2 px-3 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'হালনাগাদ করা হচ্ছে...' : 'এখনই নতুন সংস্করণ লোড করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
