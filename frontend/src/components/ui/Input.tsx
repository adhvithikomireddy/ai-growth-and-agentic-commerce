import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[#475548] dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 rounded-lg border ${
          error ? "border-red-500 focus:ring-red-400" : "border-[#E2E8F0] dark:border-slate-700 focus:ring-[#166534] dark:focus:ring-emerald-500"
        } text-[#172018] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#667067] dark:text-slate-400">{helperText}</p>}
    </div>
  );
};
