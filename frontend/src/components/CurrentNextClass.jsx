/**
 * CurrentNextClass Component
 * Displays current and next class with prominent building/room numbers
 * This is the MAIN feature - users should instantly know their next class
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  Clock, 
  Building2, 
  DoorOpen, 
  Coffee, 
  Sunrise, 
  CheckCircle2,
  Calendar,
  BookOpen,
  Trophy
} from 'lucide-react';

export default function CurrentNextClass({ data }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [timeStatus, setTimeStatus] = useState('');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Calculate current and next class
  useEffect(() => {
    if (!data || data.length === 0) return;

    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Filter today's classes
    const todayClasses = data
      .filter(c => c.Day === currentDay)
      .map(c => {
        // Try to get start and end times from various possible fields
        let startTime = '';
        let endTime = '';
        
        if (c.timeRange?.startTime && c.timeRange?.endTime) {
          startTime = c.timeRange.startTime;
          endTime = c.timeRange.endTime;
        } else if (c.AttendanceTime) {
          const times = c.AttendanceTime.split('-');
          startTime = times[0]?.trim() || '00:00';
          endTime = times[1]?.trim() || '00:00';
        }
        
        return {
          ...c,
          startMinutes: parseTimeToMinutes(startTime),
          endMinutes: parseTimeToMinutes(endTime)
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);

    let current = null;
    let next = null;

    // Find current and next class
    for (let i = 0; i < todayClasses.length; i++) {
      const classItem = todayClasses[i];
      
      if (currentMinutes >= classItem.startMinutes && currentMinutes < classItem.endMinutes) {
        // Currently in this class
        current = classItem;
        next = todayClasses[i + 1] || null;
        setTimeStatus('in-class');
        break;
      } else if (currentMinutes < classItem.startMinutes) {
        // This is the next class
        next = classItem;
        if (i > 0 && currentMinutes < todayClasses[i - 1].endMinutes) {
          current = todayClasses[i - 1];
          setTimeStatus('in-class');
        } else {
          setTimeStatus('break');
        }
        break;
      }
    }

    // Check if before first class
    if (!current && !next && todayClasses.length > 0 && currentMinutes < todayClasses[0].startMinutes) {
      next = todayClasses[0];
      setTimeStatus('before-class');
    }

    // Check if after last class
    if (!current && !next && todayClasses.length > 0 && currentMinutes >= todayClasses[todayClasses.length - 1].endMinutes) {
      setTimeStatus('after-class');
      
      // Look for tomorrow's first class
      const tomorrow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(now.getDay() + 1) % 7];
      const tomorrowClasses = data
        .filter(c => c.Day === tomorrow)
        .map(c => ({
          ...c,
          startMinutes: parseTimeToMinutes(c.timeRange?.startTime || c.AttendanceTime?.split('-')[0] || '00:00')
        }))
        .sort((a, b) => a.startMinutes - b.startMinutes);
      
      if (tomorrowClasses.length > 0) {
        next = { ...tomorrowClasses[0], isTomorrow: true };
      }
    }

    setCurrentClass(current);
    setNextClass(next);
  }, [data, currentTime]);

  // Helper function to parse time string to minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    
    // Remove any whitespace
    timeStr = timeStr.trim();
    
    // Handle 12-hour format (e.g., "9:00 AM", "2:30 PM")
    if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
      const isPM = timeStr.toUpperCase().includes('PM');
      const timeOnly = timeStr.replace(/AM|PM|am|pm/gi, '').trim();
      const [hours, minutes] = timeOnly.split(':').map(num => parseInt(num) || 0);
      
      let adjustedHours = hours;
      if (isPM && hours !== 12) {
        adjustedHours = hours + 12;
      } else if (!isPM && hours === 12) {
        adjustedHours = 0;
      }
      
      return adjustedHours * 60 + minutes;
    }
    
    // Handle 24-hour format (e.g., "09:00", "14:30")
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num) || 0);
    return hours * 60 + minutes;
  };

  // Calculate time remaining/until
  const getTimeRemaining = (classItem, isCurrent) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    if (isCurrent) {
      const remaining = classItem.endMinutes - currentMinutes;
      const hours = Math.floor(remaining / 60);
      const mins = remaining % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    } else {
      const until = classItem.startMinutes - currentMinutes;
      if (classItem.isTomorrow) {
        const remainingToday = (24 * 60) - currentMinutes;
        const totalUntil = remainingToday + classItem.startMinutes;
        const hours = Math.floor(totalUntil / 60);
        const mins = totalUntil % 60;
        return `${hours}h ${mins}m (tomorrow)`;
      }
      const hours = Math.floor(until / 60);
      const mins = until % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    }
  };

  // Calculate progress percentage
  const getProgress = (classItem) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const duration = classItem.endMinutes - classItem.startMinutes;
    const elapsed = currentMinutes - classItem.startMinutes;
    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  };

  // Extract building and room info
  const getBuildingRoom = (classItem) => {
    const building = classItem.parsedInfo?.building || classItem.Building || '';
    const room = classItem.Room || classItem.parsedInfo?.room || '';
    return { building, room };
  };

  // No classes today - Only show this if there are truly no classes for today
  if (!currentClass && !nextClass) {
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    
    // Double check if there are any classes today
    const todayClasses = data?.filter(c => c.Day === currentDay) || [];
    
    // If there are classes but we don't have current/next, something went wrong with time parsing
    // In that case, don't show "no classes" message
    if (todayClasses.length > 0) {
      return null; // Don't show anything, let TimetableGrid show the classes
    }
    
    let message = '📚 No classes scheduled for today';
    let Icon = BookOpen;
    let subMessage = 'Enjoy your free time!';
    let gradientClasses = 'from-blue-500 to-purple-600';

    if (currentDay === 'Saturday') {
      Icon = Trophy;
      message = 'No Classes Today!';
      subMessage = 'Enjoy your weekend! Time to relax and recharge 🌟';
      gradientClasses = 'from-pink-500 to-orange-500';
    } else if (currentDay === 'Sunday') {
      Icon = Coffee;
      message = "It's Sunday!";
      subMessage = 'Hurray! Time for fun and rest 🎊 Recharge for the week ahead ⚡';
      gradientClasses = 'from-amber-500 to-red-500';
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-6 relative overflow-hidden"
      >
        {/* Gradient background with mesh effect */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
        
        <div className={`relative glass-frosted rounded-3xl p-8 sm:p-12 text-center border-2 border-white/20 dark:border-white/10 shadow-xl`}>
          {/* Animated icon */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="inline-block mb-6"
          >
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${gradientClasses} flex items-center justify-center shadow-2xl glow`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-3">{message}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">{subMessage}</p>
          
          {/* Decorative elements */}
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradientClasses}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 mb-6"
    >
      {/* Status message */}
      <AnimatePresence mode="wait">
        {timeStatus === 'before-class' && nextClass && (
          <motion.div
            key="before-class"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass rounded-2xl p-4 border-l-4 border-orange-500"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sunrise className="w-6 h-6 text-orange-500" />
              </motion.div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Good Morning! First class today:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Starts in {getTimeRemaining(nextClass, false)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {timeStatus === 'break' && nextClass && (
          <motion.div
            key="break"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass rounded-2xl p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Coffee className="w-6 h-6 text-green-500" />
              </motion.div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Break Time ☕</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Next class in {getTimeRemaining(nextClass, false)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {timeStatus === 'after-class' && (
          <motion.div
            key="after-class"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass rounded-2xl p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </motion.div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">All classes done for today! 🎉</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Great work! Time to relax</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Class Card */}
      {currentClass && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Pulsing gradient border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-75"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          <div className="relative m-1 glass rounded-[22px] p-6 sm:p-8">
            {/* Live badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold mb-4 shadow-lg"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Radio className="w-4 h-4" />
              <span>LIVE NOW</span>
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Course name with gradient */}
            <h3 className="text-3xl sm:text-4xl font-bold text-gradient-secondary mb-6 leading-tight">
              {currentClass.CourseName || currentClass.parsedInfo?.courseName}
            </h3>

            {/* Time progress with animated bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {currentClass.AttendanceTime}
                </span>
                <motion.span
                  key={getTimeRemaining(currentClass, true)}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm font-bold text-red-600 dark:text-red-400"
                >
                  Ends in {getTimeRemaining(currentClass, true)}
                </motion.span>
              </div>
              
              {/* Gradient progress bar */}
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${getProgress(currentClass)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute top-0 h-full w-20 bg-white/30 blur-sm"
                  animate={{ left: ['0%', `${getProgress(currentClass)}%`] }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round(getProgress(currentClass))}% complete
              </div>
            </div>

            {/* Building and Room - HUGE NUMBERS */}
            <div className="grid grid-cols-2 gap-4">
              {getBuildingRoom(currentClass).building && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-300 dark:border-red-700 p-6 text-center"
                >
                  <div className="absolute top-2 right-2">
                    <Building2 className="w-5 h-5 text-red-600 dark:text-red-400 opacity-50" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Building</div>
                  <div className="text-5xl font-black text-red-600 dark:text-red-400">
                    {getBuildingRoom(currentClass).building}
                  </div>
                </motion.div>
              )}
              {getBuildingRoom(currentClass).room && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-300 dark:border-orange-700 p-6 text-center"
                >
                  <div className="absolute top-2 right-2">
                    <DoorOpen className="w-5 h-5 text-orange-600 dark:text-orange-400 opacity-50" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Room</div>
                  <div className="text-5xl font-black text-orange-600 dark:text-orange-400">
                    {getBuildingRoom(currentClass).room}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Type badge */}
            {currentClass.Type && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{currentClass.Type}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Next Class Card */}
      {nextClass && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl gradient-border"
        >
          <div className="glass rounded-[22px] p-6 sm:p-8">
            {/* Up Next badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold shadow-lg">
                <Clock className="w-4 h-4" />
                <span>UP NEXT</span>
              </div>
              {nextClass.isTomorrow && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Tomorrow</span>
                </div>
              )}
            </div>

            {/* Course name with gradient */}
            <h3 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-6 leading-tight">
              {nextClass.CourseName || nextClass.parsedInfo?.courseName}
            </h3>

            {/* Countdown */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {nextClass.AttendanceTime}
                </span>
                <motion.span
                  key={getTimeRemaining(nextClass, false)}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400"
                >
                  {getTimeRemaining(nextClass, false)}
                </motion.span>
              </div>
            </div>

            {/* Building and Room - HUGE NUMBERS */}
            <div className="grid grid-cols-2 gap-4">
              {getBuildingRoom(nextClass).building && (
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-300 dark:border-blue-700 p-6 text-center"
                >
                  <div className="absolute top-2 right-2">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 opacity-50" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Building</div>
                  <div className="text-5xl font-black text-blue-600 dark:text-blue-400">
                    {getBuildingRoom(nextClass).building}
                  </div>
                </motion.div>
              )}
              {getBuildingRoom(nextClass).room && (
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-300 dark:border-cyan-700 p-6 text-center"
                >
                  <div className="absolute top-2 right-2">
                    <DoorOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400 opacity-50" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Room</div>
                  <div className="text-5xl font-black text-cyan-600 dark:text-cyan-400">
                    {getBuildingRoom(nextClass).room}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Course code and type */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {nextClass.Type && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{nextClass.Type}</span>
                </div>
              )}
              {nextClass.CourseCode && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600">
                  <BookOpen className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{nextClass.CourseCode}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
