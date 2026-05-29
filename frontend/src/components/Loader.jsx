/**
 * Loader component with animated spinner and optional message.
 */
export default function Loader({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-surface-200" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent 
                      border-t-primary-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-surface-500 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
}
