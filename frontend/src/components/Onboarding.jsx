/**
 * Onboarding Component
 * 4-step welcome tutorial for first-time users
 */

import { useState } from 'react';

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: '🎓',
      title: 'Welcome to LPU Timetable!',
      description: 'Your modern class schedule app with native mobile design. Never miss a class again!',
      illustration: (
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-6xl animate-bounce">
          🎓
        </div>
      )
    },
    {
      icon: '�',
      title: 'Tap Refresh to Load Schedule',
      description: 'First time? Tap the refresh button (top right) to fetch your timetable from UMS. It may take 10-15 seconds.',
      illustration: (
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">👆</div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-green-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 font-medium">
              Click refresh button to load your classes
            </p>
          </div>
        </div>
      )
    },
    {
      icon: '📊',
      title: 'Stats Cards & Navigation',
      description: 'View total and today\'s classes at a glance. Use horizontal pills to navigate between days.',
      illustration: (
        <div className="space-y-4">
          {/* Stats Cards Preview */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-600">38</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
              </div>
            </div>
          </div>
          {/* Day Pills Preview */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Mon', 'Tue', 'Wed'].map((day, i) => (
              <div
                key={day}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                  i === 1
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: '�',
      title: 'Huge Building & Room Numbers',
      description: 'Class cards show LARGE building and room numbers for quick scanning. Plus current/next class highlighting!',
      illustration: (
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm">CAP455</div>
              <div className="flex gap-1">
                <div className="px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-full">9-10 AM</div>
                <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">LECTURE</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">Object Oriented Programming</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-2 text-center">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">38</div>
                <div className="text-[8px] text-gray-500 uppercase">Building</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-2 text-center">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">605D</div>
                <div className="text-[8px] text-gray-500 uppercase">Room</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-2 text-center">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">ALL</div>
                <div className="text-[8px] text-gray-500 uppercase">Group</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: '✨',
      title: 'Dark Mode & Offline',
      description: 'Toggle dark mode anytime. Your timetable is cached for offline access. Works without internet after first load!',
      illustration: (
        <div className="flex gap-4 justify-center items-center">
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
              ☀️
            </div>
            <div className="text-xs text-center mt-2 font-medium">Light</div>
          </div>
          <div className="text-2xl">↔️</div>
          <div className="bg-gray-900 p-4 rounded-xl shadow-lg border-2 border-gray-700">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🌙
            </div>
            <div className="text-xs text-center mt-2 font-medium text-white">Dark</div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    // Mark onboarding as complete in localStorage
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Content */}
        <div className="text-center animate-fade-in">
          {/* Illustration */}
          <div className="mb-8">
            {currentStepData.illustration}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-green-600'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-500/50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGetStarted}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-500/50 transform hover:scale-105"
              >
                🚀 Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
