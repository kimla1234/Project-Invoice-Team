import React from 'react';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  text: string;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

function Button({
  type = 'button',
  text,
  isLoading = false,
  onClick,
  className = '',
  icon,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`py-3 px-3 rounded-xl font-medium flex items-center justify-center gap-2 ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="loader animate-spin border-2 border-gray-300 border-t-transparent rounded-full w-4 h-4"></span>
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {text}
        </>
      )}
    </button>
  );
}

export default Button;

