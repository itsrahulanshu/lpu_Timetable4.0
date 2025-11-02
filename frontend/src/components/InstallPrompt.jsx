/**
 * InstallPrompt Component
 * Shows install app prompt after 2 minutes or 3 visits
 */

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Track visits
    const visitCount = parseInt(localStorage.getItem('app_visit_count') || '0');
    localStorage.setItem('app_visit_count', (visitCount + 1).toString());

    // Check if user has already dismissed or installed
    const dismissed = localStorage.getItem('install_prompt_dismissed');
    const installed = localStorage.getItem('pwa_installed');

    if (dismissed === 'true' || installed === 'true') {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 2 minutes or if 3+ visits
      if (visitCount >= 3) {
        setShowPrompt(true);
      } else {
        setTimeout(() => {
          setShowPrompt(true);
        }, 120000); // 2 minutes
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('install_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in safe-bottom">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
              📱
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Install LPU Timetable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get quick access to your schedule with these benefits:
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Works offline - access anytime
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant loading - like a native app
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Home screen icon for quick access
                </li>
              </ul>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/50 transform hover:scale-105 active:scale-95"
                >
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
