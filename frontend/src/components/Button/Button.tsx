import React from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, type = 'button', className }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-primary text-black rounded ${className} hover:bg-secondary hover:text-white transition-colors`}
    >
      {label}
    </button>
  );
};

export default Button;
