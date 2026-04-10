import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className = "", ...props }: InputProps) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
    )}
    <input
      className={`w-full px-4 py-2.5 bg-slate-800 border border-maple-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-maple-orange/50 focus:border-maple-orange transition-all ${className}`}
      {...props}
    />
  </div>
);
