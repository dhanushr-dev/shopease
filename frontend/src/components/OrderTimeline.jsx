import { HiCheck, HiTruck, HiHome, HiClock, HiXCircle } from 'react-icons/hi';

export default function OrderTimeline({ history = [], currentStatus }) {
  const steps = [
    { status: 'PENDING', label: 'Order Placed', icon: HiClock },
    { status: 'CONFIRMED', label: 'Confirmed', icon: HiCheck },
    { status: 'SHIPPED', label: 'Shipped', icon: HiTruck },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: HiTruck },
    { status: 'DELIVERED', label: 'Delivered', icon: HiHome },
  ];

  if (['CANCELLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED', 'REFUND_INITIATED', 'REFUND_COMPLETED'].includes(currentStatus)) {
    return (
      <div className="flex items-center gap-3 p-4 bg-surface-100 text-surface-700 rounded-xl border border-surface-200">
        <HiXCircle className="w-6 h-6 text-red-500" />
        <div>
          <p className="font-bold">Order Status: {currentStatus.replace(/_/g, ' ')}</p>
          <p className="text-sm">This order is currently in a special state.</p>
        </div>
      </div>
    );
  }

  // Find the current step index based on history or currentStatus
  // History is an array of objects: { status, message, timestamp }
  const getStepStatus = (stepStatus) => {
    const stepIndex = steps.findIndex(s => s.status === stepStatus);
    const currentIndex = steps.findIndex(s => s.status === currentStatus);

    // Strictly prevent future steps from being marked completed
    if (currentIndex !== -1 && stepIndex > currentIndex) {
      return { completed: false };
    }

    const historyItem = history.find(h => h.status === stepStatus);
    if (historyItem) return { completed: true, ...historyItem };
    
    // If not in history but we know current status is past this point (fallback)
    if (currentIndex >= stepIndex && currentIndex !== -1) {
      return { completed: true };
    }
    return { completed: false };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="py-6">
      <div className="relative flex justify-between">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-5 w-full h-1 bg-surface-200 -z-10 rounded-full"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-5 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-1000"
          style={{ 
            width: `${(Math.max(0, steps.findIndex(s => s.status === currentStatus)) / (steps.length - 1)) * 100}%` 
          }}
        ></div>

        {steps.map((step, idx) => {
          const statusInfo = getStepStatus(step.status);
          const isCurrent = step.status === currentStatus;
          const isCompleted = statusInfo.completed;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex flex-col items-center w-24 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-300
                  ${isCompleted 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                    : 'bg-surface-100 text-surface-400 border-2 border-surface-200'}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className={`text-xs font-bold text-center ${isCompleted ? 'text-surface-900' : 'text-surface-400'}`}>
                {step.label}
              </p>
              {statusInfo.timestamp && (
                <p className="text-[10px] text-surface-500 text-center mt-1">
                  {formatDate(statusInfo.timestamp)}
                </p>
              )}
              {isCurrent && statusInfo.message && (
                <div className="absolute top-full mt-2 w-max max-w-[150px] text-center bg-surface-800 text-white text-xs p-2 rounded-lg z-10 animate-fade-in shadow-xl">
                  {statusInfo.message}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-surface-800"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
