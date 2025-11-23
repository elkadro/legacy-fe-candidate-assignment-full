import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 
            ${Icon ? 'pl-11' : ''}
            border-2 border-slate-300 rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20
            disabled:bg-slate-50 disabled:cursor-not-allowed
            placeholder:text-slate-400
            transition-all duration-300
            hover:border-purple-400
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;