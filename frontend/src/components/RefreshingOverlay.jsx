/**
 * RefreshingOverlay Component
 * Shows live progress when refreshing timetable
 * Keeps user engaged with step-by-step updates
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 1, text: '🔐 Authenticating...', duration: 2000, icon: '🔐' },
  { id: 2, text: '✅ Login successful', duration: 1500, icon: '✅' },
  { id: 3, text: '📚 Fetching classes...', duration: 3000, icon: '📚' },
  { id: 4, text: '⏰ Loading schedules...', duration: 2000, icon: '⏰' },
  { id: 5, text: '✨ Almost done...', duration: 1500, icon: '✨' },
];

export default function RefreshingOverlay({ isRefreshing, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (!isRefreshing) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    // Start from step 0
    setCurrentStep(0);
    setCompletedSteps([]);
    
    let timeoutId;
    let currentStepIndex = 0;

    const runStep = () => {
      if (currentStepIndex < STEPS.length) {
        setCurrentStep(currentStepIndex);
        
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStepIndex]);
          currentStepIndex++;
          runStep();
        }, STEPS[currentStepIndex].duration);
      } else {
        // All steps done
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    };

    runStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRefreshing, onComplete]);

  if (!isRefreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4 inline-block"
          >
            🔄
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Refreshing Timetable
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we fetch the latest data
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSteps.includes(index);
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                }`}
              >
                {/* Icon */}
                <div className="text-3xl">
                  {isCompleted ? '✅' : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      {step.icon}
                    </motion.div>
                  ) : (
                    <span className="opacity-30">{step.icon}</span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isActive
                        ? 'text-blue-700 dark:text-blue-300'
                        : isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.text}
                  </p>
                </div>

                {/* Loading Spinner for active step */}
                {isActive && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                )}

                {/* Checkmark for completed */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500 text-xl"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
            />
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
