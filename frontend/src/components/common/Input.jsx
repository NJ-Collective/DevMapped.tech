/**
 * Reusable Input Component
 * Provides consistent input styling across the application
 */

import { clsx } from 'clsx';

const Input = ({ 
  label,
  error,
  helperText,
  className = '',
  ...props 
}) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
    error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-secondary-300',
    className
  );
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
