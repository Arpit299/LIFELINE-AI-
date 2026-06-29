import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-white/60">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] text-white placeholder-white/30 text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none transition-all duration-200 ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-white/60">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={`w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] text-white placeholder-white/30 text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none transition-all duration-200 resize-none ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-white/60">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-slate-900 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none transition-all duration-200 cursor-pointer ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-950 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};
