/**
 * Home Page - Main Timetable View
 * Redesigned to match native mobile app design
 * Optimized for buttery smooth performance
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useTimetable } from '../hooks/useTimetable';
import TimetableGrid from '../components/TimetableGrid';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import ThemeToggle from '../components/ThemeToggle';
import Onboarding from '../components/Onboarding';
import CurrentNextClass from '../components/CurrentNextClass';
import InstallPrompt from '../components/InstallPrompt';
import RefreshingOverlay from '../components/RefreshingOverlay';

export default function Home() {
  const {
    timetableData,
    loading,
    refreshing,
    error,
    lastUpdated,
    cached,
    isOnline,
    lastFetchInfo,
    cooldownRemaining,
    refresh,
    reload
  } = useTimetable();

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete && error === 'first-time') {
      setShowOnboarding(true);
    }
  }, [error]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Trigger refresh to fetch data
    refresh();
  };

  // Format cooldown message - simpler version
  const getCooldownMessage = () => {
    if (!error || !error.startsWith('cooldown:')) return null;
    
    const [, minutes, seconds] = error.split(':');
    if (minutes === '0') {
      return `⏱️ Please wait ${seconds}s before refreshing again`;
    }
    return `⏱️ Please wait ${minutes}m ${seconds}s before refreshing again`;
  };

  const isCooldownError = error && error.startsWith('cooldown:');

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const updated = new Date(lastUpdated);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    // Format as "Today at HH:MM AM/PM"
    const hours = updated.getHours();
    const minutes = updated.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `Today at ${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Memoize today's class count for better performance
  const todayCount = useMemo(() => {
    if (!timetableData || timetableData.length === 0) return 0;
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    return timetableData.filter(c => c.Day === currentDay).length;
  }, [timetableData]);

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Refreshing Overlay with Live Progress */}
      <RefreshingOverlay isRefreshing={refreshing} />

      {/* Compact Single-Line Header - 60px height */}
      <header className="glass-frosted sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between">
          {/* Left: App Name */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">�</span>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Timetable
            </h1>
          </div>
          
          {/* Center: Last Updated - Show on all devices */}
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{getLastUpdatedText()}</span>
            </div>
          )}
          
          {/* Right: Refresh + Theme Toggle */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={refresh}
              disabled={refreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh timetable"
            >
              <RefreshCw className={`w-5 h-5 text-gray-700 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Helpful Message Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <p className="text-xs sm:text-sm text-center text-amber-800 dark:text-amber-300 font-medium">
            💡 Only refresh if needed, save running cost 🤕💰
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        {/* Cooldown Timer - Simple Banner */}
        {isCooldownError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
          >
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium text-center">
              {getCooldownMessage()}
            </p>
          </motion.div>
        )}

        {loading ? (
          <SkeletonLoader message="Loading your schedule..." />
        ) : error && error !== 'first-time' && !isCooldownError ? (
          <ErrorMessage error={error} onRetry={timetableData.length === 0 ? refresh : reload} cached={cached} />
        ) : timetableData.length === 0 ? (
          /* Empty State - First Time User */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-4"
          >
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4 animate-bounce">👋</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to LPU Timetable!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Tap the <strong className="text-green-600 dark:text-green-500">refresh button</strong> (↻) at the top right to load your class schedule from UMS.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-3xl">☝️</div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <RefreshCw className="w-6 h-6 text-green-600 dark:text-green-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Click the refresh icon above
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                ℹ️ First load may take 10-15 seconds to fetch data from UMS
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats Cards - Replace Info Banner */}
            {timetableData.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Total Classes Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-4xl sm:text-5xl font-bold text-success-600 dark:text-success-500">
                      {timetableData.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Total Classes
                    </div>
                  </div>
                </motion.div>

                {/* Today's Classes Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-4xl sm:text-5xl font-bold text-success-600 dark:text-success-500">
                      {todayCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Today
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Current and Next Class - PRIORITY FEATURE */}
            <CurrentNextClass data={timetableData} />
            
            {/* Full Week Timetable */}
            <TimetableGrid data={timetableData} />
          </>
        )}
      </main>

      {/* Install PWA Prompt */}
      <InstallPrompt />

      {/* Footer */}
      <footer className="mt-8 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-full border border-green-200 dark:border-green-800"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Made with
          </span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            className="text-red-500"
          >
            ❤️
          </motion.span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            by
          </span>
          <span className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 bg-clip-text text-transparent">
            Rahulanshu
          </span>
        </motion.div>
      </footer>
    </div>
  );
}
