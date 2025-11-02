/**
 * TimetableGrid Component
 * Native mobile app design with horizontal pill navigation
 * Optimized for buttery smooth performance
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, DoorOpen, Users } from 'lucide-react';

export default function TimetableGrid({ data }) {
  const [selectedDay, setSelectedDay] = useState('All');

  const days = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = {
    'All': 'All',
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };

  // Set current day on mount
  useEffect(() => {
    const currentDayIndex = new Date().getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    setSelectedDay(dayNames[currentDayIndex]);
  }, []);

  // Memoize grouped data for better performance
  const groupedByDay = useMemo(() => {
    const grouped = data.reduce((acc, classItem) => {
      const day = classItem.Day || 'Unknown';
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(classItem);
      return acc;
    }, {});

    // Sort classes by time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const timeA = a.timeRange?.start || 0;
        const timeB = b.timeRange?.start || 0;
        return timeA - timeB;
      });
    });

    return grouped;
  }, [data]);

  // Memoize display classes
  const displayClasses = useMemo(() => {
    if (selectedDay === 'All') {
      return data;
    }
    return groupedByDay[fullDays[selectedDay]] || [];
  }, [selectedDay, data, groupedByDay]);
  const hasClasses = displayClasses.length > 0;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No timetable data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Horizontal Pill Navigation */}
      <div className="overflow-x-auto scrollbar-hide pb-1 no-flicker">
        <div className="flex gap-2 w-fit mx-auto">
          {days.map((day) => {
            const isSelected = day === selectedDay;
            const dayClasses = day === 'All' ? data : (groupedByDay[fullDays[day]] || []);
            const hasClassesForDay = dayClasses.length > 0;

            return (
              <motion.button
                key={day}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`
                  px-6 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap
                  ${isSelected 
                    ? 'bg-success-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
                  }
                `}
                style={{ 
                  transform: 'translate3d(0, 0, 0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {day}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Day Section Header */}
      {selectedDay !== 'All' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success-600 rounded-t-xl px-6 py-4 flex items-center justify-between"
        >
          <h2 className="text-white font-bold text-lg">
            {fullDays[selectedDay]}
          </h2>
          <span className="text-white text-sm font-medium">
            {displayClasses.length} {displayClasses.length === 1 ? 'class' : 'classes'}
          </span>
        </motion.div>
      )}

      {/* Classes Grid */}
      <AnimatePresence mode="sync">
        {hasClasses ? (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="space-y-4"
            style={{ 
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {displayClasses.map((classItem, index) => (
              <ClassCard key={`${classItem.Day}-${index}`} classItem={classItem} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center"
          >
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No classes scheduled
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enjoy your free time! 🎉
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClassCard({ classItem, index }) {
  const getClassTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'lecture':
        return 'bg-blue-500 text-white';
      case 'practical':
      case 'lab':
        return 'bg-purple-500 text-white';
      case 'tutorial':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Extract building number from Room (e.g., "38-605D" -> building: "38", room: "605D")
  const getBuildingAndRoom = () => {
    const room = classItem.Room || '';
    const parts = room.split('-');
    if (parts.length >= 2) {
      return { building: parts[0], room: parts.slice(1).join('-') };
    }
    return { building: '', room: room };
  };

  const { building, room } = getBuildingAndRoom();

  // Dynamic font size based on text length
  const getFontSize = (text) => {
    const length = text?.length || 0;
    if (length > 6) return 'text-base'; // 16px for very long text
    if (length > 4) return 'text-xl';   // 20px for long text
    if (length > 2) return 'text-2xl';  // 24px for medium text
    return 'text-3xl';                   // 32px for short text
  };

  const buildingText = building || (classItem.parsedInfo?.building) || '-';
  const roomText = room || '-';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.03,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="relative overflow-hidden rounded-2xl bg-[#F0F4FF] dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-600 p-5 shadow-sm"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
    >
      {/* Course Code with Time and Type Badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          {classItem.CourseCode || classItem.Subject || 'Unknown'}
        </h3>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Time Badge */}
          <div className="px-3 py-1 rounded-full bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold whitespace-nowrap">
            {classItem.AttendanceTime || classItem.Time || 'N/A'}
          </div>

          {/* Class Type Badge */}
          {classItem.Type && (
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${getClassTypeColor(classItem.Type)}`}>
              {classItem.Type}
            </div>
          )}
        </div>
      </div>

      {/* Course Name */}
      <div className="mb-4">
        {classItem.CourseName && (
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {classItem.CourseName}
          </p>
        )}
      </div>

      {/* Three Bottom Boxes */}
      <div className="grid grid-cols-3 gap-2">
        {/* Building Box */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm text-center">
          <div className="flex flex-col items-center gap-1">
            <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <div className={`font-extrabold ${getFontSize(buildingText)} text-gray-900 dark:text-white leading-none break-all px-1`}>
              {buildingText}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">
              Building
            </div>
          </div>
        </div>

        {/* Room Box */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm text-center">
          <div className="flex flex-col items-center gap-1">
            <DoorOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <div className={`font-extrabold ${getFontSize(roomText)} text-gray-900 dark:text-white leading-none break-all px-1`}>
              {roomText}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">
              Room
            </div>
          </div>
        </div>

        {/* Group Box */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm text-center">
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-green-500 dark:text-green-400" />
            <div className="font-extrabold text-3xl text-gray-900 dark:text-white leading-none break-all px-1">
              {classItem.Group || 'ALL'}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">
              Group
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
