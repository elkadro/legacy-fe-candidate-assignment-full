import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  fullScreen = false, 
  size = 'md',
  text 
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className={`${sizes[size]} text-primary-600 animate-spin`} />
      {text && (
        <p className="text-slate-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{content}</div>;
};

export default Loading;