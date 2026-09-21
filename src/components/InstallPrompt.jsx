import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle2, Sparkles, ChevronRight, Info } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone mode (installed PWA)
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isRunningStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check device platform (iOS Safari vs Android/Chromium/Desktop)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    const isIOSSafari = isIOSDevice && /safari/.test(userAgent) && !/crios|fxios|opios|mercury/.test(userAgent);
    setIsIOS(isIOSSafari);

    // 3. Check if user dismissed prompt within the last 24 hours
    const dismissedAt = localStorage.getItem('icms_pwa_dismissed_at');
    const isDismissedRecently = dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000;

    // 4. Capture native beforeinstallprompt (Chromium / Android / Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissedRecently) {
        setIsVisible(true);
      }
    };

    // 5. Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem('icms_pwa_dismissed_at');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. For iOS Safari: since beforeinstallprompt does not fire, show banner if not recently dismissed
    if (isIOSSafari && !isDismissedRecently) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Open clean iOS instructions guide
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback if prompt wasn't triggered yet
      alert('To install ICMS, open your browser menu (⋮ or ...) and tap "Install App" or "Add to Home screen".');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSModal(false);
    // Snooze for 24 hours
    localStorage.setItem('icms_pwa_dismissed_at', Date.now().toString());
  };

  // If already installed, don't render anything
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* ─── Bottom/Floating Install Banner ─── */}
      {isVisible && (
        <div 
          role="region" 
          aria-label="Install ICMS Application"
          className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-50 transition-all duration-300 transform translate-y-0"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200/80 ring-1 ring-black/5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="relative flex-shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="ICMS App Icon"
                  className="w-12 h-12 rounded-xl shadow-md object-cover border border-[#EAD508]/30"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0e7816] ring-2 ring-white text-[9px] text-white font-bold">
                  ✓
                </span>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-sm font-bold text-[#0f172a] truncate">
                  ICMS Attendance
                </h4>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close install prompt"
                className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-center"
              >
                Not Now
              </button>
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-2 py-2 px-4 text-xs font-bold text-[#0f172a] bg-[#EAD508] hover:bg-[#003D76] hover:text-white rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                {isIOS ? (
                  <>
                    <Share className="w-3.5 h-3.5 text-current" />
                    <span>How to Install</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-current" />
                    <span>Install</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── iOS Safari Instructions Modal ─── */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 transition-transform animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img
                  src="/pwa-192x192.png"
                  alt="ICMS Logo"
                  className="w-9 h-9 rounded-xl shadow-sm border border-[#EAD508]/30"
                />
                <div>
                  <h3 id="ios-install-title" className="text-sm font-bold text-[#0f172a]">
                    Install ICMS on iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-slate-500">Safari Installation Guide</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="py-4 space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Tap the <strong className="text-slate-900 inline-flex items-center gap-1 font-semibold">Share button <Share className="w-3.5 h-3.5 inline text-blue-600" /></strong> in Safari's bottom toolbar.
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Scroll down the share options and tap <strong className="text-slate-900 inline-flex items-center gap-1 font-semibold">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-amber-600" /></strong>.
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Tap <strong className="text-slate-900 font-semibold">Add</strong> in the top-right corner. ICMS will launch in full screen right from your home screen!
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowIOSModal(false);
                  setIsVisible(false);
                }}
                className="w-full py-2.5 px-4 text-xs font-bold text-[#0f172a] bg-[#EAD508] hover:bg-[#003D76] hover:text-white rounded-xl shadow-sm transition-all text-center"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
