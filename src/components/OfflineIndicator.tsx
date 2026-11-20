import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-950/90 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-lg backdrop-blur-md md:bottom-4"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
      <span>Offline Mode · Running cached simulator</span>
    </div>
  );
};
