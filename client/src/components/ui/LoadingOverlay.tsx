import React from 'react';
import { Loader2 } from 'lucide-react';
import Card from './Card';

interface LoadingOverlayProps {
  message?: string;
  show?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Signing you up...',
  show = true 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />
      
      {/* Loading Card */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <Card variant="elevated" className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 shadow-2xl">
          <div className="flex flex-col items-center justify-center py-8 px-6 space-y-6">
            {/* Animated Loader */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 animate-ping opacity-20" />
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800">{message}</h3>
              <p className="text-sm text-slate-600">
                Please wait while we set up your account
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoadingOverlay;

