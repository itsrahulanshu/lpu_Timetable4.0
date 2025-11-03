/**
 * ErrorMessage Component
 * User-friendly error messages with helpful actions
 */

export default function ErrorMessage({ error, onRetry, cached = false }) {
  // Determine error type and customize message
  let icon = '⚠️';
  let title = 'Oops! Something went wrong';
  let message = error;
  let showRetry = true;
  let showCachedOption = cached;
  let bgColor = 'bg-orange-50 dark:bg-orange-900/20';
  let borderColor = 'border-orange-200 dark:border-orange-800';
  let textColor = 'text-orange-800 dark:text-orange-300';
  let subtextColor = 'text-orange-700 dark:text-orange-400';

  // Customize based on error type
  if (error?.includes('offline') || error?.includes('Offline')) {
    icon = '📡';
    title = 'You\'re Offline';
    message = 'No internet connection. Don\'t worry, you can still view your cached timetable!';
    bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    borderColor = 'border-blue-200 dark:border-blue-800';
    textColor = 'text-blue-800 dark:text-blue-300';
    subtextColor = 'text-blue-700 dark:text-blue-400';
    showRetry = false;
  } else if (error?.includes('connection') || error?.includes('Connection')) {
    icon = '🔌';
    title = 'Connection Issue';
    message = 'Couldn\'t connect to the server. Please check your internet connection and try again.';
  } else if (error?.includes('wait') || error?.includes('cooldown')) {
    // Don't show the big error box for cooldown - it's handled in Home.jsx
    return null;
  } else if (error?.includes('cached') || error?.includes('Cached')) {
    icon = '📦';
    title = 'Showing Cached Data';
    bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    borderColor = 'border-blue-200 dark:border-blue-800';
    textColor = 'text-blue-800 dark:text-blue-300';
    subtextColor = 'text-blue-700 dark:text-blue-400';
  }

  return (
    <div className={`${bgColor} border ${borderColor} rounded-2xl p-6 my-6 shadow-md`}>
      <div className="text-center">
        {/* Icon */}
        <div className="text-6xl mb-4">{icon}</div>
        
        {/* Title */}
        <h3 className={`text-xl font-bold ${textColor} mb-2`}>
          {title}
        </h3>
        
        {/* Message */}
        <p className={`${subtextColor} mb-4 leading-relaxed`}>
          {message}
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-w-[140px]"
            >
              🔄 Try Again
            </button>
          )}
          
          {showCachedOption && (
            <div className={`text-sm ${subtextColor} flex items-center gap-2`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Viewing your last saved schedule</span>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="mt-6 pt-4 border-t border-current/10">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 Tip: Make sure you have a stable internet connection. The app works offline too!
          </p>
        </div>
      </div>
    </div>
  );
}
