import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-white shadow-md border border-slate-200',
    elevated: 'bg-white shadow-xl border border-slate-100',
    outlined: 'bg-white shadow-sm border-2 border-slate-300',
  };

  return (
    <div
      className={`
        rounded-xl p-6
        w-full max-w-full
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{ boxSizing: 'border-box', maxWidth: '100%' }}
    >
      {children}
    </div>
  );
};

export default Card;