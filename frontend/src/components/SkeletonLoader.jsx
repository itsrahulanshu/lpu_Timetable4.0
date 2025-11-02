/**
 * SkeletonLoader Component
 * Displays animated skeleton screens with modern shimmer effect
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function SkeletonLoader({ message = 'Loading your schedule...' }) {
  return (
    <div className="space-y-6">
      {/* Loading message with animation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <div className="inline-flex items-center gap-3 px-8 py-4 glass rounded-2xl shadow-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-6 h-6 text-primary" />
          </motion.div>
          <span className="text-primary font-semibold text-lg">{message}</span>
        </div>
      </motion.div>

      {/* Skeleton cards for multiple days */}
      {[0, 1, 2].map((day, dayIndex) => (
        <motion.div
          key={day}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.1 }}
        >
          {/* Day title skeleton */}
          <div className="relative h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 overflow-hidden">
            <div className="shimmer"></div>
          </div>
          
          {/* Class cards skeleton */}
          <div className="space-y-4">
            {[0, 1, 2].map((card, cardIndex) => (
              <motion.div
                key={card}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: dayIndex * 0.1 + cardIndex * 0.05 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 shimmer"></div>
                
                <div className="flex items-start justify-between gap-4 relative">
                  <div className="flex-1 space-y-4">
                    {/* Type and time badges */}
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                    
                    {/* Course name */}
                    <div className="space-y-2">
                      <div className="h-6 w-4/5 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                      <div className="h-6 w-3/5 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    </div>
                    
                    {/* Course code */}
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  
                  {/* Room info */}
                  <div className="text-right space-y-3">
                    <div className="h-12 w-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg ml-auto"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
