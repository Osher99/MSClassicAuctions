import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = ({ label, className = "", ...props }: TextareaProps) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
    )}
    <textarea
      className={`w-full px-4 py-2.5 bg-slate-800 border border-maple-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-maple-orange/50 focus:border-maple-orange transition-all resize-none ${className}`}
      {...props}
    />
  </div>
);
