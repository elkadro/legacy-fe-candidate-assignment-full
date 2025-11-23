import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-105 active:scale-95 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50',
    secondary: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/40',
    outline: 'border-2 border-purple-500 hover:border-purple-600 text-purple-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 bg-white shadow-sm hover:shadow-md hover:shadow-purple-500/30',
    ghost: 'text-purple-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 shadow-sm hover:shadow-md hover:shadow-purple-500/30',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg hover:shadow-red-500/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs sm:text-sm rounded-lg',
    md: 'px-6 py-3 text-sm sm:text-base rounded-xl',
    lg: 'px-8 py-4 text-base sm:text-lg rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;