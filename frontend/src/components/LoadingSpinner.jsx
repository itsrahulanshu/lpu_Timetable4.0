/**
 * LoadingSpinner Component
 */

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
