import type { SelectHTMLAttributes, ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = ({
  label,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
    )}
    <select
      className={`w-full px-4 py-2.5 bg-slate-800 border border-maple-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-maple-orange/50 focus:border-maple-orange transition-all ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(({ value, label: optLabel }) => (
        <option key={value} value={value}>
          {optLabel}
        </option>
      ))}
    </select>
  </div>
);
