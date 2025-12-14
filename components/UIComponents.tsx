import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className, ...props }) => {
  // Increased padding and font size for better touch targets and readability
  const baseStyle = "flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-xl font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md touch-manipulation";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-800 dark:text-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props}>
      {icon && <span className="text-3xl shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};

export const IconButton: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button 
            className={`p-5 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 shadow-sm transition-transform active:scale-90 touch-manipulation ${className || ''}`} 
            {...props}
        >
            {children}
        </button>
    )
}

export const Header: React.FC<{ title: string; onBack?: () => void }> = ({ title, onBack }) => (
  <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shrink-0 h-16">
    {onBack && (
      <IconButton onClick={onBack} className="mr-3 !p-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </IconButton>
    )}
    <h1 className="text-2xl font-bold truncate flex-1 text-gray-900 dark:text-white">{title}</h1>
  </header>
);